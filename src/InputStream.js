import "babel/polyfill";
import log from "./logger";

let id = 0;
export default class InputStream { /// XXX: Should have a context (file/function+pos)
    constructor(input) {
        this.input = input;
        this.char = 0;
        this.line = 1;
        this.col = 0;
        this.consumed = null;
        this.id = id;
        this.sawFunctionCall = false;

        id++;
    }
    clone() {
        let copy = new InputStream(this.input);
        this._log("cloning to", copy.id);
        copy.input = this.input;
        copy.char = this.char;
        copy.line = this.line;
        copy.col = this.col;
        copy.consumed = this.consumed;
        copy.sawFunctionCall = this.sawFunctionCall;

        return copy;
    }
    _incrementHumanizedPosition() {
        this.consumed.split("").forEach(ch => {
            // log(`${this._clonePrint()}iHP: incremented over "${ch}"`);
            if (ch === "\n") {
                this.line++;
                this.col = 0;
            } else {
                this.col++;
            }
        });
    }
    _log(...args) {
        log(`Stream ${this.id} at ${this.char}/${this.input.length}`, ...args);
    }
    consume(condition) {
        this.consumed = null;

        if (this.atEnd()) return false;

        if (typeof condition === "string") {
            if (this.input.startsWith(condition, this.char)) { // Starts with the condition
                this._log(`consumed "${condition}" with "${condition}"`);
                this.char += condition.length;
                this.consumed = condition;
                this._incrementHumanizedPosition();
                this.sawFunctionCall = false;
                return true;
            } else {
                return false;
            }
        } else { // Assume that it is a regex
            // Will return even when the regex is empty (empty string match)
            let result = condition.exec(this.input.slice(this.char));
            if (result && result.index === 0) {
                this._log(`consumed "${result[0].replace(/\n/g, "\\n")}" with ${condition}`);
                this.char += result[0].length; // the length of the match
                this.consumed = result[0];
                this._incrementHumanizedPosition();
                this.sawFunctionCall = false;
                return true;
            } else {
                return false;
            }
        }
    }
    sync(other) {
        this._log("syncing with", other.id);
        this.input = other.input;
        this.char = other.char;
        this.line = other.line;
        this.col = other.col;
        this.consumed = other.consumed;
        this.sawFunctionCall = other.sawFunctionCall;
    }
    peek() {
        return this.clone();
    }
    croak(msg) {
        throw new Error(`${msg} at ${this.line}:${this.col} (${this.char})`);
    }
    sawNewLine() {
        return (this.consumed && this.consumed.endsWith("\n")) || this.atEnd();
    }
    consumeFunctionCall() {
        return this.consumeDot() && this.consumeFunctionName();
    }
    consumeDot() {
        return this.consume(".");
    }
    consumeWhitespace() {
        return this.consume(/\s+/);
    }
    consumeOptionalWhitespace() {
        return this.consumeWhitespace() || true;
    }
    consumeWord() {
        return this.consume(/\w+/);
    }
    consumeFunctionName() {
        return this.consumeWord();
    }
    consumeChar() {
        return this.consume(/[\W\S]/);
    }
    consumeOther() {
        return this.consumeChar(); // TODO: Optimize: consume more?
    }
    atWordBoundary() {
        if (this.sawFunctionCall) return true;
        let peekingStream = this.peek();
        return (!peekingStream.consumeFunctionCall() && peekingStream.consume(/\W/)) || this.atEnd();
    }
    atEnd() {
        return this.char >= this.input.length;
    }
}