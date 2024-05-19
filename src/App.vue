<script setup lang="ts">
import type { UnlistenFn } from '@tauri-apps/api/event'
import { listen } from '@tauri-apps/api/event'
import { darkTheme } from 'naive-ui'
import type { InstanceEvent } from './types/network'

const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)

const theme = computed(() => (isDark.value ? darkTheme : null))

const eventListen = ref<UnlistenFn | null>(null)
onMounted(async () => {
  eventListen.value = await listen<InstanceEvent>('easytier://event', (event) => {
    // console.log(event.payload)
  })
})

onBeforeUnmount(() => {
  // eventListen.value && eventListen.value()
  eventListen.value?.()
})
</script>

<template>
  <n-config-provider :theme>
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <RouterView />
          <n-watermark
            v-if="needShowWatermark" :content="watermarkContent" cross fullscreen :font-size="16"
            :line-height="16" :width="240" :height="240" :x-offset="12" :y-offset="64" :rotate="-15"
          />
        </n-modal-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
