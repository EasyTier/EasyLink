import { Window } from '@tauri-apps/api/window'
import { Menu, MenuItem } from '@tauri-apps/api/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import { exit } from '@tauri-apps/plugin-process'
import pkg from '~/../package.json'

const DEFAULT_TRAY_NAME = 'main'
const appWindow = new Window('main')

export async function useTray() {
  let tray = await TrayIcon.getById(DEFAULT_TRAY_NAME)
  if (!tray) {
    tray = await TrayIcon.new({
      tooltip: `EasyLink\n${pkg.version}`,
      id: DEFAULT_TRAY_NAME,
      icon: 'icons/icon.ico',
      menu: await Menu.new({
        id: 'main',
        items: await generateMenuItem(),
      }),
    })
  }
  return tray
}

export async function generateMenuItem() {
  return [
    await MenuItemExit(),
    await MenuItemShow(),
  ] || []
}

export async function MenuItemExit(text: string = 'exit') {
  return await MenuItem.new({
    id: 'exit',
    text,
    action: async () => {
      await exit(0)
    },
  })
}

export async function MenuItemShow(text: string = 'show / hide') {
  return await MenuItem.new({
    id: 'show',
    text,
    action: async () => {
      await appWindow.isVisible()
        ? await appWindow.hide()
        : await appWindow.show()
    },
  })
}

export async function setTrayMenu(items: MenuItem[] | undefined = undefined) {
  const tray = await useTray()
  const menu = await Menu.new({
    id: 'main',
    items: items || await generateMenuItem(),
  })
  tray.setMenu(menu)
}

export async function setTrayRunState(isRunning: boolean = false) {
  const tray = await useTray()
  tray.setIcon(isRunning ? 'icons/icon-inactive.ico' : 'icons/icon.ico')
}

export async function setTrayTooltip(tooltip: string) {
  if (tooltip) {
    const tray = await useTray()
    tray.setTooltip(`EasyLink\n${pkg.version}\n${tooltip}`)
  }
}
