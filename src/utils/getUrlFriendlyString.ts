import {isValidNonEmptyString} from "~/utils/CommonValidators";

const stringReplacementMap = new Map<string, string>();
stringReplacementMap.set(' ','_');
stringReplacementMap.set('á','a');
stringReplacementMap.set('é','e');
stringReplacementMap.set('í','i');
stringReplacementMap.set('ó','o');
stringReplacementMap.set('ö','o');
stringReplacementMap.set('ő','o');
stringReplacementMap.set('ú','u');
stringReplacementMap.set('ü','u');
stringReplacementMap.set('ű','u');
stringReplacementMap.set('Ł','L');
stringReplacementMap.set('$','s');
stringReplacementMap.set('@','a');
stringReplacementMap.set('#','sharp');
stringReplacementMap.set('~','wave');
stringReplacementMap.set('+','plus');

export default function getUrlFriendlyString(urlPart: string): string {
    if (!isValidNonEmptyString(urlPart)) {
        return '';
    }
    let processedUrlPart = urlPart;

    stringReplacementMap.forEach((replaceTo, replaceFrom) => {
        processedUrlPart = processedUrlPart.replaceAll(replaceFrom.toLowerCase(), replaceTo.toLowerCase())
        processedUrlPart = processedUrlPart.replaceAll(replaceFrom.toUpperCase(), replaceTo.toUpperCase())
    });

    return processedUrlPart.replaceAll(/[^a-zA-Z0-9_-]/g, '');
}