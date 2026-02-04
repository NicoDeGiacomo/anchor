# Publishing Anchor

This guide covers how to publish Anchor to iOS App Store, Google Play Store, and the web.

> **Localized App Name:** The app is called **Anchor** in English and **Ancla** in Spanish. This guide includes instructions for setting up localized names on each platform.

## Prerequisites

### General Requirements
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed
- [EAS CLI](https://docs.expo.dev/eas/) installed: `npm install -g eas-cli`
- Expo account: Create one at [expo.dev](https://expo.dev)
- Logged into EAS: `eas login`

### Platform-Specific Requirements

| Platform | Requirements |
|----------|-------------|
| iOS | Apple Developer Account ($99/year), macOS (for some steps) |
| Android | Google Play Developer Account ($25 one-time) |
| Web | Web hosting service (Vercel, Netlify, GitHub Pages, etc.) |

---

## Initial Setup

### 1. Configure EAS Build

Run this command to create an `eas.json` configuration file:

```bash
eas build:configure
```

### 2. Update app.json

Ensure your `app.json` has the required fields:

```json
{
  "expo": {
    "name": "Anchor",
    "slug": "anchor",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourname.anchor",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourname.anchor",
      "versionCode": 1
    }
  }
}
```

> **Note:** Replace `com.yourname.anchor` with your own bundle identifier.

---

## iOS App Store

### Step 1: Apple Developer Account Setup

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Accept all agreements in [App Store Connect](https://appstoreconnect.apple.com/)
3. Set up your payment and tax information

### Step 2: Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** Anchor (or Ancla if Spanish is your primary language)
   - **Primary Language:** English (or Spanish)
   - **Bundle ID:** Select or create `com.yourname.anchor`
   - **SKU:** A unique identifier (e.g., `anchor-app-001`)

### Step 2b: Add Localized App Name (Anchor/Ancla)

iOS allows different app names per language. The localized name appears on the App Store and on the user's home screen.

1. In App Store Connect, go to your app → **App Information**
2. Click **Localizable Information** in the sidebar
3. Click **+** next to **App Store Localizations**
4. Add localizations:

| Language | App Name |
|----------|----------|
| English | Anchor |
| Spanish (Spain) | Ancla |
| Spanish (Mexico) | Ancla |
| Spanish (Latin America) | Ancla |

5. For each language, you can also localize:
   - Subtitle
   - Description
   - Keywords
   - Screenshots
   - What's New text

> **Note:** The name shown on the device's home screen follows the user's device language setting.

### Step 3: Configure Credentials

Let EAS handle your credentials automatically:

```bash
eas credentials
```

Or configure manually:
- **Distribution Certificate:** Created in Apple Developer Portal
- **Provisioning Profile:** App Store distribution profile

### Step 4: Build for iOS

```bash
# Production build for App Store
eas build --platform ios --profile production
```

This will:
- Build your app in the cloud
- Generate an `.ipa` file
- Provide a download link when complete

### Step 5: Submit to App Store

**Option A: Automatic submission via EAS**

```bash
eas submit --platform ios
```

**Option B: Manual submission**

1. Download the `.ipa` from EAS dashboard
2. Open **Transporter** app on macOS
3. Upload the `.ipa` file
4. Go to App Store Connect → Select your app → Add the build

### Step 6: Complete App Store Listing

In App Store Connect, fill in:

- [ ] App screenshots (required sizes: 6.7", 6.5", 5.5" iPhones; optionally iPad)
- [ ] App description
- [ ] Keywords
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] App category (Health & Fitness or Lifestyle)
- [ ] Age rating questionnaire
- [ ] Price (Free or Paid)

### Step 7: Submit for Review

1. Click **Submit for Review**
2. Answer export compliance questions (Anchor likely uses **No** encryption)
3. Wait for Apple review (typically 24-48 hours)

---

## Google Play Store

### Step 1: Google Play Developer Account

1. Create a [Google Play Developer account](https://play.google.com/console/) ($25 one-time fee)
2. Complete identity verification
3. Accept the Developer Distribution Agreement

### Step 2: Create App Listing

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click **Create app**
3. Fill in:
   - **App name:** Anchor (or Ancla if Spanish is your primary language)
   - **Default language:** English (or Spanish)
   - **App or game:** App
   - **Free or paid:** Free (or Paid)
4. Accept declarations

### Step 2b: Add Localized Store Listing (Anchor/Ancla)

Google Play allows you to create separate store listings for each language.

1. Go to **Grow** → **Store presence** → **Main store listing**
2. Click **Manage translations** → **Add your own translations**
3. Select languages to add:
   - Spanish (Spain) - `es-ES`
   - Spanish (Latin America) - `es-419`
   - Spanish (Mexico) - `es-MX`

4. For each Spanish translation, update:

| Field | English | Spanish |
|-------|---------|---------|
| App name | Anchor | Ancla |
| Short description | (translate) | (translate) |
| Full description | (translate) | (translate) |

5. You can also provide localized:
   - Screenshots
   - Feature graphic
   - Promo video

> **Note:** The app name shown on the device follows the Play Store's detected language for the user.

### Step 3: Build for Android

```bash
# Production build for Play Store (AAB format required)
eas build --platform android --profile production
```

This generates an `.aab` (Android App Bundle) file.

### Step 4: Set Up App Signing

Google Play manages your app signing key. On first upload:

1. Go to **Release** → **Production** → **Create new release**
2. Google Play will prompt you to set up Play App Signing
3. Accept to let Google manage your signing key

### Step 5: Submit to Play Store

**Option A: Automatic submission via EAS**

```bash
eas submit --platform android
```

You'll need a Google Service Account JSON key. Follow [EAS Submit docs](https://docs.expo.dev/submit/android/) to create one.

**Option B: Manual submission**

1. Download the `.aab` from EAS dashboard
2. Go to Play Console → Your app → **Release** → **Production**
3. Click **Create new release**
4. Upload the `.aab` file
5. Add release notes
6. Click **Review release** → **Start rollout to Production**

### Step 6: Complete Store Listing

In Play Console, complete these sections:

**Main store listing:**
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (minimum 2, recommended 8)
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)

**App content:**
- [ ] Privacy policy URL
- [ ] App access (if login required)
- [ ] Ads declaration
- [ ] Content rating questionnaire
- [ ] Target audience
- [ ] Data safety form

### Step 7: Submit for Review

1. Ensure all sections show green checkmarks
2. Go to **Publishing overview**
3. Click **Send for review**
4. Wait for Google review (typically a few hours to a few days)

---

## Web Deployment

### Option A: Expo Web Hosting (Easiest)

```bash
# Build for web
npx expo export --platform web

# Deploy to Expo's hosting
eas deploy
```

### Option B: Vercel (Recommended)

#### Setup

1. Create a [Vercel account](https://vercel.com/)
2. Install Vercel CLI: `npm install -g vercel`

#### Deploy

```bash
# Build the web app
npx expo export --platform web

# Deploy to Vercel
cd dist
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Option C: Netlify

#### Setup

1. Create a [Netlify account](https://netlify.com/)
2. Install Netlify CLI: `npm install -g netlify-cli`

#### Deploy

```bash
# Build the web app
npx expo export --platform web

# Deploy to Netlify
netlify deploy --dir=dist --prod
```

### Option D: GitHub Pages

#### Setup

1. Enable GitHub Pages in your repository settings
2. Set source to GitHub Actions

#### Deploy

Create `.github/workflows/deploy-web.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web app
        run: npx expo export --platform web
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Web-Specific Configuration

Update `app.json` for web:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

### Web Localization (Anchor/Ancla)

For web, the page title and meta tags should be localized based on the user's language. Since the app already uses `expo-localization`, you can dynamically set the document title.

**Option A: Dynamic title in your app**

Add this to your root layout or main component:

```typescript
import { getLocales } from 'expo-localization';
import { useEffect } from 'react';
import { Platform } from 'react-native';

useEffect(() => {
  if (Platform.OS === 'web') {
    const locale = getLocales()[0]?.languageCode;
    document.title = locale === 'es' ? 'Ancla' : 'Anchor';
  }
}, []);
```

**Option B: For SEO with multiple URLs**

If you want separate URLs for each language (e.g., `/es/` for Spanish), consider:
- Using a custom web server with locale detection
- Deploying separate builds per language
- Using a service like Vercel with [i18n routing](https://vercel.com/docs/frameworks/nextjs/incremental-static-regeneration)

**Option C: HTML meta tags for search engines**

Update your `web/index.html` (if customized) or use a custom webpack config to add:

```html
<link rel="alternate" hreflang="en" href="https://yoursite.com/" />
<link rel="alternate" hreflang="es" href="https://yoursite.com/es/" />
```

---

## EAS Configuration Reference

Create or update `eas.json` in your project root:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## Releasing Updates

When you're actively developing, you have two types of updates:

1. **OTA Updates (Over-the-Air)** - JavaScript/asset changes pushed instantly without store review
2. **Native Updates** - Require new store submission (when adding native modules, SDK upgrades, etc.)

### Understanding Version Numbers

```json
// app.json
{
  "expo": {
    "version": "1.0.0",        // User-visible version (shown in stores)
    "ios": {
      "buildNumber": "1"       // Internal build number (increment for each upload)
    },
    "android": {
      "versionCode": 1         // Internal build number (must always increase)
    }
  }
}
```

| Field | When to Increment | Example Progression |
|-------|-------------------|---------------------|
| `version` | User-visible changes, new features | 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0 |
| `buildNumber` (iOS) | Every App Store upload | 1 → 2 → 3 → 4 |
| `versionCode` (Android) | Every Play Store upload | 1 → 2 → 3 → 4 |

> **Tip:** Use `"autoIncrement": true` in `eas.json` to automatically increment build numbers.

---

### OTA Updates with EAS Update (Recommended for Frequent Changes)

OTA updates let you push JavaScript and asset changes **instantly** to users without going through App Store/Play Store review. This is ideal for early versions when you're making frequent changes.

#### What Can Be Updated OTA
- ✅ JavaScript code changes
- ✅ Images and assets
- ✅ Styling changes
- ✅ Bug fixes
- ✅ New screens/features (if no new native code)

#### What Requires a Store Update
- ❌ Adding new native modules
- ❌ Updating Expo SDK version
- ❌ Changing app.json native properties (permissions, etc.)
- ❌ Updating native dependencies

#### Setup EAS Update

1. **Configure your project:**

```bash
eas update:configure
```

2. **Update eas.json** to link builds with update channels:

```json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview",
      "distribution": "internal"
    }
  }
}
```

3. **Build your app with update support:**

```bash
eas build --platform all --profile production
```

#### Pushing OTA Updates

```bash
# Push update to production channel
eas update --channel production --message "Fixed button alignment"

# Push update to preview channel (for testing)
eas update --channel preview --message "Testing new feature"
```

#### OTA Update Workflow

```
Make code changes
       ↓
eas update --channel production --message "Description"
       ↓
Users receive update on next app launch (within minutes)
```

> **Note:** Users get the update the next time they open the app. No store review required!

---

### iOS App Store Updates

#### Quick Update Process

1. **Increment version numbers:**

```json
{
  "version": "1.0.1",
  "ios": {
    "buildNumber": "2"
  }
}
```

2. **Build and submit:**

```bash
eas build --platform ios --profile production --auto-submit
```

3. **In App Store Connect:**
   - Add "What's New" release notes
   - Submit for review

#### Using TestFlight for Beta Testing

TestFlight lets you distribute beta versions to testers before public release.

1. **Build for TestFlight:**

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

2. **In App Store Connect:**
   - Go to **TestFlight** tab
   - Add internal testers (up to 100, instant access)
   - Add external testers (up to 10,000, requires brief review)

3. **Testers install via TestFlight app**

> **Tip:** Use TestFlight for internal testing + OTA updates for instant fixes. This combo is powerful for early versions.

---

### Google Play Store Updates

#### Quick Update Process

1. **Increment version numbers:**

```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

2. **Build and submit:**

```bash
eas build --platform android --profile production --auto-submit
```

#### Testing Tracks (Recommended for Early Versions)

Google Play has multiple release tracks for gradual rollout:

| Track | Audience | Review Time | Use Case |
|-------|----------|-------------|----------|
| Internal testing | Up to 100 testers | Minutes | Quick internal testing |
| Closed testing | Invite-only testers | Hours | Beta testing with select users |
| Open testing | Anyone can join | Hours | Public beta |
| Production | Everyone | Hours-Days | Public release |

#### Setting Up Testing Tracks

1. **Configure eas.json for different tracks:**

```json
{
  "submit": {
    "preview": {
      "android": {
        "track": "internal"
      }
    },
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

2. **Submit to internal track:**

```bash
eas submit --platform android --profile preview
```

3. **In Play Console:**
   - Go to **Testing** → **Internal testing**
   - Add tester emails or create a Google Group
   - Share the opt-in link with testers

#### Promoting Between Tracks

In Play Console, you can promote a release from one track to another:

```
Internal testing → Closed testing → Open testing → Production
```

This lets you gradually expand your audience as you gain confidence.

---

### Web Updates

Web updates are the simplest—just redeploy!

```bash
# Build
npx expo export --platform web

# Deploy (example with Vercel)
cd dist && vercel --prod
```

For CI/CD, commits to `main` can automatically trigger deployments.

---

### Recommended Update Strategy for Early Versions

For your first versions with frequent changes:

```
┌─────────────────────────────────────────────────────────────┐
│  Development Flow                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Initial Release                                         │
│     └─> Submit to stores (production)                       │
│     └─> Deploy web                                          │
│                                                             │
│  2. Bug Fixes & Minor Changes                               │
│     └─> Push OTA update (instant, no review)                │
│     └─> Redeploy web                                        │
│                                                             │
│  3. Major Updates / Native Changes                          │
│     └─> Increment version                                   │
│     └─> Test via TestFlight / Internal track                │
│     └─> Promote to production                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Best Practices:**

1. **Use OTA updates aggressively** for JavaScript-only changes
2. **Use testing tracks** (TestFlight/Internal) before production releases
3. **Batch native changes** to minimize store submissions
4. **Keep a changelog** to track what's in each version
5. **Version bump strategically:**
   - Patch (1.0.x): Bug fixes
   - Minor (1.x.0): New features
   - Major (x.0.0): Breaking changes or major redesigns

---

## Quick Reference Commands

```bash
# === INITIAL BUILD & SUBMIT ===

# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Build and submit in one command
eas build --platform ios --auto-submit
eas build --platform android --auto-submit

# Check build status
eas build:list

# Export for web
npx expo export --platform web


# === OTA UPDATES (no store review) ===

# Configure updates (first time only)
eas update:configure

# Push update to production
eas update --channel production --message "Bug fixes"

# Push update to preview/testing
eas update --channel preview --message "Testing new feature"

# List recent updates
eas update:list

# View update details
eas update:view


# === TESTING TRACKS ===

# Submit to iOS TestFlight
eas build --platform ios --profile production
eas submit --platform ios

# Submit to Android internal testing
eas submit --platform android --profile preview


# === VERSION MANAGEMENT ===

# Auto-increment build numbers (configured in eas.json)
eas build --platform all --profile production
```

---

## Checklist Before Publishing

### All Platforms
- [ ] App icon in all required sizes
- [ ] Splash screen configured
- [ ] Version number updated
- [ ] Privacy policy URL ready
- [ ] App description written (English & Spanish)
- [ ] Screenshots prepared (English & Spanish)

### iOS Specific
- [ ] Apple Developer account active
- [ ] App Store Connect listing created
- [ ] Localized app names added (Anchor/Ancla)
- [ ] Export compliance answered
- [ ] Age rating completed

### Android Specific
- [ ] Google Play Developer account active
- [ ] Localized store listing added (Anchor/Ancla)
- [ ] Data safety form completed
- [ ] Content rating questionnaire done
- [ ] Target audience selected

### Web Specific
- [ ] Favicon configured
- [ ] Meta tags for SEO
- [ ] Localized document title (Anchor/Ancla)
- [ ] Hosting service selected
- [ ] Custom domain (optional)

---

## Checklist for Updates

### OTA Update (JavaScript/asset changes only)
- [ ] Test changes locally
- [ ] Run `eas update --channel production --message "Description"`
- [ ] Verify update appears in EAS dashboard
- [ ] Test on a device to confirm update is received

### Store Update (native changes or version bump)
- [ ] Increment `version` in app.json
- [ ] Increment `buildNumber` (iOS) and/or `versionCode` (Android)
- [ ] Test on TestFlight / Internal track first
- [ ] Write "What's New" release notes (English & Spanish)
- [ ] Submit for review
- [ ] Monitor review status

---

## Troubleshooting

### iOS Build Fails
- Ensure bundle identifier matches App Store Connect
- Check Apple Developer account is active
- Verify certificates are valid: `eas credentials`

### Android Build Fails
- Ensure package name is valid (lowercase, no special characters)
- Check versionCode is incremented for updates

### Web Build Fails
- Clear Metro cache: `npx expo start --clear`
- Check for web-incompatible native modules

### Submission Rejected
- **iOS:** Review Apple's [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Android:** Review Google's [Developer Policy Center](https://play.google.com/about/developer-content-policy/)

### OTA Update Not Appearing
- Ensure the app was built with the correct `channel`
- User must fully close and reopen the app
- Check `eas update:list` to verify the update was published
- Verify the runtime version matches between build and update

### Version Code Errors (Android)
- `versionCode` must always increase; it can never go backwards
- If you get "version code already used" error, increment `versionCode`
- Use `eas build:list` to check which version codes have been used

### Build Number Errors (iOS)
- Each upload to App Store Connect needs a unique `buildNumber`
- You can reset `buildNumber` when incrementing `version`
- Example: 1.0.0 (build 1, 2, 3) → 1.1.0 (build 1, 2, 3) is valid

---

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Apple App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Apple TestFlight Documentation](https://developer.apple.com/testflight/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Google Play Testing Tracks](https://support.google.com/googleplay/android-developer/answer/9845334)
