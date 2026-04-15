# MiniStats

Real-time system metrics dashboard.

Author: Javier Leandro Arancibia

## Quick Install

```bash
# Install (delete old versions first if any)
rm -f ~/.local/bin/ministats /usr/local/bin/ministats
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/dist/ministats.xz | xz -d > ~/.local/bin/ministats && chmod +x ~/.local/bin/ministats
```

## Usage

### Start Server
```bash
ministats server --port 9094
```
Then open `http://localhost:9094` in your browser.

### Start Client (on machines to monitor)
```bash
ministats client --name my-machine --server http://YOUR_SERVER_IP:9094
```

## Build from Source
```bash
bun install
bun run build
```
