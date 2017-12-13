import {Property, ObjectExpression,ObjectPattern, Identifier} from "./ast"
import {composeArityOne} from "./utils";
import {categories} from "../../tokenizer/src/tokens";
import {parseBindingIdentifier, parseIdentifierName} from "./expressions";
import {asPropertyFunction} from "./function";
import {parseBindingIdentifierOrPattern, parseAssignmentPattern} from "./statements";

// "object" parsing is shared across various components:
// - as object literals
// - as object pattern
// - within class bodies as well

const parseComputedPropertyName = parser => {
  parser.expect('[');
  const key = parser.expression();
  parser.expect(']');
  return {
    key,
    computed: true
  };
};
const parseLiteralPropertyName = parser => ({key: parser.expression(20), computed: false});// max precedence => a literal or an identifier or a keyword
export const parsePropertyName = parser => {
  const {value: next} = parser.lookAhead();
  return next === parser.get('[') ?
    parseComputedPropertyName(parser) :
    parseLiteralPropertyName(parser)
};


const parsePropertyDefinition = composeArityOne(Property, parser => {
  let {value: next} = parser.lookAhead();
  let prop;
  const {value: secondNext} = parser.lookAhead(1);

  //binding reference
  if (next.type === categories.Identifier && (secondNext === parser.get(',') || secondNext === parser.get('}'))) {
    const key = parseBindingIdentifier(parser);
    return {
      shorthand: true,
      key,
      value: key
    };
  }

  //can be a getter/setter or a shorthand binding or a property with init
  if (next === parser.get('get') || next === parser.get('set')) {
    const {value: accessor} = parser.next();
    const {value: next} = parser.lookAhead();

    if (next !== parser.get('(') && next !== parser.get(':')) {
      prop = Object.assign(parsePropertyName(parser), {kind: accessor.rawValue});
      return asPropertyFunction(parser, prop);
    }

    prop = {
      key: Identifier({name: accessor.value})
    };
  }

  prop = prop !== void 0 ? prop : parsePropertyName(parser);
  next = parser.lookAhead().value;
  if (next === parser.get('(')) {
    //method
    return asPropertyFunction(parser, Object.assign(prop, {method: true}));
  } else if (next === parser.get(':')) {
    //with initializer
    parser.expect(':');
    return Object.assign(prop, {
      value: parser.expression(parser.getInfixPrecedence(parser.get(',')))
    });
  }

  throw new Error(`Unexpected token: expected ":" or "(" but got ${next.rawValue}`);

});
const parsePropertyList = (parser, properties = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === parser.get('}')) {
    return properties;
  }
  if (nextToken !== parser.get(',')) {
    properties.push(parsePropertyDefinition(parser));
  } else {
    parser.eat();
  }
  return parsePropertyList(parser, properties);
};
export const parseObjectLiteralExpression = composeArityOne(ObjectExpression, parser => {
  parser.expect('{');
  const node = {
    properties: parsePropertyList(parser)
  };
  parser.expect('}');
  return node;
});

const parseSingleNameBindingProperty = parser => {
  const key = parseIdentifierName(parser);
  let value = key;
  let shorthand = false;
  if (parser.eventually(':')) {
    value = parseBindingIdentifierOrPattern(parser);
  } else {
    shorthand = true;
    value = key;
  }

  if (parser.eventually('=')) {
    value = parseAssignmentPattern(parser, value);
  }
  return {shorthand, key, value};
};
const parsePropertyNameProperty = parser => {
  const property = parsePropertyName(parser);
  parser.expect(':');
  return Object.assign(property, {
    value: parseBindingIdentifierOrPattern(parser)
  });
};
const parseBindingProperty = parser => {
  const {value: next} = parser.lookAhead();
  const property = Property({});
  return next.type === categories.Identifier ? //identifier but not reserved word
    Object.assign(property, parseSingleNameBindingProperty(parser)) :
    Object.assign(property, parsePropertyNameProperty(parser));
};
const parseBindingPropertyList = (parser, properties = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return properties;
  }
  if (next !== parser.get(',')) {
    properties.push(parseBindingProperty(parser));
  } else {
    parser.eat(); //todo elision not allowed
  }
  return parseBindingPropertyList(parser, properties);
};
export const parseObjectBindingPattern = composeArityOne(ObjectPattern, parser => {
  parser.expect('{');
  const node = {
    properties: parseBindingPropertyList(parser)
  };
  parser.expect('}');
  return node;
});

