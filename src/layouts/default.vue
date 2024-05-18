<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import NetworkList from '~/components/NetworkList.vue'
import NetworkListAction from '~/components/NetworkListAction.vue'

const { availableLocales, locale } = useI18n()
// const platformName = async () => await platform()
const menuOptions = [
  {
    label: '设置',
    key: 'config',
    disabled: true,
  },
  {
    label: '多语言',
    key: 'i18n',
    children: availableLocales.map(l => ({
      label: l,
      key: l,
      disabled: l === locale.value,
    })),
    disabled: true,
  },
  {
    label: '检查更新',
    key: 'update',
    disabled: true,
  },
  {
    label: '关于',
    key: 'about',
    disabled: true,
  },
]
</script>

<template>
  <n-layout has-sider h-full>
    <n-layout-sider bordered content-class="p-2 flex flex-col !overflow-hidden" width="211">
      <n-flex h-full>
        <NetworkListAction />
        <NetworkList />
        <n-flex align="center" justify="space-between" :wrap="false">
          <n-dropdown trigger="hover" :options="menuOptions" size="small">
            <n-button strong secondary size="small">
              <template #icon>
                <n-icon i-carbon-menu />
              </template>
            </n-button>
          </n-dropdown>
          <n-checkbox disabled>
            路由广播
          </n-checkbox>
        </n-flex>
      </n-flex>
    </n-layout-sider>
    <n-layout>
      <n-layout-content content-class="p-2" h-full>
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
