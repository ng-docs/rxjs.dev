# RxJS 6.x to 7.x Detailed Change List

# RxJS 6.x 到 7.x 详细变更列表

This document contains a detailed list of changes between RxJS 6.x and RxJS 7.x, presented in the order they can be found when diffing the TypeScript APIs in various module files.

本文档包含 RxJS 6.x 和 RxJS 7.x 之间更改的详细列表，按照在不同模块文件中区分 TypeScript API 时可以找到的顺序显示。

# module `rxjs`

# 模块 `rxjs`

## Breaking changes

## 重大变化

### AsyncSubject

### AsyncSubject(异步主体)

- `_subscribe` method is no longer `public` and is now `protected`.

  `_subscribe` 方法不再是 `public` 的，现在是 `protected` 的。

- no longer has its own implementation of the `error` method inherited from `Subject`.

  不再有自己的从 `Subject` 继承的 `error` 方法的实现。

### BehaviorSubject

### BehaviorSubject(行为主体)

- `_subscribe` method is no longer `public` and is now `protected`.

  `_subscribe` 方法不再是 `public` 的，现在是 `protected` 的。

- `value` property is a getter `get value()` instead of `readonly value`, and can no longer be forcibly set.

  `value` 属性是 getter `get value()` 而不是 `readonly value`，不能再强制设置。

### bindCallback

### bindCallback(绑定回调)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### combineLatest

### combineLatest(组合最新的)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### concat

### concat(串联)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### ConnectableObservable

### ConnectableObservable(可连接的可观察者)

- `_isComplete` is no longer a property.

  `_isComplete` 不再是一个属性。

- `_subscribe` method is no longer `public` and is now `protected`.

  `_subscribe` 方法不再是 `public` 的，现在是 `protected` 的。

### defer

### defer(推迟)

- Generic argument no longer extends `void`.

  通用参数不再扩展 `void`。

- `defer` no longer allows factories to return void or undefined. All factories passed to `defer` must return a proper `ObservableInput`, such as `Observable`, `Promise`, et al. To get the same behavior as you may have relied on previously, `return EMPTY` or `return of()` from the factory.

  `defer` 不再允许工厂返回 void 或 undefined。所有传递给 `defer` 的工厂都必须返回一个适当的 `ObservableInput`，例如 `Observable`、`Promise` 等。要获得与你之前可能依赖的相同行为，请从工厂 `return EMPTY` 或 `return of()`。

### forkJoin

### forkJoin(分叉加入)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### fromEvent

### fromEvent(从事件)

- The `fromEvent` signatures have been changed and there are now separate signatures for each type of target - DOM, Node, jQuery, etc. That means that an attempt to pass options - like `{ once: true }` - to a target that does not support an options argument will result in a TypeScript error.

  `fromEvent` 签名已更改，现在每种类型的目标（DOM、Node、jQuery 等）都有单独的签名。这意味着尝试将选项（例如 `{ once: true }`）传递给不支持 options 参数将导致 TypeScript 错误。

### GroupedObservable

### GroupedObservable(已分组的可观察者)

- No longer publicly exposes `_subscribe`

  不再公开暴露 `_subscribe`

- `key` properly is `readonly`.

  正确的 `key` 是 `readonly` 的。

- No longer publicly exposes `constructor`.

  不再公开公开 `constructor`。

### iif

### iif(如果)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- `iif` will no longer allow result arguments that are `undefined`. This was a bad call pattern that was likely an error in most cases. If for some reason you are relying on this behavior, simply substitute `EMPTY` in place of the `undefined` argument. This ensures that the behavior was intentional and desired, rather than the result of an accidental `undefined` argument.

  `iif` 将不再允许 `undefined` 的结果参数。这是一个糟糕的调用模式，在大多数情况下可能是一个错误。如果由于某种原因你依赖这种行为，只需用 `EMPTY` 代替 `undefined` 参数。这确保了行为是有意的和期望的，而不是意外 `undefined` 参数的结果。

### isObservable

### isObservable(是可观察者)

- No longer has a generic and returns `Observable<unknown>`, you must cast the result.

  不再具有泛型并返回 `Observable<unknown>`，你必须转换结果。

### merge

### merge(合并)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### Notification

### Notification(通知)

- The `error` property is now `readonly`.

  `error` 属性现在是 `readonly`。

- The `hasValue` property is now `readonly`.

  `hasValue` 属性现在是 `readonly` 的。

- The `kind` property is now `readonly`.

  `kind` 属性现在是 `readonly`。

- The `value` property is now `readonly` and may be `undefined`.

  `value` 属性现在是 `readonly` 的并且可能是 `undefined`。

