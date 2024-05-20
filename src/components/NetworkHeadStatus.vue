<script setup lang="ts">
const networkStore = useNetworkStore()

const { isCurrentNetworkRunning, currentNetworkInfo, currentNetworkInfoData } = storeToRefs(networkStore)

const countTx = computed(() => {
  let tx = 0
  currentNetworkInfoData.value.forEach((d) => {
    tx += d.tx || 0
  })
  return tx ? humanFileSize(Number(tx)) : ''
})

const countRx = computed(() => {
  let rx = 0
  currentNetworkInfoData.value.forEach((d) => {
    rx += d.rx || 0
  })
  return rx ? humanFileSize(Number(rx)) : ''
})
</script>

<template>
  <n-flex align="center">
    <n-badge :type="isCurrentNetworkRunning ? 'success' : 'error'" dot processing ml-2 />
    <n-tag v-if="currentNetworkInfo?.running && currentNetworkInfo.node.virtual_ipv4" type="info" :bordered="false" size="small">
      {{ `IP: ${currentNetworkInfo.node.virtual_ipv4}` }}
    </n-tag>
    <n-tag v-if="currentNetworkInfo?.running && countTx && countRx" :bordered="false">
      {{ `${countTx} / ${countRx}` }}
    </n-tag>
  </n-flex>
</template>
