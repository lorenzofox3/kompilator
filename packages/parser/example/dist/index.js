(function () {
'use strict';

const lazyMapWith = (fn) => function* (iterator) {
  for (let i of iterator) {
    yield fn(i);
  }
};

const lazyFilterWith = fn => function* (iterator) {
  for (let i of iterator) {
    if (fn(i)) {
      yield i;
    }
  }
};

const syntacticFlags = {
  allowRegexp: 1 << 0,
  allowRightBrace: 1 << 1
};

//todo put track loc as an option ?
const sourceStream = (code) => {
  const lineTerminatorRegexp = /[\u000a\u000d\u2028\u2029]/g;
  let index = 0;
  let col = 0;
  let line = 1;

  const test = (regexp) => nextStretch().search(regexp) === 0;
  const nextSubStr = (count = 1) => code.substr(index, count);
  const seeNextAt = (offset = 0) => code[index + offset];
  const nextStretch = () => nextSubStr(3); //we need three chars to be really sure of the current lexical production (0x3...)
  const loc = () => ({col, line});

  const advance = (number = 1) => {
    let lastLineIndex = 0;
    // console.log(`col: ${col}`);
    // console.log(`line: ${line}`);
    const stretch = nextSubStr(number);
    // console.log(`symbols: ${stretch}`);
    // console.log('-------')
    while (lineTerminatorRegexp.test(stretch)) {
      line += 1;
      col = 0;
      lastLineIndex = lineTerminatorRegexp.lastIndex;
    }
    col += (number - lastLineIndex);
    index += number;
  };

  const stream = {
    loc,
    test,
    nextSubStr,
    seeNextAt,
    //advance stream
    match (regexp) {
      regexp.lastIndex = index;
      const [rawValue] = regexp.exec(code);
      advance(rawValue.length);
      return rawValue;
    },
    //advance stream
    read (length) {
      const s = this.nextSubStr(length);
      advance(length);
      return s;
    }
  };

  Object.defineProperty(stream, 'done', {
    get () {
      return code[index] === void 0;
    }
  });

  return stream;
};

const categories = {
  WhiteSpace: 0,
  LineTerminator: 1,
  SingleLineComment: 2,
  MultiLineComment: 3,
  Punctuator: 4,
  Identifier: 5,
  NumericLiteral: 6,
  StringLiteral: 7,
  RegularExpressionLiteral: 8,
  Template: 9,
  TemplateHead: 10,
  TemplateMiddle: 11,
  TemplateTail: 12
};

//defined as keywords
const keywords = 'await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof new return super switch this throw try typeof var void while with yield'.split(' ');
const futureReservedKeyword = ['enum'];
const reservedKeywords = keywords.concat(futureReservedKeyword, ['null', 'true', 'false']);

//defined as punctuators
const puncutators = `{ ( ) [ ] . ... ; , < > <= >= == != === !== + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= **= <<= >>= >>>= &= |= ^= => / /= }`.split(' ');

const allowRegexpAfter = 'case delete do else in instanceof new return throw typeof void { ( [ . ; , < > <= >= == != === !== + - * << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ^= /='.split(' ');

const createLanguageToken = (symbol, value) => {
  return Object.freeze(Object.assign(Object.create(null), {
    type: puncutators.includes(symbol) ? categories.Punctuator : categories.Identifier,
    value: value !== void  0 ? value : symbol,
    rawValue: symbol
  }));
};

//create a token table
const tokenRegistry = () => {
  const ecmaScriptTokens = puncutators.concat(keywords, futureReservedKeyword)
    .map(symbol => ([symbol, createLanguageToken(symbol)]));
  ecmaScriptTokens.push(['null', createLanguageToken('null', null)]);
  ecmaScriptTokens.push(['true', createLanguageToken('true', true)]);
  ecmaScriptTokens.push(['false', createLanguageToken('false', false)]);

  //todo in some context the next tokens can be considered as identifier or identifierName
  ecmaScriptTokens.push(['of', createLanguageToken('of')]);
  ecmaScriptTokens.push(['let', createLanguageToken('let')]);
  ecmaScriptTokens.push(['get', createLanguageToken('get')]);
  ecmaScriptTokens.push(['set', createLanguageToken('set')]);
  ecmaScriptTokens.push(['static', createLanguageToken('static')]);
  ecmaScriptTokens.push(['as', createLanguageToken('as')]);
  ecmaScriptTokens.push(['from', createLanguageToken('from')]);

  const tokenMap = new Map(ecmaScriptTokens);

  return {
    get (key) {
      return tokenMap.get(key)
    },
    isReserved(symbol){
      return reservedKeywords.includes(symbol)
    },
    evaluate (lexeme) {
      if (!tokenMap.has(lexeme.rawValue)) {
        switch (lexeme.type) {
          case categories.StringLiteral:
            return Object.assign(lexeme, {
              value: lexeme.rawValue.substr(1, lexeme.rawValue.length - 2)
            });
          case categories.NumericLiteral:
            return Object.assign(lexeme, {value: Number(lexeme.rawValue)});
          case categories.RegularExpressionLiteral:
            return Object.assign(lexeme, {value: new RegExp(lexeme.pattern, lexeme.flags)});
          default:
            return Object.assign(lexeme, {value: lexeme.rawValue});
        }
      }
      return tokenMap.get(lexeme.rawValue);
    },
    addToken () {
      throw new Error('not implemented');
    }
  }
};

tokenRegistry();

const CHAR_STAR = '*';
const CHAR_SLASH = '/';
const MULTI_LINE_COMMENT_START = '/*';
const SINGLE_LINE_COMMENT_START = '//';
const CHAR_BACKSLASH = '\\';
const CHAR_SINGLE_QUOTE = "'";
const CHAR_DOUBLE_QUOTE = '"';
const CHAR_LEFT_BRACKET = '[';
const CHAR_RIGHT_BRACKET = ']';
const CHAR_DOT = '.';
const SPREAD = '...';
const CHAR_TEMPLATE_QUOTE = '`';
const CHAR_DOLLAR = '$';
const CHAR_BRACE_OPEN = '{';
const CHAR_BRACE_CLOSE = '}';

const lexemeFromRegExp = (regExp, category) => sourceStream => ({type: category, rawValue: sourceStream.match(regExp)});
const testFromRegExp = regExp => sourceStream => sourceStream.test(regExp);
const productionFromRegexp = ({test, lexeme, category}) => () => {
  //we create regexp dynamically so they are not global to every instance of the scanner
  const testRegexp = new RegExp(test);
  const lexemeRegexp = new RegExp(lexeme, 'y');
  return {
    test: testFromRegExp(testRegexp),
    lexeme: lexemeFromRegExp(lexemeRegexp, category)
  }
};

const numbers = productionFromRegexp({
  category: categories.NumericLiteral,
  test: `^(?:[1-9]|\\.\\d|0[1-9]?|0[xX][0-9a-fA-F]|0[bB][01]|0[oO][0-7])`,
  lexeme: `0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?)`
});

const identifiers = productionFromRegexp({
  category: categories.Identifier,
  test: `^[$_a-zA-Z]`,
  lexeme: `[$_a-zA-Z][$\\w]*`
});

const whiteSpace = productionFromRegexp({
  category: categories.WhiteSpace,
  test: `^(?:[\\u0009\\u000b\\u000c\\u0020\\u00a0\\ufeff])`,
  lexeme: `[\\u0009\\u000b\\u000c\\u0020\\u00a0\\ufeff]+`
});

const lineTerminator = productionFromRegexp({
  category: categories.LineTerminator,
  test: `^(?:[\\u000a\\u000d\\u2028\\u2029])`,
  lexeme: `[\\u000a\\u000d\\u2028\\u2029]+`
});

const singleLineComment = () => {
  const lexemeRegExp = /\/\/.*/y;
  return {
    test: (sourceStream) => sourceStream.nextSubStr(2) === SINGLE_LINE_COMMENT_START,
    lexeme: lexemeFromRegExp(lexemeRegExp, categories.SingleLineComment)
  };
};

const multiLineComment = () => {
  const lexeme = (sourceStream, count = 2) => {
    const next = sourceStream.seeNextAt(count);
    count++;
    if (next === CHAR_STAR) {
      const secondNext = sourceStream.seeNextAt(count);
      if (secondNext === CHAR_SLASH) {
        return {
          type: categories.MultiLineComment,
          rawValue: sourceStream.read(count + 1)
        }
      }
    }
    return lexeme(sourceStream, count);
  };
  return {
    test (sourceStream) {
      return sourceStream.nextSubStr(2) === MULTI_LINE_COMMENT_START;
    },
    lexeme
  };
};

const fromQuote = quote => {
  const fn = (sourceStream, count = 1) => {
    const next = sourceStream.seeNextAt(count);
    count += 1;
    if (next === quote) {
      return {
        type: categories.StringLiteral,
        rawValue: sourceStream.read(count)
      };
    }
    if (next === CHAR_BACKSLASH) {
      count += 1;
    }
    return fn(sourceStream, count);
  };
  return fn;
};
const stringLiteral = () => {
  const singleQuote = fromQuote(CHAR_SINGLE_QUOTE);
  const doubleQuote = fromQuote(CHAR_DOUBLE_QUOTE);
  return {
    test (sourceStream) {
      const next = sourceStream.seeNextAt();
      return next === CHAR_SINGLE_QUOTE || next === CHAR_DOUBLE_QUOTE;
    },
    lexeme (sourceStream) {
      const next = sourceStream.seeNextAt();
      return next === CHAR_DOUBLE_QUOTE ? doubleQuote(sourceStream) : singleQuote(sourceStream);
    }
  };
};

const punctuators = (punctuatorList = puncutators) => {

  const sizeOnePunctuatorList = punctuatorList.filter(p => p.length === 1);
  const sizeTwoPunctuatorList = punctuatorList.filter(p => p.length === 2);
  const sizeThreePunctuatorList = punctuatorList.filter(p => p.length === 3);
  const sizeFourPunctuatorList = punctuatorList.filter(p => p.length === 4);

  //micro optimization (this function will run often)
  const isInPunctuatorList = (str) => {
    switch (str.length) {
      case 2:
        return sizeTwoPunctuatorList.includes(str);
      case 3:
        return sizeThreePunctuatorList.includes(str);
      case 4:
        return sizeFourPunctuatorList.includes(str);
      default:
        return false;
    }
  };
  const lexeme = (sourceStream, count = 1) => {
    const nextStretch = sourceStream.nextSubStr(count + 1);
    if (!isInPunctuatorList(nextStretch) || nextStretch.length !== count + 1 /*End of file */) {
      return {
        type: categories.Punctuator,
        rawValue: sourceStream.read(count)
      };
    }
    return lexeme(sourceStream, count + 1);
  };
  const lexemeFromDot = sourceStream => ({
    type: categories.Punctuator,
    rawValue: (sourceStream.nextSubStr(3) === SPREAD) ? sourceStream.read(3) : sourceStream.read(1)
  });
  return {
    test (sourceStream, context) {
      const next = sourceStream.seeNextAt();
      switch (next) {
        case CHAR_SLASH:
          return ~context & syntacticFlags.allowRegexp;
        case CHAR_BRACE_CLOSE:
          return context & syntacticFlags.allowRightBrace;
        default:
          return sizeOnePunctuatorList.includes(next);
      }
    },
    lexeme: sourceStream => sourceStream.seeNextAt() === CHAR_DOT ? lexemeFromDot(sourceStream) : lexeme(sourceStream)
  };
};

const scanRegExpBody = (sourceStream, count = 1) => {
  const next = sourceStream.seeNextAt(count);
  count += 1;
  switch (next) {
    case CHAR_SLASH:
      return count;
    case CHAR_LEFT_BRACKET: {
      // slash are "escaped" in a regexp class
      count = scanRegExpClass(sourceStream, count);//+1
      break;
    }
    case CHAR_BACKSLASH: {
      count += 1;
      break;
    }
  }
  return scanRegExpBody(sourceStream, count);
};
const scanRegExpClass = (sourceStream, count) => {
  const next = sourceStream.seeNextAt(count);
  count += 1;
  switch (next) {
    case CHAR_RIGHT_BRACKET:
      return count;
    case CHAR_BACKSLASH:
      count += 1;
  }
  return scanRegExpClass(sourceStream, count);
};

const identifierPart = /[$\w]/;
const scanRegExpFlags = (sourceStream, count) => {
  const next = sourceStream.seeNextAt(count);
  if (!next || !identifierPart.test(next)) {
    return count;
  }
  return scanRegExpFlags(sourceStream, count + 1);
};

const regularExpression = () => {
  return {
    test (sourceStream, context) {
      const next = sourceStream.seeNextAt();
      return (context & syntacticFlags.allowRegexp) && next === CHAR_SLASH;
    },
    lexeme (sourceStream) {
      const body = scanRegExpBody(sourceStream);
      const withFlags = scanRegExpFlags(sourceStream, body);
      const rawValue = sourceStream.read(withFlags);
      return {
        type: categories.RegularExpressionLiteral,
        rawValue,
        pattern: rawValue.substr(1, body - 2),
        flags: rawValue.substr(body, withFlags - body)
      };
    }
  };
};

const templateOrPart = (onExit = categories.Template, onFollow = categories.TemplateHead) => {
  const fn = (sourceStream, count = 1) => {
    const next = sourceStream.seeNextAt(count);
    count += 1;
    if (next === CHAR_TEMPLATE_QUOTE) {
      return {
        type: onExit,
        rawValue: sourceStream.read(count)
      };
    }

    if (next === CHAR_DOLLAR && sourceStream.seeNextAt(count) === CHAR_BRACE_OPEN) {
      return {
        type: onFollow,
        rawValue: sourceStream.read(count + 1)
      };
    }

    if (next === CHAR_BACKSLASH) {
      count += 1;
    }

    return fn(sourceStream, count);

  };
  return fn;
};
const headOrTemplate = templateOrPart();
const templateHeadOrLiteral = () => {
  return {
    test (sourceStream) {
      const next = sourceStream.seeNextAt();
      return next === CHAR_TEMPLATE_QUOTE;
    },
    lexeme (sourceStream) {
      return headOrTemplate(sourceStream);
    }
  };
};

const middleOrTail = templateOrPart(categories.TemplateTail, categories.TemplateMiddle);
const templateTailOrMiddle = () => {
  return {
    test (sourceStream, context) {
      const next = sourceStream.seeNextAt();
      return next === CHAR_BRACE_CLOSE && (~context & syntacticFlags.allowRightBrace);
    },
    lexeme (sourceStream) {
      return middleOrTail(sourceStream);
    }
  }
};

const ECMAScriptLexicalGrammar = [
  whiteSpace,
  lineTerminator,
  numbers,
  singleLineComment,
  multiLineComment,
  punctuators,
  identifiers,
  regularExpression,
  stringLiteral,
  templateHeadOrLiteral,
  templateTailOrMiddle
];

const scanner = (lexicalRules = ECMAScriptLexicalGrammar.map(g => g())) => {
  return (source, context) => {
    const rule = lexicalRules.find(lr => lr.test(source, context));
    if (rule === void 0) {
      throw new Error(`could not understand the symbol ${source.seeNextAt()}`);
    }
    return rule.lexeme(source);
  };
};

var defaultScanner = scanner();

/* Note

we could greatly improve perf by directly yielding filtered (and evaluated token?) at the scanner level instead of passing every lexeme through a lazy stream combinators pipe chain,
however we would lost the great flexibility we have here !

for example if we simply ignored white space, line terminators, etc.
our filter combinator would have to run much less (at least for big files)

bottom line: we value more modularity and flexibility of the system over performance

todo: later we can give ability to the consumer to configure the scanner to perform better

*/


//return an iterable sequence of lexemes (note it can only be consumed once like a generator)
//The consumer (like a parser) will have to handle the syntactic state and the token evaluation by itself
const lexemes = (code, scanner$$1) => {
  let context = syntacticFlags.allowRegexp | syntacticFlags.allowRightBrace;
  let previousContext = context;
  const source = sourceStream(code);
  const holdContext = fn => _ => {
    previousContext = context;
    fn();
  };
  return {
    * [Symbol.iterator] () {
      while (true) {
        if (source.done === true) {
          return;
        }
        yield scanner$$1(source, context);
      }
    },
    restoreContext () {
      context = previousContext;
    },
    allowRegexp: holdContext(() => {
      context |= syntacticFlags.allowRegexp;
    }),
    disallowRegexp: holdContext(() => {
      context &= ~syntacticFlags.allowRegexp;
    }),
    allowRightBrace: holdContext(() => { // as punctuator vs template middle/tail
      context |= syntacticFlags.allowRightBrace;
    }),
    disallowRightBrace: holdContext(() => {
      context &= ~syntacticFlags.allowRightBrace;
    }),
    loc () {
      return source.loc();
    }
  }
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash

const withEventualSemiColon = (fn) => parser => {
  const node = fn(parser);
  parser.eventually(';');
  return node;
};
const composeArityTwo = (factory, fn) => (a, b) => factory(fn(a, b));
const composeArityOne = (factory, fn) => _ => factory(fn(_));
const composeArityThree = (factory, fn) => (a, b, c) => factory(fn(a, b, c));
const composeArityFour = (factory, fn) => (a, b, c, d) => factory(fn(a, b, c, d));

// these are to forward parameters to grammar production rules ([?yield], [+in], etc)
const grammarParams = {
  yield: 1 << 0,
  await: 1 << 1,
  in: 1 << 2,
  return: 1 << 3,
  default: 1 << 4
};

const nodeFactory = (defaultOrType, proto = null) => {
  const defaultObj = typeof defaultOrType === 'string' ? {type: defaultOrType} : defaultOrType;
  return obj => Object.assign(Object.create(proto), defaultObj, obj);
};

const yieldArgument = {
  * [Symbol.iterator] () {
    yield this.argument;
  }
};
const yieldLeftRight = {
  * [Symbol.iterator] () {
    yield this.left;
    yield this.right;
  }
};
const yieldExpression = {
  * [Symbol.iterator] () {
    yield this.expression;
  }
};
const delegateBody = {
  * [Symbol.iterator] () {
    yield* this.body;
  }
};
const delegateElements = {
  * [Symbol.iterator] () {
    yield* this.elements;
  }
};
const delegateProperties = {
  * [Symbol.iterator] () {
    yield* this.properties;
  }
};
const iterateFunction = {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
};
const iterateCall = {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
};
const iterateProperty = {
  * [Symbol.iterator] () {
    yield this.key;
    yield this.value;
  }
};
const iterateCondition = {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
};

//pefix nodes
const UnaryExpression = nodeFactory('UnaryExpression', yieldArgument);
const ThisExpression = nodeFactory('ThisExpression');
const Super = nodeFactory('Super');
const Literal = nodeFactory('Literal');
const Identifier = nodeFactory('Identifier');
const UpdateExpression = nodeFactory('UpdateExpression', yieldArgument);
const FunctionExpression = nodeFactory({
  type: 'FunctionExpression',
  id: null,
  async: false,
  generator: false
}, iterateFunction);
const ClassExpression = nodeFactory('ClassExpression', delegateBody);
const NewExpression = nodeFactory('NewExpression', iterateCall);
const SpreadElement = nodeFactory('SpreadElement', yieldArgument);
const ArrayExpression = nodeFactory('ArrayExpression', delegateElements);
const ObjectExpression = nodeFactory('ObjectExpression', delegateProperties);
const Property = nodeFactory({
  type: 'Property',
  shorthand: false,
  computed: false,
  kind: 'init',
  method: false,
  value: null
}, iterateProperty);
const YieldExpression = nodeFactory({type: 'YieldExpression', delegate: false}, yieldArgument);

//infix nodes
const asBinary = type => nodeFactory(type, yieldLeftRight);
const AssignmentExpression = asBinary('AssignmentExpression');
const BinaryExpression = asBinary('BinaryExpression');
const LogicalExpression = asBinary('LogicalExpression');
const MemberExpression = nodeFactory('MemberExpression', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.property;
  }
});
const ConditionalExpression = nodeFactory('ConditionalExpression', iterateCondition);
const CallExpression = nodeFactory('CallExpression', iterateCall);
const SequenceExpression = nodeFactory('SequenceExpression', {
  * [Symbol.iterator] () {
    yield* this.expressions;
  }
});
const ArrowFunctionExpression = nodeFactory({
  type: 'ArrowFunctionExpression',
  expression: true,
  async: false,
  generator: false,
  id:null
}, iterateFunction);

//statements nodes
const IfStatement = nodeFactory('IfStatement', iterateCondition);
const BlockStatement = nodeFactory('BlockStatement', delegateBody);
const ExpressionStatement = nodeFactory('ExpressionStatement', yieldExpression);
const EmptyStatement = nodeFactory('EmptyStatement');
const DebuggerStatement = nodeFactory('DebuggerStatement');
const withArgument = (type) => nodeFactory(type, yieldArgument);
const ReturnStatement = withArgument('ReturnStatement');
const BreakStatement = withArgument('BreakStatement');
const ContinueStatement = withArgument('ContinueStatement');

const WithStatement = nodeFactory('WithStatement', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.body;
  }
});
const SwitchStatement = nodeFactory('SwitchStatement', {
  * [Symbol.iterator] () {
    yield this.discriminant;
    yield* this.cases;
  }
});
const SwitchCase = nodeFactory('SwitchCase', {
  * [Symbol.iterator] () {
    yield this.test;
    yield* this.consequent;
  }
});
const ThrowStatement = nodeFactory('ThrowStatement', yieldExpression);
const TryStatement = nodeFactory('TryStatement', {
  * [Symbol.iterator] () {
    yield this.block;
    yield this.handler;
    yield this.finalizer;
  }
});

