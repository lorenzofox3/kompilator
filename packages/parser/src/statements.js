export const parseStatementList = (parser, exit = ['}'], statements = []) => {
  const exitTokens = exit.map(s => parser.get(s)); // todo exit is not consistent with expression parser
  const {done, value: nextToken} = parser.lookAhead();
  if (done || exitTokens.includes(nextToken)) {
    return statements;
  }
  statements.push(parseStatement(parser));
  return parseStatementList(parser, exit, statements);
};

const nodeTypeDecorator = (type) => fn => parser => Object.assign(fn(parser), {type});

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

export const parseFunctionDeclaration = parser => {
  parser.expect('function');
  const node = {
    type: 'FunctionDeclaration',
    id: parseBindingIdentifierOrPattern(parser),
    async: false,
    generator: false
  };
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
};

export const parseIfStatement = parser => {
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
    type: 'IfStatement',
    test,
    consequent,
    alternate
  };
};

export const parseBlockStatement = parser => {
  parser.expect('{');
  const node = {
    type: 'BlockStatement',
    body: parseStatementList(parser)
  };
  parser.expect('}');
  return node;
};

export const parseExpressionStatement = parser => {
  const expression = parser.expression();
  return {
    type: 'ExpressionStatement',
    expression: expression
  };
};

export const parseEmptyStatement = nodeTypeDecorator('EmptyStatement')
(parser => {
  parser.expect(';');
  return {};
});

export const parseDebuggerStatement = nodeTypeDecorator('DebuggerStatement')
(parser => {
  parser.expect('debugger');
  return {};
});

export const parseReturnStatement = nodeTypeDecorator('ReturnStatement')
(parser => {
  parser.expect('return');
  return {
    argument: parser.expression()
  };
});

export const parseBreakStatement = nodeTypeDecorator('BreakStatement')
(parser => {
  parser.expect('break');
  return {
    argument: parser.expression(20)
  }
});

export const parseContinueStatement = parser => {
  parser.expect('continue');
  return {
    type: 'ContinueStatement',
    argument: parser.expression(20)
  };
};

export const parseWithStatement = parser => {
  parser.expect('with');
  parser.expect('(');
  const object = parser.expression();
  parser.expect(')');
  return {
    type: 'WithStatement',
    object,
    body: parseStatement(parser)
  };
};

export const parseSwitchStatement = parser => {
  parser.expect('switch');
  parser.expect('(');
  const discriminant = parser.expression();
  parser.expect(')');
  parser.expect('{');
  const cases = parseSwitchCases(parser);
  parser.expect('}');
  return {
    type: 'SwitchStatement',
    discriminant,
    cases
  };
};

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

export const parseThrowStatement = parser => {
  parser.expect('throw');
  const node = {
    type: 'ThrowStatement',
    expression: parser.expression()
  };
  return node;
};

export const parseTryStatement = parser => {
  parser.expect('try');
  const node = {type: 'TryStatement', block: parseBlockStatement(parser), handler: null, finalizer: null};
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
};

export const parseWhileStatement = parser => {
  parser.expect('while');
  parser.expect('(');
  const node = {
    type: 'WhileStatement',
    test: parser.expression()
  };
  parser.expect(')');
  node.body = parseStatement(parser);
  return node;
};

export const parseDoWhileStatement = parser => {
  parser.expect('do');
  const node = {
    type: 'DoWhileStatement',
    body: parseStatement(parser)
  };
  parser.expect('while');
  parser.expect('(');
  node.test = parser.expression();
  parser.expect(')');
  return node;
};

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

export const parseVariableStatement = parser => {
  parser.expect('var');
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: parseVariableDeclarators(parser)
  };
};

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
    startExpression = parseVariableStatement(parser);
  } else {
    startExpression = parser.expression(-1, [parser.get('in'), parser.get('of')]);
  }
  const derivation = getForDerivation(parser);
  node = derivation(parser, startExpression);
  parser.expect(')');
  node.body = parseStatement(parser);
  return node;
};

export const parseLabeledStatement = parser => {
  const node = {
    type: 'LabeledStatement',
    label: parser.expression(20)
  };
  parser.expect(':');
  node.body = parseStatement(parser);
  return node;
};



