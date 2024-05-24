export interface Config {
  autostart: {
    enable: boolean
    network: string[]
  }
}

export function DEFAULT_APP_CONFIG(): Config {
  return {
    autostart: {
      enable: false,
      network: [],
    },
  }
}
