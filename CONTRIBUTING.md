# Contributing to MeowGPT

Thanks for taking the time to contribute! 🐱

## Getting started

```bash
git clone https://github.com/dmitthedazed/MeowGPT.git
cd MeowGPT
npm install
npm start
```

## Making changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Make sure `npm run build` passes
4. Open a pull request

## Adding a language

1. Add translations to `src/translations.js`
2. Add the language code to `SUPPORTED_LANGUAGES` in `src/App.js`
3. Test that the UI fully renders in the new language

## Reporting bugs

Open an issue using the **Bug report** template.

## Code style

This project uses 2-space indentation and LF line endings (enforced by `.editorconfig`).
