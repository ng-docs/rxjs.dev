/** @prettier */
import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { generate } from 'rxjs';
import { take } from 'rxjs/operators';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { observableMatcher } from '../helpers/observableMatcher';

function err(): any {
  throw 'error';
}

describe('generate', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should complete if condition does not meet', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate(
        1,
        (x) => false,
        (x) => x + 1
      );
      const expected = '|';

      expectObservable(source).toBe(expected);
    });
  });

  it('should produce first value immediately', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate(
        1,
        (x) => x == 1,
        (x) => x + 1
      );
      const expected = '(1|)';

      expectObservable(source).toBe(expected, { '1': 1 });
    });
  });

  it('should produce all values synchronously', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate(
        1,
        (x) => x < 3,
        (x) => x + 1
      );
      const expected = '(12|)';

      expectObservable(source).toBe(expected, { '1': 1, '2': 2 });
    });
  });

  it('should use result selector', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate(
        1,
        (x) => x < 3,
        (x) => x + 1,
        (x) => (x + 1).toString()
      );
      const expected = '(23|)';

      expectObservable(source).toBe(expected);
    });
  });

  it('should allow omit condition', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x + 1,
        resultSelector: (x: number) => x.toString(),
      }).pipe(take(5));
      const expected = '(12345|)';

      expectObservable(source).toBe(expected);
    });
  });

  it('should stop producing when unsubscribed', () => {
    const source = generate(
      1,
      (x) => x < 4,
      (x) => x + 1
    );
    let count = 0;
    const subscriber = new SafeSubscriber<number>((x) => {
      count++;
      if (x == 2) {
        subscriber.unsubscribe();
      }
    });
    source.subscribe(subscriber);
    expect(count).to.be.equal(2);
  });

  it('should accept a scheduler', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        condition: (x) => x < 4,
        iterate: (x) => x + 1,
        resultSelector: (x: number) => x,
        scheduler: rxTestScheduler,
      });
      const expected = '(123|)';

      let count = 0;
      source.subscribe((x) => count++);

      expect(count).to.be.equal(0);
      rxTestScheduler.flush();
      expect(count).to.be.equal(3);

      expectObservable(source).toBe(expected, { '1': 1, '2': 2, '3': 3 });
    });
  });

  it('should allow minimal possible options', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x * 2,
      }).pipe(take(3));
      const expected = '(124|)';

      expectObservable(source).toBe(expected, { '1': 1, '2': 2, '4': 4 });
    });
  });

  it('should emit error if result selector throws', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x * 2,
        resultSelector: err,
      });
      const expected = '(#)';

      expectObservable(source).toBe(expected);
    });
  });

  it('should emit error if result selector throws on scheduler', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x * 2,
        resultSelector: err,
        scheduler: rxTestScheduler,
      });
      const expected = '(#)';

      expectObservable(source).toBe(expected);
    });
  });

  it('should emit error after first value if iterate function throws', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: err,
      });
      const expected = '(1#)';

      expectObservable(source).toBe(expected, { '1': 1 });
    });
  });

  it('should emit error after first value if iterate function throws on scheduler', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: err,
        scheduler: rxTestScheduler,
      });
      const expected = '(1#)';

      expectObservable(source).toBe(expected, { '1': 1 });
    });
  });

  it('should emit error if condition function throws', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x + 1,
        condition: err,
      });
      const expected = '(#)';

      expectObservable(source).toBe(expected);
    });
  });

  it('should emit error if condition function throws on scheduler', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = generate({
        initialState: 1,
        iterate: (x) => x + 1,
        condition: err,
        scheduler: rxTestScheduler,
      });
      const expected = '(#)';

      expectObservable(source).toBe(expected);
    });
  });
});
