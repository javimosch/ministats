# MiniStats

Real-time system metrics dashboard with minimal resource footprint.

## Features

- **Real-time Monitoring**: Live system metrics (memory, disk, CPU) via WebSocket
- **Multi-machine Support**: Monitor multiple machines from a single dashboard
- **Stale Client Detection**: Visual warnings for inactive clients
- **Automatic Pruning**: Configurable TTL for removing stale clients
- **Compact UI**: 2-column grid layout optimized for desktop backgrounds
- **Desktop Background**: Live wallpaper integration with automatic updates
- **Lightweight**: Single binary, no runtime dependencies
- **Cross-platform**: Linux x64 and ARM64 support

## Quick Start

### Server

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash

# Start server
ministats server --port 9094
```

### Client

```bash
# Install (same as server)
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash

# Start client
ministats client --name my-machine --server http://SERVER_IP:9094
```

### Daemon Mode

```bash
# Start client as daemon
ministats daemon start --name my-machine --server http://SERVER_IP:9094

# Check status
ministats daemon status

# Stop daemon
ministats daemon stop
```

## Dashboard

Access the dashboard at `http://SERVER_IP:PORT` to view real-time metrics from all connected machines.

## Desktop Background

Set up MiniStats as a live desktop background with automatic updates. See the [ministats-desktop-bg skill](../.agents/skills/ministats-desktop-bg/SKILL.md) for detailed setup instructions.

## Architecture

- **Runtime**: Bun (JavaScript/TypeScript)
- **Protocol**: WebSocket for real-time communication
- **Storage**: In-memory with configurable TTL
- **UI**: Embedded HTML/CSS/JavaScript in single binary

## Configuration

### Environment Variables

- `MINISTATS_TTL_HOURS`: Client time-to-live in hours (default: 24)

### Client Stale Detection

- **Warning threshold**: 5 minutes without updates
- **Pruning threshold**: Configurable via `MINISTATS_TTL_HOURS`

## Performance

Typical resource usage per client:
- **Memory**: 50-100 MB
- **CPU**: <1% on idle systems
- **Network**: Minimal (metrics streaming every 5 seconds)
- **Disk**: ~5 MB for binary

## Installation

### Binary Download

```bash
# Linux x64
wget https://github.com/javimosch/ministats/releases/download/v1.0.16/ministats-x64.xz
xz -d ministats-x64.xz
mv ministats-x64 ministats
chmod +x ministats
sudo mv ministats /usr/local/bin/

# Linux ARM64
wget https://github.com/javimosch/ministats/releases/download/v1.0.16/ministats-arm64.xz
xz -d ministats-arm64.xz
mv ministats-arm64 ministats
chmod +x ministats
sudo mv ministats /usr/local/bin/
```

### Install Script

```bash
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash
```

## Development

```bash
# Clone repository
git clone https://github.com/javimosch/ministats.git
cd ministats

# Install dependencies
bun install

# Run in development
bun run dev

# Build binary
bun run build

# Test locally
./dist/ministats server --port 9094
```

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Author

Javier Leandro Arancibia

## Related Projects

- [ministats-usage skill](../.agents/skills/ministats-usage/SKILL.md) - Client installation and deployment guide
- [ministats-desktop-bg skill](../.agents/skills/ministats-desktop-bg/SKILL.md) - Desktop background setup