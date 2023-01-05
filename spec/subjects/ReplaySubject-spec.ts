import { expect } from 'chai';
import { ReplaySubject, Subject, of } from 'rxjs';
import { mergeMapTo, tap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {ReplaySubject} */
describe('ReplaySubject', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should extend Subject', () => {
    const subject = new ReplaySubject();
    expect(subject).to.be.instanceof(Subject);
  });

  it('should add the observer before running subscription code', () => {
    const subject = new ReplaySubject<number>();
    subject.next(1);
    const results: number[] = [];

    subject.subscribe((value) => {
      results.push(value);
      if (value < 3) {
        subject.next(value + 1);
      }
    });

    expect(results).to.deep.equal([1, 2, 3]);
  });

  it('should replay values upon subscription', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe({
      next: (x: number) => {
        expect(x).to.equal(expects[i++]);
        if (i === 3) {
          subject.complete();
        }
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });
  });

  it('should replay values and complete', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe({
      next: (x: number) => {
        expect(x).to.equal(expects[i++]);
      },
      complete: done,
    });
  });

  it('should replay values and error', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.error('fooey');
    subject.subscribe({
      next: (x: number) => {
        expect(x).to.equal(expects[i++]);
      },
      error: (err: any) => {
        expect(err).to.equal('fooey');
        done();
      },
    });
  });

  it('should only replay values within its buffer size', (done) => {
    const subject = new ReplaySubject<number>(2);
    const expects = [2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe({
      next: (x: number) => {
        expect(x).to.equal(expects[i++]);
        if (i === 2) {
          subject.complete();
        }
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });
  });

  describe('with bufferSize=2', () => {
    it('should replay 2 previous values when subscribed', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const replaySubject = new ReplaySubject<string>(2);
        function feedNextIntoSubject(x: string) {
          replaySubject.next(x);
        }
        function feedErrorIntoSubject(err: string) {
          replaySubject.error(err);
        }
        function feedCompleteIntoSubject() {
          replaySubject.complete();
        }

        const sourceTemplate = ' -1-2-3----4------5-6---7--8----9--|';
        const subscriber1 = hot('------(a|)                         ').pipe(mergeMapTo(replaySubject));
        const unsub1 = '         ---------------------!             ';
        const expected1 = '      ------(23)4------5-6--             ';
        const subscriber2 = hot('------------(b|)                   ').pipe(mergeMapTo(replaySubject));
        const unsub2 = '         -------------------------!         ';
        const expected2 = '      ------------(34)-5-6---7--         ';
        const subscriber3 = hot('---------------------------(c|)    ').pipe(mergeMapTo(replaySubject));
        const expected3 = '      ---------------------------(78)9--|';

        expectObservable(
          hot(sourceTemplate).pipe(tap({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject }))
        ).toBe(sourceTemplate);
        expectObservable(subscriber1, unsub1).toBe(expected1);
        expectObservable(subscriber2, unsub2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
      });
    });

    it('should replay 2 last values for when subscribed after completed', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const replaySubject = new ReplaySubject<string>(2);
        function feedNextIntoSubject(x: string) {
          replaySubject.next(x);
        }
        function feedErrorIntoSubject(err: string) {
          replaySubject.error(err);
        }
        function feedCompleteIntoSubject() {
          replaySubject.complete();
        }

        const sourceTemplate = ' -1-2-3--4--|';
        const subscriber1 = hot('---------------(a|) ').pipe(mergeMapTo(replaySubject));
        const expected1 = '      ---------------(34|)';

        expectObservable(
          hot(sourceTemplate).pipe(tap({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject }))
        ).toBe(sourceTemplate);
        expectObservable(subscriber1).toBe(expected1);
      });
    });

    it('should handle subscribers that arrive and leave at different times, ' + 'subject does not complete', () => {
      const subject = new ReplaySubject<number>(2);
      const results1: (number | string)[] = [];
      const results2: (number | string)[] = [];
      const results3: (number | string)[] = [];

      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);

      const subscription1 = subject.subscribe({
        next: (x: number) => {
          results1.push(x);
        },
        error: (err: any) => {
          results1.push('E');
        },
        complete: () => {
          results1.push('C');
        },
      });

      subject.next(5);

      const subscription2 = subject.subscribe({
        next: (x: number) => {
          results2.push(x);
        },
        error: (err: any) => {
          results2.push('E');
        },
        complete: () => {
          results2.push('C');
        },
      });

      subject.next(6);
      subject.next(7);

      subscription1.unsubscribe();

      subject.next(8);

      subscription2.unsubscribe();

      subject.next(9);
      subject.next(10);

      const subscription3 = subject.subscribe({
        next: (x: number) => {
          results3.push(x);
        },
        error: (err: any) => {
          results3.push('E');
        },
        complete: () => {
          results3.push('C');
        },
      });

      subject.next(11);

      subscription3.unsubscribe();

      expect(results1).to.deep.equal([3, 4, 5, 6, 7]);
      expect(results2).to.deep.equal([4, 5, 6, 7, 8]);
      expect(results3).to.deep.equal([9, 10, 11]);

      subject.complete();
    });
  });

  describe('with windowTime=4', () => {
    it('should replay previous values since 4 time units ago when subscribed', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const replaySubject = new ReplaySubject<string>(Infinity, 4, rxTestScheduler);
        function feedNextIntoSubject(x: string) {
          replaySubject.next(x);
        }
        function feedErrorIntoSubject(err: any) {
          replaySubject.error(err);
        }
        function feedCompleteIntoSubject() {
          replaySubject.complete();
        }

        const sourceTemplate = ' -1-2-3----4------5-6----7-8----9--|';
        const subscriber1 = hot('------(a|)                         ').pipe(mergeMapTo(replaySubject));
        const unsub1 = '         ---------------------!             ';
        const expected1 = '      ------(23)4------5-6--             ';
        const subscriber2 = hot('------------(b|)                   ').pipe(mergeMapTo(replaySubject));
        const unsub2 = '         -------------------------!         ';
        const expected2 = '      ------------4----5-6----7-         ';
        const subscriber3 = hot('---------------------------(c|)    ').pipe(mergeMapTo(replaySubject));
        const expected3 = '      ---------------------------(78)9--|';

        expectObservable(
          hot(sourceTemplate).pipe(tap({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject }))
        ).toBe(sourceTemplate);
        expectObservable(subscriber1, unsub1).toBe(expected1);
        expectObservable(subscriber2, unsub2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
      });
    });

    it('should replay last values since 4 time units ago when subscribed', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const replaySubject = new ReplaySubject<string>(Infinity, 4, rxTestScheduler);
        function feedNextIntoSubject(x: string) {
          replaySubject.next(x);
        }
        function feedErrorIntoSubject(err: any) {
          replaySubject.error(err);
        }
        function feedCompleteIntoSubject() {
          replaySubject.complete();
        }

        const sourceTemplate = ' -1-2-3----4|';
        const subscriber1 = hot('-------------(a|)').pipe(mergeMapTo(replaySubject));
        const expected1 = '      -------------(4|)';

        expectObservable(
          hot(sourceTemplate).pipe(tap({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject }))
        ).toBe(sourceTemplate);
        expectObservable(subscriber1).toBe(expected1);
      });
    });

    it('should only replay bufferSize items when 4 time units ago more were emitted', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const replaySubject = new ReplaySubject<string>(2, 4, rxTestScheduler);
        function feedNextIntoSubject(x: string) {
          replaySubject.next(x);
        }
        function feedErrorIntoSubject(err: any) {
          replaySubject.error(err);
        }
        function feedCompleteIntoSubject() {
          replaySubject.complete();
        }

        const sourceTemplate = ' 1234-------|';
        const subscriber1 = hot('----(a|)').pipe(mergeMapTo(replaySubject));
        const expected1 = '      ----(34)---|';

        expectObservable(
          hot(sourceTemplate).pipe(tap({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject }))
        ).toBe(sourceTemplate);
        expectObservable(subscriber1).toBe(expected1);
      });
    });
  });

  it('should be an Observer which can be given to Observable.subscribe', () => {
    const source = of(1, 2, 3, 4, 5);
    const subject = new ReplaySubject<number>(3);
    let results: (number | string)[] = [];

    subject.subscribe({ next: (x) => results.push(x), complete: () => results.push('done') });

    source.subscribe(subject);

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 'done']);

    results = [];

    subject.subscribe({ next: (x) => results.push(x), complete: () => results.push('done') });

    expect(results).to.deep.equal([3, 4, 5, 'done']);
  });

  it('should not buffer nexted values after complete', () => {
    const results: (number | string)[] = [];
    const subject = new ReplaySubject<number>();
    subject.next(1);
    subject.next(2);
    subject.complete();
    subject.next(3);
    subject.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('C'),
    });
    expect(results).to.deep.equal([1, 2, 'C']);
  });

  it('should not buffer nexted values after error', () => {
    const results: (number | string)[] = [];
    const subject = new ReplaySubject<number>();
    subject.next(1);
    subject.next(2);
    subject.error(new Error('Boom!'));
    subject.next(3);
    subject.subscribe({
      next: (value) => results.push(value),
      error: () => results.push('E'),
    });
    expect(results).to.deep.equal([1, 2, 'E']);
  });
});
