<script setup lang="ts">
import { NInput, NGrid, NGridItem, NCard, NTable, NForm, NFormItem, NInputGroup, NButton, NDropdown, NIcon, NSpace, NScrollbar, NPopover } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useFormStore } from '../stores/formStore'
import { ColorWandOutline, ShuffleOutline } from '@vicons/ionicons5'
import { ref } from 'vue'

// 核心函数
import { reverseKey, generateRandomKey, encrypt } from '../utils/funcs'

const message = useMessage()
const formStore = useFormStore()

const model = ref({
    plaintext: formStore.plaintext,
    ciphertext: '',
    key: formStore.key
})

const keyOptions = [{
    type: 'group',
    label: '变换',
    key: 'transform',
    children: [
        {
            label: '逆置换',
            key: 'reverse-key',
        }
    ]
}, {
    type: 'group',
    label: '预设',
    key: 'preset',
    children: [
        {
            label: '随机填充',
            key: 'random-key',
        },
        {
            label: 'ROT13',
            key: 'rot13'
        },
        {
            label: '凯撒密码',
            key: 'caesar'
        }
    ]
}]

class EncrypterService {
    static updatePlaintext() {
        formStore.setPlaintext(model.value.plaintext);
    }
    static updateKey() {
        formStore.setKey(model.value.key);
    }
    static resetForm() {
        model.value.plaintext = '';
        model.value.ciphertext = '';
        model.value.key = '';
        message.success('已重置');
    }
    static reverseKey(key: string) {
        try {
            return reverseKey(key);
        }
        catch (error) {
            message.error('密钥逆置换失败，密钥必须由 26 个小写字母组成');
            return key;
        }
    }
    static generateKey() {
        return generateRandomKey();
    }
    static handleSelect(key: string | number) {
        switch (key) {
            case 'reverse-key':
                model.value.key = EncrypterService.reverseKey(model.value.key);
                break;
            case 'random-key':
                model.value.key = EncrypterService.generateKey();
                break;
            case 'rot13':
                model.value.key = 'nopqrstuvwxyzabcdefghijklm'; // ROT13 密钥
                break;
        }
        EncrypterService.updateKey();
    }
    static encrypt() {
        try {
            const ciphertext = encrypt(model.value.plaintext, model.value.key);
            model.value.ciphertext = ciphertext;
            formStore.setCiphertext(ciphertext);
        } catch (error) {
            message.error(`加密失败，${error}`);
        }
    }
}
</script>

<template>
    <n-card>
        <n-form ref="formRef" :model="model" size="large" label-placement="top">
            <n-grid cols="4" item-responsive responsive="screen" :x-gap="18">
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="明文" path="plaintext">
                        <n-input v-model:value="model.plaintext" type="textarea" rows="8" placeholder="请输入明文"
                            @input="EncrypterService.updatePlaintext"
                            style=" font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                    </n-form-item>
                </n-grid-item>
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="密文" path="ciphertext">
                        <n-input v-model:value="model.ciphertext" type="textarea" rows="8" placeholder="加密的密文"
                            style=" font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;"
                            readonly />
                    </n-form-item>
                </n-grid-item>
            </n-grid>
            <n-form-item label="密钥" path="key">
                <n-input-group>
                    <n-input v-model:value="model.key" placeholder="请输入由 26 个小写字母组成的密钥"
                        @input="EncrypterService.updateKey"
                        style="font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-button strong secondary @click="EncrypterService.handleSelect('reverse-key')">
                                <n-icon>
                                    <ShuffleOutline />
                                </n-icon>
                            </n-button>
                        </template>
                        <span>逆置换密钥</span>
                    </n-popover>
                    <n-dropdown trigger="click" :options="keyOptions" :show-arrow="true"
                        @select="EncrypterService.handleSelect">
                        <n-popover trigger="hover">
                            <template #trigger>
                                <n-button strong secondary>
                                    <n-icon>
                                        <ColorWandOutline />
                                    </n-icon>
                                </n-button>
                            </template>
                            <span>处理密钥</span>
                        </n-popover>
                    </n-dropdown>
                </n-input-group>
            </n-form-item>
            <n-space>
                <n-button type="primary" @click="EncrypterService.encrypt()">加密</n-button>
                <n-button type="info" @click="EncrypterService.resetForm()">重置</n-button>
            </n-space>
        </n-form>
    </n-card>
    <n-card title="密钥映射关系" style="margin-top: 30px;">
        <n-scrollbar x-scrollable>
            <div style="white-space: nowrap; font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;">
                <n-table>
                    <thead>
                        <tr>
                            <th v-for="i in 26" :key="i">{{ String.fromCharCode(i + 96) }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td v-for="i in 26" :key="i">{{ model.key[i - 1] || String.fromCharCode(i + 96) }}</td>
                        </tr>
                    </tbody>
                </n-table>
            </div>
        </n-scrollbar>
    </n-card>
</template>