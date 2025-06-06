import { defineStore } from "pinia";

export const useFormStore = defineStore('form', {
    state: () => ({
        plaintext: '',
        ciphertext: '',
        key: ''
    }),
    getters: {
        formData: (state) => ({
            key: state.key,
            text: state.plaintext,
            result: state.ciphertext
        }),
        getKey(state) {
            return state.key;
        },
        getPlaintext(state) {
            return state.plaintext;
        },
        getCiphertext(state) {
            return state.ciphertext;
        }
    },
    actions: {
        setKey(key: string) {
            this.key = key;
        },
        setPlaintext(plaintext: string) {
            this.plaintext = plaintext;
        },
        setCiphertext(ciphertext: string) {
            this.ciphertext = ciphertext;
        },
    },
});