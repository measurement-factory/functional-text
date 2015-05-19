/*eslint-env node*/
import {install} from "source-map-support";
install();
import carefulGenerator from "./careful-fxt-generator";
import InputStream from "../interpreter/InputStream";
import Interpreter from "../interpreter/Interpreter";
import prettyHrTime from "pretty-hrtime";

import fs from "fs";

function testGenerator(generator) {
    let overallStartTime = process.hrtime();
    let {text: input, duration: generationDuration } = generator();


    fs.writeFileSync("/tmp/in.txt", input);
    let inputStream = new InputStream(input);
    let interpreter = new Interpreter(inputStream);

    let startTime = process.hrtime();
    let result = interpreter.interpret();
    let processingDuration = process.hrtime(startTime);

    fs.writeFileSync("/tmp/out.txt", result);

    console.log([
        [ "input length:", input.length ],
        [ "output length:", result.length ],
        [ "generation duration:", prettyHrTime(generationDuration) ],
        [ "processing duration:", prettyHrTime(processingDuration) ],
        [ "total duration:", prettyHrTime(process.hrtime(overallStartTime)) ]
    ].map(line => line.join(" ")).join("\n"), "\n");
}

testGenerator(carefulGenerator);