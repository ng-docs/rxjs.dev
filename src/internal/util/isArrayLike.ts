export const isArrayLike = <T>(x: any): x is ArrayLike<T> => x && typeof x.length === 'number' && typeof x !== 'function';
