import {getSurelyDate} from "~/utils/DateHelpers";

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


const dayMinutesFormatterOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
};
const dayMinutesFormatter = new Intl.DateTimeFormat(
    "hu-HU",
    dayMinutesFormatterOptions
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
    if (!date) {
        return "-";
    }
    date = getSurelyDate(date);
    if (!date) {
        return "-";
    }
    return fullBasicFormatter.format(date);
}

function toFullShort(date: Date | string): string {
    if (!date) {
        return "-";
    }
    date = getSurelyDate(date);
    if (!date) {
        return "-";
    }
    return "'" + fullShortFormatter.format(date);
}

function toDay(date: Date | string): string {
    if (!date) {
        return "-";
    }
    date = getSurelyDate(date);
    if (!date) {
        return "-";
    }
    return dayFormatter.format(date);
}

function toDayMinutes(date: Date | string): string {
    if (!date) {
        return "-";
    }
    date = getSurelyDate(date);
    if (!date) {
        return "-";
    }
    return dayMinutesFormatter.format(date);
}

const DateTimeFormatter = {
    toFullBasic,
    toFullShort,
    toDay,
    toDayMinutes,
};
export default DateTimeFormatter;
