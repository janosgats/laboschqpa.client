export function isDateTextInputValid(inputDate: string): boolean {
    try {
        const regexMatches = /^\d{4}[-][0|1]\d[-][0-3]\d[ ][0-2]\d[:][0-5]\d?[:]?[0-5]?(\d\.)?\d+$/.test(
            inputDate
        );

        if (regexMatches) {
            /*If the day is between 1-31 TS/JS will parse the string as date.
                  Those months that have less than 31 days overflow to the next month when parsed to date.
                  For example.: new Date("2021-02-31") will be "2021-03-03".
                  That's why we check if the new date object's month and the input string's month are the same.*/
            const noMonthOverflow =
                new Date(inputDate).getMonth() ===
                Number.parseInt(inputDate.split("-")[1]) - 1;

            if (noMonthOverflow) {
                return true;
            }
        }
    } catch (e) {
    }

    return false; //Returning that the date is invalid by default
}


export function getSurelyDate(wannabeDate: Date | string): Date {
    if (typeof wannabeDate === "string") {
        return new Date(wannabeDate);
    }
    return wannabeDate;
}