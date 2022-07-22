import { expect } from 'chai';
import { publishBehavior, mergeMapTo, tap, mergeMap, refCount, retry, repeat } from 'rxjs/operators';
import { ConnectableObservable, of, Subscription, Observable, pipe } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {publishBehavior} */
describe('publishBehavior operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mirror a simple source Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const expected = '   0-1-2---3-4--5-|';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should return a ConnectableObservable-ish', () => {
    const source = of(1).pipe(publishBehavior(1)) as ConnectableObservable<number>;
    expect(typeof (<any>source)._subscribe === 'function').to.be.true;
    expect(typeof (<any>source).getSubject === 'function').to.be.true;
    expect(typeof source.connect === 'function').to.be.true;
    expect(typeof source.refCount === 'function').to.be.true;
  });

  it('should only emit default value if connect is not called, despite subscriptions', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs: string[] = [];
      const published = source.pipe(publishBehavior('0'));
      const expected = '   0               ';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast the same values to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('   -1-2-3----4-| ');
      const sourceSubs = '    ^-----------! ';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      01-2-3----4-|';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      ----23----4-|';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      --------3-4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast an error from the source to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      01-2-3----4-#';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      ----23----4-#';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      --------3-4-#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast the same values to multiple observers, but is unsubscribed explicitly and early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const unsub = '          ---------u   ';
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      01-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      ----23----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      --------3-   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = published.connect();
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('   -1-2-3----4-|');
      const sourceSubs = '    ^--------!   ';
      const published = source.pipe(
        mergeMap((x) => of(x)),
        publishBehavior('0')
      ) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      01-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      ----23----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      --------3-   ';
      const unsub = '          ---------u   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = published.connect();
    });
  });

  describe('with refCount()', () => {
    it('should connect when first subscriber subscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^-----------!';
        const replayed = source.pipe(publishBehavior('0'), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(replayed));
        const expected1 = '      ---01-2-3----4-|';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(replayed));
        const expected2 = '      -------23----4-|';
        const subscriber3 = hot('-----------c|   ').pipe(mergeMapTo(replayed));
        const expected3 = '      -----------3-4-|';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^--------!   ';
        const replayed = source.pipe(publishBehavior('0'), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(replayed));
        const unsub1 = '         ----------!     ';
        const expected1 = '      ---01-2-3--     ';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(replayed));
        const unsub2 = '         ------------!   ';
        const expected2 = '      -------23----   ';

        expectObservable(subscriber1, unsub1).toBe(expected1);
        expectObservable(subscriber2, unsub2).toBe(expected2);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should NOT be retryable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-#');
        const sourceSubs = '     ^-----------!';
        const published = source.pipe(publishBehavior('0'), refCount(), retry(3));
        const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
        const expected1 = '      01-2-3----4-#';
        const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
        const expected2 = '      ----23----4-#';
        const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
        const expected3 = '      --------3-4-#';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should NOT be repeatable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-|');
        const sourceSubs = '     ^-----------!';
        const published = source.pipe(publishBehavior('0'), refCount(), repeat(3));
        const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
        const expected1 = '      01-2-3----4-|';
        const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
        const expected2 = '      ----23----4-|';
        const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
        const expected3 = '      --------3-4-|';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });
  });

  it('should emit completed when subscribed after completed', (done) => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.pipe(publishBehavior(0)) as ConnectableObservable<number>;

    connectable.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).to.deep.equal([0]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([0, 1, 2, 3, 4]);
    expect(results2).to.deep.equal([]);
    expect(subscriptions).to.equal(1);

    connectable.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        expect(results2).to.deep.equal([]);
        done();
      },
    });
  });

  it('should multicast an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const sourceSubs = ' (^!)';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const expected = '   (0|)';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast a never source', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sourceSubs = ' ^';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const expected = '   0';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast a throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#  ');
      const sourceSubs = ' (^!)';
      const published = source.pipe(publishBehavior('0')) as ConnectableObservable<string>;
      const expected = '   (0#)';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast one observable to multiple observers', (done) => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
    });

    const connectable = source.pipe(publishBehavior(0)) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    expect(results1).to.deep.equal([0]);

    connectable.connect();

    expect(results2).to.deep.equal([]);

    connectable.subscribe((x) => {
      results2.push(x);
    });

    expect(results1).to.deep.equal([0, 1, 2, 3, 4]);
    expect(results2).to.deep.equal([4]);
    expect(subscriptions).to.equal(1);
    done();
  });

  it('should follow the RxJS 4 behavior and emit nothing to observer after completed', (done) => {
    const results: number[] = [];

    const source = new Observable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.pipe(publishBehavior(0)) as ConnectableObservable<number>;

    connectable.connect();

    connectable.subscribe((x) => {
      results.push(x);
    });

    expect(results).to.deep.equal([]);
    done();
  });

  it('should be referentially-transparent', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   x1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   x6-7-8-9-0-|';

      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = pipe(publishBehavior('x'));

      // The non-referentially-transparent publishing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const published1 = source1.pipe(partialPipeLine) as ConnectableObservable<any>;
      const published2 = source2.pipe(partialPipeLine) as ConnectableObservable<any>;

      expectObservable(published1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(published2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);

      published1.connect();
      published2.connect();
    });
  });
});
