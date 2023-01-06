# Array Arguments

# 数组参数

To unify the API surface of `forkJoin` and `combineLatest` we deprecated some signatures. Since that it is recommended to either pass an Object or an Array to these operators.

为了统一 `forkJoin` 和 `combineLatest` 的 对外 API，我们弃用了一些签名。因此，建议将 Object 或 Array 传递给这些操作符。

<div class="alert is-important">

This deprecation was introduced in RxJS 6.5.

本弃用是在 RxJS 6.5 引入的。

</div>

## Operators affected by this Change

## 受此变更影响的操作符

- [combineLatest](/api/index/function/combineLatest)

  [combineLatest(组合最新的)](/api/index/function/combineLatest)

- [forkJoin](/api/index/function/forkJoin)

  [forkJoin（分叉合并）](/api/index/function/forkJoin)

## How to Refactor

## 如何重构

We deprecated the signatures, where just pass all Observables directly as parameters to these operators.

我们弃用了这些签名，直接将所有 Observables 作为参数传递给这些操作符。

```ts
import { forkJoin, from } from 'rxjs';

const odd$ = from([1, 3, 5]);
const even$ = from([2, 4, 6]);

// deprecated
forkJoin(odd$, even$);
// suggested change
forkJoin([odd$, even$]);
// or
forkJoin({ odd: odd$, even: even$ });
```
