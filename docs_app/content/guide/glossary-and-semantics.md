# RxJS: Glossary And Semantics

# RxJS：词汇表和语义

When discussing and documenting observables, it's important to have a common language and a known set of rules around what is going on. This document is an attempt to standardize these things so we can try to control the language in our docs, and hopefully other publications about RxJS, so we can discuss reactive programming with RxJS on consistent terms.

在讨论和记录 observables 时，有一个共同的语言和一套关于正在发生的事情的已知规则是很重要的。本文档试图将这些东西标准化，以便我们可以尝试控制我们的文档中的语言，并希望其他有关 RxJS 的出版物，这样我们就可以用一致的术语讨论 RxJS 的反应式编程。

While not all of the documentation for RxJS reflects this terminology, it is a goal of the team to ensure it does, and to ensure the language and names around the library use this document as a source of truth and unified language.

虽然并非所有 RxJS 的文档都反映了这个术语，但团队的目标是确保它这样做，并确保库周围的语言和名称使用这个文档作为事实和统一语言的来源。

## Major Entities

## 主要实体

There are high level entities that are frequently discussed. It's important to define them separately from other lower-level concepts, because they relate to the nature of observable.

有经常讨论的高级实体。将它们与其他较低级别的概念分开定义很重要，因为它们与可观察的性质有关。

### Consumer

### 消费者

