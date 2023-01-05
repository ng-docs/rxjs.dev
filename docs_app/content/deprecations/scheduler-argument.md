# Scheduler Argument

# Scheduler(调度器)参数

To limit the API surface of some operators, but also prepare for a [major refactoring in V8](https://github.com/ReactiveX/rxjs/pull/4583), we agreed on deprecating the `scheduler` argument from many operators. It solely deprecates those methods where this argument is rarely used. So `time` related operators, like [`interval`](https://rxjs.dev/api/index/function/interval) are not affected by this deprecation.

为了限制某些操作符的对外 API，同时也为 [V8 中的重大重构](https://github.com/ReactiveX/rxjs/pull/4583)做准备，我们决定从许多操作符中弃用 `scheduler` 参数。它只会弃用那些很少使用此参数的方法。因此，与 `time` 相关的操作符（如 [`interval`](https://rxjs.dev/api/index/function/interval)）不受此弃用的影响。

To support this transition the [scheduled creation function](/api/index/function/scheduled) was added.

为了支持这种转变，添加了[创建型函数 scheduled](/api/index/function/scheduled)。

<div class="alert is-important">

    <span>
        This deprecation was introduced in RxJS 6.5 and will become breaking with RxJS 8.
    </span>

    <span>
        此弃用是 RxJS 6.5 中引入的，并且将在 RxJS 8 中成为重大变更。
    </span>

</div>

## Operators affected by this Change

## 受此变更影响的操作符

- [from](/api/index/function/from)

  [from(从...转为)](/api/index/function/from)

- [of](/api/index/function/of)

  [of(把...包装为)](/api/index/function/of)

- [merge](/api/index/function/merge)

  [merge(合并)](/api/index/function/merge)

- [concat](/api/index/function/concat)

  [concat(串联)](/api/index/function/concat)

- [startWith](/api/operators/startWith)

  [startWith(以...开始)](/api/operators/startWith)

- [endWith](/api/operators/endWith)

  [endWith(以...结尾)](/api/operators/endWith)

- [combineLatest](/api/index/function/combineLatest)

  [combineLatest(组合最新的)](/api/index/function/combineLatest)

## How to Refactor

## 如何重构

If you use any other operator from the list above and using the `scheduler` argument, you have to three potential refactoring options.

如果你使用上面列表中的任何其它操作符并使用 `scheduler` 参数，则必须使用三个潜在的重构选项。

### Refactoring of `of` and `from`

### 重构 `of` 和 `from`

`scheduled` is kinda copying the behavior of `from`. Therefore if you used `from` with a `scheduler` argument, you can just replace them.

`scheduled` 的行为有点像 `from`。因此，如果你要为 `from` 传入 `scheduler` 参数，则只要替换它们即可。

For the `of` creation function you need to this Observable with `scheduled` and instead of passing the `scheduler` argument to `of` pass it to `scheduled`. Following code example demonstrate this process.

创建函数 `of`，你需要将此 Observable 与 `scheduled` 一起使用，而不是将 `scheduler` 参数传递给 `of`。以下代码示例演示了此过程。

```ts
import { of, asyncScheduler, scheduled } from 'rxjs';

// Deprecated approach
of(1, 2, 3, asyncScheduler).subscribe((x) => console.log(x));
// suggested approach
scheduled([1, 2, 3], asyncScheduler).subscribe((x) => console.log(x));
```

### Refactoring of `merge`, `concat`, `combineLatest`, `startWith` and `endWith`

### 重构 `merge`、`concat`、`combineLatest`、`startWith` 和 `endWith`

In case you used to pass a scheduler argument to one of these operators you probably had code like this:

如果你曾经将调度器参数传递给这些操作符之一，可能有这样的代码：

```ts
import { concat, of, asyncScheduler } from 'rxjs';

concat(of('hello '), of('World'), asyncScheduler).subscribe((x) => console.log(x));
```

To work around this deprecation you can leverage the [`scheduled`](/api/index/function/scheduled) function.

要解决此弃用问题，你可以利用 [`scheduled`](/api/index/function/scheduled) 函数。

```ts
import { scheduled, of, asyncScheduler, concatAll } from 'rxjs';

scheduled([of('hello '), of('World')], asyncScheduler)
  .pipe(concatAll())
  .subscribe((x) => console.log(x));
```

You can apply this pattern to refactor deprecated usage of `concat`, `startWith` and `endWith` but do notice that you will want to use [mergeAll](/api/operators/mergeAll) to refactor the deprecated usage of `merge`.

你可以应用此模式来重构已弃用的 `concat`、`startWith` 和 `endWith`，但请注意你要用 [mergeAll](/api/operators/mergeAll) 重构已弃用的 `merge`。

With `combineLatest`, you will want to use [combineLatestAll](/api/operators/combineLatestAll)

如果是 `combineLatest`，你就要改用 [combineLatestAll](/api/operators/combineLatestAll)

E.g. code that used to look like this:

例如，过去看起来像这样的代码：

```ts
import { combineLatest, of, asyncScheduler } from 'rxjs';

combineLatest(of('hello '), of('World'), asyncScheduler).subscribe(console.log);
```

would become:

会成为：

```ts
import { scheduled, of, asyncScheduler, combineLatestAll } from 'rxjs';

scheduled([of('hello '), of('World')], asyncScheduler)
  .pipe(combineLatestAll())
  .subscribe((x) => console.log(x));
```
