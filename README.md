# MeowGPT 🐱

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Languages](https://img.shields.io/badge/languages-9-green)
![License](https://img.shields.io/badge/license-MIT-blue)
[![CI](https://github.com/dmitthedazed/MeowGPT/actions/workflows/ci.yml/badge.svg)](https://github.com/dmitthedazed/MeowGPT/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-10a37f?logo=github)](https://dmitthedazed.github.io/MeowGPT)

A cat-themed chat interface built with React. Inspired by the viral **[CatGPT](https://catgpt.wvd.io)** parody, MeowGPT expands it into a fully-featured app with multi-language support, persistent chat history, and a polished UI.

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><b>Welcome</b></td>
    <td align="center"><b>Chat</b></td>
    <td align="center"><b>Mobile</b></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/welcome.png" alt="Welcome screen" width="400"/></td>
    <td><img src="public/screenshots/chat.png" alt="Chat view" width="400"/></td>
    <td><img src="public/screenshots/mobile.png" alt="Mobile view" width="200"/></td>
  </tr>
</table>

## ✨ Features

- 💬 **Chat management** — create, rename, and switch between multiple chat sessions
- 🌍 **9 languages** — English, Russian, Ukrainian, Slovak, Polish, Simlish, Meow, Twink, Brainrot; auto-detected from browser locale
- 🎨 **3 themes** — Light, Dark, System (follows OS preference by default)
- 🤖 **3 models** — MeowGPT 🐱, MeowGPT Turbo 🐆, MeowGPT Mini 🐾
-  **Persistent storage** — all chats and settings saved to `localStorage`

## 🚀 Getting Started

**Prerequisites:** Node.js v14+

```bash
git clone https://github.com/dmitthedazed/MeowGPT.git
cd MeowGPT
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## 🛠 Scripts

| Command | Description |
|---|---|
| `npm start` | Start dev server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm test` | Run tests |

## 🌐 Deployment

The project deploys to GitHub Pages via `npm run deploy` (uses the `gh-pages` branch).

Update the `homepage` field in `package.json` to match your repository URL before deploying:

```json
"homepage": "https://yourusername.github.io/MeowGPT"
```

Other supported platforms: Netlify, Vercel, Firebase Hosting, AWS S3.

## 🏗 Tech Stack

- **React 18** with hooks
- **React Icons**
- **CSS3** with custom properties for theming
- **localStorage** for client-side persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatInterface.js   # Chat UI, settings modal, model selection
│   ├── Sidebar.js         # Chat list and navigation
│   └── ImageGeneration.js
├── App.js                 # State management, storage, theme/language logic
├── translations.js        # i18n system for all 9 languages
└── App.css                # Global styles and theme variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit and push your changes
4. Open a Pull Request

To add a new language, add entries to [src/translations.js](src/translations.js) and include the language code in the `SUPPORTED_LANGUAGES` array in [src/App.js](src/App.js).

## 📄 License

MIT
