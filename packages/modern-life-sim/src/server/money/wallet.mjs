// Wallet: cash, ledger, bills, collections, rent and mortgage charging
import { clockFromMinutes } from "../time/clock.mjs";
import { HOME_KINDS } from "../home/home-kinds.mjs";

var LEGACY_HOME_KIND_ALIASES = {
  studio: "apartment",
  shared: "apartment",
};
var normalizeHomeKind = (kind) => (kind in HOME_KINDS ? kind : (LEGACY_HOME_KIND_ALIASES[kind] ?? "apartment"));
var homeKindOf = (kind) => HOME_KINDS[normalizeHomeKind(kind)];
var STARTING_SAVINGS = {
  tight: 400,
  normal: 1200,
  comfortable: 3e3,
};
var LATE_PAYMENT_FEE = 0.1;
var HOSPITAL_BILL_DUE_DAYS = 30;
var HOSPITAL_OVERDUE_FEE = 0.2;
var COLLECTIONS_WAGE_SHARE = 0.25;
function createWallet({ cash = STARTING_SAVINGS.normal, home = "apartment", rentDay = 27 } = {}) {
  return {
    cash: cash,
    home: normalizeHomeKind(home),
    rentDay: rentDay,
    ledger: [],
    rentPaidThrough: null,
    missedRent: 0,
    bills: [],
    flatmate: null,
    owns: null,
    mortgage: null,
  };
}
var recordLedgerEntry = (wallet, at, amount, label) => {
  wallet.ledger.push({
    at: at,
    amount: amount,
    label: label,
    balance: wallet.cash,
  });
  if (wallet.ledger.length > 200) {
    wallet.ledger.shift();
  }
};
function earnMoney(wallet, amount, label, at = 0, { wage = false } = {}) {
  let earned = Math.max(0, amount);
  if (((wallet.cash += earned), recordLedgerEntry(wallet, at, earned, label), wage)) {
    for (let bill of openBills(wallet).filter((candidate) => candidate.collections)) {
      let garnished = Math.min(bill.amount, Math.round(earned * COLLECTIONS_WAGE_SHARE), wallet.cash);
      if (!(garnished <= 0)) {
        wallet.cash -= garnished;
        bill.amount -= garnished;
        recordLedgerEntry(wallet, at, -garnished, `Collections \xB7 ${bill.label}`);
      }
    }
    wallet.bills = (wallet.bills ?? []).filter((bill) => bill.amount > 0);
  }
  return wallet.cash;
}
function spendMoney(wallet, amount, label, at = 0) {
  let cost = Math.max(0, amount);
  return wallet.cash < cost
    ? {
        ok: false,
        reason: `You cannot afford that: $${cost} and you have $${wallet.cash}.`,
        cash: wallet.cash,
      }
    : ((wallet.cash -= cost),
      recordLedgerEntry(wallet, at, -cost, label),
      {
        ok: true,
        reason: "",
        cash: wallet.cash,
      });
}
var canAfford = (wallet, amount) => wallet.cash >= Math.max(0, amount);
function addBill(wallet, { kind: kind, amount: amount, label: label, at = 0, due = null }) {
  wallet.bills ??= [];
  let bill = {
    id: `${kind}-${at}-${wallet.bills.length}`,
    kind: kind,
    amount: Math.round(Math.max(0, amount)),
    label: label,
    at: at,
    due: due,
    overdue: false,
    collections: false,
  };
  wallet.bills.push(bill);
  recordLedgerEntry(wallet, at, 0, `${label}: $${bill.amount} owed`);
  return bill;
}
var openBills = (wallet, kind = null) =>
  (wallet.bills ?? []).filter((bill) => bill.amount > 0 && (!kind || bill.kind === kind));
