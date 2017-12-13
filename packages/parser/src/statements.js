import * as ast from './ast';
import {parseBindingIdentifier} from "./expressions";
import {composeArityTwo, withEventualSemiColon} from "./utils";
import {parseArrayBindingPattern} from "./array";
import {parseObjectBindingPattern} from "./object";
import {parseExportDeclaration, parseImportDeclaration} from "./module";

// statements
// Note: Function declarations,class declarations, array and object binding pattern are in they own files

const Statement = (factory, fn) => {
  if (!fn) {
    return factory;
  } else {
    return composeArityTwo(factory, fn);
  }
};

export const parseStatementList = (parser, exit = ['}'], statements = []) => {
  const exitTokens = exit.map(s => parser.get(s));
  const {done, value: nextToken} = parser.lookAhead();
  if (done || exitTokens.includes(nextToken)) {
    return statements;
  }
  statements.push(parseStatement(parser));
  return parseStatementList(parser, exit, statements);
};

const parseImport = withEventualSemiColon(parseImportDeclaration);
const parseExport = withEventualSemiColon(parseExportDeclaration);
export const parseModuleItemList = (parser, items = []) => {
  const {done, value: nextToken} = parser.lookAhead();

  if (done) {
    return items;
  }

  if (nextToken === parser.get('import')) {
    items.push(parseImport(parser));
  } else if (nextToken === parser.get('export')) {
    items.push(parseExport(parser));
  } else {
    items.push(parseStatement(parser));
  }
  return parseModuleItemList(parser, items);
};

export const parseExpressionStatement = Statement(ast.ExpressionStatement, parser => ({
  expression: parser.expression()
}));

const parseExpression = withEventualSemiColon(parseExpressionStatement);
export const parseStatement = (parser) => {
  const {value: nextToken} = parser.lookAhead();
  return parser.hasStatement(nextToken) ? parser.getStatement(nextToken)(parser) : parseExpression(parser);
};

export const parseIfStatement = Statement(ast.IfStatement, parser => {
  parser.expect('if');
  parser.expect('(');
  const test = parser.expression();
  parser.expect(')');
  const consequent = parseStatement(parser);
  let alternate = null;
  if (parser.eventually('else')) {
    alternate = parseStatement(parser);
  }
  return {
    test,
    consequent,
    alternate
  };
});

export const parseBlockStatement = Statement(ast.BlockStatement, parser => {
  parser.expect('{');
  const node = {
    body: parseStatementList(parser)
  };
  parser.expect('}');
  return node;
});

export const parseExpressionOrLabeledStatement = parser => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser) : parseExpression(parser);
};

export const parseEmptyStatement = Statement(ast.EmptyStatement, parser => {
  parser.expect(';');
});

export const parseDebuggerStatement = Statement(ast.DebuggerStatement);

export const parseReturnStatement = Statement(ast.ReturnStatement, parser => {
  parser.expect('return');
  return {
    argument: parser.expression()
  };
});

export const parseBreakStatement = Statement(ast.BreakStatement, parser => {
  parser.expect('break');
  return {
    label: parser.expression(20)
  };
});

export const parseContinueStatement = Statement(ast.ContinueStatement, parser => {
  parser.expect('continue');
  return {
    label: parser.expression(20)
  };
});

export const parseWithStatement = Statement(ast.WithStatement, parser => {
  parser.expect('with');
  parser.expect('(');
  const object = parser.expression();
  parser.expect(')');
  return {
    object,
    body: parseStatement(parser)
  };
});

export const parseSwitchStatement = Statement(ast.SwitchStatement, parser => {
  parser.expect('switch');
  parser.expect('(');
  const discriminant = parser.expression();
  parser.expect(')');
  parser.expect('{');
  const cases = parseSwitchCases(parser);
  parser.expect('}');
  return {
    discriminant,
    cases
  };
});

export const parseSwitchCases = (parser, cases = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('case') && nextToken !== parser.get('default')) {
    return cases;
  }
  parser.eat();
  cases.push(parseSwitchCase(parser, nextToken));
  return parseSwitchCases(parser, cases);
};

export const parseSwitchCase = Statement(ast.SwitchCase, (parser, nextToken) => {
  const node = {
    test: nextToken === parser.get('case') ? parser.expression() : null
  };
  parser.expect(':');
  node.consequent = parseStatementList(parser, ['}', 'case', 'default']);
  return node;
});

