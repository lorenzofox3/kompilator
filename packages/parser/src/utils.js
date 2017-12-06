export const parseArrayElision = (parser, elements) => {
  const {value: next} = parser.lookAhead();

  if (next !== parser.get(',')) {
    return elements;
  }
  elements.push(null);
  parser.eat();
  return parseArrayElision(parser, elements);
};

export const parseComputedPropertyName = parser => {
  parser.expect('[');
  const key = parser.expression();
  parser.expect(']');
  return key;
};
export const parseLiteralPropertyName = parser => parser.expression(20);// max precedence => a literal or an identifier of a keyword