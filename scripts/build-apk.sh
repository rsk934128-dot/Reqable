#!/bin/bash
set -e

echo "🚀 Starting Reqable Android APK Build Pipeline..."

# 1. Build Web App
echo "📦 Building web assets with Vite..."
npm run build

# 2. Sync to Android Assets
echo "🔄 Syncing assets to Android assets folder..."
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/

# 3. Check Gradlew
cd android
chmod +x gradlew || true

# 4. Assemble Debug/Release APK
echo "🏗️ Assembling Android APK with Gradle..."
if command -v ./gradlew &> /dev/null; then
    ./gradlew assembleDebug
elif command -v gradle &> /dev/null; then
    gradle assembleDebug
else
    echo "⚠️ Gradle not found locally. Assets are pre-packaged in android/app/src/main/assets/public."
    echo "💡 Run this script in an environment with Android SDK / Gradle, or push to GitHub to build via GitHub Actions!"
fi

echo "✅ Reqable Android build step finished!"
