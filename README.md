# ERFlute

ERD Modeling Tool for Startup & Incremental Development as Desktop Application

## Features

- Simple but Graphical
- Simple but Functional
- Mergeable ERD

## Prerequisites

- Node.js 20+ is recommended.
  - Recommended: use a version manager.
    - macOS/Linux (nvm): [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
    - Windows (nvm-windows): [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)
  - Alternative: install directly from the official installer.
    - [https://nodejs.org/en/download](https://nodejs.org/en/download)
- pnpm is recommended.
  - Install: [https://pnpm.io/installation](https://pnpm.io/installation)
- To run the Tauri desktop app, install the Rust toolchain and Tauri prerequisites for your OS.
  - Rust (rustup): [https://rustup.rs/](https://rustup.rs/)
  - Tauri prerequisites: [https://tauri.app/start/prerequisites/](https://tauri.app/start/prerequisites/)

## Setup

1. Install dependencies

```bash
pnpm install
```

2. Run the Tauri desktop app

```bash
pnpm tauri dev
```

## License

MIT. See [LICENSE](LICENSE).
