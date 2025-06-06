import { encrypt } from './funcs';
import { characterFrequency, bigramFrequency, trigramFrequency, bigrams } from './data';
import { en_all_dict } from './en_all';
import { en_basic_dict } from './en_basic';

export function calcFrequency(text: string, nums: number = 1): Record<string, number> {
    const frequency: Record<string, number> = {};
    const textLength = text.length;
    let totalChars = 0;

    // 统计连续 nums个字符的频率
    for (let i = 0; i < textLength - nums + 1; i++) {
        const substring = text.slice(i, i + nums).toLowerCase();
        if (/^[a-z]+$/.test(substring)) { // 只统计字母
            frequency[substring] = (frequency[substring] || 0) + 1;
            totalChars++;
        }
    }

    for (const char in frequency) {
        frequency[char] = Math.round((frequency[char] / totalChars) * 10000) / 100; // 保留两位小数
    }

    return frequency;
}

export function getSuggestionByFrequency(ciphertext: string, key: string, nums: number = 1) {
    if (!ciphertext || !key) {
        throw new Error('请提供密文和密钥');
    }
    const _key = key.toLowerCase().trim();
    if (_key.length !== 26 || !/^[a-z\-]+$/.test(_key)) {
        throw new Error('密钥格式不正确');
    }

    if (nums < 1 || nums > 3) {
        throw new Error('nums 参数必须在 1 到 3 之间');
    }

    const frequency = calcFrequency(ciphertext, nums);
    const sortedFrequency = Object.entries(frequency).sort((a, b) => b[1] - a[1]);

    const refFrequency = {
        1: characterFrequency,
        2: bigramFrequency,
        3: trigramFrequency
    }[nums] as Record<string, number>;
    const refSortedFrequency = Object.entries(refFrequency).sort((a, b) => b[1] - a[1]);

    let target: string | null = null;
    let targetIndex = -1;
    let basePossible = 1;
    let lastPossible = 1;
    for (let i = 0; i < refSortedFrequency.length; i++) {
        let refSort = refSortedFrequency[i][0];
        let unknownChars = 0;
        for (let j = 0; j < refSort.length; j++) {
            if (!_key.includes(refSort[j])) {
                unknownChars++;
            }
        }
        if (unknownChars > 0) {
            target = refSort;
            targetIndex = i;
            basePossible *= Math.pow(0.9, unknownChars);
            break;
        }
        if (refSortedFrequency[i][1] / lastPossible >= 0.9) {
            basePossible *= 0.8;
        }
        lastPossible = refSortedFrequency[i][1];
    }

    if (!target) {
        return [];
    }

    const possibleCipher = [];
    let possibleIndex = -1;
    for (let i = 0; i < sortedFrequency.length; i++) {
        let cipherSort = sortedFrequency[i][0];
        let flag = true;
        for (let j = 0; j < cipherSort.length; j++) {
            if (_key[cipherSort.charCodeAt(j) - 97] !== '-' && _key[cipherSort.charCodeAt(j) - 97] !== target[j]) {
                flag = false;
                break;
            }
            if (_key.includes(target[j]) && _key[target[j].charCodeAt(0) - 97] !== target[j]) {
                flag = false;
                break;
            }
        }
        if (possibleIndex !== -1) {
            if (Math.abs(sortedFrequency[i][1] - sortedFrequency[possibleIndex][1]) > 0.15 * sortedFrequency[possibleIndex][1]) {
                break;
            }
            if (flag) {
                possibleCipher.push(i);
            }
        }
        else {
            if (flag) {
                possibleCipher.push(i);
                possibleIndex = i;
            }
        }
    }

    const possMulti = Math.pow(0.8, possibleCipher.length);

    const possibleSuggestions = possibleCipher.map(cipherIndex => {
        const newKey = _key.split('');
        const cipher = sortedFrequency[cipherIndex][0];
        for (let j = 0; j < target.length; j++) {
            newKey[cipher.charCodeAt(j) - 97] = target[j];
        }
        const possibility = 100 - Math.abs(sortedFrequency[cipherIndex][1] - refSortedFrequency[targetIndex][1]) / Math.max(sortedFrequency[possibleIndex][1], refSortedFrequency[targetIndex][1]) * 100;
        const change = {} as Record<string, string>;
        for (let j = 0; j < target.length; j++) {
            change[cipher[j]] = target[j];
        }
        return {
            suggestion: `根据字母频率分析，组合 '${cipher}' 频率为 ${sortedFrequency[cipherIndex][1]}%，建议将密钥中的 '${cipher}' 映射为 '${target}'`,
            newKey: newKey.join(''),
            possibility: possibility * basePossible * possMulti,
            change
        };
    });

    return possibleSuggestions;
}

