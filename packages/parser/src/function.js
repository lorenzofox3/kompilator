import * as ast from './ast';
import {parseBindingIdentifier} from "./expressions";
import {parseBlockStatement, parseAssignmentPattern, parseBindingIdentifierOrPattern} from "./statements";
import {composeArityOne, composeArityTwo} from "./utils";
import {parseSpreadExpression, parseRestElement} from "./array";
import {toAssignable} from "./asAssign";

// "function" parsing is shared across multiple components and deserves its own module to mutualize code more easily:
// - as statement aka function declaration
// - as expression
// - as arrow function (expression)
// - as method (within object or class body)
// - as function call

export const parseFormalParameters = (parser, parameters = []) => {
  const {value: next} = parser.lookAhead();
  const comma = parser.get(',');

  if (next === parser.get(')')) {
    return parameters;
  }

  if (next === parser.get('...')) {
    parameters.push(parseRestElement(parser));
    return parameters; //rest parameter must be the last
  }

  //todo no elision & defaultParameters must be last ...
  if (next !== comma) {
    let param = parseBindingIdentifierOrPattern(parser);
    if (parser.eventually('=')) {
      param = parseAssignmentPattern(parser, param);
    }
    parameters.push(param);
  } else {
    parser.eat();
  }
  return parseFormalParameters(parser, parameters);
};
export const asPropertyFunction = (parser, prop) => {
  parser.expect('(');
  const params = parseFormalParameters(parser);
  parser.expect(')');
  const body = parseBlockStatement(parser);
  return Object.assign(prop, {
    value: ast.FunctionExpression({
      params,
      body
    })
  });
};

const parseParamsAndBody = parser => {
  parser.expect('(');
  const params = parseFormalParameters(parser);
  parser.expect(')');
  const body = parseBlockStatement(parser);
  return {params, body};
};
export const parseFunctionDeclaration = composeArityOne(ast.FunctionDeclaration, parser => {
  parser.expect('function');
  const generator = parser.eventually('*');
  const id = parseBindingIdentifier(parser);
  return Object.assign({
    id,
    generator
  }, parseParamsAndBody(parser));
});

//that is a prefix expression
export const parseFunctionExpression = composeArityOne(ast.FunctionExpression, parser => {
  parser.expect('function');
  const generator = parser.eventually('*');
  let id = null;
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('(')) {
    id = parseBindingIdentifier(parser);
  }
  return Object.assign({id, generator}, parseParamsAndBody(parser));
});

//todo we might want to process "parenthesized" expression instead. ie this parser will parse {a},b => a+b whereas it is invalid
const asFormalParameters = (node) => {
  if (node === null) {
    return []
  }
  return node.type === 'SequenceExpression' ? [...node].map(toAssignable) : [toAssignable(node)];
};

export const parseArrowFunctionExpression = composeArityTwo(ast.ArrowFunctionExpression, (parser, left) => {
  const params = asFormalParameters(left);
  const {value: next} = parser.lookAhead();
  const body = next === parser.get('{') ? parseBlockStatement(parser) : parser.expression();
  return {
    params,
    body
  };
});

//that is an infix expression
const parseFunctionCallArguments = (parser, expressions = []) => {
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
  return parseFunctionCallArguments(parser, expressions);
};
export const parseCallExpression = composeArityTwo(ast.CallExpression, (parser, callee) => {
  const node = {
    callee,
    arguments: parseFunctionCallArguments(parser)
  };
  parser.expect(')');
  return node;
});

