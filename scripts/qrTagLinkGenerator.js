const fs = require('fs')

const SECRET_SIZE_IN_BYTES = 24

function generateTags() {
    const STARTING_TAG_ID_INCLUSIVE = 1;
    const COUNT_OF_TAGS_TO_GENERATE = 400;

    function generateAreaId(tagId) {
        return tagId % 8 + 1;
    }

    function generateSecret() {
        var secret = require('crypto').randomBytes(SECRET_SIZE_IN_BYTES);
        return secret.toString('base64');
    }

    const generatedTags = [];

    for (let tagId = STARTING_TAG_ID_INCLUSIVE; tagId < STARTING_TAG_ID_INCLUSIVE + COUNT_OF_TAGS_TO_GENERATE; tagId++) {
        generatedTags.push({
            id: tagId,
            areaId: generateAreaId(tagId),
            secret: generateSecret(),
        })
    }

    return generatedTags;
}

function generateInsertStatements(tags) {
    return tags.map(tag => `INSERT INTO qr_tag SET id=${tag.id}, area_id=${tag.areaId}, secret='${tag.secret}';`);
}

function generateLinks(tags) {
    const BASE_PATH = 'https://schq.party/qrFight/submitTag';
    return tags.map(tag => `${BASE_PATH}?tagId=${tag.id}&secret=${encodeURIComponent(tag.secret)} \t[Area: ${tag.areaId}]`);
}

function writeStringArrayToFile(fileName, arrayToWrite){
    fs.writeFile(fileName, arrayToWrite.join('\n'), err => {
        if (err) {
            console.error(err)
            return
        }
    })
}

const tags = generateTags();
const insertStatements = generateInsertStatements(tags);
const links = generateLinks(tags);

// console.log(tags);
// console.log(insertStatements);
// console.log(links);

writeStringArrayToFile('qrInsertStatements.sql',insertStatements);
writeStringArrayToFile('qrLinks.txt',links);
