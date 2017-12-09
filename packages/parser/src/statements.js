import * as ast from './ast';
import {parseIdentifierExpression} from "./expressions"
import {parseArrayElision, asPropertyFunction, parsePropertyName} from "./utils";
import {categories} from "../../tokenizer/src/tokens";

//todo see todo expressions Prefix / Infix Cominator
const Statement = (factory, fn) => {
  if (!fn) {
    return factory;
  } else {
    return (a, b) => factory(fn(a, b));
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
  const {value: next} = parser.lookAhead();
  const comma = parser.get(',');

  if (next === parser.get(')')) {
    return parameters;
  }

  if (next === parser.get('...')) {
    parameters.push(parseRestElement(parser));
    return parameters; //rest parameter must be the last
  }

  //todo no elision & defaultParameters must be lasts ...
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
export const parseFunctionDeclaration = Statement(ast.FunctionDeclaration, parser => {
  parser.expect('function');
  const node = {
    id: parseIdentifierExpression(parser),
    async: false,
    generator: false
  };
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
});

const parseClassMethod = Statement(ast.MethodDefinition, (parser) => {
  const isStatic = parser.eventually('static');
  const {value: next} = parser.lookAhead();
  const {value: secondNext} = parser.lookAhead(1);
  let prop;

  if (next === parser.get('get') || next === parser.get('set')) {
    if (secondNext !== parser.get('(')) {
      const {value: accessor} = parser.eat();
      prop = Object.assign(parsePropertyName(parser), {kind: accessor.rawValue});
    } else {
      prop = {
        key: parseIdentifierExpression(parser),
        computed: false
      }
    }
  }

  prop = prop !== void 0 ? prop : parsePropertyName(parser);

  if (prop.kind === void 0) {
    prop.kind = prop.key.name === 'constructor' ? 'constructor' : 'method';
  }

  return Object.assign(asPropertyFunction(parser, prop), {static: isStatic});
});
const parseClassElementList = (parser, elements = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return elements;
  }
  if (next !== parser.get(';')) {
    elements.push(parseClassMethod(parser));
  } else {
    parser.eat();
  }
  return parseClassElementList(parser, elements);
};
export const parseClassBody = Statement(ast.ClassBody, parser => {
  parser.expect('{');
  const node = {
    body: parseClassElementList(parser)
  };
  parser.expect('}');
  return node;
});
export const parseClassDeclaration = Statement(ast.Class, parser => {
  parser.expect('class');
  let superClass = null;
  const id = parseIdentifierExpression(parser);
  if (parser.eventually('extends')) {
    superClass = parser.expression();
  }

  return {
    id,
    superClass,
    body: parseClassBody(parser)
  };
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

export const parseSwitchCase = Statement(ast.SwitchCase, (parser, nextToken) => {
  const {type} = nextToken;
  const node = {
    test: type === parser.get('case') ? parser.expression() : null
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
export const parseRestElement = Statement(ast.RestElement, parser => {
  parser.expect('...');
  return {
    argument: parseBindingIdentifierOrPattern(parser)
  }
});

const parseArrayElements = (parser, elements = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get(']')) {
    return elements;
  }

  if (next === parser.get('...')) {
    elements.push(parseRestElement(parser));
    parser.eventually(',');
    return parseArrayElements(parser, elements);
  }

  if (next === parser.get(',')) {
    parseArrayElision(parser, elements);
    return parseArrayElements(parser, elements)
  }

  let element = parseBindingIdentifierOrPattern(parser);
  if (parser.eventually('=')) {
    element = parseAssignmentPattern(parser, element);
  }
  elements.push(element);
  parser.eventually(',');

  return parseArrayElements(parser, elements);
};
const parseArrayBindingPattern = Statement(ast.ArrayPattern, parser => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
});

const parseSingleNameBindingProperty = parser => {
  const key = parseIdentifierExpression(parser);
  let value = key;
  let shorthand = false;
  if (parser.eventually(':')) {
    value = parseBindingIdentifierOrPattern(parser);
  } else {
    shorthand = true;
    value = key;
  }

  if (parser.eventually('=')) {
    value = parseAssignmentPattern(parser, value);
  }
  return {shorthand, key, value};
};
const parsePropertyNameProperty = parser => {
  const property = parsePropertyName(parser);
  parser.expect(':');
  return Object.assign(property, {
    value: parseBindingIdentifierOrPattern(parser)
  });
};
const parseBindingProperty = parser => {
  const {value: next} = parser.lookAhead();
  const property = ast.Property({});
  return next.type === categories.Identifier ? //identifier but not reserved word
    Object.assign(property, parseSingleNameBindingProperty(parser)) :
    Object.assign(property, parsePropertyNameProperty(parser));
};
const parseBindingPropertyList = (parser, properties = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return properties;
  }
  if (next !== parser.get(',')) {
    properties.push(parseBindingProperty(parser));
  } else {
    parser.eat(); //todo elision not allowed
  }
  return parseBindingPropertyList(parser, properties);
};
const parseObjectBindingPattern = Statement(ast.ObjectPattern, parser => {
  parser.expect('{');
  const node = {
    properties: parseBindingPropertyList(parser)
  };
  parser.expect('}');
  return node;
});

export const parseBindingIdentifierOrPattern = parser => {
  const {value: next} = parser.lookAhead();
  if (parser.get('{') === next) {
    return parseObjectBindingPattern(parser);
  } else if (parser.get('[') === next) {
    return parseArrayBindingPattern(parser);
  }
  return parseIdentifierExpression(parser);
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
  switch (nextToken.type) {
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