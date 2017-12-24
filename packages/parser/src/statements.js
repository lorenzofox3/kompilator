import * as ast from './ast';
import {composeArityThree, composeArityTwo, grammarParams, withEventualSemiColon} from "./utils";
import {parseArrayBindingPattern} from "./array";
import {parseObjectBindingPattern} from "./object";
import {parseExportDeclaration, parseImportDeclaration} from "./module";
import {categories} from "../../tokenizer/src/tokens";
import {toAssignable} from "./asAssign";

// statements
// Note: Function declarations,class declarations, array and object binding pattern are in they own files

// statement list and blocks
const needToBreak = (parser, nextToken) => !(parser.hasStatement(nextToken) || parser.hasPrefix(nextToken)) || nextToken === parser.get('case') || nextToken === parser.get('default');
export const parseStatementList = (parser, params, statements = []) => {
  const {done, value: nextToken} = parser.lookAhead();
  // we break if stream is done or next token does not imply a statement
  // note1: we check for expression statement as well by checking whether the next token matches an expression prefix
  // note2: we break on "case" and "default" as well as they can't be used to start a new Statement, neither a Declaration neither an identifier in expression
  if (done || needToBreak(parser, nextToken)) {
    return statements;
  }
  statements.push(parseStatement(parser, params));
  return parseStatementList(parser, params, statements);
};
export const parseBlockStatement = composeArityTwo(ast.BlockStatement, (parser, params) => {
  parser.expect('{');
  const node = {
    body: parseStatementList(parser, params)
  };
  parser.expect('}');
  return node;
});
export const parseStatement = (parser, params) => {
  const {value: nextToken} = parser.lookAhead();
  const isReturnAsExpression = (nextToken === parser.get('return') && !(params & grammarParams.return));
  if (!parser.hasStatement(nextToken) || isReturnAsExpression) {
    return parseExpression(parser, params);
  }
  let newParams = params;
  switch (nextToken) {
    case parser.get('function'):
    case parser.get('class'):
    case parser.get('async'):
      newParams &= ~grammarParams.default;
      break;
    case parser.get('let'):
    case parser.get('const'):
      newParams |= grammarParams.in;
      break;
  }
  const statement = parser.getStatement(nextToken);
  return statement(parser, newParams);
};

// module highest level statements
const parseImport = withEventualSemiColon(parseImportDeclaration);
const parseExport = withEventualSemiColon(parseExportDeclaration);
export const parseModuleItemList = (parser, params, items = []) => {
  const {done, value: nextToken} = parser.lookAhead();

  if (done) {
    return items;
  }

  switch (nextToken) {
    case parser.get('import'):
      items.push(parseImport(parser, params));
      break;
    case parser.get('export'):
      items.push(parseExport(parser, params));
      break;
    default:
      items.push(parseStatement(parser, params));
  }
  return parseModuleItemList(parser, params, items);
};

// variables
const parseVariableDeclarator = composeArityTwo(ast.VariableDeclarator, (parser, params) => {
  const comma = parser.get(',');
  const node = {id: parseBindingIdentifierOrPattern(parser, params), init: null};
  if (parser.eventually('=')) {
    node.init = parser.expression(parser.getInfixPrecedence(comma), params);
  }
  return node;
});
const parseVariableDeclarators = (parser, params, declarators = []) => {
  const node = parseVariableDeclarator(parser, params);
  const comma = parser.get(',');
  const {value: nextToken} = parser.lookAhead();

  declarators.push(node);

  if (nextToken !== comma) {
    return declarators;
  }
  parser.eat();
  return parseVariableDeclarators(parser, params, declarators);
};
const variableDeclaration = (keyword = 'var') => {
  const modifier = keyword === 'var' ? grammarParams.in : 0;
  return composeArityTwo(ast.VariableDeclaration, (parser, params) => {
    parser.expect(keyword);
    return {
      kind: keyword,
      declarations: parseVariableDeclarators(parser, params | modifier)
    };
  });
};
export const parseVariableDeclaration = variableDeclaration('var');
export const parseConstDeclaration = variableDeclaration('const');
export const parseLetDeclaration = variableDeclaration('let');

