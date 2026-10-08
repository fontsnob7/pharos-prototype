#!/usr/bin/env bash
# Build the prototype for GitHub Pages and push it to the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")/.."
npx ng build --base-href /pharos-prototype/
cd dist/pharos-prototype/browser
cp index.html 404.html
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Publish prototype build"
git push -f "$(git -C ../../.. remote get-url origin)" gh-pages
echo "Published: https://fontsnob7.github.io/pharos-prototype/"
