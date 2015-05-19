/*eslint-env node*/
import assert from "assert";
import seededRandom from "./seeded-random";
import chance from "./chance";

let result = "";

function ord(character) {
    return character.charCodeAt(0);
}

function randomChar(...pairs) {
    let groupIdx = seededRandom(1, pairs.length / 2);
    let from = pairs[groupIdx - 1];
    let to = pairs[groupIdx];

    return String.fromCharCode(seededRandom(ord(from), ord(to)));
}

function generateDelimeters(min = 1, max = 3) {
    let word = "";
    let wordLength = seededRandom(min, max);

    while (word.length < wordLength) {
        let char = chance(" ", randomChar(" ", "@", "[", "`", "{", "~"));
        if (char === "." && word.length === wordLength - 1) continue;
        word += char;
    }

    return word;
}

function generateWord() {
    let word = "";
    let wordLength = seededRandom(1, 5);

    while (word.length < wordLength) {
        word += randomChar("a", "z");
    }

    return word;
}

function generateFunctionName() {
    return generateWord();
}

let opened = [];
let EofBoundaryTotal = seededRandom(1, 5);

function generateBoundary(includeEOF = false) {
    const Boundaries = [".", ": ", ":: ", "{", "[", "<", [" ", 20]];
    let randomBoundary = chance(...Boundaries);
    if (includeEOF && EofBoundaryTotal > 0 && opened.filter(open => open === "::: ").length === opened.length) {
        randomBoundary = "::: ";
        EofBoundaryTotal--;
    }

    opened.push(randomBoundary);
    assert(opened.length <= 50);
    return randomBoundary;
}

function generateFunctionArgs() {
    if (seededRandom(0, 9) === 0) return ""; // 10% of functions have arguments

    let argAmount = seededRandom(0, 5);
    let str = "";

    str += "(";
    for (let i = 0; i < argAmount; i++) {
        const chanceToGenerateBoundary = [[true, 75], false];
        const withBoundary = chance(...chanceToGenerateBoundary);
        let boundary;

        if (withBoundary) {
            boundary = generateBoundary();
            assert(boundary !== "::: ");
            str += boundary;
        }

        if (!boundary || boundary !== ".") {
            let word = generateWord();
            assert(!word.includes(","));
            str += word;
        }

        if (withBoundary) str += generateCloseBoundary();
        str += ",";
    }

    return str + ")";
}

const Borders = {
    '{': '}',
    '[': ']',
    '<': '>',
    ': ': '\n',
    ':: ': '\n\n',
    '"': '"',
    "'": "'",
    ".": "",
    " ": " " // TODO: space can close with other things too
};

// TODO: should not generate too many new lines
function generateCloseBoundary(eofOkay = false) {
    if (opened.length === 0) throw new Error("no opened boundaries");
    let open = opened.pop();
    if (open === "::: " && eofOkay) return "";

    let close = Borders[open];
    if (close === undefined) throw new Error(`don't know how to close open boundary: '${open}' out of ${JSON.stringify(opened)}`);

    return close;
}

function openedToEof() {
    return opened.length && opened[opened.length - 1] === "::: ";
}

function generateLine() {
    let line = "";
    let length = seededRandom(1, 70);
    while (line.length <= length) {
        const FunctionCall = "FunctionCall";
        const FunctionClose = "FunctionClose";
        const Word = "Word";
        const CurrentRun = chance(FunctionCall, FunctionClose, [Word, 75]);

        let str = "";

        if (CurrentRun === FunctionCall) {
            str += ".";
            str += generateFunctionName();
            str += generateFunctionArgs();
            str += generateBoundary(true);
        }
        else if (CurrentRun === FunctionClose && !openedToEof() && opened.length) {
            str += generateCloseBoundary();
        }
        else/* if (CurrentRun === Word)*/ {
            str += seededRandom(0, 2) ? generateDelimeters(1, 3) : "";
            str += generateWord();
            str += seededRandom(0, 5) ? generateDelimeters(1, 3) : "";
        }

        line += str;
    }

    return line + "\n";
}

function generateParagraph() {
    let totalTimes = seededRandom(5, 10);
    let paragraph = "";
    for (let times = 0; times < totalTimes; times++) {
        paragraph += generateLine();
    }

    return paragraph + "\n".repeat(seededRandom(1, 2));
}

export default function generate() {
    let startTime = process.hrtime();

    result = "";
    while (result.length <= Math.pow(10, 3)) {
        result += generateParagraph();
    }

    while (opened.length > 0) {
        result += generateCloseBoundary(true);
    }

    console.log("finished generation");

    let generationDuration = process.hrtime(startTime);

    let clonedResult = result;
    result = "";

    return {
        duration: generationDuration,
        text: clonedResult
    };
}