# Contributing to Anchor

Thank you for your interest in contributing to Anchor! Every contribution helps make this tool better for people who need it.

## How to Contribute

### Reporting Bugs

1. Check the [existing issues](https://github.com/NicoDeGiacomo/anchor/issues) to avoid duplicates
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Device/platform info (iOS, Android, Web, OS version)
   - Screenshots if applicable

### Suggesting Features

1. Open an issue with the **feature request** label
2. Describe the feature and why it would be useful
3. Keep in mind Anchor's core principles: minimal, private, offline, evidence-based

### Adding Translations

Anchor supports English, Spanish, and Portuguese. To add a new language or improve an existing translation:

1. **Phrase content** lives in `content/<mode>/anchors.<lang>.json` (e.g., `content/panic/anchors.fr.json`)
2. **UI strings** are defined as `TRANSLATIONS` objects in each screen file under `app/`
3. **Language registration** happens in `contexts/LanguageContext.tsx`

To add a new language:
1. Create `anchors.<lang>.json` files for all 5 modes
2. Add a translation entry in each screen's `TRANSLATIONS` object
3. Register the language code in `LanguageContext.tsx`
4. Submit a PR with all the changes

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test on at least one platform (web is the easiest)
5. Commit with a clear message describing the change
6. Push and open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/anchor.git
cd anchor

# Install dependencies
npm install

# Start the dev server
npm start

# Run on specific platforms
npm run web      # Web browser
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Project Structure

```
anchor/
├── app/                # Screens and navigation (Expo Router)
│   ├── (tabs)/        # Tab screens (home, settings, about)
│   └── mode/          # Mode display screen
├── components/        # Reusable React components
├── content/           # Phrase data (JSON, multi-language)
├── contexts/          # React Context providers (language, theme)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── assets/            # Images, fonts, icons
```

## Guidelines

- **Keep it minimal.** Anchor's strength is simplicity. Avoid feature bloat.
- **Privacy first.** Never add analytics, tracking, or network calls.
- **Offline always.** The app must work without internet.
- **Accessibility matters.** Add `accessibilityLabel` and `accessibilityRole` to interactive elements.
- **Test your changes.** At minimum, verify on web before submitting.

## Questions?

Open an issue or reach out on [LinkedIn](https://www.linkedin.com/in/nicolasdegiacomo/).
