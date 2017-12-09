import {parseFormalParameters, parseBlockStatement} from "./statements"
import {FunctionExpression} from "./ast";

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
  return {
    key,
    computed: true
  };
};
export const asPropertyFunction = (parser, prop) => {
  parser.expect('(');
  const params = parseFormalParameters(parser);
  parser.expect(')');
  const body = parseBlockStatement(parser);
  return Object.assign(prop, {
    value: FunctionExpression({
      params,
      body
    })
  });
};
export const parseLiteralPropertyName = parser => ({key: parser.expression(20), computed: false});// max precedence => a literal or an identifier or a keyword
export const parsePropertyName = parser => {
  const {value: next} = parser.lookAhead();
  return next === parser.get('[') ?
    parseComputedPropertyName(parser) :
    parseLiteralPropertyName(parser)
};