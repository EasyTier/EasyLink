use std::{
    collections::BTreeMap,
    net::Ipv4Addr,
    sync::atomic::{AtomicBool, Ordering},
    time::Duration,
};

use anyhow::Context;
use chrono::{DateTime, Local};
use dashmap::DashMap;
use easytier::{
    common::{
        config::{ConfigLoader, NetworkIdentity, PeerConfig, TomlConfigLoader, VpnPortalConfig},
        global_ctx::GlobalCtxEvent,
    },
    launcher::{MyNodeInfo, NetworkInstance},
    rpc::{PeerInfo, Route},
    utils::PeerRoutePair,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Deserialize, Serialize, Debug, Default)]
#[serde(rename_all(serialize = "snake_case", deserialize = "camelCase"))]
pub struct NetworkConfig {
    id: String,
    dhcp: bool,
    ipv4: Option<String>,
    device_name: Option<String>,
    token: Option<String>,
    network_name: Option<String>,
    network_secret: Option<String>,
    peer_urls: Vec<String>,
    proxy_cidrs: Option<Vec<String>>,
    vpn_portal_port: Option<u32>,
    vpn_portal_addr: Option<String>,
    listener_urls: Vec<String>,
    rpc_port: Option<u32>,
}

impl NetworkConfig {
    fn gen_config(&self) -> Result<TomlConfigLoader, anyhow::Error> {
        let cfg = TomlConfigLoader::default();
        cfg.set_id(
            self.id
                .parse()
                .with_context(|| format!("failed to parse instance id: {}", self.id))?,
        );
        cfg.set_hostname(self.device_name.clone());

        if self.network_name.is_none() && self.token.is_none() {
            return Err(anyhow::anyhow!("no token or network provided"));
        }

        let (n_name, n_secret) = if self.network_name.is_none() {
            let digest = md5::compute(self.token.clone().unwrap());
            let str = format!("{:x}", digest);
            (
                str.get(0..8).unwrap_or_default().to_owned(),
                str.get(8..).unwrap_or_default().to_owned(),
            )
        } else {
            (
                self.network_name.clone().unwrap(),
                self.network_secret.clone().unwrap_or_default(),
            )
        };

        cfg.set_inst_name(n_name.clone());
        cfg.set_network_identity(NetworkIdentity::new(n_name, n_secret));

        cfg.set_dhcp(self.dhcp);
        if !self.dhcp && self.ipv4.is_some() {
            let ipv4 = self.ipv4.clone().unwrap();
            if ipv4.len() > 0 {
                cfg.set_ipv4(Some(ipv4.parse::<Ipv4Addr>().with_context(|| {
                    format!("failed to parse ipv4 address: {:?}", self.ipv4)
                })?))
            }
        }

        let mut peers = vec![];
        for peer_url in self.peer_urls.iter() {
            if peer_url.is_empty() {
                continue;
            }
            peers.push(PeerConfig {
                uri: peer_url
                    .parse()
                    .with_context(|| format!("failed to parse peer uri: {}", peer_url))?,
            });
        }

        if peers.len() == 0 {
            return Err(anyhow::anyhow!("no peer urls provided"));
        }

        cfg.set_peers(peers);

        let mut listener_urls = vec![];
        for listener_url in self.listener_urls.iter() {
            if listener_url.is_empty() {
                continue;
            }
            listener_urls.push(
                listener_url
                    .parse()
                    .with_context(|| format!("failed to parse listener uri: {}", listener_url))?,
            );
        }
        cfg.set_listeners(listener_urls);

        if let Some(proxy_cidrs) = self.proxy_cidrs.clone() {
            for n in proxy_cidrs.iter() {
                cfg.add_proxy_cidr(
                    n.parse()
                        .with_context(|| format!("failed to parse proxy network: {}", n))?,
                );
            }
        }

        cfg.set_rpc_portal(
            format!("127.0.0.1:{}", self.rpc_port.unwrap_or_default())
                .parse()
                .with_context(|| {
                    format!(
                        "failed to parse rpc portal port: {}",
                        self.rpc_port.unwrap_or_default()
                    )
                })?,
        );

        if self.vpn_portal_addr.is_some() {
            let cidr = format!("{}/24", self.vpn_portal_addr.clone().unwrap());
            cfg.set_vpn_portal_config(VpnPortalConfig {
                client_cidr: cidr
                    .parse()
                    .with_context(|| format!("failed to parse vpn portal client cidr: {}", cidr))?,
                wireguard_listen: format!("0.0.0.0:{}", self.vpn_portal_port.unwrap_or(22022))
                    .parse()
                    .with_context(|| {
                        format!(
                            "failed to parse vpn portal wireguard listen port. {}",
                            self.vpn_portal_port.unwrap_or(22022)
                        )
                    })?,
            });
        }

        Ok(cfg)
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct NetworkInstanceInfo {
    id: String,
    node: MyNodeInfo,
    events: Vec<(DateTime<Local>, GlobalCtxEvent)>,
    routes: Vec<Route>,
    peers: Vec<PeerInfo>,
    #[serde(rename(deserialize = "camelCase"))]
    peer_route_pairs: Vec<PeerRoutePair>,
    running: bool,
    error: Option<String>,
}

static INSTANCE_MAP: once_cell::sync::Lazy<DashMap<String, NetworkInstance>> =
    once_cell::sync::Lazy::new(DashMap::new);

static EMIT_INSTANCE_INFO: once_cell::sync::Lazy<AtomicBool> =
    once_cell::sync::Lazy::new(|| AtomicBool::new(false));

#[tauri::command]
pub fn parse_network_config(cfg: NetworkConfig) -> Result<String, String> {
    let toml = cfg.gen_config().map_err(|e| e.to_string())?;
    Ok(toml.dump())
}

#[tauri::command]
pub async fn start_network_instance(app: AppHandle, cfg: NetworkConfig) -> Result<(), String> {
    if INSTANCE_MAP.contains_key(&cfg.id) {
        return Err("instance already exists".to_string());
    }
    let id = cfg.id.clone();
    let cfg = cfg.gen_config().map_err(|e| e.to_string())?;
    let mut instance = NetworkInstance::new(cfg);
    instance.start().map_err(|e| e.to_string())?;

    if !EMIT_INSTANCE_INFO.load(Ordering::Relaxed) {
        EMIT_INSTANCE_INFO.store(true, Ordering::Relaxed);
        tracing::info!("instance info emit started");
        tokio::spawn(async move {
            let mut ret = vec![];
            let mut flag = 0;
            loop {
                for instance in INSTANCE_MAP.iter() {
                    if let Some(info) = instance.get_running_info() {
                        ret.push(NetworkInstanceInfo {
                            id: instance.key().clone().to_lowercase(),
                            node: info.my_node_info,
                            events: info.events,
                            routes: info.routes,
                            peers: info.peers,
                            peer_route_pairs: info.peer_route_pairs,
                            running: info.running,
                            error: info.error_msg,
                        });
                    }
                }

                if ret.is_empty() {
                    flag += 1;
                    if flag > 5 {
                        EMIT_INSTANCE_INFO.store(false, Ordering::Relaxed);
                        tracing::info!("instance info emit stopped");
                        break;
                    }
                } else {
                    flag = 0;
                }

                let _ = app.emit("network_instance_info", &ret);
                ret.clear();
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        });
    }

    INSTANCE_MAP.insert(id, instance);
    Ok(())
}

#[tauri::command]
pub fn stop_network_instance(id: String) -> Result<(), String> {
    let _ = INSTANCE_MAP.remove(&id);
    tracing::info!("instance {} stopped", id);
    Ok(())
}

#[tauri::command]
pub fn collect_network_infos() -> Result<BTreeMap<String, NetworkInstanceInfo>, String> {
    let mut ret = BTreeMap::new();
    for instance in INSTANCE_MAP.iter() {
        if let Some(info) = instance.get_running_info() {
            ret.insert(
                instance.key().clone(),
                NetworkInstanceInfo {
                    id: instance.key().clone().to_lowercase(),
                    node: info.my_node_info,
                    events: info.events,
                    routes: info.routes,
                    peers: info.peers,
                    peer_route_pairs: info.peer_route_pairs,
                    running: info.running,
                    error: info.error_msg,
                },
            );
        }
    }
    Ok(ret)
}

#[tauri::command]
pub fn test_config(config: NetworkConfig) -> Result<NetworkConfig, String> {
    println!("{:?}", config);
    Ok(config)
}

#[tauri::command]
pub fn is_autostart() -> Result<bool, String> {
    let args: Vec<String> = std::env::args().collect();
    println!("{:?}", args);
    Ok(args.contains(&crate::AUTOSTART_ARG.to_owned()))
}
