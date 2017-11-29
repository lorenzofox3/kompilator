import {categories} from "../../tokenizer/src/tokens";
import {parseBindingIdentifierOrPattern, parseBlockStatement, parseFormalParameters} from "./statements";

//prefix
const asValue = (type, key) => (parser) => {
  const {value: token} = parser.next();
  const node = {type};
  if (key) {
    node[key] = token.value;
  }
  return node;
};
const asUnaryExpression = (type) => (parser) => {
  const {value: token} = parser.next();
  return {
    type,
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token)),
    prefix: true
  };
};
export const parseGroupExpression = (parser) => {
  parser.expect('(');
  const exp = parser.expression();
  parser.expect(')');
  return exp;
};
export const parseUnaryExpression = asUnaryExpression('UnaryExpression', 'operator');
export const parseThisExpression = asValue('ThisExpression');
export const parseLiteralExpression = asValue('Literal', 'value');
export const parseIdentifierExpression = asValue('Identifier', 'name');
export const parseRegularExpressionLiteral = parser => {
  const {value: regexp} = parser.next();
  return {
    type: 'Literal',
    value: regexp.value,
    regex: {
      pattern: regexp.value.source,
      flags: regexp.value.flags
    }
  }
};
export const parseUpdateExpressionAsPrefix = asUnaryExpression('UpdateExpression');
export const parseFunctionExpression = (parser) => {
  parser.expect('function');
  const node = {
    type: 'FunctionExpression',
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
};
export const parseNewExpression = parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    type: 'NewExpression',
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
};

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
export const parseArrayLiteralExpression = (parser) => {
  parser.expect('[');
  const node = {
    type: 'ArrayExpression',
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
};

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
export const parseObjectPropertyExpression = parser => {
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
    type: 'Property',
    key,
    value,
    kind,
    computed,
    method,
    shorthand
  };
};
export const parseObjectLiteralExpression = (parser) => {
  parser.expect('{');
  const node = {
    type: 'ObjectExpression',
    properties: parsePropertyList(parser)
  };
  parser.expect('}');
  return node;
};

//infix
const asBinaryExpression = type => (parser, left, operator) => {
  return {
    type,
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
    operator: operator.value
  };
};
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
export const parseAssignmentExpression = asBinaryExpression('AssignmentExpression');
export const parseBinaryExpression = asBinaryExpression('BinaryExpression');
export const parseLogicalExpression = asBinaryExpression('LogicalExpression');
export const parseMemberAccessExpression = (parser, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    type: 'MemberExpression',
    object: left,
    computed: computed,
    property: computed ? parser.expression() : parseIdentifierExpression(parser)
  };
  if (computed) {
    parser.expect(']');
  }
  return node;
};
export const parseUpdateExpression = (parser, left, operator) => {
  return {
    type: 'UpdateExpression',
    argument: left,
    operator: operator.value,
    prefix: false
  };
};
export const parseConditionalExpression = (parser, test) => {
  const node = {
    type: 'ConditionalExpression',
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','));
  node.consequent = parser.expression(commaPrecedence);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence);
  return node;
};
export const parseCallExpression = (parser, callee) => {
  const node = {
    type: 'CallExpression',
    callee,
    arguments: parseArguments(parser)
  };
  parser.expect(')');
  return node;
};

export const parseSequenceExpression = (parser, left) => {
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
};