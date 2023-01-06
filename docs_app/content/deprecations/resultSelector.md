# ResultSelector Parameter

# ResultSelector(结果选择器)参数

Some operator supported a resultSelector argument that acted as mapping function on the result of that operator. The same behavior can be reproduced with the `map` operator, therefore this argument became deprecated.

某些操作符支持一个 resultSelector 参数作为该操作符结果的映射函数。使用 `map` 操作符可以实现相同的行为，因此并不推荐使用此参数。

<div class="alert is-important">

This deprecation was introduced in RxJS 6.0 and will become breaking with RxJS 8.

本弃用是 RxJS 6.0 引入的，并且会在 RxJS 8 变成重大变更。

</div>

There were two reasons for actually deprecating those parameters:

出于两个原因，要事实性弃用这些参数：

1. It increases the bundle size of every operator

   它增加了每个操作符的捆绑包大小

2. In some scenarios values had to be retained in memory causing a general memory pressure

   在某些情况下，一些值必须保留在内存中，从而导致一般性的内存压力

## Operators affected by this Change

## 受此变更影响的操作符

- [concatMap](/api/operators/concatMap)

  [concatMap(串联映射)](/api/operators/concatMap)

- [concatMapTo](/api/operators/concatMapTo)

  [concatMapTo(串联映射为)](/api/operators/concatMapTo)

- [exhaustMap](/api/operators/exhaustMap)

  [exhaustMap(疲劳映射)](/api/operators/exhaustMap)

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

你可以在内部 Observable 上利用 [`map`](/api/operators/map) 操作符，而不再使用 `resultSelector` 参数：

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
