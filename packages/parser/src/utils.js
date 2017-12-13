export const withEventualSemiColon = (fn) => parser => {
  const node = fn(parser);
  parser.eventually(';');
  return node;
};
export const composeArityTwo = (factory, fn) => (a, b) => factory(fn(a, b));
export const composeArityOne = (factory, fn) => _ => factory(fn(_));
export const composeArityThree = (factory, fn) => (a, b, c) => factory(fn(a, b, c));