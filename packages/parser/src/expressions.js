import {
  composeArityOne,
  composeArityThree,
  composeArityTwo,
  composeArityFour, grammarParams
} from "./utils";
import * as ast from "./ast";
import {toAssignable} from "./asAssign";
import {parseIdentifierName} from "./statements";

// expressions based on Javascript operators whether they are "prefix" or "infix"
// Note: Functions and Class expressions, Object literals and Array literals are in their own files

//prefix
const asValue = (type, key) => composeArityOne(type, (parser) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => composeArityTwo(type, (parser, params) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token), params),
    prefix: true
  };
});
export const parseGroupExpression = (parser, params) => {
  parser.expect('(');
  const exp = parser.expression(-1, params);
  parser.expect(')');
  return exp;
};
export const parseUnaryExpression = asUnaryExpression(ast.UnaryExpression);
export const parseThisExpression = asValue(ast.ThisExpression);
export const parseSuperExpression = asValue(ast.Super);
export const parseLiteralExpression = asValue(ast.Literal, 'value');
export const parseRegularExpressionLiteral = composeArityOne(ast.Literal, parser => {
  const {value: regexp} = parser.next();
  return {
    value: regexp.value,
    regex: {
      pattern: regexp.value.source,
      flags: regexp.value.flags
    }
  };
});
export const parseUpdateExpressionAsPrefix = asUnaryExpression(ast.UpdateExpression);
export const parseNewExpression = composeArityTwo(ast.NewExpression, (parser, params) => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken), params);
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});
export const parseYieldExpression = (parser, params) => {
  if (params & grammarParams.yield) {
    parser.expect('yield');
    const delegate = parser.eventually('*');
    return ast.YieldExpression({
      argument: parser.expression(parser.getPrefixPrecedence(parser.get('yield')), params),
      delegate
    });
  }
  return parseIdentifierName(parser, params);
};
export const parseTemplateElement = composeArityTwo(ast.TemplateElement,(parser, params) => {
  const {value: next} = parser.next();
  return {
    value: {
      raw: next.rawValue,
      cooked: next.value
    }
  };
});
export const parseTemplateLiteralExpression = composeArityTwo(ast.TemplateLiteral, (parser, params) => {
  const node = {
    expressions: [],
    quasis: [parseTemplateElement(parser, params)]
  };

  return node;
});

//infix
const asBinaryExpression = type => composeArityFour(type, (parser, params, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator), params),
    operator: operator.value
  };
});
export const parseEqualAssignmentExpression = composeArityFour(ast.AssignmentExpression, (parser, params, left, operator) => {
  const {type} = left;
  if (type === 'ArrayExpression' || type === 'ObjectExpression') {
    toAssignable(left);
  }
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator), params),
    operator: operator.value
  };
});
export const parseAssignmentExpression = asBinaryExpression(ast.AssignmentExpression);
export const parseBinaryExpression = asBinaryExpression(ast.BinaryExpression);
export const parseLogicalExpression = asBinaryExpression(ast.LogicalExpression);
export const parseMemberAccessExpression = composeArityFour(ast.MemberExpression, (parser, params, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    object: left,
    computed: computed,
    property: computed ? parser.expression(-1, params | grammarParams.in) : parseIdentifierName(parser)
  };
  if (computed) {
    parser.expect(']');
  }
  return node;
});
export const parseUpdateExpression = composeArityFour(ast.UpdateExpression, (parser, params, left, operator) => ({
  argument: left,
  operator: operator.value,
  prefix: false
}));
export const parseConditionalExpression = composeArityThree(ast.ConditionalExpression, (parser, params, test) => {
  const node = {
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','), params);
  node.consequent = parser.expression(commaPrecedence, params | grammarParams.in);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence, params);
  return node;
});
export const parseSequenceExpression = composeArityThree(ast.SequenceExpression, (parser, params, left) => {
  let node = left;
  const comma = parser.get(',');
  const next = parser.expression(parser.getInfixPrecedence(comma));
  if (left.type === 'SequenceExpression') {
    left.expressions.push(next);
  } else {
    node = {
      expressions: [left, next]
    };
  }
  return node;
});