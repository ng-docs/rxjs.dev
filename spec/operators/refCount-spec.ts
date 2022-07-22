import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { refCount, publish, publishReplay, first } from 'rxjs/operators';
import { NEVER, noop, Observable, Subject } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {refCount} */
describe('refCount', () => {
  it('should turn a multicasted Observable an automatically (dis)connecting hot one', () => {
    const testScheduler = new TestScheduler(observableMatcher);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1-2---3-4--5-|');
      const e1Subs = '  ^--------------!';
      const expected = '--1-2---3-4--5-|';

      const result = e1.pipe(publish(), refCount());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });

  it('should count references', () => {
    const connectable = NEVER.pipe(publish());
    const refCounted = connectable.pipe(refCount());

    const sub1 = refCounted.subscribe({
      next: noop,
    });
    const sub2 = refCounted.subscribe({
      next: noop,
    });
    const sub3 = refCounted.subscribe({
      next: noop,
    });

    expect((connectable as any)._refCount).to.equal(3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });

  it('should unsub from the source when all other subscriptions are unsubbed', (done) => {
    let unsubscribeCalled = false;
    const connectable = new Observable<boolean>((observer) => {
      observer.next(true);
      return () => {
        unsubscribeCalled = true;
      };
    }).pipe(publish());

    const refCounted = connectable.pipe(refCount());

    const sub1 = refCounted.subscribe(() => {
      //noop
    });
    const sub2 = refCounted.subscribe(() => {
      //noop
    });
    const sub3 = refCounted.subscribe(() => {
      expect((connectable as any)._refCount).to.equal(1);
    });

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();

    expect((connectable as any)._refCount).to.equal(0);
    expect(unsubscribeCalled).to.be.true;
    done();
  });

  it('should not unsubscribe when a subscriber synchronously unsubscribes if other subscribers are present', () => {
    let unsubscribeCalled = false;
    const connectable = new Observable<boolean>((observer) => {
      observer.next(true);
      return () => {
        unsubscribeCalled = true;
      };
    }).pipe(publishReplay(1));

    const refCounted = connectable.pipe(refCount());

    refCounted.subscribe();
    refCounted.subscribe().unsubscribe();

    expect((connectable as any)._refCount).to.equal(1);
    expect(unsubscribeCalled).to.be.false;
  });

  it('should not unsubscribe when a subscriber synchronously unsubscribes if other subscribers are present and the source is a Subject', () => {
    const arr: string[] = [];
    const subject = new Subject<string>();
    const connectable = subject.pipe(publishReplay(1));
    const refCounted = connectable.pipe(refCount());

    refCounted.subscribe((val) => {
      arr.push(val);
    });

    subject.next('the number one');

    refCounted.pipe(first()).subscribe().unsubscribe();

    subject.next('the number two');

    expect((connectable as any)._refCount).to.equal(1);
    expect(arr[0]).to.equal('the number one');
    expect(arr[1]).to.equal('the number two');
  });
});
