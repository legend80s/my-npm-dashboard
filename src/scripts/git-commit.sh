#!/bin/bash

# Why this script?
# For working both on Windows and macOS
# Windows: %npm_package_version%
# macOS: $npm_package_version

set -e

git commit -m "chore: bump to v$npm_package_version" package.json
