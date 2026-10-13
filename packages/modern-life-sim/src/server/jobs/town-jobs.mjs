// Town job listing, shift formatting, holders and job prompt line
import { JOBS_BY_PLACE } from "./job-catalog.mjs";

var JOB_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function formatShift(job) {
  let days = job.days;
  return `${days.length > 1 && days.every((day, index) => index === 0 || day === (days[index - 1] + 1) % 7) ? `${JOB_WEEKDAY_LABELS[days[0]]}\u2013${JOB_WEEKDAY_LABELS[days.at(-1)]}` : days.map((day) => JOB_WEEKDAY_LABELS[day]).join(", ")} ${job.from}\u2013${job.to}`;
}
function townJobs(town) {
  return (town?.places ?? []).flatMap((place) =>
    (JOBS_BY_PLACE[place.id] ?? []).map((job) => ({
      ...job,
      place: place.id,
      placeName: place.name,
      shift: formatShift(job),
    })),
  );
}
var townJobById = (town, id) => townJobs(town).find((job) => job.id === id) ?? null;
var jobPromptLine = (title) =>
  title
    ? `Their job: ${title}. That is their job now, whether or not they are at work right now; if their description says otherwise, this is how it is now.`
    : "";
// A non-boss job can be shared by any number of people; a place has only one boss.
var jobHolders = (characters = []) => {
  let holders = {};
  for (let character of characters) {
    if (character.job?.id && !character.away) {
      (holders[character.job.id] ??= []).push(character.id);
    }
  }
  return holders;
};
function openTownJobs(town, characters = [], { except = null, taken = [] } = {}) {
  let holders = jobHolders(characters);
  return townJobs(town).filter(
    (job) => !job.boss || ((holders[job.id] ?? []).every((holderId) => holderId === except) && !taken.includes(job.id)),
  );
}
function placeForJobId(jobId, places = []) {
  let placeId = Object.entries(JOBS_BY_PLACE).find(([, jobs]) =>
    jobs.some((job) => job.id === String(jobId ?? "").trim()),
  )?.[0];
  return placeId ? (places.find((place) => place.place === placeId) ?? null) : null;
}

export {
  JOB_WEEKDAY_LABELS,
  formatShift,
  jobHolders,
  jobPromptLine,
  openTownJobs,
  placeForJobId,
  townJobById,
  townJobs,
};
