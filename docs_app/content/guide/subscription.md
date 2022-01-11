# Subscription

# 订阅

**What is a Subscription?** A Subscription is an object that represents a disposable resource, usually the execution of an Observable. A Subscription has one important method, `unsubscribe`, that takes no argument and just disposes the resource held by the subscription. In previous versions of RxJS, Subscription was called "Disposable".

**什么是订阅？** Subscription 是一个表示一次性资源的对象，通常是 Observable 的执行。订阅有一个重要的方法 `unsubscribe`，它不接受任何参数，只是释放订阅持有的资源。在以前的 RxJS 版本中，Subscription 被称为“Disposable”。

```ts
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe(x => console.log(x));
// Later:
// This cancels the ongoing Observable execution which
// was started by calling subscribe with an Observer.
subscription.unsubscribe(); 
```

<span class="informal">A Subscription essentially just has an `unsubscribe()` function to release resources or cancel Observable executions.</span>

<span class="informal">Subscription 本质上只有一个 `unsubscribe()` 函数来释放资源或取消 Observable 执行。</span>

Subscriptions can also be put together, so that a call to an `unsubscribe()` of one Subscription may unsubscribe multiple Subscriptions. You can do this by "adding" one subscription into another:

订阅也可以放在一起，以便调用一个订阅的 `unsubscribe()` 可以取消订阅多个订阅。你可以通过将一个订阅“添加”到另一个订阅中来做到这一点：

```ts
import { interval } from 'rxjs';

const observable1 = interval(400);
const observable2 = interval(300);

const subscription = observable1.subscribe(x => console.log('first: ' + x));
const childSubscription = observable2.subscribe(x => console.log('second: ' + x));

subscription.add(childSubscription);

setTimeout(() => {
  // Unsubscribes BOTH subscription and childSubscription
  subscription.unsubscribe();
}, 1000);
```

When executed, we see in the console:

执行时，我们在控制台中看到：

```none
second: 0
first: 0
second: 1
first: 1
second: 2
```

Subscriptions also have a `remove(otherSubscription)` method, in order to undo the addition of a child Subscription.

订阅也有一个 `remove(otherSubscription)` 方法，以撤消添加子订阅。

