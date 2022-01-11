# Breaking Changes in Version 7

# 版本 7 中的重大更改

## General

## 一般的

- **TS:** RxJS requires TS 4.2

  **TS：** RxJS 需要 TS 4.2

- **rxjs-compat:** `rxjs-compat` is not published for v7

  **rxjs-compat：** `rxjs-compat` 未针对 v7 发布

- **toPromise:** toPromise return type now returns `T | undefined` in TypeScript, which is correct, but may break builds.

  **toPromise：** toPromise 返回类型现在返回 `T | undefined` 在 TypeScript 中 `T | undefined`，这是正确的，但可能会破坏构建。

- **Subscription:** `add` no longer returns an unnecessary Subscription reference. This was done to prevent confusion caused by a legacy behavior. You can now add and remove functions and Subscriptions as teardowns to and from a `Subscription` using `add` and `remove` directly. Before this, `remove` only accepted subscriptions.

  **订阅：** `add` 不再返回不必要的订阅引用。这样做是为了防止由遗留行为引起的混乱。你现在可以直接使用 `add` 和 `remove` 来添加和删除函数和订阅作为 `Subscription` 的拆解。在此之前，仅 `remove` 已接受的订阅。

- **Observable:** `lift` no longer exposed. It was _NEVER_ documented that end users of the library should be creating operators using `lift`. Lift has a [variety of issues](https://github.com/ReactiveX/rxjs/issues/5431) and was always an internal implementation detail of rxjs that might have been used by a few power users in the early days when it had the most value. The value of `lift`, originally, was that subclassed `Observable`s would compose through all operators that implemented lift. The reality is
  that feature is not widely known, used, or supported, and it was never documented as it was very experimental when it was first added. Until the end of v7, `lift` will remain on Observable. Standard JavaScript users will notice no difference. However, TypeScript users might see complaints about `lift` not being a member of observable. To workaround this issue there are two things you can do: 1. Rewrite your operators as [outlined in the documentation](https://rxjs.dev/guide/operators), such that they
  return `new Observable`. or 2. cast your observable as `any` and access `lift` that way. Method 1 is recommended if you do not want things to break when we move to version 8.

  **可观察：** `lift` 不再暴露。_ 从未 _ 记录过库的最终用户应该使用 `lift` 创建操作符。Lift 有[各种各样的问题](https://github.com/ReactiveX/rxjs/issues/5431)，并且一直是 rxjs 的内部实现细节，可能在早期最有价值的时候被少数高级用户使用。`lift` 的值，最初是子类 `Observable` 将由所有实现了 lift 的操作符组成。现实情况是，该功能并未广为人知、使用或支持，并且从未记录在案，因为它在首次添加时非常实验性。在 v7 结束之前，`lift` 将保持在 Observable 上。标准 JavaScript 用户不会注意到任何差异。然而，TypeScript 用户可能会看到关于 `lift` 不是 observable 成员的抱怨。要解决此问题，你可以做两件事： 1.[按照文档中的说明](https://rxjs.dev/guide/operators)重写你的操作符，使它们返回 `new Observable`。或 2. 将你的 observable 投射为 `any` 并以这种方式访问 `lift`
 。如果你不希望在我们迁移到版本 8 时出现问题，建议使用方法 1。

- **Subscriber:** `new Subscriber` no longer takes 0-3 arguments. To create a `Subscriber` with 0-3 arguments, use `Subscriber.create`. However, please note that there is little to no reason that you should be creating `Subscriber` references directly, and `Subscriber.create` and `new Subscriber` are both deprecated.

  **订阅者：** `new Subscriber` 不再接受 0-3 个参数。要使用 0-3 个参数创建 `Subscriber`，请使用 `Subscriber.create`。但是，请注意，你几乎没有理由直接创建 `Subscriber` 引用，并且 `Subscriber.create` 和 `new Subscriber` 都已弃用。

- **onUnhandledError:** Errors that occur during setup of an observable subscription after the subscription has emitted an error or completed will now throw in their own call stack. Before it would call `console.warn`. This is potentially breaking in edge cases for node applications, which may be configured to terminate for unhandled exceptions. In the unlikely event this affects you, you can configure the behavior to `console.warn` in the new configuration setting like
  so: `import { config } from 'rxjs'; config.onUnhandledError = (err) => console.warn(err);`

  **onUnhandledError：**在订阅发出错误或完成后设置可观察订阅期间发生的错误现在将抛出它们自己的调用堆栈。在它调用 `console.warn` 之前。这可能会破坏节点应用程序的边缘情况，可以将其配置为因未处理的异常而终止。万一这会影响到你，你可以在新的配置设置中将行为配置为 `console.warn`，如下所示： `import { config } from 'rxjs'; config.onUnhandledError = (err) => console.warn(err);`

- **RxJS Error types** Tests that are written with naive expectations against errors may fail now that errors have a proper `stack` property. In some testing frameworks, a deep equality check on two error instances will check the values in `stack`, which could be different.

  **RxJS 错误类型**由于错误具有适当的 `stack` 属性，因此对错误的天真期望编写的测试可能会失败。在某些测试框架中，对两个错误实例的深度相等检查将检查 `stack` 中的值，这些值可能不同。

- `unsubscribe` no longer available via the `this` context of observer functions. To reenable, set `config.useDeprecatedNextContext = true` on the rxjs `config` found at `import { config } from 'rxjs';`. Note that enabling this will result in a performance penalty for all consumer subscriptions.

  不再可以通过观察者函数的 `this` 上下文 `unsubscribe`。要重新启用，请在 `import { config } from 'rxjs';` 处找到的 rxjs `config` 上设置 `config.useDeprecatedNextContext = true` ; .请注意，启用此功能将导致所有消费者订阅的性能下降。

- Leaked implementation detail `_unsubscribeAndRecycle` of `Subscriber` has been removed. Just use new `Subscription` objects

  `Subscriber` 的泄露实现细节 `_unsubscribeAndRecycle` 已被删除。只需使用新的 `Subscription` 对象

- The static `sortActions` method on `VirtualTimeScheduler` is no longer publicly exposed by our TS types.

  `VirtualTimeScheduler` 上的静态 `sortActions` 方法不再由我们的 TS 类型公开。

- `Notification.createNext(undefined)` will no longer return the exact same reference everytime.

  `Notification.createNext(undefined)` 将不再每次都返回完全相同的引用。

- Type signatures tightened up around `Notification` and `dematerialize`, may uncover issues with invalid types passed to those operators.

  围绕 `Notification` 和 `dematerialize` 加强类型签名，可能会发现传递给这些操作符的无效类型的问题。

- Experimental support for `for await` as been removed. Use <https://github.com/benlesh/rxjs-for-await> instead.

  已删除 `for await` 的实验性支持。请改用<https://github.com/benlesh/rxjs-for-await>。

- `ReplaySubject` no longer schedules emissions when a scheduler is provided. If you need that behavior, please compose in `observeOn` using `pipe`, for example: `new ReplaySubject(2, 3000).pipe(observeOn(asap))`

  提供调度程序时，`ReplaySubject` 不再调度排放。如果你需要该行为，请使用 `pipe` 在 `observeOn` 中编写，例如： `new ReplaySubject(2, 3000).pipe(observeOn(asap))`

- **rxjs-compat:** `rxjs/Rx` is no longer a valid import site.

  **rxjs-compat：** `rxjs/Rx` 不再是有效的导入站点。

## Operators

## 操作符

### concat

### 连接

- **concat:** Generic signature changed. Recommend not explicitly passing generics, just let inference do its job. If you must, cast with `as`.

  **concat：**通用签名已更改。建议不要显式传递泛型，让推理完成它的工作。如果必须，请使用 `as` 转换。

- **of:** Generic signature changed, do not specify generics, allow them to be inferred or use `as`

  **of：**泛型签名已更改，不指定泛型，允许它们被推断或 `as`

### count

### 数数

- **count:** No longer passes `source` observable as a third argument to the predicate. That feature was rarely used, and of limited value. The workaround is to simply close over the source inside of the function if you need to access it in there.

  **count：**不再将 `source` observable 作为第三个参数传递给谓词。该功能很少使用，并且价值有限。解决方法是简单地关闭函数内部的源，如果你需要在其中访问它。

### defer

### 推迟

- `defer` no longer allows factories to return `void` or `undefined`. All factories passed to defer must return a proper `ObservableInput`, such as `Observable`, `Promise`, et al. To get the same behavior as you may have relied on previously, `return EMPTY` or `return of()` from the factory.

  `defer` 不再允许工厂返回 `void` 或 `undefined`。所有传递给 defer 的工厂都必须返回一个适当的 `ObservableInput`，例如 `Observable`、`Promise` 等。要获得与你之前可能依赖的相同行为，请从工厂 `return EMPTY` 或 `return of()`。

### map

### 地图

- **map:** `thisArg` will now default to `undefined`. The previous default of `MapSubscriber` never made any sense. This will only affect code that calls map with a `function` and references `this` like so: `source.pipe(map(function () { console.log(this); }))`. There wasn't anything useful about doing this, so the breakage is expected to be very minimal. If anything we're no longer leaking an implementation detail.

  **map:** `thisArg` 现在默认为 `undefined`。`MapSubscriber` 以前的默认设置从来没有任何意义。这只会影响使用 `function` 调用 map 并像这样引用 `this` 的代码： `source.pipe(map(function () { console.log(this); }))`。这样做没有任何用处，因此预计破损将非常小。如果有的话，我们将不再泄露实现细节。

### mergeScan

### 合并扫描

- **mergeScan:** `mergeScan` will no longer emit its inner state again upon completion.

  **mergeScan：** `mergeScan` 后将不再发出其内部状态。

### of

### 的

- **of:** Use with more than 9 arguments, where the last argument is a `SchedulerLike` may result in the wrong type which includes the `SchedulerLike`, even though the run time implementation does not support that. Developers should be using `scheduled` instead

  **of：**与超过 9 个参数一起使用，其中最后一个参数是 `SchedulerLike` 可能会导致包含 `SchedulerLike` 的错误类型，即使运行时实现不支持。开发人员应该改用 `scheduled` 的

### pairs

### 对

- **pairs:** `pairs` will no longer function in IE without a polyfill for `Object.entries`. `pairs` itself is also deprecated in favor of users just using `from(Object.entries(obj))`.

  **pair:**如果没有 `Object.entries` 的 polyfill，`pairs` 将不再在 IE 中起作用。`pairs` 本身也被弃用，有利于仅使用 `from(Object.entries(obj))` 的用户。

### race

### 种族

- **race:** `race()` will no longer subscribe to subsequent observables if a provided source synchronously errors or completes. This means side effects that might have occurred during subscription in those rare cases will no longer occur.

  **race：**如果提供的源同步出错或完成，`race()` 将不再订阅后续的 observables。这意味着在极少数情况下订阅期间可能发生的副作用将不再发生。

### repeat

### 重复

- An undocumented behavior where passing a negative count argument to `repeat` would result in an observable that repeats forever.

  一种未记录的行为，其中将负计数参数传递给 `repeat` 将导致 observable 永远重复。

### retry

### 重试

- Removed an undocumented behavior where passing a negative count argument to `retry` would result in an observable that repeats forever.

  删除了一个未记录的行为，其中将负计数参数传递给 `retry` 将导致可观察到的永远重复。

### single

### 单身的

- `single` operator will now throw for scenarios where values coming in are either not present, or do not match the provided predicate. Error types have thrown have also been updated, please check documentation for changes.

  现在，`single` 操作符将在传入的值不存在或与提供的谓词不匹配的情况下抛出。引发的错误类型也已更新，请查看文档以了解更改。

### skipLast

### 跳过最后

- **skipLast:** `skipLast` will no longer error when passed a negative number, rather it will simply return the source, as though `0` was passed.

  **skipLast：**当传递一个负数时，`skipLast` 将不再出错，而是简单地返回源，就好像传递了 `0`。

### startWith

### 从...开始

- **startWith:** `startWith` will return incorrect types when called with more than 7 arguments and a scheduler. Passing scheduler to startWith is deprecated

  **startWith：**当使用超过 7 个参数和调度程序调用时，`startWith` 将返回不正确的类型。不推荐将调度程序传递给 startWith

### take

### 拿

- `take` and will now throw runtime error for arguments that are negative or NaN, this includes non-TS calls like `take()`.

  `take` 并且现在将为负数或 NaN 的参数抛出运行时错误，这包括像 `take()` 这样的非 TS 调用。

### takeLast

### 最后

- `takeLast` now has runtime assertions that throw `TypeError`s for invalid arguments. Calling takeLast without arguments or with an argument that is `NaN` will throw a `TypeError`

  `takeLast` 现在有运行时断言，会为无效参数抛出 `TypeError`。不带参数或使用 `NaN` 参数调用 takeLast 将引发 `TypeError`

### throwError

### 抛出错误

- **throwError:** In an extreme corner case for usage, `throwError` is no longer able to emit a function as an error directly. If you need to push a function as an error, you will have to use the factory function to return the function like so: `throwError(() => functionToEmit)`, in other words `throwError(() => () => console.log('called later'))`.

  **throwError：**在使用的极端极端情况下，`throwError` 不再能够直接将函数作为错误发出。如果你需要将函数作为错误推送，则必须使用工厂函数来返回函数，如下所示： `throwError(() => functionToEmit)`，换句话说 `throwError(() => () => console.log('called later'))`。

### timestamp

### 时间戳

- `timestamp` operator accepts a `TimestampProvider`, which is any object with a `now` method that returns a number. This means pulling in less code for the use of the `timestamp` operator. This may cause issues with `TestScheduler` run mode. (see [Issue here](https://github.com/ReactiveX/rxjs/issues/5553))

  `timestamp` 操作符接受 `TimestampProvider`，它是具有返回数字的 `now` 方法的任何对象。这意味着为使用 `timestamp` 操作符引入更少的代码。这可能会导致 `TestScheduler` 运行模式出现问题。（请参阅[此处的问题](https://github.com/ReactiveX/rxjs/issues/5553)）

### zip

### 压缩

- **zip:** Zipping a single array will now have a different result. This is an extreme corner-case, because it is very unlikely that anyone would want to zip an array with nothing at all. The workaround would be to wrap the array in another array `zip([[1,2,3]])`. But again, that's pretty weird.

  **zip：**压缩单个数组现在会有不同的结果。这是一个极端的极端情况，因为任何人都不太可能想要一无所有地压缩一个数组。解决方法是将数组包装在另一个数组 `zip([[1,2,3]])` 中。但同样，这很奇怪。

- **zip:** `zip` operators will no longer iterate provided iterables "as needed", instead the iterables will be treated as push-streams just like they would be everywhere else in RxJS. This means that passing an endless iterable will result in the thread locking up, as it will endlessly try to read from that iterable. This puts us in-line with all other Rx implementations. To work around this, it is probably best to use `map` or some combination of `map` and `zip`. For example, `zip(source$, iterator)`
  could be `source$.pipe(map(value => [value, iterator.next().value]))`.

  **zip：** `zip` 操作符将不再“根据需要”迭代提供的可迭代对象，而是将可迭代对象视为推送流，就像它们在 RxJS 中的其他任何地方一样。这意味着传递一个无限迭代将导致线程锁定，因为它将无休止地尝试从该迭代中读取。这使我们与所有其他 Rx 实现保持一致。要解决此问题，最好使用 `map` 或 `map` 和 `zip` 的某种组合。例如，`zip(source$, iterator)` 可以是 `source$.pipe(map(value => [value, iterator.next().value]))`。

## ajax

## 阿贾克斯

- `ajax` body serialization will now use default XHR behavior in all cases. If the body is a `Blob`, `ArrayBuffer`, any array buffer view (like a byte sequence, e.g. `Uint8Array`, etc), `FormData`, `URLSearchParams`, `string`, or `ReadableStream`, default handling is use. If the `body` is otherwise `typeof` `"object"`, then it will be converted to JSON via `JSON.stringify`, and the `Content-Type` header will be set to `application/json;charset=utf-8`. All other types will emit an error.

  `ajax` 正文序列化现在将在所有情况下使用默认的 XHR 行为。如果主体是 `Blob`、`ArrayBuffer`、任何数组缓冲区视图（如字节序列，例如 `Uint8Array` 等）、`FormData`、`URLSearchParams`、`string` 或 `ReadableStream`，则使用默认处理。如果 `body` 是 `typeof` `"object"`，那么它将通过 `JSON.stringify` 转换为 JSON，并且 `Content-Type` 标头将设置为 `application/json;charset=utf-8`。所有其他类型都会发出错误。

- The `Content-Type` header passed to `ajax` configuration no longer has any effect on the serialization behavior of the AJAX request.

  传递给 `ajax` 配置的 `Content-Type` 标头不再对 AJAX 请求的序列化行为产生任何影响。

- For TypeScript users, `AjaxRequest` is no longer the type that should be explicitly used to create an `ajax`. It is now `AjaxConfig`, although the two types are compatible, only `AjaxConfig` has `progressSubscriber` and `createXHR`.

  对于 TypeScript 用户，`AjaxRequest` 不再是应该显式用于创建 `ajax` 的类型。现在是 `AjaxConfig`，虽然这两种类型是兼容的，但只有 `AjaxConfig` 有 `progressSubscriber` 和 `createXHR`。

- **ajax:** In an extreme corner-case... If an error occurs, the responseType is `"json"`, we're in IE, and the `responseType` is not valid JSON, the `ajax` observable will no longer emit a syntax error, rather it will emit a full `AjaxError` with more details.

  **ajax：**在极端的极端情况下......如果发生错误，responseType 是 `"json"`，我们在 IE 中，并且 `responseType` 不是有效的 JSON，`ajax` observable 将不再发出语法错误，而是它将发出带有更多详细信息的完整 `AjaxError`。

- **ajax:** Ajax implementation drops support for IE10 and lower. This puts us in-line with other implementations and helps clean up code in this area

  **ajax：** Ajax 实现放弃了对 IE10 及更低版本的支持。这使我们与其他实现保持一致，并有助于清理该领域的代码

