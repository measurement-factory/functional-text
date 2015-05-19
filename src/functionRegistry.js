let functions = {};
export function register(name, func) {
    if (functions[name]) throw new Error("Already registered " + name);
    functions[name] = func;
}

export function get(name) {
    if (!functions[name]) throw new Error("Getting unregistered function");
    return functions[name];
}

export function exists(name) {
    return functions[name] !== undefined;
}