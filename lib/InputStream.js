"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel/polyfill");

var _logger = require("./logger");

var _logger2 = _interopRequireDefault(_logger);

var id = 0;

var InputStream = (function () {
    /// XXX: Should have a context (file/function+pos)

    function InputStream(input) {
        _classCallCheck(this, InputStream);

        this.input = input;
        this.char = 0;
        this.line = 1;
        this.col = 0;
        this.consumed = null;
        this.id = id;
        this.sawFunctionCall = false;

        id++;
    }

    _createClass(InputStream, [{
        key: "clone",
        value: function clone() {
            var copy = new InputStream(this.input);
            this._log("cloning to", copy.id);
            copy.input = this.input;
            copy.char = this.char;
            copy.line = this.line;
            copy.col = this.col;
            copy.consumed = this.consumed;
            copy.sawFunctionCall = this.sawFunctionCall;

            return copy;
        }
    }, {
        key: "_incrementHumanizedPosition",
        value: function _incrementHumanizedPosition() {
            var _this = this;

            this.consumed.split("").forEach(function (ch) {
                // log(`${this._clonePrint()}iHP: incremented over "${ch}"`);
                if (ch === "\n") {
                    _this.line++;
                    _this.col = 0;
                } else {
                    _this.col++;
                }
            });
        }
    }, {
        key: "_log",
        value: function _log() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _logger2["default"].apply(undefined, ["Stream " + this.id + " at " + this.char + "/" + this.input.length].concat(args));
        }
    }, {
        key: "_updateConsumed",
        value: function _updateConsumed(text) {
            this.consumed = text;
            this.char += text.length;
            this._incrementHumanizedPosition();
            this.sawFunctionCall = false;
        }
    }, {
        key: "consume",
        value: function consume(condition) {
            this.consumed = null;

            if (this.atEnd()) return false;

            if (typeof condition === "string") {
                if (this.input.startsWith(condition, this.char)) {
                    // Starts with the condition
                    this._log("consumed \"" + condition + "\" with \"" + condition + "\"");
                    this._updateConsumed(condition);
                    return true;
                }
            } else {
                // Assume that it is a regex
                // Will return even when the regex is empty (empty string match)
                var result = condition.exec(this.input.slice(this.char));
                if (result && result.index === 0) {
                    this._log("consumed \"" + result[0].replace(/\n/g, "\\n") + "\" with " + condition);
                    this._updateConsumed(result[0]);
                    return true;
                }
            }

            return false;
        }
    }, {
        key: "sync",
        value: function sync(other) {
            this._log("syncing with", other.id);
            this.input = other.input;
            this.char = other.char;
            this.line = other.line;
            this.col = other.col;
            this.consumed = other.consumed;
            this.sawFunctionCall = other.sawFunctionCall;
        }
    }, {
        key: "peek",
        value: function peek() {
            return this.clone();
        }
    }, {
        key: "croak",
        value: function croak(msg) {
            throw new Error("" + msg + " at " + this.line + ":" + this.col + " (" + this.char + ")");
        }
    }, {
        key: "sawNewLine",
        value: function sawNewLine() {
            return this.consumed && this.consumed.endsWith("\n") || this.atEnd();
        }
    }, {
        key: "consumeFunctionCall",
        value: function consumeFunctionCall() {
            return this.consumeDot() && this.consumeFunctionName();
        }
    }, {
        key: "consumeDot",
        value: function consumeDot() {
            return this.consume(".");
        }
    }, {
        key: "consumeWhitespace",
        value: function consumeWhitespace() {
            return this.consume(/\s+/);
        }
    }, {
        key: "consumeOptionalWhitespace",
        value: function consumeOptionalWhitespace() {
            return this.consumeWhitespace() || true;
        }
    }, {
        key: "consumeWord",
        value: function consumeWord() {
            return this.consume(/\w+/);
        }
    }, {
        key: "consumeFunctionName",
        value: function consumeFunctionName() {
            return this.consumeWord();
        }
    }, {
        key: "consumeChar",
        value: function consumeChar() {
            return this.consume(/[\W\S]/);
        }
    }, {
        key: "consumeOther",
        value: function consumeOther() {
            return this.consumeChar(); // TODO: Optimize: consume more?
        }
    }, {
        key: "atWordBoundary",
        value: function atWordBoundary() {
            if (this.sawFunctionCall) return true;
            var peekingStream = this.peek();
            return !peekingStream.consumeFunctionCall() && peekingStream.consume(/\W/) || this.atEnd();
        }
    }, {
        key: "atEnd",
        value: function atEnd() {
            return this.char >= this.input.length;
        }
    }]);

    return InputStream;
})();

