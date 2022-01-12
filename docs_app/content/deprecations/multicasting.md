# Multicasting

# 多播

In version 7, the multicasting APIs were simplified to just a few functions:

在版本 7 中，多播 API 被简化为几个函数：

- [connectable](/api/index/function/connectable)

  [connectable(可连接者)](/api/index/function/connectable)

- [connect](/api/operators/connect)

  [connect(连接)](/api/operators/connect)

- [share](/api/operators/share)

  [share(共享)](/api/operators/share)

And [shareReplay](/api/operators/shareReplay) - which is a thin wrapper around the now highly-configurable [share](/api/operators/share) operator.

以及 [shareReplay(共享重播)](/api/operators/shareReplay) - 它是高度可配置的 [share(共享)](/api/operators/share) 操作符的浅层包装。

Other APIs that relate to multicasting are now deprecated.

其他与多播相关的 API 现在已弃用。

<div class="alert is-important">
    <span>
        These deprecations were introduced in RxJS 7.0 and will become breaking in RxJS 8.
    </span>
</div>

## APIs affected by this Change

## 受此变更影响的 API

- [ConnectableObservable](/api/index/class/ConnectableObservable)
  
  [ConnectableObservable(可连接的可观察者)](/api/index/class/ConnectableObservable)
  
- [multicast](/api/operators/multicast)

  [multicast(多播)](/api/operators/multicast)

- [publish](/api/operators/publish)

  [publish(发布)](/api/operators/publish)

- [publishBehavior](/api/operators/publishBehavior)

  [publishBehavior(发布行为)](/api/operators/publishBehavior)

- [publishLast](/api/operators/publishLast)

  [publishLast(发布末尾)](/api/operators/publishLast)

- [publishReplay](/api/operators/publishReplay)

  [publishReplay(发布重播)](/api/operators/publishReplay)

- [refCount](/api/operators/refCount)

  [refCount(引用计数)](/api/operators/refCount)

## How to refactor

## 如何重构

### ConnectableObservable

Instead of creating a [ConnectableObservable](/api/index/class/ConnectableObservable) instance, call the [connectable](/api/index/function/connectable) function to obtain a connectable observable.

无需创建[ConnectableObservable](/api/index/class/ConnectableObservable)实例，而是调用[可连接](/api/index/function/connectable)函数来获取可连接的 observable。

<!-- prettier-ignore -->

```ts
import { ConnectableObservable, timer, Subject } from 'rxjs';

// deprecated
const tick$ = new ConnectableObservable(
  timer(1_000),
  () => new Subject());
tick$.connect();
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, Subject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject()
});
tick$.connect();
```

In situations in which the `refCount` method is used, the [share](/api/operators/share) operator can be used instead.

在使用 `refCount` 方法的情况下，可以使用[share](/api/operators/share)运算符。

<!-- prettier-ignore -->

```ts
import { ConnectableObservable, timer, Subject } from 'rxjs';

// deprecated
const tick$ = new ConnectableObservable(
  timer(1_000),
  () => new Subject()
).refCount();
```

<!-- prettier-ignore -->

```ts
import { timer, share, Subject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({ connector: () => new Subject() })
);
```

### multicast

### 多播

Where [multicast](/api/operators/multicast) is called with a subject factory, can be replaced with [connectable](/api/index/function/connectable).

使用主题工厂调用[多播](/api/operators/multicast)的地方，可以用[connectable](/api/index/function/connectable)替换。

<!-- prettier-ignore -->

```ts
import { timer, multicast, Subject, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  multicast(() => new Subject())
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, Subject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject()
});
```

Where [multicast](/api/operators/multicast) is called with a subject instance, it can be replaced with [connectable](/api/index/function/connectable) and a local subject instance.

如果使用主题实例调用[多播](/api/operators/multicast)，则可以将其替换为[可连接](/api/index/function/connectable)的和本地主题实例。

<!-- prettier-ignore -->

```ts
import { timer, multicast, Subject, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  multicast(new Subject())
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, Subject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject(),
  resetOnDisconnect: false
});
```

Where [multicast](/api/operators/multicast) is used in conjunction with [refCount](/api/operators/refCount), it can be replaced with [share](/api/index/function/connectable).

