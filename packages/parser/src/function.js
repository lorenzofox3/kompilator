import * as ast from './ast';
import {
  parseBlockStatement, parseBindingIdentifier, parseBindingElement
} from "./statements";
import {composeArityThree, composeArityTwo, grammarParams} from "./utils";
import {parseSpreadExpression, parseRestElement} from "./array";
import {toAssignable} from "./asAssign";
import {categories} from "../../tokenizer/src/tokens";
import {parsePropertyName} from "./object";

// "function" parsing is shared across multiple components and deserves its own module to mutualize code more easily:
// - as statement aka function declaration
// - as expression
// - as arrow function (expression)
// - as method (within object or class body)
// - as function call

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

export const parseFormalParameterList = (parser, params, paramList = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get(')')) {
    return paramList;
  }

  if (next === parser.get('...')) {
    paramList.push(parseRestElement(parser, params));
    return paramList; //rest parameter must be the last
  }

  if (parser.eventually(',')) {
    if (parser.eventually(',')) {
      throw new Error('Elision not allowed in function parameters');
    }
  } else {
    paramList.push(parseBindingElement(parser, params));
  }

  return parseFormalParameterList(parser, params, paramList);
};
export const asPropertyFunction = (parser, params, prop) => {
  parser.expect('(');
  const paramList = parseFormalParameterList(parser, params);
  parser.expect(')');
  const body = parseBlockStatement(parser, params);
  return Object.assign(prop, {
    value: ast.FunctionExpression({
      params: paramList,
      body
    })
  });
};
export const parseClassMethod = composeArityTwo(ast.MethodDefinition, (parser, params) => {
  const isStatic = parser.eventually('static');
  const asGenerator = parser.eventually('*');
  const newParams = getNewParams(asGenerator, params);

  const {value: next} = parser.lookAhead();
  const {value: secondNext} = parser.lookAhead(1);
  let kind = 'method';

  if ((next === parser.get('get') || next === parser.get('set')) && secondNext !== parser.get('(')) {
    const {value: accessor} = parser.eat();
    kind = accessor.value;
  }

  const prop = parsePropertyName(parser, params);
  kind = prop.key.name === 'constructor' ? 'constructor' : kind;
  return Object.assign(asPropertyFunction(parser, newParams, prop), {static: isStatic, kind});
});

const parseParamsAndBody = (parser, params) => {
  parser.expect('(');
  const paramList = parseFormalParameterList(parser, params);
  parser.expect(')');
  const body = parseBlockStatement(parser, params | grammarParams.return);
  return {params: paramList, body};
};

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
const asFormalParameters = (node) => {
  if (node === null) {
    return [];
  }
  return node.type === 'SequenceExpression' ? [...node].map(toAssignable) : [toAssignable(node)];
};
export const parseArrowFunctionExpression = composeArityThree(ast.ArrowFunctionExpression, (parser, params, left) => {
  const paramList = asFormalParameters(left, params);
  const newParams = getNewParams(false, params);
  const {value: next} = parser.lookAhead();
  const body = next === parser.get('{') ? parseBlockStatement(parser, newParams | grammarParams.return) : parser.expression(-1, newParams);
  return {
    params: paramList,
    body
  };
});

//function call
//that is an infix expression
const parseFunctionCallArguments = (parser, params, expressions = []) => {
  const {value: next} = parser.lookAhead();
  const comma = parser.get(',');

  if (next === parser.get(')')) {
    return expressions;
  }

  if (next === parser.get('...')) {
    expressions.push(parseSpreadExpression(parser, params));
  } else if (parser.eventually(',')) {
    if (parser.eventually(',')) {
      throw new Error('no elision allowed in function call parameters');
    }
  } else {
    expressions.push(parser.expression(parser.getInfixPrecedence(comma), params | grammarParams.in));
  }
  return parseFunctionCallArguments(parser, params, expressions);
};

export const parseCallExpression = composeArityThree(ast.CallExpression, (parser, params, callee) => {
  const node = {
    callee,
    arguments: parseFunctionCallArguments(parser, params)
  };
  parser.expect(')');
  return node;
});