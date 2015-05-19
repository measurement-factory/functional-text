/*eslint-env node*/
import {install} from "source-map-support";
install();
import "babel/polyfill";
import * as functionRegistry from "./functionRegistry";
import InputStream from "./InputStream";
import Interpreter from "./Interpreter";
import sass from "node-sass";
import fs from "fs";

var input = "";
process.stdin.on("readable", function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        input += chunk;
    }
});

process.stdin.on("end", function() {
    var inputStream = new InputStream(input);
    var interpreter = new Interpreter(inputStream);

    functionRegistry.register("import", function (callName, args, functionBody, interpreter) {
        if (!args.byName.file) interpreter.inputStream.croak("Expected file argument for `.${callName}`");

        let inputStream = new InputStream(fs.readFileSync(args.byName.file).toString());
        let fileInterpreter = new Interpreter(inputStream);

        return fileInterpreter.interpretRecursive();
    });

    functionRegistry.register("importRaw", function (callName, args, functionBody, interpreter) {
        if (!args.byName.file) interpreter.inputStream.croak(`Expected file argument for \`.${callName}\``);

        return fs.readFileSync(args.byName.file).toString();
    });

    functionRegistry.register("link", function (callName, args, functionBody, interpreter) {
        if (!args.byName.href) interpreter.inputStream.croak(`Expected href argument for \`.${callName}\``);
        return interpreter.callFunctionWithBody("a", args, functionBody);
    });

    functionRegistry.register("importSCSS", function (callName, args, functionBody, interpreter) {
        if (!args.byName.file) interpreter.inputStream.croak(`Expected file argument for \`.${callName}\``);
        let css = sass.renderSync({data: fs.readFileSync(args.byName.file).toString()}).css.toString();

        return `<style>${css}</style>`;
    });

    functionRegistry.register("pageTitle", function (callName, args, functionBody) {
        return `<div class="pageTitle">${functionBody}</div>`;
    });

    function registerAlias(from, to) {
        functionRegistry.register(from, function (callName, args, functionBody, interpreter) {
            return interpreter.callFunctionWithBody(to, args, functionBody);
        });
    }

    registerAlias("paragraph", "p");
    registerAlias("emphasis", "em");
    registerAlias("bold", "b");

    var result = interpreter.interpret();

    process.stdout.write(result);
});