- `constructor` signature now only allows valid construction. For example `new Notification('C', 'some_value')` will be an error in TypeScript.

  `constructor` 签名现在只允许有效构造。例如 `new Notification('C', 'some_value')` 在 TypeScript 中将是一个错误。

### Observable

### Observable(可观察者)

- `_isScalar` property removed.

  `_isScalar` 属性已删除。

- `_subscribe` method is no longer `public` and is now marked `@internal`.

  `_subscribe` 方法不再 `public`，现在标记为 `@internal`。

- `_trySubscribe` method is no longer `public` and is now `@internal`.

  `_trySubscribe` 方法不再 `public`，现在是 `@internal`。

- `pipe` method calls with `9` or more arguments will now return `Observable<unknown>` rather than `Observable<{}>`.

  具有 `9` 或更多参数的 `pipe` 方法调用现在将返回 `Observable<unknown>` 而不是 `Observable<{}>`。

- `toPromise` method now correctly returns `Promise<T | undefined>` instead of `Promise<T>`. This a correction without a runtime change, because if the observable does not emit a value before completion, the promise will resolve with `undefined`.

  `toPromise` 方法现在可以正确返回 `Promise<T | undefined>` 而不是 `Promise<T>`。这是一个没有运行时更改的更正，因为如果 observable 在完成之前没有发出值，则 promise 将解析为 `undefined`。

- `static if` and `static throw` properties are no longer defined. They were unused in version 6.

  不再定义 `static if` 和 `static throw` 属性。它们在版本 6 中未使用。

- `lift`, `source`, and `operator` properties are still **deprecated**, and should not be used. They are implementation details, and will very likely be renamed or missing in version 8.

  `lift`、`source` 和 `operator` 属性仍然**不推荐使用**，不应使用。它们是实现细节，很可能在版本 8 中被重命名或丢失。

### of

### of(对...包装成)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### onErrorResumeNext

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### pairs

### pairs(配对)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- `pairs` will no longer function in IE without a polyfill for `Object.entries`. `pairs` itself is also deprecated in favor of users just using `from(Object.entries(obj))`.

  如果没有 `Object.entries` 的 polyfill，`pairs` 将不再在 IE 中起作用。`pairs` 本身也被弃用，有利于仅使用 `from(Object.entries(obj))` 的用户。

### partition

### partition(划分)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### pipe

### pipe(管道)

- Calls with `9` or more arguments will now return `(arg: A) => unknown` rather than `(arg: A) => {}`.

  带有 `9` 或更多参数的调用现在将返回 `(arg: A) => unknown` 而不是 `(arg: A) => {}`。

### race

### race(竞速)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- `race` will no longer subscribe to subsequent observables if a provided source synchronously errors or completes. This means side effects that might have occurred during subscription in those rare cases will no longer occur.

  如果提供的源同步出错或完成，`race` 将不再订阅后续的 observables。这意味着在极少数情况下订阅期间可能发生的副作用将不再发生。

### ReplaySubject

### ReplaySubject(重播主体)

- `_getNow` method has been removed.

  `_getNow` 方法已被删除。

- `_subscribe` method is no longer `public` and is now `protected`.

  `_subscribe` 方法不再是 `public` 的，现在是 `protected` 的。

### Subscribable

### Subscribable(可订阅的)

- `subscribe` will accept `Partial<Observer<T>>` now. All overloads with functions as arguments have been removed. This is because `Subscribable` is intended to map to the basic observable contract from the TC39 proposal and the the return type of a call to `[Symbol.observable]()`.

  `subscribe` 现在将接受 `Partial<Observer<T>>`。所有以函数作为参数的重载都已被删除。这是因为 `Subscribable` 旨在映射到 TC39 提案中的基本可观察合约和对 `[Symbol.observable]()` 的调用的返回类型。

### SubscribableOrPromise

### SubscribableOrPromise(订阅或承诺)

- See notes on `Subscribable` above.

  请参阅上面关于 `Subscribable` 的注释。

### Subscriber

### Subscriber(订阅者)

- `destination` property must now be a `Subscriber` or full `Observer`.

  `destination` 属性现在必须是 `Subscriber` 或完整的 `Observer`。

- `syncErrorThrowable` property has been removed.

  `syncErrorThrowable` 属性已被移除。

- `syncErrorThrown` property has been removed.

  `syncErrorThrown` 属性已被删除。

- `syncErrorValue` property has been removed.

  `syncErrorValue` 属性已被删除。

- `_unsubscribeAndRecycle` method has been removed.

  `_unsubscribeAndRecycle` 方法已被删除。

### Subscription

