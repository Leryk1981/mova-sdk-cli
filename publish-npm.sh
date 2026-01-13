#!/usr/bin/env bash
set -euo pipefail

npm run release:check
npm publish --access public
