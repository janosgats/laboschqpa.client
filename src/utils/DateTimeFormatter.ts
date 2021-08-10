import { getSurelyDate } from "~/utils/DateHelpers";

const fullBasicFormatterOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "medium",
};
const fullBasicFormatter = new Intl.DateTimeFormat(
  "hu-HU",
  fullBasicFormatterOptions
);

const dayFormatterOptions: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "2-digit",
};
const dayFormatter = new Intl.DateTimeFormat(
  "hu-HU",
  dayFormatterOptions
);

const fullShortFormatterOptions: Intl.DateTimeFormatOptions = {
  year: "2-digit",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
const fullShortFormatter = new Intl.DateTimeFormat(
  "hu-HU",
  fullShortFormatterOptions
);

function toFullBasic(date: Date | string): string {
  date = getSurelyDate(date);
  return fullBasicFormatter.format(date);
}

function toFullShort(date: Date | string): string {
  date = getSurelyDate(date);
  return "'" + fullShortFormatter.format(date);
}

function toDay(date: Date | string): string {
  date = getSurelyDate(date);
  return dayFormatter.format(date);
}

const DateTimeFormatter = {
  toFullBasic,
  toFullShort,
  toDay,
};
export default DateTimeFormatter;
