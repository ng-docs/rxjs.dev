import { of, throwError, interval, scheduled, asapScheduler, Subject } from 'rxjs';
import { bufferTime, mergeMap, take, tap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { expect } from 'chai';

/** @test {bufferTime} */
describe('bufferTime operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit buffers at intervals', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      const expected = '----------w---------x---------y--(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
        y: ['f', 'g'],
        z: [] as string[],
      };

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should emit buffers at intervals test 2', () => {
    testScheduler.run(({ hot, time, expectObservable }) => {
      const e1 = hot('  ---------a---------b---------c---------d---------e---------g--------|   ');
      const t = time('  --------------------------------|                                       ');
      const expected = '--------------------------------x-------------------------------y---(z|)';
      const values = {
        x: ['a', 'b', 'c'],
        y: ['d', 'e', 'g'],
        z: [] as string[],
      };

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
    });
  });

  it('should emit buffers at intervals or when the buffer is full', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      //                       ----------|
      //                               ----------|
      //                                       ----------|
      const expected = '-------w-------x-------y---------(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd'],
        y: ['e', 'f'],
        z: ['g'],
      };

      const result = e1.pipe(bufferTime(t, null, 2, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should handle situations with a creation interval of zero', (done) => {
    // This is an odd scenario, and I can't imagine who is weird enough to want this, but here
    // it is. Someone scheduling buffers to open and close on microtasks, with values emitted on microtasks
    // NOTE: Trying this with a completely synchronous scheduler (like queueScheduler, which is
    // async relative to what it is scheduling, but synchronous relative to its container) will
    // cause your thread to lock up. Don't be weird. This test is just to prove behavior.
    const source = scheduled([0, 1, 2, 3, 4], asapScheduler);
    const results: any[] = [];
    source.pipe(bufferTime(0, 0, asapScheduler)).subscribe({
      next: (value) => results.push(value),
      complete: () => {
        expect(results).to.deep.equal([
          // It opens one on 0 and closes it on 0
          [],
          // It opens one on 0, emits on 0, and closes on 0 (x 5)
          [0],
          [1],
          [2],
          [3],
          [4],
          // It opens one on 0, and then completes on 0, leaving us with an empty array.
          [],
        ]);
        done();
      },
    });
  });

  it('should emit buffers at intervals or when the buffer is full test 2', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      //                          ---------|---------|---------|
      const expected = '----------w--------x---------y---(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
        y: ['f', 'g'],
        z: [] as string[],
      };

      const result = e1.pipe(bufferTime(t, null, 3, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should emit buffers that have been created at intervals and close after the specified delay', () => {
    testScheduler.run(({ hot, time, expectObservable }) => {
      const e1 = hot('       ---a---b---c----d----e----f----g----h----i----(k|)');
      //                     --------------------*--------------------*----  start interval
      //                     ---------------------|                          timespans
      //                                         ---------------------|
      //                                                              -----|
      const t = time('       ---------------------|                            ');
      const interval = time('--------------------|                             ');
      const expected = '     ---------------------x-------------------y----(z|)';
      const values = {
        x: ['a', 'b', 'c', 'd', 'e'],
        y: ['e', 'f', 'g', 'h', 'i'],
        z: ['i', 'k'],
      };

      const result = e1.pipe(bufferTime(t, interval, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
    });
  });

  it('should emit buffers that have been created at intervals and close after the specified delay or when the buffer is full', () => {
    testScheduler.run(({ hot, time, expectObservable }) => {
      const e1 = hot('  ---a---b---c----d----e----f----g----h----i----(k|)');
      //                --------------------*--------------------*----  start interval
      //                ---------------------|                          timespans
      //                                    ---------------------|
      //                                                         -----|
      const t = time('  ---------------------|                            ');
      const interval = time('                --------------------|        ');
      const expected = '----------------x-------------------y---------(z|)';
      const values = {
        x: ['a', 'b', 'c', 'd'],
        y: ['e', 'f', 'g', 'h'],
        z: ['i', 'k'],
      };

      const result = e1.pipe(bufferTime(t, interval, 4, testScheduler));

      expectObservable(result).toBe(expected, values);
    });
  });

  it('should emit buffers with timeSpan 10 and creationInterval 7', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|   ');
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      //                                        ----------|
      //                                               ----------|
      //                                                      ----------|
      const e1subs = '     ^---------------------------------------!   ';
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------b------c------d------e-(f|)';
      const values = {
        a: ['2', '3', '4'],
        b: ['4', '5', '6'],
        c: ['6', '7', '8'],
        d: ['8', '9'],
        e: [] as string[],
        f: [] as string[],
      };

      const result = e1.pipe(bufferTime(t, interval, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit buffers but handle source ending with an error', () => {
    testScheduler.run(({ hot, time, expectObservable }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------#');
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      //                                        ----------|
      //                                               ----------|
      //                                                      ----------|
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------b------c------d------e-#';
      const values = {
        a: ['2', '3', '4'],
        b: ['4', '5', '6'],
        c: ['6', '7', '8'],
        d: ['8', '9'],
        e: [] as string[],
      };

      const result = e1.pipe(bufferTime(t, interval, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
    });
  });

  it('should emit buffers and allow result to unsubscribed early', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
      const unsub = '      -----------------!                       ';
      const subs = '       ^----------------!                       ';
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      const t = time('     ----------|                              ');
      const interval = time('        -------|                       ');
      const expected = '   ----------a------                        ';
      const values = {
        a: ['2', '3', '4'],
      };

      const result = e1.pipe(bufferTime(t, interval, Infinity, testScheduler));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
      const subs = '       ^---------------!                        ';
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------                        ';
      const unsub = '      ----------------!                        ';
      const values = {
        a: ['2', '3', '4'],
      };

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        bufferTime(t, interval, Infinity, testScheduler),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '(b|)';
      const values = { b: [] as string[] };
      const t = time('----------|');

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ cold, time, expectObservable }) => {
      const e1 = cold('-');
      const unsub = '   --------------------------------------------!';
      const t = time('  ----------|                                  ');
      const expected = '----------a---------a---------a---------a----';

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result, unsub).toBe(expected, { a: [] });
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ time, expectObservable }) => {
      const e1 = throwError(() => new Error('haha'));
      const expected = '#';
      const t = time('----------|');

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result).toBe(expected, undefined, new Error('haha'));
    });
  });

  it('should handle errors', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---#');
      const e1subs = '  ^--------------!';
      const t = time('  ----------|');
      const expected = '----------w----#';
      const values = {
        w: ['a', 'b'],
      };

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit buffers that have been created at intervals and close after the specified delay with errors', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       ---a---b---c----d----e----f----g----h----i--#');
      //                     --------------------|-------------------|-------------------| interval
      //                     ---------------------|
      //                                         ---------------------|
      //                                                             ---------------------| timespan
      const e1subs = '       ^-------------------------------------------!';
      const t = time('       ---------------------|                       ');
      const interval = time('                --------------------|   ');
      const expected = '     ---------------------x-------------------y--#';
      const values = {
        x: ['a', 'b', 'c', 'd', 'e'],
        y: ['e', 'f', 'g', 'h', 'i'],
      };

      const result = e1.pipe(bufferTime(t, interval, Infinity, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not throw when subscription synchronously unsubscribed after emit', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|');
      const subs = '    ^-------------------!             ';
      const t = time('  ----------|                       ');
      const expected = '----------w---------(x|)          ';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
      };

      const result = e1.pipe(bufferTime(t, null, Infinity, testScheduler), take(2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should not have errors when take follows and maxBufferSize is provided', () => {
    testScheduler.run(({ expectObservable }) => {
      const tick = 1;
      const buffTime = 5;
      const expected = '-----a----b----c----d----(e|)';
      const values = {
        a: [0, 1, 2, 3],
        b: [4, 5, 6, 7, 8],
        c: [9, 10, 11, 12, 13],
        d: [14, 15, 16, 17, 18],
        e: [19, 20, 21, 22, 23],
      };

      const source = interval(tick, testScheduler).pipe(bufferTime(buffTime, null, 10, testScheduler), take(5));

      expectObservable(source).toBe(expected, values);
    });
  });

  it('should not mutate the buffer on reentrant next', () => {
    testScheduler.run(({ expectObservable, time }) => {
      const subject = new Subject<number>();
      const t1 = time(' -|');
      const t2 = time(' --|');
      const expected = '--(a|)';
      const result = subject.pipe(
        bufferTime(t2),
        tap(() => subject.next(2)),
        take(1)
      );
      testScheduler.schedule(() => subject.next(1), t1);
      expectObservable(result).toBe(expected, { a: [1] });
    });
  });
});
