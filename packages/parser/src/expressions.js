import {
  composeArityOne as Prefix,
  composeArityThree as Infix
} from "./utils";
import * as ast from "./ast";
import {categories} from "../../tokenizer/src/tokens";

// expressions based on Javascript operators whether they are "prefix" or "infix"
// Note: Functions and Class expressions, Object literals and Array literals are in their own files

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

//no reserved word
export const parseBindingIdentifier = Prefix(ast.Identifier, parser => {
  const {value: next} = parser.next();
  if (parser.isReserved(next)) {
    throw new Error(`Binding identifier can not be reserved keyword "${next.value}"`);
  }
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  return {
    name: next.value
  };
});
export const parseIdentifierName = Prefix(ast.Identifier, parser => {
  const {value: next} = parser.next();
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  return {
    name: next.value
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
export const parseSuperExpression = asValue(ast.Super);
export const parseLiteralExpression = asValue(ast.Literal, 'value');
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
export const parseNewExpression = Prefix(ast.NewExpression, parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});
export const parseYieldExpression = Prefix(ast.YieldExpression, parser => {
  parser.expect('yield');
  let delegate = false;
  if (parser.eventually('*')) {
    delegate = true;
  }
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('yield'))),
    delegate
  };
});

//infix
const asBinaryExpression = type => Infix(type, (parser, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
    operator: operator.value
  };
});
export const parseAssignmentExpression = asBinaryExpression(ast.AssignmentExpression);
export const parseBinaryExpression = asBinaryExpression(ast.BinaryExpression);
export const parseLogicalExpression = asBinaryExpression(ast.LogicalExpression);
export const parseMemberAccessExpression = Infix(ast.MemberExpression, (parser, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    object: left,
    computed: computed,
    property: computed ? parser.expression() : parseIdentifierName(parser)
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