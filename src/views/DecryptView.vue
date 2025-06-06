<script setup lang="ts">
import { NInput, NGrid, NGridItem, NCard, NTable, NForm, NFormItem, NButton, NSpace, NScrollbar, NInputGroup, NPopover, NIcon } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useFormStore } from '../stores/formStore'
import { ShuffleOutline } from '@vicons/ionicons5'
import { ref } from 'vue'

// 核心函数
import { reverseKey, decrypt } from '../utils/funcs'

const message = useMessage()
const formStore = useFormStore()

const model = ref({
    plaintext: '',
    ciphertext: formStore.ciphertext,
    key: formStore.key
})

class DecryptService {
    static updateCiphertext() {
        formStore.setCiphertext(model.value.ciphertext);
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
    static handleSelect(key: string | number) {
        switch (key) {
            case 'reverse-key':
                model.value.key = DecryptService.reverseKey(model.value.key);
                break;
        }
        DecryptService.updateKey();
    }
    static decrypt() {
        try {
            const decryptedText = decrypt(model.value.ciphertext, model.value.key);
            model.value.plaintext = decryptedText;
            formStore.setPlaintext(decryptedText);
        }
        catch (error) {
            message.error('解密失败，请检查密钥和密文是否匹配');
        }
    }
}
</script>

<template>
    <n-card>
        <n-form ref="formRef" :model="model" size="large" label-placement="top">
            <n-grid cols="4" item-responsive responsive="screen" :x-gap="18">
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="密文" path="ciphertext">
                        <n-input v-model:value="model.ciphertext" type="textarea" rows="8" placeholder="请输入密文"
                            @input="DecryptService.updateCiphertext"
                            style=" font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                    </n-form-item>
                </n-grid-item>
                <n-grid-item span="4 m:4 l:2">
                    <n-form-item label="明文" path="plaintext">
                        <n-input v-model:value="model.plaintext" type="textarea" rows="8" placeholder="解密的明文"
                            style=" font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;"
                            readonly />
                    </n-form-item>
                </n-grid-item>
            </n-grid>
            <n-form-item label="密钥" path="key">
                <n-input-group>
                    <n-input v-model:value="model.key" placeholder="请输入由 26 个小写字母组成的密钥(必须与加密时的密钥一致)" @input="DecryptService.updateKey"
                        style="font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;" />
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-button strong secondary @click="DecryptService.handleSelect('reverse-key')">
                                <n-icon>
                                    <ShuffleOutline />
                                </n-icon>
                            </n-button>
                        </template>
                        <span>逆置换密钥</span>
                    </n-popover>
                </n-input-group>
            </n-form-item>
            <n-space>
                <n-button type="error" @click="DecryptService.decrypt()">解密</n-button>
                <n-button type="info" @click="DecryptService.resetForm()">重置</n-button>
            </n-space>
        </n-form>
    </n-card>
    <n-card title="密钥映射关系" style="margin-top: 30px;">
        <n-scrollbar x-scrollable>
            <div style="white-space: nowrap; font-family: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace;">
                <n-table single-column>
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