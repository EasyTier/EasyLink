import type { UseModule } from '~/types/modules'

export const install: UseModule = (app) => {
  const pinia = createPinia()
  app.use(pinia)
}
