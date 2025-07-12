# Electron Setup & Release Guide

This guide explains how to set up and create releases for the Invoice App as a desktop application using Electron.

## 🏗️ Setup Complete

Your project is now configured with:
- ✅ Electron main process (`electron/main.js`)
- ✅ Updated `package.json` with Electron scripts
- ✅ Next.js configuration for static export
- ✅ GitHub Actions workflow for automated releases
- ✅ Cross-platform build configuration

## 📦 Available Scripts

### Development
```bash
npm run electron:dev    # Start Next.js dev server + Electron
npm run electron        # Start Electron with built app
```

### Building
```bash
npm run build:electron  # Build Next.js app for Electron
npm run dist           # Build for current platform
npm run dist:mac       # Build for macOS (.dmg)
npm run dist:win       # Build for Windows (.exe)
npm run dist:linux     # Build for Linux (.tar.gz + .deb)
npm run dist:all       # Build for all platforms
```

## 🎯 Release Process

### Automated Releases (Recommended)

1. **Create app icons** (see section below)
2. **Commit and push your changes**
3. **Create a git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. **GitHub Actions will automatically**:
   - Build for all platforms
   - Create release artifacts
   - Publish to GitHub releases

### Manual Releases

1. **Build locally**:
   ```bash
   npm run dist:all
   ```
2. **Upload files from `dist/` folder to GitHub releases**

## 🎨 App Icons Required

Before building, you need to create app icons:

### Required Files:
- `electron/assets/icon.icns` - macOS icon
- `electron/assets/icon.ico` - Windows icon
- `electron/assets/icon.png` - Linux icon

### Quick Icon Generation:
```bash
# Install icon generator
npm install -g electron-icon-builder

# Create all icons from a single PNG (1024x1024px recommended)
npx electron-icon-builder --input=your-icon.png --output=electron/assets/
```

## 📋 Build Outputs

The workflow creates these files:

### macOS
- `*.dmg` - Apple Silicon (M1/M2) installer
- `*.dmg` - Intel x64 installer

### Windows
- `*.exe` - Windows installer (NSIS)

### Linux
- `*.tar.gz` - Compressed archive
- `*.deb` - Debian package

## 🔧 Configuration

### electron-builder Settings
Configure in `package.json` under the `build` section:
- App ID: `com.ottendorfcipher.invoice-app`
- Product Name: `Invoice App`
- Categories: Business applications
- Auto-updater: GitHub releases

### GitHub Actions
The workflow (`.github/workflows/release.yml`) triggers on:
- Git tags matching `v*` pattern
- Builds on macOS, Windows, and Linux runners
- Uploads artifacts to GitHub releases

## 🚀 First Release

1. **Add app icons** to `electron/assets/`
2. **Test locally**:
   ```bash
   npm run electron:dev
   ```
3. **Create first release**:
   ```bash
   git add .
   git commit -m "feat: Add Electron desktop app support"
   git push
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 🔍 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Check that all dependencies are installed: `npm ci`
- Verify icons exist in `electron/assets/`

### Database Issues
- SQLite database will be included in the app bundle
- Database location: App's userData directory
- Use `app.getPath('userData')` to access

### Development
- Next.js dev server runs on port 3000
- Electron loads from `http://localhost:3000` in dev mode
- Production loads from `file://` protocol

## 📱 App Features

The Electron app includes:
- **Native window controls**
- **File system access** for database
- **PDF generation** and export
- **Offline functionality**
- **Auto-updater** (via GitHub releases)
- **Cross-platform compatibility**

## 🔒 Security

The app follows Electron security best practices:
- Context isolation enabled
- Node integration disabled
- Remote module disabled
- External links open in browser
- Web security enabled