### Subscription(订阅)

- `_parentOrParents` property has been removed.

  `_parentOrParents` 属性已被删除。

- `add` method returns `void` and no longer returns a `Subscription`. Returning `Subscription` was an old behavior from the early days of version 5. If you add a function to a subscription (i.e. `subscription.add(fn)`), you can remove that function directly by calling `remove` with the same function instance. (i.e. `subscription.remove(fn)`). Previously, you needed to get the returned `Subscription` object and pass _that_ to `remove`. In version 6 and lower, the `Subscription` returned by calling `add` with
  another `Subscription` was always the same subscription you passed in. (meaning `subscription.add(subs1).add(subs2)` was an antipattern and the same as `subscription.add(subs1); subs1.add(subs2);`.

  `add` 方法返回 `void` 并且不再返回 `Subscription`。返回 `Subscription` 是版本 5 早期的一个旧行为。如果你向订阅添加一个函数（即 `subscription.add(fn)`），你可以通过使用相同的函数实例调用 `remove` 直接删除该函数。（即 `subscription.remove(fn)`）。以前，你需要获取返回的 `Subscription` 对象并将*其传递*给 `remove`。在版本 6 及更低版本中，使用另一个 `Subscription` 调用 `add` 返回的 `Subscription` 始终与你传入的订阅相同。（意味着 `subscription.add(subs1).add(subs2)` 是一个反模式，与 `subscription.add(subs1); subs1.add(subs2);` .

### VirtualAction

### VirtualAction(虚拟动作)

- The static `sortActions` method has been removed.

  静态 `sortActions` 方法已被删除。

### zip

### zip(拉合)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- Zipping a single array will now have a different result. This is an extreme corner-case, because it is very unlikely that anyone would want to zip an array with nothing at all. The workaround would be to wrap the array in another array `zip([[1,2,3]])`. But again, that's pretty weird.

  压缩单个数组现在会有不同的结果。这是一个极端的极端情况，因为任何人都不太可能想要一无所有地压缩一个数组。解决方法是将数组包装在另一个数组 `zip([[1,2,3]])` 中。但同样，这很奇怪。

* * *

## New Features

## 新特性

### animationFrames

### animationFrames(动画帧)

- A new method for creating a stream of animation frames. Each event will carry with it a high-resolution timestamp, and an elapsed time since observation was started.

  一种创建动画帧流的新方法。每个事件都将带有一个高分辨率的时间戳，以及自观察开始以来经过的时间。

### config

### config(配置)

#### onUnhandledError

- A handler for dealing with errors that make it all the way down to the "end" of the observation chain when there is no error handler in the observer. Useful for doing things like logging unhandled errors in RxJS observable chains.

  当观察者中没有错误处理程序时，用于处理一直到观察链“末端”的错误的处理程序。对于在 RxJS 可观察链中记录未处理的错误等事情很有用。

#### onStoppedNotification

- A handler for edge cases where a subscriber within RxJS is notified after it has already "stopped", that is, a point in time where it has received an error or complete, but hasn't yet finalized. This is mostly useful for logging purposes.

  边缘情况的处理程序，其中 RxJS 中的订阅者在它已经“停止”之后得到通知，即它收到错误或完成但尚未完成的时间点。这主要用于记录目的。

#### useDeprecatedNextContext

- In RxJS 6, a little used feature allowed users to access the `subscriber` directly as `this` within a call to the `next` handler. The problem with this is it incurred heavy performance penalties. That behavior has been changed (because it wasn't really documented and it was barely ever used) to not change the `this` context of any user-provided subscription handlers. If you need to get that feature back, you can switch it on with this flag. Note this behavior will be removed completely in version 8.

  在 RxJS 6 中，一个很少使用的功能允许用户在调用 `this` `next` 处理程序时直接访问 `subscriber` 者。这样做的问题是它招致了严重的性能损失。该行为已更改（因为它没有真正记录并且几乎从未使用过）以不更改任何用户提供的订阅处理程序的 `this` 上下文。如果你需要恢复该功能，可以使用此标志打开它。请注意，此行为将在版本 8 中完全删除。

### connectable

### connectable(可连接的)

- This is the new means for creating a `ConnectableObservable`, and really is a replacement for non-selector usage of `multicast` and `publish` variants. Simply pass your source observable to `connectable` with the `Subject` you'd like to connect through.

  这是创建 `ConnectableObservable` 的新方法，实际上是对 `multicast` 和 `publish` 变体的非选择器使用的替代。只需将你的源 observable 传递给你想要 `connectable` 的 `Subject` 即可连接。

### firstValueFrom

### firstValueFrom(第一个值来自)

- A better, more tree-shakable replacement for `toPromise()` (which is now deprecated). This function allows the user to convert any `Observable` in to a `Promise` that will resolve when the source observable emits its first value. If the source observable closes without emitting a value, the returned promise will reject with an `EmptyError`, or it will resolve with a configured `defaultValue`. For more information, see the [deprecation guide](/deprecations/to-promise).

  `toPromise()` 的更好、更可摇树的替代品（现已弃用）。此函数允许用户将任何 `Observable` 转换为 `Promise`，该 Promise 将在源 observable 发出其第一个值时解析。如果源 observable 在没有发出值的情况下关闭，则返回的 Promise 将拒绝并返回 `EmptyError`，或者它将使用配置的 `defaultValue` 解析。有关详细信息，请参阅[弃用指南](/deprecations/to-promise)。

### lastValueFrom

### lastValueFrom(最后一个值来自)

- A better, more tree-shakable replacement for `toPromise()` (which is now deprecated). This function allows the user to convert any `Observable` in to a `Promise` that will resolve when the source observable emits the last value. If the source observable closes without emitting a value, the returned promise will reject with an `EmptyError`, or it will resolve with a configured `defaultValue`. For more information, see the [deprecation guide](/deprecations/to-promise).

  `toPromise()` 的更好、更可摇树的替代品（现已弃用）。此函数允许用户将任何 `Observable` 转换为 `Promise`，该 Promise 将在源 observable 发出最后一个值时解析。如果源 observable 在没有发出值的情况下关闭，则返回的 Promise 将拒绝并返回 `EmptyError`，或者它将使用配置的 `defaultValue` 解析。有关详细信息，请参阅[弃用指南](/deprecations/to-promise)。

### ObservableInput

### ObservableInput(可观察者的输入)

- This is just a type, but it's important. This type defines the allowed types that can be passed to almost every API within RxJS that accepts an Observable. It has always accepted `Observable`, `Promise`, `Iterable`, and `ArrayLike`. Now it will also accept `AsyncIterable` and `ReadableStream`.

  这只是一种类型，但它很重要。这种类型定义了可以传递给 RxJS 中几乎所有接受 Observable 的 API 的允许类型。它一直接受 `Observable`、`Promise`、`Iterable` 和 `ArrayLike`。现在它也将接受 `AsyncIterable` 和 `ReadableStream`。

#### AsyncIterable

#### AsyncIterable(异步可迭代者)

- `AsyncIterables` such as those defined by `IxJS` or by async generators (`async function*`), may now be passed to any API that accepts an observable, and can be converted to an `Observable` directly using `from`.

  `AsyncIterables`，例如由 `IxJS` 或异步生成器（`async function*`）定义的那些，现在可以传递给任何接受 observable 的 API，并且可以直接使用 `from` 转换为 `Observable`。

#### ReadableStream

#### ReadableStream(可读流)

- `ReadableStream` such as those returned by `fetch`, et al, can be passed to any API that accepts an observable, and can be converted to `Observable` directly using `from`.

  `ReadableStream`（例如 `fetch` 等返回的）可以传递给任何接受 observable 的 API，并且可以直接使用 `from` 转换为 `Observable`。

### ReplaySubject

### ReplaySubject(重播主体)

- A [bug was fixed](https://github.com/ReactiveX/rxjs/pull/5696) that prevented a completed or errored `ReplaySubject` from accumulating values in its buffer when resubscribed to another source. This breaks some uses - like [this StackOverflow answer](https://stackoverflow.com/a/54957061) - that depended upon the buggy behavior.

  [修复了一个错误，](https://github.com/ReactiveX/rxjs/pull/5696)该错误会阻止已完成或错误的 `ReplaySubject` 在重新订阅另一个源时在其缓冲区中累积值。这打破了一些依赖于错误行为的用途——比如[这个 StackOverflow 答案](https://stackoverflow.com/a/54957061)。

### Subscription

### Subscription(订阅)

- Now allows adding and removing of functions directly via `add` and `remove` methods.

  现在允许通过 `add` 和 `remove` 方法直接添加和删除函数。

### throwError

### throwError(抛出错误)

- Now accepts an `errorFactory` of `() => any` to defer the creation of the error until the time it will be emitted. It is recommended to use this method, as Errors created in most popular JavaScript runtimes will retain all values in the current scope for debugging purposes.

  现在接受 `() => any` 的 `errorFactory` 以将错误的创建推迟到它发出的时间。建议使用此方法，因为在大多数流行的 JavaScript 运行时中创建的错误将保留当前范围内的所有值以进行调试。

# module `rxjs/operators`

# 模块 `rxjs/operators`

## Breaking Changes

## 重大变化

### audit

### audit(审计)

- The observable returned by the `audit` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.

  `audit` 操作员的持续时间选择器返回的可观察者必须发出下一个通知以结束持续时间。完成通知不再结束持续时间。

- `audit` now emits the last value from the source when the source completes. Previously, `audit` would mirror the completion without emitting the value.

  `audit` 现在在源完成时从源发出最后一个值。以前，`audit` 会镜像完成而不发出值。

### auditTime

### auditTime(审计时间)

- `auditTime` now emits the last value from the source when the source completes, after the audit duration elapses. Previously, `auditTime` would mirror the completion without emitting the value and without waiting for the audit duration to elapse.

  在审计持续时间过去后，`auditTime` 现在在源完成时从源发出最后一个值。以前，`auditTime` 会镜像完成而不发出值，也不需要等待审计持续时间过去。

### buffer

### buffer(缓冲)

- `buffer` now subscribes to the source observable before it subscribes to the closing notifier. Previously, it subscribed to the closing notifier first.

  `buffer` 现在在订阅关闭通知器之前订阅源 observable。以前，它首先订阅关闭通知程序。

- Final buffered values will now always be emitted. To get the same behavior as the previous release, you can use `endWith` and `skipLast(1)`, like so: `source$.pipe(buffer(notifier$.pipe(endWith(true))), skipLast(1))`

  现在将始终发出最终缓冲值。要获得与先前版本相同的行为，你可以使用 `endWith` 和 `skipLast(1)`，如下所示： `source$.pipe(buffer(notifier$.pipe(endWith(true))), skipLast(1))`

- `closingNotifier` completion no longer completes the result of `buffer`. If that is truly a desired behavior, then you should use `takeUntil`. Something like: `source$.pipe(buffer(notifier$), takeUntil(notifier$.pipe(ignoreElements(), endWith(true))))`, where `notifier$` is multicast, although there are many ways to compose this behavior.

  `closingNotifier` 完成不再完成 `buffer` 的结果。如果这确实是一种理想的行为，那么你应该使用 `takeUntil`。类似于： `source$.pipe(buffer(notifier$), takeUntil(notifier$.pipe(ignoreElements(), endWith(true))))`，其中 `notifier$` 是多播，尽管有很多方法可以构成这种行为。

### bufferToggle

### bufferToggle(缓冲区切换)

- The observable returned by the `bufferToggle` operator's closing selector must emit a next notification to close the buffer. Complete notifications no longer close the buffer.

  `bufferToggle` 操作符的关闭选择器返回的 observable 必须发出下一个通知来关闭缓冲区。完成通知不再关闭缓冲区。

### bufferWhen

### bufferWhen(当...时缓冲)

- The observable returned by the `bufferWhen` operator's closing selector must emit a next notification to close the buffer. Complete notifications no longer close the buffer.

  `bufferWhen` 操作符的关闭选择器返回的 observable 必须发出下一个通知来关闭缓冲区。完成通知不再关闭缓冲区。

### combineLatest

### combineLatest(组合最新的)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### concat

### concat(串联)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- Still deprecated, use the new `concatWith`.

  仍然不推荐使用，使用新的 `concatWith`。

### concatAll

### concatAll(串联所有)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### concatMapTo

### concatMapTo(串联映射为)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### count

### count(计数)

- No longer passes `source` observable as a third argument to the predicate. That feature was rarely used, and of limited value. The workaround is to simply close over the source inside of the function if you need to access it in there.

  不再将 `source` observable 作为第三个参数传递给谓词。该功能很少使用，并且价值有限。解决方法是简单地关闭函数内部的源，如果你需要在其中访问它。

### debounce

### debounce(防抖)

- The observable returned by the `debounce` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.

  `debounce` 操作符的持续时间选择器返回的 observable 必须发出下一个通知以结束持续时间。完成通知不再结束持续时间。

### debounceTime

### debounceTime(按时间防抖)

- The `debounceTime` implementation is more efficient and no longer schedules an action for each received next notification. However, because the implementation now uses the scheduler's concept of time, any tests using Jasmine's `clock` will need to ensure that [`jasmine.clock().mockDate()`](https://jasmine.github.io/api/edge/Clock.html#mockDate) is called after `jasmine.clock().install()` - because Jasmine does not mock `Date.now()` by default.

  `debounceTime` 实现更高效，不再为每个收到的下一个通知安排一个操作。但是，因为现在的实现使用了调度器的时间概念，所以任何使用 Jasmine `clock` 的测试都需要确保[`jasmine.clock().mockDate()`](https://jasmine.github.io/api/edge/Clock.html#mockDate)在 `jasmine.clock().install()` 之后调用 - 因为 Jasmine 不模拟 `Date.now()` 默认情况下。

### defaultIfEmpty

### defaultIfEmpty(如果为空则默认)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- `defaultIfEmpty` requires a value be passed. Will no longer convert `undefined` to `null` for no good reason.

  `defaultIfEmpty` 需要传递一个值。将不再无缘无故地将 `undefined` 转换为 `null`。

### delayWhen

### delayWhen(当...时延迟)

- `delayWhen` will no longer emit if the duration selector simply completes without a value. Notifiers must notify with a value, not a completion.

  如果持续时间选择器只是在没有值的情况下完成，则 `delayWhen` 将不再发出。通知者必须通知一个值，而不是完成。

### endWith

### endWith(以...结束)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### expand

### expand(展开)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### finalize

### finalize(最终处理)

- `finalize` will now unsubscribe from its source _before_ it calls its callback. That means that `finalize` callbacks will run in the order in which they occur in the pipeline: `source.pipe(finalize(() => console.log(1)), finalize(() => console.log(2)))` will log `1` and then `2`. Previously, callbacks were called in the reverse order.

  `finalize` 现在将在调用其回调*之前*取消订阅其源。这意味着 `finalize` 回调将按照它们在管道中出现的顺序运行： `source.pipe(finalize(() => console.log(1)), finalize(() => console.log(2)))` 将记录 `1` 然后 `2`。以前，回调是按相反的顺序调用的。

### map

### map(映射)

- `thisArg` will now default to `undefined`. The previous default of `MapSubscriber` never made any sense. This will only affect code that calls map with a `function` and references `this` like so: `source.pipe(map(function () { console.log(this); }))`. There wasn't anything useful about doing this, so the breakage is expected to be very minimal. If anything we're no longer leaking an implementation detail.

  `thisArg` 现在将默认为 `undefined`。`MapSubscriber` 以前的默认设置从来没有任何意义。这只会影响使用 `function` 调用 map 并像这样引用 `this` 的代码： `source.pipe(map(function () { console.log(this); }))`。这样做没有任何用处，因此预计破损将非常小。如果有的话，我们将不再泄露实现细节。

### merge

### merge(合并)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- Still deprecated, use the new `mergeWith`.

  仍然不推荐使用，使用新的 `mergeWith`。

### mergeAll

### mergeAll(合并所有)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### mergeScan

### mergeScan(合并扫描)

- `mergeScan` will no longer emit its inner state again upon completion.

  `mergeScan` 后将不再发出其内部状态。

### pluck

### pluck(抽取)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### race

### race(竞速)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### reduce

### reduce(归结)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### sample

### 样本

- The `sample` operator's notifier observable must emit a next notification to effect a sample. Complete notifications no longer effect a sample.

  `sample` 操作员的通知器 observable 必须发出下一个通知来影响样本。完整的通知不再影响样本。

### scan

### scan(扫描)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### single

### single(单值)

- The `single` operator will now throw for scenarios where values coming in are either not present, or do not match the provided predicate. Error types have thrown have also been updated, please check documentation for changes.

  现在，`single` 操作符将在传入的值不存在或与提供的谓词不匹配的情况下抛出。引发的错误类型也已更新，请查看文档以了解更改。

### skipLast

### skipLast(跳过最后)

- `skipLast` will no longer error when passed a negative number, rather it will simply return the source, as though `0` was passed.

  当传递一个负数时，`skipLast` 将不再出错，而是简单地返回源，就好像传递了 `0`。

### startWith

### startWith(从...开始)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### switchAll

### switchAll(全部切换)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### switchMapTo

### switchMapTo(切换映射为)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### take

### take(取出)

- `take` and will now throw runtime error for arguments that are negative or NaN, this includes non-TS calls like `take()`.

  `take` 并且现在将为负数或 NaN 的参数抛出运行时错误，这包括像 `take()` 这样的非 TS 调用。

### takeLast

### takeLast(取出最后)

- `takeLast` now has runtime assertions that throw `TypeError`s for invalid arguments. Calling takeLast without arguments or with an argument that is `NaN` will throw a `TypeError`.

  `takeLast` 现在有运行时断言，会为无效参数抛出 `TypeError`。不带参数或使用 `NaN` 参数调用 takeLast 将引发 `TypeError`。

### throttle

### throttle(瓶颈)

- The observable returned by the `throttle` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.

  `throttle` 操作符的持续时间选择器返回的 observable 必须发出下一个通知以结束持续时间。完成通知不再结束持续时间。

### throwError

### throwError(抛出错误)

- In an extreme corner case for usage, `throwError` is no longer able to emit a function as an error directly. If you need to push a function as an error, you will have to use the factory function to return the function like so: `throwError(() => functionToEmit)`, in other words `throwError(() => () => console.log('called later'))`.

  在使用的极端极端情况下，`throwError` 不再能够直接将函数作为错误发出。如果你需要将函数作为错误推送，则必须使用工厂函数来返回函数，如下所示： `throwError(() => functionToEmit)`，换句话说 `throwError(() => () => console.log('called later'))`。

### window

### window(窗户)

- The `windowBoundaries` observable no longer completes the result. It was only ever meant to notify of the window boundary. To get the same behavior as the old behavior, you would need to add an `endWith` and a `skipLast(1)` like so: `source$.pipe(window(notifier$.pipe(endWith(true))), skipLast(1))`.

  `windowBoundaries` 可观察者不再完成结果。它只是用来通知窗口边界。要获得与旧行为相同的行为，你需要添加一个 `endWith` 和一个 `skipLast(1)`，如下所示： `source$.pipe(window(notifier$.pipe(endWith(true))), skipLast(1))` .

### windowToggle

### windowToggle(窗口切换)

- The observable returned by the `windowToggle` operator's closing selector must emit a next notification to close the window. Complete notifications no longer close the window.

  `windowToggle` 操作符的关闭选择器返回的 observable 必须发出下一个通知来关闭窗口。完成通知不再关闭窗口。

### withLatestFrom

### withLatestFrom(与来自...的最新值合成)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

### zip

### zip(拉合)

- Generic signatures have changed. Do not explicitly pass generics.

  通用签名已更改。不要显式传递泛型。

- Still deprecated, use the new `zipWith`.

  仍然不推荐使用，使用新的 `zipWith`。

- `zip` operators will no longer iterate provided iterables "as needed", instead the iterables will be treated as push-streams just like they would be everywhere else in RxJS. This means that passing an endless iterable will result in the thread locking up, as it will endlessly try to read from that iterable. This puts us in-line with all other Rx implementations. To work around this, it is probably best to use `map` or some combination of `map` and `zip`. For example, `zip(source$, iterator)` could
  be `source$.pipe(map(value => [value, iterator.next().value]))`.

  `zip` 操作符将不再“根据需要”迭代提供的可迭代对象，而是将可迭代对象视为推送流，就像它们在 RxJS 中的其他任何地方一样。这意味着传递一个无限迭代将导致线程锁定，因为它将无休止地尝试从该迭代中读取。这使我们与所有其他 Rx 实现保持一致。要解决此问题，最好使用 `map` 或 `map` 和 `zip` 的某种组合。例如，`zip(source$, iterator)` 可以是 `source$.pipe(map(value => [value, iterator.next().value]))`。

## New Features

## 新特性

### connect

### connect(连接)

- New operator to cover the use cases of `publish` variants that use a `selector`. Wherein the selector allows the user to define multicast behavior prior to connection to the source observable for the multicast.

  新操作符涵盖使用 `selector` 的 `publish` 变体的用例。其中选择器允许用户在连接到多播来源可观察者之前定义多播行为。

### share

### share(分享)

- Added functionality to allow complete configuration of what type of `Subject` is used to multicast, and when that subject is reset.

  添加了允许完整配置用于多播的 `Subject` 类型以及该主题何时重置的功能。

### timeout

### timeout(超时)

- Added more configuration options to `timeout`, so it could be used to timeout just if the first item doesn't arrive quickly enough, or it could be used as a timeout between each item. Users may also pass a `Date` object to define an absolute time for a timeout for the first time to arrive. Adds additional information to the timeout error, and the ability to pass along metadata with the timeout for identification purposes.

  为 `timeout` 添加了更多配置选项，因此它可以用于仅当第一个项目没有足够快地到达时才超时，或者它可以用作每个项目之间的超时。用户还可以传递一个 `Date` 对象来定义第一次到达超时的绝对时间。将附加信息添加到超时错误中，并能够将元数据与超时一起传递以进行识别。

### zipWith, concatWith, mergeWith, raceWith

- Simply renamed versions of the operators `zip`, `concat`, `merge`, and `race`. So we can deprecate those old names and use the new names without collisions.

  简单地重命名了操作符 `zip`、`concat`、`merge` 和 `race` 的版本。所以我们可以弃用那些旧名称并使用新名称而不会发生冲突。

# module `rxjs/ajax`

# 模块 `rxjs/ajax`

## Breaking Changes

## 重大变化

### ajax

- `ajax` body serialization will now use default XHR behavior in all cases. If the body is a `Blob`, `ArrayBuffer`, any array buffer view (like a byte sequence, e.g. `Uint8Array`, etc), `FormData`, `URLSearchParams`, `string`, or `ReadableStream`, default handling is use. If the `body` is otherwise `typeof` `"object"`, then it will be converted to JSON via `JSON.stringify`, and the `Content-Type` header will be set to `application/json;charset=utf-8`. All other types will emit an error.

  `ajax` 正文序列化现在将在所有情况下使用默认的 XHR 行为。如果主体是 `Blob`、`ArrayBuffer`、任何数组缓冲区视图（如字节序列，例如 `Uint8Array` 等）、`FormData`、`URLSearchParams`、`string` 或 `ReadableStream`，则使用默认处理。如果 `body` 是 `typeof` `"object"`，那么它将通过 `JSON.stringify` 转换为 JSON，并且 `Content-Type` 标头将设置为 `application/json;charset=utf-8`。所有其他类型都会发出错误。

- The `Content-Type` header passed to `ajax` configuration no longer has any effect on the serialization behavior of the AJAX request.

  传递给 `ajax` 配置的 `Content-Type` 标头不再对 AJAX 请求的序列化行为产生任何影响。

- For TypeScript users, `AjaxRequest` is no longer the type that should be explicitly used to create an `ajax`. It is now `AjaxConfig`, although the two types are compatible, only `AjaxConfig` has `progressSubscriber` and `createXHR`.

  对于 TypeScript 用户，`AjaxRequest` 不再是应该显式用于创建 `ajax` 的类型。现在是 `AjaxConfig`，虽然这两种类型是兼容的，但只有 `AjaxConfig` 有 `progressSubscriber` 和 `createXHR`。

- Ajax implementation drops support for IE10 and lower. This puts us in-line with other implementations and helps clean up code in this area

  Ajax 实现放弃了对 IE10 及更低版本的支持。这使我们与其他实现保持一致，并有助于清理该领域的代码

### AjaxRequest

### AjaxRequest(Ajax 请求)

- `AjaxRequest` is no longer used to type the configuration argument for calls to `ajax`. The new type is `AjaxConfig`. This was done to disambiguate two very similar types with different use cases. `AjaxRequest` is still there, but properties have changed, and it is used to show what final request information was send as part of an event response.

  `AjaxRequest` 不再用于键入配置参数以调用 `ajax`。新类型是 `AjaxConfig`。这样做是为了消除具有不同用例的两种非常相似的类型。`AjaxRequest` 仍然存在，但属性已更改，它用于显示作为事件响应的一部分发送的最终请求信息。

## New Features

## 新特性

### AjaxResponse

### AjaxResponse(Ajax 响应)

- Now includes `responseHeaders`.

  现在包括 `responseHeaders`。

- Now includes event `type` and `total` numbers for examining upload and download progress (see `includeUploadProgress` and `includeDownloadProgress`).

  现在包括用于检查上传和下载进度的事件 `type` 和 `total`（请参阅 `includeUploadProgress` 和 `includeDownloadProgress`）。

### includeUploadProgress

### includeUploadProgress(包括上传进度)

- A flag to make a request that will include streaming upload progress events in the returned observable.

  发出请求的标志，该请求将在返回的 observable 中包含流式上传进度事件。

### includeDownloadProgress

### includeDownloadProgress(包括下载进度)

- A flag to make a request that will include streaming upload progress events in the returned observable.

  发出请求的标志，该请求将在返回的 observable 中包含流式上传进度事件。

### queryParams

### queryParams(查询参数)

- Configuration for setting query parameters in the URL of the request to be made.

  用于在要发出的请求的 URL 中设置查询参数的配置。

### XSRF (CSRF) additions:

### XSRF (CSRF) 补充：

- `xsrfCookieName` and `xsrfHeaderName` were added for cross-site request forgery prevention capabilities.

  添加了 `xsrfCookieName` 和 `xsrfHeaderName` 以实现跨站点请求伪造防护功能。

# module `rxjs/fetch`

# 模块 `rxjs/fetch`

No changes.

没有变化。

# module `rxjs/testing`

# 模块 `rxjs/testing`

## New Features

## 新特性

### TestScheduler expectObservable().toEqual()

- A new means of comparing the equality of to observables. If all emissions are the same, and at the same time, then they are equal. This is primarily useful for refactoring operator chains and making sure that they are equivalent.

  一种比较可观察者的相等性的新方法。如果所有排放量都相同，并且同时，那么它们是相等的。这主要用于重构操作符链并确保它们是等价的。