export function getSuggestionByFrequency1(ciphertext: string, key: string) {
    return getSuggestionByFrequency(ciphertext, key, 1);
}

export function getSuggestionByFrequency2(ciphertext: string, key: string) {
    return getSuggestionByFrequency(ciphertext, key, 2);
}

export function getSuggestionByFrequency3(ciphertext: string, key: string) {
    return getSuggestionByFrequency(ciphertext, key, 3);
}

export function getSuggestionByFrequencyAll(ciphertext: string, key: string) {
    const suggestions1 = getSuggestionByFrequency1(ciphertext, key);
    const suggestions2 = getSuggestionByFrequency2(ciphertext, key);
    const suggestions3 = getSuggestionByFrequency3(ciphertext, key);
    const allSuggestions = [];
    if (Array.isArray(suggestions1)) {
        allSuggestions.push(...suggestions1);
    } else {
        allSuggestions.push(suggestions1);
    }
    if (Array.isArray(suggestions2)) {
        allSuggestions.push(...suggestions2);
    } else {
        allSuggestions.push(suggestions2);
    }
    if (Array.isArray(suggestions3)) {
        allSuggestions.push(...suggestions3);
    } else {
        allSuggestions.push(suggestions3);
    }

    // 对于每个建议，判断是否有冲突，有冲突就降概率，如果能印证就提升概率
    for (let i = 0; i < allSuggestions.length; i++) {
        const suggestion = allSuggestions[i];
        for (let j = 0; j < allSuggestions.length; j++) {
            const anotherSuggestion = allSuggestions[j];
            let pts = 0;
            for (const [keyChar, valueChar] of Object.entries(suggestion.change)) {
                if (keyChar in anotherSuggestion.change) {
                    if (anotherSuggestion.change[keyChar] !== valueChar) {
                        pts -= 1;
                    } else {
                        pts += 2;
                    }
                }
            }
            if (pts < 0) {
                suggestion.possibility *= Math.pow(0.8, -pts); // 有冲突，降低概率
            } else if (pts > 0) {
                suggestion.possibility *= Math.pow(1.1, pts); // 有印证，提升概率
                if (suggestion.possibility > 100) {
                    suggestion.possibility = 100; // 确保概率不超过 1
                }
            }
        }
    }
    const sortedSuggestions = allSuggestions.sort((a, b) => b.possibility - a.possibility);
    return sortedSuggestions.slice(0, 5).map(suggestion => ({
        suggestion: suggestion.suggestion,
        newKey: suggestion.newKey,
        possibility: Math.round(suggestion.possibility * 100) / 100, // 保留两位小数
    }));
}

export function checkFormat(cipherWords: string, plainWords: string) {
    // cipherWords 相同字母的位置，plainWords 也必须相同，不同字母的位置，plainWords 也必须不同
    const len = cipherWords.length;

    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (cipherWords[i] === cipherWords[j]) {
                if (plainWords[i] !== plainWords[j]) {
                    return false; // 相同字母位置不同
                }
            } else {
                if (plainWords[i] === plainWords[j]) {
                    return false; // 不同字母位置相同
                }
            }
        }
    }
    return true;
}

export function findMatchWords(cipherWords: string, plainWords: string, r: string = '[a-z]') {
    const words = {} as Record<string, number>;
    const unknownChars = plainWords.split('').filter(char => char === '_').length;
    const regex = new RegExp(`^${plainWords.replace(/_/g, r)}$`, 'i');
    const points = [50, 45, 30, 20, 10]
    let count = 0;
    let dict = [[en_basic_dict, points, 5], [en_all_dict, [], 1]] as Array<[string[], number[], number]>;
    if (plainWords.length === 2) {
        dict = [[bigrams, [], 50]];
    }
    for (const [dictionary, pointArray, pointDefault] of dict) {
        for (const word of dictionary) {
            if (regex.test(word) && checkFormat(cipherWords, word)) {
                words[word] = (words[word] || 0) + pointArray[unknownChars] || pointDefault;
            }
            count++;
        }
    }
    return words;
}