var totalOwed = (wallet, kind = null) => openBills(wallet, kind).reduce((sum, bill) => sum + bill.amount, 0);
function payBill(wallet, billId, amount, at = 0) {
  let bill = openBills(wallet).find((candidate) => candidate.id === billId);
  if (!bill) {
    return {
      ok: false,
      reason: "There is nothing owed there.",
    };
  }
  let paid = Math.min(bill.amount, Math.floor(Number(amount) || 0));
  if (paid <= 0) {
    return {
      ok: false,
      reason: "How much?",
    };
  }
  let payment = spendMoney(wallet, paid, `Paid \xB7 ${bill.label}`, at);
  if (!payment.ok) {
    return payment;
  }
  bill.amount -= paid;
  wallet.bills = wallet.bills.filter((remaining) => remaining.amount > 0);
  let paidOff = bill.kind === "mortgage" && bill.amount === 0 && payMortgageInstallment(wallet);
  return {
    ok: true,
    paid: paid,
    left: bill.amount,
    bill: bill,
    ...(paidOff
      ? {
          paidOff: true,
        }
      : {}),
  };
}
function escalateOverdueHospitalBills(wallet, day) {
  let escalated = [];
  for (let bill of openBills(wallet, "hospital")) {
    if (!(bill.overdue || bill.due === null || day < bill.due)) {
      bill.overdue = true;
      bill.collections = true;
      bill.amount = Math.round(bill.amount * (1 + HOSPITAL_OVERDUE_FEE));
      escalated.push(bill);
    }
  }
  return escalated;
}
function housingCostOf(wallet) {
  let kind = homeKindOf(wallet.home);
  return wallet.mortgage && wallet.mortgage.kind === normalizeHomeKind(wallet.home)
    ? {
        kind: "mortgage",
        label: "Mortgage",
        amount: Math.min(wallet.mortgage.payment, wallet.mortgage.left) + kind.upkeep,
      }
    : wallet.owns === normalizeHomeKind(wallet.home)
      ? {
          kind: "upkeep",
          label: "Home costs",
          amount: kind.upkeep,
        }
      : {
          kind: "rent",
          label: "Rent",
          amount: kind.rent,
        };
}
function housingShareDue(wallet, { sharedWith = 0 } = {}) {
  let cost = housingCostOf(wallet),
    people = 1 + Math.max(0, sharedWith);
  if (cost.kind === "mortgage") {
    let upkeep = homeKindOf(wallet.home).upkeep;
    return cost.amount - upkeep + Math.round(upkeep / people);
  }
  return Math.round(cost.amount / people);
}
var rentSeasonKey = (minutes) => `s${clockFromMinutes(minutes).seasonKey}`;
var rentIsDue = (wallet, minutes) =>
  clockFromMinutes(minutes).day >= wallet.rentDay && wallet.rentPaidThrough !== rentSeasonKey(minutes);
function chargeRent(wallet, minutes, { sharedWith = 0 } = {}) {
  if (!rentIsDue(wallet, minutes)) {
    return null;
  }
  let cost = housingCostOf(wallet),
    share = housingShareDue(wallet, {
      sharedWith: sharedWith,
    });
  if (((wallet.rentPaidThrough = rentSeasonKey(minutes)), wallet.cash >= share)) {
    spendMoney(wallet, share, cost.label, minutes);
    let paidOff = cost.kind === "mortgage" && payMortgageInstallment(wallet);
    return {
      paid: true,
      amount: share,
      kind: cost.kind,
      ...(paidOff
        ? {
            paidOff: true,
          }
        : {}),
    };
  }
  if (cost.kind === "rent") {
    wallet.missedRent += 1;
  }
  let bill = addBill(wallet, {
    kind: cost.kind,
    amount: share * (1 + LATE_PAYMENT_FEE),
    label: `${cost.label}, ${clockFromMinutes(minutes).season}`,
    at: minutes,
  });
  return {
    paid: false,
    amount: share,
    kind: cost.kind,
    owed: bill.amount,
    fee: bill.amount - share,
  };
}
function payMortgageInstallment(wallet) {
  let mortgage = wallet.mortgage;
  return !mortgage ||
    ((mortgage.left = Math.max(0, mortgage.left - mortgage.payment)),
    (mortgage.paid = (mortgage.paid ?? 0) + 1),
    mortgage.left > 0)
    ? false
    : ((wallet.owns = mortgage.kind), (wallet.mortgage = null), true);
}
function daysUntilRent(wallet, minutes) {
  let clock = clockFromMinutes(minutes);
  return clock.seasonKey * 30 + (wallet.rentDay - 1) + (clock.day < wallet.rentDay ? 0 : 30) - clock.dayIndex;
}

export {
  COLLECTIONS_WAGE_SHARE,
  HOSPITAL_BILL_DUE_DAYS,
  HOSPITAL_OVERDUE_FEE,
  LATE_PAYMENT_FEE,
  STARTING_SAVINGS,
  addBill,
  canAfford,
  chargeRent,
  createWallet,
  daysUntilRent,
  earnMoney,
  escalateOverdueHospitalBills,
  homeKindOf,
  housingCostOf,
  housingShareDue,
  normalizeHomeKind,
  openBills,
  payBill,
  payMortgageInstallment,
  rentIsDue,
  rentSeasonKey,
  spendMoney,
  totalOwed,
};
