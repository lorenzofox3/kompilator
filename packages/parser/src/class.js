import {MethodDefinition, ClassBody, ClassExpression, Class} from "./ast";
import {composeArityOne} from "./utils";
import {parseBindingIdentifier} from "./expressions";
import {categories} from "../../tokenizer/src/tokens";
import {asPropertyFunction} from "./function";
import {parsePropertyName} from "./object";

const parseClassMethod = composeArityOne(MethodDefinition, (parser) => {
  const isStatic = parser.eventually('static');
  const {value: next} = parser.lookAhead();
  const {value: secondNext} = parser.lookAhead(1);
  let prop;

  if (next === parser.get('get') || next === parser.get('set')) {
    if (secondNext !== parser.get('(')) {
      const {value: accessor} = parser.eat();
      prop = Object.assign(parsePropertyName(parser), {kind: accessor.rawValue});
    } else {
      prop = {
        key: parseBindingIdentifier(parser),
        computed: false
      }
    }
  }

  prop = prop !== void 0 ? prop : parsePropertyName(parser);

  if (prop.kind === void 0) {
    prop.kind = prop.key.name === 'constructor' ? 'constructor' : 'method';
  }

  return Object.assign(asPropertyFunction(parser, prop), {static: isStatic});
});
const parseClassElementList = (parser, elements = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return elements;
  }
  if (next !== parser.get(';')) {
    elements.push(parseClassMethod(parser));
  } else {
    parser.eat();
  }
  return parseClassElementList(parser, elements);
};
export const parseClassBody = composeArityOne(ClassBody, parser => {
  parser.expect('{');
  const node = {
    body: parseClassElementList(parser)
  };
  parser.expect('}');
  return node;
});

const parseClassTail = (parser, id) => {
  let superClass = null;

  if (parser.eventually('extends')) {
    superClass = parser.expression();
  }

  return {
    id,
    superClass,
    body: parseClassBody(parser)
  };
};

export const parseClassDeclaration = composeArityOne(Class, parser => {
  parser.expect('class');
  const id = parseBindingIdentifier(parser);
  return parseClassTail(parser, id);
});

export const parseClassExpression = composeArityOne(ClassExpression, parser => {
  parser.expect('class');
  let id = null;
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier && next !== parser.get('extends')) {
    id = parseBindingIdentifier(parser);
  }
  return parseClassTail(parser, id);
});