import {assert} from "chai";
import {describe, it} from "mocha";
import InputStream from "../InputStream";
import Interpreter from "../Interpreter";

// XXX: should define easy functions (.a) for test cases in this file

function mustInterpret(input, expectedOutput) {
    it(`'${input}' => '${expectedOutput}'`.replace(/\n/g, "\\n"), function() {
        let inputStream = new InputStream(input);
        let interpreter = new Interpreter(inputStream);
        assert.equal(interpreter.interpret(), expectedOutput);
    });
}

function mustReject(input, expectedError) {
    it(`Should reject input '${input}' with '${expectedError}'`.replace(/\n/g, "\\n"), function() {
        let inputStream = new InputStream(input);
        let interpreter = new Interpreter(inputStream);
        assert.throws(() => interpreter.interpret(), expectedError);
    });
}

describe("Simple text", function() {
    mustInterpret("test", "test");
});

describe("Word boundary", function() {
    mustInterpret(".a b", "<a>b</a>");
    mustInterpret(".a b ", "<a>b</a> ");
    mustInterpret(".a baaa ", "<a>baaa</a> ");
    mustInterpret(".a b aaa ", "<a>b</a> aaa ");
    mustInterpret(".a ", "<a></a>");
});

describe("End of line boundary", function() {
    mustInterpret(".a: b", "<a>b</a>");
    mustInterpret(".a: b ", "<a>b </a>");
    mustInterpret(".a: ", "<a></a>");

    mustReject(".a:b", /end with whitespace/);
});

describe("End of paragraph boundary", function() {
    mustInterpret(".a:: b", "<a>b</a>");
    mustInterpret(".a:: b ", "<a>b </a>");
    mustInterpret(".a:: ", "<a></a>");

    mustReject(".a::b", /end with whitespace/);
});