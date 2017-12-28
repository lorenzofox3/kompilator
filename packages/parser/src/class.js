import {ClassBody, ClassExpression, Class} from "./ast";
import {composeArityTwo} from "./utils";
import {parseBindingIdentifier} from "./statements";
import {categories} from "../../tokenizer/src/tokens";
import {parseClassMethod} from "./function";

const parseClassElementList = (parser, params, elements = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return elements;
  }

  if (!parser.eventually(';')) {
    elements.push(parseClassMethod(parser, params));
  }

  return parseClassElementList(parser, params, elements);
};
export const parseClassBody = composeArityTwo(ClassBody, (parser, params) => {
  parser.expect('{');
  const resume = parser.allowRightBrace();
  const node = {
    body: parseClassElementList(parser, params)
  };
  parser.expect('}');
  resume();
  return node;
});

const parseClassTail = (parser, params, id) => {
  const superClass = parser.eventually('extends') ? parser.expression(-1, params) : null;
  return {
    id,
    superClass,
    body: parseClassBody(parser, params)
  };
};

export const parseClassDeclaration = composeArityTwo(Class, (parser, params) => {
  parser.expect('class');
  const id = parseBindingIdentifier(parser, params);
  return parseClassTail(parser, params, id);
});
export const parseClassExpression = composeArityTwo(ClassExpression, (parser, params) => {
  parser.expect('class');
  let id = null;
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier && next !== parser.get('extends')) {
    id = parseBindingIdentifier(parser);
  }
  return parseClassTail(parser, params, id);
});