The code that is subscribing to the observable. This is whoever is being _notified_ of [nexted](#next) values, and [errors](#error) or [completions](#complete).

订阅 observable 的代码。这是 _ 通知 _ 下[一个](#next)值、[错误](#error)或[完成](#complete)的人。

### Producer

### 制片人

Any system or thing that is the source of values that are being pushed out of the observable subscription to the consumer. This can be a wide variety of things, from a `WebSocket` to a simple iteration over an `Array`. The producer is most often created during the [subscribe](#subscribe) action, and therefor "owned" by a [subscription](#subscription) in a 1:1 way, but that is not always the case. A producer may be shared between many subscriptions, if it is created outside of the [subscribe](#subscribe)
action, in which case it is one-to-many, resulting in a [multicast](#multicast).

任何作为价值来源的系统或事物被推出消费者的可观察订阅。这可以是各种各样的东西，从 `WebSocket` 到对 `Array` 的简单迭代。生产者通常是在[订阅](#subscribe)操作期间创建的，因此以 1:1 的方式由[订阅](#subscription)“拥有”，但情况并非总是如此。一个生产者可以在多个订阅之间共享，如果它是在[订阅](#subscribe)操作之外创建的，在这种情况下它是一对多的，从而产生一个[多播](#multicast)。

### Subscription

### 订阅

A contract where a [consumer](#consumer) is [observing](#observation) values pushed by a [producer](#producer). The subscription (not to be confused with the `Subscription` class or type), is an ongoing process that amounts to the function of the observable from the Consumer's perspective. Subscription starts the moment a [subscribe](#subscribe) action is initiated, even before the [subscribe](#subscribe) action is finished.

[消费者](#consumer)[观察](#observation)[生产者](#producer)推送的值的合同。订阅（不要与 `Subscription` 类或类型混淆）是一个持续的过程，从消费者的角度来看，它相当于可观察的功能。订阅从发起[订阅](#subscribe)操作的那一刻开始，甚至在[订阅](#subscribe)操作完成之前。

### Observable

### 可观察的

The primary type in RxJS. At its highest level, an observable represents a template for connecting an [Observer](#observer), as a [consumer](#consumer), to a [producer](#producer), via a [subscribe](#subscribe) action, resulting in a [subscription](#subscription).

RxJS 中的主要类型。在其最高级别，可观察对象表示一个模板，用于通过[订阅](#subscribe)操作将[观察者](#observer)作为[消费者](#consumer)连接到[生产者](#producer)，从而产生[订阅](#subscription)。

### Observer

### 观察者

The manifestation of a [consumer](#consumer). A type that may have some (or all) handlers for each type of [notification](#notification): [next](#next), [error](#error), and [complete](#complete). Having all three types of handlers generally gets this to be called an "observer", where if it is missing any of the notification handlers, it may be called a ["partial observer"](#partial-observer).

一个[消费者](#consumer)的体现。一种可能对每种类型的[通知](#notification)都有一些（或全部）处理程序的类型： [next](#next)、[error](#error)和[complete](#complete)。拥有所有三种类型的处理程序通常会将此称为“观察者”，如果缺少任何通知处理程序，则可以将其称为[“部分观察者”](#partial-observer)。

## Major Actions

## 主要行动

There are specific actions and events that occur between major entities in RxJS that need to be defined. These major actions are the highest level events that occur within various parts in RxJS.

RxJS 中主要实体之间发生的特定动作和事件需要定义。这些主要动作是在 RxJS 的各个部分中发生的最高级别的事件。

### Subscribe

### 订阅

The act of a [consumer](#consumer) requesting an Observable set up a [subscription](#subscription) so that it may [observe](#observation) a [producer](#producer). A subscribe action can occur with an observable via many different mechanisms. The primary mechanism is the [`subscribe` method](/api/index/class/Observable#subscribe) on the [Observable class](/api/index/class/Observable). Other mechanisms include the [`forEach` method](/api/index/class/Observable#forEach), functions
like [`lastValueFrom`](/api/index/function/lastValueFrom), and [`firstValueFrom`](/api/index/function/firstValueFrom), and the deprecated [`toPromise` method](/api/index/class/Observable#forEach).

[消费者](#consumer)请求 Observable 的行为设置[订阅](#subscription)，以便它可以[观察](#observation)[生产者](#producer)。订阅操作可以通过许多不同的机制与 observable 一起发生。主要机制是[Observable 类](/api/index/class/Observable)的[`subscribe` 方法](/api/index/class/Observable#subscribe)。其他机制包括[`forEach` 方法](/api/index/class/Observable#forEach)、[`lastValueFrom`](/api/index/function/lastValueFrom)和[`firstValueFrom`](/api/index/function/firstValueFrom)等函数，以及不推荐使用的[`toPromise` 方法](/api/index/class/Observable#forEach)。

### Teardown

### 拆除

The act of cleaning up resources used by a producer. This is guaranteed to happen on `error`, `complete`, or if unsubscription occurs. This is not to be confused with [unsubscription](#unsubscription), but it does always happen during unsubscription.

清理生产者使用的资源的行为。这保证会在 `error`、`complete` 或取消订阅时发生。这不要与[取消订阅](#unsubscription)混淆，但它总是在取消订阅期间发生。

### Unsubscription

### 退订

The act of a [consumer](#consumer) telling a [producer](#producer) is is no longer interested in receiving values. Causes [Teardown](#teardown)

[消费者](#consumer)告诉[生产者](#producer)的行为不再对接收值感兴趣。导致[拆解](#teardown)

### Observation

### 观察

A [consumer](#consumer) reacting to [next](#next), [error](#error), or [complete](#complete) [notifications](#notification). This can only happen _during_ [subscription](#subscription).

对[下一个](#next)、[错误](#error)或[完成](#complete)[通知](#notification)做出反应的[消费者](#consumer)。这只能 _ 在 _[订阅](#subscription)期间发生。

### Observation Chain

### 观察链

When an [observable](#observable) uses another [observable](#observable) as a [producer](#producer), an "observation chain" is set up. That is a chain of [observation](#observation) such that multiple [observers](#observer) are [notifying](#notification) each other in a unidirectional way toward the final [consumer](#consumer).

当一个[observable](#observable)使用另一个[observable](#observable)作为[producer](#producer)时，就会建立一个“观察链”。这是一个[观察](#observation)链，多个[观察者](#observer)以单向方式相互[通知](#notification)最终[消费者](#consumer)。

### Next

### 下一个

A value has been pushed to the [consumer](#consumer) to be [observed](#observation). Will only happen during [subscription](#subscription), and cannot happen after [error](#error), [complete](#error), or [unsubscription](#unsubscription). Logically, this also means it cannot happen after [teardown](#teardown).

已将一个值推送给要[观察](#observation)的[消费者](#consumer)。只会在[订阅](#subscription)期间发生，在[错误](#error)、[完成](#error)或[取消订阅](#unsubscription)后不会发生。从逻辑上讲，这也意味着它不会在[teardown](#teardown)之后发生。

### Error

### 错误

The [producer](#producer) has encountered a problem and is notifying the [consumer](#consumer). This is a notification that the [producer](#producer) will no longer send values and will [teardown](#teardown). This cannot occur after [complete](#complete), any other [error](#error), or [unsubscription](#unsubscription). Logically, this also means it cannot happen after [teardown](#teardown).

[生产者](#producer)遇到问题，正在通知[消费者](#consumer)。这是[生产者](#producer)将不再发送值并将[拆除](#teardown)的通知。这在[完成](#complete)、任何其他[错误](#error)或[取消订阅](#unsubscription)后不会发生。从逻辑上讲，这也意味着它不会在[teardown](#teardown)之后发生。

### Complete

### 完全的

The [producer](#producer) is notifying the [consumer](#consumer) that it is done [nexting](#next) values, without error, will send no more values, and it will [teardown](#teardown). [Completion](#complete) cannot occur after an [error](#error), or [unsubscribe](#unsubscription). [Complete](#complete) cannot be called twice. [Complete](#complete), if it occurs, will always happen before [teardown](#teardown).

[生产者](#producer)正在通知[消费者](#consumer)它已完成[下一个](#next)值，没有错误，将不再发送任何值，并且它将[拆除](#teardown)。[出错](#error)后无法[完成](#complete)，或[取消订阅](#unsubscription)。[Complete](#complete)不能被调用两次。[Complete](#complete)，如果发生，总是会在[teardown](#teardown)之前发生。

### Notification

### 通知

The act of a [producer](#producer) pushing [nexted](#next) values, [errors](#error) or [completions](#complete) to a [consumer](#consumer) to be [observed](#observation). Not to be confused with the [`Notification` type](/api/index/class/Notification), which is notification manifested as a JavaScript object.

[生产者](#producer)将下一个值、[错误](#error)或[完成](#complete)推[送给](#next)[消费者](#consumer)以进行[观察](#observation)的行为。不要与[`Notification` 类型](/api/index/class/Notification)混淆，后者是表示为 JavaScript 对象的通知。

## Major Concepts

## 主要概念

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest in observables or in push-based reactive systems.

我们讨论的一些内容是概念性的。这些主要是行为的常见特征，可以在可观察对象或基于推送的反应系统中表现出来。

### Multicast

### 组播

The act of one [producer](#producer) being [observed](#observation) by **many** [consumers](#consumer).

一个[生产者](#producer)的行为被**许多**[消费者](#consumer)[观察](#observation)。

### Unicast

### 单播

The act of one [producer](#producer) being [observed](#observation) **only one** [consumer](#consumer). An observable is "unicast" when it only connects one [producer](#producer) to one [consumer](#consumer). Unicast doesn't necessarily mean ["cold"](#cold).

一个[生产者](#producer)的行为**只被一个**[消费者](#consumer)[观察到](#observation)。当一个 observable 只将一个[producer](#producer)连接到一个[consumer](#consumer)时，它是“单播”的。单播并不一定意味着[“冷”](#cold)。

### Cold

### 寒冷的

An observable is "cold" when it creates a new [producer](#producer) during [subscribe](#subscribe) for every new [subscription](#subscription). As a result, a "cold" observables are _always_ [unicast](#unicast), being one [producer](#producer) [observed](#observation) by one [consumer](#consumer). Cold observables can be made [hot](#hot) but not the other way around.

当一个 observable 在[subscribe](#subscribe)期间为每个新的[订阅](#subscription)创建一个新的[生产者](#producer)时，它是“冷的”。结果，“冷”可观察对象 _ 始终 _ 是[单播](#unicast)的，即一个[生产者](#producer)被一个[消费者](#consumer)[观察到](#observation)。冷的 observables 可以变[热](#hot)，但反过来不行。

### Hot

### 热的

An observable is "hot", when its [producer](#producer) was created outside of the context of the [subscribe](#subscribe) action. This means that the "hot" observable is almost always [multicast](#multicast). It is possible that a "hot" observable is still _technically_ unicast, if it is engineered to only allow one [subscription](#subscription) at a time, however, there is no straightforward mechanism for this in RxJS, and the scenario is a unlikely. For the purposes of discussion, all "hot" observables can
be assumed to be [multicast](#multicast). Hot observables cannot be made [cold](#cold).

一个可观察对象是“热的”，当它的[生产者](#producer)是在[订阅](#subscribe)操作的上下文之外创建时。这意味着“热”的 observable 几乎总是[multicast](#multicast)。一个“热”的 observable 可能在 _ 技术上 _ 仍然是单播的，如果它被设计为一次只允许一个[订阅](#subscription)，但是，在 RxJS 中没有直接的机制，这种情况不太可能发生。出于讨论的目的，可以假设所有“热”可观察对象都是[多播](#multicast)的。热的 observables 不能[变冷](#cold)。

### Push

### 推

[Observables](#observable) are a push-based type. That means rather than having the [consumer](#consumer) call a function or perform some other action to get a value, the [consumer](#consumer) receives values as soon as the [producer](#producer) has produced them, via a registered [next](#next) handler.

[Observables](#observable)是一种基于推送的类型。这意味着[消费者](#consumer)无需调用函数或执行其他操作来获取值，而是在[生产者](#consumer)[生成](#producer)值后立即通过已注册的[下一个](#next)处理程序接收值。

### Pull

### 拉

Pull-based systems are the opposite of [push](#Push)-based. In a pull-based type or system, the [consumer](#consumer) must request each value the [producer](#producer) has produced manually, perhaps long after the [producer](#producer) has actually done so. Examples of such systems are [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and [Iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

基于拉的系统与基于[推](#Push)的系统相反。在基于拉取的类型或系统中，[消费者](#consumer)必须请求[生产者](#producer)手动生成的每个值，可能在[生产者](#producer)实际这样做很久之后。此类系统的示例是[函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)和[迭代器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

## Minor Entities

## 小实体

### Operator

### 操作员

A factory function that creates an [operator function](#operator-function). Examples of this in rxjs are functions like [`map`](/api/operators/map) and [`mergeMap`](/api/operators/mergeMap), which are generally passed to [`pipe`](/api/index/class/Observable#pipe). The result of calling many operators, and passing their resulting [operator functions](#operator-function) into pipe on an observable [source](#source) will be another [observable](#observable), and will generally not result
in [subscription](#subscription).

创建[操作员函数的工厂函数](#operator-function)。rxjs 中的示例是[`map`](/api/operators/map)和[`mergeMap`](/api/operators/mergeMap)之类的函数，它们通常传递给[`pipe`](/api/index/class/Observable#pipe)。调用许多操作符，并将其结果[操作符函数](#operator-function)传递到可观察[源](#source)上的管道中的结果将是另一个[可观察](#observable)的，并且通常不会导致[订阅](#subscription)。

### Operator Function

### 操作员功能

A function that takes an [observable](#observable), and maps it to a new [observable](#observable). Nothing more, nothing less. Operator functions are created by [operators](#operator). If you were to call an rxjs operator like [map](/api/operators/map) and put the return value in a variable, the returned value would be an operator function.

一个接受[observable](#observable)并将其映射到新[observable](#observable)的函数。不多也不少。运算符函数由[运算符](#operator)创建。如果你要调用像[map](/api/operators/map)这样的 rxjs 运算符并将返回值放入变量中，则返回值将是一个运算符函数。

### Operation

### 手术

An action taken while handling a [notification](#notification), as set up by an [operator](#operator) and/or [operator function](#operator-function). In RxJS, a developer can chain several [operator functions](#operator-function) together by calling [operators](#operator) and passing the created [operator functions](#operator-function) to the [`pipe`](/api/index/class/Observable#pipe) method of [`Observable`](/api/index/class/Observable), which results in a new [observable](#observable).
During [subscription](#subscription) to that observable, operations are performed in an order dictated by the [observation chain](#observation-chain).

处理[通知](#notification)时采取的操作，由[操作员](#operator)和/或[操作员功能](#operator-function)设置。在 RxJS 中，开发人员可以通过调用[操作符](#operator)并将创建的[操作符函数](#operator-function)传递给[`Observable`](/api/index/class/Observable)的[`pipe`](/api/index/class/Observable#pipe)方法，将多个[操作符函数](#operator-function)链接在一起，从而产生一个新的[observable](#observable)。在[订阅](#subscription)该 observable 期间，操作按照[观察链](#observation-chain)指定的顺序执行。

### Stream

### 溪流

A "stream" or "streaming" in the case of observables, refers to the collection of [operations](#operation), as they are processed during a [subscription](#subscription). This is not to be confused with node [Streams](https://nodejs.org/api/stream.html), and the word "stream", on its own, should be used _sparingly_ in documentation and articles. Instead, prefer [observation chain](#observation-chain), [operations](#operation), or [subscription](#subscription). "Streaming" is less ambiguous, and is fine to
use given this defined meaning.

对于可观察对象，“流”或“流”是指[操作](#operation)的集合，因为它们是在[订阅](#subscription)期间处理的。不要与 node [Streams](https://nodejs.org/api/stream.html)混淆，“流”一词本身应在文档和文章中 _ 谨慎使用 _。相反，更喜欢[观察链](#observation-chain)、[操作](#operation)或[订阅](#subscription)。“流式传输”不那么模棱两可，考虑到这个定义的含义，可以很好地使用。

### Source

### 来源

A [observable](#observable) or [valid observable input](#observable-inputs) having been converted to an observable, that will supply values to another [observable](#observable), either as the result of an [operator](#operator) or other function that creates one observable as another. This [source](#source), will be the [producer](#producer) for the resulting [observable](#observable) and all of its [subscriptions](#subscriptions). Sources may generally be any type of observable.

一个[observable](#observable)或[有效的 observable 输入](#observable-inputs)已经被转换为一个 observable，它将为另一个[observable](#observable)提供值，或者是作为[操作符](#operator)的结果，或者是创建一个 observable 作为另一个 observable 的其他函数的结果。这个[源](#source)将是结果[observable](#observable)及其所有[订阅](#subscriptions)的[生产者](#producer)。源通常可以是任何类型的可观察的。

### Observable Inputs

### 可观察的输入

A "observable input" ([defined as a type here](/api/index/type-alias/ObservableInput)), is any type that can easily converted to an [Observable](#observable). Observable Inputs may sometimes be referred to as "valid observable sources".

“可观察输入”（[在此处定义为类型](/api/index/type-alias/ObservableInput)）是可以轻松转换为[Observable](#observable)的任何类型。可观察输入有时可能被称为“有效的可观察源”。

### Notifier

### 通知者

An [observable](#observable) that is being used to notify another [observable](#observable) that it needs to perform some action. The action should only occur on a [next notification](#next), and never on [error](#error) or [complete](#complete). Generally, notifiers are used with specific operators, such as [`takeUntil`](/api/operators/takeUntil), [`buffer`](/api/operators/buffer), or [`delayWhen`](/api/operators/delayWhen). A notifier may be passed directly, or it may be returned by a callback.

用于通知另一个[可观察](#observable)[对象](#observable)它需要执行某些操作的可观察对象。该操作应该只[在下一次通知](#next)时发生，而永远不会在[错误](#error)或[完成](#complete)时发生。通常，通知器与特定的运算符一起使用，例如[`takeUntil`](/api/operators/takeUntil)、[`buffer`](/api/operators/buffer)或[`delayWhen`](/api/operators/delayWhen)。通知程序可以直接传递，也可以由回调返回。

### Inner Source

### 内源

One, of possibly many [sources](#source), which are [subscribed](#subscribe) to automatically within a single [subscription](#subscription) to another observable. Examples of an "inner source" include the [observable inputs](#observable-inputs) returned by the mapping function in a [mergeMap](/api/operators/mergeMap) [operator](#operator). (e.g. `source.pipe(mergeMap(value => createInnerSource(value))))`, were `createInnerSource` returns any valid [observable input](#observable-inputs)).

一个，可能是许多[源](#source)中的一个，在对另一个 observable 的单个[订阅](#subscribe)中自动[订阅](#subscription)。“内部源”的示例包括由[mergeMap](/api/operators/mergeMap)[运算符](#operator)中的映射函数返回的[可观察输入](#observable-inputs)。（例如 `source.pipe(mergeMap(value => createInnerSource(value))))`，`createInnerSource` 返回任何有效的[可观察输入](#observable-inputs)）。

### Partial Observer

### 部分观察员

An [observer](#observer) that lacks all necessary [notification](#notification) handlers. Generally these are supplied by user-land [consumer](#consumer) code. A "full observer" or "observer" would simply be an observer than had all [notification](#notification) handlers.

缺少所有必要的[通知](#notification)处理程序的[观察者](#observer)。通常这些是由用户端[消费者](#consumer)代码提供的。“完全观察者”或“观察者”将只是一个观察者，而不是所有[通知](#notification)处理程序。

## Other Concepts

## 其他概念

### Unhandled Errors

### 未处理的错误

An "unhandled error" is any [error](#error) that is not handled by a [consumer](#consumer)-provided function, which is generally provided during the [subscribe](#subscribe) action. If no error handler was provided, RxJS will assume the error is "unhandled" and rethrow the error on a new callstack or prevent ["producer interference"](#producer-interface)

“未处理的错误”是[消费者](#consumer)提供的函数未处理的任何[错误](#error)，通常在[订阅](#subscribe)操作期间提供。如果没有提供错误处理程序，RxJS 将假定错误是“未处理的”并在新的调用堆栈上重新抛出错误或防止[“生产者干扰”](#producer-interface)

### Producer Interference

### 生产者干扰

[Producer](#producer) interference happens when an error is allowed to unwind the callstack the RxJS callstack during [notification](#notification). When this happens, the error could break things like for-loops in [upstream](#upstream-and-downstream) [sources](#source) that are [notifying](#notification) [consumers](#consumer) during a [multicast](#multicast). That would cause the other [consumers](#consumer) in that [multicast](#multicast) to suddenly stop receiving values without logical explanation. As
of version 6, RxJS goes out of its way to prevent producer interference by ensuring that all unhandled errors are thrown on a separate callstack.

当一个错误被允许在[通知](#notification)期间展开 RxJS 调用堆栈的调用堆栈时，会发生[生产者](#producer)干扰。发生这种情况时，该错误可能会破坏[上游](#upstream-and-downstream)[源](#source)中的 for-loop 之类的东西，这些源在[多播](#multicast)期间[通知](#notification)[消费者](#consumer)。这将导致该[多播](#multicast)中的其他[消费者](#consumer)突然停止接收值而没有合乎逻辑的解释。从版本 6 开始，RxJS 通过确保将所有未处理的错误都抛出到单独的调用堆栈上来防止生产者干扰。

### Upstream And Downstream

### 上游和下游

The order in which [notifications](#notification) are processed by [operations](#operation) in a [stream](#stream) have a directionality to them. "Upstream" refers to an [operation](#operation) that was already processed before the current [operation](#operation), and "downstream" refers to an [operation](#operation) that _will_ be processed _after_ the current [operation](#operation). See also: [Streaming](#stream).

[流](#stream)中的[操作](#operation)处理[通知](#notification)的顺序对它们具有方向性。“上游”是指在当前[操作](#operation)之前已经处理的[操作](#operation)，“下游”是指 _ 将 _ 在当前[操作](#operation)_ 之后 _ 处理的[操作](#operation)。另请参阅：[流式传输](#stream)。

