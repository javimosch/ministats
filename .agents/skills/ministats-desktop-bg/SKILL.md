# MiniStats Desktop Background Setup

Guide for setting up MiniStats dashboard as a live desktop background with automatic updates.

## Prerequisites

- MiniStats server running (typically on vps1:9094)
- Google Chrome installed
- GNOME desktop environment
- Cron job capability

## Setup Script

Create the wallpaper update script at `~/ai/system/update-wallpaper.sh`:

```bash
#!/bin/bash
# Update desktop wallpaper with MiniStats dashboard screenshot

WALLPAPER_DIR="/home/jarancibia/.cache/desktop-wallpaper"
PNG_FILE="$WALLPAPER_DIR/ministats.png"
MINISTATS_URL="http://188.245.71.48:9094"

# Create directory if it doesn't exist
mkdir -p "$WALLPAPER_DIR"

# Wait for data to be available on the server
echo "Waiting for client data..."
for i in {1..20}; do
  CLIENTS=$(curl -s http://188.245.71.48:9094/api/clients | grep -o '"name":"[^"]*"' | wc -l)
  if [ "$CLIENTS" -gt 0 ]; then
    echo "Found $CLIENTS clients, taking screenshot..."
    break
  fi
  echo "Waiting for data... ($i/20)"
  sleep 1
done

# Take screenshot of the ministats dashboard using headless Chrome
# Increased virtual time budget to ensure data loads
google-chrome --headless --disable-gpu --window-size=1920,1080 --virtual-time-budget=15000 --screenshot="$PNG_FILE" "$MINISTATS_URL" 2>/dev/null

# Set as GNOME background using gsettings
gsettings set org.gnome.desktop.background picture-uri "file://$PNG_FILE"
gsettings set org.gnome.desktop.background picture-uri-dark "file://$PNG_FILE"

echo "Updated wallpaper at $(date)"
```

Make it executable:
```bash
chmod +x ~/ai/system/update-wallpaper.sh
```

## Cron Job Setup

Add to crontab for automatic updates every minute:
```bash
crontab -e
```

Add this line:
```bash
* * * * * /home/jarancibia/ai/system/update-wallpaper.sh >> /home/jarancibia/.cache/desktop-wallpaper/update.log 2>&1
```

## Manual Testing

Test the script manually:
```bash
~/ai/system/update-wallpaper.sh
```

Check the result:
```bash
ls -la ~/.cache/desktop-wallpaper/ministats.png
gsettings get org.gnome.desktop.background picture-uri
```

## Troubleshooting

### Screenshot shows only brand/logo

**Issue:** Chrome takes screenshot before WebSocket data loads.

**Solution:** The script now waits for client data via API check before screenshot. If still failing, increase `--virtual-time-budget` value.

### Chrome not found

**Issue:** `google-chrome` command not available.

**Solution:** Install Chrome or use alternative:
```bash
# For Chrome
sudo apt install google-chrome-stable

# For Firefox (alternative)
firefox --headless --screenshot="$PNG_FILE" "$MINISTATS_URL"
```

### GNOME background not updating

**Issue:** gsettings command fails or background doesn't change.

**Solution:** Check GNOME version and command syntax:
```bash
# Check current background
gsettings get org.gnome.desktop.background picture-uri

# Test manually
gsettings set org.gnome.desktop.background picture-uri "file:///path/to/image.png"
```

### Cron job not running

**Issue:** Wallpaper not updating automatically.

**Solution:** Check cron logs and permissions:
```bash
# Check cron logs
tail -f ~/.cache/desktop-wallpaper/update.log

# Verify cron job
crontab -l

# Test cron manually
/home/jarancibia/ai/system/update-wallpaper.sh
```

## Customization

### Change MiniStats Server URL

Edit the `MINISTATS_URL` variable in the script:
```bash
MINISTATS_URL="http://your-server:port"
```

### Change Screenshot Resolution

Modify the `--window-size` parameter:
```bash
google-chrome --headless --disable-gpu --window-size=2560,1440 --screenshot="$PNG_FILE" "$MINISTATS_URL"
```

### Change Update Frequency

Modify the cron schedule:
```bash
# Every 5 minutes
*/5 * * * * /home/jarancibia/ai/system/update-wallpaper.sh >> /home/jarancibia/.cache/desktop-wallpaper/update.log 2>&1

# Every 30 seconds (not recommended - high resource usage)
* * * * * sleep 30; /home/jarancibia/ai/system/update-wallpaper.sh >> /home/jarancibia/.cache/desktop-wallpaper/update.log 2>&1
```

## Architecture

**Data Flow:**
1. MiniStats clients send metrics to server via WebSocket
2. Server stores metrics in memory
3. Cron job triggers wallpaper update script
4. Script checks API for client data availability
5. Chrome headless takes screenshot of dashboard
6. gsettings sets screenshot as desktop background

**Key Components:**
- **MiniStats Server:** Central metrics collection and dashboard serving
- **Chrome Headless:** Screenshot generation with virtual time budget
- **gsettings:** GNOME background management
- **Cron:** Automated scheduling

## Performance Considerations

- **Resource Usage:** Chrome headless + screenshot ~100MB RAM, ~5-10 seconds
- **Network:** API check + dashboard load ~1-2MB per update
- **Disk:** PNG file ~50-100KB, logs grow over time
- **Recommendation:** 1-minute interval is reasonable for most systems

## Security Notes

- Script runs as user, no root privileges required
- No sensitive data in logs (only timestamps and client counts)
- Dashboard URL should be internal or properly secured
- Consider adding authentication if MiniStats server is public

## Related Skills

- ministats-usage: MiniStats client installation and setup
- jar-vps1-manage: VPS1 server management where MiniStats server runs