export function getSuggestionByWords(ciphertext: string, key: string) {
    if (!ciphertext || !key) {
        throw new Error('请提供密文和密钥');
    }
    const _key = key.toLowerCase().trim().replace(/\-/g, '_');
    if (_key.length !== 26 || !/^[a-z_]+$/.test(_key)) {
        throw new Error('密钥格式不正确');
    }

    let notInRegExp = "[";
    for (let i = 0; i < _key.length; i++) {
        if (!_key.includes(String.fromCharCode(i + 97))) {
            notInRegExp += String.fromCharCode(i + 97);
        }
    }
    notInRegExp += "]";

    const cipherWords = ciphertext.match(/\b[a-z\-]+\b/g) || [];
    const plaintext = encrypt(ciphertext, _key);
    const plainWords = plaintext.match(/\b[a-z_\-]+\b/g) || [];
    const unknownCharsNum = [];
    for (const word of cipherWords) {
        unknownCharsNum.push(word.split('').filter(char => _key[char.charCodeAt(0) - 97] === '_').length);
    }

    const needToFind = {} as Record<string, string>;
    for (let i = 0; i < cipherWords.length; i++) {
        if (unknownCharsNum[i] > 0) {
            needToFind[cipherWords[i]] = plainWords[i];
        }
    }

    const possibleKey = {} as Record<string, Record<string, number>>;

    let suggestions = [];

    for (const [cipherWord, plainWord] of Object.entries(needToFind)) {
        const cipherChars = cipherWord.split('');
        const possibleWords = findMatchWords(cipherWord, plainWord, notInRegExp);
        if (Object.keys(possibleWords).length === 1) {
            // 直接返回对应的建议为 90%
            const possibleWord = Object.keys(possibleWords)[0];
            const possibleChars = possibleWord.split('');
            const newKey = key.split('');
            for (let j = 0; j < cipherChars.length; j++) {
                const cipherChar = cipherChars[j];
                const plainChar = possibleChars[j];
                if (cipherChar !== '-' && _key[cipherChar.charCodeAt(0) - 97] === '_') {
                    newKey[cipherChar.charCodeAt(0) - 97] = plainChar.toLowerCase();
                }
            }
            suggestions.push({
                suggestion: `根据字典分析，${cipherWord} 仅匹配 ${possibleWord}，建议应用该替换`,
                newKey,
                possibility: 99
            });
        }
        else {
            for (let [possibleWord, weight] of Object.entries(possibleWords)) {
                const possibleChars = possibleWord.split('');
                for (let j = 0; j < cipherChars.length; j++) {
                    const cipherChar = cipherChars[j];
                    const plainChar = possibleChars[j];
                    if (cipherChar !== '-' && _key[cipherChar.charCodeAt(0) - 97] === '_') {
                        if (!possibleKey[cipherChar]) {
                            possibleKey[cipherChar] = {};
                        }
                        possibleKey[cipherChar][plainChar] = (possibleKey[cipherChar][plainChar] || 0) + weight;
                    }
                }
            }
        }
    }

    for (const [cipherChar, plainChars] of Object.entries(possibleKey)) {
        const sortedPlainChars = Object.entries(plainChars).sort((a, b) => b[1] - a[1]);
        if (sortedPlainChars.length > 0) {
            let sum = 0;
            for (const [_, weight] of sortedPlainChars) {
                sum += weight;
            }
            for (const [_, weight] of sortedPlainChars) {
                const possibility = Math.round((weight / sum) * 10000) / 100; // 保留两位小数
                const newKey = key.split('');
                newKey[cipherChar.charCodeAt(0) - 97] = _.toLowerCase();
                suggestions.push({
                    suggestion: `根据字典分析，建议将密钥中的 '${cipherChar}' 映射为 '${_.toLowerCase()}'`,
                    newKey,
                    possibility
                });
            }
        }
    }

    suggestions = suggestions.sort((a, b) => b.possibility - a.possibility).slice(0, 5); // 只返回前5个建议

    return suggestions;
}

