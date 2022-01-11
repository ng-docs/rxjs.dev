import { isFunction } from './util/isFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
import { SubscriptionLike, TeardownLogic, Unsubscribable } from './types';
import { arrRemove } from './util/arrRemove';

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * 表示一次性资源，例如 Observable 的执行。订阅有一个重要的方法 `unsubscribe`，它不接受任何参数，只是释放订阅持有的资源。
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * 此外，订阅可以通过 `add()` 方法组合在一起，该方法会将子订阅附加到当前订阅。当订阅被取消订阅时，它的所有子（及其孙子）也将被取消订阅。
 *
 * @class Subscription
 */
export class Subscription implements SubscriptionLike {
  /** @nocollapse */
  public static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   *
   * 指示此订阅是否已取消订阅的标志。
   *
   */
  public closed = false;

  private _parentage: Subscription[] | Subscription | null = null;

  /**
   * The list of registered teardowns to execute upon unsubscription. Adding and removing from this
   * list occurs in the {@link #add} and {@link #remove} methods.
   *
   * 在取消订阅时执行的已注册拆卸列表。在此列表中添加和删除发生在 {@link #add} 和 {@link #remove} 方法中。
   *
   */
  private _teardowns: Exclude<TeardownLogic, void>[] | null = null;

  /**
   * @param initialTeardown A function executed first as part of the teardown
   * process that is kicked off when {@link #unsubscribe} is called.
   *
   * 在调用 {@link #unsubscribe} 时启动的作为拆卸过程的一部分首先执行的函数。
   *
   */
  constructor(private initialTeardown?: () => void) {}

  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   *
   * 释放订阅持有的资源。例如，可以取消正在进行的 Observable 执行或取消在创建订阅时开始的任何其他类型的工作。
   *
   * @return {void}
   */
  unsubscribe(): void {
    let errors: any[] | undefined;

    if (!this.closed) {
      this.closed = true;

      // Remove this from it's parents.
      const { _parentage } = this;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          for (const parent of _parentage) {
            parent.remove(this);
          }
        } else {
          _parentage.remove(this);
        }
      }

      const { initialTeardown } = this;
      if (isFunction(initialTeardown)) {
        try {
          initialTeardown();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }

      const { _teardowns } = this;
      if (_teardowns) {
        this._teardowns = null;
        for (const teardown of _teardowns) {
          try {
            execTeardown(teardown);
          } catch (err) {
            errors = errors ?? [];
            if (err instanceof UnsubscriptionError) {
              errors = [...errors, ...err.errors];
            } else {
              errors.push(err);
            }
          }
        }
      }

      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  }

  /**
   * Adds a teardown to this subscription, so that teardown will be unsubscribed/called
   * when this subscription is unsubscribed. If this subscription is already {@link #closed},
   * because it has already been unsubscribed, then whatever teardown is passed to it
   * will automatically be executed (unless the teardown itself is also a closed subscription).
   *
   * 向此订阅添加拆解，以便在取消订阅此订阅时取消订阅/调用拆解。如果这个订阅已经是 {@link #close}，因为它已经被取消订阅，那么任何传递给它的拆解都会自动执行（除非拆解本身也是一个关闭的订阅）。
   *
   * Closed Subscriptions cannot be added as teardowns to any subscription. Adding a closed
   * subscription to a any subscription will result in no operation. (A noop).
   *
   * 已关闭的订阅不能作为拆解添加到任何订阅。将已关闭的订阅添加到任何订阅将不会导致任何操作。（一个 noop）。
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * 对自身添加订阅，或者添加 `null` 或 `undefined` 根本不会执行任何操作。（一个 noop）。
   *
   * `Subscription` instances that are added to this instance will automatically remove themselves
   * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link #remove}
   *
   * 添加到此实例的 `Subscription` 实例在取消订阅后将自动删除。你希望删除的函数和 {@link Unsubscribable} 对象需要使用 {@link #remove} 手动删除
   *
   * @param teardown The teardown logic to add to this subscription.
   *
   * 要添加到此订阅的拆卸逻辑。
   *
   */
  add(teardown: TeardownLogic): void {
    // Only add the teardown if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever teardown is handed to it automatically.
        execTeardown(teardown);
      } else {
        if (teardown instanceof Subscription) {
          // We don't add closed subscriptions, and we don't add the same subscription
          // twice. Subscription unsubscribe is idempotent.
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._teardowns = this._teardowns ?? []).push(teardown);
      }
    }
  }

  /**
   * Checks to see if a this subscription already has a particular parent.
   * This will signal that this subscription has already been added to the parent in question.
   *
   * 检查此订阅是否已经有一个特定的父级。这将表明此订阅已添加到相关父级。
   *
   * @param parent the parent to check for
   *
   * 要检查的父母
   *
   */
  private _hasParent(parent: Subscription) {
    const { _parentage } = this;
    return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
  }

  /**
   * Adds a parent to this subscription so it can be removed from the parent if it
   * unsubscribes on it's own.
   *
   * 将父级添加到此订阅，以便可以在它自己取消订阅时从父级中删除它。
   *
   * NOTE: THIS ASSUMES THAT {@link \_hasParent} HAS ALREADY BEEN CHECKED.
   *
   * 注意：这里假设 {@link \_hasParent} 已经被检查。
   *
   * @param parent The parent subscription to add
   *
   * 要添加的父订阅
   *
   */
  private _addParent(parent: Subscription) {
    const { _parentage } = this;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  }

  /**
   * Called on a child when it is removed via {@link #remove}.
   *
   * 通过 {@link #remove} 删除子时调用。
   *
   * @param parent The parent to remove
   *
   * 要删除的父级
   *
   */
  private _removeParent(parent: Subscription) {
    const { _parentage } = this;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  }

  /**
   * Removes a teardown from this subscription that was previously added with the {@link #add} method.
   *
   * 从此订阅中删除先前使用 {@link #add} 方法添加的拆解。
   *
   * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
   * from every other `Subscription` they have been added to. This means that using the `remove` method
   * is not a common thing and should be used thoughtfully.
   *
   * 请注意，`Subscription` 实例在取消订阅时会自动从它们添加到的所有其他 `Subscription` 中删除。这意味着使用 `remove` 方法并不是一件常见的事情，应该慎重使用。
   *
   * If you add the same teardown instance of a function or an unsubscribable object to a `Subcription` instance
   * more than once, you will need to call `remove` the same number of times to remove all instances.
   *
   * 如果你多次向 `Subcription` 实例添加函数或不可订阅对象的同一个拆解实例，则需要调用相同次数的 `remove` 来删除所有实例。
   *
   * All teardown instances are removed to free up memory upon unsubscription.
   *
   * 取消订阅时将删除所有拆卸实例以释放内存。
   *
   * @param teardown The teardown to remove from this subscription
   *
   * 要从此订阅中删除的拆解
   *
   */
  remove(teardown: Exclude<TeardownLogic, void>): void {
    const { _teardowns } = this;
    _teardowns && arrRemove(_teardowns, teardown);

    if (teardown instanceof Subscription) {
      teardown._removeParent(this);
    }
  }
}

export const EMPTY_SUBSCRIPTION = Subscription.EMPTY;

export function isSubscription(value: any): value is Subscription {
  return (
    value instanceof Subscription ||
    (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe))
  );
}

function execTeardown(teardown: Unsubscribable | (() => void)) {
  if (isFunction(teardown)) {
    teardown();
  } else {
    teardown.unsubscribe();
  }
}
