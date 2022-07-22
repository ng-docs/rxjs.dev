import { expect } from 'chai';
import { queueScheduler, of } from 'rxjs';
import { combineLatestAll, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {combineLatestAll} */
describe('combineLatestAll operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should combine events from two observables', () => {
    testScheduler.run(({ hot, cold, expectObservable }) => {
      const x = cold('                  -a-----b---|');
      const y = cold('                  --1-2-|     ');
      const outer = hot('-x----y--------|           ', { x: x, y: y });
      const expected = ' -----------------A-B--C---|';

      const result = outer.pipe(combineLatestAll((a, b) => String(a) + String(b)));

      expectObservable(result).toBe(expected, { A: 'a1', B: 'a2', C: 'b2' });
    });
  });

  it('should work with two nevers', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const e2 = cold(' -');
      const e2subs = '  ^';
      const expected = '-';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '-';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with empty and never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' -');
      const e2subs = '  ^';
      const expected = '-';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with empty and empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '|';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-empty and hot-single', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-|');
      const e1subs = '   ^-!';
      const e2 = hot('-b-^-c-|');
      const e2subs = '   ^---!';
      const expected = ' ----|';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-single and hot-empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-|');
      const e1subs = '   ^-!';
      const e2 = hot('-b-^-c-|');
      const e2subs = '   ^---!';
      const expected = ' ----|';

      const result = of(e2, e1).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-single and never', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-|');
      const e1subs = '   ^-!';
      const e2 = hot('------'); //never
      const e2subs = '   ^--';
      const expected = ' ---'; //never

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and hot-single', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--------'); //never
      const e1subs = '   ^----';
      const e2 = hot('-a-^-b-|');
      const e2subs = '   ^---!';
      const expected = ' -----'; //never

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot and hot', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|');
      const e1subs = '     ^--------!';
      const e2 = hot('---e-^---f--g--|');
      const e2subs = '     ^---------!';
      const expected = '   ----x-yz--|';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----x-yz--    ';
      const unsub = '      ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--^--b--c---d-| ');
      const e1subs = '       ^--------!    ';
      const e2 = hot('  ---e-^---f--g---h-|');
      const e2subs = '       ^--------!    ';
      const expected = '     ----x-yz--    ';
      const unsub = '        ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };

      const result = of(e1, e2).pipe(
        mergeMap((x) => of(x)),
        combineLatestAll((x, y) => x + y),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should combine 3 observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|');
      const e1subs = '     ^--------!';
      const e2 = hot('---e-^---f--g--|');
      const e2subs = '     ^---------!';
      const e3 = hot('---h-^----i--j-|');
      const e3subs = '     ^---------!';
      const expected = '   -----wxyz-|';

      const result = of(e1, e2, e3).pipe(combineLatestAll((x, y, z) => x + y + z));

      expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should work with empty and error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----------|'); //empty
      const e1subs = '  ^-----!';
      const e2 = hot('  ------#', undefined, 'shazbot!'); //error
      const e2subs = '  ^-----!';
      const expected = '------#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'shazbot!');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with error and empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--^---#', undefined, 'too bad, honk'); //error
      const e1subs = '  ^---!';
      const e2 = hot('--^--------|'); //empty
      const e2subs = '  ^---!';
      const expected = '----#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'too bad, honk');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot and throw', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--c--|');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and hot', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'bazinga');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--c--|');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and throw', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----#', undefined, 'jenga');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with error and throw', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--#', undefined, 'wokka wokka');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'flurp');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'flurp');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--#', undefined, 'wokka wokka');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and throw', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-----------');
      const e1subs = '   ^-----!';
      const e2 = hot('---^-----#', undefined, 'wokka wokka');
      const e2subs = '   ^-----!';
      const expected = ' ------#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and never', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   ---^----#', undefined, 'wokka wokka');
      const e1subs = '      ^----!';
      const e2 = hot('   ---^-----------');
      const e2subs = '      ^----!';
      const expected = '    -----#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with some and throw', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----a---b--|');
      const e1subs = '   ^--!';
      const e2 = hot('---^--#', undefined, 'wokka wokka');
      const e2subs = '   ^--!';
      const expected = ' ---#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and some', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--#', undefined, 'wokka wokka');
      const e1subs = '   ^--!';
      const e2 = hot('---^----a---b--|');
      const e2subs = '   ^--!';
      const expected = ' ---#';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle throw after complete left', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b---|');
      const leftSubs = '      ^------!';
      const right = hot('-----^--------#', undefined, 'bad things');
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';

      const result = of(left, right).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle throw after complete right', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' -----^--------#', undefined, 'bad things');
      const leftSubs = '      ^--------!';
      const right = hot('--a--^--b---|');
      const rightSubs = '     ^------!';
      const expected = '      ---------#';

      const result = of(left, right).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle interleaved with tail', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a--^--b---c---|');
      const e1subs = '    ^----------!';
      const e2 = hot('--d-^----e---f--|');
      const e2subs = '    ^-----------!';
      const expected = '  -----x-y-z--|';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|');
      const e1subs = '     ^--------!';
      const e2 = hot('-----^----------d--e--f--|');
      const e2subs = '     ^-------------------!';
      const expected = '   -----------x--y--z--|';

      const result = of(e1, e2).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables with error left', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--#', undefined, 'jenga');
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--|');
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';

      const result = of(left, right).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, null, 'jenga');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle two consecutive hot observables with error right', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--|');
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--#', undefined, 'dun dun dun');
      const rightSubs = '     ^-------------------!';
      const expected = '      -----------x--y--z--#';

      const result = of(left, right).pipe(combineLatestAll((x, y) => x + y));

      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle selector throwing', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--|');
      const e1subs = '     ^--!';
      const e2 = hot('--c--^--d--|');
      const e2subs = '     ^--!';
      const expected = '   ---#';

      const result = of(e1, e2).pipe(
        combineLatestAll((x, y) => {
          throw 'ha ha ' + x + ', ' + y;
        })
      );

      expectObservable(result).toBe(expected, null, 'ha ha b, d');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should combine two observables', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const expected = [
      [3, 4],
      [3, 5],
      [3, 6],
      [3, 7],
      [3, 8],
    ];
    of(a, b)
      .pipe(combineLatestAll())
      .subscribe({
        next: (vals) => {
          expect(vals).to.deep.equal(expected.shift());
        },
        complete: () => {
          expect(expected.length).to.equal(0);
          done();
        },
      });
  });

  it('should combine two immediately-scheduled observables', (done) => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 5],
      [3, 6],
      [3, 7],
      [3, 8],
    ];

    of(a, b, queueScheduler)
      .pipe(combineLatestAll())
      .subscribe({
        next: (vals) => {
          expect(vals).to.deep.equal(r.shift());
        },
        complete: () => {
          expect(r.length).to.equal(0);
          done();
        },
      });
  });
});
