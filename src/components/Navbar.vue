<template>
  <n-menu :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions" />
</template>

<script setup lang="ts">
import { NMenu, type MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import {
  LockClosedOutline,
  KeyOutline,
  BulbOutline
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { h } from 'vue'
import { RouterLink } from 'vue-router'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/'
        },
        { default: () => '加密' }
      ),
    key: 'encrypted',
    icon: renderIcon(LockClosedOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/decrypt'
        },
        { default: () => '解密' }
      ),
    key: 'decrypted',
    icon: renderIcon(KeyOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/assist'
        },
        { default: () => '辅助解密' }
      ),
    key: 'assist',
    icon: renderIcon(BulbOutline)
  },
]
</script>