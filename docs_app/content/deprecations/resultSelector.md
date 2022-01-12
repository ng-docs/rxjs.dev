# ResultSelector Parameter

# 结果选择器参数

Some operator supported a resultSelector argument that acted as mapping function on the result of that operator. The same behavior can be reproduced with the `map` operator, therefore this argument became deprecated.

某些运算符支持作为该运算符结果的映射函数的 resultSelector 参数。使用 `map` 运算符可以重现相同的行为，因此不推荐使用此参数。

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.0 and will become breaking with RxJS 8.
    </span>
</div>

There were two reasons for actually deprecating those parameters:

实际弃用这些参数有两个原因：

1. It increases the bundle size of every operator

   它增加了每个运算符的捆绑包大小

2. In some scenarios values had to be retained in memory causing a general memory pressure

   在某些情况下，值必须保留在内存中，从而导致一般的内存压力

## Operators affected by this Change

## 受此变更影响的运营商

- [concatMap](/api/operators/concatMap)

  [concatMap(串联映射)](/api/operators/concatMap)

- [concatMapTo](/api/operators/concatMapTo)

  [concatMapTo(串联映射为)](/api/operators/concatMapTo)

- [exhaustMap](/api/operators/exhaustMap)

  [exhaustMap(耗尽映射)](/api/operators/exhaustMap)

- [mergeMap](/api/operators/mergeMap)

  [mergeMap(合并映射)](/api/operators/mergeMap)

- [mergeMapTo](/api/operators/mergeMapTo)

  [mergeMapTo(合并映射为)](/api/operators/mergeMapTo)

- [switchMap](/api/operators/switchMap)

  [switchMap(切换映射)](/api/operators/switchMap)

- [swithMapTo](/api/operators/swithMapTo)

  [swithMapTo(切换映射为)](/api/operators/swithMapTo)

## How to Refactor

## 如何重构

Instead of using the `resultSelector` Argument, you can leverage the [`map`](/api/operators/map) operator on the inner Observable:

你可以在内部 Observable 上利用[`map`](/api/operators/map)运算符，而不是使用 `resultSelector` 参数：

<!-- prettier-ignore -->

```ts
import { fromEvent, switchMap, interval, map } from 'rxjs';

// deprecated
fromEvent(document, 'click').pipe(
  switchMap((x) => interval(1000), (_, x) => x + 1)
);
// suggested change
fromEvent(document, 'click').pipe(
  switchMap((x) => interval(1000).pipe(map((x) => x + 1)))
);
```
