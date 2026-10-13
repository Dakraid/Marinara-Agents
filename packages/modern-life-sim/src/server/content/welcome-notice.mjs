// Alpha welcome notice shown once per version
var WELCOME_NOTICE = {
  id: "0.2.0",
  lines: [
    "Hi! This is a life sim made from your cards. You move to a new town, get a job, make friends, go on dates, maybe even get married. Everyone you meet is one of your characters, and your model writes every conversation as it happens.",
    "It runs on your own connections: the model you pick writes the scenes, and your image connection draws the pictures. Pictures start on manual, so nothing gets drawn unless you ask.",
  ],
  alpha:
    "Heads up: it's an alpha. Stuff will break, some screens are still rough, and your saves might not work after a future update.",
  dev: [
    "I'm making this in the open. You can already play from your first day in town all the way to your wedding, but there's a lot left to do, and things will keep changing between updates.",
    "Money, jobs and how fast friendships grow aren't balanced yet. If something feels too easy or too slow, it probably is.",
  ],
  report:
    "Found a bug, or have feedback? Tell us on the {official Discord}: Pasta Testers channel, Modern Life Sim thread.",
  reportUrl: "https://discord.gg/N5PHGEkMnJ",
  check: "Got it: it's an alpha, and my saves might not carry over.",
};
var welcomeNoticeUnlessSeen = (seenId) => (seenId === WELCOME_NOTICE.id ? null : WELCOME_NOTICE);

export { WELCOME_NOTICE, welcomeNoticeUnlessSeen };
