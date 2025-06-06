import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: import.meta.env.VITE_OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true
})

export async function encrypt(plaintext: string, key: string) {
    if (!plaintext || !key) {
        throw new Error('请提供明文和密钥');
    }
    const completion = await client.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: "你是一个单表代换密码的加密助手。你需要接收用户提供的明文和密钥，加密得到密文。你的输出必须只包含密文，不能有任何多余的内容。" },
            { role: "user", content: `这是我的明文：${plaintext}，密钥：${key}。请按照格式给出加密后的密文。` }
        ],
        temperature: 0.3
    });
    const result = completion.choices[0].message.content;
    return (result || "").trim();
}

export async function decrypt(ciphertext: string, key: string) {
    if (!ciphertext || !key) {
        throw new Error('请提供密文和密钥');
    }
    const completion = await client.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: "你是一个单表代换密码的解密助手。你需要接收用户提供的密文和密钥，解密得到明文。你的输出必须只包含明文，不能有任何多余的内容。" },
            { role: "user", content: `这是我的密文：${ciphertext}，密钥：${key}。请按照格式给出解密后的明文。` }
        ],
        temperature: 0.3
    });
    const result = completion.choices[0].message.content;
    return (result || "").trim();
}

export async function suggestion(ciphertext: string) {
    if (!ciphertext) {
        throw new Error('请提供密文');
    }

    const completion = await client.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: "你是一个单表代换密码的解密助手。你需要接收用户提供的密文，猜测每个字母可能的对应关系，给出破译建议。破译建议需要根据字母频率（包括单字母频率，双字母频率，三字母频率），上下文语意甚至暴力破解得到。你的输出必须严格为一个 JSON 的数组，数组的内容为破译建议。" },
            { role: "user", content: `这是我的密文：${ciphertext}。请按照格式给出你的破译建议。` }
        ],
        temperature: 0.3
    });
    const result = completion.choices[0].message.content;

    try {
        const suggestions = JSON.parse(result || '[]');
        if (!Array.isArray(suggestions)) {
            throw new Error('解析破译建议失败！');
        }
        return suggestions;
    } catch (error: any) {
        throw new Error(`解析破译建议失败: ${error.message}`);
    }
}