#!/bin/bash
# Rebuild the Windows installer: app page -> packaged folder -> icon patch -> NSIS installer.
set -e
cd "$(dirname "$0")"
cp "/home/claude/remodel-studio/github/Remodel Studio offline.html" app/index.html
VER=$(node -p "require('./package.json').version")
rm -rf dist
npx electron-builder --win dir --x64 >/dev/null
node patch-exe.mjs "dist/win-unpacked/Remodel Studio.exe" build/icon.ico $VER
cp build/file.ico build/icon.ico dist/win-unpacked/resources/
sed -i "s/^!define VER .*/!define VER \"$VER\"/" installer.nsi
N=/root/.cache/electron-builder/nsis/nsis-3.0.4.1
NSISDIR=$N NSISCONFDIR=$N $N/linux/makensis -V1 installer.nsi
ls -la dist/*.exe