const WhileStatement = nodeFactory('WhileStatement', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.body;
  }
});
const DoWhileStatement = nodeFactory('DoWhileStatement', {
  * [Symbol.iterator] () {
    yield this.body;
    yield this.test;
  }
});
const ForInStatement = nodeFactory('ForInStatement', yieldLeftRight);
const ForStatement = nodeFactory('ForStatement', {
  * [Symbol.iterator] () {
    yield this.init;
    yield this.test;
    yield this.update;
  }
});
const ForOfStatement = nodeFactory('ForOfStatement', yieldLeftRight);
const LabeledStatement = nodeFactory('LabeledStatement', {
  * [Symbol.iterator] () {
    yield this.body;
  }
});

const Program = nodeFactory({type: 'Program', sourceType: 'script'}, delegateBody);

//declarations
const AssignmentPattern = nodeFactory('AssignmentPattern', yieldLeftRight);
const FunctionDeclaration = nodeFactory({
  type: 'FunctionDeclaration',
  async: false,
  generator: false
}, iterateFunction);
const VariableDeclarator = nodeFactory('VariableDeclarator', {
  * [Symbol.iterator] () {
    yield this.id;
    yield this.init;
  }
});
const VariableDeclaration = nodeFactory('VariableDeclaration', {
  * [Symbol.iterator] () {
    yield* this.declarations;
  }
});
const ArrayPattern = nodeFactory('ArrayPattern', delegateElements);
const RestElement = nodeFactory('RestElement', yieldArgument);
const ObjectPattern = nodeFactory('ObjectPattern', delegateProperties);
const Class = nodeFactory('ClassDeclaration', {
  * [Symbol.iterator] () {
    yield this.id;
    yield this.superClass;
    yield this.body;
  }
});
const ClassBody = nodeFactory('ClassBody', delegateBody);
const MethodDefinition = nodeFactory('MethodDefinition', iterateProperty);

