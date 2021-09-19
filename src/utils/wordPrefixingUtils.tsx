import {isValidNonEmptyString} from "~/utils/CommonValidators";

const vowels = ['a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'ö', 'ő', 'u', 'ú', 'ü', 'ű'];

export function getHungarianArticle(word: string, uppercaseA: boolean = false) {
    if (!isValidNonEmptyString(word)) {
        return "";
    }
    const lowercaseFirstLetter = word.substring(0, 1).toLowerCase();

    let endOfArticle = "";
    if (vowels.includes(lowercaseFirstLetter)) {
        endOfArticle = "z"
    }

    if (uppercaseA) {
        return "A" + endOfArticle;
    }
    return "a" + endOfArticle;
}

export function prefixWordWithArticle(word: string, uppercaseA: boolean = false) {
    if (!isValidNonEmptyString(word)) {
        return "";
    }

    return getHungarianArticle(word, uppercaseA) + " " + word;
}