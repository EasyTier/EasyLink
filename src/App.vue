<script setup lang="ts">
import { darkTheme } from 'naive-ui'

const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)

const theme = computed(() => (isDark.value ? darkTheme : null))
</script>

<template>
  <n-config-provider :theme>
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <RouterView />
        </n-modal-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