//modules
const ImportDeclaration = nodeFactory('ImportDeclaration', {
  * [Symbol.iterator] () {
    yield* this.specifiers;
    yield this.source;
  }
});
const ImportSpecifier = nodeFactory('ImportSpecifier', {
  * [Symbol.iterator] () {
    yield this.imported;
    yield this.local;
  }
});
const ImportDefaultSpecifier = nodeFactory('ImportDefaultSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
  }
});
const ImportNamespaceSpecifier = nodeFactory('ImportNamespaceSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
  }
});
const ExportNamedDeclaration = nodeFactory({
  type: 'ExportNamedDeclaration',
  specifiers: [],
  declaration: null,
  source: null
}, {
  * [Symbol.iterator] () {
    yield this.declaration;
    yield* this.specifiers;
    yield this.source;
  }
});
const ExportSpecifier = nodeFactory('ExportSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
    yield this.exported;
  }
});
const ExportDefaultDeclaration = nodeFactory({type: 'ExportDefaultDeclaration', specifiers: [], source: null}, {
  * [Symbol.iterator] () {
    yield this.declaration;
  }
});
const ExportAllDeclaration = nodeFactory('ExportAllDeclaration', {
  * [Symbol.iterator] () {
    yield this.source;
  }
});

//walk & traverse

