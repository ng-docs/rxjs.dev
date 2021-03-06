import { expect } from 'chai';
import { iif, of } from 'rxjs';
import { expectObservable } from '../helpers/marble-testing';

describe('iif', () => {
  it('should subscribe to thenSource when the conditional returns true', () => {
    const e1 = iif(() => true, of('a'), of());
    const expected = '(a|)';

    expectObservable(e1).toBe(expected);
  });

  it('should subscribe to elseSource when the conditional returns false', () => {
    const e1 = iif(() => false, of('a'), of('b'));
    const expected = '(b|)';

    expectObservable(e1).toBe(expected);
  });

  it('should complete without an elseSource when the conditional returns false', () => {
    const e1 = iif(() => false, of('a'), of());
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when conditional throws', () => {
    const e1 = iif(((): boolean => {
      throw 'error';
    }), of('a'), of());

    const expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should accept resolved promise as thenSource', (done) => {
    const expected = 42;
    const e1 = iif(() => true, new Promise((resolve: any) => { resolve(expected); }), of());

    e1.subscribe({ next: x => {
      expect(x).to.equal(expected);
    }, error: (x) => {
      done(new Error('should not be called'));
    }, complete: () => {
      done();
    } });
  });

  it('should accept resolved promise as elseSource', (done) => {
    const expected = 42;
    const e1 = iif(() => false,
      of('a'),
      new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe({ next: x => {
      expect(x).to.equal(expected);
    }, error: (x) => {
      done(new Error('should not be called'));
    }, complete: () => {
      done();
    } });
  });

  it('should accept rejected promise as elseSource', (done) => {
    const expected = 42;
    const e1 = iif(() => false,
      of('a'),
      new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe({ next: x => {
      done(new Error('should not be called'));
    }, error: (x) => {
      expect(x).to.equal(expected);
      done();
    }, complete: () => {
      done(new Error('should not be called'));
    } });
  });

  it('should accept rejected promise as thenSource', (done) => {
    const expected = 42;
    const e1 = iif(() => true, new Promise((resolve: any, reject: any) => { reject(expected); }), of());

    e1.subscribe({ next: x => {
      done(new Error('should not be called'));
    }, error: (x) => {
      expect(x).to.equal(expected);
      done();
    }, complete: () => {
      done(new Error('should not be called'));
    } });
  });
});