export const parseEmptyStatement = parser => {
  parser.expect(';');
  return ast.EmptyStatement();
};

// expression
export const parseExpressionStatement = composeArityTwo(ast.ExpressionStatement, (parser, params) => ({
  expression: parser.expression(-1, params | grammarParams.in)
}));
const parseExpression = withEventualSemiColon(parseExpressionStatement);

export const parseIfStatement = composeArityTwo(ast.IfStatement, (parser, params) => {
  parser.expect('if');
  parser.expect('(');
  const test = parser.expression(-1, params | grammarParams.in);
  parser.expect(')');
  const consequent = parseStatement(parser, params);
  let alternate = null;
  if (parser.eventually('else')) {
    alternate = parseStatement(parser, params);
  }
  return {
    test,
    consequent,
    alternate
  };
});

export const parseExpressionOrLabeledStatement = (parser, params) => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser, params) : parseExpression(parser, params);
};

export const parseDoWhileStatement = composeArityTwo(ast.DoWhileStatement, (parser, params) => {
  parser.expect('do');
  const node = {
    body: parseStatement(parser, params)
  };
  parser.expect('while');
  parser.expect('(');
  node.test = parser.expression(-1, params | grammarParams.in);
  parser.expect(')');
  return node;
});

export const parseWhileStatement = composeArityTwo(ast.WhileStatement, (parser, params) => {
  parser.expect('while');
  parser.expect('(');
  const node = {
    test: parser.expression(-1, params | grammarParams.in)
  };
  parser.expect(')');
  node.body = parseStatement(parser, params);
  return node;
});

//for
const getForDerivation = parser => {
  const {value: nextToken} = parser.lookAhead();
  switch (nextToken) {
    case parser.get('in'):
      return asForIn;
    case parser.get('of'):
      return asForOf;
    default:
      return asFor;
  }
};
const asFor = composeArityThree(ast.ForStatement, (parser, params, init) => {
  parser.expect(';');
  const n = {
    init,
    test: parser.expression(-1, params | grammarParams.in)
  };
  parser.expect(';');
  n.update = parser.expression(-1, params | grammarParams.in);
  return n;
});
const asForIn = composeArityThree(ast.ForInStatement, (parser, params, left) => {
  parser.expect('in');
  return {
    left,
    right: parser.expression(-1, params | grammarParams.in)
  };
});
const asForOf = composeArityThree(ast.ForOfStatement, (parser, params, left) => {
  parser.expect('of');
  return {
    left,
    right: parser.expression(-1, params | grammarParams.in)
  };
});
const getForLeftSide = (parser, params) => {
  const {value: nextToken} = parser.lookAhead();
  switch (nextToken) {
    case parser.get('var'):
    case parser.get('const'):
    case parser.get('let'):
      return variableDeclaration(nextToken.value)(parser, params & ~grammarParams.in);
  }
  return parser.expression(-1, params & ~grammarParams.in);
};
export const parseForStatement = (parser, params) => {
  parser.expect('for');
  parser.expect('(');
  const startExpression = getForLeftSide(parser, params);
  const derivation = getForDerivation(parser);
  const node = derivation(parser, params, startExpression);
  parser.expect(')');
  node.body = parseStatement(parser, params);
  return node;
};

//switch
const parseCaseClause = composeArityTwo(ast.SwitchCase, (parser, params) => {
  parser.expect('case');
  const test = parser.expression(-1, params | grammarParams.in);
  parser.expect(':');
  return {
    test,
    consequent: parseStatementList(parser, params)
  };
});
const parseDefaultClause = composeArityTwo(ast.SwitchCase, (parser, params) => {
  parser.expect('default');
  parser.expect(':');
  return {
    test: null,
    consequent: parseStatementList(parser, params)
  };
});
export const parseSwitchCases = (parser, params, cases = []) => {
  const {value: nextToken} = parser.lookAhead();

  if (nextToken === parser.get('}')) {
    return cases;
  }

  if (nextToken === parser.get('default')) {
    cases.push(parseDefaultClause(parser, params));
    return cases;
  }

  cases.push(parseCaseClause(parser, params));
  return parseSwitchCases(parser, params, cases);
};
export const parseSwitchStatement = composeArityTwo(ast.SwitchStatement, (parser, params) => {
  parser.expect('switch');
  parser.expect('(');
  const discriminant = parser.expression(-1, params | grammarParams.in);
  parser.expect(')');
  parser.expect('{');
  const cases = parseSwitchCases(parser, params);
  parser.expect('}');
  return {
    discriminant,
    cases
  };
});

