import * as ast from './ast';
import {parseBindingIdentifier} from "./expressions";
import {
  parseBlockStatement, parseAssignmentPattern, parseBindingIdentifierOrPattern,
  parseStatementList, parseBindingElement
} from "./statements";
import {composeArityOne, composeArityTwo, grammarParams} from "./utils";
import {parseSpreadExpression, parseRestElement} from "./array";
import {toAssignable} from "./asAssign";
import {categories} from "../../tokenizer/src/tokens";

// "function" parsing is shared across multiple components and deserves its own module to mutualize code more easily:
// - as statement aka function declaration
// - as expression
// - as arrow function (expression)
// - as method (within object or class body)
// - as function call

export const parseFormalParameterList = (parser, params, paramList = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get(')')) {
    return paramList;
  }

  if (next === parser.get('...')) {
    paramList.push(parseRestElement(parser, params));
    return paramList; //rest parameter must be the last
  }

  if (next !== parser.get(',')) {
    paramList.push(parseBindingElement(parser, params));
  } else {
    parser.eat();
    if (parser.eventually(',')) {
      throw new Error('Elision not allowed in function parameters');
    }
  }
  return parseFormalParameterList(parser, paramList);
};
export const asPropertyFunction = (parser, prop) => {
  parser.expect('(');
  const params = parseFormalParameterList(parser);
  parser.expect(')');
  const body = parseBlockStatement(parser);
  return Object.assign(prop, {
    value: ast.FunctionExpression({
      params,
      body
    })
  });
};

const parseParamsAndBody = (parser, params) => {
  parser.expect('(');
  const paramList = parseFormalParameterList(parser, params);
  parser.expect(')');
  parser.expect('{');
  const body = parseStatementList(parser, params | grammarParams.return);
  parser.expect('}');
  return {params: paramList, body};
};
const getNewParams = (asGenerator, params) => {
  let newParams = params;
  if (asGenerator) {
    newParams |= grammarParams.yield;
    newParams &= ~grammarParams.await;
  } else {
    newParams &= ~(grammarParams.yield | grammarParams.await);
  }
  return newParams;
};

//todo check +[default] and module declaration
export const parseFunctionDeclaration = composeArityTwo(ast.FunctionDeclaration, (parser, params) => {
  parser.expect('function');
  const generator = parser.eventually('*');
  const id = parseBindingIdentifier(parser, params);
  const newParams = getNewParams(generator, params);
  return Object.assign({
    id,
    generator
  }, parseParamsAndBody(parser, newParams));
});

//that is a prefix expression
export const parseFunctionExpression = composeArityTwo(ast.FunctionExpression, (parser, params) => {
  parser.expect('function');
  const generator = parser.eventually('*');
  let id = null;
  const {value: nextToken} = parser.lookAhead();
  const newParams = getNewParams(generator, params);
  if (nextToken.type === categories.Identifier) {
    id = parseBindingIdentifier(parser, newParams);
  }
  return Object.assign({id, generator}, parseParamsAndBody(parser, newParams));
});

//arrow function
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

//function call
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

