<script setup lang="ts">
import type { NetworkConfig } from '~/types/network'

const { t } = useI18n()
const networkStore = useNetworkStore()

const { addNetwork, removeNetwork } = networkStore
const { networkList, networkCurrentId, currentNetwork, isCurrentNetworkRunning } = storeToRefs(networkStore)
const config = ref(false)

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
          <n-button text @click="config = true">
            <template #icon>
              <n-icon i-carbon-settings />
            </template>
            {{ t('page.index.config') }}
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
  <n-drawer v-model:show="config" :width="320">
    <n-drawer-content body-content-class="!p-2">
      <NetworkConfig />
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="postcss"></style>
