import { reverseKey, generateRandomKey } from '../src/utils/funcs';
import { describe, it, expect } from 'vitest';

describe('reverseKey', () => {
    // 少于 26 个字母的 key
    it('should throw an error for keys with less than 26 letters', () => {
        expect(() => reverseKey('abcde')).toThrow('密钥长度必须是 26 个字符');
        expect(() => reverseKey('中文呢，中文也是啊，我要刚好凑26个字符，你觉得呢？？')).toThrow('密钥长度必须是 26 个字符');
    });

    // 多于 26 个字母的 key
    it('should throw an error for keys with more than 26 letters', () => {
        expect(() => reverseKey('abcdefghijklmnopqrstuvwxyz1')).toThrow('密钥长度必须是 26 个字符');
        expect(() => reverseKey('abcdefghijklmnopqrstuvwxyzABC')).toThrow('密钥长度必须是 26 个字符');
    });

    // 包含非字母字符的 key
    it('should throw an error for keys with non-letter characters', () => {
        expect(() => reverseKey('abcdefghijklmnopqrstuvwxy1')).toThrow('密钥必须只包含英文字母');
        expect(() => reverseKey('@bcdefghijklmnopqrstuvwxyz')).toThrow('密钥必须只包含英文字母');
        expect(() => reverseKey('ab\'defghij$lmnopqrs()[]xy"')).toThrow('密钥必须只包含英文字母');
    });

    // 重复字母的 key
    it('should throw an error for keys with repeated letters', () => {
        expect(() => reverseKey('abcdeabcdeabcdeabcdeabcdef')).toThrow('密钥必须是英文字母的排列，每个字母只能出现一次');
        expect(() => reverseKey('aabbccddeeffgghhiijjkkllmm')).toThrow('密钥必须是英文字母的排列，每个字母只能出现一次');
        expect(() => reverseKey('abcdefghijklmnopqrstuvwxyA')).toThrow('密钥必须是英文字母的排列，每个字母只能出现一次');
    });

    // 恒等变换
    it('should return the same key for the identity transformation', () => {
        const key = 'abcdefghijklmnopqrstuvwxyz';
        expect(reverseKey(key)).toBe(key);
    });

    // 逆向映射的 key
    it('should return the correct reversed key for a valid key', () => {
        const key = 'zyxwvutsrqponmlkjihgfedcba';
        expect(reverseKey(key)).toBe(key);
    });

    // 多个正常的 key 测试
    it('should return the correct reversed key for various valid keys', () => {
        const keys = [
            'nuayxkczgqdehovsribmftwlpj',
            'lnvhatmqzuoeixjcprfdgsbwky',
            'upejzgayhsixkwrmbcfqldonvt',
            'jauwhncsrfmxbvlekoqztdipyg',
            'umcznwjrbyoxikatdvheqlfpgs',
            'qwertyuiopasdfghjklzxcvbnm'
        ];
        const expectedReversedKeys = [
            'csgkluimrzfxtanyjqpvbowedh',
            'ewptlsudmoyagbkqhrvfjcxnzi',
            'gqrvcsfikdmupxwbtojzaynlhe',
            'bmgvpjzewaqokfrxsihucndlyt',
            'oicqtwysmgnvbekxuhzparfljd',
            'kxvmcnophqrszyijadlegwbuft'
        ];

        keys.forEach((key, index) => {
            expect(reverseKey(key)).toBe(expectedReversedKeys[index]);
        });
    });
});

describe('randomKey', () => {
    it('should generate a key with 26 unique lowercase letters', () => {
        const key = generateRandomKey();
        expect(key.length).toBe(26);
        const uniqueChars = new Set(key.split(''));
        expect(uniqueChars.size).toBe(26);
        expect(/^[a-z]+$/.test(key)).toBe(true); // 确保只包含小写字母
    });

    it('should generate different keys on multiple calls', () => {
        const keys = new Set();
        for (let i = 0; i < 100; i++) {
            keys.add(generateRandomKey());
        }
        expect(keys.size).toBeGreaterThan(1); // 至少生成了两个不同的 key
    });
});