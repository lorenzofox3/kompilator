import {ArrayExpression, ArrayPattern, RestElement, SpreadElement} from "./ast";
import {composeArrityOne, composeArrityTwo} from "./utils";
import {parseAssignmentPattern, parseBindingIdentifierOrPattern} from "./statements";

// "array" parsing is shared across various components:
// - as array literals
// - as array pattern

export const parseRestElement = composeArrityOne(RestElement, parser => {
  parser.expect('...');
  return {
    argument: parseBindingIdentifierOrPattern(parser)
  };
});
export const parseSpreadExpression = composeArrityOne(SpreadElement, parser => {
  parser.expect('...');
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('...')))
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
  const fn = (parser, elements = []) => {
    const {value: next} = parser.lookAhead();
    const comma = parser.get(',');

    if (next === parser.get(']')) {
      return elements;
    }

    if (next === parser.get('...')) {
      elements.push(parseEllipsis(parser));
      parser.eventually(',');
      return fn(parser, elements);
    }

    if (next === comma) {
      parseArrayElision(parser, elements);
      return fn(parser, elements);
    }

    process(parser, elements);

    return fn(parser, elements);
  };
  return fn;
};
const parseArrayElements = arrayElements(parseSpreadExpression, (parser, elements) => {
  elements.push(parser.expression(parser.getInfixPrecedence(parser.get(','))));
  parser.eventually(',');
});
const parseArrayElementsBindingPattern = arrayElements(parseRestElement, (parser, elements) => {
  let element = parseBindingIdentifierOrPattern(parser);
  if (parser.eventually('=')) {
    element = parseAssignmentPattern(parser, element);
  }
  elements.push(element);
  parser.eventually(',');
});

export const parseArrayBindingPattern = composeArrityTwo(ArrayPattern, parser => {
  parser.expect('[');
  const node = {
    elements: parseArrayElementsBindingPattern(parser)
  };
  parser.expect(']');
  return node;
});
export const parseArrayLiteralExpression = composeArrityOne(ArrayExpression, (parser) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
});