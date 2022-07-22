import { expect } from 'chai';
import { of, Observable } from 'rxjs';
import { concat, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {concat} */
describe('concat operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should concatenate two cold observables', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold('  --a--b-|');
      const e2 = cold('         --x---y--|');
      const expected = ' --a--b---x---y--|';

      expectObservable(e1.pipe(concat(e2, testScheduler))).toBe(expected);
    });
  });

  it('should work properly with scalar observables', (done) => {
    const results: string[] = [];

    const s1 = new Observable<number>((observer) => {
      setTimeout(() => {
        observer.next(1);
        observer.complete();
      });
    }).pipe(concat(of(2)));

    s1.subscribe({
      next: (x) => {
        results.push('Next: ' + x);
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        results.push('Completed');
        expect(results).to.deep.equal(['Next: 1', 'Next: 2', 'Completed']);
        done();
      },
    });
  });

  it('should complete without emit if both sources are empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    ----|');
      const e2subs = '   --^---!';
      const expected = ' ------|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if first source does not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '   ^';
      const e2 = cold('  --|');
      const e2subs: string[] = [];
      const expected = ' -';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if second source does not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('  ---');
      const e2subs = '   --^';
      const expected = ' ---';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if both sources do not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '   ^';
      const e2 = cold('  -');
      const e2subs: string[] = [];
      const expected = ' -';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error when first source is empty, second source raises error', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    ----#');
      const e2subs = '   --^---!';
      const expected = ' ------#';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error when first source raises error, second source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---#');
      const e1subs = '   ^--!';
      const e2 = cold('  ----|');
      const e2subs: string[] = [];
      const expected = ' ---#';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise first error when both source raise error', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---#');
      const e1subs = '   ^--!';
      const e2 = cold('  ------#');
      const e2subs: string[] = [];
      const expected = ' ---#';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should concat if first source emits once, second source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       --------|');
      const e2subs = '   -----^-------!';
      const expected = ' --a----------|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should concat if first source is empty, second source emits once', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --|');
      const e1subs = '   ^-!';
      const e2 = cold('    --a--|');
      const e2subs = '   --^----!';
      const expected = ' ----a--|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit element from first source, and should not complete if second source does not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       -');
      const e2subs = '   -----^';
      const expected = ' --a---';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if first source does not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '   ^';
      const e2 = cold('  --a--|');
      const e2subs: string[] = [];
      const expected = ' -';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit elements from each source when source emit once', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a|');
      const e1subs = '   ^---!';
      const e2 = cold('      -----b--|');
      const e2subs = '   ----^-------!';
      const expected = ' ---a-----b--|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = cold('           -----b-b--b-|');
      const e2subs = '   ---------^-------!    ';
      const unsub = '    -----------------!    ';
      const expected = ' ---a-a--a-----b-b     ';

      expectObservable(e1.pipe(concat(e2)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = cold('           -----b-b--b-|');
      const e2subs = '   ---------^-------!    ';
      const expected = ' ---a-a--a-----b-b-    ';
      const unsub = '    -----------------!    ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        concat(e2),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error from first source and does not emit from second source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --#');
      const e1subs = '   ^-!';
      const e2 = cold('  ----a--|');
      const e2subs: string[] = [];
      const expected = ' --#';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit element from first source then raise error from second source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a--|');
      const e1subs = '   ^----!';
      const e2 = cold('       -------#');
      const e2subs = '   -----^------!';
      const expected = ' --a---------#';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit all elements from both hot observable sources if first source completes before second source starts emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b-|');
      const e1subs = '  ^------!';
      const e2 = hot('  --------x--y--|');
      const e2subs = '  -------^------!';
      const expected = '--a--b--x--y--|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit elements from second source regardless of completion time when second source is cold observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c---|');
      const e1subs = '  ^-----------!';
      const e2 = cold(' -x-y-z-|');
      const e2subs = '  ------------^------!';
      const expected = '--a--b--c----x-y-z-|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not emit collapsing element from second source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const e2 = hot('  --------x--y--z--|');
      const e2subs = '  -----------^-----!';
      const expected = '--a--b--c--y--z--|';

      expectObservable(e1.pipe(concat(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should accept scheduler with multiple observables', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a|');
      const e1subs = '   ^---!';
      const e2 = cold('      ---b--|');
      const e2subs = '   ----^-----!';
      const e3 = cold('            ---c--|');
      const e3subs = '   ----------^-----!';
      const expected = ' ---a---b-----c--|';

      expectObservable(e1.pipe(concat(e2, e3, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should accept scheduler without observable parameters', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-|');
      const e1subs = '   ^----!';
      const expected = ' ---a-|';

      expectObservable(e1.pipe(concat(testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit self without parameters', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-|');
      const e1subs = '   ^----!';
      const expected = ' ---a-|';

      expectObservable(e1.pipe(concat())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
