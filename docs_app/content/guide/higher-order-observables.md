# Higher-order Observables

# 高阶可观察者

Observables most commonly emit ordinary values like strings and numbers, but surprisingly often, it is necessary to handle Observables *of* Observables, so-called higher-order Observables. For example, imagine you have an Observable emitting strings that are the URLs of files you want to fetch. The code might look like this:

可观察者通常会发出普通值，如字符串和数字，但令人惊讶的是，经常有需要处理可观察者*的*可观察者，即所谓的高阶可观察者。例如，假设你有一个会发出字符串的可观察者，这些字符串是你要获取的文件的 URL。代码可能如下所示：

```ts
const fileObservable = urlObservable.pipe(
   map(url => http.get(url)),
);
```

`http.get()` returns an Observable for each URL. Now you have an Observable *of* Observables, a higher-order Observable.

`http.get()` 会为每个 URL 返回一个可观察者。现在你有了一个可观察者*的*可观察者，也就是高阶可观察者。

But how do you work with a higher-order Observable? Typically, by _flattening_: by converting a higher-order Observable into an ordinary Observable. For example:

但是你如何使用更高阶的可观察者呢？通常，通过*展平*来将高阶可观察者转换为普通的可观察者。例如：

```ts
const fileObservable = urlObservable.pipe(
   concatMap(url => http.get(url)),
);
```

The Observable returned in the `concatMap` function is usually referred to as a so-called "inner" Observable, while in this context the `urlObservable` is the so-called "outer" Observable.

`concatMap` 函数中返回的可观察者通常称为所谓的“内部”可观察者，而在这个上下文中，`urlObservable` 就是所谓的“外部”可观察者。

The [`concatMap()`](/api/operators/concatMap) operator subscribes to each "inner" Observable, buffers all further emissions of the "outer" Observable, and copies all the emitted values until the inner Observable completes, and continues processing the values of the "outer Observable". All of the values are in that way concatenated. Other useful flattening operators are

[`concatMap()`](/api/operators/concatMap) 操作符会订阅每个“内部” Observable，缓冲“外部” Observable 的所有进一步发送，并复制所有已发送的值，直到内部 Observable 完成，并继续处理“外部 Observable”的值。所有值都以这种方式连接。其他有用的展平操作符有

* [`mergeMap()`](/api/operators/mergeMap) — subscribes to each inner Observable as it arrives, then emits each value as it arrives

  [`mergeMap()`](/api/operators/mergeMap) — 在每个内部 Observable 抵达时订阅它，然后在每个值抵达时发出这个值

* [`switchMap()`](/api/operators/switchMap) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, but when the next inner Observable arrives, unsubscribes to the previous one, and subscribes to the new one.

  [`switchMap()`](/api/operators/switchMap) — 在第一个内部 Observable 抵达时订阅它，并在它抵达时发出每个值，但是当下一个内部 Observable 抵达时，退订前一个，并订阅新的。

* [`exhaustMap()`](/api/operators/exhaustMap) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, discarding all newly arriving inner Observables until that first one completes, then waits for the next inner Observable.

  [`exhaustMap()`](/api/operators/exhaustMap) - 当第一个内部 Observable 抵达时订阅它，并在它抵达时发出每个值，丢弃所有新抵达的内部 Observable 直到第一个完成，然后等待下一个内部 Observable。

