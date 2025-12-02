import fs from "fs";
import path from "path";
import { __dirname } from "./utils/path.js";

// load once
const dictPath = path.join(__dirname, "../../data/words_dictionary.json");
const wordsJson = JSON.parse(fs.readFileSync(dictPath, "utf8"));
const words = Object.keys(wordsJson);

// prepare sorted lowercase array for binary-like search
const wordsSorted = words.slice().sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

// find first index with prefix using binary search
function lowerBoundPrefix(arr, prefix) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const slice = arr[mid].slice(0, prefix.length).toLowerCase();
        if (slice < prefix) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

export function searchByPrefix(prefix, config = {}) {
    const p = prefix.toLowerCase();
    if (!p) return [];

    const minWordLength = 2;

    // find start index
    const start = lowerBoundPrefix(wordsSorted, p);

    const out = [];
    for (let i = start; i < wordsSorted.length; i++) {
        const w = wordsSorted[i];
        if (w.slice(0, p.length).toLowerCase() !== p) break;

        if (w.length >= minWordLength) out.push(w);
    }

    // optional: stable lightweight sort (by length ascending)
    out.sort((a, b) => a.length - b.length);
    return out;
}
