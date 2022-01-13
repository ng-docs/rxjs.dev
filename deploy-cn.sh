#!/usr/bin/env sh

set -e
set -x

cd docs_app

npm run build

cp -r dist/* prebuilt/

cd prebuilt

cp index.html 404.html

commitSha=$(git rev-parse --short HEAD)
commitMessage=$(git log --oneline -n 1)

git add .
git commit --allow-empty -am "${commitMessage}" || true

git push release release:master

set +e
set +x
