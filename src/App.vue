<script setup lang="ts">
import { Window } from '@tauri-apps/api/window'
import { exit } from '@tauri-apps/plugin-process'
import hljs from 'highlight.js'
import type { UnlistenFn } from '@tauri-apps/api/event'
import { listen } from '@tauri-apps/api/event'
import { darkTheme, dateZhCN, zhCN } from 'naive-ui'
import type { InstanceEvent, Network, NetworkInstanceInfo } from './types/network'

const { locale, t } = useI18n()
const appStore = useAppStore()
const networkStore = useNetworkStore()
const appWindow = new Window('main')
const { isDark } = storeToRefs(appStore)
const { pushInfoStack } = networkStore
const { networkInfo, networkList } = storeToRefs(networkStore)

const theme = computed(() => (isDark.value ? darkTheme : null))

const eventListen = ref<UnlistenFn | null>(null)
const infoListen = ref<UnlistenFn | null>(null)
const requestListen = ref<UnlistenFn | null>(null)
const closeModel = ref(false)

async function hideCallback() {
  await appWindow.hide()
}

async function closeCallback() {
  await exit(0)
}

useTray()

onMounted(async () => {
  eventListen.value = await listen<InstanceEvent>('easytier://event', () => {
    // console.log(event.payload)
  })
  infoListen.value = await listen<NetworkInstanceInfo[]>('network_instance_info', (event) => {
    // console.log(event.payload)
    networkInfo.value = [...event.payload]
    networkList.value.forEach((n: Network) => {
      const p = event.payload.find(i => i.id === n.config.id.toLowerCase())

      if (p) {
        n.detail = p
        pushInfoStack(n.config.id, p)
      }
    })
  })
  requestListen.value = await listen<InstanceEvent>('close_requested', () => {
    closeModel.value = true
  })
})

onBeforeUnmount(() => {
  // eventListen.value && eventListen.value()
  eventListen.value?.()
  infoListen.value?.()
})
</script>

<template>
  <n-config-provider
    :theme :locale="locale === 'zh-CN' ? zhCN : undefined"
    :date-locale="locale === 'zh-CN' ? dateZhCN : undefined" :hljs="hljs"
  >
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <RouterView />
          <n-modal
            v-model:show="closeModel" preset="dialog" :title="t('app.sureToExit')" :content="t('app.sureToExitContent')"
            :positive-text="t('app.minimize')" :negative-text="t('app.exit')" @positive-click="hideCallback"
            @negative-click="closeCallback"
          />
          <n-watermark
            v-if="needShowWatermark" :content="watermarkContent" cross fullscreen :font-size="16"
            :line-height="16" :width="240" :height="240" :x-offset="12" :y-offset="64" :rotate="-15"
          />
        </n-modal-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
