import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import type { UseModule } from '~/types/modules'

export const install: UseModule = (app) => {
  const router = createRouter({
    history: createWebHistory(),
    extendRoutes: routes => setupLayouts(routes),
  })
  app.use(router)
}
