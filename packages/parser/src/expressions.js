import {categories} from "../../tokenizer/src/tokens";
import {parseBindingIdentifierOrPattern, parseBlockStatement, parseFormalParameters} from "./statements";
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
  const node = {
    id: null,
    async: false,
    generator: false
  };
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('(')) {
    node.id = parseBindingIdentifierOrPattern(parser);
  }
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
});
export const parseNewExpression = Prefix(ast.NewExpression, parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});

//Arrays literals
const parseArrayElements = (parser, elements = []) => {
  const {value: token} = parser.lookAhead();
  if (token === parser.get(']')) {
    return elements;
  }
  const comma = parser.get(',');
  elements.push(parser.expression(parser.getInfixPrecedence(comma)));
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === comma) {
    parser.eat();
  }
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

const parsePropertyList = (parser, properties = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === parser.get('}')) {
    return properties;
  }
  if (nextToken !== parser.get(',')) {
    properties.push(parseObjectPropertyExpression(parser));
  } else {
    parser.eat();
  }
  return parsePropertyList(parser, properties);
};
const isPropertyName = (parser, token) => token === parser.get('[') || token.type === categories.Identifier || token.type === categories.NumericLiteral || token.type === categories.StringLiteral || token.isReserved === true;
export const parseObjectPropertyExpression = Prefix(ast.Property, parser => {
  const {value: nextToken} = parser.lookAhead();
  let key;
  let kind = 'init';
  let value = null;
  let computed = false;
  let shorthand = false;
  let method = false;
  if (isPropertyName(parser, nextToken)) {
    if (parser.eventually('[')) {
      computed = true;
      key = parser.expression();
      parser.expect(']');
    } else {
      key = parser.expression(20)
    }
    parser.expect(':');
    value = parser.expression(parser.getInfixPrecedence(parser.get(',')))
  }

  return {
    key,
    value,
    kind,
    computed,
    method,
    shorthand
  };
});
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
  const {value: parsableValue} = parser.lookAhead();
  const comma = parser.get(',');

  if (parsableValue === parser.get(')')) {
    return expressions;
  }

  expressions.push(parser.expression(parser.getInfixPrecedence(comma)));
  const {value: lookAhead} = parser.lookAhead();

  if (lookAhead !== comma) {
    return expressions;
  }
  parser.eat();
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
  type: 'UpdateExpression',
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
      type: 'SequenceExpression',
      expressions: [left, next]
    }
  }
  return node;
});