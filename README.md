# MiniStats

Real-time system metrics dashboard.

Author: Javier Leandro Arancibia

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash
```

Or manually:
```bash
curl -fsSL https://github.com/javimosch/ministats/releases/latest/download/ministats.xz | xz -d > ~/.local/bin/ministats && chmod +x ~/.local/bin/ministats
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
Then open `http://localhost:9094` in your browser.

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
