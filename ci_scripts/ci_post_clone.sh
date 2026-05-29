#!/bin/sh

# Xcode Cloud post-clone step.
#
# Capacitor's iOS project resolves its plugin packages from local paths inside
# node_modules (see ios/App/CapApp-SPM/Package.swift → ../../../node_modules/@capacitor/*).
# Xcode Cloud only checks out the git repo, and node_modules is gitignored, so we
# must install the JS dependencies here before xcodebuild resolves Swift packages.

set -e

echo "▸ Installing Node…"
export HOMEBREW_NO_INSTALL_CLEANUP=1
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

echo "▸ Node $(node -v) / npm $(npm -v)"

echo "▸ Installing JS dependencies (npm ci) at repo root…"
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci

echo "▸ Syncing Capacitor iOS project…"
npx cap sync ios

echo "▸ ci_post_clone complete."
