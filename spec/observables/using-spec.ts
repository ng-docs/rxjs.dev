import { expect } from 'chai';
import { using, range, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

describe('using', () => {
  it('should dispose of the resource when the subscription is disposed', (done) => {
    let disposed = false;
    const source = using(
      () => new Subscription(() => disposed = true),
      (resource) => range(0, 3)
    )
    .pipe(take(2));

    source.subscribe();

    if (disposed) {
      done();
    } else {
      done(new Error('disposed should be true but was false'));
    }
  });

  it('should accept factory returns promise resolves', (done) => {
    const expected = 42;

    let disposed = false;
    const e1 = using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe({ next: x => {
      expect(x).to.equal(expected);
    }, error: (x) => {
      done(new Error('should not be called'));
    }, complete: () => {
      done();
    } });
  });

  it('should accept factory returns promise rejects', (done) => {
    const expected = 42;

    let disposed = false;
    const e1 = using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe({ next: x => {
      done(new Error('should not be called'));
    }, error: (x) => {
      expect(x).to.equal(expected);
      done();
    }, complete: () => {
      done(new Error('should not be called'));
    } });
  });

  it('should raise error when resource factory throws', (done) => {
    const expectedError = 'expected';
    const error = 'error';

    const source = using(
      () => {
        throw expectedError;
      },
      (resource) => {
        throw error;
      }
    );

    source.subscribe({ next: (x) => {
      done(new Error('should not be called'));
    }, error: (x) => {
      expect(x).to.equal(expectedError);
      done();
    }, complete: () => {
      done(new Error('should not be called'));
    } });
  });

  it('should raise error when observable factory throws', (done) => {
    const error = 'error';
    let disposed = false;

    const source = using(
      () => new Subscription(() => disposed = true),
      (resource) => {
        throw error;
      }
    );

    source.subscribe({ next: (x) => {
      done(new Error('should not be called'));
    }, error: (x) => {
      expect(x).to.equal(error);
      done();
    }, complete: () => {
      done(new Error('should not be called'));
    } });
  });
});
