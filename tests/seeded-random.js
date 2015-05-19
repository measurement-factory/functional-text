import seedrandom from "seedrandom";
let seed = 1;
let rng = seedrandom(seed);
export default function seededRandom(min, max) {
    return Math.round(min + rng() * (max - min));
}