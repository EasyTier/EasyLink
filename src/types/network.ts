export interface NetworkConfig {
  id: string
  dhcp: boolean
  ipv4?: string
  deviceName?: string
  token?: string
  networkName?: string
  networkSecret?: string
  peerUrls: string[]
  proxyCidrs?: string[]
  vpnPortalAddr?: string
  vpnPortalPort?: string
  listenerUrls: string[]
  rpcPort?: number
}

export function DEFAULT_NETWORK_CONFIG(): NetworkConfig {
  return {
    id: uuid(),
    dhcp: true,
    token: uuid(6),
    peerUrls: ['tcp://easytier.public.kkrainbow.top:11010'],
    listenerUrls: [
      'tcp://0.0.0.0:11010',
      'udp://0.0.0.0:11010',
      'wg://0.0.0.0:11011',
    ],
  }
}

export function DEFAULT_NETWORK_OTHER_CONFIG(): NetworkOtherConfig {
  return {
    token: true,
  }
}

export enum NetworkStatus {
  OFF = 0,
  STARTING,
  RUNNING,
  STOPPED,
  ERROR,
}

export interface Network {
  name?: string
  config: NetworkConfig
  status: NetworkStatus
  detail?: NetworkInstanceInfo
  otherConfig: NetworkOtherConfig
}

export interface NetworkOtherConfig {
  token: boolean
}

export interface NetworkInstanceInfo {
  node: NodeInfo
  events: Record<string, any>
  routes: Route[]
  peers: PeerInfo[]
  PeerRoutePairs: PeerRoutePair[]
  running: boolean
  error?: string
}

export interface NodeInfo {
  virtual_ipv4: string
  ips: {
    public_ipv4: string
    interface_ipv4s: string[]
    public_ipv6: string
    interface_ipv6s: string[]
    listeners: {
      serialization: string
      scheme_end: number
      username_end: number
      host_start: number
      host_end: number
      host: any
      port?: number
      path_start: number
      query_start?: number
      fragment_start?: number
    }[]
  }
  stun_info: StunInfo
  listeners: string[]
  vpn_portal_cfg?: string
}

export interface StunInfo {
  udp_nat_type: number
  tcp_nat_type: number
  last_update_time: number
}

export interface Route {
  peer_id: number
  ipv4_addr: string
  next_hop_peer_id: number
  cost: number
  proxy_cidrs: string[]
  hostname: string
  stun_info?: StunInfo
  inst_id: string
}

export interface PeerInfo {
  peer_id: number
  conns: PeerConnInfo[]
}

export interface PeerConnInfo {
  conn_id: string
  my_peer_id: number
  peer_id: number
  features: string[]
  tunnel?: TunnelInfo
  stats?: PeerConnStats
  loss_rate: number
}

export interface PeerRoutePair {
  route: Route
  peer?: PeerInfo
}

export interface TunnelInfo {
  tunnel_type: string
  local_addr: string
  remote_addr: string
}

export interface PeerConnStats {
  rx_bytes: number
  tx_bytes: number
  rx_packets: number
  tx_packets: number
  latency_us: number
}

export interface InstanceEvent {
  id: string
  time: string
  event: EasytierEvent
}
export interface EasytierEvent {
  TunDeviceReady?: string
  PeerAdded?: { PeerId: string }
  PeerRemoved?: { PeerId: string }
  PeerConnAdded?: PeerConnInfo
  PeerConnRemoved?: PeerConnInfo
  ListenerAdded?: string
  ListenerAddFailed?: string[]
  ConnectionAccepted?: string[]
  ConnectionError?: string[]
  Connecting?: string
  ConnectError?: string[]
  VpnPortalClientConnected?: string[]
  VpnPortalClientDisconnected?: string[]
  DhcpIpv4Changed?: string[] // (old, new)
  DhcpIpv4Conflicted?: string | null
}
