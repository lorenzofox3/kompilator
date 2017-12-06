export const lazyMapWith = (fn) => function* (iterator) {
  for (let i of iterator) {
    yield fn(i);
  }
};

export const lazyFilterWith = fn => function* (iterator) {
  for (let i of iterator) {
    if (fn(i)) {
      yield i;
    }
  }
};

export const syntacticFlags = {
  allowRegexp: 1 << 0,
  allowRightBrace: 1 << 1
};