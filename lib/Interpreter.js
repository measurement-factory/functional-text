"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel/polyfill");

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _he = require("he");

var _logger = require("./logger");

var _logger2 = _interopRequireDefault(_logger);

var _functionRegistry = require("./functionRegistry");

var functionRegistry = _interopRequireWildcard(_functionRegistry);

var Boundary = (function () {
    function Boundary(value) {
        _classCallCheck(this, Boundary);

        this.value = value;
        this.name = this.constructor.name;
    }

    _createClass(Boundary, [{
        key: "toString",
        value: function toString() {
            return "|" + this.value + "|@" + this.name;
        }
    }, {
        key: "reached",
        value: function reached() {
            throw new Error("Not implemented by " + this.constructor.name);
        }
    }, {
        key: "isQuote",
        value: function isQuote() {
            return /["'`]/.test(this.value);
        }
    }]);

    return Boundary;
})();

var BoundaryDot = (function (_Boundary) {
    function BoundaryDot() {
        _classCallCheck(this, BoundaryDot);

        if (_Boundary != null) {
            _Boundary.apply(this, arguments);
        }
    }

    _inherits(BoundaryDot, _Boundary);

    _createClass(BoundaryDot, [{
        key: "reached",
        value: function reached() {
            return true;
        }
    }]);

    return BoundaryDot;
})(Boundary);

var BoundarySpace = (function (_Boundary2) {
    function BoundarySpace() {
        _classCallCheck(this, BoundarySpace);

        if (_Boundary2 != null) {
            _Boundary2.apply(this, arguments);
        }
    }

    _inherits(BoundarySpace, _Boundary2);

    _createClass(BoundarySpace, [{
        key: "reached",
        value: function reached(inputStream) {
            return inputStream.atWordBoundary();
        }
    }]);

    return BoundarySpace;
})(Boundary);

var BoundaryLine = (function (_Boundary3) {
    function BoundaryLine() {
        _classCallCheck(this, BoundaryLine);

        if (_Boundary3 != null) {
            _Boundary3.apply(this, arguments);
        }
    }

    _inherits(BoundaryLine, _Boundary3);

    _createClass(BoundaryLine, [{
        key: "reached",
        value: function reached(inputStream) {
            return inputStream.sawNewLine();
        }
    }]);

    return BoundaryLine;
})(Boundary);

var BoundaryParagraph = (function (_Boundary4) {
    function BoundaryParagraph() {
        _classCallCheck(this, BoundaryParagraph);

        if (_Boundary4 != null) {
            _Boundary4.apply(this, arguments);
        }
    }

    _inherits(BoundaryParagraph, _Boundary4);

    _createClass(BoundaryParagraph, [{
        key: "reached",
        value: function reached(inputStream) {
            return inputStream.sawNewLine() && inputStream.peek().consume(/\n/) || inputStream.atEnd();
        }
    }]);

    return BoundaryParagraph;
})(Boundary);

var BoundaryEOF = (function (_Boundary5) {
    function BoundaryEOF() {
        _classCallCheck(this, BoundaryEOF);

        if (_Boundary5 != null) {
            _Boundary5.apply(this, arguments);
        }
    }

    _inherits(BoundaryEOF, _Boundary5);

    _createClass(BoundaryEOF, [{
        key: "reached",
        value: function reached(inputStream) {
            return inputStream.atEnd();
        }
    }]);

    return BoundaryEOF;
})(Boundary);

var BoundaryOther = (function (_Boundary6) {
    function BoundaryOther() {
        _classCallCheck(this, BoundaryOther);

        if (_Boundary6 != null) {
            _Boundary6.apply(this, arguments);
        }
    }

    _inherits(BoundaryOther, _Boundary6);

    _createClass(BoundaryOther, [{
        key: "reached",
        value: function reached(inputStream) {
            var Borders = {
                "{": "}",
                "[": "]",
                "<": ">"
            };
            var delimiter = Borders[this.value] ? Borders[this.value] : this.value;
            return inputStream.consume(delimiter);
        }
    }]);

    return BoundaryOther;
})(Boundary);

var ParseItem = (function () {
    function ParseItem(value) {
        _classCallCheck(this, ParseItem);

        this.type = this.constructor.name;
        this.value = value;
    }

    _createClass(ParseItem, [{
        key: "toString",
        value: function toString() {
            return this.value;
        }
    }]);

    return ParseItem;
})();

exports.ParseItem = ParseItem;

var HTMLOpen = (function (_ParseItem) {
    function HTMLOpen() {
        _classCallCheck(this, HTMLOpen);

        if (_ParseItem != null) {
            _ParseItem.apply(this, arguments);
        }
    }

    _inherits(HTMLOpen, _ParseItem);

    return HTMLOpen;
})(ParseItem);

exports.HTMLOpen = HTMLOpen;

var HTMLClose = (function (_ParseItem2) {
    function HTMLClose(value) {
        _classCallCheck(this, HTMLClose);

        _get(Object.getPrototypeOf(HTMLClose.prototype), "constructor", this).call(this);
        this.value = "</" + value + ">";
    }

    _inherits(HTMLClose, _ParseItem2);

    return HTMLClose;
})(ParseItem);

exports.HTMLClose = HTMLClose;

var PlainText = (function (_ParseItem3) {
    function PlainText() {
        _classCallCheck(this, PlainText);

        _get(Object.getPrototypeOf(PlainText.prototype), "constructor", this).apply(this, arguments);
        this.sanitizeValue();
    }

    _inherits(PlainText, _ParseItem3);

    _createClass(PlainText, [{
        key: "add",
        value: function add(text) {
            this.value += text;
            this.sanitizeValue();
        }
    }, {
        key: "sanitizeValue",
        value: function sanitizeValue() {
            this.value = (0, _he.encode)((0, _he.decode)(this.value), { useNamedReferences: true });
        }
    }]);

    return PlainText;
})(ParseItem);

exports.PlainText = PlainText;

var Parsed = (function () {
    function Parsed() {
        for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
            items[_key] = arguments[_key];
        }

        _classCallCheck(this, Parsed);

        this.items = items;
    }

    _createClass(Parsed, [{
        key: "_lastItem",
        value: function _lastItem() {
            return this.items[this.items.length - 1];
        }
    }, {
        key: "push",
        value: function push() {
            for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                items[_key2] = arguments[_key2];
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    if (item instanceof PlainText) {
                        var lastItem = this._lastItem();
                        if (lastItem instanceof PlainText) {
                            lastItem.add(item.value);
                        } else {
                            this.items.push(item);
                        }
                    } else {
                        this.items.push(item);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: "toString",
        value: function toString() {
            return this.items.join("");
        }
    }, {
        key: Symbol.iterator,

        // allows spreading of Parsed
        value: function () {
            return this.items.values();
        }
    }]);

    return Parsed;
})();

exports.Parsed = Parsed;

function tag(callName, args, functionBody) {
    var htmlArgs = Object.keys(args.byName).map(function (argName) {
        return "" + argName + "=\"" + args.byName[argName].toString().replace(/"/g, "\"") + "\"";
    }).join(" ");

    return [new HTMLOpen("<" + callName + "" + (htmlArgs.length > 0 ? " " : "") + "" + htmlArgs + ">")].concat(_toConsumableArray(functionBody), [new HTMLClose(callName)]);
}

var interpretCallId = 0;

var Interpreter = (function () {
    function Interpreter(inputStream) {
        _classCallCheck(this, Interpreter);

        this.inputStream = inputStream;
        this.result = new Parsed();
    }

    _createClass(Interpreter, [{
        key: "interpret",

        // Boundary is an optional parameter
        value: function interpret(boundary) {
            var _this = this;

            var callFunctions = arguments[1] === undefined ? true : arguments[1];

            interpretCallId++;
            var myInterpretCallId = interpretCallId;
            var reachedBoundary = function reachedBoundary() {
                if (boundary && boundary.reached(_this.inputStream)) {
                    (0, _logger2["default"])("Reached boundary:", boundary);
                    return true;
                } else {
                    return false;
                }
            };

            (0, _logger2["default"])("Started interpret while loop", myInterpretCallId, "with boundary", boundary);

            while (!reachedBoundary()) {
                (0, _logger2["default"])("\niteration starting: ", myInterpretCallId, "with stream", this.inputStream.id);

                if (this.inputStream.atEnd()) {
                    if (boundary) this.inputStream.croak("Unbounded function call");

                    break;
                }

                var peekingStream = this.inputStream.peek();
                if (callFunctions && peekingStream.consumeFunctionCall()) {
                    // this is a function call

                    (0, _logger2["default"])("found function call");

                    this.inputStream.sync(peekingStream);
                    var functionName = this.inputStream.consumed;

                    this.interpretFunctionCall(functionName);
                }
                // Just text, not a function call after this point
                else if (this.inputStream.peek().consume(/\w/)) {
                    (0, _assert2["default"])(this.inputStream.consumeWord());
                    this.interpretText(this.inputStream.consumed);
                } else if (this.inputStream.peek().consume(/\s/)) {
                    (0, _assert2["default"])(this.inputStream.consumeWhitespace());
                    this.interpretText(this.inputStream.consumed);
                } else {
                    (0, _assert2["default"])(this.inputStream.consumeChar());
                    this.interpretText(this.inputStream.consumed);
                }

                (0, _logger2["default"])("iteration ending: ", myInterpretCallId, "with stream", this.inputStream.id, "\n");
            }

            (0, _logger2["default"])("Finished interpret while loop", myInterpretCallId);

            return this.result;
        }
    }, {
        key: "interpretText",
        value: function interpretText(char) {
            (0, _logger2["default"])("Interpret text called with |" + char.replace(/\n/g, "\\n") + "|");
            this.result.push(new PlainText(char));
        }
    }, {
        key: "callFunction",
        value: function callFunction(name, boundary, args) {
            var position = this.inputStream.char;
            (0, _logger2["default"])("calling " + name + ", with " + boundary);
            try {
                var _result;

                var interpreter = new Interpreter(this.inputStream);
                var functionBody = interpreter.intelligentInterpret(boundary);

                var func = functionRegistry.exists(name) ? functionRegistry.get(name) : tag;

                (_result = this.result).push.apply(_result, _toConsumableArray(func(name, args, functionBody, interpreter)));
            } catch (e) {
                console.log("In function " + name + " (started at " + position + "), at " + this.inputStream.char + ":");
                throw e;
            }
        }
    }, {
        key: "callFunctionWithBody",
        value: function callFunctionWithBody(name, args, body) {
            var position = this.inputStream.char;
            (0, _logger2["default"])("calling " + name + ", with body: " + body);
            try {
                var func = functionRegistry.exists(name) ? functionRegistry.get(name) : tag;

                return func(name, args, body, this);
            } catch (e) {
                console.log("In function " + name + " (started at " + position + "), at " + this.inputStream.char + ":");
                throw e;
            }
        }
    }, {
        key: "consumeBoundary",

        /*
         * If boundary is consumed, returns Boundary,
         * otherwise, returns null *without side effects*.
         */
        value: function consumeBoundary() {
            var afterSpace = arguments[0] === undefined ? false : arguments[0];

            var peekingStream = this.inputStream.peek();
            var boundary = undefined;

            if (!afterSpace && peekingStream.consume(".")) {
                // For the `.p.em emphasized` case, we think the user meant to wrap .em in .p, so we throw.
                if (peekingStream.consumeFunctionName()) {
                    peekingStream.croak("Did you forget a space before dot? The dot boundary cannot be followed by a word");
                }
                boundary = new BoundaryDot(peekingStream.consumed);
            } else if (peekingStream.consume(/\s/)) {
                boundary = new BoundarySpace(peekingStream.consumed);
            } else if (!afterSpace && peekingStream.consume(/:+/)) {
                var consumed = peekingStream.consumed;
                var colonCount = consumed.length;

                if (!peekingStream.consume(/ |(?:\n)/)) {
                    peekingStream.croak("':' sequences must end with whitespace");
                }

                consumed += peekingStream.consumed;

                if (colonCount === 1) {
                    boundary = new BoundaryLine(consumed);
                } else if (colonCount === 2) {
                    boundary = new BoundaryParagraph(consumed);
                } else if (colonCount === 3) {
                    boundary = new BoundaryEOF(consumed);
                } else {
                    peekingStream.croak("More than three colons in a colon boundary");
                }
            } else if (peekingStream.consume(/[{}<>[\]`"'/@#$%|]/)) {
                if (/[}\]>]/.test(peekingStream.consumed)) {
                    peekingStream.croak("Prohibited boundary " + peekingStream.consumed);
                }
                boundary = new BoundaryOther(peekingStream.consumed);
            } else {
                return null;
            }

            (0, _assert2["default"])(boundary);
            this.inputStream.sync(peekingStream);
            return boundary;
        }
    }, {
        key: "parseArgument",
        value: function parseArgument() {
            var name = undefined;
            var value = undefined;

            this.inputStream.consumeOptionalWhitespace();
            var peekingStream = this.inputStream.peek();
            if (peekingStream.consumeWord() && peekingStream.consumeOptionalWhitespace() && peekingStream.consume("=")) {
                // Named argument
                (0, _assert2["default"])(this.inputStream.consumeWord());
                name = this.inputStream.consumed;

                (0, _assert2["default"])(this.inputStream.consumeOptionalWhitespace());
                (0, _assert2["default"])(this.inputStream.consume("="));
                (0, _assert2["default"])(this.inputStream.consumeOptionalWhitespace());
            }
            // else anonymous argument

            // We cannot prohibit empty arguments by checking for input stream
            // progress
            var boundary = this.consumeBoundary() || new BoundarySpace(" ");

            var interpreter = new Interpreter(this.inputStream);

            (0, _logger2["default"])("parsing Argument", name);
            value = interpreter.intelligentInterpret(boundary);

            this.inputStream.consumeOptionalWhitespace();

            return { name: name, value: value };
        }
    }, {
        key: "interpretFunctionCall",
        value: function interpretFunctionCall(name) {
            var args = [];
            args.byName = {};

            if (this.inputStream.consume("(")) {
                // we have an arguments block in this function

                while (!this.inputStream.consume(")")) {
                    var argument = this.parseArgument();
                    args.push(argument);
                    if (argument.name) args.byName[argument.name] = argument.value;

                    if (this.inputStream.consume(",")) {
                        continue;
                    } else if (this.inputStream.consume(")")) {
                        break;
                    } else {
                        this.inputStream.croak("Expecting comma or closing parenthese in an argument list");
                    }
                }
            }

            // Allow a space between the function call and the first boundary:
            // .foo { } is equivalent to .foo{}
            (0, _assert2["default"])(this.inputStream.consumeOptionalWhitespace());
            var whitespaceBoundary = this.inputStream.consumed ? new BoundarySpace(this.inputStream.consumed) : null;
            var boundary = this.consumeBoundary(this.inputStream.consumed) || whitespaceBoundary;

            if (!boundary) this.inputStream.croak("Missing function call boundary");

            this.callFunction(name, boundary, args);
            this.inputStream.sawFunctionCall = true;
        }
    }, {
        key: "intelligentInterpret",
        value: function intelligentInterpret(boundary) {
            return boundary.isQuote() ? this.interpretFlat(boundary) : this.interpretRecursive(boundary);
        }
    }, {
        key: "interpretRecursive",
        value: function interpretRecursive(boundary) {
            return this.interpret(boundary);
        }
    }, {
        key: "interpretFlat",
        value: function interpretFlat(boundary) {
            return this.interpret(boundary, false);
        }
    }]);

    return Interpreter;
})();

exports["default"] = Interpreter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9JbnRlcnByZXRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFPLGdCQUFnQjs7c0JBQ04sUUFBUTs7OztrQkFJbEIsSUFBSTs7c0JBQ0ssVUFBVTs7OztnQ0FDUSxvQkFBb0I7O0lBQTFDLGdCQUFnQjs7SUFFdEIsUUFBUTtBQUNDLGFBRFQsUUFBUSxDQUNFLEtBQUssRUFBRTs4QkFEakIsUUFBUTs7QUFFTixZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixZQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0tBQ3JDOztpQkFKQyxRQUFROztlQUtGLG9CQUFHO0FBQ1AseUJBQVcsSUFBSSxDQUFDLEtBQUssVUFBSyxJQUFJLENBQUMsSUFBSSxDQUFHO1NBQ3pDOzs7ZUFDTSxtQkFBRztBQUNOLGtCQUFNLElBQUksS0FBSyx5QkFBdUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUcsQ0FBQztTQUNsRTs7O2VBQ00sbUJBQUc7QUFDTixtQkFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQzs7O1dBYkMsUUFBUTs7O0lBZ0JSLFdBQVc7YUFBWCxXQUFXOzhCQUFYLFdBQVc7Ozs7Ozs7Y0FBWCxXQUFXOztpQkFBWCxXQUFXOztlQUNOLG1CQUFHO0FBQ04sbUJBQU8sSUFBSSxDQUFDO1NBQ2Y7OztXQUhDLFdBQVc7R0FBUyxRQUFROztJQU01QixhQUFhO2FBQWIsYUFBYTs4QkFBYixhQUFhOzs7Ozs7O2NBQWIsYUFBYTs7aUJBQWIsYUFBYTs7ZUFDUixpQkFBQyxXQUFXLEVBQUU7QUFDakIsbUJBQU8sV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZDOzs7V0FIQyxhQUFhO0dBQVMsUUFBUTs7SUFNOUIsWUFBWTthQUFaLFlBQVk7OEJBQVosWUFBWTs7Ozs7OztjQUFaLFlBQVk7O2lCQUFa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dkY7aUJBQ0o7YUFDSjs7OztBQUlELHFDQUFLLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELGdCQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUM5QyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN4RCxnQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLGtCQUFrQixDQUFDOztBQUVyRixnQkFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOztBQUV4RSxnQkFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hDLGdCQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDM0M7OztlQUVtQiw4QkFBQyxRQUFRLEVBQUU7QUFDM0IsbUJBQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUM1QixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekM7OztlQUVpQiw0QkFBQyxRQUFRLEVBQUU7QUFDekIsbUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNuQzs7O2VBRVksdUJBQUMsUUFBUSxFQUFFO0FBQ3BCLG1CQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFDOzs7V0EzT2dCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6IkludGVycHJldGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiYmFiZWwvcG9seWZpbGxcIjtcbmltcG9ydCBNdXN0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCB7XG4gICAgZW5jb2RlIGFzIGVuY29kZUh0bWxFbnRpdGllcyxcbiAgICBkZWNvZGUgYXMgZGVjb2RlSHRtbEVudGl0aWVzXG59IGZyb20gXCJoZVwiO1xuaW1wb3J0IGxvZyBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCAqIGFzIGZ1bmN0aW9uUmVnaXN0cnkgZnJvbSBcIi4vZnVuY3Rpb25SZWdpc3RyeVwiO1xuXG5jbGFzcyBCb3VuZGFyeSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLm5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYHwke3RoaXMudmFsdWV9fEAke3RoaXMubmFtZX1gO1xuICAgIH1cbiAgICByZWFjaGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBpbXBsZW1lbnRlZCBieSAke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcbiAgICB9XG4gICAgaXNRdW90ZSgpIHtcbiAgICAgICAgcmV0dXJuIC9bXCInYF0vLnRlc3QodGhpcy52YWx1ZSk7XG4gICAgfVxufVxuXG5jbGFzcyBCb3VuZGFyeURvdCBleHRlbmRzIEJvdW5kYXJ5IHtcbiAgICByZWFjaGVkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmNsYXNzIEJvdW5kYXJ5U3BhY2UgZXh0ZW5kcyBCb3VuZGFyeSB7XG4gICAgcmVhY2hlZChpbnB1dFN0cmVhbSkge1xuICAgICAgICByZXR1cm4gaW5wdXRTdHJlYW0uYXRXb3JkQm91bmRhcnkoKTtcbiAgICB9XG59XG5cbmNsYXNzIEJvdW5kYXJ5TGluZSBleHRlbmRzIEJvdW5kYXJ5IHtcbiAgICByZWFjaGVkKGlucHV0U3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBpbnB1dFN0cmVhbS5zYXdOZXdMaW5lKCk7XG4gICAgfVxufVxuXG5jbGFzcyBCb3VuZGFyeVBhcmFncmFwaCBleHRlbmRzIEJvdW5kYXJ5IHtcbiAgICByZWFjaGVkKGlucHV0U3RyZWFtKSB7XG4gICAgICAgIHJldHVybiAoaW5wdXRTdHJlYW0uc2F3TmV3TGluZSgpICYmIGlucHV0U3RyZWFtLnBlZWsoKS5jb25zdW1lKC9cXG4vKSkgfHwgaW5wdXRTdHJlYW0uYXRFbmQoKTtcbiAgICB9XG59XG5cbmNsYXNzIEJvdW5kYXJ5RU9GIGV4dGVuZHMgQm91bmRhcnkge1xuICAgIHJlYWNoZWQoaW5wdXRTdHJlYW0pIHtcbiAgICAgICAgcmV0dXJuIGlucHV0U3RyZWFtLmF0RW5kKCk7XG4gICAgfVxufVxuXG5jbGFzcyBCb3VuZGFyeU90aGVyIGV4dGVuZHMgQm91bmRhcnkge1xuICAgIHJlYWNoZWQoaW5wdXRTdHJlYW0pIHtcbiAgICAgICAgY29uc3QgQm9yZGVycyA9IHtcbiAgICAgICAgICAgICd7JzogJ30nLFxuICAgICAgICAgICAgJ1snOiAnXScsXG4gICAgICAgICAgICAnPCc6ICc+J1xuICAgICAgICB9O1xuICAgICAgICBsZXQgZGVsaW1pdGVyID0gQm9yZGVyc1t0aGlzLnZhbHVlXSA/IEJvcmRlcnNbdGhpcy52YWx1ZV0gOiB0aGlzLnZhbHVlO1xuICAgICAgICByZXR1cm4gaW5wdXRTdHJlYW0uY29uc3VtZShkZWxpbWl0ZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlSXRlbSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgdGhpcy50eXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIVE1MT3BlbiBleHRlbmRzIFBhcnNlSXRlbSB7fVxuZXhwb3J0IGNsYXNzIEhUTUxDbG9zZSBleHRlbmRzIFBhcnNlSXRlbSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IGA8LyR7dmFsdWV9PmA7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBsYWluVGV4dCBleHRlbmRzIFBhcnNlSXRlbSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc2FuaXRpemVWYWx1ZSgpO1xuICAgIH1cbiAgICBhZGQodGV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlICs9IHRleHQ7XG4gICAgICAgIHRoaXMuc2FuaXRpemVWYWx1ZSgpO1xuICAgIH1cbiAgICBzYW5pdGl6ZVZhbHVlKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gZW5jb2RlSHRtbEVudGl0aWVzKFxuICAgICAgICAgICAgZGVjb2RlSHRtbEVudGl0aWVzKHRoaXMudmFsdWUpLFxuICAgICAgICAgICAgeyB1c2VOYW1lZFJlZmVyZW5jZXM6IHRydWUgfVxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlZCB7XG4gICAgY29uc3RydWN0b3IoLi4uaXRlbXMpIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgIH1cbiAgICBfbGFzdEl0ZW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW3RoaXMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIHB1c2goLi4uaXRlbXMpIHtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQbGFpblRleHQpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdEl0ZW0gPSB0aGlzLl9sYXN0SXRlbSgpO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0SXRlbSBpbnN0YW5jZW9mIFBsYWluVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0SXRlbS5hZGQoaXRlbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5qb2luKFwiXCIpO1xuICAgIH1cblxuICAgIC8vIGFsbG93cyBzcHJlYWRpbmcgb2YgUGFyc2VkXG4gICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLnZhbHVlcygpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGFnKGNhbGxOYW1lLCBhcmdzLCBmdW5jdGlvbkJvZHkpIHtcbiAgICBsZXQgaHRtbEFyZ3MgPSBPYmplY3Qua2V5cyhhcmdzLmJ5TmFtZSkubWFwKGFyZ05hbWUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke2FyZ05hbWV9PVwiJHthcmdzLmJ5TmFtZVthcmdOYW1lXS50b1N0cmluZygpLnJlcGxhY2UoL1wiL2csIFwiXFxcIlwiKX1cImA7XG4gICAgICAgIH0pLmpvaW4oXCIgXCIpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEhUTUxPcGVuKGA8JHtjYWxsTmFtZX0ke2h0bWxBcmdzLmxlbmd0aCA+IDAgPyBcIiBcIiA6IFwiXCJ9JHtodG1sQXJnc30+YCksXG4gICAgICAgIC4uLmZ1bmN0aW9uQm9keSxcbiAgICAgICAgbmV3IEhUTUxDbG9zZShjYWxsTmFtZSlcbiAgICBdO1xufVxuXG5sZXQgaW50ZXJwcmV0Q2FsbElkID0gMDtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVycHJldGVyIHtcbiAgICBjb25zdHJ1Y3RvcihpbnB1dFN0cmVhbSkge1xuICAgICAgICB0aGlzLmlucHV0U3RyZWFtID0gaW5wdXRTdHJlYW07XG4gICAgICAgIHRoaXMucmVzdWx0ID0gbmV3IFBhcnNlZCgpO1xuICAgIH1cblxuICAgIC8vIEJvdW5kYXJ5IGlzIGFuIG9wdGlvbmFsIHBhcmFtZXRlclxuICAgIGludGVycHJldChib3VuZGFyeSwgY2FsbEZ1bmN0aW9ucyA9IHRydWUpIHtcbiAgICAgICAgaW50ZXJwcmV0Q2FsbElkKys7XG4gICAgICAgIGxldCBteUludGVycHJldENhbGxJZCA9IGludGVycHJldENhbGxJZDtcbiAgICAgICAgbGV0IHJlYWNoZWRCb3VuZGFyeSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChib3VuZGFyeSAmJiBib3VuZGFyeS5yZWFjaGVkKHRoaXMuaW5wdXRTdHJlYW0pKSB7XG4gICAgICAgICAgICAgICAgbG9nKFwiUmVhY2hlZCBib3VuZGFyeTpcIiwgYm91bmRhcnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbG9nKFwiU3RhcnRlZCBpbnRlcnByZXQgd2hpbGUgbG9vcFwiLCBteUludGVycHJldENhbGxJZCwgXCJ3aXRoIGJvdW5kYXJ5XCIsIGJvdW5kYXJ5KTtcblxuICAgICAgICB3aGlsZSAoIXJlYWNoZWRCb3VuZGFyeSgpKSB7XG4gICAgICAgICAgICBsb2coXCJcXG5pdGVyYXRpb24gc3RhcnRpbmc6IFwiLCBteUludGVycHJldENhbGxJZCwgXCJ3aXRoIHN0cmVhbVwiLCB0aGlzLmlucHV0U3RyZWFtLmlkKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXRTdHJlYW0uYXRFbmQoKSkge1xuICAgICAgICAgICAgICAgIGlmIChib3VuZGFyeSkgdGhpcy5pbnB1dFN0cmVhbS5jcm9hayhcIlVuYm91bmRlZCBmdW5jdGlvbiBjYWxsXCIpO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwZWVraW5nU3RyZWFtID0gdGhpcy5pbnB1dFN0cmVhbS5wZWVrKCk7XG4gICAgICAgICAgICBpZiAoY2FsbEZ1bmN0aW9ucyAmJiBwZWVraW5nU3RyZWFtLmNvbnN1bWVGdW5jdGlvbkNhbGwoKSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBmdW5jdGlvbiBjYWxsXG5cbiAgICAgICAgICAgICAgICBsb2coXCJmb3VuZCBmdW5jdGlvbiBjYWxsXCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dFN0cmVhbS5zeW5jKHBlZWtpbmdTdHJlYW0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IHRoaXMuaW5wdXRTdHJlYW0uY29uc3VtZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmludGVycHJldEZ1bmN0aW9uQ2FsbChmdW5jdGlvbk5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSnVzdCB0ZXh0LCBub3QgYSBmdW5jdGlvbiBjYWxsIGFmdGVyIHRoaXMgcG9pbnRcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaW5wdXRTdHJlYW0ucGVlaygpLmNvbnN1bWUoL1xcdy8pKSB7XG4gICAgICAgICAgICAgICAgTXVzdCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVXb3JkKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJwcmV0VGV4dCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaW5wdXRTdHJlYW0ucGVlaygpLmNvbnN1bWUoL1xccy8pKSB7XG4gICAgICAgICAgICAgICAgTXVzdCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVXaGl0ZXNwYWNlKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJwcmV0VGV4dCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIE11c3QodGhpcy5pbnB1dFN0cmVhbS5jb25zdW1lQ2hhcigpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVycHJldFRleHQodGhpcy5pbnB1dFN0cmVhbS5jb25zdW1lZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZyhcIml0ZXJhdGlvbiBlbmRpbmc6IFwiLCBteUludGVycHJldENhbGxJZCwgXCJ3aXRoIHN0cmVhbVwiLCB0aGlzLmlucHV0U3RyZWFtLmlkLCBcIlxcblwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZyhcIkZpbmlzaGVkIGludGVycHJldCB3aGlsZSBsb29wXCIsIG15SW50ZXJwcmV0Q2FsbElkKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuXG4gICAgaW50ZXJwcmV0VGV4dChjaGFyKSB7XG4gICAgICAgIGxvZyhgSW50ZXJwcmV0IHRleHQgY2FsbGVkIHdpdGggfCR7Y2hhci5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKX18YCk7XG4gICAgICAgIHRoaXMucmVzdWx0LnB1c2gobmV3IFBsYWluVGV4dChjaGFyKSk7XG4gICAgfVxuXG4gICAgY2FsbEZ1bmN0aW9uKG5hbWUsIGJvdW5kYXJ5LCBhcmdzKSB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuaW5wdXRTdHJlYW0uY2hhcjtcbiAgICAgICAgbG9nKGBjYWxsaW5nICR7bmFtZX0sIHdpdGggJHtib3VuZGFyeX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcih0aGlzLmlucHV0U3RyZWFtKTtcbiAgICAgICAgICAgIGxldCBmdW5jdGlvbkJvZHkgPSBpbnRlcnByZXRlci5pbnRlbGxpZ2VudEludGVycHJldChib3VuZGFyeSk7XG5cbiAgICAgICAgICAgIGxldCBmdW5jID0gZnVuY3Rpb25SZWdpc3RyeS5leGlzdHMobmFtZSkgPyBmdW5jdGlvblJlZ2lzdHJ5LmdldChuYW1lKSA6IHRhZztcblxuICAgICAgICAgICAgdGhpcy5yZXN1bHQucHVzaCguLi5mdW5jKG5hbWUsIGFyZ3MsIGZ1bmN0aW9uQm9keSwgaW50ZXJwcmV0ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEluIGZ1bmN0aW9uICR7bmFtZX0gKHN0YXJ0ZWQgYXQgJHtwb3NpdGlvbn0pLCBhdCAke3RoaXMuaW5wdXRTdHJlYW0uY2hhcn06YCk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsbEZ1bmN0aW9uV2l0aEJvZHkobmFtZSwgYXJncywgYm9keSkge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmlucHV0U3RyZWFtLmNoYXI7XG4gICAgICAgIGxvZyhgY2FsbGluZyAke25hbWV9LCB3aXRoIGJvZHk6ICR7Ym9keX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBmdW5jID0gZnVuY3Rpb25SZWdpc3RyeS5leGlzdHMobmFtZSkgPyBmdW5jdGlvblJlZ2lzdHJ5LmdldChuYW1lKSA6IHRhZztcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmMobmFtZSwgYXJncywgYm9keSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJbiBmdW5jdGlvbiAke25hbWV9IChzdGFydGVkIGF0ICR7cG9zaXRpb259KSwgYXQgJHt0aGlzLmlucHV0U3RyZWFtLmNoYXJ9OmApO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICogSWYgYm91bmRhcnkgaXMgY29uc3VtZWQsIHJldHVybnMgQm91bmRhcnksXG4gICAgICogb3RoZXJ3aXNlLCByZXR1cm5zIG51bGwgKndpdGhvdXQgc2lkZSBlZmZlY3RzKi5cbiAgICAgKi9cbiAgICBjb25zdW1lQm91bmRhcnkoYWZ0ZXJTcGFjZSA9IGZhbHNlKSB7XG4gICAgICAgIGxldCBwZWVraW5nU3RyZWFtID0gdGhpcy5pbnB1dFN0cmVhbS5wZWVrKCk7XG4gICAgICAgIGxldCBib3VuZGFyeTtcblxuICAgICAgICBpZiAoIWFmdGVyU3BhY2UgJiYgcGVla2luZ1N0cmVhbS5jb25zdW1lKFwiLlwiKSkge1xuICAgICAgICAgICAgLy8gRm9yIHRoZSBgLnAuZW0gZW1waGFzaXplZGAgY2FzZSwgd2UgdGhpbmsgdGhlIHVzZXIgbWVhbnQgdG8gd3JhcCAuZW0gaW4gLnAsIHNvIHdlIHRocm93LlxuICAgICAgICAgICAgaWYgKHBlZWtpbmdTdHJlYW0uY29uc3VtZUZ1bmN0aW9uTmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgcGVla2luZ1N0cmVhbS5jcm9hayhgRGlkIHlvdSBmb3JnZXQgYSBzcGFjZSBiZWZvcmUgZG90PyBUaGUgZG90IGJvdW5kYXJ5IGNhbm5vdCBiZSBmb2xsb3dlZCBieSBhIHdvcmRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdW5kYXJ5ID0gbmV3IEJvdW5kYXJ5RG90KHBlZWtpbmdTdHJlYW0uY29uc3VtZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBlZWtpbmdTdHJlYW0uY29uc3VtZSgvXFxzLykpIHtcbiAgICAgICAgICAgIGJvdW5kYXJ5ID0gbmV3IEJvdW5kYXJ5U3BhY2UocGVla2luZ1N0cmVhbS5jb25zdW1lZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWFmdGVyU3BhY2UgJiYgcGVla2luZ1N0cmVhbS5jb25zdW1lKC86Ky8pKSB7XG4gICAgICAgICAgICBsZXQgY29uc3VtZWQgPSBwZWVraW5nU3RyZWFtLmNvbnN1bWVkO1xuICAgICAgICAgICAgbGV0IGNvbG9uQ291bnQgPSBjb25zdW1lZC5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmICghcGVla2luZ1N0cmVhbS5jb25zdW1lKC8gfCg/OlxcbikvKSkge1xuICAgICAgICAgICAgICAgIHBlZWtpbmdTdHJlYW0uY3JvYWsoXCInOicgc2VxdWVuY2VzIG11c3QgZW5kIHdpdGggd2hpdGVzcGFjZVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3VtZWQgKz0gcGVla2luZ1N0cmVhbS5jb25zdW1lZDtcblxuICAgICAgICAgICAgaWYgKGNvbG9uQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IG5ldyBCb3VuZGFyeUxpbmUoY29uc3VtZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY29sb25Db3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgIGJvdW5kYXJ5ID0gbmV3IEJvdW5kYXJ5UGFyYWdyYXBoKGNvbnN1bWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNvbG9uQ291bnQgPT09IDMpIHtcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IG5ldyBCb3VuZGFyeUVPRihjb25zdW1lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZWVraW5nU3RyZWFtLmNyb2FrKFwiTW9yZSB0aGFuIHRocmVlIGNvbG9ucyBpbiBhIGNvbG9uIGJvdW5kYXJ5XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBlZWtpbmdTdHJlYW0uY29uc3VtZSgvW3t9PD5bXFxdYFwiJy9AIyQlfF0vKSkge1xuICAgICAgICAgICAgaWYgKC9bfVxcXT5dLy50ZXN0KHBlZWtpbmdTdHJlYW0uY29uc3VtZWQpKSB7XG4gICAgICAgICAgICAgICAgcGVla2luZ1N0cmVhbS5jcm9hayhgUHJvaGliaXRlZCBib3VuZGFyeSAke3BlZWtpbmdTdHJlYW0uY29uc3VtZWR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3VuZGFyeSA9IG5ldyBCb3VuZGFyeU90aGVyKHBlZWtpbmdTdHJlYW0uY29uc3VtZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBNdXN0KGJvdW5kYXJ5KTtcbiAgICAgICAgdGhpcy5pbnB1dFN0cmVhbS5zeW5jKHBlZWtpbmdTdHJlYW0pO1xuICAgICAgICByZXR1cm4gYm91bmRhcnk7XG4gICAgfVxuXG4gICAgcGFyc2VBcmd1bWVudCgpIHtcbiAgICAgICAgbGV0IG5hbWU7XG4gICAgICAgIGxldCB2YWx1ZTtcblxuICAgICAgICB0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVPcHRpb25hbFdoaXRlc3BhY2UoKTtcbiAgICAgICAgbGV0IHBlZWtpbmdTdHJlYW0gPSB0aGlzLmlucHV0U3RyZWFtLnBlZWsoKTtcbiAgICAgICAgaWYgKHBlZWtpbmdTdHJlYW0uY29uc3VtZVdvcmQoKSAmJiBwZWVraW5nU3RyZWFtLmNvbnN1bWVPcHRpb25hbFdoaXRlc3BhY2UoKSAmJiBwZWVraW5nU3RyZWFtLmNvbnN1bWUoXCI9XCIpKSB7XG4gICAgICAgICAgICAvLyBOYW1lZCBhcmd1bWVudFxuICAgICAgICAgICAgTXVzdCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVXb3JkKCkpO1xuICAgICAgICAgICAgbmFtZSA9IHRoaXMuaW5wdXRTdHJlYW0uY29uc3VtZWQ7XG5cbiAgICAgICAgICAgIE11c3QodGhpcy5pbnB1dFN0cmVhbS5jb25zdW1lT3B0aW9uYWxXaGl0ZXNwYWNlKCkpO1xuICAgICAgICAgICAgTXVzdCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWUoXCI9XCIpKTtcbiAgICAgICAgICAgIE11c3QodGhpcy5pbnB1dFN0cmVhbS5jb25zdW1lT3B0aW9uYWxXaGl0ZXNwYWNlKCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgYW5vbnltb3VzIGFyZ3VtZW50XG5cbiAgICAgICAgLy8gV2UgY2Fubm90IHByb2hpYml0IGVtcHR5IGFyZ3VtZW50cyBieSBjaGVja2luZyBmb3IgaW5wdXQgc3RyZWFtXG4gICAgICAgIC8vIHByb2dyZXNzXG4gICAgICAgIGxldCBib3VuZGFyeSA9IHRoaXMuY29uc3VtZUJvdW5kYXJ5KCkgfHwgbmV3IEJvdW5kYXJ5U3BhY2UoXCIgXCIpO1xuXG4gICAgICAgIGxldCBpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcih0aGlzLmlucHV0U3RyZWFtKTtcblxuICAgICAgICBsb2coXCJwYXJzaW5nIEFyZ3VtZW50XCIsIG5hbWUpO1xuICAgICAgICB2YWx1ZSA9IGludGVycHJldGVyLmludGVsbGlnZW50SW50ZXJwcmV0KGJvdW5kYXJ5KTtcblxuICAgICAgICB0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVPcHRpb25hbFdoaXRlc3BhY2UoKTtcblxuICAgICAgICByZXR1cm4geyBuYW1lLCB2YWx1ZSB9O1xuICAgIH1cblxuICAgIGludGVycHJldEZ1bmN0aW9uQ2FsbChuYW1lKSB7XG4gICAgICAgIGxldCBhcmdzID0gW107XG4gICAgICAgIGFyZ3MuYnlOYW1lID0ge307XG5cbiAgICAgICAgaWYgKHRoaXMuaW5wdXRTdHJlYW0uY29uc3VtZShcIihcIikpIHtcbiAgICAgICAgICAgIC8vIHdlIGhhdmUgYW4gYXJndW1lbnRzIGJsb2NrIGluIHRoaXMgZnVuY3Rpb25cblxuICAgICAgICAgICAgd2hpbGUgKCF0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWUoXCIpXCIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFyZ3VtZW50ID0gdGhpcy5wYXJzZUFyZ3VtZW50KCk7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3VtZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnQubmFtZSkgYXJncy5ieU5hbWVbYXJndW1lbnQubmFtZV0gPSBhcmd1bWVudC52YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWUoXCIsXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWUoXCIpXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dFN0cmVhbS5jcm9hayhcIkV4cGVjdGluZyBjb21tYSBvciBjbG9zaW5nIHBhcmVudGhlc2UgaW4gYW4gYXJndW1lbnQgbGlzdFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbGxvdyBhIHNwYWNlIGJldHdlZW4gdGhlIGZ1bmN0aW9uIGNhbGwgYW5kIHRoZSBmaXJzdCBib3VuZGFyeTpcbiAgICAgICAgLy8gLmZvbyB7IH0gaXMgZXF1aXZhbGVudCB0byAuZm9ve31cbiAgICAgICAgTXVzdCh0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVPcHRpb25hbFdoaXRlc3BhY2UoKSk7XG4gICAgICAgIGxldCB3aGl0ZXNwYWNlQm91bmRhcnkgPSB0aGlzLmlucHV0U3RyZWFtLmNvbnN1bWVkID9cbiAgICAgICAgICAgIG5ldyBCb3VuZGFyeVNwYWNlKHRoaXMuaW5wdXRTdHJlYW0uY29uc3VtZWQpIDogbnVsbDtcbiAgICAgICAgbGV0IGJvdW5kYXJ5ID0gdGhpcy5jb25zdW1lQm91bmRhcnkodGhpcy5pbnB1dFN0cmVhbS5jb25zdW1lZCkgfHwgd2hpdGVzcGFjZUJvdW5kYXJ5O1xuXG4gICAgICAgIGlmICghYm91bmRhcnkpIHRoaXMuaW5wdXRTdHJlYW0uY3JvYWsoXCJNaXNzaW5nIGZ1bmN0aW9uIGNhbGwgYm91bmRhcnlcIik7XG5cbiAgICAgICAgdGhpcy5jYWxsRnVuY3Rpb24obmFtZSwgYm91bmRhcnksIGFyZ3MpO1xuICAgICAgICB0aGlzLmlucHV0U3RyZWFtLnNhd0Z1bmN0aW9uQ2FsbCA9IHRydWU7XG4gICAgfVxuXG4gICAgaW50ZWxsaWdlbnRJbnRlcnByZXQoYm91bmRhcnkpIHtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJ5LmlzUXVvdGUoKSA/XG4gICAgICAgICAgICB0aGlzLmludGVycHJldEZsYXQoYm91bmRhcnkpIDpcbiAgICAgICAgICAgIHRoaXMuaW50ZXJwcmV0UmVjdXJzaXZlKGJvdW5kYXJ5KTtcbiAgICB9XG5cbiAgICBpbnRlcnByZXRSZWN1cnNpdmUoYm91bmRhcnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJwcmV0KGJvdW5kYXJ5KTtcbiAgICB9XG5cbiAgICBpbnRlcnByZXRGbGF0KGJvdW5kYXJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVycHJldChib3VuZGFyeSwgZmFsc2UpO1xuICAgIH1cbn0iXX0=