/*
 this convert a node initially parsed as a literal (likely object or array) to an assignment pattern
 this will mutate node and its descendant to match the new grammar used
 it occurs in cases where we have parsed as literal first and then encounter a token (such "=" which actually indicates the literal was a pattern)
 example:

 let a = 3,b =4;
 [a,b] = [b,a];

 we don't know we have a assignment pattern until we reach the "=" token

 */
const toAssignable = node => {
  switch (node.type) {
    case 'ArrayPattern':
    case 'ObjectPattern':
    case 'AssignmentPattern':
    case 'RestElement':
    case 'Identifier':
      break; //skip
    case 'ArrayExpression': {
      node.type = 'ArrayPattern';
      for (let ch of node) {
        toAssignable(ch); //recursive descent
      }
      break;
    }
    case 'ObjectExpression': {
      node.type = 'ObjectPattern';
      for (let prop of node) {
        if (prop.kind !== 'init' || prop.method) {
          throw new Error('can not convert property as a destructuring pattern');
        }
        toAssignable(prop.value);
      }
      break
    }
    case 'SpreadElement': {
      node.type = 'RestElement';
      toAssignable(node.argument);
      break;
    }
    case 'AssignmentExpression': {
      if (node.operator !== '=') {
        throw new Error('can not reinterpret assignment expression with operator different than "="');
      }
      node.type = 'AssignmentPattern';
      delete node.operator; // operator is not relevant for assignment pattern
      toAssignable(node.left);//recursive descent
      break;
    }
    default:
      throw new Error(`Unexpected node could not parse "${node.type}" as part of a destructuring pattern `);
  }
  return node;
};

// expressions based on Javascript operators whether they are "prefix" or "infix"
// Note: Functions and Class expressions, Object literals and Array literals are in their own files

//prefix
const asValue = (type, key) => composeArityTwo(type, (parser, params = 0) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => composeArityTwo(type, (parser, params = 0) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token), params),
    prefix: true
  };
});

//todo maybe split between binding identifier and binding reference (for params handling) ?
const parseBindingIdentifier = composeArityTwo(Identifier, (parser, params = 0) => {
  const {value: next} = parser.next();
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  return {
    name: next.value
  };
});
const parseIdentifierName = composeArityTwo(Identifier, (parser, params = 0) => {
  const {value: next} = parser.next();
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  return {
    name: next.value
  };
});
const parseGroupExpression = (parser) => {
  parser.expect('(');
  const exp = parser.expression();
  parser.expect(')');
  return exp;
};
const parseUnaryExpression = asUnaryExpression(UnaryExpression);
const parseThisExpression = asValue(ThisExpression);
const parseSuperExpression = asValue(Super);
const parseLiteralExpression = asValue(Literal, 'value');
const parseRegularExpressionLiteral = composeArityOne(Literal, parser => {
  const {value: regexp} = parser.next();
  return {
    value: regexp.value,
    regex: {
      pattern: regexp.value.source,
      flags: regexp.value.flags
    }
  }
});
const parseUpdateExpressionAsPrefix = asUnaryExpression(UpdateExpression);
const parseNewExpression = composeArityOne(NewExpression, parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});
const parseYieldExpression = (parser, params = 0) => {
  if (params & grammarParams.yield) {
    parser.expect('yield');
    let delegate = false;
    if (parser.eventually('*')) {
      delegate = true;
    }
    return YieldExpression({
      argument: parser.expression(parser.getPrefixPrecedence(parser.get('yield')), params),
      delegate
    });
  }
  return parseIdentifierName(parser, params);
};

//infix
const asBinaryExpression = type => composeArityFour(type, (parser, params = 0, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator), params),
    operator: operator.value
  };
});
const parseEqualAssignmentExpression = composeArityThree(AssignmentExpression, (parser, left, operator) => {
  const {type} = left;
  if (type === 'ArrayExpression' || type === 'ObjectExpression') {
    toAssignable(left);
  }
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
    operator: operator.value
  };
});
const parseAssignmentExpression = asBinaryExpression(AssignmentExpression);
const parseBinaryExpression = asBinaryExpression(BinaryExpression);
const parseLogicalExpression = asBinaryExpression(LogicalExpression);
const parseMemberAccessExpression = composeArityThree(MemberExpression, (parser, left, operator) => {
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
const parseUpdateExpression = composeArityThree(UpdateExpression, (parser, left, operator) => ({
  argument: left,
  operator: operator.value,
  prefix: false
}));
const parseConditionalExpression = composeArityThree(ConditionalExpression, (parser, test) => {
  const node = {
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','));
  node.consequent = parser.expression(commaPrecedence);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence);
  return node;
});
const parseSequenceExpression = composeArityThree(SequenceExpression, (parser, left) => {
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

// "array" parsing is shared across various components:
// - as array literals
// - as array pattern
const parseRestElement = composeArityOne(RestElement, parser => {
  parser.expect('...');
  return {
    argument: parseBindingIdentifierOrPattern(parser)
  };
});
const parseSpreadExpression = composeArityOne(SpreadElement, parser => {
  parser.expect('...');
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('...')))
  };
});

