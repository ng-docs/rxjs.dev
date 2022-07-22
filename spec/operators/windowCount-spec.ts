import { expect } from 'chai';
import { windowCount, mergeMap, mergeAll, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {windowCount} */
describe('windowCount', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit windows with count 3, no skip specified', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---b---c---d---e---f---g---h---i---|');
      const sourceSubs = '^--------------------------------------!';
      const expected = '  x----------y-----------z-----------w---|';
      const x = cold('    ---a---b---(c|)                         ');
      const y = cold('               ----d---e---(f|)             ');
      const z = cold('                           ----g---h---(i|) ');
      const w = cold('                                       ----|');
      const expectedValues = { x: x, y: y, z: z, w: w };

      const result = source.pipe(windowCount(3));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should emit windows with count 2 and skip 1', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('^-a--b--c--d--|');
      const subs = '      ^-------------!';
      const expected = '  u-v--x--y--z--|';
      const u = cold('    --a--(b|)      ');
      const v = cold('      ---b--(c|)   ');
      const x = cold('         ---c--(d|)');
      const y = cold('            ---d--|');
      const z = cold('               ---|');
      const values = { u: u, v: v, x: x, y: y, z: z };

      const result = source.pipe(windowCount(2, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should emit windows with count 2, and skip unspecified', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--f--|');
      const subs = '      ^-------------------!';
      const expected = '  x----y-----z-----w--|';
      const x = cold('    --a--(b|)            ');
      const y = cold('         ---c--(d|)      ');
      const z = cold('               ---e--(f|)');
      const w = cold('                     ---|');
      const values = { x: x, y: y, z: z, w: w };

      const result = source.pipe(windowCount(2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should return empty if source is empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|');
      const subs = '       (^!)';
      const expected = '   (w|)';
      const w = cold('     |');
      const values = { w: w };

      const result = source.pipe(windowCount(2, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should return Never if source if Never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const subs = '       ^';
      const expected = '   w';
      const w = cold('     -');
      const expectedValues = { w: w };

      const result = source.pipe(windowCount(2, 1));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should propagate error from a just-throw source', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  #');
      const subs = '         (^!)';
      const expected = '     (w#)';
      const w = cold('       #');
      const expectedValues = { w: w };

      const result = source.pipe(windowCount(2, 1));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should raise error if source raises error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--f--#');
      const subs = '      ^-------------------!';
      const expected = '  u-v--w--x--y--z--q--#';
      const u = cold('    --a--b--(c|)         ');
      const v = cold('      ---b--c--(d|)      ');
      const w = cold('         ---c--d--(e|)   ');
      const x = cold('            ---d--e--(f|)');
      const y = cold('               ---e--f--#');
      const z = cold('                  ---f--#');
      const q = cold('                     ---#');
      const values = { u: u, v: v, w: w, x: x, y: y, z: z, q: q };

      const result = source.pipe(windowCount(3, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should dispose of inner windows once outer is unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('^-a--b--c--d--|');
      const subs = '      ^--------!     ';
      const expected = '  w-x--y--z-     ';
      const w = cold('    --a--(b|)      ');
      const x = cold('      ---b--(c|)   ');
      const y = cold('         ---c-     ');
      const z = cold('            --     ');
      const unsub = '     ---------!     ';
      const values = { w: w, x: x, y: y, z: z };

      const result = source.pipe(windowCount(2, 1));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('^-a--b--c--d--|');
      const subs = '      ^--------!     ';
      const expected = '  w-x--y--z-     ';
      const w = cold('    --a--(b|)      ');
      const x = cold('      ---b--(c|)   ');
      const y = cold('         ---c-     ');
      const z = cold('            --     ');
      const unsub = '     ---------!     ';
      const values = { w: w, x: x, y: y, z: z };

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        windowCount(2, 1),
        mergeMap((x: Observable<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(windowCount(3), mergeAll(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
