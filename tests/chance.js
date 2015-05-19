import seededRandom from "./seeded-random";
import assert from "assert";

// chance(CONSTANT, CONSTANT, [ CONSTANT, value ]);
export default function chance(...args) {
    const totalEvents = 1000;
    let chances = [];
    let specificArgWeight = 0;
    let leftoverArgAmount = 0;

    function addEvent(event, weight) {
        for (let i = 0; i < weight; i++) {
            chances.push(event);
            assert(chances.length < totalEvents * 1.1);
        }
    }

    for (let arg of (args: Array)) {
        if (Array.isArray(arg)) {
            assert(arg.length === 2, "Array argument to chance must be 2 elements long");
            let [event, weight] = arg;
            weight = weight * 10;
            specificArgWeight += weight;
            addEvent(event, weight);
        } else {
            leftoverArgAmount++;
        }
    }

    let leftoverArgWeight = Math.floor((totalEvents - specificArgWeight) / leftoverArgAmount);

    for (let arg of (args: Array)) {
        if (!Array.isArray(arg)) {
            addEvent(arg, leftoverArgWeight);
        }
    }

    assert(chances.length > totalEvents * 0.9);
    assert(chances.length > 0);

    return chances[seededRandom(0, chances.length - 1)];
}