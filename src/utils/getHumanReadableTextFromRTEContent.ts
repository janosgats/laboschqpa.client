import {isValidNonEmptyString} from "~/utils/CommonValidators";

export function getHumanReadableTextFromRTEContent(rteContent: string | null): string {
    if (!isValidNonEmptyString(rteContent)) {
        return '';
    }

    let humanReadableTextArray: string[] = [];
    try {
        const parsed = JSON.parse(rteContent);
        if (!parsed) {
            return '';
        }

        if (Array.isArray(parsed.blocks)) {
            parsed.blocks.forEach(block => {
                if (isValidNonEmptyString(block?.text)) {
                    humanReadableTextArray.push(block.text);
                }
            })
        }

        if (parsed.entityMap !== null && typeof parsed.entityMap === 'object') {
            const mapKeys: string[] = Object.keys(parsed.entityMap);
            mapKeys.forEach(mapKey => {
                const entity = parsed.entityMap[mapKey];
                humanReadableTextArray.push(...getHumanReadableTextArrayFromEntity(entity));
            });
        }
    } catch (e) {
        console.error(`Error while getting humanReadableText from RTEContent: ${rteContent}`, e);
    }

    return humanReadableTextArray.join(' ');
}

function getHumanReadableTextArrayFromEntity(entity: any | null): string[] {
    try {
        if (entity === null && typeof entity !== 'object') {
            return [];
        }
        if (entity.type !== 'LINK') {
            return [];
        }
        const url = entity.data?.url;
        if (isValidNonEmptyString(url)) {
            return [url];
        }
    } catch (e) {
        console.error(`Error while getting humanReadableText from RTEContent entity`, entity, e);
    }
    return [];
}