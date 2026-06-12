# Changelog

All notable changes to MiniStats will be documented in this file.

## [Unreleased]

### Added
- Compact 2-column grid layout for better screen fit
- Daemon commands (start/stop/status) for client management
- Desktop background setup skill for live wallpaper integration
- Stale client detection with visual warnings (5-minute threshold)
- Automatic client pruning with configurable TTL (default 24 hours)
- Time-ago display for stale client badges
- Periodic client re-rendering (30-second intervals)

### Changed
- Reduced font sizes and spacing for compact display
- Increased max-width from 700px to 1200px
- Machine name column width reduced from 140px to 100px
- Build script: removed minify/bytecode flags for stability
- Updated .gitignore to exclude dist binaries

### Fixed
- Desktop background screenshot timing - now waits for client data before capture
- WebSocket connection handling for dashboard clients
- Client reconnection logic with exponential backoff

## [1.0.16] - 2026-04-16

### Added
- Initial release
- Real-time system metrics dashboard
- WebSocket-based client-server communication
- Memory, disk, and CPU monitoring
- Multi-machine support
- Embedded HTML dashboard
- Binary distribution for Linux x64 and ARM64