[多播](/api/operators/multicast)与[refCount](/api/operators/refCount)一起使用的地方，可以用[share](/api/index/function/connectable)代替。

<!-- prettier-ignore -->

```ts
import { timer, multicast, Subject, refCount } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  multicast(() => new Subject()),
  refCount()
);
```

<!-- prettier-ignore -->

```ts
import { timer, share, Subject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({ connector: () => new Subject() })
);
```

Where [multicast](/api/operators/multicast) is used with a selector, it can be replaced with [connect](/api/index/function/connect).

在[多播](/api/operators/multicast)与选择器一起使用的情况下，它可以替换为[connect](/api/index/function/connect)。

<!-- prettier-ignore -->

```ts
import { timer, multicast, Subject, combineLatest } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  multicast(
    () => new Subject(),
    (source) => combineLatest([source, source])
  )
);
```

<!-- prettier-ignore -->

```ts
import { timer, connect, combineLatest, Subject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]), {
    connector: () => new Subject()
  })
);
```

### publish

### 发布

If you're using [publish](/api/operators/publish) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) instead.

如果你使用[publish](/api/operators/publish)创建[ConnectableObservable](/api/index/class/ConnectableObservable)，则可以使用[connectable](/api/index/function/connectable)。

<!-- prettier-ignore -->

```ts
import { timer, publish, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publish()
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, Subject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject<number>(),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publish](/api/operators/publish), you can use [share](/api/operators/share) to replace both.

如果将[refCount](/api/operators/refCount)应用于[publish](/api/operators/publish)的结果，则可以使用[share](/api/operators/share)替换两者。

<!-- prettier-ignore -->

```ts
import { timer, publish, refCount } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publish(),
  refCount()
);
```

<!-- prettier-ignore -->

```ts
import { timer, share } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false
  })
);
```

If [publish](/api/operators/publish) is being called with a selector, you can use the [connect](/api/operators/connect) operator instead.

如果使用选择器调用[发布](/api/operators/publish)，则可以改用[连接](/api/operators/connect)运算符。

<!-- prettier-ignore -->

```ts
import { timer, publish, combineLatest } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publish((source) => combineLatest([source, source]))
);
```

<!-- prettier-ignore -->

```ts
import { timer, connect, combineLatest } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]))
);
```

### publishBehavior

### 发布行为

If you're using [publishBehavior](/api/operators/publishBehavior) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and a [BehaviorSubject](api/index/class/BehaviorSubject) instead.

如果你使用[publishBehavior](/api/operators/publishBehavior)创建[ConnectableObservable](/api/index/class/ConnectableObservable)，则可以使用[connectable](/api/index/function/connectable)和[BehaviorSubject](api/index/class/BehaviorSubject)。

<!-- prettier-ignore -->

```ts
import { timer, publishBehavior, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishBehavior(0)
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, BehaviorSubject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new BehaviorSubject(0),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishBehavior](/api/operators/publishBehavior), you can use the [share](/api/operators/share) operator - with a [BehaviorSubject](api/index/class/BehaviorSubject) connector - to replace both.

如果将[refCount](/api/operators/refCount)应用于[publishBehavior](/api/operators/publishBehavior)的结果，则可以使用[共享](/api/operators/share)运算符（带有[BehaviorSubject](api/index/class/BehaviorSubject)连接器）来替换两者。

<!-- prettier-ignore -->

```ts
import { timer, publishBehavior, refCount } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishBehavior(0),
  refCount()
);
```

<!-- prettier-ignore -->

```ts
import { timer, share, BehaviorSubject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new BehaviorSubject(0),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false
  })
);
```

### publishLast

### 发布最后

If you're using [publishLast](/api/operators/publishLast) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and an [AsyncSubject](api/index/class/AsyncSubject) instead.

如果你使用[publishLast](/api/operators/publishLast)创建[ConnectableObservable](/api/index/class/ConnectableObservable)，则可以使用[connectable 和 AsyncSubject](api/index/class/AsyncSubject) [。](/api/index/function/connectable)

<!-- prettier-ignore -->

