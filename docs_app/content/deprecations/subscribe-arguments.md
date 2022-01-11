# Subscribe Arguments

# 订阅参数

You might have seen that we deprecated some signatures of the `subscribe` method, which might have caused some confusion. The `subscribe` method itself is not deprecated. This deprecation also affects the [`tap` operator](../../api/operators/tap), as tap supports the same signature as the `subscribe` method.

你可能已经看到我们弃用了 `subscribe` 方法的一些签名，这可能会引起一些混乱。`subscribe` 方法本身没有被弃用。这种弃用也会影响[`tap` 操作符](../../api/operators/tap)，因为 tap 支持与 `subscribe` 方法相同的签名。

This is to get ready for a future where we may allow configuration of `subscribe` via the second argument, for things like `AbortSignal` or the like (imagine `source$.subscribe(fn, { signal })`, etc). This deprecation is also because 2-3 function arguments can contribute to harder-to-read code. For example someone could name functions poorly and confuse the next reader: `source$.subscribe(doSomething, doSomethingElse, lol)` With that signature, you have to know unapparent details about `subscribe`, where
using a partial observer solves that neatly: `source$.subscribe({ next: doSomething, error: doSomethingElse, complete: lol })`.

这是为将来我们可能允许通过第二个参数配置 `subscribe` 做准备，例如 `AbortSignal` 等（想象 `source$.subscribe(fn, { signal })` 等）。这种弃用也是因为 2-3 个函数参数可能会导致代码更难阅读。例如，有人可能会很差地命名函数并使下一位读者感到困惑： `source$.subscribe(doSomething, doSomethingElse, lol)` 使用该签名，你必须了解有关 `subscribe` 的不明显细节，使用部分观察者可以巧妙地解决这个问题： `source$.subscribe({ next: doSomething, error: doSomethingElse, complete: lol })`。

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.4.
    </span>
</div>

In short we deprecated all signatures where you specified an anonymous `error` or `complete` callback and passed an empty function to one of the callbacks before.

简而言之，我们弃用了你指定匿名 `error` 或 `complete` 回调的所有签名，并将一个空函数传递给之前的回调之一。

## What Signature is affected

## 什么签名受到影响

**We have deprecated all signatures of `subscribe` that take more than 1 argument.**

**我们已弃用所有接受超过 1 个参数的 `subscribe` 签名。**

We deprecated signatures for just passing the `complete` callback.

我们弃用了仅传递 `complete` 回调的签名。

```ts
import { of } from 'rxjs';

// deprecated
of([1,2,3]).subscribe(null, null, console.info); // difficult to read
// suggested change
of([1,2,3]).subscribe({complete: console.info});
```

Similarly, we also deprecated signatures for solely passing the `error` callback.

同样，我们也弃用了仅传递 `error` 回调的签名。

```ts
import { throwError } from 'rxjs';

// deprecated 
throwError('I am an error').subscribe(null, console.error);
// suggested change
throwError('I am an error').subscribe({error: console.error});
```

Do notice, in general it is recommended only to use the anonymous function if you only specify the `next` callback otherwise we recommend to pass an `Observer`

请注意，一般来说，如果你只指定 `next` 回调，则建议仅使用匿名函数，否则我们建议传递 `Observer`

```ts
import { of } from 'rxjs';

// recommended 
of([1,2,3]).subscribe((v) => console.info(v));
// also recommended
of([1,2,3]).subscribe({
    next: (v) => console.log(v),
    error: (e) => console.error(e),
    complete: () => console.info('complete') 
})
```
