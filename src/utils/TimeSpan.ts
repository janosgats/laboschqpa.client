const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

type MixedDate = Date | number | string;

const convertDate = function (date: MixedDate): number {
    if (typeof date === 'string') return +new Date(date);
    return +date;
};

function timeOf(date: MixedDate): number {
    return convertDate(date) % day;
}

function dateOf(date: MixedDate): number {
    date = convertDate(date);
    return +date - +timeOf(date);
}

function range(start: MixedDate, count: number, interval: MixedDate): number[] {
    start = convertDate(start);
    interval = convertDate(interval);
    return new Array(count).fill(0).map((_, i) => +start + i * +interval);
}

function asDate(value: number): Date;
function asDate(value: number[]): Date[];
function asDate(value: number[] | number): Date[] | Date {
    if (Array.isArray(value)) return value.map((x) => asDate(x) as Date);
    return new Date(value);
}

const TimeSpan = {
    second,
    minute,
    hour,
    day,
    timeOf,
    dateOf,
    range,
    asDate,
};

export default TimeSpan;
