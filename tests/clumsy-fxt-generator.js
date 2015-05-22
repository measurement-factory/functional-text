/*eslint-env node*/
import seedrandom from "seedrandom";
import crypto from "crypto";
import prettyHrTime from "pretty-hrtime";
import fs from "fs";
import {assert} from "chai";

import InputStream from "../../lib/InputStream";
import Interpreter from "../../lib/Interpreter";

let seed = 1;
let rng = seedrandom(seed);
function seededRandom(min, max) {
    return Math.round(min + rng() * (max - min));
}

function ord(character) {
    return character.charCodeAt(0);
}

function randomChar(...pairs) {
    let groupIdx = seededRandom(1, pairs.length / 2);
    let from = pairs[groupIdx - 1];
    let to = pairs[groupIdx];

    return seededRandom(ord(from), ord(to));
}

function generateDelimeters(min = 1, max = 3) {
    let word = "";
    let wordLength = seededRandom(min, max);

    while (word.length < wordLength) {
        let char = seededRandom(0, 1) ? " " : randomChar(" ", "@", "[", "`", "{", "~");
        if (char === "." && word.length === wordLength - 1) continue;
        word += char;
    }

    return word;
}

function generateWord() {
    let word = "";
    let wordLength = seededRandom(1, 5);

    while (word.length < wordLength) {
        let charCode = seededRandom(ord("a"), ord("z"));
        let char = String.fromCharCode(charCode);
        word += char;
    }

    return word;
}

function generateFunctionName() {
    return generateWord();
}

let opened = [];
let EofBoundaryTotal = seededRandom(1, 5);

const Boundaries = [".", ": ", ":: ", "{", "[", "<", " ", " ", " ", " ", " ", " "];
function generateFunctionBoundary() {
    let randomIdx = seededRandom(0, Boundaries.length - 1);
    let randomDelimeter = Boundaries[randomIdx];
    if (EofBoundaryTotal > 0) {
        randomDelimeter = "::: ";
        EofBoundaryTotal--;
    }

    opened.push(randomDelimeter);
    assert(opened.length <= 50);
    return randomDelimeter;
}

function generateFunctionArgs() {
    if (seededRandom(0, 9) === 0) return ""; // 10% of functions have arguments

    let argAmount = seededRandom(0, 5);
    let str = "";

    str += "(";
    for (let i = 0; i < argAmount; i++) {
        if (seededRandom(0, 2)) str += generateDelimeters(1, 3).replace(/ /g, "");
        str += generateWord();
        if (seededRandom(0, 2)) str += generateDelimeters(1, 3).replace(/ /g, "");
        str += ",";

        // str += `${generateWordExpanded()}`;
        // if (seededRandom(0, 10) > 3) str += generateWordExpanded();

        // str += "," + " ".repeat(seededRandom(0, 10));
    }

    return str + ")";
}

const Borders = {
    '{': '}',
    '[': ']',
    '<': '>'
};

function generateFunctionCloseDelimeter() {
    let open = opened.pop();
    let close = Borders[open] ? Borders[open] : "";
    return close;
}

function generateLine() {
    let line = "";
    let length = seededRandom(1, 70);
    while (line.length <= length) {
        const CurrentRun = seededRandom(1, 3);

        let str = "";

        if (CurrentRun === 1 && opened.length < 50) { // function call
            str += ".";
            str += generateFunctionName();
            str += generateFunctionArgs();
            str += generateFunctionBoundary();
        }
        else if (CurrentRun === 2) { // word
            str += seededRandom(0, 2) ? generateDelimeters(1, 3) : "";
            str += generateWord();
            str += seededRandom(0, 5) ? generateDelimeters(1, 3) : "";
        }
        else if (CurrentRun === 3 && opened.length > 0) {
            // str += generateFunctionCloseDelimeter();
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

    return paragraph + "\n".repeat(seededRandom(1, 3));
}

let times = 1;
const origTimes = times;
while (times > 0 /*Math.pow(10, 5) || true*/) {
    let startTime = process.hrtime();
    let generatedStr = "";
    while (generatedStr.length <= Math.pow(10, 3)) {
        generatedStr += generateParagraph();
    }

    while (opened.length > 0) {
        generatedStr += generateFunctionCloseDelimeter();
    }

    let generationDuration = process.hrtime(startTime);

    let input = generatedStr;
    fs.writeFileSync("/tmp/in.txt", input);
    let inputStream = new InputStream(input);
    let interpreter = new Interpreter(inputStream);

    let result, startTime2, processingDuration;
    try {
        startTime2 = process.hrtime();
        result = interpreter.interpret();
        processingDuration = process.hrtime(startTime2);
        fs.writeFileSync("/tmp/out.txt", result);
    } catch (e) {
        let regexResult = /at \d+:\d+ \((\d+)\)/.exec(e.message);

        if (regexResult) {
            let brokenPoint = parseInt(regexResult[1], 10);
            console.log("Broke with '", e.message, "' :"); // Incorrectly reports location with ^ due to newlines being two chars
            console.log(">>>", input.slice(brokenPoint - 10, brokenPoint + 10).replace(/\n/g, "\\n"), "<<<");
            console.log(" ".repeat(13), "^");
        } else {
            throw e;
        }

        break;
    }

    times--;

    console.log("suceeded", origTimes - times, "\n",
        "\tinput length:", input.length, "\n",
        "\toutput length:", result.length, "\n",
        "\tgeneration duration:", prettyHrTime(generationDuration), "\n",
        "\tprocessing duration:", prettyHrTime(processingDuration), "\n",
        "\ttotal duration:", prettyHrTime(process.hrtime(startTime)), "\n",
        "\tinput hash:", crypto.createHash("sha1").update(input).digest("hex"), "\n",
        "\tresult hash:", crypto.createHash("sha1").update(result).digest("hex"), "\n"
    );
}
