<script setup lang="ts">
import type { NetworkConfig } from '~/types/network'

const { t } = useI18n()
const networkStore = useNetworkStore()

const { addNetwork, removeNetwork } = networkStore
const { networkList, networkCurrentId, currentNetwork, isCurrentNetworkRunning, currentNetworkInfo } = storeToRefs(networkStore)
const configDrawer = ref(false)
const statusDrawer = ref(true)

interface DataInfo {
  name: string
  ip: string
  cost?: number
  latency?: number
  tx?: number
  rx?: number
  lossRate?: number
}

const data = computed(() => {
  const dataInfo: DataInfo[] = currentNetworkInfo.value?.peer_route_pairs.map((p) => {
    const latency = statsCommon(p, 'stats.latency_us')
    const tx = statsCommon(p, 'stats.tx_bytes')
    const rx = statsCommon(p, 'stats.rx_bytes')
    const lossRate = statsCommon(p, 'loss_rate')

    return {
      name: p.route.hostname,
      ip: p.route.ipv4_addr,
      cost: p.route ? p.route.cost : undefined,
      latency: latency ? latency / 1000 / (p.peer?.conns.length || 1) : undefined,
      tx,
      rx,
      lossRate,
    }
  }) || []

  return dataInfo
})

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
      return row.tx ? humanFileSize(Number(row.tx)) : ''
    },
  },
  {
    title: t('page.index.rx'),
    key: 'rx',
    width: 84,
    render(row: DataInfo) {
      return row.rx ? humanFileSize(Number(row.rx)) : ''
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
  data.value.forEach((d) => {
    tx += d.tx || 0
  })
  return tx ? humanFileSize(Number(tx)) : ''
})

const countRx = computed(() => {
  let rx = 0
  data.value.forEach((d) => {
    rx += d.rx || 0
  })
  return rx ? humanFileSize(Number(rx)) : ''
})

function removeThisNetwork(id: string) {
  if (id) {
    removeNetwork(id)
    networkCurrentId.value = ''
  }
}

function addAndSelectNetwork() {
  addNetwork()
  if (networkList.value.length)
    networkCurrentId.value = networkList.value[networkList.value.length - 1].config.id
}

function randomToken() {
  if (currentNetwork.value)
    currentNetwork.value.config.token = uuid(6)
}

async function startLink() {
  if (currentNetwork.value) {
    const cfg: NetworkConfig = JSON.parse(JSON.stringify(currentNetwork.value.config))

    if (currentNetwork.value.otherConfig.token) {
      delete cfg.networkName
      delete cfg.networkSecret
    }
    else {
      delete cfg.token
    }
    // link!
    await startNetworkInstance(cfg)
  }
}

async function stopLink() {
  if (currentNetwork.value)
    await stopNetworkInstance(currentNetwork.value.config.id)
}
</script>

<template>
  <n-flex h-full w-full align="center" justify="center">
    <n-grid v-if="currentNetwork" :x-gap="8" :y-gap="8" :cols="10">
      <n-gi offset="1" span="8">
        <n-flex :wrap="false">
          <n-input-group v-if="currentNetwork.otherConfig.token">
            <n-input
              v-model:value="currentNetwork.config.token" type="text" text-center
              :placeholder="t('page.index.tokenPlaceholder')" size="medium" :style="{ width: '100%' }"
              :disabled="isCurrentNetworkRunning"
            />

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button size="medium" tertiary :disabled="isCurrentNetworkRunning" @click="randomToken">
                  <template #icon>
                    <n-icon i-carbon-restart />
                  </template>
                </n-button>
              </template>
              {{ t('page.index.generateRandToken') }}
            </n-tooltip>
          </n-input-group>
          <n-input-group v-else>
            <n-input
              v-model:value="currentNetwork.config.networkName" text-center type="text"
              :disabled="isCurrentNetworkRunning" :placeholder="t('page.index.networkNamePlaceholder')"
              :style="{ width: '55%' }"
            />
            <n-input
              v-model:value="currentNetwork.config.networkSecret" text-center type="text"
              :disabled="isCurrentNetworkRunning" :placeholder="t('page.index.networkSecretPlaceholder')"
              :style="{ width: '45%' }"
            />
          </n-input-group>
          <n-button v-if="!isCurrentNetworkRunning" type="primary" size="medium" @click="startLink">
            {{ t('page.index.networking') }}
          </n-button>
          <n-button v-else type="error" size="medium" @click="stopLink">
            {{ t('page.index.stopNetworking') }}
          </n-button>
        </n-flex>
      </n-gi>
      <n-gi offset="1" span="6">
        <n-flex :wrap="false" align="center">
          <n-button text @click="configDrawer = true">
            <template #icon>
              <n-icon i-carbon-settings />
            </template>
            {{ t('page.index.config') }}
          </n-button>
          <n-button text @click="statusDrawer = true">
            <template #icon>
              <n-icon i-carbon-app-connectivity />
            </template>
            {{ t('page.index.status') }}
          </n-button>

          <n-tooltip trigger="hover">
            <template #trigger>
              <n-checkbox v-model:checked="currentNetwork.otherConfig.token" :disabled="isCurrentNetworkRunning">
                <template #icon>
                  <n-icon i-carbon-group-security />
                </template>
                {{ t('page.index.token') }}
              </n-checkbox>
            </template>
            {{ t('page.index.useTokenOrGroup') }}
          </n-tooltip>
        </n-flex>
      </n-gi>
      <n-gi offset="1" span="6">
        <n-flex :wrap="false" align="center">
          <n-popconfirm
            v-if="false" :negative-text="t('page.index.delete')" :positive-text="t('page.index.cancel')"
            @negative-click="removeThisNetwork(currentNetwork.config.id)"
          >
            <template #trigger>
              <n-button text>
                <template #icon>
                  <n-icon i-carbon-row-delete />
                </template>
                {{ t('page.index.confirmDeleteConfigMessage') }}
              </n-button>
            </template>
            {{ t('page.index.confirmDeleteConfigMessageTwice') }}
          </n-popconfirm>
        </n-flex>
      </n-gi>
    </n-grid>
    <n-result
      v-else w-full status="404" :title="t('page.index.noNetworkTitle')"
      :description="t('page.index.noNetworkDescription')"
    >
      <template #footer>
        <n-button @click="addAndSelectNetwork">
          {{ t('page.index.addAndSelectNewNetwork') }}
        </n-button>
      </template>
    </n-result>
  </n-flex>
  <n-drawer v-model:show="configDrawer" :width="320">
    <n-drawer-content body-content-class="!p-2">
      <NetworkConfig />
    </n-drawer-content>
  </n-drawer>
  <n-drawer v-model:show="statusDrawer" placement="bottom" default-height="80%">
    <n-drawer-content body-content-class="!p-2 !overflow-hidden">
      <n-flex overflow-hidden>
        <n-flex justify="space-around" w-full>
          <n-statistic :label="t('page.index.connectNum')" :value="data.length" tabular-nums />
          <n-statistic :label="t('page.index.countTx')" :value="countTx" tabular-nums />
          <n-statistic :label="t('page.index.countRx')" :value="countRx" tabular-nums />
        </n-flex>
        <n-data-table :columns="columns" :data="data" :style="{ height: 'calc(80vh - 78px)' }" flex-height />
      </n-flex>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="postcss">
.n-statistic {
  &:deep(.n-statistic-value .n-statistic-value__content),
  &:deep(.n-statistic-value .n-statistic-value__suffix) {
    @apply !text-xl;
  }
}
</style>
