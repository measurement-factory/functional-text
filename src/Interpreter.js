import "babel/polyfill";
import Must from "assert";
import {
    encode as encodeHtmlEntities,
    decode as decodeHtmlEntities
} from "he";
import log from "./logger";
import * as functionRegistry from "./functionRegistry";

class Boundary {
    constructor(value) {
        this.value = value;
        this.name = this.constructor.name;
    }
    toString() {
        return `|${this.value}|@${this.name}`;
    }
    reached() {
        throw new Error(`Not implemented by ${this.constructor.name}`);
    }
    isQuote() {
        return /["'`]/.test(this.value);
    }
}

class BoundaryDot extends Boundary {
    reached() {
        return true;
    }
}

class BoundarySpace extends Boundary {
    reached(inputStream) {
        return inputStream.atWordBoundary();
    }
}

class BoundaryLine extends Boundary {
    reached(inputStream) {
        return inputStream.sawNewLine();
    }
}

class BoundaryParagraph extends Boundary {
    reached(inputStream) {
        return (inputStream.sawNewLine() && inputStream.peek().consume(/\n/)) || inputStream.atEnd();
    }
}

class BoundaryEOF extends Boundary {
    reached(inputStream) {
        return inputStream.atEnd();
    }
}

class BoundaryOther extends Boundary {
    reached(inputStream) {
        const Borders = {
            '{': '}',
            '[': ']',
            '<': '>'
        };
        let delimiter = Borders[this.value] ? Borders[this.value] : this.value;
        return inputStream.consume(delimiter);
    }
}

export class ParseItem {
    constructor(value) {
        this.type = this.constructor.name;
        this.value = value;
    }
    toString() {
        return this.value;
    }
}

export class HTMLOpen extends ParseItem {}
export class HTMLClose extends ParseItem {
    constructor(value) {
        super();
        this.value = `</${value}>`;
    }
}
export class PlainText extends ParseItem {
    constructor() {
        super(...arguments);
        this.sanitizeValue();
    }
    add(text) {
        this.value += text;
        this.sanitizeValue();
    }
    sanitizeValue() {
        this.value = encodeHtmlEntities(
            decodeHtmlEntities(this.value),
            { useNamedReferences: true }
        );
    }
}

export class Parsed {
    constructor(...items) {
        this.items = items;
    }
    _lastItem() {
        return this.items[this.items.length - 1];
    }
    push(...items) {
        for (let item of items) {
            if (item instanceof PlainText) {
                let lastItem = this._lastItem();
                if (lastItem instanceof PlainText) {
                    lastItem.add(item.value);
                } else {
                    this.items.push(item);
                }
            } else {
                this.items.push(item);
            }
        }
    }
    toString() {
        return this.items.join("");
    }

    // allows spreading of Parsed
    [Symbol.iterator]() {
        return this.items.values();
    }
}

function tag(callName, args, functionBody) {
    let htmlArgs = Object.keys(args.byName).map(argName => {
            return `${argName}="${args.byName[argName].toString().replace(/"/g, "\"")}"`;
        }).join(" ");

    return [
        new HTMLOpen(`<${callName}${htmlArgs.length > 0 ? " " : ""}${htmlArgs}>`),
        ...functionBody,
        new HTMLClose(callName)
    ];
}

let interpretCallId = 0;
export default class Interpreter {
    constructor(inputStream) {
        this.inputStream = inputStream;
        this.result = new Parsed();
    }

    // Boundary is an optional parameter
    interpret(boundary, callFunctions = true) {
        interpretCallId++;
        let myInterpretCallId = interpretCallId;
        let reachedBoundary = () => {
            if (boundary && boundary.reached(this.inputStream)) {
                log("Reached boundary:", boundary);
                return true;
            } else {
                return false;
            }
        };

        log("Started interpret while loop", myInterpretCallId, "with boundary", boundary);

        while (!reachedBoundary()) {
            log("\niteration starting: ", myInterpretCallId, "with stream", this.inputStream.id);

            if (this.inputStream.atEnd()) {
                if (boundary) this.inputStream.croak("Unbounded function call");

                break;
            }

            let peekingStream = this.inputStream.peek();
            if (callFunctions && peekingStream.consumeFunctionCall()) {
                // this is a function call

                log("found function call");

                this.inputStream.sync(peekingStream);
                const functionName = this.inputStream.consumed;

                this.interpretFunctionCall(functionName);
            }
            // Just text (one char at a time), not a function call
            else {
                Must(this.inputStream.consumeChar());
                this.interpretText(this.inputStream.consumed);
            }

            log("iteration ending: ", myInterpretCallId, "with stream", this.inputStream.id, "\n");
        }

        log("Finished interpret while loop", myInterpretCallId);

        return this.result;
    }

    interpretText(char) {
        log(`Interpret text called with |${char.replace(/\n/g, "\\n")}|`);
        this.result.push(new PlainText(char));
    }

