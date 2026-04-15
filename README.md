# MiniStats

Real-time system metrics dashboard.

## Install

```bash
# Server
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/dist/ministats.xz | xz -d > /usr/local/bin/ministats && chmod +x /usr/local/bin/ministats

# Client
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/dist/ministats.xz | xz -d > /usr/local/bin/ministats && chmod +x /usr/local/bin/ministats
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
