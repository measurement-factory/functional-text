import ParsedItem from "./ParsedItem";

export default class TextItem extends ParsedItem {
    constructor(string) {
        super({ children: [] });
        this.type = "string";
        this.content = string;
    }
    toString() {
        return global.JSON_OUTPUT ? JSON.stringify(this, undefined, 4) : this.content;
    }
}