# Testing RxJS Code with Marble Diagrams

# 用大理石图测试 RxJS 代码

<div class="alert is-helpful">
  <span>This guide refers to usage of marble diagrams when using the new <code>testScheduler.run(callback)</code>. Some details here do not apply to using the TestScheduler manually, without using the <code>run()</code> helper.</span>
</div>

We can test our _asynchronous_ RxJS code _synchronously_ and deterministically by virtualizing time using the TestScheduler. **Marble diagrams** provide a visual way for us to represent the behavior of an Observable. We can use them to assert that a particular Observable behaves as expected, as well as to create [hot and cold Observables](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339) we can use as mocks.

我们可以通过使用 TestScheduler 虚拟化时间来 _ 同步 _ 和确定地测试我们的\_ 异步\_RxJS 代码。**大理石图为**我们提供了一种可视化的方式来表示 Observable 的行为。我们可以使用它们来断言特定的 Observable 的行为符合预期，以及创建可以用作模拟的[冷热 Observable](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339) 。

> At this time, the TestScheduler can only be used to test code that uses RxJS schedulers - `AsyncScheduler`, etc. If the code consumes a Promise, for example, it cannot be reliably tested with `TestScheduler`, but instead should be tested more traditionally. See the [Known Issues](#known-issues) section for more details.
>
> 此时，TestScheduler 只能用于测试使用 RxJS 调度器 - `AsyncScheduler` 等的代码。例如，如果代码使用 Promise，则无法使用 `TestScheduler` 进行可靠测试，而应该更传统地进行测试。有关更多详细信息，请参阅[已知问题](#known-issues)部分。
>

```ts
import { TestScheduler } from 'rxjs/testing';
import { throttleTime } from 'rxjs';

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).deep.equal(expected);
});

// This test runs synchronously.
it('generates the stream correctly', () => {
  testScheduler.run((helpers) => {
    const { cold, time, expectObservable, expectSubscriptions } = helpers;
    const e1 = cold(' -a--b--c---|');
    const e1subs = '  ^----------!';
    const t = time('   ---|       '); // t = 3
    const expected = '-a-----c---|';

    expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
```

## API

The callback function you provide to `testScheduler.run(callback)` is called with `helpers` object that contains functions you'll use to write your tests.

你提供给 `testScheduler.run(callback)` 的回调函数是使用 `helpers` 对象调用的，该对象包含你将用于编写测试的函数。

<div class="alert is-helpful">
  <span>
    When the code inside this callback is being executed, any operator that uses timers/AsyncScheduler (like delay, debounceTime, etc.,) will automatically use the TestScheduler instead, so that we have "virtual time". You do not need to pass the TestScheduler to them, like in the past.
  </span>
</div>

```ts
testScheduler.run((helpers) => {
  const { cold, hot, expectObservable, expectSubscriptions, flush, time, animate } = helpers;
  // use them
});
```

Although `run()` executes entirely synchronously, the helper functions inside your callback function do not! These functions **schedule assertions** that will execute either when your callback completes or when you explicitly call `flush()`. Be wary of calling synchronous assertions, for example `expect`, from your testing library of choice, from within the callback. See [Synchronous Assertion](#synchronous-assertion) for more information on how to do this.

尽管 `run()` 完全同步执行，但回调函数中的辅助函数却没有！这些函数**调度断言**，这些断言将在你的回调完成或你显式调用 `flush()` 时执行。小心在回调中从你选择的测试库中调用同步断言，例如 `expect` 。有关如何执行此操作的更多信息，请参阅[同步断言](#synchronous-assertion)。

- `cold(marbleDiagram: string, values?: object, error?: any)` - creates a "cold" observable whose subscription starts when the test begins.

  `cold(marbleDiagram: string, values?: object, error?: any)` - 创建一个 "cold" observable，它的订阅在测试开始时开始。

- `hot(marbleDiagram: string, values?: object, error?: any)` - creates a "hot" observable (like a subject) that will behave as though it's already "running" when the test begins. An interesting difference is that `hot` marbles allow a `^` character to signal where the "zero frame" is. That is the point at which the subscription to observables being tested begins.

  `hot(marbleDiagram: string, values?: object, error?: any)` - 创建一个“热”的可观察对象（就像一个主题），当测试开始时，它的行为就像它已经“运行”一样。一个有趣的区别是 `hot` 弹珠允许 `^` 字符表示“零帧”在哪里。这就是订阅被测试的 observables 的开始。

- `expectObservable(actual: Observable<T>, subscriptionMarbles?: string).toBe(marbleDiagram: string, values?: object, error?: any)` - schedules an assertion for when the TestScheduler flushes. Give `subscriptionMarbles` as parameter to change the schedule of subscription and unsubscription. If you don't provide the `subscriptionMarbles` parameter it will subscribe at the beginning and never unsubscribe. Read below about subscription marble diagram.

  `expectObservable(actual: Observable<T>, subscriptionMarbles?: string).toBe(marbleDiagram: string, values?: object, error?: any)` - 在 TestScheduler 刷新时安排一个断言。给 `subscriptionMarbles` 作为参数来改变订阅和取消订阅的时间表。如果你不提供 `subscriptionMarbles` 参数，它将在开始时订阅并且永远不会取消订阅。阅读以下有关订阅大理石图的信息。

- `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - like `expectObservable` schedules an assertion for when the testScheduler flushes. Both `cold()` and `hot()` return an observable with a property `subscriptions` of type `SubscriptionLog[]`. Give `subscriptions` as parameter to `expectSubscriptions` to assert whether it matches the `subscriptionsMarbles` marble diagram given in `toBe()`. Subscription marble diagrams are slightly different than Observable
  marble diagrams. Read more below.

  `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - 像 `expectObservable` 一样，在 testScheduler 刷新时安排一个断言。 `cold()` 和 `hot()` 都返回一个带有 `SubscriptionLog[]` 类型的属性 `subscriptions` 的 observable。将 `subscriptions` 作为参数提供给 `expectSubscriptions` 以断言它是否与 `toBe()` 中给出的 `subscriptionsMarbles` 大理石图匹配。订阅弹珠图与可观察弹珠图略有不同。在下面阅读更多内容。

- `flush()` - immediately starts virtual time. Not often used since `run()` will automatically flush for you when your callback returns, but in some cases you may wish to flush more than once or otherwise have more control.

  `flush()` - 立即开始虚拟时间。不经常使用，因为当你的回调返回时 `run()` 会自动为你刷新，但在某些情况下，你可能希望多次刷新或以其他方式拥有更多控制权。

- `time()` - converts marbles into a number indicating number of frames. It can be used by operators expecting a specific timeout. It measures time based on the position of the complete (`|`) signal:

  `time()` - 将弹珠转换为表示帧数的数字。期望特定超时的操作员可以使用它。它根据完整 ( `|` ) 信号的位置测量时间：

  ```ts
  testScheduler.run((helpers) => {
    const { time, cold } = helpers;
    const source = cold('---a--b--|');
    const t = time('        --|    ');
    //                         --|
    const expected = '   -----a--b|';
    const result = source.pipe(delay(t));
    expectObservable(result).toBe(expected);
  });
  ```

- `animate()` - specifies when requested animation frames will be 'painted'. `animate` accepts a marble diagram and each value emission in the diagram indicates when a 'paint' occurs - at which time, any queued `requestAnimationFrame` callbacks will be executed. Call `animate` at the beginning of your test and align the marble diagrams so that it's clear when the callbacks will be executed:

  `animate()` - 指定何时“绘制”请求的动画帧。 `animate` 接受一个弹珠图，图中的每个值发射都指示何时发生“绘制” - 届时，将执行任何排队的 `requestAnimationFrame` 回调。在测试开始时调用 `animate` 并对齐弹珠图，以便清楚何时执行回调：

  ```ts
  testScheduler.run((helpers) => {
    const { animate, cold } = helpers;
    animate('              ---x---x---x---x');
    const requests = cold('-r-------r------');
    /* ... */
    const expected = '     ---a-------b----';
  });
  ```

## Marble syntax

## 大理石语法

In the context of TestScheduler, a marble diagram is a string containing special syntax representing events happening over virtual time. Time progresses by _frames_. The first character of any marble string always represents the _zero frame_, or the start of time. Inside of `testScheduler.run(callback)` the frameTimeFactor is set to 1, which means one frame is equal to one virtual millisecond.

在 TestScheduler 的上下文中，弹珠图是一个字符串，其中包含表示虚拟时间发生的事件的特殊语法。时间按 _ 帧 _ 前进。任何弹珠字符串的第一个字符总是代表 _ 零帧 _ 或时间的开始。在 `testScheduler.run(callback)` 内部，frameTimeFactor 设置为 1，这意味着一帧等于一虚拟毫秒。

How many virtual milliseconds one frame represents depends on the value of `TestScheduler.frameTimeFactor`. For legacy reasons the value of `frameTimeFactor` is 1 _only_ when your code inside the `testScheduler.run(callback)` callback is running. Outside of it, it's set to 10. This will likely change in a future version of RxJS so that it is always 1.

一帧代表多少虚拟毫秒取决于 `TestScheduler.frameTimeFactor` 的值。由于遗留原因，_ 只有 _ 当 `testScheduler.run(callback)` 回调中的代码正在运行时， `frameTimeFactor` 的值才为 1。在它之外，它设置为 10。这可能会在 RxJS 的未来版本中发生变化，因此它始终为 1。

> IMPORTANT: This syntax guide refers to usage of marble diagrams when using the new `testScheduler.run(callback)`. The semantics of marble diagrams when using the TestScheduler manually are different, and some features like the new time progression syntax are not supported.
>
> 重要提示：本语法指南是指在使用新的 `testScheduler.run(callback)` 时使用弹珠图。手动使用 TestScheduler 时弹珠图的语义不同，并且不支持新的时间进度语法等某些功能。
>

- `' '` whitespace: horizontal whitespace is ignored, and can be used to help vertically align multiple marble diagrams.

  `' '` 空白：忽略水平空白，可用于帮助垂直对齐多个大理石图。

- `'-'` frame: 1 "frame" of virtual time passing (see above description of frames).

  `'-'` 帧：1 个虚拟时间流逝的“帧”（参见上面的帧描述）。

- `[0-9]+[ms|s|m]` time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of `ms` (milliseconds), `s` (seconds), or `m` (minutes) without any space between them, e.g. `a 10ms b`. See [Time progression syntax](#time-progression-syntax) for more details.

  `[0-9]+[ms|s|m]` 时间进度：时间进度语法允许你将虚拟时间推进特定数量。它是一个数字，后跟 `ms` （毫秒）、 `s` （秒）或 `m` （分钟）的时间单位，它们之间没有任何空格，例如 `a 10ms b` 。有关更多详细信息，请参阅[时间进度语法](#time-progression-syntax)。

- `'|'` complete: The successful completion of an observable. This is the observable producer signaling `complete()`.

  `'|'` 完成：一个可观察对象的成功完成。这是可观察的生产者信号 `complete()` 。

- `'#'` error: An error terminating the observable. This is the observable producer signaling `error()`.

  `'#'` 错误：终止 observable 的错误。这是可观察到的生产者信号 `error()` 。

- `[a-z0-9]` e.g. `'a'` any alphanumeric character: Represents a value being emitted by the producer signaling `next()`. Also consider that you could map this into an object or an array like this:

  `[a-z0-9]` 例如 `'a'` 任何字母数字字符：表示由生产者发出的信号 `next()` 发出的值。还要考虑你可以将它映射到一个对象或数组中，如下所示：

<!-- prettier-ignore -->

```ts
const expected = '400ms (a-b|)';
const values = {
  a: 'value emitted',
  b: 'another value emitted',
};

expectObservable(someStreamForTesting).toBe(expected, values);

// This would work also
const expected = '400ms (0-1|)';
const values = [
  'value emitted',
  'another value emitted'
];

expectObservable(someStreamForTesting).toBe(expected, values);
```

- `'()'` sync groupings: When multiple events need to be in the same frame synchronously, parentheses are used to group those events. You can group next'd values, a completion, or an error in this manner. The position of the initial `(` determines the time at which its values are emitted. While it can be counter-intuitive at first, after all the values have synchronously emitted time will progress a number of frames equal to the number of ASCII characters in the group, including the parentheses.
  e.g. `'(abc)'` will emit the values of a, b, and c synchronously in the same frame and then advance virtual time by 5 frames, `'(abc)'.length === 5`. This is done because it often helps you vertically align your marble diagrams, but it's a known pain point in real-world testing. [Learn more about known issues](#known-issues).

  `'()'` 同步分组：当多个事件需要同步在同一帧中时，括号用于对这些事件进行分组。你可以通过这种方式对下一个值、完成或错误进行分组。初始值 `(` 的位置决定了它的值被发出的时间。虽然一开始它可能是违反直觉的，但在所有值同步发出后，时间将前进的帧数等于组中的 ASCII 字符数, 包括括号。例如 `'(abc)'` 将在同一帧中同步发出 a、b 和 c 的值，然后将虚拟时间提前 5 帧， `'(abc)'.length === 5` 。这是完成是因为它通常可以帮助你垂直对齐大理石图，但这是实际测试中的一个已知痛点。[了解有关已知问题](#known-issues)的更多信息。

- `'^'` subscription point: (hot observables only) shows the point at which the tested observables will be subscribed to the hot observable. This is the "zero frame" for that observable, every frame before the `^` will be negative. Negative time might seem pointless, but there are in fact advanced cases where this is necessary, usually involving ReplaySubjects.

  `'^'` 订阅点：（仅限 hot observables）显示测试的 observables 将订阅 hot observable 的点。这是该可观察对象的“零帧”， `^` 之前的每一帧都是负数。负时间可能看起来毫无意义，但实际上在高级情况下这是必要的，通常涉及 ReplaySubjects。

### Time progression syntax

### 时间进展语法

The new time progression syntax takes inspiration from the CSS duration syntax. It's a number (integer or floating point) immediately followed by a unit; ms (milliseconds), s (seconds), m (minutes). e.g. `100ms`, `1.4s`, `5.25m`.

新的时间进度语法从 CSS 持续时间语法中汲取灵感。它是一个数字（整数或浮点数），后面紧跟一个单位； ms（毫秒）、s（秒）、m（分钟）。例如 `100ms` 、 `1.4s` 、 `5.25m` 。

When it's not the first character of the diagram it must be padded a space before/after to disambiguate it from a series of marbles. e.g. `a 1ms b` needs the spaces because `a1msb` will be interpreted as `['a', '1', 'm', 's', 'b']` where each of these characters is a value that will be next()'d as-is.

当它不是图表的第一个字符时，必须在之前/之后填充一个空格，以消除它与一系列弹珠的歧义。例如 `a 1ms b` 需要空格，因为 `a1msb` 将被解释为 `['a', '1', 'm', 's', 'b']` 其中每个字符都是 next()'d 的值原样。

**NOTE**: You may have to subtract 1 millisecond from the time you want to progress because the alphanumeric marbles (representing an actual emitted value) _advance time 1 virtual frame_ themselves already, after they emit. This can be counter-intuitive and frustrating, but for now it is indeed correct.

**注意**：你可能需要从你想要进行的时间中减去 1 毫秒，因为字母数字弹珠（代表实际发出的值）在它们发出后已经 _ 提前了 1 个虚拟帧 _ 本身。这可能是违反直觉和令人沮丧的，但现在它确实是正确的。

<!-- prettier-ignore -->

```ts
const input = ' -a-b-c|';
const expected = '-- 9ms a 9ms b 9ms (c|)';

// Depending on your personal preferences you could also
// use frame dashes to keep vertical alignment with the input.
// const input = ' -a-b-c|';
// const expected = '------- 4ms a 9ms b 9ms (c|)';
// or
// const expected = '-----------a 9ms b 9ms (c|)';

const result = cold(input).pipe(
  concatMap((d) => of(d).pipe(
    delay(10)
  ))
);

expectObservable(result).toBe(expected);
```

### Examples

### 例子

`'-'` or `'------'`: Equivalent to {@link NEVER}, or an observable that never emits or errors or completes.

`'-'` 或 `'------'` ：等价于 {@link NEVER}，或者是一个从不发射、错误或完成的可观察对象。

`|`: Equivalent to {@link EMPTY}, or an observable that never emits and completes immediately.

`|` : 等价于 {@link EMPTY}，或者是一个永远不会立即发出和完成的 observable。

`#`: Equivalent to {@link throwError}, or an observable that never emits and errors immediately.

`#` ：等价于 {@link throwError}，或者是一个永远不会立即发出错误的可观察对象。

`'--a--'`: An observable that waits 2 "frames", emits value `a` on frame 2 and then never completes.

`'--a--'` ：一个等待 2 个“帧”的可观察对象，在第 2 帧上发出值 `a` 然后永远不会完成。

`'--a--b--|'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `complete`.

`'--a--b--|'` ：在第 2 帧发出 `a` ，在第 5 帧发出 `b` ，在第 8 帧 `complete` 。

`'--a--b--#'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `error`.

`'--a--b--#'` ：在第 2 帧发出 `a` ，在第 5 帧发出 `b` ，在第 8 帧发出 `error` 。

`'-a-^-b--|'`: In a hot observable, on frame -2 emit `a`, then on frame 2 emit `b`, and on frame 5, `complete`.

`'-a-^-b--|'` ：在一个 hot observable 中，在 -2 帧上发出 `a` ，然后在第 2 帧上发出 `b` ，在第 5 帧上， `complete` 。

`'--(abc)-|'`: on frame 2 emit `a`, `b`, and `c`, then on frame 8, `complete`.

`'--(abc)-|'` ：在第 2 帧发出 `a` ， `b` 和 `c` ，然后在第 8 帧， `complete` 。

`'-----(a|)'`: on frame 5 emit `a` and `complete`.

`'-----(a|)'` ：在第 5 帧发出 `a` 并 `complete` 。

`'a 9ms b 9s c|'`: on frame 0 emit `a`, on frame 10 emit `b`, on frame 9,011 emit `c`, then on frame 9,012 `complete`.

`'a 9ms b 9s c|'` ：在第 0 帧发出 `a` ，在第 10 帧发出 `b` ，在第 9,011 帧发出 `c` ，然后在第 9,012 帧 `complete` 。

`'--a 2.5m b'`: on frame 2 emit `a`, on frame 150,003 emit `b` and never complete.

`'--a 2.5m b'` ：在第 2 帧发出 `a` ，在第 150,003 帧发出 `b` 并且永远不会完成。

## Subscription marbles

## 订阅弹珠

The `expectSubscriptions` helper allows you to assert that a `cold()` or `hot()` Observable you created was subscribed/unsubscribed to at the correct point in time. The `subscriptionMarbles` parameter to `expectObservable` allows your test to defer subscription to a later virtual time, and/or unsubscribe even if the observable being tested has not yet completed.

`expectSubscriptions` 帮助器允许你断言你创建的 `cold()` 或 `hot()` 可观察对象在正确的时间点被订阅/取消订阅。 `expectObservable` 的 `subscriptionMarbles` 参数允许你的测试将订阅推迟到以后的虚拟时间，和/或取消订阅，即使正在测试的 observable 尚未完成。

The subscription marble syntax is slightly different to conventional marble syntax.

订阅弹珠语法与传统弹珠语法略有不同。

- `'-'` time: 1 frame time passing.

  `'-'` 时间：1 帧时间过去。

- `[0-9]+[ms|s|m]` time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of `ms` (milliseconds), `s` (seconds), or `m` (minutes) without any space between them, e.g. `a 10ms b`. See [Time progression syntax](#time-progression-syntax) for more details.

  `[0-9]+[ms|s|m]` 时间进度：时间进度语法允许你将虚拟时间推进特定数量。它是一个数字，后跟 `ms` （毫秒）、 `s` （秒）或 `m` （分钟）的时间单位，它们之间没有任何空格，例如 `a 10ms b` 。有关更多详细信息，请参阅[时间进度语法](#time-progression-syntax)。

- `'^'` subscription point: shows the point in time at which a subscription happens.

  `'^'` 订阅点：显示订阅发生的时间点。

- `'!'` unsubscription point: shows the point in time at which a subscription is unsubscribed.

  `'!'` 退订点：显示退订的时间点。

There should be **at most one** `^` point in a subscription marble diagram, and **at most one** `!` point. Other than that, the `-` character is the only one allowed in a subscription marble diagram.

订阅弹珠图**中最多应该有一个**`^` 点**，最多有一个**`!` 观点。除此之外， `-` 字符是订阅弹珠图中唯一允许的字符。

### Examples

### 例子

`'-'` or `'------'`: no subscription ever happened.

`'-'` 或 `'------'` ：从未发生订阅。

`'--^--'`: a subscription happened after 2 "frames" of time passed, and the subscription was not unsubscribed.

`'--^--'` ：订阅发生在 2“帧”时间过去后，并且订阅没有取消订阅。

`'--^--!-'`: on frame 2 a subscription happened, and on frame 5 was unsubscribed.

`'--^--!-'` ：在第 2 帧发生了订阅，在第 5 帧被取消订阅。

`'500ms ^ 1s !'`: on frame 500 a subscription happened, and on frame 1,501 was unsubscribed.

`'500ms ^ 1s !'` ：在第 500 帧发生了订阅，在第 1,501 帧被取消订阅。

Given a hot source, test multiple subscribers that subscribe at different times:

给定一个热源，测试在不同时间订阅的多个订阅者：

```ts
testScheduler.run(({ hot, expectObservable }) => {
  const source = hot('--a--a--a--a--a--a--a--');
  const sub1 = '      --^-----------!';
  const sub2 = '      ---------^--------!';
  const expect1 = '   --a--a--a--a--';
  const expect2 = '   -----------a--a--a-';

  expectObservable(source, sub1).toBe(expect1);
  expectObservable(source, sub2).toBe(expect2);
});
```

Manually unsubscribe from a source that will never complete:

手动取消订阅永远不会完成的源：

```ts
it('should repeat forever', () => {
  const testScheduler = createScheduler();

  testScheduler.run(({ expectObservable }) => {
    const foreverStream$ = interval(1).pipe(mapTo('a'));

    // Omitting this arg may crash the test suite.
    const unsub = '------!';

    expectObservable(foreverStream$, unsub).toBe('-aaaaa');
  });
});
```

## Synchronous Assertion

## 同步断言

Sometimes, we need to assert changes in state _after_ an observable stream has completed - such as when a side effect like `tap` updates a variable. Outside of Marbles testing with TestScheduler, we might think of this as creating a delay or waiting before making our assertion.

有时，我们需要在可观察流完成 _ 后 _ 断言状态更改 - 例如当像 `tap` 这样的副作用更新变量时。在使用 TestScheduler 进行 Marbles 测试之外，我们可能会认为这是在做出断言之前造成延迟或等待。

For example:

例如：

```ts
let eventCount = 0;

const s1 = cold('--a--b|', { a: 'x', b: 'y' });

// side effect using 'tap' updates a variable
const result = s1.pipe(tap(() => eventCount++));

expectObservable(result).toBe('--a--b|', { a: 'x', b: 'y' });

// flush - run 'virtual time' to complete all outstanding hot or cold observables
flush();

expect(eventCount).toBe(2);
```

In the above situation we need the observable stream to complete so that we can test the variable was set to the correct value. The TestScheduler runs in 'virtual time' (synchronously), but doesn't normally run (and complete) until the testScheduler callback returns. The flush() method manually triggers the virtual time so that we can test the local variable after the observable completes.

在上述情况下，我们需要完成 observable 流，以便我们可以测试变量是否设置为正确的值。 TestScheduler 在“虚拟时间”（同步）运行，但在 testScheduler 回调返回之前通常不会运行（并完成）。 flush() 方法手动触发虚拟时间，以便我们可以在 observable 完成后测试局部变量。

* * *

## Known issues

## 已知的问题

### RxJS code that consumes Promises cannot be directly tested

### 使用 Promises 的 RxJS 代码无法直接测试

If you have RxJS code that uses asynchronous scheduling - e.g. Promises, etc. - you can't reliably use marble diagrams _for that particular code_. This is because those other scheduling methods won't be virtualized or known to TestScheduler.

如果你有使用异步调度的 RxJS 代码——例如 Promises 等——你不能可靠地 _ 为那个特定的代码 _ 使用弹珠图。这是因为那些其他调度方法不会被虚拟化或 TestScheduler 不知道。

The solution is to test that code in isolation, with the traditional asynchronous testing methods of your testing framework. The specifics depend on your testing framework of choice, but here's a pseudo-code example:

解决方案是使用测试框架的传统异步测试方法单独测试该代码。具体细节取决于你选择的测试框架，但这里有一个伪代码示例：

```ts
// Some RxJS code that also consumes a Promise, so TestScheduler won't be able
// to correctly virtualize and the test will always be really asynchronous.
const myAsyncCode = () => from(Promise.resolve('something'));

it('has async code', (done) => {
  myAsyncCode().subscribe((d) => {
    assertEqual(d, 'something');
    done();
  });
});
```

On a related note, you also can't currently assert delays of zero, even with `AsyncScheduler`, e.g. `delay(0)` is like saying `setTimeout(work, 0)`. This schedules a new ["task" aka "macrotask"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/), so it's asynchronous, but without an explicit passage of time.

在相关说明中，你目前也不能断言延迟为零，即使使用 `AsyncScheduler` ，例如 `delay(0)` 就像在说 `setTimeout(work, 0)` 。这会安排一个新的[“任务”又名“宏任务”](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) ，所以它是异步的，但没有明确的时间流逝。

### Behavior is different outside of `testScheduler.run(callback)`

### `testScheduler.run(callback)` 之外的行为不同

The `TestScheduler` has been around since v5, but was actually intended for testing RxJS itself by the maintainers, rather than for use in regular user apps. Because of this, some of the default behaviors and features of the TestScheduler did not work well (or at all) for users. In v6 we introduced the `testScheduler.run(callback)` method which allowed us to provide new defaults and features in a non-breaking way, but it's still possible
to [use the TestScheduler outside](https://github.com/ReactiveX/rxjs/blob/7113ae4b451dd8463fae71b68edab96079d089df/docs_app/content/guide/testing/internal-marble-tests.md) of `testScheduler.run(callback)`. It's important to note that if you do so, there are some major differences in how it will behave.

`TestScheduler` 从 v5 开始就已经存在，但实际上是为了由维护人员测试 RxJS 本身，而不是在普通用户应用程序中使用。正因为如此，TestScheduler 的一些默认行为和功能对用户来说效果不佳（或根本不工作）。在 v6 中，我们引入了 `testScheduler.run(callback)` 方法，它允许我们以非破坏性的方式提供新的默认值和特性，但仍然可以在 `testScheduler.run(callback)` [之外使用](https://github.com/ReactiveX/rxjs/blob/7113ae4b451dd8463fae71b68edab96079d089df/docs_app/content/guide/testing/internal-marble-tests.md)TestScheduler。重要的是要注意，如果你这样做，它的行为方式会有一些重大差异。

- `TestScheduler` helper methods have more verbose names, like `testScheduler.createColdObservable()` instead of `cold()`.

  `TestScheduler` 辅助方法具有更详细的名称，例如 `testScheduler.createColdObservable()` 而不是 `cold()` 。

- The testScheduler instance is _not_ automatically used by operators that use `AsyncScheduler`, e.g. `delay`, `debounceTime`, etc., so you have to explicitly pass it to them.

  使用 AsyncScheduler 的操作员 _ 不会 _ 自动使用 `AsyncScheduler` 实例，例如 `delay` 、 `debounceTime` 等，因此你必须将其显式传递给它们。

- There is NO support for time progression syntax e.g. `-a 100ms b-|`.

  不支持时间进度语法，例如 `-a 100ms b-|` .

- 1 frame is 10 virtual milliseconds by default. i.e. `TestScheduler.frameTimeFactor = 10`.

  1 帧默认为 10 个虚拟毫秒。即 `TestScheduler.frameTimeFactor = 10` 。

- Each whitespace `' '` equals 1 frame, same as a hyphen `'-'`.

  每个空格 `' '` 等于 1 帧，与连字符 `'-'` 相同。

- There is a hard maximum number of frames set at 750 i.e. `maxFrames = 750`. After 750 they are silently ignored.

  有一个硬性的最大帧数设置为 750 即 `maxFrames = 750` 。在 750 之后，它们会被默默地忽略。

- You must explicitly flush the scheduler.

  你必须显式刷新调度程序。

While at this time usage of the TestScheduler outside of `testScheduler.run(callback)` has not been officially deprecated, it is discouraged because it is likely to cause confusion.

虽然此时在 `testScheduler.run(callback)` 之外使用 TestScheduler 尚未被正式弃用，但不鼓励这样做，因为它可能会引起混淆。

