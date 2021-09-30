import {FilterOptionsState} from "@material-ui/lab";

const stringReplacementMap = new Map<string, string>();
stringReplacementMap.set('á', 'a');
stringReplacementMap.set('é', 'e');
stringReplacementMap.set('í', 'i');
stringReplacementMap.set('ó', 'o');
stringReplacementMap.set('ö', 'o');
stringReplacementMap.set('ő', 'o');
stringReplacementMap.set('ú', 'u');
stringReplacementMap.set('ü', 'u');
stringReplacementMap.set('ű', 'u');
stringReplacementMap.set('Ł', 'L');
stringReplacementMap.set('$', ' $ ');
stringReplacementMap.set('@', ' @ ');
stringReplacementMap.set('_', ' _ ');
stringReplacementMap.set('-', ' - ');
stringReplacementMap.set('#', ' # ');
stringReplacementMap.set('~', ' ~ ');
stringReplacementMap.set('+', ' + ');
stringReplacementMap.set('.', ' . ');
stringReplacementMap.set('/', ' / ');

export function filterByNormalizedWorldSplit<T>(options: T[], state: FilterOptionsState<T>): T[] {
    const inputValue = normalizeString(state.inputValue);
    const inputWords = inputValue.split(/\s+/)

    return options.filter(option => {
        const optionLabel: string = normalizeString(state.getOptionLabel(option));

        return inputWords.every(word => optionLabel.includes(word));
    })
}

function normalizeString(original: string) {
    let processed = original.toLowerCase();
    stringReplacementMap.forEach((replaceTo, replaceFrom) => {
        processed = processed.replaceAll(replaceFrom, replaceTo.toLowerCase())
        processed = processed.replaceAll(replaceFrom.toLowerCase(), replaceTo.toLowerCase())
    });
    return processed;
}