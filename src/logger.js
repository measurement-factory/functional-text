/*eslint-env node*/

export default function log(...args) {
    if (process.env.DEBUG) {
        let str = args.join(" ");
        if (str.startsWith("\n")) str = str.slice(1);
        let date = new Date();
        let dateStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
        console.log(`[ ${dateStr} ] ${str}`);
    }
}