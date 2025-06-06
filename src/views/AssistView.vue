<script setup lang="ts">
import { NInput, NGrid, NGridItem, NCard, NForm, NFormItem, NButton, NAlert, NTabs, NTab, NTable, NScrollbar, NInputGroup, NIcon, NPopover, NFlex, NList, NListItem, NThing, NTag, NResult } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useFormStore } from '../stores/formStore'
import {
    ShuffleOutline,
    TrashBinOutline,
} from '@vicons/ionicons5'
import { ref, onMounted, computed } from 'vue'

import Chart from 'chart.js/auto';

import { getCharacterFrequency } from '../utils/data'
import { calcFrequency, getSuggestion, getSuggestionByFrequencyAll, getSuggestionByWords } from '../utils/analyser'

const message = useMessage()
const formStore = useFormStore()

const freqCanvas = ref<HTMLCanvasElement | null>(null)
const originCanvas = ref<HTMLCanvasElement | null>(null)

const model = ref({
    plaintext: '',
    ciphertext: formStore.ciphertext
})

const key = ref(Array.from({ length: 26 }, () => ""));

function reverseKey() {
    const newKeyDict: { [key: string]: string } = {};
    for (let i = 0; i < key.value.length; i++) {
        const char = key.value[i];
        if (char >= 'a' && char <= 'z') {
            newKeyDict[char] = String.fromCharCode(97 + i);
        }
    }
    let reversedKeyArray = Array(26).fill('');
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        reversedKeyArray[i] = newKeyDict[char] || '';
    }
    key.value = reversedKeyArray;
    message.success('已逆置换密钥');
}

function updateCiphertext() {
    formStore.setCiphertext(model.value.ciphertext);
}

class AnalyserService {
    static resetKey() {
        key.value = Array.from({ length: 26 }, () => "");
        message.success('已重置密钥');
    }
}

let chart: Chart | null = null;
let originChart: Chart | null = null;
const nowFrequencyLevel = ref(0);

function drawFrequencyChart(index: number) {
    const ctx = freqCanvas.value?.getContext('2d');
    const originCtx = originCanvas.value?.getContext('2d');
    if (!ctx) return;
    if (!originCtx) return;

    let statLength = 1;
    if (index === 5) {
        statLength = 2; // 如果是5，则统计连续两个字符的频率
    } else if (index === 6) {
        statLength = 3; // 如果是6，则统计连续三个字符的频率
    }
    const frequency = calcFrequency(model.value.ciphertext, statLength);
    const sortedFrequency = Object.entries(frequency)
        .filter(([_, freq]) => {
            if (index === 1) return freq > 10;
            if (index === 2) return (freq > 5) && (freq <= 10);
            if (index === 3) return (freq > 1) && (freq <= 5);
            if (index === 4) return (freq <= 1) && (freq > 0);
            if (index === 5) return freq > 1;
            if (index === 6) return freq > 0.5;
            else return freq > 0; // 默认显示所有字符频率大于0的
        })
        .sort((a, b) => b[1] - a[1]);
    let characterFrequency = getCharacterFrequency(statLength);
    const sortedOriginalFrequency = Object.entries(characterFrequency)
        .filter(([_, freq]) => {
            if (index === 1) return freq > 10;
            if (index === 2) return (freq > 5) && (freq <= 10);
            if (index === 3) return (freq > 1) && (freq <= 5);
            if (index === 4) return (freq <= 1) && (freq > 0);
            if (index === 5) return freq > 1;
            if (index === 6) return freq > 0.3;
            else return freq > 0; // 默认显示所有字符频率大于0的
        })
        .sort((a, b) => b[1] - a[1]);
    const labels = sortedFrequency.map(([char]) => char);
    const data = sortedFrequency.map(([_, freq]) => freq);
    if (chart) {
        chart.destroy(); // 销毁旧的图表实例
    }
    if (originChart) {
        originChart.destroy(); // 销毁旧的参考图表实例
    }
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '字母频率 (%)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            }
        }
    });
    const originLabels = sortedOriginalFrequency.map(([char]) => char);
    const originData = sortedOriginalFrequency.map(([_, freq]) => freq);
    originChart = new Chart(originCtx, {
        type: 'bar',
        data: {
            labels: originLabels,
            datasets: [{
                label: '参考字母频率 (%)',
                data: originData,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            }
        }
    });
}

