export const composeArrityTwo = (factory, fn) => (a, b) => factory(fn(a, b));
export const composeArrityOne = (factory, fn) => _ => factory(fn(_));
export const composeArrityThree = (factory, fn) => (a, b, c) => factory(fn(a, b, c));