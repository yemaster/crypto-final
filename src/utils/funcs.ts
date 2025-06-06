/**
 * 计算 key 的逆向映射
 * @param key key 字符串，包含 26 个小写字母，表示原始密钥
 * @returns 逆向映射的 key 字符串
 */
export function reverseKey(key: string): string {
    // 检查 key 是否为 26 个小写字母
    if (key.length !== 26) {
        throw new Error('密钥长度必须是 26 个字符');
    }

    key = key.toLowerCase(); // 确保密钥是小写字母

    if (!/^[a-z]+$/.test(key)) {
        throw new Error('密钥必须只包含英文字母');
    }

    // 必须每个字母都出现一次
    const letterSet = new Set(key);
    if (letterSet.size !== 26) {
        throw new Error('密钥必须是英文字母的排列，每个字母只能出现一次');
    }

    const newKeyDict: { [key: string]: string } = {};
    for (let i = 0; i < key.length; i++) {
        const char = key[i];
        if (char >= 'a' && char <= 'z') {
            newKeyDict[char] = String.fromCharCode(97 + i)
        }
    }

    let reversedKey = '';
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        reversedKey += newKeyDict[char] || char;
    }
    return reversedKey;
}

/**
 * 随机生成一个包含 26 个小写字母的 key 字符串
 * @returns 一个随机生成的 key 字符串，包含 26 个小写字母
 */
export function generateRandomKey(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const shuffled = letters.split('').sort(() => Math.random() - 0.5);
    return shuffled.join('');
}

/**
 * 单表替换加密函数
 * @param plaintext 明文 
 * @param key 密钥
 * @returns 加密的密文
 */
export function encrypt(plaintext: string, key: string): string {
    if (!plaintext || !key) {
        throw new Error('请提供明文和密钥');
    }
    
    const _key = key.toLowerCase(); // 确保密钥是小写字母
    if (_key.length !== 26) {
        throw new Error('密钥长度必须是 26 个字符');
    }
    if (!/^[a-z]+$/.test(_key)) {
        throw new Error('密钥必须只包含英文字母');
    }

    const _plaintext = plaintext;
    let ciphertext = '';

    for (const char of _plaintext) {
        if (char >= 'a' && char <= 'z') {
            const index = char.charCodeAt(0) - 97;
            ciphertext += _key[index];
        } else if (char >= 'A' && char <= 'Z') {
            const index = char.charCodeAt(0) - 65;
            ciphertext += _key[index].toUpperCase(); // 保持大写字母
        }
        else {
            ciphertext += char; // 保持非字母字符不变
        }
    }

    return ciphertext;
}

/**
 * 解密函数，使用逆置换密钥进行解密
 * @param ciphertext 密文
 * @param key 密钥
 * @returns 解密后的明文
 */
export function decrypt(ciphertext: string, key: string): string {
    if (!ciphertext || !key) {
        throw new Error('请提供密文和密钥');
    }
    const _key = key.toLowerCase(); // 确保密钥是小写字母
    if (_key.length !== 26 || !/^[a-z]+$/.test(_key)) {
        throw new Error('密钥必须是包含 26 个小写字母的字符串');
    }
    const newKey = reverseKey(key); // 逆置换密钥
    
    return encrypt(ciphertext, newKey); // 使用逆置换密钥进行解密
}