function updateFrequencyChart(level: number | string) {
    level = Number(level);
    if (isNaN(level) || level < 0 || level > 6) {
        level = 0;
    }
    nowFrequencyLevel.value = level;
    if (freqCanvas.value) {
        const ctx = freqCanvas.value.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, freqCanvas.value.width, freqCanvas.value.height);
        }
    }
    drawFrequencyChart(level);
}

const textComparison = computed(() => {
    const cipherLinesTmp = model.value.ciphertext.split('\n');
    const cipherLines = []
    for (const line of cipherLinesTmp) {
        let trimmedLine = line.trim();
        while (trimmedLine) {
            const part = trimmedLine.slice(0, 50);
            cipherLines.push(part);
            trimmedLine = trimmedLine.slice(50);
        }
    }
    let resHTML = "";

    for (const i of cipherLines) {
        resHTML += `<div class="cipher-line">${i}</div>`;
        let thisLineRes = "";
        for (const c of i) {
            if (c >= 'a' && c <= 'z') {
                const index = c.charCodeAt(0) - 97;
                thisLineRes += key.value[index] || '-'; // 使用密钥映射
            } else if (c >= 'A' && c <= 'Z') {
                const index = c.charCodeAt(0) - 65;
                thisLineRes += (key.value[index] || '-').toUpperCase(); // 保持大写字母
            } else {
                thisLineRes += c; // 保持非字母字符不变
            }
        }
        resHTML += `<div class="plain-line">${thisLineRes}</div>`;
    }
    return resHTML;
});

const generatedKey = computed(() => {
    let generate = ""
    for (let i = 0; i < 26; i++) {
        generate += key.value[i] || '-';
    }
    return generate;
});

type SuggestionModeKey = 'intelligent' | 'freq' | 'words';
const suggestionMode: Record<SuggestionModeKey, {
    name: string;
    func: (ciphertext: string, key: string) => { suggestion: string; newKey: string[] | string; possibility: number; }[] | { suggestion: string; newKey: string[] | string; possibility: number; };
}> = {
    intelligent: {
        name: "智能建议",
        func: getSuggestion
    },
    freq: {
        name: "字符频率分析",
        func: getSuggestionByFrequencyAll
    },
    words: {
        name: "字典分析",
        func: getSuggestionByWords
    }
}
const nowSuggestionMode = ref<SuggestionModeKey>('intelligent');

const keySuggestion = computed(() => {
    try {
        let s = suggestionMode[nowSuggestionMode.value].func(model.value.ciphertext, generatedKey.value);
        // 如果是数组，就返回，否则变成数组
        if (Array.isArray(s)) {
            return s;
        }
        else {
            return [s];
        }
    }
    catch (error) {
        console.log(error)
        return [{
            suggestion: `无法生成建议, ${error}`,
            newKey: generatedKey.value,
            possibility: 0
        }];
    }
});

function applySuggestion(index: number) {
    const newKey = Array.from({ length: 26 }, () => "");
    for (let i = 0; i < 26; ++i) {
        if (keySuggestion.value[index].newKey[i] !== '-') {
            newKey[i] = keySuggestion.value[index].newKey[i];
        }
    }
    key.value = newKey;
}

onMounted(() => {
    drawFrequencyChart(0);
})
</script>

