<script setup lang="ts">
const networkStore = useNetworkStore()

const { addNetwork } = networkStore

const { networkFilter } = storeToRefs(networkStore)
</script>

<template>
  <n-flex justify="space-between" :wrap="false">
    <n-input v-model:value="networkFilter" clearable type="text" placeholder="筛选" size="small" />
    <n-button strong secondary size="small" @click="addNetwork">
      <template #icon>
        <n-icon i-carbon-add />
      </template>
    </n-button>
  </n-flex>
</template>

<style scoped lang="postcss"></style>
