<script setup lang="ts">
import { NMessageProvider } from 'naive-ui'
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutFooter, NLayoutContent, NH2 } from 'naive-ui'
import Navbar from './components/Navbar.vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <n-message-provider>
    <n-layout has-sider style="height: 100%">
      <n-layout-sider :native-scrollbar="false" collapse-mode="width" :collapsed-width="64" :width="240"
        show-trigger="arrow-circle" bordered>
        <div style="width: 100%; padding-top: 24px; text-align: center; box-sizing: border-box;">
          <n-h2>单<span class="collapse-hidden">表置换</span></n-h2>
        </div>
        <navbar />
      </n-layout-sider>
      <n-layout :native-scrollbar="false">
        <n-layout-header style="padding: 24px 48px 0 48px;" bordered>
          <n-h2>{{ route.meta.title }}</n-h2>
        </n-layout-header>
        <n-layout-content content-style="padding: 36px 48px 36px 48px; background-color: #f0f2f5;">
          <router-view />
        </n-layout-content>
        <n-layout-footer style="padding: 24px 48px; background-color: #fff;">Made by 叶力天(PB23151830).</n-layout-footer>
      </n-layout>
    </n-layout>
  </n-message-provider>
</template>