const parseArrayElision = (parser, elements) => {
  const {value: next} = parser.lookAhead();

  if (next !== parser.get(',')) {
    return elements;
  }

  elements.push(null);
  parser.eat();

  return parseArrayElision(parser, elements);
};
const arrayElements = (parseEllipsis, process) => {
  const fn = (parser, elements = []) => {
    const {value: next} = parser.lookAhead();
    const comma = parser.get(',');

    if (next === parser.get(']')) {
      return elements;
    }

    if (next === parser.get('...')) {
      elements.push(parseEllipsis(parser));
      parser.eventually(',');
      return fn(parser, elements);
    }

    if (next === comma) {
      parseArrayElision(parser, elements);
      return fn(parser, elements);
    }

    process(parser, elements);

    return fn(parser, elements);
  };
  return fn;
};
const parseArrayElements = arrayElements(parseSpreadExpression, (parser, elements) => {
  elements.push(parser.expression(parser.getInfixPrecedence(parser.get(','))));
  parser.eventually(',');
});
const parseArrayElementsBindingPattern = arrayElements(parseRestElement, (parser, elements) => {
  let element = parseBindingIdentifierOrPattern(parser);
  if (parser.eventually('=')) {
    element = parseAssignmentPattern(parser, element);
  }
  elements.push(element);
  parser.eventually(',');
});

const parseArrayBindingPattern = composeArityTwo(ArrayPattern, parser => {
  parser.expect('[');
  const node = {
    elements: parseArrayElementsBindingPattern(parser)
  };
  parser.expect(']');
  return node;
});
const parseArrayLiteralExpression = composeArityOne(ArrayExpression, (parser) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
});

// "function" parsing is shared across multiple components and deserves its own module to mutualize code more easily:
// - as statement aka function declaration
// - as expression
// - as arrow function (expression)
// - as method (within object or class body)
// - as function call

