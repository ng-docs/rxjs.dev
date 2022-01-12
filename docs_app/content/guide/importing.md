# Importing instructions

# 导入说明

There are different ways you can {@link guide/installation install} RxJS. Using/importing RxJS depends on the used RxJS version, but also depends on the used installation method.

你可以通过多种方式{@link guide/installation install} RxJS。使用/导入 RxJS 取决于使用的 RxJS 版本，但也取决于使用的安装方法。

[Pipeable operators](https://v6.rxjs.dev/guide/v6/pipeable-operators) were introduced in RxJS version 5.5. This enabled all operators to be exported from a single place. This new export site was introduced with RxJS version 6 where all pipeable operators could have been imported from `'rxjs/operators'`. For example, `import { map } from 'rxjs/operators'`.

[Pipeable 操作符](https://v6.rxjs.dev/guide/v6/pipeable-operators)是在 RxJS 5.5 版中引入的。这使得所有操作员都可以从一个地方导出。这个新的导出站点是在 RxJS 版本 6 中引入的，其中所有可管道操作符都可以从 `'rxjs/operators'` 导入。例如，`import { map } from 'rxjs/operators'`。

# New in RxJS v7.2.0

# RxJS v7.2.0 中的新功能

<span class="informal">**With RxJS v7.2.0, most operators have been moved to `{@link api#index 'rxjs'}`
export site. This means that the preferred way to import operators is from `'rxjs'`, while
`'rxjs/operators'` export site has been deprecated.**</span>

**在 RxJS v7.2.0 中，大多数运算符已移至 `{@link api#index 'rxjs'}` 导出站点。这意味着导入操作符的首选方式是从 `'rxjs'`，而 `'rxjs/operators'` 导出站点已被弃用。**

For example, instead of using:

例如，而不是使用：

```ts
import { map } from 'rxjs/operators';
```

**the preferred way** is to use:

**首选方法**是使用：

```ts
import { map } from 'rxjs';
```

Although the old way of importing operators is still active, it will be removed in one of the next major versions.

虽然导入运算符的旧方式仍然有效，但它将在下一个主要版本中删除。

Click {@link #how-to-migrate here to see} how to migrate.

点击{@link #how-to-migrate here 查看}如何迁移。

# Export sites

# 出口网站

RxJS v7 exports 6 different locations out of which you can import what you need. Those are:

RxJS v7 导出 6 个不同的位置，你可以从中导入你需要的内容。那些是：

- `{@link api#index 'rxjs'}` - for example: `import { of } from 'rxjs';`

  `{@link api#index 'rxjs'}` - 例如： `import { of } from 'rxjs';`

- `{@link api#operators 'rxjs/operators'}` - for example: `import { map } from 'rxjs/operators';`

  `{@link api#operators 'rxjs/operators'}` - 例如： `import { map } from 'rxjs/operators';`

- `{@link api#ajax 'rxjs/ajax'}` - for example: `import { ajax } from 'rxjs/ajax';`

  `{@link api#ajax 'rxjs/ajax'}` - 例如： `import { ajax } from 'rxjs/ajax';`

- `{@link api#fetch 'rxjs/fetch'}` - for example: `import { fromFetch } from 'rxjs/fetch';`

  `{@link api#fetch 'rxjs/fetch'}` - 例如： `import { fromFetch } from 'rxjs/fetch';`

- `{@link api#webSocket 'rxjs/webSocket'}` - for example: `import { webSocket } from 'rxjs/webSocket';`

  `{@link api#webSocket 'rxjs/webSocket'}` - 例如： `import { webSocket } from 'rxjs/webSocket';`

- `{@link api#testing 'rxjs/testing'}` - for example: `import { TestScheduler } from 'rxjs/testing';`

  `{@link api#testing 'rxjs/testing'}` - 例如： `import { TestScheduler } from 'rxjs/testing';`

## How to migrate?

## 如何迁移？

While nothing has been removed from `'rxjs/operators'`, it is strongly recommended doing the operator imports from `'rxjs'`. Almost all operator function exports have been moved to `'rxjs'`, but only a couple of old and deprecated operators have stayed in the `'rxjs/operators'`. Those operator functions are now mostly deprecated and most of them have their either static operator substitution or are kept as operators, but have a new name so that they are different to their static creation counter-part (
usually ending with `With`). Those are:

虽然没有从 `'rxjs/operators'` 中删除任何内容，但强烈建议从 `'rxjs'` 导入运算符。几乎所有运算符函数导出都已移至 `'rxjs'`，但只有几个旧的和已弃用的运算符保留在 `'rxjs/operators'` 中。这些运算符函数现在大多已被弃用，其中大多数具有静态运算符替换或保留为运算符，但有一个新名称，因此它们与其静态创建对应部分不同（通常以 `With` 结尾）。那些是：

| `'rxjs/operators'` Operator | Replace With Static Creation Operator | Replace With New Operator Name |
| --------------------------- | ------------------------------------- | ------------------------------ |
| `'rxjs/operators'` 运算符 | 替换为静态创建运算符 | 替换为新的操作员名称 |
| [`combineLatest`](/api/operators/combineLatest) | {@link combineLatest} | {@link combineLatestWith} |
| [`combineLatest`](/api/operators/combineLatest) | {@link combineLatest} | {@link combineLatestWith} |
| [`concat`](/api/operators/concat) | {@link concat} | {@link concatWith} |
| [`concat`](/api/operators/concat) | {@link 连接} | {@link concatWith} |
| [`merge`](/api/operators/merge) | {@link merge} | {@link mergeWith} |
| [`merge`](/api/operators/merge) | {@链接合并} | {@link 合并} |
| [`onErrorResumeNext`](/api/operators/onErrorResumeNext) | {@link onErrorResumeNext} | - |
| [`onErrorResumeNext`](/api/operators/onErrorResumeNext) | {@link onErrorResumeNext} |  |
| [`partition`](/api/operators/partition) | {@link partition} | - |
| [`partition`](/api/operators/partition) | {@link 分区} |  |
| [`race`](/api/operators/race) | {@link race} | {@link raceWith} |
| [`race`](/api/operators/race) | {@link 比赛} | {@link raceWith} |
| [`zip`](/api/operators/zip) | {@link zip} | {@link zipWith} |
| [`zip`](/api/operators/zip) | {@链接压缩} | {@link zipWith} |

For example, the old and deprecated way of using [`merge`](/api/operators/merge) from `'rxjs/operators'`
is:

例如，从 `'rxjs/operators'` 使用[`merge`](/api/operators/merge)的旧的和已弃用的方法是：

```ts
import { merge } from 'rxjs/operators';

a$.pipe(merge(b$)).subscribe();
```

But this should be avoided and replaced with one of the next two examples.

但这应该避免并用接下来的两个示例之一代替。

For example, this could be replaced by using a static creation {@link merge} function:

例如，这可以通过使用静态创建 {@link merge} 函数来替换：

```ts
import { merge } from 'rxjs';

merge(a$, b$).subscribe();
```

Or it could be written using a pipeable {@link mergeWith} operator:

或者可以使用可管道 {@link mergeWith} 运算符编写：

```ts
import { mergeWith } from 'rxjs';

a$.pipe(mergeWith(b$)).subscribe();
```

Depending on the preferred style, you can choose which one to follow, they are completely equal.

根据喜欢的风格，你可以选择遵循哪一种，它们是完全平等的。

Since a new way of importing operators is introduced with RxJS v7.2.0, instructions will be split to prior and after this version.

由于 RxJS v7.2.0 引入了一种新的操作符导入方式，说明将分为之前和之后的版本。

## ES6 via npm

## ES6 通过 npm

If you've installed RxJS using {@link guide/installation#es6-via-npm ES6 via npm} and installed version is:

如果你已经使用 {@link guide/installation#es6-via-npm ES6 via npm} 安装了 RxJS 并且安装的版本是：

### v7.2.0 or later

### v7.2.0 或更高版本

Import only what you need:

仅导入你需要的内容：

```ts
import { of, map } from 'rxjs';

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

To import the entire set of functionality:

要导入整套功能：

```ts
import * as rxjs from 'rxjs';

rxjs.of(1, 2, 3).pipe(rxjs.map((x) => x + '!!!')); // etc;
```

To use with a globally imported bundle:

要与全局导入的捆绑包一起使用：

```js
const { of, map } = rxjs;

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

If you installed RxJS version:

如果你安装了 RxJS 版本：

### v7.1.0 or older

### v7.1.0 或更早版本

Import only what you need:

仅导入你需要的内容：

```ts
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

To import the entire set of functionality:

要导入整套功能：

```ts
import * as rxjs from 'rxjs';
import * as operators from 'rxjs';

rxjs.of(1, 2, 3).pipe(operators.map((x) => x + '!!!')); // etc;
```

To use with a globally imported bundle:

要与全局导入的捆绑包一起使用：

```js
const { of } = rxjs;
const { map } = rxjs.operators;

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

## CDN

If you installed a library {@link guide/installation#cdn using CDN}, the global namespace for rxjs is
`rxjs`.

如果你安装了一个库 {@link guide/installation#cdn using CDN}，rxjs 的全局命名空间是 `rxjs`。

### v7.2.0 or later

### v7.2.0 或更高版本

```js
const { range, filter, map } = rxjs;

range(1, 200)
  .pipe(
    filter((x) => x % 2 === 1),
    map((x) => x + x)
  )
  .subscribe((x) => console.log(x));
```

### v7.1.0 or older

### v7.1.0 或更早版本

```js
const { range } = rxjs;
const { filter, map } = rxjs.operators;

range(1, 200)
  .pipe(
    filter((x) => x % 2 === 1),
    map((x) => x + x)
  )
  .subscribe((x) => console.log(x));
```
