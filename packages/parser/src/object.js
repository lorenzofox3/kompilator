import {Property, ObjectExpression, ObjectPattern, Identifier} from "./ast";
import {composeArityTwo, grammarParams} from "./utils";
import {categories} from "../../tokenizer/src/tokens";
import {parseBindingIdentifier, parseIdentifierName} from "./statements";
import {asPropertyFunction} from "./function";
import {parseBindingIdentifierOrPattern, parseAssignmentPattern} from "./statements";

// "object" parsing is shared across various components:
// - as object literals
// - as object pattern
// - within class bodies as well

const asPropertyList = (parseDefinition) => {
  const fn = (parser, params, properties = []) => {
    const {value: nextToken} = parser.lookAhead();
    if (nextToken === parser.get('}')) {
      return properties;
    }

    if (parser.eventually(',')) {
      if (parser.eventually(',')) {
        throw new Error('Elision not allowed in object property list');
      }
    } else {
      properties.push(parseDefinition(parser, params));
    }
    return fn(parser, params, properties);
  };
  return fn;
};
const parseComputedPropertyName = (parser, params) => {
  parser.expect('[');
  const key = parser.expression(-1, params | grammarParams.in);
  parser.expect(']');
  return {
    key,
    computed: true
  };
};
const parseLiteralPropertyName = (parser, params) => ({key: parser.expression(20, params), computed: false});// max precedence => a literal or an identifier or a keyword

export const parsePropertyName = (parser, params) => {
  const {value: next} = parser.lookAhead();
  return next === parser.get('[') ?
    parseComputedPropertyName(parser, params) :
    parseLiteralPropertyName(parser, params);
};
const parseWithValue = (parser, params, prop) => {
  prop = prop !== void 0 ? prop : parsePropertyName(parser, params);
  const {value: next} = parser.lookAhead();
  if (next === parser.get('(')) {
    //method
    return asPropertyFunction(parser, params, Object.assign(prop, {method: true}));
  } else if (next === parser.get(':')) {
    //with initializer
    parser.expect(':');
    return Object.assign(prop, {
      value: parser.expression(parser.getInfixPrecedence(parser.get(',')), params | grammarParams.in)
    });
  }
  throw new Error(`Unexpected token: expected ":" or "(" but got ${next.rawValue}`);
};
const parsePropertyDefinition = composeArityTwo(Property, (parser, params) => {
  let {value: next} = parser.lookAhead();
  let prop;
  const {value: secondNext} = parser.lookAhead(1);

  //binding reference
  if (next.type === categories.Identifier) {
    if ((secondNext === parser.get(',') || secondNext === parser.get('}'))) {
      const key = parseBindingIdentifier(parser, params);
      return {
        shorthand: true,
        key,
        value: key
      };
    }
    //cover Initialized grammar https://tc39.github.io/ecma262/#prod-CoverInitializedName
    if (secondNext === parser.get('=')) {
      const key = parseBindingIdentifier(parser, params);
      const value = parseAssignmentPattern(parser, params, key);
      return {
        shorthand: true,
        key,
        value
      };
    }
  }

  //can be a getter/setter or a shorthand binding or a property with init...
  if (next === parser.get('get') || next === parser.get('set')) {
    const {value: accessor} = parser.next();
    const {value: next} = parser.lookAhead();

    if (next !== parser.get('(') && next !== parser.get(':')) {
      prop = Object.assign(parsePropertyName(parser, params), {kind: accessor.rawValue});
      return asPropertyFunction(parser, params, prop);
    }

    prop = {
      key: Identifier({name: accessor.value})
    };
  }

  return parseWithValue(parser, params, prop);
});
const parsePropertyList = asPropertyList(parsePropertyDefinition);
export const parseObjectLiteralExpression = composeArityTwo(ObjectExpression, (parser, params) => {
  parser.expect('{');
  const resume = parser.allowRightBrace();
  const node = {
    properties: parsePropertyList(parser, params)
  };
  parser.expect('}');
  resume();
  return node;
});

const parseSingleNameBindingProperty = (parser, params) => {
  const key = parseIdentifierName(parser, params);
  const shorthand = !parser.eventually(':');
  let value = shorthand ? key : parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    value = parseAssignmentPattern(parser, params | grammarParams.in, value);
  }
  return {shorthand, key, value};
};
const parsePropertyNameProperty = (parser, params) => {
  const property = parsePropertyName(parser, params);
  parser.expect(':');
  return Object.assign(property, {
    value: parseBindingIdentifierOrPattern(parser, params)
  });
};
const parseBindingProperty = (parser, params) => {
  const {value: next} = parser.lookAhead();
  const property = Property({});
  return next.type === categories.Identifier && parser.isReserved(next) === false ? //identifier but not reserved word
    Object.assign(property, parseSingleNameBindingProperty(parser, params)) :
    Object.assign(property, parsePropertyNameProperty(parser, params));
};
const parseBindingPropertyList = asPropertyList(parseBindingProperty);
export const parseObjectBindingPattern = composeArityTwo(ObjectPattern, (parser, params) => {
  parser.expect('{');
  const node = {
    properties: parseBindingPropertyList(parser, params)
  };
  parser.expect('}');
  return node;
});