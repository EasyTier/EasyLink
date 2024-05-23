<script setup lang="ts">
const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()
const networkStore = useNetworkStore()
const { showMultipleNetwork } = storeToRefs(appStore)
const { addNetwork, removeNetwork, startNetwork, stopNetwork } = networkStore
const { networkList, networkCurrentId, currentNetwork, isCurrentNetworkRunning } = storeToRefs(networkStore)
const configDrawer = ref(false)
const statusDrawer = ref(false)
const eventModal = ref(false)

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
  await startNetwork((e) => {
    message.error(e, {
      closable: true,
      duration: 10000,
    })
  })
}

async function stopLink() {
  await stopNetwork()
}

// watch(networkInfo, (n) => {
//   // setTrayRunState(n.length > 0)
// })
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
      <n-gi offset="1" span="8">
        <n-flex align="center">
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
          <n-button text @click="eventModal = true">
            <template #icon>
              <n-icon i-carbon-event-schedule />
            </template>
            {{ t('page.index.event') }}
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

          <n-popconfirm
            v-if="showMultipleNetwork && !isCurrentNetworkRunning" :negative-text="t('page.index.delete')"
            :positive-text="t('page.index.cancel')" @negative-click="removeThisNetwork(currentNetwork.config.id)"
          >
            <template #trigger>
              <n-button text style="--n-text-color-hover: #e98b8b">
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
      <n-gi offset="1" span="8">
        <n-flex align="center">
          <NetworkStatusChart :stack="30" />
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
      <NetworkStatus />
    </n-drawer-content>
  </n-drawer>
  <n-modal v-model:show="eventModal">
    <n-card w="60%" :title="t('page.index.event')" :bordered="false" role="dialog" aria-modal="true">
      <NetworkEvent />
    </n-card>
  </n-modal>
</template>

<style scoped lang="postcss"></style>
