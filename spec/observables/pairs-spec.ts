import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';
import { TestScheduler } from 'rxjs/testing';
import { pairs } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

describe('pairs', () => {
  it('should create an observable emits key-value pair', () => {
    const e1 = pairs({a: 1, b: 2}, rxTestScheduler);
    const expected = '(ab|)';
    const values = {
      a: ['a', 1],
      b: ['b', 2]
    };

    expectObservable(e1).toBe(expected, values);
  });

  it('should create an observable without scheduler', (done) => {
    let expected = [
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ];

    pairs({a: 1, b: 2, c: 3}).subscribe({ next: x => {
      expect(x).to.deep.equal(expected.shift());
    }, error: x => {
      done(new Error('should not be called'));
    }, complete: () => {
      expect(expected).to.be.empty;
      done();
    } });
  });

  it('should work with empty object', () => {
    const e1 = pairs({}, rxTestScheduler);
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });
});
