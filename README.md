```markdown
# ⚡ JSON2PrettyTS (JPT)

An interactive, high-performance Chrome Extension built with **Plasmo** and **React** designed to make raw JSON beautiful and instantly generate scoped TypeScript structures.

https://github.com/msulemanb/JSON-2-Pretty-TS/assets/preview.mp4

## ✨ Features

* **Auto-Beautification:** Automatically intercepts raw JSON API endpoints (`.json` files, mock servers, REST APIs) and replaces unformatted text with a styled dark-mode tree layout.
* **Instant TS Interface Generation:** One click extracts clean, deeply nested TypeScript structures from either the root dataset or specific local sub-nodes.
* **Persistent Tree Memory:** Remembers exactly which object layers you collapsed or expanded, retaining your focus state even across site refreshes.
* **Offline Playground Workspace:** Features a self-hosted standalone input dashboard (`options.html`) allowing you to paste and parse arbitrary server log snippets completely offline.

---

## 🚀 Installation Guide

### Option 1: Quick Install (Direct ZIP Download)
Use this if you want to use the extension right away without writing code or installing development tools.

1. At the top of this GitHub repository page, click the green **`Code`** button.
2. Click **`Download ZIP`** from the dropdown menu to download the project source bundle.
3. Locate the downloaded `JSON-2-Pretty-TS-main.zip` file on your computer and extract/unzip it.
4. Open Google Chrome and navigate to: `chrome://extensions/`
5. Turn on the **Developer mode** toggle switch in the top-right corner of the page.
6. Click the **Load unpacked** button in the top-left corner.
7. Select the extracted folder containing the extension assets to install it instantly!

---

### Option 2: Developer Local Setup (From Source)
Use this if you want to inspect the codebase, tweak styles, or contribute to development.

#### Prerequisites
Make sure you have Node.js installed alongside **pnpm** (preferred engine for Plasmo frameworks).
```bash
npm install -g pnpm

```

#### Setup Steps

1. Clone the repository framework locally:
```bash
git clone [https://github.com/msulemanb/JSON-2-Pretty-TS.git](https://github.com/msulemanb/JSON-2-Pretty-TS.git)
cd JSON-2-Pretty-TS

```


2. Install all core engine packages:
```bash
pnpm install

```


3. Boot up the dynamic development hot-reloads engine:
```bash
pnpm dev

```


4. Open Google Chrome, head to `chrome://extensions/`, enable **Developer mode**, click **Load unpacked**, and select the output build directory: `build/chrome-mv3-dev`.

---

## 🛠️ How to Use

### 1. Direct Web-View Injection

Navigate directly to any pure API endpoint layout (e.g., `https://jsonplaceholder.typicode.com/users`). **JPT** will override the screen display to render an interactive interactive tree object workspace.

### 2. Standalone Scratchpad Sandbox

Click on the **JPT** icon in your browser's toolbar popup or hit **"Edit your own JSON data ↗"** on any active page header interface. This opens a separate isolated tab canvas page to paste, parse, and edit raw console clipboard clip logs completely offline.

```

```