# MiniStats

Real-time system metrics dashboard for monitoring multiple machines.

Author: Javier Leandro Arancibia

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash
```

## Usage

### Check version
```bash
ministats -v
```

### Start Server
```bash
ministats server --port 9094
```
Open `http://localhost:9094` in your browser.

### Start Client (on machines to monitor)
```bash
ministats client --name my-machine --server http://YOUR_SERVER_IP:9094
```

### Update
```bash
ministats update
```

## Build from Source

```bash
bun install
bun run build
```

## Features

- Real-time metrics via WebSocket
- Memory, disk, CPU monitoring
- Multiple client support
- Auto-update mechanism
- Multi-architecture (x64, arm64)