export const parseThrowStatement = Statement(ast.ThrowStatement, parser => {
  parser.expect('throw');
  return {
    argument: parser.expression()
  };
});

export const parseTryStatement = Statement(ast.TryStatement, parser => {
  parser.expect('try');
  const node = {block: parseBlockStatement(parser), handler: null, finalizer: null};
  if (parser.eventually('catch')) {
    const handler = {type: 'CatchClause'};
    parser.expect('(');
    handler.param = parser.expression();
    parser.expect(')');
    handler.body = parseBlockStatement(parser);
    node.handler = handler;
  }
  if (parser.eventually('finally')) {
    node.finalizer = parseBlockStatement(parser);
  }
  return node;
});

export const parseWhileStatement = Statement(ast.WhileStatement, parser => {
  parser.expect('while');
  parser.expect('(');
  const node = {
    test: parser.expression()
  };
  parser.expect(')');
  node.body = parseStatement(parser);
  return node;
});

export const parseDoWhileStatement = Statement(ast.DoWhileStatement, parser => {
  parser.expect('do');
  const node = {
    body: parseStatement(parser)
  };
  parser.expect('while');
  parser.expect('(');
  node.test = parser.expression();
  parser.expect(')');
  return node;
});

export const parseAssignmentPattern = Statement(ast.AssignmentPattern, (parser, left) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(parser.get(',')))
  };
});

export const parseBindingIdentifierOrPattern = parser => {
  const {value: next} = parser.lookAhead();
  if (parser.get('{') === next) {
    return parseObjectBindingPattern(parser);
  } else if (parser.get('[') === next) {
    return parseArrayBindingPattern(parser);
  }
  return parseBindingIdentifier(parser);
};

const asVariableDeclaration = (keyword = 'var') => Statement(ast.VariableDeclaration, parser => {
  parser.expect(keyword);
  return {
    kind: keyword,
    declarations: parseVariableDeclarators(parser)
  };
});
const parseVariableDeclarator = Statement(ast.VariableDeclarator, (parser) => {
  const comma = parser.get(',');
  const node = {id: parseBindingIdentifierOrPattern(parser), init: null};
  if (parser.eventually('=')) {
    node.init = parser.expression(parser.getInfixPrecedence(comma));
  }
  return node;
});
export const parseVariableDeclarators = (parser, declarators = []) => {
  const node = parseVariableDeclarator(parser);
  const comma = parser.get(',');
  const {value: nextToken} = parser.lookAhead();

  declarators.push(node);

  if (nextToken !== comma) {
    return declarators;
  }
  parser.eat();
  return parseVariableDeclarators(parser, declarators);
};
export const parseVariableDeclaration = asVariableDeclaration();
export const parseConstDeclaration = asVariableDeclaration('const');
export const parseLetDeclaration = asVariableDeclaration('let');

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

const asFor = Statement(ast.ForStatement, (parser, init) => {
  parser.expect(';');
  const n = {
    init,
    test: parser.expression()
  };
  parser.expect(';');
  n.update = parser.expression();
  return n;
});
const asForIn = Statement(ast.ForInStatement, (parser, left) => {
  parser.expect('in');
  return {
    left,
    right: parser.expression()
  };
});
const asForOf = Statement(ast.ForOfStatement, (parser, left) => {
  parser.expect('of');
  return {
    left,
    right: parser.expression()
  };
});

//todo does not seem to fit all cases
export const parseForStatement = parser => {
  parser.expect('for');
  parser.expect('(');
  const {value: token} = parser.lookAhead();
  let startExpression, node;
  if (token === parser.get('var')) {
    startExpression = parseVariableDeclaration(parser);
  } else if (token === parser.get('const')) {
    startExpression = parseConstDeclaration(parser);
  } else if (token === parser.get('let')) {
    startExpression = parseLetDeclaration(parser);
  } else {
    startExpression = parser.expression(-1, [parser.get('in'), parser.get('of')]); //"in" is not an operator here !
  }
  const derivation = getForDerivation(parser);
  node = derivation(parser, startExpression);
  parser.expect(')');
  node.body = parseStatement(parser);
  return node;
};

export const parseLabeledStatement = Statement(ast.LabeledStatement, parser => {
  const node = {
    label: parser.expression(20)
  };
  parser.expect(':');
  node.body = parseStatement(parser);
  return node;
});