/*eslint-env node*/
import {install} from "source-map-support";
install();
import "babel/polyfill";
import {functionRegistry, default as parse, interpreterUtils} from "./index";
import fs from "fs";

var input = "";
process.stdin.on("readable", function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        input += chunk;
    }
});

process.stdin.on("end", function() {
    functionRegistry.register("import", function (callName, args, functionBody, interpreter) {
        if (!args.byName.file) interpreter.inputStream.croak("Expected file argument for `.${callName}`");

        return [
            new interpreterUtils.PlainText(
                parse(fs.readFileSync(args.byName.file).toString())
            )
        ];
    });

    functionRegistry.register("importRaw", function (callName, args, functionBody, interpreter) {
        if (!args.byName.file) interpreter.inputStream.croak(`Expected file argument for \`.${callName}\``);

        return [
            new interpreterUtils.PlainText(
                fs.readFileSync(args.byName.file).toString()
            )
        ];
    });


    functionRegistry.register("pageTitle", function (callName, args, functionBody) {
        return [
            new interpreterUtils.HTMLOpen(`<div class="pageTitle">`),
            ...functionBody,
            new interpreterUtils.HTMLClose(`div`)
        ];
    });

    functionRegistry.register("link", function (callName, args, functionBody, interpreter) {
        if (!args.byName.href) interpreter.inputStream.croak(`Expected href argument for \`.${callName}\``);
        return interpreter.callFunctionWithBody("a", args, functionBody);
    });

    function registerAlias(from, to) {
        functionRegistry.register(from, function (callName, args, functionBody, interpreter) {
            return interpreter.callFunctionWithBody(to, args, functionBody);
        });
    }

    registerAlias("paragraph", "p");
    registerAlias("emphasis", "em");
    registerAlias("bold", "b");

    let parsedInput = parse(input);
    process.stdout.write(JSON.stringify(parsedInput, null, 4));
    process.stdout.write("\n\n");
    process.stdout.write(`"""\n${parsedInput.toString()}\n"""\n`);
});
