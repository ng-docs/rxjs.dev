#!/usr/bin/env sh

# markdown 文档
nt translate content/**/*.md --engine=gcloud

# html 文档
nt translate content/**/*.html --engine=gcloud

# 导航菜单
nt translate content/navigation.json --engine=gcloud

cd ..
# 源码
nt translate 'packages/**/*.ts' '!packages/**/*.d.ts' '!packages/**/*_spec.ts' '!packages/**/*.spec.ts' -et internal -et nodoc --engine=gcloud

cd -
