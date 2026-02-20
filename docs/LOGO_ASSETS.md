# Logo Assets Guide

This document describes all the logo assets needed for the Anchor app.

## General Rules

- **No text** in any asset - use icon only (the app name is displayed separately by the OS/app)
- Export from source files (AI, EPS, or PDF) using Figma, Inkscape, or similar tool

---

## Assets to Create

### 1. `assets/images/icon.png` (iOS App Icon)

| Property | Value |
|----------|-------|
| Size | 1024×1024 px |
| Background | **Solid color** (white, black, or brand color) |
| Icon color | Contrasting color to background |
| Padding | **None** - icon fills entire canvas |
| Transparency | **No** - iOS doesn't support it |

> iOS automatically applies rounded corners. Transparent areas would turn black.

---

### 2. `assets/images/adaptive-icon.png` (Android Adaptive Icon)

| Property | Value |
|----------|-------|
| Size | 1024×1024 px |
| Background | **Transparent** |
| Icon color | Dark (your brand color) |
| Padding | **~30% on all sides** (icon in center ~66%) |
| Transparency | **Yes** |

> Android composites this over the `backgroundColor` in app.json (currently `#ffffff`).
> Keep icon within center **680×680 px** to avoid being cropped by device masks (circle, squircle, etc.).

```
┌────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░┌────────────┐░░░░░ │
│ ░░░│            │░░░░░ │
│ ░░░│     ⚓     │░░░░░ │  ← Safe zone (~66%)
│ ░░░│            │░░░░░ │
│ ░░░└────────────┘░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░ │  ← May be cropped
└────────────────────────┘
```

---

### 3. `assets/images/splash-icon.png` (Splash Screen - Light Mode)

| Property | Value |
|----------|-------|
| Size | 512×512 px |
| Background | **Transparent** |
| Icon color | **Dark** |
| Padding | None needed |
| Transparency | **Yes** |

> Displayed on white background (`#ffffff` from app.json splash config).

---

### 4. `assets/images/splash-icon-dark.png` (Splash Screen - Dark Mode)

| Property | Value |
|----------|-------|
| Size | 512×512 px |
| Background | **Transparent** |
| Icon color | **White/Light** |
| Padding | None needed |
| Transparency | **Yes** |

> Displayed on black background (`#000000` from app.json splash config).

---

### 5. `assets/images/favicon.png` (Web Favicon)

| Property | Value |
|----------|-------|
| Size | 48×48 px |
| Background | **Transparent** |
| Icon color | **Dark** (works best on various browser backgrounds) |
| Padding | None - maximize icon size |
| Transparency | **Yes** |

---

## Quick Reference Table

| File | Size | Background | Icon Color | Padding |
|------|------|------------|------------|---------|
| `icon.png` | 1024×1024 | Solid | Contrast | None |
| `adaptive-icon.png` | 1024×1024 | Transparent | Dark | ~30% |
| `splash-icon.png` | 512×512 | Transparent | Dark | None |
| `splash-icon-dark.png` | 512×512 | Transparent | Light/White | None |
| `favicon.png` | 48×48 | Transparent | Dark | None |

---

## Open Graph Image

The Open Graph image was created using [OG Image Maker](https://ogimagemaker.com/?l=react&tt=Anchor&ts=Grounding+app+for+overwhelming+moments&bc=236c7a&g1=8EC5FC&g2=E0C3FC&g3=FBC2EB&pt=0&sc=2B6CB0&cc=1). Use this link to edit or regenerate the image.

---

## Recommended Tool

**Figma** (free, web-based): [figma.com](https://figma.com)

1. Create free account
2. Create new design file
3. Drag your **PDF** logo file into the canvas
4. Delete the "anchor" text (ungroup first if needed)
5. Select the icon and export at each required size

---

## After Export

Place all files in `assets/images/`, replacing the existing placeholders. The `app.json` is already configured to use these file paths.