const parseFormalParameters = (parser, parameters = []) => {
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
const asPropertyFunction = (parser, prop) => {
  parser.expect('(');
  const params = parseFormalParameters(parser);
  parser.expect(')');
  const body = parseBlockStatement(parser);
  return Object.assign(prop, {
    value: FunctionExpression({
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
const parseFunctionDeclaration = composeArityOne(FunctionDeclaration, parser => {
  parser.expect('function');
  const generator = parser.eventually('*');
  const id = parseBindingIdentifier(parser);
  return Object.assign({
    id,
    generator
  }, parseParamsAndBody(parser));
});

//that is a prefix expression
const parseFunctionExpression = composeArityOne(FunctionExpression, parser => {
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

const parseArrowFunctionExpression = composeArityTwo(ArrowFunctionExpression, (parser, left) => {
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
const parseCallExpression = composeArityTwo(CallExpression, (parser, callee) => {
  const node = {
    callee,
    arguments: parseFunctionCallArguments(parser)
  };
  parser.expect(')');
  return node;
});

// "object" parsing is shared across various components:
// - as object literals
// - as object pattern
// - within class bodies as well

const parseComputedPropertyName = parser => {
  parser.expect('[');
  const key = parser.expression();
  parser.expect(']');
  return {
    key,
    computed: true
  };
};
const parseLiteralPropertyName = parser => ({key: parser.expression(20), computed: false});// max precedence => a literal or an identifier or a keyword
const parsePropertyName = parser => {
  const {value: next} = parser.lookAhead();
  return next === parser.get('[') ?
    parseComputedPropertyName(parser) :
    parseLiteralPropertyName(parser)
};

const parsePropertyDefinition = composeArityOne(Property, parser => {
  let {value: next} = parser.lookAhead();
  let prop;
  const {value: secondNext} = parser.lookAhead(1);

  //binding reference
  if (next.type === categories.Identifier) {
    if ((secondNext === parser.get(',') || secondNext === parser.get('}'))) {
      const key = parseBindingIdentifier(parser);
      return {
        shorthand: true,
        key,
        value: key
      };
    }
    //cover Initialized grammar https://tc39.github.io/ecma262/#prod-CoverInitializedName
    if (secondNext === parser.get('=')) {
      const key = parseBindingIdentifier(parser);
      const value = parseAssignmentPattern(parser, key);
      return {
        shorthand: true,
        key,
        value
      };
    }
  }

  //can be a getter/setter or a shorthand binding or a property with init...
  if (next === parser.get('get') || next === parser.get('set')) {
    const {value: accessor} = parser.next();
    const {value: next} = parser.lookAhead();

    if (next !== parser.get('(') && next !== parser.get(':')) {
      prop = Object.assign(parsePropertyName(parser), {kind: accessor.rawValue});
      return asPropertyFunction(parser, prop);
    }

    prop = {
      key: Identifier({name: accessor.value})
    };
  }

  prop = prop !== void 0 ? prop : parsePropertyName(parser);
  next = parser.lookAhead().value;
  if (next === parser.get('(')) {
    //method
    return asPropertyFunction(parser, Object.assign(prop, {method: true}));
  } else if (next === parser.get(':')) {
    //with initializer
    parser.expect(':');
    return Object.assign(prop, {
      value: parser.expression(parser.getInfixPrecedence(parser.get(',')))
    });
  }

  throw new Error(`Unexpected token: expected ":" or "(" but got ${next.rawValue}`);

});
const parsePropertyList = (parser, properties = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === parser.get('}')) {
    return properties;
  }

  if (!parser.eventually(',')) {
    properties.push(parsePropertyDefinition(parser));
  }

  return parsePropertyList(parser, properties);
};
const parseObjectLiteralExpression = composeArityOne(ObjectExpression, parser => {
  parser.expect('{');
  const node = {
    properties: parsePropertyList(parser)
  };
  parser.expect('}');
  return node;
});

const parseSingleNameBindingProperty = parser => {
  const key = parseIdentifierName(parser);
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
  const property = Property({});
  return next.type === categories.Identifier && parser.isReserved(next) === false ? //identifier but not reserved word
    Object.assign(property, parseSingleNameBindingProperty(parser)) :
    Object.assign(property, parsePropertyNameProperty(parser));
};
const parseBindingPropertyList = (parser, properties = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return properties;
  }
  if (!parser.eventually(',')) {
    properties.push(parseBindingProperty(parser));
  }
  return parseBindingPropertyList(parser, properties);
};
const parseObjectBindingPattern = composeArityOne(ObjectPattern, parser => {
  parser.expect('{');
  const node = {
    properties: parseBindingPropertyList(parser)
  };
  parser.expect('}');
  return node;
});

const parseClassMethod = composeArityOne(MethodDefinition, (parser) => {
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
        key: parseBindingIdentifier(parser),
        computed: false
      };
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
const parseClassBody = composeArityOne(ClassBody, parser => {
  parser.expect('{');
  const node = {
    body: parseClassElementList(parser)
  };
  parser.expect('}');
  return node;
});

const parseClassTail = (parser, id) => {
  let superClass = null;

  if (parser.eventually('extends')) {
    superClass = parser.expression();
  }

  return {
    id,
    superClass,
    body: parseClassBody(parser)
  };
};

const parseClassDeclaration = composeArityOne(Class, parser => {
  parser.expect('class');
  const id = parseBindingIdentifier(parser);
  return parseClassTail(parser, id);
});

const parseClassExpression = composeArityOne(ClassExpression, parser => {
  parser.expect('class');
  let id = null;
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier && next !== parser.get('extends')) {
    id = parseBindingIdentifier(parser);
  }
  return parseClassTail(parser, id);
});

const parseNamedImport = (parser, specifiers) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const imported = parseIdentifierName(parser);
  let hasAs = false;
  if (parser.isReserved(next)) {
    parser.expect('as');
    hasAs = true;
  } else {
    hasAs = parser.eventually('as');
  }

  const local = hasAs ? parseBindingIdentifier(parser) : imported;

  specifiers.push(ImportSpecifier({
    local,
    imported
  }));

  if (parser.eventually(',')) { // elision is not allowed
    const {value: next} = parser.lookAhead();
    if (next === parser.get('}')) {
      return specifiers;
    }
  }

  return parseNamedImport(parser, specifiers);
};
const parseImportDefaultSpecifier = (parser, specifiers) => {
  specifiers.push(ImportDefaultSpecifier({
    local: parseBindingIdentifier(parser)
  }));
  return specifiers;
};
const parseImportNamespaceSpecifier = (parser, specifiers) => {
  parser.expect('*');
  parser.expect('as');
  specifiers.push(ImportNamespaceSpecifier({
    local: parseBindingIdentifier(parser)
  }));
  return specifiers;
};
const parseImportClause = (parser, specifiers = []) => {
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier) {

    parseImportDefaultSpecifier(parser, specifiers);

    if (parser.eventually(',')) {
      const {value: next} = parser.lookAhead();

      if (next === parser.get('*')) {
        return parseImportNamespaceSpecifier(parser, specifiers);
      } else if (next === parser.get('{')) {
        parser.expect('{');
        parseNamedImport(parser, specifiers);
        parser.expect('}');
      } else {
        throw new Error(`expected "{" or "*"`);
      }
    }
    return specifiers;
  }

  if (next === parser.get('*')) {
    return parseImportNamespaceSpecifier(parser, specifiers);
  }

  parser.expect('{');
  parseNamedImport(parser, specifiers);
  parser.expect('}');
  return specifiers;
};
const parseFromClause = (parser) => {
  parser.expect('from');
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.StringLiteral) {
    throw new Error('Expected a string literal');
  }
  return parseLiteralExpression(parser);
};

const parseImportDeclaration = composeArityOne(ImportDeclaration, parser => {
  parser.expect('import');
  const {value: next} = parser.lookAhead();
  if (next.type === categories.StringLiteral) {
    return {
      specifiers: [],
      source: parseLiteralExpression(parser)
    };
  }
  const specifiers = parseImportClause(parser);
  const source = parseFromClause(parser);
  return {
    source,
    specifiers
  };
});

const parseExportAllDeclaration = composeArityOne(ExportAllDeclaration, parser => {
  parser.expect('*');
  return {
    source: parseFromClause(parser)
  };
});
const parseNamedExportDeclaration = (parser, specifiers = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const local = parseIdentifierName(parser);
  const exported = parser.eventually('as') ? parseIdentifierName(parser) : local;

  specifiers.push(ExportSpecifier({
    local,
    exported
  }));

  if (parser.eventually(',')) { // elision is not allowed
    const {value: next} = parser.lookAhead();
    if (next === parser.get('}')) {
      return specifiers;
    }
  }

  return parseNamedExportDeclaration(parser, specifiers);
};
const parseExportAsDeclaration = (fn) => composeArityOne(ExportNamedDeclaration, parser => ({
  declaration: fn(parser)
}));
const parseExportAsDefaultDeclaration = (fn) => composeArityOne(ExportDefaultDeclaration, parser => ({
  declaration: fn(parser)
}));
const parseExportDeclaration = parser => {
  parser.expect('export');
  const {value: next} = parser.lookAhead();
  switch (next) {
    case parser.get('*'):
      return parseExportAllDeclaration(parser);
    case parser.get('{'): {
      parser.expect('{');
      const node = ExportNamedDeclaration({
        specifiers: parseNamedExportDeclaration(parser)
      });
      parser.expect('}');
      const {value: next} = parser.lookAhead();
      node.source = next === parser.get('from') ? parseFromClause(parser) : null;
      return node;
    }
    case parser.get('var'):
      return parseExportAsDeclaration(parseVariableDeclaration)(parser);
    case parser.get('const'):
      return parseExportAsDeclaration(parseConstDeclaration)(parser);
    case parser.get('let'):
      return parseExportAsDeclaration(parseLetDeclaration)(parser);
    case parser.get('function'):
      return parseExportAsDeclaration(parseFunctionDeclaration)(parser);
    case parser.get('class'):
      return parseExportAsDeclaration(parseClassDeclaration)(parser);
    case parser.get('default'): {
      parser.expect('default');
      const {value: next} = parser.lookAhead();
      switch (next) {
        case parser.get('function'):
          return parseExportAsDefaultDeclaration(parseFunctionDeclaration)(parser);
        case parser.get('class'):
          return parseExportAsDefaultDeclaration(parseClassDeclaration)(parser);
        default:
          return parseExportAsDefaultDeclaration(parser => parser.expression())(parser);
      }
    }
    default:
      throw new Error('Unknown export statement');
  }

};

// statements
// Note: Function declarations,class declarations, array and object binding pattern are in they own files

const Statement = (factory, fn) => {
  if (!fn) {
    return factory;
  } else {
    return composeArityTwo(factory, fn);
  }
};

const parseStatementList = (parser, params = 0, statements = []) => {
  const {done, value: nextToken} = parser.lookAhead();
  if (done || nextToken === parser.get('}')) {
    return statements;
  }
  statements.push(parseStatement(parser, params));
  return parseStatementList(parser, params, statements);
};

const parseImport = withEventualSemiColon(parseImportDeclaration);
const parseExport = withEventualSemiColon(parseExportDeclaration);
const parseModuleItemList = (parser, items = []) => {
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

const parseExpressionStatement = composeArityTwo(ExpressionStatement, (parser, params = 0) => ({
  expression: parser.expression(-1, params | grammarParams.in)
}));

const parseExpression$1 = withEventualSemiColon(parseExpressionStatement);
const parseStatement = (parser, params = 0) => {
  const {value: nextToken} = parser.lookAhead();
  return parser.hasStatement(nextToken) ? parser.getStatement(nextToken)(parser, params) : parseExpression$1(parser, params);
};

const parseIfStatement = composeArityTwo(IfStatement, (parser, params = 0) => {
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

const parseBlockStatement = Statement(BlockStatement, parser => {
  parser.expect('{');
  const node = {
    body: parseStatementList(parser)
  };
  parser.expect('}');
  return node;
});

const parseExpressionOrLabeledStatement = parser => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser) : parseExpression$1(parser);
};

const parseEmptyStatement = Statement(EmptyStatement, parser => {
  parser.expect(';');
});

const parseDebuggerStatement = Statement(DebuggerStatement);

const parseReturnStatement = Statement(ReturnStatement, parser => {
  parser.expect('return');
  return {
    argument: parser.expression()
  };
});

const parseBreakStatement = Statement(BreakStatement, parser => {
  parser.expect('break');
  return {
    label: parser.expression(20)
  };
});

const parseContinueStatement = Statement(ContinueStatement, parser => {
  parser.expect('continue');
  return {
    label: parser.expression(20)
  };
});

const parseWithStatement = Statement(WithStatement, parser => {
  parser.expect('with');
  parser.expect('(');
  const object = parser.expression();
  parser.expect(')');
  return {
    object,
    body: parseStatement(parser)
  };
});

const parseSwitchStatement = Statement(SwitchStatement, parser => {
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

const parseSwitchCases = (parser, cases = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('case') && nextToken !== parser.get('default')) {
    return cases;
  }
  parser.eat();
  cases.push(parseSwitchCase(parser, nextToken));
  return parseSwitchCases(parser, cases);
};

const parseSwitchCase = Statement(SwitchCase, (parser, nextToken) => {
  const node = {
    test: nextToken === parser.get('case') ? parser.expression() : null
  };
  parser.expect(':');
  node.consequent = parseStatementList(parser, ['}', 'case', 'default']);
  return node;
});

const parseThrowStatement = Statement(ThrowStatement, parser => {
  parser.expect('throw');
  return {
    argument: parser.expression()
  };
});

const parseTryStatement = Statement(TryStatement, parser => {
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

const parseWhileStatement = Statement(WhileStatement, parser => {
  parser.expect('while');
  parser.expect('(');
  const node = {
    test: parser.expression()
  };
  parser.expect(')');
  node.body = parseStatement(parser);
  return node;
});

const parseDoWhileStatement = Statement(DoWhileStatement, parser => {
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

const parseAssignmentPattern = Statement(AssignmentPattern, (parser, left) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(parser.get(',')))
  };
});

const parseBindingIdentifierOrPattern = (parser, params = 0) => {
  const {value: next} = parser.lookAhead();
  if (parser.get('{') === next) {
    return parseObjectBindingPattern(parser, params);
  } else if (parser.get('[') === next) {
    return parseArrayBindingPattern(parser, params);
  }
  return parseBindingIdentifier(parser, params);
};

const asVariableDeclaration = (keyword = 'var') => composeArityTwo(VariableDeclaration, (parser, params = 0) => {
  parser.expect(keyword);
  return {
    kind: keyword,
    declarations: parseVariableDeclarators(parser, params)
  };
});
const parseVariableDeclarator = composeArityTwo(VariableDeclarator, (parser, params = 0) => {
  const comma = parser.get(',');
  const node = {id: parseBindingIdentifierOrPattern(parser, params), init: null};
  if (parser.eventually('=')) {
    node.init = parser.expression(parser.getInfixPrecedence(comma), params);
  }
  return node;
});
const parseVariableDeclarators = (parser, params = 0, declarators = []) => {
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
const parseVariableDeclaration = asVariableDeclaration();
const parseConstDeclaration = asVariableDeclaration('const');
const parseLetDeclaration = asVariableDeclaration('let');

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

const asFor = Statement(ForStatement, (parser, init) => {
  parser.expect(';');
  const n = {
    init,
    test: parser.expression()
  };
  parser.expect(';');
  n.update = parser.expression();
  return n;
});
const asForIn = Statement(ForInStatement, (parser, left) => {
  parser.expect('in');
  return {
    left,
    right: parser.expression()
  };
});
const asForOf = Statement(ForOfStatement, (parser, left) => {
  parser.expect('of');
  return {
    left,
    right: parser.expression()
  };
});

//todo does not seem to fit all cases
const parseForStatement = parser => {
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

const parseLabeledStatement = Statement(LabeledStatement, parser => {
  const node = {
    label: parser.expression(20)
  };
  parser.expect(':');
  node.body = parseStatement(parser);
  return node;
});

const ECMAScriptTokenRegistry = () => {
  const registry = tokenRegistry();

  /**
   * EXPRESSIONS
   */

  const prefixMap = new Map();
  //unary operators
  prefixMap.set(registry.get('-'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('+'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('!'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('~'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('typeof'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('void'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('delete'), {parse: parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('...'), {parse: parseSpreadExpression, precedence: 1});
  prefixMap.set(registry.get('yield'), {parse: parseYieldExpression, precedence: 2});
  //update operators
  prefixMap.set(registry.get('--'), {parse: parseUpdateExpressionAsPrefix, precedence: 16});
  prefixMap.set(registry.get('++'), {parse: parseUpdateExpressionAsPrefix, precedence: 16});
  //literals
  prefixMap.set(categories.StringLiteral, {parse: parseLiteralExpression, precedence: -1});
  prefixMap.set(categories.NumericLiteral, {parse: parseLiteralExpression, precedence: -1});
  prefixMap.set(categories.RegularExpressionLiteral, {
    parse: parseRegularExpressionLiteral,
    precedence: -1
  });
  prefixMap.set(registry.get('null'), {parse: parseLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('false'), {parse: parseLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('true'), {parse: parseLiteralExpression, precedence: -1});
  // prefixMap.set(categories.Template, {parse: expressions.parseTemplateLiteral, precedence: -1});
  // prefixMap.set(categories.TemplateHead, {parse: expressions.parseTemplateLiteral, precedence: -1});
  prefixMap.set(registry.get('['), {parse: parseArrayLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('{'), {parse: parseObjectLiteralExpression, precedence: -1});
  //identifiers
  prefixMap.set(registry.get('this'), {parse: parseThisExpression, precedence: -1});
  prefixMap.set(registry.get('super'), {parse: parseSuperExpression, precedence: -1});
  prefixMap.set(categories.Identifier, {parse: parseIdentifierName, precedence: -1});
  //functions
  prefixMap.set(registry.get('function'), {parse: parseFunctionExpression, precedence: -1});
  prefixMap.set(registry.get('class'), {parse: parseClassExpression, precedence: -1});
  prefixMap.set(registry.get('new'), {parse: parseNewExpression, precedence: 18});
  //group
  prefixMap.set(registry.get('('), {parse: parseGroupExpression, precedence: 20});

  const infixMap = new Map();
  //sequence
  infixMap.set(registry.get(','), {parse: parseSequenceExpression, precedence: 0});
  //conditional
  infixMap.set(registry.get('?'), {parse: parseConditionalExpression, precedence: 4});
  //assignment operators
  infixMap.set(registry.get('='), {parse: parseEqualAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('+='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('-='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('*='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('/='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('%='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('<<='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('>>='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('>>>='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('&='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('^='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('|='), {parse: parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('=>'), {parse: parseArrowFunctionExpression, precedence: 21}); // fake precedence of 21
  //binary operators
  infixMap.set(registry.get('=='), {parse: parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('!='), {parse: parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('==='), {parse: parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('!=='), {parse: parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('<'), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('<='), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('>'), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('>='), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('in'), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('instanceof'), {parse: parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('<<'), {parse: parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('>>'), {parse: parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('>>>'), {parse: parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('+'), {parse: parseBinaryExpression, precedence: 13});
  infixMap.set(registry.get('-'), {parse: parseBinaryExpression, precedence: 13});
  infixMap.set(registry.get('*'), {parse: parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('/'), {parse: parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('%'), {parse: parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('**'), {parse: parseBinaryExpression, precedence: 15});
  infixMap.set(registry.get('|'), {parse: parseBinaryExpression, precedence: 7});
  infixMap.set(registry.get('^'), {parse: parseBinaryExpression, precedence: 8});
  infixMap.set(registry.get('&'), {parse: parseBinaryExpression, precedence: 9});
  //member access operator
  infixMap.set(registry.get('.'), {parse: parseMemberAccessExpression, precedence: 19});
  infixMap.set(registry.get('['), {parse: parseMemberAccessExpression, precedence: 19});
  //logical operators
  infixMap.set(registry.get('||'), {parse: parseLogicalExpression, precedence: 5});
  infixMap.set(registry.get('&&'), {parse: parseLogicalExpression, precedence: 6});
  //update operators
  infixMap.set(registry.get('++'), {parse: parseUpdateExpression, precedence: 17});
  infixMap.set(registry.get('--'), {parse: parseUpdateExpression, precedence: 17});
  //call
  infixMap.set(registry.get('('), {parse: parseCallExpression, precedence: 19});

  /**
   * STATEMENTS
   */

  const statementsMap = new Map();
  statementsMap.set(registry.get('if'), parseIfStatement);
  statementsMap.set(registry.get(';'), parseEmptyStatement);
  statementsMap.set(registry.get('{'), parseBlockStatement);
  statementsMap.set(registry.get('for'), parseForStatement);
  statementsMap.set(registry.get('var'), withEventualSemiColon(parseVariableDeclaration));
  statementsMap.set(registry.get('const'), withEventualSemiColon(parseConstDeclaration));
  statementsMap.set(registry.get('let'), withEventualSemiColon(parseLetDeclaration));
  statementsMap.set(registry.get('function'), parseFunctionDeclaration);
  statementsMap.set(registry.get('class'), parseClassDeclaration);
  statementsMap.set(registry.get('return'), withEventualSemiColon(parseReturnStatement));
  statementsMap.set(registry.get('break'), withEventualSemiColon(parseBreakStatement));
  statementsMap.set(registry.get('continue'), withEventualSemiColon(parseContinueStatement));
  statementsMap.set(registry.get('throw'), withEventualSemiColon(parseThrowStatement));
  statementsMap.set(registry.get('while'), withEventualSemiColon(parseWhileStatement));
  statementsMap.set(registry.get('do'), withEventualSemiColon(parseDoWhileStatement));
  statementsMap.set(registry.get('try'), parseTryStatement);
  statementsMap.set(registry.get('switch'), parseSwitchStatement);
  statementsMap.set(registry.get('with'), parseWithStatement);
  statementsMap.set(registry.get('debugger'), withEventualSemiColon(parseDebuggerStatement));
  statementsMap.set(categories.Identifier, parseExpressionOrLabeledStatement);

  const isLexicallyReserved = registry.isReserved;

  return Object.assign(registry, {
    getInfix (token) {
      return infixMap.get(token) || infixMap.get(token.type);
    },
    getPrefix (token) {
      return prefixMap.get(token) || prefixMap.get(token.type);
    },
    getStatement (token) {
      return statementsMap.get(token) || statementsMap.get(token.type);
    },
    hasPrefix (token) {
      return prefixMap.has(token) || prefixMap.has(token.type);
    },
    hasInfix (token) {
      return infixMap.has(token) || infixMap.has(token.type)
    },
    hasStatement (token) {
      return statementsMap.has(token) || statementsMap.has(token.type);
    },
    isReserved (token) {
      return isLexicallyReserved(token.value);
    },
    addUnaryOperator (precedence) {
      return this.addPrefixOperator(precedence, parseUnaryExpression);
    },
    addBinaryOperator (precedence) {
      return this.addPrefixOperator(precedence, parseBinaryExpression);
    },
    addPrefixOperator (precedence, parseFunction) {
      throw new Error('not Implemented');
      return {
        asPunctuator (symbol) {
        },
        asReservedKeyWord (symbol) {
        },
        asIdentifierName (symbol) {
        }
      };
    },
    addInfixOperator (precendence, parseFunction) {
      throw new Error('not Implemented');
      return {
        asPunctuator (symbol) {
        },
        asReservedKeyWord (symbol) {
        },
        asKeyword (symbol) {
        }
      };
    },
    addStatement (parseFunction) {
      throw new Error('not Implemented');
      return {
        asReservedKeyWord (symbol) {
        },
        asKeyword (symbol) {
        }
      };
    }
  });
};

var ECMAScriptTokens = ECMAScriptTokenRegistry();

//forward method of arrity one (more efficient than using spread operator on arguments)
const forwardArrityOne = (receiver, stream, ...methods) => {
  for (let m of methods) {
    receiver[m] = (arg) => stream[m](arg);
  }
  return receiver;
};

//a buffered token stream
const tokenStream = ({scanner: scanner$$1, tokenRegistry, filter, evaluate}) => {
  const filterFunc = lazyFilterWith(filter || (t => t.type >= 4));
  const map = lazyMapWith(evaluate || tokenRegistry.evaluate);
  const filterMap = it => map(filterFunc(it));

  //as generator(only consumed once)
  return (code) => {

    const stream = lexemes(code, scanner$$1);
    const iterator = filterMap(stream)[Symbol.iterator]();
    const buffer = [];
    const next = () => iterator.next();

    return forwardArrityOne({
      [Symbol.iterator] () {
        return this;
      },
      lookAhead (offset = 0) {
        if (buffer.length > offset) {
          return buffer[offset]
        }
        buffer.push(next());
        return this.lookAhead(offset);
      },
      eventually (expected) {
        const {value: token, done} = this.lookAhead();
        if (!done && expected === token) {
          this.eat();
          return true;
        }
        return false;
      },
      expect (expected) {
        const nextToken = this.next();
        if (expected !== nextToken.value) {
          throw new Error(`Unexpected token: expected "${expected.rawValue}" but got "${nextToken.value.rawValue}"`);
        }
        return nextToken;
      },
      next () {
        return buffer.length ? buffer.shift() : next();
      },
      eat (number = 1) {
        const n = this.next();
        number -= 1;
        return number < 1 ? n : this.eat(number);
      }
    }, stream, 'allowRegexp', 'disallowRegexp', 'allowRightBrace', 'disallowRightBrace');
  };
};

var stream = tokenStream({scanner: defaultScanner, tokenRegistry: ECMAScriptTokens});

const parserFactory = (tokens = ECMAScriptTokens) => {

  const getInfixPrecedence = operator => tokens.hasInfix(operator) ? tokens.getInfix(operator).precedence : -1;
  const getPrefixPrecedence = operator => tokens.hasPrefix(operator) ? tokens.getPrefix(operator).precedence : -1;

  const parseInfix = (parser, params, left, precedence) => {
    parser.disallowRegexp(); //regexp as a literal is a "prefix operator" so a "/" in infix position is a div punctuator
    const {value: operator} = parser.lookAhead();
    if (!operator || precedence >= getInfixPrecedence(operator) || (operator === parser.get('in') && !(params & grammarParams.in))) {
      return left;
    }
    parser.eat();
    parser.allowRegexp();
    const nextLeft = tokens.getInfix(operator).parse(parser, params, left, operator);
    return parseInfix(parser, params, nextLeft, precedence);
  };

  return code => {
    const tokenStream = stream(code);
    const parser = Object.assign(forwardArrityOne({
        expect: symbol => tokenStream.expect(tokens.get(symbol)), //more convenient to have it from the symbol
        eventually: symbol => tokenStream.eventually(tokens.get(symbol)), //more convenient to have it from the symbol
        getInfixPrecedence,
        getPrefixPrecedence,
        expression (precedence = -1, params = 0) {
          parser.allowRegexp(); //regexp as literal is a "prefix operator"
          const {value: token} = parser.lookAhead();
          if (!tokens.hasPrefix(token)) {
            return null;
          }
          const left = tokens.getPrefix(token).parse(parser, params);

          return parseInfix(parser, params, left, precedence);
        },
        program () {
          return Program({
            body: parseStatementList(parser)
          });
        },
        module () {
          return Program({
            sourceType: 'module',
            body: parseModuleItemList(parser)
          });
        },
      }, tokenStream, 'lookAhead', 'next', 'eat', 'allowRegexp', 'disallowRegexp'),
      tokens);

    return parser;
  };

};





const parseScript = program => {
  const parse = parserFactory();
  return parse(program).program();
};

 //alias

// const fs = require('fs');
// const path = require('path');
const utils = require('util');
// const programPath = path.resolve(__dirname, '../../src/statements.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});
// const acorn = require('acorn');
// const cherow = require('cherow');

const program = `'foo' in {}`;
// const ast = parseModule(program);
// const ast = cherow.parse(program, {sourceType: 'script'});
const ast = parseScript(program);
console.log(utils.inspect(ast, {depth: null, colors: true}));

/* browser  */
// (async function  () {
//    const resp = await fetch('../fixtures/jquery.js');
//    const text = await resp.text();
//
//   const ast = parseScript(text);
//    // console.log(ast);
// })();
/* end browser */

}());
//# sourceMappingURL=index.js.map
