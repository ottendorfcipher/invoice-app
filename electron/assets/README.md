# App Icons

This directory should contain the app icons for different platforms:

- `icon.icns` - macOS icon (required for .dmg builds)
- `icon.ico` - Windows icon (required for .exe builds)  
- `icon.png` - Linux icon (required for .tar.gz and .deb builds)

## Icon Requirements

- **macOS (.icns)**: 512x512px minimum, should include multiple sizes
- **Windows (.ico)**: 256x256px minimum, should include multiple sizes
- **Linux (.png)**: 512x512px minimum

## Creating Icons

You can create these icons from a single high-resolution PNG using tools like:
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
- [app-icon](https://www.npmjs.com/package/app-icon)
- Online converters

Example command to generate all icons from a single PNG:
```bash
npx electron-icon-builder --input=icon-source.png --output=./
```
