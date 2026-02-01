#!/bin/bash
set -e

echo "🏌️  Fetching latest GHIN data..."
npm run fetch-data

if [ -n "$(git status --porcelain ghin-data.json)" ]; then
  echo "📝 Changes detected, committing..."
  git add ghin-data.json
  git commit -m "Update GHIN data

🏌️ Automated data update from local fetch

Co-Authored-By: Claude <noreply@anthropic.com>"

  echo "🚀 Pushing to remote..."
  git push

  echo "✅ Data updated and pushed! GitHub Actions will deploy automatically."
else
  echo "ℹ️  No changes to commit - data is already up to date."
fi
