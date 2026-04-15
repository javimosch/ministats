# MiniStats

Real-time system metrics dashboard.

## Commands

### Server
```sh
bun run src/index.ts server --port 9094
```

### Client
```sh
bun run src/index.ts client --name <machine-name> --server http://<server-host>:9094
```

## Build
```sh
bun run build
```

## Usage

1. Start the server:
```sh
bun run start server --port 9094
```

2. Open dashboard at `http://localhost:9094`

3. Start clients on machines you want to monitor:
```sh
bun run start client --name prod-web-01 --server http://your-server:9094
```
