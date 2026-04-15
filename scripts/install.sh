#!/bin/bash
set -e

REPO="javimosch/ministats"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY="ministats"

mkdir -p "$INSTALL_DIR"
cd "$(mktemp -d)"

LATEST_URL="https://api.github.com/repos/$REPO/releases/latest?v=$(date +%s.%3N)"
DOWNLOAD_URL=$(curl -s "$LATEST_URL" | grep -o '"browser_download_url": "[^"]*"' | cut -d'"' -f4 | grep "ministats.xz")

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Error: Could not find binary download URL"
  exit 1
fi

echo "Downloading $DOWNLOAD_URL ..."
curl -fsSL "$DOWNLOAD_URL" | xz -d > "$INSTALL_DIR/$BINARY"
chmod +x "$INSTALL_DIR/$BINARY"

echo "Installed to $INSTALL_DIR/$BINARY"
