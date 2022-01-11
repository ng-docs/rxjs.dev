# Observer

# 观察者

**What is an Observer?** An Observer is a consumer of values delivered by an Observable. Observers are simply a set of callbacks, one for each type of notification delivered by the Observable: `next`, `error`, and `complete`. The following is an example of a typical Observer object:

**什么是观察者？** Observer 是 Observable 传递的值的消费者。观察者只是一组回调，对应于 Observable 传递的每种类型的通知： `next` 、 `error` 和 `complete` 。下面是一个典型的 Observer 对象的例子：

```ts
const observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
```

To use the Observer, provide it to the `subscribe` of an Observable:

要使用 Observer，请将其提供给 Observable 的 `subscribe` ：

```ts
observable.subscribe(observer);
```

<span class="informal">Observers are just objects with three callbacks, one for each type of notification that an Observable may deliver.</span>

观察者只是具有三个回调的对象，一个用于 Observable 可能传递的每种类型的通知。

Observers in RxJS may also be *partial*. If you don't provide one of the callbacks, the execution of the Observable will still happen normally, except some types of notifications will be ignored, because they don't have a corresponding callback in the Observer.

RxJS 中的观察者也可能是*部分*的。如果你不提供其中一个回调，Observable 的执行仍然会正常进行，除了某些类型的通知会被忽略，因为它们在 Observer 中没有对应的回调。

The example below is an `Observer` without the `complete` callback:

下面的例子是一个没有 `complete` 回调的 `Observer` ：

```ts
const observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
};
```

When subscribing to an `Observable`, you may also just provide the next callback as an argument, without being attached to an `Observer` object, for instance like this:

订阅 `Observable` 时，你也可以只提供下一个回调作为参数，而不附加到 `Observer` 对象，例如：

```ts
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```

Internally in `observable.subscribe`, it will create an `Observer` object using the callback argument as the `next` handler.

在 `observable.subscribe` 内部，它将使用回调参数作为 `next` 处理程序创建一个 `Observer` 对象。

