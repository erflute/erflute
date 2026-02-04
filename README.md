# ERFlute

ERD Modeling Tool for Startup & Incremental Development as Desktop Application

## Features

- Simple but Graphical
- Simple but Functional
- Mergeable ERD

## Prerequisites

- Node.js 20+ is recommended.
  - Recommended: use a version manager.
    - macOS/Linux (nvm): https://github.com/nvm-sh/nvm
    - Windows (nvm-windows): https://github.com/coreybutler/nvm-windows
  - Alternative: install directly from the official installer.
    - https://nodejs.org/en/download
- To run the Tauri desktop app, install the Rust toolchain and Tauri prerequisites for your OS.
  - Rust (rustup): https://rustup.rs/
  - Tauri prerequisites: https://tauri.app/start/prerequisites/

## Setup

1. Install dependencies

```bash
npm install
```

2. Run the web app in development mode

```bash
npm run dev
```

3. Build the production web assets

```bash
npm run build
```

4. (Optional) Run the Tauri desktop app

```bash
npm run tauri dev
```

## License

MIT. See `LICENSE`.
