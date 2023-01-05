#!/usr/bin/env sh

# markdown 文档
nt translate content/**/*.md --engine=dict --dict ./tools/translator/dict/rxjs

# html 文档
nt translate content/**/*.html --engine=dict --dict ./tools/translator/dict/rxjs

# 导航菜单
nt translate content/navigation.json --engine=dict --dict ./tools/translator/dict/rxjs --jsonProperties=title --jsonProperties=tooltip

cd ..
# 源码
nt translate 'src/**/*.ts' '!src/**/*.d.ts' '!src/**/*_spec.ts' '!src/**/*.spec.ts' -et internal -et nodoc --engine=dict --dict ./tools/translator/dict/rxjs

cd -
