// Default adult module state and settings cleaning
import {
  DEFAULT_INTIMACY_DETAIL,
  DEFAULT_PICTURE_FREQUENCY,
  INTIMACY_DETAIL_LEVELS,
  PICTURE_FREQUENCIES,
} from "./tuning.mjs";

var defaultAdultState = () => ({
  on: true,
  detail: DEFAULT_INTIMACY_DETAIL,
  pictures: DEFAULT_PICTURE_FREQUENCY,
  youAdult: false,
  afterDark: false,
  clubDancers: false,
  clubRegulars: false,
  cast: {},
  bonds: {},
});
function cleanAdultSettings(input) {
  return !input || typeof input != "object" || input.on === false || input.youAdult !== true
    ? null
    : {
        ...defaultAdultState(),
        detail: INTIMACY_DETAIL_LEVELS.includes(input.detail) ? input.detail : DEFAULT_INTIMACY_DETAIL,
        pictures: PICTURE_FREQUENCIES.includes(input.pictures) ? input.pictures : DEFAULT_PICTURE_FREQUENCY,
        youAdult: true,
        afterDark: input.afterDark === true,
        clubDancers: input.clubDancers === true,
        clubRegulars: input.clubRegulars === true && input.afterDark === true,
      };
}

export { cleanAdultSettings, defaultAdultState };
