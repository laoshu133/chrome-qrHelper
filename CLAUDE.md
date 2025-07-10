# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "QR Helper" (二维码小助手) that provides QR code functionality:

1. **QR Generation**: Creates QR codes from the current page URL
2. **QR Reading**: Parses QR codes from images on web pages via right-click context menu

**Note**: This extension uses Chrome Extension Manifest V3.

## Architecture

### Core Components

- **Service Worker** (`js/background.js`): Manages context menu, QR code parsing, and clipboard operations as a service worker
- **Popup** (`popup.html` + `js/popup.js`): Main interface for generating QR codes from current tab URL
- **Options** (`options.html` + `js/options.js`): Extension settings page
- **Config System** (`js/config.js`): Configuration management with localStorage and message passing to service worker

### Key Libraries

- **jsqrcode**: QR code decoding library (built from individual modules in `js/jsqrcode/`)
- **Zepto**: Lightweight jQuery alternative for DOM manipulation
- **zepto.qrcode**: QR code generation plugin

### File Structure

```
js/
├── background.js      # Service worker with context menu and QR parsing
├── popup.js          # Popup interface for QR generation
├── config.js         # Configuration system and message handling
├── options.js        # Settings page logic
├── jsqrcode.js       # Built QR decoder library
└── jsqrcode/         # Individual QR decoder modules
    ├── qrcode.js, detector.js, decoder.js, etc.
```

## Development Commands

### Building jsqrcode Library
```bash
node build.js
```
This concatenates all QR code decoder modules from `js/jsqrcode/` into a single `js/jsqrcode.js` file.

### Loading Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

## Key Features

### Internationalization
- Supports English (`_locales/en/`) and Chinese (`_locales/zh_CN/`)
- Uses Chrome's i18n API via `QRHelper.getLang()`

### Configuration
- Settings stored in localStorage with key `qr_helper_config`
- Message passing system for configuration changes to service worker
- Context menu can be enabled/disabled via options

### QR Code Operations
- **Generation**: Uses external API or canvas-based rendering
- **Reading**: Local jsqrcode library for parsing images
- **Clipboard**: Uses chrome.scripting API and navigator.clipboard for V3 compatibility
- **URL Handling**: Automatic tab opening for URL QR codes

## Chrome Extension Permissions (Manifest V3)

- `contextMenus`: Right-click menu for QR reading
- `clipboardWrite`: Write access to clipboard
- `scripting`: Execute scripts for clipboard operations
- `activeTab`: Access to active tab for popup functionality
- `host_permissions`: `*://*/*` for image processing