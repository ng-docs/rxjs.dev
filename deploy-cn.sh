#!/usr/bin/env sh

set -e
set -x

cd docs_app

npm run build

cp -r dist/* prebuilt/

cd prebuilt

nt mark './generated/**/*.json'

cp index.html 404.html

ossutil cp -i "$AYID" -k "$AYPD" -r . oss://rxjs-8 -e oss-cn-hangzhou.aliyuncs.com -u

commitSha=$(git rev-parse --short HEAD)
commitMessage=$(git log --oneline -n 1)

git add .
git commit --allow-empty -am "${commitMessage}" || true

git push origin master

set +e
set +x
