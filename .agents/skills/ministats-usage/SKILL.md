---
name: ministats-usage
description: Guide for installing and setting up MiniStats monitoring client with caveats, pitfalls, and best practices learned from deployment. Covers installation, screen session setup, path issues, and common troubleshooting.
---

# MiniStats Usage Guide

Guide for installing and setting up MiniStats monitoring client with lessons learned from real deployments.

## Quick Installation

```bash
# Install ministats
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash

# Start client (without persistence)
ministats client --name machine-name --server http://SERVER_IP:PORT
```

## Installation Details

### Binary Location
- Default install directory: `~/.local/bin/ministats`
- Architecture detection: `x86_64` → `ministats-x64.xz`, `aarch64` → `ministats-arm64.xz`
- Downloads from GitHub releases latest version

### Server Connection
- WebSocket endpoint: `ws://SERVER_IP:PORT/ws`
- Client connects and registers with the provided name

## Critical Caveats & Pitfalls

### 1. Screen May Not Be Installed
**Issue**: Some minimal installations don't include screen by default.

**Symptoms**:
```bash
bash: line 1: screen: command not found
```

**Fix**:
```bash
# Debian/Ubuntu
apt-get update && apt-get install -y screen

# RHEL/CentOS
yum install -y screen
```

### 2. PATH Issues in Screen Sessions
**Issue**: When starting ministats in a screen session, the PATH environment variable may not include `~/.local/bin`, causing "command not found" errors.

**Symptoms**:
```
bash: line 1: ministats: command not found
```

**Fix**: Always use the full path to the binary:
```bash
# Wrong
screen -dmS ministats bash -c 'ministats client --name my-machine --server http://SERVER:PORT; exec bash'

# Correct
screen -dmS ministats bash -c '/root/.local/bin/ministats client --name my-machine --server http://SERVER:PORT; exec bash'
```

### 3. Installation Script Network Issues
**Issue**: The installation script downloads from GitHub, which may fail in restricted network environments or if GitHub is unreachable.

**Symptoms**:
- Download hangs indefinitely
- Connection timeout errors

**Alternative**: Manual installation:
```bash
# Download manually
wget https://github.com/javimosch/ministats/releases/download/v1.0.16/ministats-x64.xz

# Extract and install
mkdir -p ~/.local/bin
xz -d ministats-x64.xz
mv ministats-x64 ~/.local/bin/ministats
chmod +x ~/.local/bin/ministats
```

### 4. SSH Host Key Verification
**Issue**: Direct SSH to new machines may fail due to host key verification.

**Symptoms**:
```
Host key verification failed
```

**Workarounds**:
- Use known SSH aliases or config entries
- Access via intermediate hosts (e.g., Proxmox, bastion)
- Temporarily bypass: `ssh -o StrictHostKeyChecking=no user@host` (not recommended for production)

## Recommended Setup for Persistence

### Screen Session Setup
```bash
# 1. Install screen if needed
apt-get install -y screen

# 2. Install ministats
curl -fsSL https://raw.githubusercontent.com/javimosch/ministats/master/scripts/install.sh | bash

# 3. Start client in screen session with full path
screen -dmS ministats bash -c '/root/.local/bin/ministats client --name machine-name --server http://SERVER_IP:PORT; exec bash'
```

### Verification Commands
```bash
# Check screen session
screen -ls

# Check if ministats process is running
ps aux | grep ministats

# Check screen output
screen -S ministats -X hardcopy /tmp/ministats_screen.txt
cat /tmp/ministats_screen.txt
```

## Systemd Alternative (More Robust)

For production environments, consider using systemd instead of screen:

```bash
# Create systemd service file
cat > /etc/systemd/system/ministats-client.service << EOF
[Unit]
Description=MiniStats Client
After=network.target

[Service]
Type=simple
User=root
ExecStart=/root/.local/bin/ministats client --name machine-name --server http://SERVER_IP:PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable ministats-client.service
systemctl start ministats-client.service

# Check status
systemctl status ministats-client.service
```

## Architecture Compatibility

| Architecture | Binary | Command |
|--------------|--------|---------|
| x86_64 | ministats-x64.xz | Auto-detected |
| aarch64/arm64 | ministats-arm64.xz | Auto-detected |
| Other | Not supported | Manual compile required |

## Troubleshooting

### Client Not Connecting
```bash
# Check if server is reachable
curl http://SERVER_IP:PORT

# Check firewall rules
iptables -L | grep PORT
ufw status

# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://SERVER_IP:PORT/ws
```

### High Memory Usage
MiniStats is lightweight, but if you see high memory:
- Check for zombie processes: `ps aux | grep defunct`
- Restart the client: `screen -S ministats -X quit` then restart
- Check for memory leaks in the specific version

### Binary Permissions
```bash
# Ensure binary is executable
chmod +x ~/.local/bin/ministats

# Check permissions
ls -la ~/.local/bin/ministats
```

## Best Practices

1. **Always use full paths** in scripts and systemd services
2. **Use systemd for production** instead of screen sessions
3. **Monitor connection status** regularly via the dashboard
4. **Keep binary updated**: `ministats update` (if available)
5. **Document machine names** for easy identification in dashboard
6. **Test connectivity** before deploying to production
7. **Use meaningful machine names** that match your infrastructure naming convention

## Version Management

```bash
# Check version
ministats -v

# Update (if supported)
ministats update
```

## Network Requirements

- Outbound HTTPS access to github.com (for installation/updates)
- Outbound WebSocket access to server IP:PORT
- No inbound ports required on client machine
- Firewall must allow outbound connections to server

## Resource Impact

Typical resource usage per client:
- Memory: ~50-100 MB
- CPU: Minimal (<1% on idle systems)
- Network: Minimal (metrics streaming every few seconds)
- Disk: ~5 MB for binary