```ts
import { timer, publishLast, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishLast()
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, AsyncSubject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new AsyncSubject<number>(),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishLast](/api/operators/publishLast), you can use the [share](/api/operators/share) operator - with an [AsyncSubject](api/index/class/AsyncSubject) connector - to replace both.

如果将[refCount](/api/operators/refCount)应用于[publishLast](/api/operators/publishLast)的结果，则可以使用[共享](/api/operators/share)运算符（带有[AsyncSubject](api/index/class/AsyncSubject)连接器）来替换两者。

<!-- prettier-ignore -->

```ts
import { timer, publishLast, refCount } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishLast(),
  refCount()
);
```

<!-- prettier-ignore -->

```ts
import { timer, share, AsyncSubject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new AsyncSubject(),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false
  })
);
```

### publishReplay

### 发布重播

If you're using [publishReplay](/api/operators/publishReplay) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and a [ReplaySubject](api/index/class/ReplaySubject) instead.

如果你使用[publishReplay](/api/operators/publishReplay)创建[ConnectableObservable](/api/index/class/ConnectableObservable)，则可以使用[connectable 和 ReplaySubject](api/index/class/ReplaySubject) [。](/api/index/function/connectable)

<!-- prettier-ignore -->

```ts
import { timer, publishReplay, ConnectableObservable } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1)
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->

```ts
import { connectable, timer, ReplaySubject } from 'rxjs';

// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new ReplaySubject<number>(1),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishReplay](/api/operators/publishReplay), you can use the [share](/api/operators/share) operator - with a [ReplaySubject](api/index/class/ReplaySubject) connector - to replace both.

如果将[refCount](/api/operators/refCount)应用于[publishReplay](/api/operators/publishReplay)的结果，你可以使用[共享](/api/operators/share)运算符（带有[ReplaySubject](api/index/class/ReplaySubject)连接器）来替换两者。

<!-- prettier-ignore -->

```ts
import { timer, publishReplay, refCount } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1),
  refCount()
);
```

<!-- prettier-ignore -->

```ts
import { timer, share, ReplaySubject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new ReplaySubject(1),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false
  })
);
```

If [publishReplay](/api/operators/publishReplay) is being called with a selector, you can use the [connect](/api/operators/connect) operator - with a [ReplaySubject](api/index/class/ReplaySubject) connector - instead.

如果使用选择器调用[publishReplay](/api/operators/publishReplay)，则可以使用[连接](/api/operators/connect)运算符 - 带有[ReplaySubject](api/index/class/ReplaySubject)连接器 - 代替。

<!-- prettier-ignore -->

```ts
import { timer, publishReplay, combineLatest } from 'rxjs';

// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1, undefined, (source) => combineLatest([source, source]))
);
```

<!-- prettier-ignore -->

```ts
import { timer, connect, combineLatest, ReplaySubject } from 'rxjs';

// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]), {
    connector: () => new ReplaySubject(1)
  })
);
```

### refCount

### 引用计数

Instead of applying the [refCount](/api/operators/refCount) operator to the [ConnectableObservable](/api/index/class/ConnectableObservable) obtained from a [multicast](/api/operators/multicast)
or [publish](/api/operators/publish) operator, use the [share](/api/operators/share) operator to replace both.

不要将[refCount](/api/operators/refCount)运算符应用于从[多播](/api/operators/multicast)或[发布](/api/operators/publish)运算符获得的[ConnectableObservable](/api/index/class/ConnectableObservable)，而是使用[共享](/api/operators/share)运算符来替换两者。

The properties passed to [share](/api/operators/share) will depend upon the operators that are being replaced. The refactors for using [refCount](/api/operators/refCount) with [multicast](/api/operators/multicast), [publish](/api/operators/publish), [publishBehavior](/api/operators/publishBehavior), [publishLast](/api/operators/publishLast) and [publishReplay](/api/operators/publishReplay) are detailed above.

传递给[share](/api/operators/share)的属性将取决于被替换的运算符。上面详细介绍了将[refCount](/api/operators/refCount)与[multicast](/api/operators/multicast)、[publish](/api/operators/publish)、[publishBehavior](/api/operators/publishBehavior)、[publishLast](/api/operators/publishLast)和[publishReplay](/api/operators/publishReplay)一起使用的重构。

