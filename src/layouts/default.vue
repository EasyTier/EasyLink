<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import { availableLocales, loadLanguageAsync } from '~/modules/i18n'
import NetworkList from '~/components/NetworkList.vue'
import NetworkListAction from '~/components/NetworkListAction.vue'

const { locale, t } = useI18n()
const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)
const menuOptions = computed(() => [
  {
    label: t('layout.default.config'),
    key: 'config',
    disabled: true,
  },
  {
    label: t('layout.default.language'),
    key: 'i18n',
    children: availableLocales.map(l => ({
      label: t(`i18n.${l}`),
      key: l,
      disabled: l === locale.value,
      props: {
        onClick: async () => await loadLanguageAsync(l),
      },
    })),
  },
  {
    label: t('layout.default.checkUpdate'),
    key: 'update',
    disabled: true,
  },
  {
    label: t('layout.default.about'),
    key: 'about',
    disabled: true,
  },
])

const platformName = ref('')
const showSider = ref(false)

onMounted(async () => {
  platformName.value = await platform()
})
</script>

<template>
  <n-layout :has-sider="showSider" h-full>
    <n-layout-sider v-if="showSider" bordered content-class="p-2 flex flex-col !overflow-hidden" width="211">
      <n-flex h-full>
        <NetworkListAction />
        <NetworkList />
      </n-flex>
    </n-layout-sider>
    <n-layout h-full>
      <n-layout-header p-2>
        <n-flex justify="space-between">
          <NetworkHeadStatus />
          <n-flex align="center" justify="flex-end" :wrap="false">
            <n-checkbox v-if="platformName === 'windows'" disabled>
              {{ t('layout.default.winIpBroadcast') }}
            </n-checkbox>
            <n-switch v-model:value="isDark">
              <template #checked-icon>
                <n-icon i-carbon-moon />
              </template>
              <template #unchecked-icon>
                <n-icon i-carbon-sun />
              </template>
            </n-switch>
            <n-dropdown trigger="hover" :options="menuOptions" size="small">
              <n-button strong secondary size="small">
                <template #icon>
                  <n-icon i-carbon-menu />
                </template>
              </n-button>
            </n-dropdown>
          </n-flex>
        </n-flex>
      </n-layout-header>
      <n-layout-content content-class="p-2 h-full" h-full :style="{ 'max-height': 'calc(100vh - 48px)' }">
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