const parseLabelIdentifier = composeArityTwo(ast.Identifier, (parser, params) => {
  const newParams = params & ~(grammarParams.yield | grammarParams.await);
  return parseBindingIdentifier(parser, newParams);
});
const withLabel = (keyword, factory) => composeArityTwo(factory, (parser, params) => {
  parser.expect(keyword);
  const {value: next} = parser.lookAhead();
  const label = parser.hasPrefix(next) ? parseLabelIdentifier(parser, params) : null;
  return {
    label
  };
});
export const parseLabeledStatement = composeArityTwo(ast.LabeledStatement, (parser, params) => {
  const node = {
    label: parseLabelIdentifier(parser, params)
  };
  parser.expect(':');
  node.body = parseStatement(parser, params & ~grammarParams.default);
  return node;
});
export const parseBreakStatement = withLabel('break', ast.BreakStatement);
export const parseContinueStatement = withLabel('continue', ast.ContinueStatement);

export const parseReturnStatement = composeArityTwo(ast.ReturnStatement, (parser, params) => {
  parser.expect('return');
  return {
    argument: parser.expression(-1, params | grammarParams.in)
  };
});

export const parseWithStatement = composeArityTwo(ast.WithStatement, (parser, params) => {
  parser.expect('with');
  parser.expect('(');
  const object = parser.expression(-1, params | grammarParams.in);
  parser.expect(')');
  return {
    object,
    body: parseStatement(parser, params)
  };
});

export const parseThrowStatement = composeArityTwo(ast.ThrowStatement, (parser, params) => {
  parser.expect('throw');
  return {
    argument: parser.expression(-1, params | grammarParams.in)
  };
});

export const parseTryStatement = composeArityTwo(ast.TryStatement, (parser, params) => {
  parser.expect('try');
  const node = {block: parseBlockStatement(parser, params), handler: null, finalizer: null};
  if (parser.eventually('catch')) {
    const handler = {type: 'CatchClause'};
    parser.expect('(');
    handler.param = parseBindingIdentifierOrPattern(parser, params);
    parser.expect(')');
    handler.body = parseBlockStatement(parser, params);
    node.handler = handler;
  }
  if (parser.eventually('finally')) {
    node.finalizer = parseBlockStatement(parser);
  }
  return node;
});

export const parseDebuggerStatement = parser => {
  parser.expect('debugger');
  return ast.DebuggerStatement();
};

// identifiers and bindings
export const parseBindingElement = (parser, params) => {
  const binding = parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    return ast.AssignmentPattern({
      left: binding,
      right: parser.expression(-1, params | grammarParams.in)
    });
  }
  return binding;
};
export const parseBindingIdentifierOrPattern = (parser, params) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('[')) {
    return parseArrayBindingPattern(parser, params);
  } else if (next === parser.get('{')) {
    return parseObjectBindingPattern(parser, params);
  }
  return parseBindingIdentifier(parser, params);
};
export const parseBindingIdentifier = composeArityTwo(ast.Identifier, (parser, params) => {
  const identifier = parseIdentifierName(parser, params);
  if (parser.isReserved(identifier.name)) {
    throw new Error(`can not use reseved word  ${identifier.name} as binding identifier`);
  }
  return identifier;
});
export const parseIdentifierName = composeArityTwo(ast.Identifier, (parser, params) => {
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  parser.eat();
  return {
    name: next.value
  };
});
export const parseAssignmentPattern = composeArityThree(ast.AssignmentPattern, (parser, params, left) => ({
  left,
  right: parser.expression(parser.getInfixPrecedence(parser.get(',')), params)
}));