<template>
    <n-card>
        <n-form ref="formRef" :model="model" size="large" label-placement="top">
            <n-grid cols="4" item-responsive responsive="screen" :x-gap="18">
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="密文" path="ciphertext">
                        <n-input v-model:value="model.ciphertext" type="textarea" rows="8" placeholder="请输入密文"
                            @input="updateCiphertext" @change="updateFrequencyChart"
                            style=" font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                    </n-form-item>
                </n-grid-item>
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="明文对照" path="plaintext">
                        <n-scrollbar class="text-comparison">
                            <div v-html="textComparison"></div>
                        </n-scrollbar>
                    </n-form-item>
                </n-grid-item>
            </n-grid>
            <n-grid cols="5" item-responsive responsive="screen" :x-gap="18">
                <n-grid-item span="5 m:5 l:3">
                    <n-form-item label="密钥映射" path="key">
                        <n-scrollbar x-scrollable>
                            <div
                                style="white-space: nowrap; font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;">
                                <n-table size="small" style="text-align: center">
                                    <thead>
                                        <tr>
                                            <template v-for="i in 26" :key="i">
                                                <th v-if="model.ciphertext.includes(String.fromCharCode(i + 96))">
                                                    {{ String.fromCharCode(i + 96) }}</th>
                                            </template>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <template v-for="i in 26" :key="i">
                                                <td v-if="model.ciphertext.includes(String.fromCharCode(i + 96))">
                                                    <input v-model="key[i - 1]" class="keyInput" maxlength="1">
                                                </td>
                                            </template>
                                        </tr>
                                    </tbody>
                                </n-table>
                            </div>
                        </n-scrollbar>
                    </n-form-item>
                    <n-form-item label="密钥">
                        <n-input-group>
                            <n-input placeholder="自动生成的密钥" readonly :value="generatedKey"
                                style="white-space: nowrap; font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                            <n-popover trigger="hover">
                                <template #trigger>
                                    <n-button strong secondary @click="reverseKey()">
                                        <n-icon>
                                            <ShuffleOutline />
                                        </n-icon>
                                    </n-button>
                                </template>
                                <span>逆置换密钥</span>
                            </n-popover>
                            <n-popover trigger="hover">
                                <template #trigger>
                                    <n-button strong secondary @click="AnalyserService.resetKey()">
                                        <n-icon>
                                            <TrashBinOutline />
                                        </n-icon>
                                    </n-button>
                                </template>
                                <span>重置密钥</span>
                            </n-popover>
                        </n-input-group>
                    </n-form-item>
                    <n-flex>
                        <n-button v-for="(sugMode, mode) in suggestionMode"
                            :type="nowSuggestionMode === mode ? 'primary' : 'tertiary'"
                            @click="nowSuggestionMode = mode">{{ sugMode.name }}</n-button>
                    </n-flex>
                </n-grid-item>
                <n-grid-item span="5 m:5 l:2">
                    <n-flex vertical justify="center">
                        <n-alert title="破译建议(点击即可自动应用)" type="info" :bordered="false">
                        </n-alert>
                        <n-scrollbar style="height: 300px">
                            <n-result status="info" title="信息" description="暂时没有建议。" size="small" v-if="keySuggestion.length === 0">
                            </n-result>
                            <n-list hoverable clickable>
                                <n-list-item v-for="(s, i) in keySuggestion" @click="applySuggestion(i)">
                                    <n-thing :title="`参考建议${i + 1}`" content-style="margin-top: 10px;">
                                        <template #description>
                                            <n-flex size="small" style="margin-top: 4px">
                                                <n-tag :bordered="false" type="info" size="small">
                                                    可能性: {{ s.possibility }}%
                                                </n-tag>
                                            </n-flex>
                                        </template>
                                        {{ s.suggestion }}
                                    </n-thing>
                                </n-list-item>
                            </n-list>
                        </n-scrollbar>
                    </n-flex>
                </n-grid-item>
            </n-grid>
        </n-form>
    </n-card>

    <n-card title="字频分析" style="margin-top: 30px;">
        <n-tabs type="line" style="margin-bottom: 20px; margin-top: -10px" @update:value="updateFrequencyChart"
            :value="nowFrequencyLevel">
            <n-tab name="0">
                >0%
            </n-tab>
            <n-tab name="1">
                &gt;10%
            </n-tab>
            <n-tab name="5">
                双字母
            </n-tab>
            <n-tab name="6">
                三字母
            </n-tab>
            <n-tab name="2">
                5%-10%
            </n-tab>
            <n-tab name="3">
                1%-5%
            </n-tab>
            <n-tab name="4">
                &lt;1%
            </n-tab>
        </n-tabs>
        <n-grid cols="4" item-responsive responsive="screen" :x-gap="18">
            <n-grid-item span="4 m:4 l:2">
                密文字频
                <canvas ref="freqCanvas"></canvas>
            </n-grid-item>
            <n-grid-item span="4 m:4 l:2">
                参考字频
                <canvas ref="originCanvas"></canvas>
            </n-grid-item>
        </n-grid>
    </n-card>
</template>

<style>
.keyInput {
    width: 30px;
    height: 30px;
    text-align: center;
    font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;
    font-size: 16px;
    margin: 2px;
    border: 1px solid #d9d9d9;
    transition: all .2s ease;
}

.keyInput:focus {
    outline: none;
    border: 1px solid #4caf50;
}

.text-comparison {
    height: 200px;
    font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 4px 10px;
}

.cipher-line {
    word-break: break-all;
}

.plain-line {
    color: #db2828;
    word-break: break-all;
}
</style>