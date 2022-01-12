# Conversion to Promises

# 转换为承诺

The similarity between Observables and Promises is that both [collections](/guide/observable) may produce values over time, but the difference is that Observables may produce none or more than one value, while Promises produce only one value when resolved successfully.

Observables 和 Promises 的相似之处在于，随着时间的推移，两个[集合](/guide/observable)都可能产生值，但不同之处在于 Observables 可能不产生或产生多个值，而 Promises 在成功解析时只产生一个值。

# Issues

# 问题

For this reason, in RxJS 7, the return type of the Observable's [`toPromise()`](/api/index/class/Observable#toPromise)
method has been fixed to better reflect the fact that Observables can yield zero values. This may be a **breaking change** to some projects as the return type was changed from `Promise<T>` to `Promise<T | undefined>`.

出于这个原因，在 RxJS 7 中，Observable 的[`toPromise()`](/api/index/class/Observable#toPromise)方法的返回类型已被修复，以更好地反映 Observable 可以产生零值的事实。这可能是对某些项目的**重大更改**，因为返回类型已从 `Promise<T>` 更改为 `Promise<T | undefined>` 。

Also, `toPromise()` method name was never indicating what emitted value a Promise will resolve with because Observables can produce multiple values over time. When converting to a Promise, you might want to choose which value to pick - either the first value that has arrived or the last one. To fix all these issues, we decided to deprecate `toPromise()`, and to introduce the two new helper functions for conversion to Promises.

此外， `toPromise()` 方法名称从未指示 Promise 将使用什么发出的值来解决，因为 Observables 可以随着时间的推移产生多个值。转换为 Promise 时，你可能需要选择要选择的值 - 到达的第一个值或最后一个值。为了解决所有这些问题，我们决定弃用 `toPromise()` ，并引入两个新的辅助函数来转换为 Promise。

# Use one of the two new functions

# 使用两个新功能之一

As a replacement to the deprecated `toPromise()` method, you should use one of the two built in static conversion functions {@link firstValueFrom} or {@link lastValueFrom}.

作为已弃用的 `toPromise()` 方法的替代，你应该使用两个内置静态转换函数 {@link firstValueFrom} 或 {@link lastValueFrom} 之一。

## `lastValueFrom`

The `lastValueFrom` is almost exactly the same as `toPromise()` meaning that it will resolve with the last value that has arrived when the Observable completes, but with the difference in behavior when Observable completes without emitting a single value. When Observable completes without emitting, `toPromise()` will successfully resolve with `undefined` (thus the return type change), while the `lastValueFrom` will reject with the {@link EmptyError}. Thus, the return type of the
`lastValueFrom` is `Promise<T>`, just like `toPromise()` had in RxJS 6.

`lastValueFrom` 与 `toPromise()` ，这意味着它将使用 Observable 完成时到达的最后一个值进行解析，但在 Observable 完成时没有发出单个值时的行为有所不同。当 Observable 完成但没有发出时， `toPromise()` 将成功解析 `undefined` （因此返回类型更改），而 `lastValueFrom` 将拒绝 {@link EmptyError}。因此， `lastValueFrom` 的返回类型是 `Promise<T>` ，就像 RxJS 6 中的 `toPromise()` 一样。

### Example

### 例子

```ts
import { interval, take, lastValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000).pipe(take(10));
  const finalNumber = await lastValueFrom(source$);
  console.log(`The final number is ${finalNumber}`);
}

execute();

// Expected output:
// "The final number is 9"
```

## `firstValueFrom`

However, you might want to take the first value as it arrives without waiting an Observable to complete, thus you can use `firstValueFrom`. The `firstValueFrom` will resolve a Promise with the first value that was emitted from the Observable and will immediately unsubscribe to retain resources. The `firstValueFrom` will also reject with an {@link EmptyError} if the Observable completes with no values emitted.

但是，你可能希望在第一个值到达时获取它而不等待 Observable 完成，因此你可以使用 `firstValueFrom` 。 `firstValueFrom` 将使用从 Observable 发出的第一个值解析 Promise，并将立即取消订阅以保留资源。如果 Observable 完成但没有发出任何值，则 `firstValueFrom` 也会以 {@link EmptyError} 拒绝。

### Example

### 例子

```ts
import { interval, firstValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000);
  const firstNumber = await firstValueFrom(source$);
  console.log(`The first number is ${firstNumber}`);
}

execute();

// Expected output:
// "The first number is 0"
```

<span class="informal">Both functions will return a Promise that rejects if the source Observable errors. The Promise will reject with the same error that the Observable has errored with.</span>

<span class="informal">如果源 Observable 出错，这两个函数都会返回一个拒绝的 Promise。 Promise 将拒绝与 Observable 错误相同的错误。</span>

# Use default value

# 使用默认值

If you don't want Promises created by `lastValueFrom` or `firstValueFrom` to reject with {@link EmptyError} if there were no emissions before completion, you can use the second parameter. The second parameter is expected to be an object with `defaultValue` parameter. The value in the `defaultValue` will be used to resolve a Promise when source Observable completes without emitted values.

如果你不希望 `lastValueFrom` 或 `firstValueFrom` 创建的 Promise 在完成前没有排放的情况下使用 {@link EmptyError} 拒绝，则可以使用第二个参数。第二个参数应该是一个带有 `defaultValue` 参数的对象。当源 Observable 完成而没有发出值时， `defaultValue` 中的值将用于解析 Promise。

```ts
import { firstValueFrom, EMPTY } from 'rxjs';

const result = await firstValueFrom(EMPTY, { defaultValue: 0 });
console.log(result);

// Expected output:
// 0
```

# Warning

# 警告

Only use `lastValueFrom` function if you _know_ an Observable will eventually complete. The `firstValueFrom` function should be used if you _know_ an Observable will emit at least one value _or_ will eventually complete. If the source Observable does not complete or emit, you will end up with a Promise that is hung up, and potentially all of the state of an async function hanging out in memory. To avoid this situation, look into adding something like {@link timeout}, {@link take}, {@link takeWhile}, or
{@link takeUntil} amongst others.

仅当你 _ 知道\_Observable 最终会完成时才使用 `lastValueFrom` 函数。如果你 _ 知道 _Observable 将发出至少一个值 _ 或\_ 最终会完成，则应该使用 `firstValueFrom` 函数。如果源 Observable 没有完成或发出，你最终会得到一个挂起的 Promise，并且可能所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等内容。

