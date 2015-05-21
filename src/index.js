import Interpreter from "./Interpreter";
import InputStream from "./InputStream";

export Interpreter from "./Interpreter";
export InputStream from "./InputStream";
export * as functionRegistry from "./functionRegistry";

export default function run(input) {
    let inputStream = new InputStream(input);
    let interpreter = new Interpreter(inputStream);

    return interpreter.interpret();
}