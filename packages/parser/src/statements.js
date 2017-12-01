import * as ast from './ast';

const Statement = (factory, fn) => {
  if (!fn) {
    return factory;
  } else {
    return parser => factory(fn(parser));
  }
};

export const parseStatementList = (parser, exit = ['}'], statements = []) => {
  const exitTokens = exit.map(s => parser.get(s)); // todo exit is not consistent with expression parser
  const {done, value: nextToken} = parser.lookAhead();
  if (done || exitTokens.includes(nextToken)) {
    return statements;
  }
  statements.push(parseStatement(parser));
  return parseStatementList(parser, exit, statements);
};
export const withEventualSemiColon = (fn) => parser => {
  const node = fn(parser);
  parser.eventually(';');
  return node;
};
export const parseExpressionOrLabeledStatement = parser => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser) : withEventualSemiColon(parseExpressionStatement)(parser);
};
export const parseStatement = (parser) => {
  parser.allowRegexp();
  const {value: nextToken} = parser.lookAhead();
  return parser.hasStatement(nextToken) ? parser.getStatement(nextToken)(parser) : withEventualSemiColon(parseExpressionStatement)(parser);
};

export const parseFormalParameters = (parser, parameters = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === parser.get(')')) {
    return parameters;
  }

  if (nextToken !== parser.get(',')) {
    parameters.push(parser.expression(20));
  } else {
    parser.eat();
  }
  return parseFormalParameters(parser, parameters);
};
export const parseFunctionDeclaration = Statement(ast.FunctionDeclaration, parser => {
  parser.expect('function');
  const node = {
    id: parseBindingIdentifierOrPattern(parser),
    async: false,
    generator: false
  };
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
});

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

export const parseExpressionStatement = Statement(ast.ExpressionStatement, parser => ({
  expression: parser.expression()
}));

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

export const parseSwitchCase = (parser, nextToken) => {
  const {type} = nextToken;
  const node = {
    type: 'SwitchCase',
    test: type === parser.get('case') ? parser.expression() : null
  };
  parser.expect(':');
  node.consequent = parseStatementList(parser, ['}', 'case', 'default']);
  return node;
};

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

//todo
export const parseBindingIdentifierOrPattern = parser => {
  return parser.expression(20);
};

export const parseVariableDeclarators = (parser, declarators = []) => {
  const id = parseBindingIdentifierOrPattern(parser);
  let {value: nextToken} = parser.lookAhead();
  let init = null;
  const node = {
    type: 'VariableDeclarator',
    id: id
  };

  const comma = parser.get(',');
  if (parser.eventually('=')) {
    init = parser.expression(parser.getInfixPrecedence(comma));
    nextToken = parser.lookAhead().value;
  }

  node.init = init;

  declarators.push(node);

  if (nextToken !== comma) {
    return declarators;
  }

  parser.eat();

  return parseVariableDeclarators(parser, declarators);
};

export const parseVariableDeclaration = Statement(ast.VariableDeclaration, parser => {
  parser.expect('var');
  return {
    kind: 'var',
    declarations: parseVariableDeclarators(parser)
  };
});

const getForDerivation = parser => {
  const {value: nextToken} = parser.lookAhead();
  switch (nextToken.type) {
    case parser.get('in'):
      return asForIn;
    case parser.get('of'):
      return asForOf;
    default:
      return asFor;
  }
};
const asForIn = (parser, left) => {
  parser.expect('in');
  const n = {
    type: 'ForInStatement',
    left
  };
  n.right = parser.expression();
  return n;
};
const asFor = (parser, init) => {
  parser.expect(';');
  const n = {
    type: 'ForStatement',
    init,
    test: parser.expression()
  };
  parser.expect(';');
  n.update = parser.expression();
  return n;
};

//todo
const asForOf = (parser, init) => {
  parser.expect('of');
  return {};
};

export const parseForStatement = parser => {
  parser.expect('for');
  parser.expect('(');
  const {value: token} = parser.lookAhead();
  let startExpression, node;
  if (token === parser.get('var')) {
    startExpression = parseVariableDeclaration(parser);
  } else {
    startExpression = parser.expression(-1, [parser.get('in'), parser.get('of')]);
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



