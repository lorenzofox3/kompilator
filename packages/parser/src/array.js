import {ArrayExpression, ArrayPattern, RestElement, SpreadElement} from "./ast";
import {composeArityOne, composeArityTwo, grammarParams} from "./utils";
import {parseAssignmentPattern, parseBindingIdentifierOrPattern} from "./statements";

// "array" parsing is shared across various components:
// - as array literals
// - as array pattern
export const parseRestElement = composeArityTwo(RestElement, (parser, params) => {
  parser.expect('...');
  return {
    argument: parseBindingIdentifierOrPattern(parser, params)
  };
});
export const parseSpreadExpression = composeArityTwo(SpreadElement, (parser, params) => {
  parser.expect('...');
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('...'), params | grammarParams.in))
  };
});

const parseArrayElision = (parser, elements) => {
  const {value: next} = parser.lookAhead();

  if (next !== parser.get(',')) {
    return elements;
  }

  elements.push(null);
  parser.eat();

  return parseArrayElision(parser, elements);
};
const arrayElements = (parseEllipsis, process) => {
  const fn = (parser, params, elements = []) => {
    const {value: next} = parser.lookAhead();
    const comma = parser.get(',');

    if (next === parser.get(']')) {
      return elements;
    }

    if (next === parser.get('...')) {
      elements.push(parseEllipsis(parser, params));
      parser.eventually(',');
      return fn(parser, params, elements);
    }

    if (next === comma) {
      parseArrayElision(parser, elements);
      return fn(parser, params, elements);
    }

    process(parser, params, elements);

    return fn(parser, params, elements);
  };
  return fn;
};
const parseArrayElements = arrayElements(parseSpreadExpression, (parser, params, elements) => {
  elements.push(parser.expression(parser.getInfixPrecedence(parser.get(',')), params | grammarParams.in));
  parser.eventually(',');
});
const parseArrayElementsBindingPattern = arrayElements(parseRestElement, (parser, params, elements) => {
  let element = parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    element = parseAssignmentPattern(parser, params | grammarParams.in, element);
  }
  elements.push(element);
  parser.eventually(',');
});

export const parseArrayBindingPattern = composeArityTwo(ArrayPattern, (parser, params) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElementsBindingPattern(parser, params)
  };
  parser.expect(']');
  return node;
});
export const parseArrayLiteralExpression = composeArityTwo(ArrayExpression, (parser, params) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser, params)
  };
  parser.expect(']');
  return node;
});