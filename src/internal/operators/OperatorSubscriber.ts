import { Subscriber } from '../Subscriber';

/**
 * A generic helper for allowing operators to be created with a Subscriber and
 * use closures to capture necessary state from the operator function itself.
 *
 * 一个通用帮助器，用于允许使用订阅者创建操作符并使用闭包从操作符函数本身捕获必要的状态。
 *
 */
export class OperatorSubscriber<T> extends Subscriber<T> {
  /**
   * Creates an instance of an `OperatorSubscriber`.
   *
   * 创建 `OperatorSubscriber` 的实例。
   *
   * @param destination The downstream subscriber.
   *
   * 下游订户。
   *
   * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
   * error that occurs in this function is caught and sent to the `error` method of this subscriber.
   *
   * 处理下一个值，仅在此订阅者未停止或关闭时调用。此函数中发生的任何错误都会被捕获并发送到此订阅者的 `error` 方法。
   *
   * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
   * and send to the `destination` error handler.
   *
   * 处理来自订阅的错误，在此处理程序中发生的任何错误都会被捕获并发送到 `destination` 错误处理程序。
   *
   * @param onComplete Handles completion notification from the subscription. Any errors that occur in
   * this handler are sent to the `destination` error handler.
   *
   * 处理来自订阅的完成通知。此处理程序中发生的任何错误都将发送到 `destination` 错误处理程序。
   *
   * @param onFinalize Additional teardown logic here. This will only be called on teardown if the
   * subscriber itself is not already closed. This is called after all other teardown logic is executed.
   *
   * 这里有额外的拆解逻辑。如果订阅者本身还没有关闭，这只会在拆卸时被调用。在执行所有其他拆卸逻辑之后调用它。
   *
   */
  constructor(
    destination: Subscriber<any>,
    onNext?: (value: T) => void,
    onComplete?: () => void,
    onError?: (err: any) => void,
    private onFinalize?: () => void
  ) {
    // It's important - for performance reasons - that all of this class's
    // members are initialized and that they are always initialized in the same
    // order. This will ensure that all OperatorSubscriber instances have the
    // same hidden class in V8. This, in turn, will help keep the number of
    // hidden classes involved in property accesses within the base class as
    // low as possible. If the number of hidden classes involved exceeds four,
    // the property accesses will become megamorphic and performance penalties
    // will be incurred - i.e. inline caches won't be used.
    //
    // The reasons for ensuring all instances have the same hidden class are
    // further discussed in this blog post from Benedikt Meurer:
    // https://benediktmeurer.de/2018/03/23/impact-of-polymorphism-on-component-based-frameworks-like-react/
    super(destination);
    this._next = onNext
      ? function (this: OperatorSubscriber<T>, value: T) {
          try {
            onNext(value);
          } catch (err) {
            destination.error(err);
          }
        }
      : super._next;
    this._error = onError
      ? function (this: OperatorSubscriber<T>, err: any) {
          try {
            onError(err);
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure teardown.
            this.unsubscribe();
          }
        }
      : super._error;
    this._complete = onComplete
      ? function (this: OperatorSubscriber<T>) {
          try {
            onComplete();
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure teardown.
            this.unsubscribe();
          }
        }
      : super._complete;
  }

  unsubscribe() {
    const { closed } = this;
    super.unsubscribe();
    // Execute additional teardown if we have any and we didn't already do so.
    !closed && this.onFinalize?.();
  }
}
