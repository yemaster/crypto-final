import { encrypt } from "../src/utils/funcs";
import { describe, it, expect } from 'vitest';

describe('encrypt', () => {
    it('should throw an error if plaintext or key is not provided', () => {
        expect(() => encrypt('', 'abcdefghijklmnopqrstuvwxyz')).toThrow('请提供明文和密钥');
        expect(() => encrypt('Hello, World!', '')).toThrow('请提供明文和密钥');
    });

    it('should throw an error if key is not 26 characters long', () => {
        expect(() => encrypt('Hello, World!', 'abcde')).toThrow('密钥长度必须是 26 个字符');
        expect(() => encrypt('Hello, World!', 'abcdefghijklmnopqrstuvwxyz@')).toThrow('密钥长度必须是 26 个字符');
    });

    it('should encrypt plaintext using the provided key', () => {
        const plainTexts = [
            'A app1e a d4y! K3eps 7he d0ct0r away.',
            'Wh4t 1s th3 m3aning 0f l1fe?',
            'Th3 qu1ck br0wn f0x jumps 0v3r th3 lazy d0g.',
            'H3ll0, W0rld! H0w 4r3 y0u t0d4y?',
            'L3t\'s m4k3 th1ngs 3v3n m0r3 1nt3r3sting!',
            '@@@!!!AAMSMADSBUIenkwebfsdfJBUYODHn7iyaufnmdifbafuiMSDAKSD',
            'i Lov3 Y0u!'
        ]

        const keys = [
            'oezraxjfwsymgtCupibnqhkldv',
            'lrhyfdomjgpIstnakxbwQezuvc',
            'fdhouLaikrtjcgvpywxqnzmesb',
            'lnxebkwdgqjiovTumchsfpyRaz',
            'rzvkfjdcwuYnmpsleigThaoBxq',
            'phyeugkBqzjnwfxoslamvtDcri',
            '--------我-----------------'
        ]

        const expectedResults = [
            'O ouu1a o r4d! Y3aub 7fa r0zn0i okod.',
            'Zm4w 1b wm3 s3ltjto 0d i1df?',
            'Qi3 yn1ht dw0mg l0e rncpx 0z3w qi3 jfbs o0a.',
            'D3ii0, Y0cie! D0y 4c3 a0f s0e4a?',
            "N3t'g m4y3 tc1pdg 3a3p m0i3 1pt3i3gtwpd!",
            '@@@!!!PPWAWPEAHVQufjduhgaegZHVRXEBf7qrpvgfweqghpgvqWAEPJAE',
            '我 ---3 -0-!'
        ]

        for (let i = 0; i < plainTexts.length; i++) {
            const result = encrypt(plainTexts[i], keys[i]);
            expect(result).toBe(expectedResults[i]);
        }
    });

    const dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!@#$%^&*()_+[]{}|;:,.<>?';
    const largePlaintext = dict.repeat(10000); // Repeat the dictionary to create a large plaintext
    const key = 'abcdefghijklmnopqrstuvwxyz';
    const expectedCiphertext = dict.repeat(10000);
    
    it('should handle large plaintext', () => {
        const result = encrypt(largePlaintext, key);
        expect(result).toBe(expectedCiphertext);
    });
});