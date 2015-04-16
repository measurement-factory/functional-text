import "babel-core/polyfill";

import flattenDeep from "lodash.flattendeep";
import assign from "lodash.assign";
import TextItem from "./TextItem";
import ParsedItem from "./ParsedItem";

let funDepth = 0;

function error(msg) {
    throw new Error(msg);
}

function confess(msg) {
    throw new Error(`Internal Error: ${msg}`);
}

function execRegex(str, regex) {
    let match = regex.exec(str);

    if (match === null) {
        return null;
    }

    let matched = match[0];
    let startPos = match.index - 1;
    let endPos = match.index + matched.length;

    return assign(match, {
        matched,

        startPos,
        endPos,

        before: match.input.substr(0, startPos + 1),
        after: match.input.substr(endPos)
    });
}

function ifRegex(str, regex, callback) {
    let result = execRegex(str, regex);

    if (result !== null) {
        return callback(result);
    }
}

function escapeRegexp(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// function indentedLogger(...messages) {
//     let indent = funDepth * 4;
//     console.log(" ".repeat(indent), ...messages);
// }

// function wrapString(str) {
//     return `"${str.replace(/\n/g, "\\n")}"`;
// }

function filterParsed(...parsedItems) {
    return parsedItems.filter(item => {
        return item !== undefined;
    });
}

const Borders = {
    '{': '}',
    '[': ']',
    '<': '>',
    '(': ')'
};

let testRegexMap = new Map();

testRegexMap.set(/^:::/, () => /$/); // end of file

testRegexMap.set(/^::/, () => /(?=\n\s*\n|$)/); // end of paragraph

testRegexMap.set(/^:/, (match, raw) => { // end of line
    if (/^\S/.test(raw)) {
        error(`reserved function delimiter sequence in .${name}:${match}`);
    }
    return /(?=\n|$)/;
});

testRegexMap.set(/^\s+/, () => /(?=\W|$)/m); // end of word

testRegexMap.set(/^\./, () => {  // dot is a reserved delimeter
    error("reserved function delimiter sequence in .${name}");
});

testRegexMap.set(/^\W/, (match) => { // until that delimiter (or its mirror match)
    let closingSymbol = Borders[match] ? Borders[match]: match;
    closingSymbol = escapeRegexp(closingSymbol);
    return new RegExp(closingSymbol);
});

class Parser {
    constructor() {
        this._Functions = {};
    }
    parse(raw) {
        let result = this.parseRecursive(raw, /$/);
        return new ParsedItem({children: result.parsed}).toString();
    }
    addFunction(name, func) {
        if (name === "") error("Please call addFunction with a named function");
        this._Functions[name] = func;
    }
    newResult(parsed, raw) {
        if (!(parsed instanceof Array)) {
            parsed = [parsed];
        }

        // Flatten children, because we don't want nested arrays -- they are bad
        // for .join("") (leave commas)
        parsed = flattenDeep(parsed);
        return {parsed, raw};
    }
    parseRecursive(raw, stopRegex) {
        let functionStartPos;
        let stopPos;
        let name;

        if (raw === undefined || raw === null) {
            error("raw is undefined");
        }

        let stopHead, stopTail;
        let funHead, funTail;

        ifRegex(raw, stopRegex, (matchResult) => {
            stopPos = matchResult.endPos;
            stopHead = matchResult.before;
            stopTail = matchResult.after;
        });

        ifRegex(raw, /\.([a-z_A-Z]\w*)/, (matchResult) => {
            functionStartPos = matchResult.startPos;
            name = matchResult[1];
            funHead = matchResult.before;
            funTail = matchResult.after;
        });

        let doFun = false;

        if (stopPos === undefined) {
            error("unbounded function call");
        }
        else if (functionStartPos === undefined) {
            doFun = false;
        }
        // both previous function end and current function start are present
        else if (stopPos < functionStartPos) { // end regex is before function start
            doFun = false;
        }
        else {
            doFun = true;
        }

        if (doFun === true) {
            let result = this._parseFun(name, funTail);
            let recursiveParseResult = this.parseRecursive(result.raw, stopRegex);

            let parsed = filterParsed(new TextItem(funHead), result.parsed, recursiveParseResult.parsed);

            return this.newResult(parsed, recursiveParseResult.raw);
        }
        else {
            let parsed = filterParsed(new TextItem(stopHead));

            return this.newResult(parsed, stopTail);
        }
    }
    _callFun(name, raw, stopRegex) {
        if (typeof this._Functions[name] !== 'function') error(`unknown function: ${name}`);
        return this._Functions[name].call(this, raw, stopRegex);
    }
    _parseFun(name, raw) {
        funDepth += 1;
        if (name === undefined) confess("name is undefined");
        if (raw === undefined) confess("raw is undefined");

        if (typeof this._Functions[name] !== 'function') error(`unknown function: ${name}`);

        // parameterless function at the end of the file
        if (raw.length === 0) return this.callFun(name, '', /$/); // The stop regex doesn't really matter as raw is empty

        let stopRegex;

        for (let [regex, callback] of testRegexMap) {
            let result = ifRegex(raw, regex, (match) => {
                // let matchedStr = raw.match(regex)[0];
                // indentedLogger(name, "removed", wrapString(matchedStr), wrapString(raw));
                raw = raw.replace(regex, "");
                stopRegex = callback(match.matched, raw);

                return "break";
            });

            if (result === "break") break; // Allows us to "break" from the callback function
        }

        if (stopRegex === undefined) error(`impossible function call delimiter after .${name}, stopped`);

        let val = this._callFun(name, raw, stopRegex);
        // figure out where new lines are being eaten
        // indentedLogger(name, "raw", wrapString(raw));
        // indentedLogger(name, "parsed", wrapString(val.parsed.toString().substr(-15)));
        funDepth -= 1;
        return val;
    }
}

export default Parser;
Parser.ParsedItem = ParsedItem;
