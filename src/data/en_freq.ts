export const characterFrequency = {
    "a": 8.167,
    "b": 1.492,
    "c": 2.782,
    "d": 4.253,
    "e": 12.702,
    "f": 2.228,
    "g": 2.015,
    "h": 6.094,
    "i": 6.966,
    "j": 0.153,
    "k": 0.772,
    "l": 4.025,
    "m": 2.406,
    "n": 6.749,
    "o": 7.507,
    "p": 1.929,
    "q": 0.095,
    "r": 5.987,
    "s": 6.327,
    "t": 9.056,
    "u": 2.758,
    "v": 0.978,
    "w": 2.360,
    "x": 0.150,
    "y": 1.974,
    "z": 0.074,
}

export const bigramFrequency = {
    "th": 3.56,
    "he": 3.07,
    "in": 2.43,
    "er": 2.05,
    "an": 1.99,
    "re": 1.85,
    "on": 1.76,
    "at": 1.49,
}

export const trigramFrequency = {
    "the": 1.81,
    "and": 0.73,
    "tha": 0.33,
    "ent": 0.42,
    "ing": 0.72,
    "ion": 0.42,
    "tio": 0.31,
    "for": 0.34
}

export function getCharacterFrequency(nums: number): {[key: string]: number} {
    switch (nums) {
        case 1:
            return characterFrequency;
        case 2:
            return bigramFrequency;
        case 3:
            return trigramFrequency;
        default:
            throw new Error("Invalid frequency type. Use 1 for character, 2 for bigram, or 3 for trigram.");
    }
}