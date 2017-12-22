export const withEventualSemiColon = (fn) => (parser, params) => {
  const node = fn(parser, params);
  parser.eventually(';');
  return node;
};
export const composeArityTwo = (factory, fn) => (a, b) => factory(fn(a, b));
export const composeArityOne = (factory, fn) => _ => factory(fn(_));
export const composeArityThree = (factory, fn) => (a, b, c) => factory(fn(a, b, c));
export const composeArityFour = (factory, fn) => (a, b, c, d) => factory(fn(a, b, c, d));

// these are to forward parameters to grammar production rules ([?yield], [+in], etc)
export const grammarParams = {
  yield: 1 << 0,
  await: 1 << 1,
  in: 1 << 2,
  return: 1 << 3,
  default: 1 << 4
};
