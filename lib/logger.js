/*eslint-env node*/

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = log;

function log() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    if (process.env.DEBUG) {
        var str = args.join(" ");
        if (str.startsWith("\n")) str = str.slice(1);
        var date = new Date();
        var dateStr = "" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
        console.log("[ " + dateStr + " ] " + str);
    }
}

module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztxQkFFd0IsR0FBRzs7QUFBWixTQUFTLEdBQUcsR0FBVTtzQ0FBTixJQUFJO0FBQUosWUFBSTs7O0FBQy9CLFFBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUU7QUFDbkIsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixZQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsWUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN0QixZQUFJLE9BQU8sUUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEFBQUUsQ0FBQztBQUN2RyxlQUFPLENBQUMsR0FBRyxRQUFNLE9BQU8sV0FBTSxHQUFHLENBQUcsQ0FBQztLQUN4QztDQUNKIiwiZmlsZSI6ImxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qZXNsaW50LWVudiBub2RlKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbG9nKC4uLmFyZ3MpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuREVCVUcpIHtcbiAgICAgICAgbGV0IHN0ciA9IGFyZ3Muam9pbihcIiBcIik7XG4gICAgICAgIGlmIChzdHIuc3RhcnRzV2l0aChcIlxcblwiKSkgc3RyID0gc3RyLnNsaWNlKDEpO1xuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxldCBkYXRlU3RyID0gYCR7ZGF0ZS5nZXRIb3VycygpfToke2RhdGUuZ2V0TWludXRlcygpfToke2RhdGUuZ2V0U2Vjb25kcygpfS4ke2RhdGUuZ2V0TWlsbGlzZWNvbmRzKCl9YDtcbiAgICAgICAgY29uc29sZS5sb2coYFsgJHtkYXRlU3RyfSBdICR7c3RyfWApO1xuICAgIH1cbn0iXX0=