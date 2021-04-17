import {getSurelyDate} from "~/utils/DateHelpers";

const basicFormatterOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'medium',
};
const basicFormatter = new Intl.DateTimeFormat("hu-HU", basicFormatterOptions);

function toBasic(date: Date | string): string {
    date = getSurelyDate(date);
    return basicFormatter.format(date);
}


const DateTimeFormatter = {
    toBasic
};
export default DateTimeFormatter;