exports["default"] = InputStream;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,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QUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2hHOzs7ZUFDSSxpQkFBRztBQUNKLG1CQUFPLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDekM7OztXQXBIZ0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiSW5wdXRTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJiYWJlbC9wb2x5ZmlsbFwiO1xuaW1wb3J0IGxvZyBmcm9tIFwiLi9sb2dnZXJcIjtcblxubGV0IGlkID0gMDtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0U3RyZWFtIHsgLy8vIFhYWDogU2hvdWxkIGhhdmUgYSBjb250ZXh0IChmaWxlL2Z1bmN0aW9uK3BvcylcbiAgICBjb25zdHJ1Y3RvcihpbnB1dCkge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuY2hhciA9IDA7XG4gICAgICAgIHRoaXMubGluZSA9IDE7XG4gICAgICAgIHRoaXMuY29sID0gMDtcbiAgICAgICAgdGhpcy5jb25zdW1lZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5zYXdGdW5jdGlvbkNhbGwgPSBmYWxzZTtcblxuICAgICAgICBpZCsrO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgSW5wdXRTdHJlYW0odGhpcy5pbnB1dCk7XG4gICAgICAgIHRoaXMuX2xvZyhcImNsb25pbmcgdG9cIiwgY29weS5pZCk7XG4gICAgICAgIGNvcHkuaW5wdXQgPSB0aGlzLmlucHV0O1xuICAgICAgICBjb3B5LmNoYXIgPSB0aGlzLmNoYXI7XG4gICAgICAgIGNvcHkubGluZSA9IHRoaXMubGluZTtcbiAgICAgICAgY29weS5jb2wgPSB0aGlzLmNvbDtcbiAgICAgICAgY29weS5jb25zdW1lZCA9IHRoaXMuY29uc3VtZWQ7XG4gICAgICAgIGNvcHkuc2F3RnVuY3Rpb25DYWxsID0gdGhpcy5zYXdGdW5jdGlvbkNhbGw7XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIF9pbmNyZW1lbnRIdW1hbml6ZWRQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb25zdW1lZC5zcGxpdChcIlwiKS5mb3JFYWNoKGNoID0+IHtcbiAgICAgICAgICAgIC8vIGxvZyhgJHt0aGlzLl9jbG9uZVByaW50KCl9aUhQOiBpbmNyZW1lbnRlZCBvdmVyIFwiJHtjaH1cImApO1xuICAgICAgICAgICAgaWYgKGNoID09PSBcIlxcblwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5lKys7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2wgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2xvZyguLi5hcmdzKSB7XG4gICAgICAgIGxvZyhgU3RyZWFtICR7dGhpcy5pZH0gYXQgJHt0aGlzLmNoYXJ9LyR7dGhpcy5pbnB1dC5sZW5ndGh9YCwgLi4uYXJncyk7XG4gICAgfVxuICAgIF91cGRhdGVDb25zdW1lZCh0ZXh0KSB7XG4gICAgICAgIHRoaXMuY29uc3VtZWQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmNoYXIgKz0gdGV4dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX2luY3JlbWVudEh1bWFuaXplZFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuc2F3RnVuY3Rpb25DYWxsID0gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN1bWUoY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuY29uc3VtZWQgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLmF0RW5kKCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXQuc3RhcnRzV2l0aChjb25kaXRpb24sIHRoaXMuY2hhcikpIHsgLy8gU3RhcnRzIHdpdGggdGhlIGNvbmRpdGlvblxuICAgICAgICAgICAgICAgIHRoaXMuX2xvZyhgY29uc3VtZWQgXCIke2NvbmRpdGlvbn1cIiB3aXRoIFwiJHtjb25kaXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVDb25zdW1lZChjb25kaXRpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBBc3N1bWUgdGhhdCBpdCBpcyBhIHJlZ2V4XG4gICAgICAgICAgICAvLyBXaWxsIHJldHVybiBldmVuIHdoZW4gdGhlIHJlZ2V4IGlzIGVtcHR5IChlbXB0eSBzdHJpbmcgbWF0Y2gpXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY29uZGl0aW9uLmV4ZWModGhpcy5pbnB1dC5zbGljZSh0aGlzLmNoYXIpKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nKGBjb25zdW1lZCBcIiR7cmVzdWx0WzBdLnJlcGxhY2UoL1xcbi9nLCBcIlxcXFxuXCIpfVwiIHdpdGggJHtjb25kaXRpb259YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ29uc3VtZWQocmVzdWx0WzBdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc3luYyhvdGhlcikge1xuICAgICAgICB0aGlzLl9sb2coXCJzeW5jaW5nIHdpdGhcIiwgb3RoZXIuaWQpO1xuICAgICAgICB0aGlzLmlucHV0ID0gb3RoZXIuaW5wdXQ7XG4gICAgICAgIHRoaXMuY2hhciA9IG90aGVyLmNoYXI7XG4gICAgICAgIHRoaXMubGluZSA9IG90aGVyLmxpbmU7XG4gICAgICAgIHRoaXMuY29sID0gb3RoZXIuY29sO1xuICAgICAgICB0aGlzLmNvbnN1bWVkID0gb3RoZXIuY29uc3VtZWQ7XG4gICAgICAgIHRoaXMuc2F3RnVuY3Rpb25DYWxsID0gb3RoZXIuc2F3RnVuY3Rpb25DYWxsO1xuICAgIH1cbiAgICBwZWVrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgIH1cbiAgICBjcm9hayhtc2cpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke21zZ30gYXQgJHt0aGlzLmxpbmV9OiR7dGhpcy5jb2x9ICgke3RoaXMuY2hhcn0pYCk7XG4gICAgfVxuICAgIHNhd05ld0xpbmUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdW1lZCAmJiB0aGlzLmNvbnN1bWVkLmVuZHNXaXRoKFwiXFxuXCIpKSB8fCB0aGlzLmF0RW5kKCk7XG4gICAgfVxuICAgIGNvbnN1bWVGdW5jdGlvbkNhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVEb3QoKSAmJiB0aGlzLmNvbnN1bWVGdW5jdGlvbk5hbWUoKTtcbiAgICB9XG4gICAgY29uc3VtZURvdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZShcIi5cIik7XG4gICAgfVxuICAgIGNvbnN1bWVXaGl0ZXNwYWNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lKC9cXHMrLyk7XG4gICAgfVxuICAgIGNvbnN1bWVPcHRpb25hbFdoaXRlc3BhY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCkgfHwgdHJ1ZTtcbiAgICB9XG4gICAgY29uc3VtZVdvcmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWUoL1xcdysvKTtcbiAgICB9XG4gICAgY29uc3VtZUZ1bmN0aW9uTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZVdvcmQoKTtcbiAgICB9XG4gICAgY29uc3VtZUNoYXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWUoL1tcXFdcXFNdLyk7XG4gICAgfVxuICAgIGNvbnN1bWVPdGhlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZUNoYXIoKTsgLy8gVE9ETzogT3B0aW1pemU6IGNvbnN1bWUgbW9yZT9cbiAgICB9XG4gICAgYXRXb3JkQm91bmRhcnkoKSB7XG4gICAgICAgIGlmICh0aGlzLnNhd0Z1bmN0aW9uQ2FsbCkgcmV0dXJuIHRydWU7XG4gICAgICAgIGxldCBwZWVraW5nU3RyZWFtID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIHJldHVybiAoIXBlZWtpbmdTdHJlYW0uY29uc3VtZUZ1bmN0aW9uQ2FsbCgpICYmIHBlZWtpbmdTdHJlYW0uY29uc3VtZSgvXFxXLykpIHx8IHRoaXMuYXRFbmQoKTtcbiAgICB9XG4gICAgYXRFbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXIgPj0gdGhpcy5pbnB1dC5sZW5ndGg7XG4gICAgfVxufSJdfQ==