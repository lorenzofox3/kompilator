import {categories} from "../../tokenizer/src/tokens";
import {
  parseBlockStatement,
  parseClassBody,
  parseFormalParameters,
} from "./statements";
import {
  parseArrayElision,
  parsePropertyName,
  asPropertyFunction
} from "./utils";
import * as ast from "./ast";

//todo 1. check whether a real compose affects performances or not
//todo 2. these could be decoratos like @Infix(ast.foo) etc or eve @Node(ast.blah)
//compose one with arrity one
const Prefix = (factory, fn) => parser => factory(fn(parser));
// compose with arrity 3
const Infix = (factory, fn) => (parser, left, operator) => factory(fn(parser, left, operator));

//prefix
const asValue = (type, key) => Prefix(type, (parser) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => Prefix(type, (parser) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token)),
    prefix: true
  };
});
export const parseGroupExpression = (parser) => {
  parser.expect('(');
  const exp = parser.expression();
  parser.expect(')');
  return exp;
};
export const parseUnaryExpression = asUnaryExpression(ast.UnaryExpression);
export const parseThisExpression = asValue(ast.ThisExpression);
export const parseLiteralExpression = asValue(ast.Literal, 'value');
export const parseIdentifierExpression = asValue(ast.Identifier, 'name');
export const parseRegularExpressionLiteral = Prefix(ast.Literal, parser => {
  const {value: regexp} = parser.next();
  return {
    value: regexp.value,
    regex: {
      pattern: regexp.value.source,
      flags: regexp.value.flags
    }
  }
});
export const parseUpdateExpressionAsPrefix = asUnaryExpression(ast.UpdateExpression);
export const parseFunctionExpression = Prefix(ast.FunctionExpression, (parser) => {
  parser.expect('function');
  const node = {};
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('(')) {
    node.id = parseIdentifierExpression(parser);
  }
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
});
export const parseClassExpression = Prefix(ast.ClassExpression, parser => {
  parser.expect('class');
  const {value: next} = parser.lookAhead();
  let superClass = null;
  let id = null;
  if (next.type === categories.Identifier) {
    id = parseIdentifierExpression(parser);
  }
  if (parser.eventually('extends')) {
    superClass = parser.expression();
  }

  return {
    id,
    superClass,
    body: parseClassBody(parser)
  };
});
export const parseNewExpression = Prefix(ast.NewExpression, parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});
export const parseSpreadExpression = Prefix(ast.SpreadElement, parser => {
  parser.expect('...');
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('...')))
  };
});

//Array literals
const parseArrayElements = (parser, elements = []) => {
  const {value: next} = parser.lookAhead();
  const comma = parser.get(',');

  if (next === parser.get(']')) {
    return elements;
  }

  if (next === parser.get('...')) {
    elements.push(parseSpreadExpression(parser));
    parser.eventually(',');
    return parseArrayElements(parser, elements);
  }

  if (next === comma) {
    parseArrayElision(parser, elements);
    return parseArrayElements(parser, elements)
  }

  elements.push(parser.expression(parser.getInfixPrecedence(comma)));
  parser.eventually(',');

  return parseArrayElements(parser, elements);
};
export const parseArrayLiteralExpression = Prefix(ast.ArrayExpression, (parser) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
});

//Object literals
const parsePropertyDefinition = Prefix(ast.Property, parser => {
  let {value: next} = parser.lookAhead();
  let prop;
  const {value: secondNext} = parser.lookAhead(1);

  //binding reference
  if (next.type === categories.Identifier && (secondNext === parser.get(',') || secondNext === parser.get('}'))) {
    const key = parseIdentifierExpression(parser);
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
      key: ast.Identifier({name: accessor.value})
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
export const parseObjectLiteralExpression = Prefix(ast.ObjectExpression, (parser) => {
  parser.expect('{');
  const node = {
    properties: parsePropertyList(parser)
  };
  parser.expect('}');
  return node;
});

//infix
const asBinaryExpression = type => Infix(type, (parser, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
    operator: operator.value
  };
});
const parseArguments = (parser, expressions = []) => {
  const {value: next} = parser.lookAhead();
  const comma = parser.get(',');

  if (next === parser.get(')')) {
    return expressions;
  }

  if (next === parser.get('...')) {
    expressions.push(parseSpreadExpression(parser));
    parser.eventually(',');
    return expressions;
  }

  expressions.push(parser.expression(parser.getInfixPrecedence(comma)));
  parser.eventually(','); //todo no elision allowed

  return parseArguments(parser, expressions);
};
export const parseAssignmentExpression = asBinaryExpression(ast.AssignmentExpression);
export const parseBinaryExpression = asBinaryExpression(ast.BinaryExpression);
export const parseLogicalExpression = asBinaryExpression(ast.LogicalExpression);
export const parseMemberAccessExpression = Infix(ast.MemberExpression, (parser, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    object: left,
    computed: computed,
    property: computed ? parser.expression() : parseIdentifierExpression(parser)
  };
  if (computed) {
    parser.expect(']');
  }
  return node;
});
export const parseUpdateExpression = Infix(ast.UpdateExpression, (parser, left, operator) => ({
  argument: left,
  operator: operator.value,
  prefix: false
}));
export const parseConditionalExpression = Infix(ast.ConditionalExpression, (parser, test) => {
  const node = {
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','));
  node.consequent = parser.expression(commaPrecedence);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence);
  return node;
});
export const parseCallExpression = Infix(ast.CallExpression, (parser, callee) => {
  const node = {
    callee,
    arguments: parseArguments(parser)
  };
  parser.expect(')');
  return node;
});
export const parseSequenceExpression = Infix(ast.SequenceExpression, (parser, left) => {
  let node = left;
  const comma = parser.get(',');
  const next = parser.expression(parser.getInfixPrecedence(comma));
  if (left.type === 'SequenceExpression') {
    left.expressions.push(next);
  } else {
    node = {
      expressions: [left, next]
    }
  }
  return node;
});