export function getSuggestion(ciphertext: string, key: string) {
    if (!ciphertext || !key) {
        throw new Error('请提供密文和密钥');
    }
    const _key = key.toLowerCase().trim(); // 确保密钥是小写字母
    if (_key.length !== 26 || !/^[a-z\-]+$/.test(_key)) {
        throw new Error('密钥格式不正确');
    }

    if (!_key.includes('e')) {
        // 如果密钥中没有 'e'，则根据词频确定最高的
        const frequency = calcFrequency(ciphertext, 1);
        const sortedFrequency = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
        const mostFrequentChar = sortedFrequency[0][0];
        const index = mostFrequentChar.charCodeAt(0) - 97; // 获取最频繁字符的索引
        const newKey = _key.slice(0, index) + 'e' + _key.slice(index + 1); // 替换为 'e'
        const possibility = 100 - Math.abs(sortedFrequency[0][1] - 12.702) / Math.max(sortedFrequency[0][1], 12.702) * 100; // 计算可能性
        return {
            suggestion: `根据字母频率分析，${mostFrequentChar} 频率为 ${sortedFrequency[0][1]}%，建议将 '${mostFrequentChar}' 映射为 'e'`,
            newKey: newKey,
            possibility: Math.round(possibility * 100) / 100 // 保留两位小数
        };
    }

    if (!_key.includes('t') || !_key.includes('h')) {
        const bigramFrequency = calcFrequency(ciphertext, 2);
        const sortedBigramFrequency = Object.entries(bigramFrequency).sort((a, b) => b[1] - a[1]);
        let newKey = _key.split('');
        let suggestion = '';
        let possibility = 0;

        let getTH = false;
        for (const [bigram, freq] of sortedBigramFrequency) {
            if (getTH) {
                break;
            }
            if (freq < 1.5) {
                break;
            }
            if ((_key[bigram.charCodeAt(0) - 97] !== '-' && _key[bigram.charCodeAt(0) - 97] !== 't') ||
                (_key[bigram.charCodeAt(1) - 97] !== '-' && _key[bigram.charCodeAt(1) - 97] !== 'h')) {
                continue;
            }
            else {
                getTH = true;
                newKey[bigram.charCodeAt(0) - 97] = 't';
                newKey[bigram.charCodeAt(1) - 97] = 'h';
                suggestion = `根据双字母频率分析，${bigram} 频率为 ${freq}%，建议将密钥中的 '${bigram}' 映射为 'th'`;
                possibility = 100 - Math.abs(freq - 3.56) / Math.max(freq, 3.56) * 100; // 计算可能性
                break;
            }
        }

        const trigramFrequency = calcFrequency(ciphertext, 3);
        const sortedTrigramFrequency = Object.entries(trigramFrequency).sort((a, b) => b[1] - a[1]);
        for (const [trigram, freq] of sortedTrigramFrequency) {
            if (getTH) {
                break;
            }
            if (freq < 0.8) {
                break;
            }
            if ((_key[trigram.charCodeAt(0) - 97] !== '-' && _key[trigram.charCodeAt(0) - 97] !== 't') ||
                (_key[trigram.charCodeAt(1) - 97] !== '-' && _key[trigram.charCodeAt(1) - 97] !== 'h') ||
                (_key[trigram.charCodeAt(2) - 97] !== '-' && _key[trigram.charCodeAt(2) - 97] !== 'e')) {
                continue;
            }
            else {
                getTH = true;
                newKey[trigram.charCodeAt(0) - 97] = 't';
                newKey[trigram.charCodeAt(1) - 97] = 'h';
                suggestion = `根据三字母频率分析，${trigram} 频率为 ${freq}%，建议将密钥中的 '${trigram}' 替换为 'the'`;
                possibility = 100 - Math.abs(freq - 1.81) / Math.max(freq, 1.81) * 100; // 计算可能性
                break;
            }
        }
        return {
            suggestion: suggestion,
            newKey: newKey.join(''),
            possibility: Math.round(possibility * 100) / 100 // 保留两位小数
        };
    }

    return getSuggestionByWords(ciphertext, key);
}