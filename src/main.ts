import type { UseModule } from './types/modules'
import App from '~/App.vue'

import '@unocss/reset/tailwind-compat.css'
import '~/styles/styles.css'
import 'uno.css'

const app = createApp(App)

Object.values(import.meta.glob<{ install: UseModule }>('./modules/*.ts', { eager: true }))
  .forEach(async i => await i.install?.(app))

app.mount('#app')
