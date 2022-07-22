# Conversion to Promises

# 转换为 Promise（承诺）

The similarity between Observables and Promises is that both [collections](/guide/observable) may produce values over
time, but the difference is that Observables may produce none or more than one value, while Promises produce only one
value when resolved successfully.

Observables 和 Promises 的相似之处在于，随着时间的推移，这两个[集合](/guide/observable)都可能产生值，但不同之处在于 Observables 可能不产生或产生多个值，而 Promises 在成功解析时只产生一个值。

## Issues

## 问题

For this reason, in RxJS 7, the return type of the Observable's [`toPromise()`](/api/index/class/Observable#toPromise)
method has been fixed to better reflect the fact that Observables can yield zero values. This may be a **breaking
change** to some projects as the return type was changed from `Promise<T>` to `Promise<T | undefined>`.

出于这个原因，在 RxJS 7 中，Observable 的 [`toPromise()`](/api/index/class/Observable#toPromise) 方法的返回类型已被修复，以更好地反映 Observable 可以产生零个值的事实。这可能对于某些项目是**重大更改**，因为返回类型已从 `Promise<T>` 更改为 `Promise<T | undefined>`。

Also, `toPromise()` method name was never indicating what emitted value a Promise will resolve with because Observables
can produce multiple values over time. When converting to a Promise, you might want to choose which value to pick -
either the first value that has arrived or the last one. To fix all these issues, we decided to deprecate `toPromise()`,
and to introduce the two new helper functions for conversion to Promises.

此外，`toPromise()` 这个方法名无法指出 Promise 将使用什么发出的值来解决（resolve），因为 Observables 可以随着时间的推移产生多个值。转换为 Promise 时，你可能需要选择要选取的值 - 是抵达的第一个值还是最后一个值。为了解决所有这些问题，我们决定弃用 `toPromise()`，并引入两个新的辅助函数来转换为 Promise。

## Use one of the two new functions

## 使用两个新函数之一

As a replacement to the deprecated `toPromise()` method, you should use one of the two built in static conversion
functions {@link firstValueFrom} or {@link lastValueFrom}.

### `lastValueFrom`

The `lastValueFrom` is almost exactly the same as `toPromise()` meaning that it will resolve with the last value that has
arrived when the Observable completes, but with the difference in behavior when Observable completes without emitting a
single value. When Observable completes without emitting, `toPromise()` will successfully resolve with `undefined` (thus
the return type change), while the `lastValueFrom` will reject with the {@link EmptyError}. Thus, the return type of the
`lastValueFrom` is `Promise<T>`, just like `toPromise()` had in RxJS 6.

#### Example

#### 例子

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

### `firstValueFrom`

However, you might want to take the first value as it arrives without waiting an Observable to complete, thus you can
use `firstValueFrom`. The `firstValueFrom` will resolve a Promise with the first value that was emitted from the
Observable and will immediately unsubscribe to retain resources. The `firstValueFrom` will also reject with an
{@link EmptyError} if the Observable completes with no values emitted.

#### Example

#### 例子

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

<span class="informal">Both functions will return a Promise that rejects if the source Observable errors. The Promise
will reject with the same error that the Observable has errored with.</span>

## Use default value

## 使用默认值

If you don't want Promises created by `lastValueFrom` or `firstValueFrom` to reject with {@link EmptyError} if there
were no emissions before completion, you can use the second parameter. The second parameter is expected to be an object
with `defaultValue` parameter. The value in the `defaultValue` will be used to resolve a Promise when source Observable
completes without emitted values.

```ts
import { firstValueFrom, EMPTY } from 'rxjs';

const result = await firstValueFrom(EMPTY, { defaultValue: 0 });
console.log(result);

// Expected output:
// 0
```

## Warning

## 警告

Only use `lastValueFrom` function if you _know_ an Observable will eventually complete. The `firstValueFrom` function should
be used if you _know_ an Observable will emit at least one value _or_ will eventually complete. If the source Observable
does not complete or emit, you will end up with a Promise that is hung up, and potentially all of the state of an async
function hanging out in memory. To avoid this situation, look into adding something like {@link timeout}, {@link take},
{@link takeWhile}, or {@link takeUntil} amongst others.