    callFunction(name, boundary, args) {
        let position = this.inputStream.char;
        log(`calling ${name}, with ${boundary}`);
        try {
            let interpreter = new Interpreter(this.inputStream);
            let functionBody = interpreter.intelligentInterpret(boundary);

            let func = functionRegistry.exists(name) ? functionRegistry.get(name) : tag;

            this.result.push(...func(name, args, functionBody, interpreter));
        }
        catch (e) {
            console.log(`In function ${name} (started at ${position}), at ${this.inputStream.char}:`);
            throw e;
        }
    }

    callFunctionWithBody(name, args, body) {
        let position = this.inputStream.char;
        log(`calling ${name}, with body: ${body}`);
        try {
            let func = functionRegistry.exists(name) ? functionRegistry.get(name) : tag;

            return func(name, args, body, this);
        }
        catch (e) {
            console.log(`In function ${name} (started at ${position}), at ${this.inputStream.char}:`);
            throw e;
        }
    }

    /*
     * If boundary is consumed, returns Boundary,
     * otherwise, returns null *without side effects*.
     */
    consumeBoundary(afterSpace = false) {
        let peekingStream = this.inputStream.peek();
        let boundary;

        if (!afterSpace && peekingStream.consume(".")) {
            // For the `.p.em emphasized` case, we think the user meant to wrap .em in .p, so we throw.
            if (peekingStream.consumeFunctionName()) {
                peekingStream.croak(`Did you forget a space before dot? The dot boundary cannot be followed by a word`);
            }
            boundary = new BoundaryDot(peekingStream.consumed);
        }
        else if (peekingStream.consume(/\s/)) {
            boundary = new BoundarySpace(peekingStream.consumed);
        }
        else if (!afterSpace && peekingStream.consume(/:+/)) {
            let consumed = peekingStream.consumed;
            let colonCount = consumed.length;

            if (!peekingStream.consume(/ |(?:\n)/)) {
                peekingStream.croak("':' sequences must end with whitespace");
            }

            consumed += peekingStream.consumed;

            if (colonCount === 1) {
                boundary = new BoundaryLine(consumed);
            }
            else if (colonCount === 2) {
                boundary = new BoundaryParagraph(consumed);
            }
            else if (colonCount === 3) {
                boundary = new BoundaryEOF(consumed);
            }
            else {
                peekingStream.croak("More than three colons in a colon boundary");
            }
        }
        else if (peekingStream.consume(/[{}<>[\]`"'/@#$%|]/)) {
            if (/[}\]>]/.test(peekingStream.consumed)) {
                peekingStream.croak(`Prohibited boundary ${peekingStream.consumed}`);
            }
            boundary = new BoundaryOther(peekingStream.consumed);
        }
        else {
            return null;
        }

        Must(boundary);
        this.inputStream.sync(peekingStream);
        return boundary;
    }

    parseArgument() {
        let name;
        let value;

        this.inputStream.consumeOptionalWhitespace();
        let peekingStream = this.inputStream.peek();
        if (peekingStream.consumeWord() && peekingStream.consumeOptionalWhitespace() && peekingStream.consume("=")) {
            // Named argument
            Must(this.inputStream.consumeWord());
            name = this.inputStream.consumed;

            Must(this.inputStream.consumeOptionalWhitespace());
            Must(this.inputStream.consume("="));
            Must(this.inputStream.consumeOptionalWhitespace());
        }
        // else anonymous argument

        // We cannot prohibit empty arguments by checking for input stream
        // progress
        let boundary = this.consumeBoundary() || new BoundarySpace(" ");

        let interpreter = new Interpreter(this.inputStream);

        log("parsing Argument", name);
        value = interpreter.intelligentInterpret(boundary);

        this.inputStream.consumeOptionalWhitespace();

        return { name, value };
    }

    interpretFunctionCall(name) {
        let args = [];
        args.byName = {};

        if (this.inputStream.consume("(")) {
            // we have an arguments block in this function

            while (!this.inputStream.consume(")")) {
                let argument = this.parseArgument();
                args.push(argument);
                if (argument.name) args.byName[argument.name] = argument.value;

                if (this.inputStream.consume(",")) {
                    continue;
                }
                else if (this.inputStream.consume(")")) {
                    break;
                }
                else {
                    this.inputStream.croak("Expecting comma or closing parenthese in an argument list");
                }
            }
        }

        // Allow a space between the function call and the first boundary:
        // .foo { } is equivalent to .foo{}
        Must(this.inputStream.consumeOptionalWhitespace());
        let whitespaceBoundary = this.inputStream.consumed ?
            new BoundarySpace(this.inputStream.consumed) : null;
        let boundary = this.consumeBoundary(this.inputStream.consumed) || whitespaceBoundary;

        if (!boundary) this.inputStream.croak("Missing function call boundary");

        this.callFunction(name, boundary, args);
        this.inputStream.sawFunctionCall = true;
    }

    intelligentInterpret(boundary) {
        return boundary.isQuote() ?
            this.interpretFlat(boundary) :
            this.interpretRecursive(boundary);
    }

    interpretRecursive(boundary) {
        return this.interpret(boundary);
    }

    interpretFlat(boundary) {
        return this.interpret(boundary, false);
    }
}