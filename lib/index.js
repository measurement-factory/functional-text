"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = run;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _Interpreter2 = require("./Interpreter");

var _Interpreter3 = _interopRequireDefault(_Interpreter2);

var _InputStream2 = require("./InputStream");

var _InputStream3 = _interopRequireDefault(_InputStream2);

var _Interpreter4 = _interopRequireDefault(_Interpreter2);

exports.Interpreter = _Interpreter4["default"];

var _InputStream4 = _interopRequireDefault(_InputStream2);

exports.InputStream = _InputStream4["default"];

var _interpreterUtils = _interopRequireWildcard(_Interpreter2);

exports.interpreterUtils = _interpreterUtils;

var _functionRegistry2 = require("./functionRegistry");

var _functionRegistry = _interopRequireWildcard(_functionRegistry2);

exports.functionRegistry = _functionRegistry;

function run(input) {
    var inputStream = new _InputStream3["default"](input);
    var interpreter = new _Interpreter3["default"](inputStream);

    return interpreter.interpret();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztxQkFRd0IsR0FBRzs7Ozs7OzRCQVJILGVBQWU7Ozs7NEJBQ2YsZUFBZTs7Ozs7O1FBRWhDLFdBQVc7Ozs7UUFDWCxXQUFXOzs7O1FBQ04sZ0JBQWdCOztpQ0FDTSxvQkFBb0I7Ozs7UUFBMUMsZ0JBQWdCOztBQUViLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUMvQixRQUFJLFdBQVcsR0FBRyw2QkFBZ0IsS0FBSyxDQUFDLENBQUM7QUFDekMsUUFBSSxXQUFXLEdBQUcsNkJBQWdCLFdBQVcsQ0FBQyxDQUFDOztBQUUvQyxXQUFPLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztDQUNsQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJbnRlcnByZXRlciBmcm9tIFwiLi9JbnRlcnByZXRlclwiO1xuaW1wb3J0IElucHV0U3RyZWFtIGZyb20gXCIuL0lucHV0U3RyZWFtXCI7XG5cbmV4cG9ydCBJbnRlcnByZXRlciBmcm9tIFwiLi9JbnRlcnByZXRlclwiO1xuZXhwb3J0IElucHV0U3RyZWFtIGZyb20gXCIuL0lucHV0U3RyZWFtXCI7XG5leHBvcnQgKiBhcyBpbnRlcnByZXRlclV0aWxzIGZyb20gXCIuL0ludGVycHJldGVyXCI7XG5leHBvcnQgKiBhcyBmdW5jdGlvblJlZ2lzdHJ5IGZyb20gXCIuL2Z1bmN0aW9uUmVnaXN0cnlcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcnVuKGlucHV0KSB7XG4gICAgbGV0IGlucHV0U3RyZWFtID0gbmV3IElucHV0U3RyZWFtKGlucHV0KTtcbiAgICBsZXQgaW50ZXJwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIoaW5wdXRTdHJlYW0pO1xuXG4gICAgcmV0dXJuIGludGVycHJldGVyLmludGVycHJldCgpO1xufSJdfQ==