<script setup lang="ts">
const { t } = useI18n()
const networkStore = useNetworkStore()

const { currentNetworkInfoData } = storeToRefs(networkStore)

interface DataInfo {
  name: string
  ip: string
  cost?: number
  latency?: number
  tx?: number
  rx?: number
  lossRate?: number
}

const columns = computed(() => [
  {
    title: t('page.index.name'),
    key: 'name',
    maxWidth: 200,
    width: 100,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: t('page.index.ip'),
    key: 'ip',
    width: 140,
  },
  {
    title: t('page.index.status'),
    key: 'cost',
    width: 84,
    render(row: DataInfo) {
      return row.cost ? row.cost === 1 ? 'p2p' : `relay(${row.cost})` : 'unknown'
    },
  },
  {
    title: t('page.index.latency'),
    key: 'latency',
    width: 84,
    render(row: DataInfo) {
      return row.latency ? `${Number(row.latency) % 1 > 0 ? Math.round(Number(row.latency)) + 1 : Math.round(Number(row.latency))}ms` : ''
    },
  },
  {
    title: t('page.index.tx'),
    key: 'tx',
    width: 84,
    render(row: DataInfo) {
      return row.tx ? humanFileSize(Number(row.tx)) : '0 B'
    },
  },
  {
    title: t('page.index.rx'),
    key: 'rx',
    width: 84,
    render(row: DataInfo) {
      return row.rx ? humanFileSize(Number(row.rx)) : '0 B'
    },
  },
  {
    title: t('page.index.lossRate'),
    key: 'lossRate',
    width: 64,
    render(row: DataInfo) {
      return row.lossRate !== undefined ? `${Math.round(Number(row.lossRate) * 100)}%` : ''
    },
  },
])

const countTx = computed(() => {
  let tx = 0
  currentNetworkInfoData.value.forEach((d) => {
    tx += d.tx || 0
  })
  return tx ? humanFileSize(Number(tx)) : '0 B'
})

const countRx = computed(() => {
  let rx = 0
  currentNetworkInfoData.value.forEach((d) => {
    rx += d.rx || 0
  })
  return rx ? humanFileSize(Number(rx)) : '0 B'
})
</script>

<template>
  <n-flex overflow-hidden>
    <n-flex justify="space-around" w-full>
      <n-statistic :label="t('page.index.connectNum')" :value="currentNetworkInfoData.length" tabular-nums />
      <n-statistic :label="t('page.index.countTx')" :value="countTx" tabular-nums />
      <n-statistic :label="t('page.index.countRx')" :value="countRx" tabular-nums />
    </n-flex>
    <n-data-table
      :columns="columns" :data="currentNetworkInfoData" :style="{ height: 'calc(80vh - 78px)' }"
      flex-height
    />
  </n-flex>
</template>

<style scoped lang="postcss">
.n-statistic {
  &:deep(.n-statistic-value .n-statistic-value__content),
  &:deep(.n-statistic-value .n-statistic-value__suffix) {
    @apply !text-xl;
  }
}
</style>
