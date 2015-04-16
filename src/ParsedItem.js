export default class ParsedItem {
    constructor({children}) {
        this.type = "parsed-item";
        this.children = children;
    }
    toString() {
        return global.JSON_OUTPUT ? JSON.stringify(this, undefined, 4) : this.children.join("");
    }
}