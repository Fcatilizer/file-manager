# Server dashboard

Admins can open the grid icon beside the bucket selector. Readings refresh every five seconds while the dashboard is visible. Closing it or hiding the tab stops client requests. The server coalesces concurrent requests and caches readings for 2.5 seconds; no permanent sampler runs in the background.

## What the readings mean

- CPU: total and per-logical-core utilization measured between samples. A first sample (or one after a long pause) takes about 250 ms. Missing/reset counters display unavailable.
- Linux RAM: total minus `MemAvailable`, accounting for reclaimable cache. Swap uses `SwapTotal` minus `SwapFree`. These kernel counters normally describe the host in Docker, not the Vault process. A finite cgroup v2 container memory limit is displayed separately when available.
- Temperatures: readable hwmon sensors, with thermal-zone fallback.
- GPUs: each DRM adapter has a separate card. AMD utilization/VRAM is read when its driver exposes those sysfs counters. NVIDIA metrics use `nvidia-smi` only if already available in the container. Many older Intel/radeon drivers do not expose utilization through sysfs. Frequency is never used as a substitute for utilization.
- Batteries: charge, charge/discharge status, power and capacity health where available. No serial numbers are exposed.
- Storage: total, occupied, available and reserved bytes for each configured filesystem. This includes all services sharing that filesystem, not just Vault objects. Disk checks are cached for 30 seconds and do not scan file contents or run `du`. Multiple entries sharing a storage pool are never added together.
- Time: server timezone, UTC and the viewer's timezone. Docker can use UTC while the Fedora host uses Asia/Kolkata; this is expected.

The endpoint `/api/system/metrics` requires an authenticated admin and sends `Cache-Control: no-store`. It does not provide host control, terminal access or arbitrary filesystem reads. On Vercel it explicitly reports that home-server hardware is unavailable. macOS/local development reads the Mac running the backend, not a remote Fedora or RustFS server. It includes CPU, RAM with reclaimable file cache, swap, battery charge/status and Apple AGX GPU utilization where the driver reports it. CPU temperatures and battery health remain unavailable on this unprivileged Mac collector.

## Dokploy / Docker

Redeploy Vault after building this change. Standard Linux Docker installations expose `/proc` and much of `/sys` already, so try the dashboard first.

If hardware sensors are hidden, add a **read-only** host bind mount in the Vault service's Dokploy volume configuration:

- Host path: `/sys`
- Container path: `/host/sys`
- Read only: enabled
- Environment: `VAULT_SYS_ROOT=/host/sys`

Mount the complete sysfs tree so class symlinks resolve. Do not use a Docker socket, privileged mode, writable sysfs or SELinux relabel flags for this dashboard. Host drivers must expose a sensor for it to be displayed; a mount cannot create missing GPU counters. Restart/redeploy the Vault service to apply mount/environment changes.

`VAULT_PROC_ROOT` optionally selects an existing alternate proc mount; default `/proc`. There is no need to expose host processes just for these normal Docker kernel counters.

NVIDIA GPU metrics require the host NVIDIA driver and an appropriately configured NVIDIA container runtime with `nvidia-smi` available. Vault does not install drivers or grant device access automatically.

## Adapter labels

Hardware does not universally expose whether an adapter is integrated or discrete. Known legacy Intel HD IDs and NVIDIA tooling are recognized; other cards are labelled “Type unreported” rather than guessed from the primary-display flag. You can supply friendly names and confirmed types by PCI address (shown on each card):

```env
VAULT_GPU_LABELS={"0000:00:02.0":{"name":"Intel HD Graphics 4000","kind":"integrated"},"0000:01:00.0":{"name":"AMD Radeon","kind":"discrete"}}
```

Use addresses and types matching your hardware. Labels do not change whether utilization is available.

## Disk storage and monitored machine

The dashboard reports the machine **running the Vault backend**. `localhost:3000` on a Mac monitors that Mac. Deploy/open the updated app on your Fedora server to see Fedora. A remote RustFS S3 endpoint does not provide host disk free-space metrics through normal bucket APIs.

By default the disk card checks `/`. In Docker this is the backing filesystem of the container writable layer; it normally includes the other Docker workloads on that same disk, but not data stored on separate volumes/disks. It must not be interpreted as a sum of every disk in your server.

For explicit host disk monitoring, choose an existing directory on the desired filesystem and mount it **read-only** into Vault. An empty directory is sufficient because `statfs` reads filesystem counters; Vault does not need your Docker socket or access to Docker's data directory. For example, after creating `/var/lib/vault-metrics-disk` on the Fedora root filesystem:

- Dokploy bind mount source: `/var/lib/vault-metrics-disk`
- Destination: `/host-storage`
- Read only: enabled
- Environment:

```env
VAULT_MACHINE_LABEL=Fedora home server
VAULT_STORAGE_PATHS=[{"path":"/host-storage","label":"Home server disk"}]
```

This reports the **entire filesystem** containing that directory, including RustFS, other Dokploy apps, images, logs and OS files on that filesystem. Free-to-use excludes filesystem-reserved blocks. It does not attribute bytes to individual applications.

If RustFS uses a second disk, bind an empty directory from that disk separately and add another entry, for example:

```env
VAULT_STORAGE_PATHS=[{"path":"/host-storage","label":"System and Dokploy"},{"path":"/rustfs-storage","label":"RustFS disk"}]
```

Use one entry per filesystem/storage pool to avoid displaying the same capacity twice. Up to 12 explicit paths are supported. Invalid configuration or unavailable mounts produces an unavailable reading rather than a misleading fallback. Redeploy to apply these settings. If RustFS lives on another physical server, that server needs its own metrics endpoint/collector to report its physical capacity.
