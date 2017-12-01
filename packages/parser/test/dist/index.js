(function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
});

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var index = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}
});

var assert = (collect) => {
  const insertAssertionHook = (fn) => (...args) => {
    const assertResult = fn(...args);
    collect(assertResult);
    return assertResult;
  };

  return {
    ok: insertAssertionHook((val, message = 'should be truthy') => ({
      pass: Boolean(val),
      expected: 'truthy',
      actual: val,
      operator: 'ok',
      message
    })),
    deepEqual: insertAssertionHook((actual, expected, message = 'should be equivalent') => ({
      pass: index(actual, expected),
      actual,
      expected,
      message,
      operator: 'deepEqual'
    })),
    equal: insertAssertionHook((actual, expected, message = 'should be equal') => ({
      pass: actual === expected,
      actual,
      expected,
      message,
      operator: 'equal'
    })),
    notOk: insertAssertionHook((val, message = 'should not be truthy') => ({
      pass: !Boolean(val),
      expected: 'falsy',
      actual: val,
      operator: 'notOk',
      message
    })),
    notDeepEqual: insertAssertionHook((actual, expected, message = 'should not be equivalent') => ({
      pass: !index(actual, expected),
      actual,
      expected,
      message,
      operator: 'notDeepEqual'
    })),
    notEqual: insertAssertionHook((actual, expected, message = 'should not be equal') => ({
      pass: actual !== expected,
      actual,
      expected,
      message,
      operator: 'notEqual'
    })),
    throws: insertAssertionHook((func, expected, message) => {
      let caught, pass, actual;
      if (typeof expected === 'string') {
        [expected, message] = [message, expected];
      }
      try {
        func();
      } catch (error) {
        caught = {error};
      }
      pass = caught !== undefined;
      actual = caught && caught.error;
      if (expected instanceof RegExp) {
        pass = expected.test(actual) || expected.test(actual && actual.message);
        expected = String(expected);
      } else if (typeof expected === 'function' && caught) {
        pass = actual instanceof expected;
        actual = actual.constructor;
      }
      return {
        pass,
        expected,
        actual,
        operator: 'throws',
        message: message || 'should throw'
      };
    }),
    doesNotThrow: insertAssertionHook((func, expected, message) => {
      let caught;
      if (typeof expected === 'string') {
        [expected, message] = [message, expected];
      }
      try {
        func();
      } catch (error) {
        caught = {error};
      }
      return {
        pass: caught === undefined,
        expected: 'no thrown error',
        actual: caught && caught.error,
        operator: 'doesNotThrow',
        message: message || 'should not throw'
      };
    }),
    fail: insertAssertionHook((reason = 'fail called') => ({
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      message: reason,
      operator: 'fail'
    }))
  };
};

var test = ({description, spec, only = false} = {}) => {
  const assertions = [];
  const collect = (...args) => assertions.push(...args.map(a => Object.assign({description}, a)));

  const instance = {
    run(){
      const now = Date.now();
      return Promise.resolve(spec(assert(collect)))
        .then(() => ({assertions, executionTime: Date.now() - now}));
    }
  };

  Object.defineProperties(instance, {
    only: {value: only},
    assertions: {value: assertions},
    length: {
      get(){
        return assertions.length
      }
    },
    description: {value: description}
  });

  return instance;
};

const tapOut = ({pass, message, index}) => {
  const status = pass === true ? 'ok' : 'not ok';
  console.log([status, index, message].join(' '));
};

const canExit = () => {
  return typeof process !== 'undefined' && typeof process.exit === 'function';
};

var tap = () => function * () {
  let index = 1;
  let lastId = 0;
  let success = 0;
  let failure = 0;

  const starTime = Date.now();
  console.log('TAP version 13');
  try {
    while (true) {
      const assertion = yield;
      if (assertion.pass === true) {
        success++;
      } else {
        failure++;
      }
      assertion.index = index;
      if (assertion.id !== lastId) {
        console.log(`# ${assertion.description} - ${assertion.executionTime}ms`);
        lastId = assertion.id;
      }
      tapOut(assertion);
      if (assertion.pass !== true) {
        console.log(`  ---
  operator: ${assertion.operator}
  expected: ${JSON.stringify(assertion.expected)}
  actual: ${JSON.stringify(assertion.actual)}
  ...`);
      }
      index++;
    }
  } catch (e) {
    console.log('Bail out! unhandled exception');
    console.log(e);
    if (canExit()) {
      process.exit(1);
    }
  }
  finally {
    const execution = Date.now() - starTime;
    if (index > 1) {
      console.log(`
1..${index - 1}
# duration ${execution}ms
# success ${success}
# failure ${failure}`);
    }
    if (failure && canExit()) {
      process.exit(1);
    }
  }
};

var plan = () => {
  const tests = [];
  const instance = {
    test(description, spec, opts = {}){
      if (!spec && description.test) {
        //this is a plan
        tests.push(...description);
      } else {
        const testItems = (description, spec) => (!spec && description.test) ? [...description] : [{description, spec}];
        tests.push(...testItems(description, spec).map(t => test(Object.assign(t, opts))));
      }
      return instance;
    },
    only(description, spec, opts = {}){
      return instance.test(description, spec, Object.assign(opts, {only: true}));
    },
    async run(sink = tap()){
      const sinkIterator = sink();
      const hasOnly = tests.some(t => t.only);
      const runnable = hasOnly ? tests.filter(t => t.only) : tests;
      let id = 1;
      sinkIterator.next();
      try {
        const results = runnable.map(t => t.run());
        for (let r of results) {
          const {assertions, executionTime} = await r;
          for (let assert of assertions) {
            sinkIterator.next(Object.assign(assert, {id, executionTime}));
          }
          id++;
        }
      }
      catch (e) {
        sinkIterator.throw(e);
      } finally {
        sinkIterator.return();
      }
    },
    [Symbol.iterator](){
      return tests[Symbol.iterator]();
    }
  };

  Object.defineProperties(instance, {
    tests: {value: tests},
    length: {
      get(){
        return tests.length
      }
    }
  });

  return instance;
};

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

//todo put track loc as an option ?
const sourceStream = (code) => {
  const lineTerminatorRegexp = /[\u000a\u000d\u2028\u2029]/g;
  let index = 0;
  let col = 0;
  let line = 1;

  const test = (regexp) => nextStretch().search(regexp) === 0;
  const nextSubStr = (count = 1) => code.substr(index, count);
  const seeNextAt = (offset = 0) => code[index + offset];
  const nextStretch = () => nextSubStr(3); //we need three chars to be really sure of the current lexical production
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
  Object.defineProperty(stream, 'index', {
    get () {
      return index;
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
//todo check async, let ?
const keywords = 'await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof new return super switch this throw try typeof var void while with yield'.split(' ');
const futureReservedKeyword = ['enum'];
const reservedKeywords = keywords.concat(futureReservedKeyword, ['null', 'true', 'false']);

//defined as punctuators
const puncutators = `{ ( ) [ ] . ... ; , < > <= >= == != === !== + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= **= <<= >>= >>>= &= |= ^= => / /= }`.split(' ');

const allowRegexpAfter = 'case delete do else in instanceof new return throw typeof void { ( [ . ; , < > <= >= == != === !== + - * << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ^= /='.split(' ');

const createLanguageToken = (symbol, value) => {
  const token = Object.create(null, {
    type: {
      get () {
        return this; //type is an alias to itself (so we can use in Maps as we would to for other categories such literals, etc)
      }
    },
    value: {value: value !== void 0 ? value : symbol},
    rawValue: {value: symbol, enumerable: true},
    isReserved: {value: reservedKeywords.includes(symbol), enumerable: true}
  });

  return Object.freeze(token);
};

//create a token table
const tokenRegistry = () => {
  const ecmaScriptTokens = puncutators.concat(keywords, futureReservedKeyword)
    .map(symbol => ([symbol, createLanguageToken(symbol)]));
  ecmaScriptTokens.push(['null', createLanguageToken('null', null)]);
  ecmaScriptTokens.push(['true', createLanguageToken('true', true)]);
  ecmaScriptTokens.push(['false', createLanguageToken('false', false)]);
  ecmaScriptTokens.push(['of', createLanguageToken('of')]);

  const tokenMap = new Map(ecmaScriptTokens);

  return {
    get (key) {
      return tokenMap.get(key)
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
    test (sourceStream, allowRegexp) {
      const next = sourceStream.seeNextAt();
      return (next === CHAR_SLASH && allowRegexp === false) || sizeOnePunctuatorList.includes(next);
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
    test (sourceStream, allowRegexp) {
      const next = sourceStream.seeNextAt();
      return allowRegexp && next === CHAR_SLASH;
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

const ECMAScriptLexicalGrammar = [
  whiteSpace,
  lineTerminator,
  numbers,
  singleLineComment,
  multiLineComment,
  regularExpression,
  punctuators,
  identifiers,
  stringLiteral
];

const scanner = (lexicalRules = ECMAScriptLexicalGrammar.map(g => g())) => {
  return (source, isRegexpAllowed) => {
    const rule = lexicalRules.find(lr => lr.test(source, isRegexpAllowed));
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
  let isRegexpAllowed = true;
  const source = sourceStream(code);
  return {
    * [Symbol.iterator] () {
      while (true) {
        if (source.done === true) {
          return;
        }
        yield scanner$$1(source, isRegexpAllowed);
      }
    },
    allowRegexp () {
      isRegexpAllowed = true;
    },
    disallowRegexp () {
      isRegexpAllowed = false;
    },
    loc () {
      return source.loc();
    }
  }
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash

const nodeFactory = (type, proto = null) => obj => Object.assign(Object.create(proto), {type}, obj);

//pefix nodes
const UnaryExpression = nodeFactory('UnaryExpression', {
  * [Symbol.iterator] () {
    yield this.argument;
  }
});
const ThisExpression = nodeFactory('ThisExpression');
const Literal = nodeFactory('Literal');
const Identifier = nodeFactory('Identifier');
const UpdateExpression = nodeFactory('UpdateExpression', {
  * [Symbol.iterator] () {
    yield this.argument;
  }
});
const FunctionExpression = nodeFactory('FunctionExpression', {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
});
const NewExpression = nodeFactory('NewExpression', {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
});
const ArrayExpression = nodeFactory('ArrayExpression', {
  * [Symbol.iterator] () {
    yield* this.elements;
  }
});
const ObjectExpression = nodeFactory('ObjectExpression', {
  * [Symbol.iterator] () {
    yield* this.properties;
  }
});
const Property = nodeFactory('Property', {
  * [Symbol.iterator] () {
    yield this.key;
    yield this.value;
  }
});

//infix nodes
const asBinary = type => nodeFactory(type, {
  * [Symbol.iterator] () {
    yield this.left;
    yield this.right;
  }
});
const AssignmentExpression = asBinary('AssignmentExpression');
const BinaryExpression = asBinary('BinaryExpression');
const LogicalExpression = asBinary('LogicalExpression');
const MemberExpression = nodeFactory('MemberExpression', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.property;
  }
});
const ConditionalExpression = nodeFactory('ConditionalExpression', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
});
const CallExpression = nodeFactory('CallExpression', {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
});
const SequenceExpression = nodeFactory('SequenceExpression', {
  * [Symbol.iterator] () {
    yield* this.expressions;
  }
});

//statements nodes
//todo refactoring with function expression
const FunctionDeclaration = nodeFactory('FunctionDeclaration', {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
});
//todo refactoring with conditional expression
const IfStatement = nodeFactory('IfStatement', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
});
const BlockStatement = nodeFactory('BlockStatement', {
  * [Symbol.iterator] () {
    yield* this.body;
  }
});
const ExpressionStatement = nodeFactory('ExpressionStatement', {
  * [Symbol.iterator] () {
    yield this.expression;
  }
});
const EmptyStatement = nodeFactory('EmptyStatement');
const DebuggerStatement = nodeFactory('DebuggerStatement');
const withArgument = (type) => nodeFactory(
  type, {
    * [Symbol.iterator] () {
      yield this.argument;
    }
  });
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

const ThrowStatement = nodeFactory('ThrowStatement', {
  * [Symbol.iterator] () {
    yield this.expression;
  }
});
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

const VariableDeclaration = nodeFactory('VariableDeclaration', {
  * [Symbol.iterator] () {
    yield* this.declarations;
  }
});


const LabeledStatement = nodeFactory('LabeledStatement', {
  * [Symbol.iterator] () {
    yield this.body;
  }
});

const Program = nodeFactory('Program', {
  * [Symbol.iterator] () {
    yield* this.body;
  }
});

//walk & traverse

const Statement = (factory, fn) => {
  if (!fn) {
    return factory;
  } else {
    return parser => factory(fn(parser));
  }
};

const parseStatementList = (parser, exit = ['}'], statements = []) => {
  const exitTokens = exit.map(s => parser.get(s)); // todo exit is not consistent with expression parser
  const {done, value: nextToken} = parser.lookAhead();
  if (done || exitTokens.includes(nextToken)) {
    return statements;
  }
  statements.push(parseStatement(parser));
  return parseStatementList(parser, exit, statements);
};
const withEventualSemiColon = (fn) => parser => {
  const node = fn(parser);
  parser.eventually(';');
  return node;
};
const parseExpressionOrLabeledStatement = parser => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser) : withEventualSemiColon(parseExpressionStatement)(parser);
};
const parseStatement = (parser) => {
  parser.allowRegexp();
  const {value: nextToken} = parser.lookAhead();
  return parser.hasStatement(nextToken) ? parser.getStatement(nextToken)(parser) : withEventualSemiColon(parseExpressionStatement)(parser);
};

const parseFormalParameters = (parser, parameters = []) => {
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
const parseFunctionDeclaration = Statement(FunctionDeclaration, parser => {
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

const parseIfStatement = Statement(IfStatement, parser => {
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

const parseBlockStatement = Statement(BlockStatement, parser => {
  parser.expect('{');
  const node = {
    body: parseStatementList(parser)
  };
  parser.expect('}');
  return node;
});

const parseExpressionStatement = Statement(ExpressionStatement, parser => ({
  expression: parser.expression()
}));

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

const parseSwitchCase = (parser, nextToken) => {
  const {type} = nextToken;
  const node = {
    type: 'SwitchCase',
    test: type === parser.get('case') ? parser.expression() : null
  };
  parser.expect(':');
  node.consequent = parseStatementList(parser, ['}', 'case', 'default']);
  return node;
};

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

//todo
const parseBindingIdentifierOrPattern = parser => {
  return parser.expression(20);
};

const parseVariableDeclarators = (parser, declarators = []) => {
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

const parseVariableDeclaration = Statement(VariableDeclaration, parser => {
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

const parseForStatement = parser => {
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

const parseLabeledStatement = Statement(LabeledStatement, parser => {
  const node = {
    label: parser.expression(20)
  };
  parser.expect(':');
  node.body = parseStatement(parser);
  return node;
});

//todo 1. check whether a real compose affects performances or not
//todo 2. these could be decoratos like @Infix(ast.foo) etc or eve @Node(ast.blah)
//compose one with arrity one
const Prefix = (factory, fn) => parser => factory(fn(parser));
// compose with arrity 3
const Infix = (factory, fn) => (parser, left, operator) => factory(fn(parser, left, operator));

//prefix
const asValue = (type, key) => Prefix(type, (parser) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => Prefix(type, (parser) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token)),
    prefix: true
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
const parseLiteralExpression = asValue(Literal, 'value');
const parseIdentifierExpression = asValue(Identifier, 'name');
const parseRegularExpressionLiteral = Prefix(Literal, parser => {
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
const parseFunctionExpression = Prefix(FunctionExpression, (parser) => {
  parser.expect('function');
  const node = {
    id: null,
    async: false,
    generator: false
  };
  const {value: nextToken} = parser.lookAhead();
  if (nextToken !== parser.get('(')) {
    node.id = parseBindingIdentifierOrPattern(parser);
  }
  parser.expect('(');
  node.params = parseFormalParameters(parser);
  parser.expect(')');
  node.body = parseBlockStatement(parser);
  return node;
});
const parseNewExpression = Prefix(NewExpression, parser => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken));
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});

//Arrays literals
const parseArrayElements = (parser, elements = []) => {
  const {value: token} = parser.lookAhead();
  if (token === parser.get(']')) {
    return elements;
  }
  const comma = parser.get(',');
  elements.push(parser.expression(parser.getInfixPrecedence(comma)));
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === comma) {
    parser.eat();
  }
  return parseArrayElements(parser, elements);
};
const parseArrayLiteralExpression = Prefix(ArrayExpression, (parser) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser)
  };
  parser.expect(']');
  return node;
});

const parsePropertyList = (parser, properties = []) => {
  const {value: nextToken} = parser.lookAhead();
  if (nextToken === parser.get('}')) {
    return properties;
  }
  if (nextToken !== parser.get(',')) {
    properties.push(parseObjectPropertyExpression(parser));
  } else {
    parser.eat();
  }
  return parsePropertyList(parser, properties);
};
const isPropertyName = (parser, token) => token === parser.get('[') || token.type === categories.Identifier || token.type === categories.NumericLiteral || token.type === categories.StringLiteral || token.isReserved === true;
const parseObjectPropertyExpression = Prefix(Property, parser => {
  const {value: nextToken} = parser.lookAhead();
  let key;
  let kind = 'init';
  let value = null;
  let computed = false;
  let shorthand = false;
  let method = false;
  if (isPropertyName(parser, nextToken)) {
    if (parser.eventually('[')) {
      computed = true;
      key = parser.expression();
      parser.expect(']');
    } else {
      key = parser.expression(20);
    }
    parser.expect(':');
    value = parser.expression(parser.getInfixPrecedence(parser.get(',')));
  }

  return {
    key,
    value,
    kind,
    computed,
    method,
    shorthand
  };
});
const parseObjectLiteralExpression = Prefix(ObjectExpression, (parser) => {
  parser.expect('{');
  const node = {
    properties: parsePropertyList(parser)
  };
  parser.expect('}');
  return node;
});

//infix
const asBinaryExpression = type => Infix(type, (parser, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
    operator: operator.value
  };
});
const parseArguments = (parser, expressions = []) => {
  const {value: parsableValue} = parser.lookAhead();
  const comma = parser.get(',');

  if (parsableValue === parser.get(')')) {
    return expressions;
  }

  expressions.push(parser.expression(parser.getInfixPrecedence(comma)));
  const {value: lookAhead} = parser.lookAhead();

  if (lookAhead !== comma) {
    return expressions;
  }
  parser.eat();
  return parseArguments(parser, expressions);
};
const parseAssignmentExpression = asBinaryExpression(AssignmentExpression);
const parseBinaryExpression = asBinaryExpression(BinaryExpression);
const parseLogicalExpression = asBinaryExpression(LogicalExpression);
const parseMemberAccessExpression = Infix(MemberExpression, (parser, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    object: left,
    computed: computed,
    property: computed ? parser.expression() : parseIdentifierExpression(parser)
  };
  if (computed) {
    parser.expect(']');
  }
  return node;
});
const parseUpdateExpression = Infix(UpdateExpression, (parser, left, operator) => ({
  type: 'UpdateExpression',
  argument: left,
  operator: operator.value,
  prefix: false
}));
const parseConditionalExpression = Infix(ConditionalExpression, (parser, test) => {
  const node = {
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','));
  node.consequent = parser.expression(commaPrecedence);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence);
  return node;
});
const parseCallExpression = Infix(CallExpression, (parser, callee) => {
  const node = {
    callee,
    arguments: parseArguments(parser)
  };
  parser.expect(')');
  return node;
});

const parseSequenceExpression = Infix(SequenceExpression, (parser, left) => {
  let node = left;
  const comma = parser.get(',');
  const next = parser.expression(parser.getInfixPrecedence(comma));
  if (left.type === 'SequenceExpression') {
    left.expressions.push(next);
  } else {
    node = {
      type: 'SequenceExpression',
      expressions: [left, next]
    };
  }
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
  prefixMap.set(registry.get('['), {parse: parseArrayLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('{'), {parse: parseObjectLiteralExpression, precedence: -1});
  //identifiers
  prefixMap.set(registry.get('this'), {parse: parseThisExpression, precedence: -1});
  prefixMap.set(categories.Identifier, {parse: parseIdentifierExpression, precedence: -1});
  //functions
  prefixMap.set(registry.get('function'), {parse: parseFunctionExpression, precedence: -1});
  prefixMap.set(registry.get('new'), {parse: parseNewExpression, precedence: 18});
  //group
  prefixMap.set(registry.get('('), {parse: parseGroupExpression, precedence: 20});


  const infixMap = new Map();
  //sequence
  infixMap.set(registry.get(','), {parse: parseSequenceExpression, precedence: 0});
  //conditional
  infixMap.set(registry.get('?'), {parse: parseConditionalExpression, precedence: 4});
  //assignment operators
  infixMap.set(registry.get('='), {parse: parseAssignmentExpression, precedence: 3});
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
  statementsMap.set(registry.get('if'),parseIfStatement);
  statementsMap.set(registry.get(';'),parseEmptyStatement);
  statementsMap.set(registry.get('{'),parseBlockStatement);
  statementsMap.set(registry.get('for'),parseForStatement);
  statementsMap.set(registry.get('var'),withEventualSemiColon(parseVariableDeclaration));
  statementsMap.set(registry.get('function'),parseFunctionDeclaration);
  statementsMap.set(registry.get('return'),withEventualSemiColon(parseReturnStatement));
  statementsMap.set(registry.get('break'),withEventualSemiColon(parseBreakStatement));
  statementsMap.set(registry.get('continue'),withEventualSemiColon(parseContinueStatement));
  statementsMap.set(registry.get('throw'),withEventualSemiColon(parseThrowStatement));
  statementsMap.set(registry.get('while'),withEventualSemiColon(parseWhileStatement));
  statementsMap.set(registry.get('do'),withEventualSemiColon(parseDoWhileStatement));
  statementsMap.set(registry.get('try'),parseTryStatement);
  statementsMap.set(registry.get('switch'),parseSwitchStatement);
  statementsMap.set(registry.get('with'),parseWithStatement);
  statementsMap.set(registry.get('debugger'),withEventualSemiColon(parseDebuggerStatement));
  statementsMap.set(categories.Identifier,parseExpressionOrLabeledStatement);

  return Object.assign(registry, {
    getInfix (token) {
      return infixMap.get(token.type);
    },
    getPrefix (token) {
      return prefixMap.get(token.type);
    },
    getStatement (token) {
      return statementsMap.get(token.type);
    },
    hasPrefix (token) {
      return prefixMap.has(token.type);
    },
    hasInfix (token) {
      return infixMap.has(token.type)
    },
    hasStatement (token) {
      return statementsMap.has(token.type);
    }
  });
};


var defaultRegistry$1 = ECMAScriptTokenRegistry();

//forward method of arrity one (more efficient than using spread operator on arguments)
const forwardArrityOne = (receiver, stream, ...methods) => {
  for (let m of methods) {
    receiver[m] = (arg) => stream[m](arg);
  }
  return receiver;
};

//a buffered stream token
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
    }, stream, 'allowRegexp', 'disallowRegexp');
  };
};

var stream = tokenStream({scanner: defaultScanner, tokenRegistry: defaultRegistry$1});

var source = plan()
  .test('the source should be iterable', t => {
    const s = stream('const answer = 42;');
    t.ok(s[Symbol.iterator], 'should be iterable');
  })
  .test('the source should be able to lookahead', t => {
    const s = stream('const answer = 42;')[Symbol.iterator]();
    t.equal(s.lookAhead().value.rawValue, 'const');
    t.equal(s.lookAhead().value.rawValue, 'const', 'should not have advanced the stream');
    t.equal(s.lookAhead(1).value.rawValue, 'answer', 'should be able to lookahead more than the next token');
    t.equal(s.next().value.rawValue, 'const', 'should not have advanced the stream');
  })
  .test('eat and advance n tokens', t => {
    const s = stream('const answer = 42;')[Symbol.iterator]();
    const last = s.eat(2);
    t.equal(last.value.rawValue, 'answer', 'should return the nth token');
    const next = s.next().value;
    t.equal(next.rawValue, '=', 'should have advanced the stream');
    const lastBis = s.eat().value;
    t.equal(lastBis.rawValue, '42', 'should eat one token by default');
  })
  .test('should advance the stream on token condition', t => {
    const s = stream('const answer = 42;')[Symbol.iterator]();
    const expected = s.expect(defaultRegistry$1.get('const')).value;
    t.equal(expected, defaultRegistry$1.get('const'), 'should have return the expected token');
  })
  .test('should throw an error if the next token is not the expected one', t => {
    try {
      const s = stream('const answer = 42;')[Symbol.iterator]();
      s.expect(defaultRegistry$1.get('if'));
      t.fail();
    } catch (e) {
      t.equal(e.message, 'Unexpected token: expected "if" but got "const"');
    }
  })
  .test('should eventually advance the stream on expected token', t => {
    const s = stream('const answer = 42;')[Symbol.iterator]();
    const expected = s.eventually(defaultRegistry$1.get('const'));
    t.equal(expected, true, 'should return true as the token is the expected one');
    t.equal(s.next().value.rawValue, 'answer', 'should have advanced the stream');
    const nextExpected = s.eventually(defaultRegistry$1.get('if'));
    t.equal(nextExpected, false, 'should return false as the token does not match');
    t.equal(s.next().value, defaultRegistry$1.get('='), 'should not have advanced the stream');
  })
  .test('should tokenize based on provided context for slash character', t => {
    const s = stream('/foo/')[Symbol.iterator]();
    s.disallowRegexp();
    const v = s.next().value;
    t.equal(v, defaultRegistry$1.get('/'), 'should have understood a div punctuator token');
    const sBis = stream('/foo/')[Symbol.iterator]();
    s.allowRegexp();
    const vBis = sBis.next().value;
    t.equal(vBis.type, categories.RegularExpressionLiteral, 'should have understood the next token to be a regular expression literal');
    t.equal(vBis.rawValue, '/foo/', 'should have understood the next token to be a regular expression literal');
  });

var tokens = plan()
  .test('token registry should extend lexical registry behaviour', t => {
    const registry = ECMAScriptTokenRegistry();
    t.equal(typeof registry.get, 'function', 'get should be defined as a function');
    t.equal(typeof registry.evaluate, 'function', 'evaluate should be define as a function');
    t.equal(registry.get('{').rawValue, '{', 'should refer to an existing token');
    t.equal(registry.evaluate({
      type: categories.Identifier,
      rawValue: '{'
    }), registry.get('{'), 'should be able to evaluate token');
  })
  .test('should have specific expression wise methods', t => {
    const registry = ECMAScriptTokenRegistry();
    t.ok(registry.hasInfix(registry.get('+')), 'should be able to lookup in its infix table');
    const plusInfix = registry.getInfix(registry.get('+'));
    t.equal(typeof plusInfix.parse, 'function', 'infix should have a parse function');
    t.equal(plusInfix.precedence, 13, 'should have the operator precedence as infix');
    t.ok(registry.hasPrefix(registry.get('+')), 'should be able to lookup in its prefix table');
    const plusPrefix = registry.getPrefix(registry.get('+'));
    t.equal(typeof plusPrefix.parse, 'function', 'prefix should have a parse function');
    t.equal(plusPrefix.precedence, 16, 'should have the operator precedence as prefix');
    t.ok(registry.hasStatement(registry.get('if')),'should be able to lookup in its statement keywords table');
    const ifToken = registry.getStatement(registry.get('if'));
    t.equal(typeof ifToken,'function','token should be mapped to a parse function');
  });

const parserFactory = (tokens = defaultRegistry$1) => {

  const getInfixPrecedence = operator => tokens.hasInfix(operator) ? tokens.getInfix(operator).precedence : -1;
  const getPrefixPrecedence = operator => tokens.hasPrefix(operator) ? tokens.getPrefix(operator).precedence : -1;

  const parseInfix = (parser, left, precedence, exits) => {
    parser.disallowRegexp();
    const {value: operator} = parser.lookAhead();
    if (!operator || precedence >= getInfixPrecedence(operator) || exits.includes(operator.type)) {
      return left;
    }
    parser.eat();
    parser.allowRegexp();
    const nextLeft = tokens.getInfix(operator).parse(parser, left, operator);
    return parseInfix(parser, nextLeft, precedence, exits);
  };

  return code => {

    const tokenStream = stream(code);

    const parser = Object.assign(forwardArrityOne({
        expect: symbol => tokenStream.expect(tokens.get(symbol)), //more convenient to have it from the symbol
        eventually: symbol => tokenStream.eventually(tokens.get(symbol)), //more convenient to have it from the symbol
        getInfixPrecedence,
        getPrefixPrecedence,
        expression (precedence = -1, exits = []) {
          parser.allowRegexp();
          const {value: token} = parser.lookAhead();
          if (!tokens.hasPrefix(token)) {
            if (token.isReserved === true) { // reserved words are allowed as identifier names (such in member expressions)
              parser.eat();
              return {type: 'Identifier', name: token.value};
            }
            return null;
          }
          const left = tokens.getPrefix(token).parse(parser);
          return parseInfix(parser, left, precedence, exits);
        },
        program () {
          return Program({
            body: parseStatementList(parser)
          });
        },
        module () {
          throw new Error('not implemented');
        },
      }, tokenStream, 'lookAhead', 'next', 'eat', 'allowRegexp', 'disallowRegexp'),
      tokens);

    return parser;
  };

};

const parseFunc = parserFactory();
const parse = code => parseFunc(code).expression();

var assignments = plan()
  .test('parse x=42', t => {
    t.deepEqual(parse('x=42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse (x)=(42)', t => {
    t.deepEqual(parse('(x)=(42)'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse ((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0', t => {
    t.deepEqual(parse('((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "a"},
      "operator": "=",
      "right": {"type": "Literal", "value": 0}
    });
  })
  .test('parse x <<= 2', t => {
    t.deepEqual(parse('x <<= 2'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 2}
    });
  })
  .test('parse eval = 42', t => {
    t.deepEqual(parse('eval = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "eval"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse arguments = 42', t => {
    t.deepEqual(parse('arguments = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "arguments"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x *= 42', t => {
    t.deepEqual(parse('x *= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "*=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x /= 42', t => {
    t.deepEqual(parse('x /= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "/=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x %= 42', t => {
    t.deepEqual(parse('x %= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "%=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x += 42', t => {
    t.deepEqual(parse('x += 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "+=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x -= 42', t => {
    t.deepEqual(parse('x -= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "-=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x <<= 42', t => {
    t.deepEqual(parse('x <<= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>= 42', t => {
    t.deepEqual(parse('x >>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>>= 42', t => {
    t.deepEqual(parse('x >>>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x &= 42', t => {
    t.deepEqual(parse('x &= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "&=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x ^= 42', t => {
    t.deepEqual(parse('x ^= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "^=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x |= 42', t => {
    t.deepEqual(parse('x |= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "|=",
      "right": {"type": "Literal", "value": 42}
    });
  });

var binary = plan()
  .test('parse x == y', t => {
    t.deepEqual(parse('x == y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "=="
    });
  })
  .test('parse x == 5', t => {
    t.deepEqual(parse('x == 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "=="
    });
  })
  .test('parse x == null', t => {
    t.deepEqual(parse('x == null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "=="
    });
  })
  .test('parse x == false', t => {
    t.deepEqual(parse('x == false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "=="
    });
  })
  .test('parse x == "woot woot"', t => {
    t.deepEqual(parse('x == "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "=="
    });
  })
  .test('parse x != y', t => {
    t.deepEqual(parse('x != y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!="
    });
  })
  .test('parse x != 5', t => {
    t.deepEqual(parse('x != 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!="
    });
  })
  .test('parse x != null', t => {
    t.deepEqual(parse('x != null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!="
    });
  })
  .test('parse x != false', t => {
    t.deepEqual(parse('x != false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!="
    });
  })
  .test('parse x != "woot woot"', t => {
    t.deepEqual(parse('x != "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!="
    });
  })
  .test('parse x === y', t => {
    t.deepEqual(parse('x === y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "==="
    });
  })
  .test('parse x === 5', t => {
    t.deepEqual(parse('x === 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "==="
    });
  })
  .test('parse x === null', t => {
    t.deepEqual(parse('x === null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "==="
    });
  })
  .test('parse x === false', t => {
    t.deepEqual(parse('x === false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "==="
    });
  })
  .test('parse x === "woot woot"', t => {
    t.deepEqual(parse('x === "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "==="
    });
  })
  .test('parse x !== y', t => {
    t.deepEqual(parse('x !== y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!=="
    });
  })
  .test('parse x !== 5', t => {
    t.deepEqual(parse('x !== 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!=="
    });
  })
  .test('parse x !== null', t => {
    t.deepEqual(parse('x !== null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!=="
    });
  })
  .test('parse x !== false', t => {
    t.deepEqual(parse('x !== false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!=="
    });
  })
  .test('parse x !== "woot woot"', t => {
    t.deepEqual(parse('x !== "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!=="
    });
  })
  .test('parse x < y', t => {
    t.deepEqual(parse('x < y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<"
    });
  })
  .test('parse x < 5', t => {
    t.deepEqual(parse('x < 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<"
    });
  })
  .test('parse x < null', t => {
    t.deepEqual(parse('x < null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<"
    });
  })
  .test('parse x < true', t => {
    t.deepEqual(parse('x < true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<"
    });
  })
  .test('parse x < "woot woot"', t => {
    t.deepEqual(parse('x < "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<"
    });
  })
  .test('parse x <= y', t => {
    t.deepEqual(parse('x <= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<="
    });
  })
  .test('parse x <= 5', t => {
    t.deepEqual(parse('x <= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<="
    });
  })
  .test('parse x <= null', t => {
    t.deepEqual(parse('x <= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<="
    });
  })
  .test('parse x <= true', t => {
    t.deepEqual(parse('x <= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<="
    });
  })
  .test('parse x <= "woot woot"', t => {
    t.deepEqual(parse('x <= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<="
    });
  })
  .test('parse x > y', t => {
    t.deepEqual(parse('x > y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">"
    });
  })
  .test('parse x > 5', t => {
    t.deepEqual(parse('x > 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">"
    });
  })
  .test('parse x > null', t => {
    t.deepEqual(parse('x > null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">"
    });
  })
  .test('parse x > true', t => {
    t.deepEqual(parse('x > true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">"
    });
  })
  .test('parse x > "woot woot"', t => {
    t.deepEqual(parse('x > "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">"
    });
  })
  .test('parse x >= y', t => {
    t.deepEqual(parse('x >= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">="
    });
  })
  .test('parse x >= 5', t => {
    t.deepEqual(parse('x >= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">="
    });
  })
  .test('parse x >= null', t => {
    t.deepEqual(parse('x >= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">="
    });
  })
  .test('parse x >= true', t => {
    t.deepEqual(parse('x >= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">="
    });
  })
  .test('parse x >= "woot woot"', t => {
    t.deepEqual(parse('x >= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">="
    });
  })
  .test('parse x << y', t => {
    t.deepEqual(parse('x << y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<<"
    });
  })
  .test('parse x << 5', t => {
    t.deepEqual(parse('x << 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<<"
    });
  })
  .test('parse x << null', t => {
    t.deepEqual(parse('x << null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<<"
    });
  })
  .test('parse x << true', t => {
    t.deepEqual(parse('x << true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<<"
    });
  })
  .test('parse x << "woot woot"', t => {
    t.deepEqual(parse('x << "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<<"
    });
  })
  .test('parse x >> y', t => {
    t.deepEqual(parse('x >> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>"
    });
  })
  .test('parse x >> 5', t => {
    t.deepEqual(parse('x >> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>"
    });
  })
  .test('parse x >> null', t => {
    t.deepEqual(parse('x >> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>"
    });
  })
  .test('parse x >> true', t => {
    t.deepEqual(parse('x >> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>"
    });
  })
  .test('parse x >> "woot woot"', t => {
    t.deepEqual(parse('x >> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>"
    });
  })
  .test('parse x >>> y', t => {
    t.deepEqual(parse('x >>> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>>"
    });
  })
  .test('parse x >>> 5', t => {
    t.deepEqual(parse('x >>> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>>"
    });
  })
  .test('parse x >>> null', t => {
    t.deepEqual(parse('x >>> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>>"
    });
  })
  .test('parse x >>> true', t => {
    t.deepEqual(parse('x >>> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>>"
    });
  })
  .test('parse x >>> "woot woot"', t => {
    t.deepEqual(parse('x >>> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>>"
    });
  })
  .test('parse x + y', t => {
    t.deepEqual(parse('x + y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "+"
    });
  })
  .test('parse x + 5', t => {
    t.deepEqual(parse('x + 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "+"
    });
  })
  .test('parse x + null', t => {
    t.deepEqual(parse('x + null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "+"
    });
  })
  .test('parse x + true', t => {
    t.deepEqual(parse('x + true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "+"
    });
  })
  .test('parse x + "woot woot"', t => {
    t.deepEqual(parse('x + "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "+"
    });
  })
  .test('parse x - y', t => {
    t.deepEqual(parse('x - y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "-"
    });
  })
  .test('parse x - 5', t => {
    t.deepEqual(parse('x - 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "-"
    });
  })
  .test('parse x - null', t => {
    t.deepEqual(parse('x - null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "-"
    });
  })
  .test('parse x - true', t => {
    t.deepEqual(parse('x - true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "-"
    });
  })
  .test('parse x - "woot woot"', t => {
    t.deepEqual(parse('x - "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "-"
    });
  })
  .test('parse x * y', t => {
    t.deepEqual(parse('x * y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "*"
    });
  })
  .test('parse x * 5', t => {
    t.deepEqual(parse('x * 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "*"
    });
  })
  .test('parse x * null', t => {
    t.deepEqual(parse('x * null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "*"
    });
  })
  .test('parse x * true', t => {
    t.deepEqual(parse('x * true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "*"
    });
  })
  .test('parse x * "woot woot"', t => {
    t.deepEqual(parse('x * "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "*"
    });
  })
  .test('parse x ** y', t => {
    t.deepEqual(parse('x ** y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "**"
    });
  })
  .test('parse x ** 5', t => {
    t.deepEqual(parse('x ** 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "**"
    });
  })
  .test('parse x ** null', t => {
    t.deepEqual(parse('x ** null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "**"
    });
  })
  .test('parse x ** true', t => {
    t.deepEqual(parse('x ** true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "**"
    });
  })
  .test('parse x ** "woot woot"', t => {
    t.deepEqual(parse('x ** "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "**"
    });
  })
  .test('parse x / y', t => {
    t.deepEqual(parse('x / y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "/"
    });
  })
  .test('parse x / 5', t => {
    t.deepEqual(parse('x / 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "/"
    });
  })
  .test('parse x / null', t => {
    t.deepEqual(parse('x / null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "/"
    });
  })
  .test('parse x / true', t => {
    t.deepEqual(parse('x / true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "/"
    });
  })
  .test('parse x / "woot woot"', t => {
    t.deepEqual(parse('x / "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "/"
    });
  })
  .test('parse x % y', t => {
    t.deepEqual(parse('x % y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "%"
    });
  })
  .test('parse x % 5', t => {
    t.deepEqual(parse('x % 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "%"
    });
  })
  .test('parse x % null', t => {
    t.deepEqual(parse('x % null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "%"
    });
  })
  .test('parse x % true', t => {
    t.deepEqual(parse('x % true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "%"
    });
  })
  .test('parse x % "woot woot"', t => {
    t.deepEqual(parse('x % "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "%"
    });
  })
  .test('parse x | y', t => {
    t.deepEqual(parse('x | y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "|"
    });
  })
  .test('parse x | 5', t => {
    t.deepEqual(parse('x | 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "|"
    });
  })
  .test('parse x | null', t => {
    t.deepEqual(parse('x | null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "|"
    });
  })
  .test('parse x | true', t => {
    t.deepEqual(parse('x | true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "|"
    });
  })
  .test('parse x | "woot woot"', t => {
    t.deepEqual(parse('x | "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "|"
    });
  })
  .test('parse x & y', t => {
    t.deepEqual(parse('x & y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&"
    });
  })
  .test('parse x & 5', t => {
    t.deepEqual(parse('x & 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "&"
    });
  })
  .test('parse x & null', t => {
    t.deepEqual(parse('x & null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&"
    });
  })
  .test('parse x & true', t => {
    t.deepEqual(parse('x & true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "&"
    });
  })
  .test('parse x & "woot woot"', t => {
    t.deepEqual(parse('x & "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&"
    });
  })
  .test('parse x ^ y', t => {
    t.deepEqual(parse('x ^ y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "^"
    });
  })
  .test('parse x ^ 5', t => {
    t.deepEqual(parse('x ^ 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "^"
    });
  })
  .test('parse x ^ null', t => {
    t.deepEqual(parse('x ^ null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "^"
    });
  })
  .test('parse x ^ false', t => {
    t.deepEqual(parse('x ^ false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "^"
    });
  })
  .test('parse x ^ "woot woot"', t => {
    t.deepEqual(parse('x ^ "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "^"
    });
  })
  .test('parse x in y', t => {
    t.deepEqual(parse('x in y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "in"
    });
  })
  .test('parse x in 5', t => {
    t.deepEqual(parse('x in 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "in"
    });
  })
  .test('parse x in null', t => {
    t.deepEqual(parse('x in null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "in"
    });
  })
  .test('parse x in true', t => {
    t.deepEqual(parse('x in true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "in"
    });
  })
  .test('parse x in "woot woot"', t => {
    t.deepEqual(parse('x in "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "in"
    });
  })
  .test('parse x instanceof y', t => {
    t.deepEqual(parse('x instanceof y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof 5', t => {
    t.deepEqual(parse('x instanceof 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof null', t => {
    t.deepEqual(parse('x instanceof null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof true', t => {
    t.deepEqual(parse('x instanceof true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof "woot woot"', t => {
    t.deepEqual(parse('x instanceof "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "instanceof"
    });
  });

var unary = plan()
  .test('parse +x', t => {
    t.deepEqual(parse('+x'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse +5', t => {
    t.deepEqual(parse('+5'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse +"woot woot"', t => {
    t.deepEqual(parse('+"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse +true', t => {
    t.deepEqual(parse('+true'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse +null', t => {
    t.deepEqual(parse('+null'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse -x', t => {
    t.deepEqual(parse('-x'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse -5', t => {
    t.deepEqual(parse('-5'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse -"woot woot"', t => {
    t.deepEqual(parse('-"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse -true', t => {
    t.deepEqual(parse('-true'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse -null', t => {
    t.deepEqual(parse('-null'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse !x', t => {
    t.deepEqual(parse('!x'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse !5', t => {
    t.deepEqual(parse('!5'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse !"woot woot"', t => {
    t.deepEqual(parse('!"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse !true', t => {
    t.deepEqual(parse('!true'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse !null', t => {
    t.deepEqual(parse('!null'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse ~x', t => {
    t.deepEqual(parse('~x'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse ~5', t => {
    t.deepEqual(parse('~5'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse ~"woot woot"', t => {
    t.deepEqual(parse('~"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse ~true', t => {
    t.deepEqual(parse('~true'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse ~null', t => {
    t.deepEqual(parse('~null'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse typeof x', t => {
    t.deepEqual(parse('typeof x'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse typeof 5', t => {
    t.deepEqual(parse('typeof 5'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse typeof "woot woot"', t => {
    t.deepEqual(parse('typeof "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse typeof true', t => {
    t.deepEqual(parse('typeof true'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse typeof null', t => {
    t.deepEqual(parse('typeof null'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse void x', t => {
    t.deepEqual(parse('void x'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse void 5', t => {
    t.deepEqual(parse('void 5'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse void "woot woot"', t => {
    t.deepEqual(parse('void "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse void true', t => {
    t.deepEqual(parse('void true'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse void null', t => {
    t.deepEqual(parse('void null'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse delete x', t => {
    t.deepEqual(parse('delete x'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse delete 5', t => {
    t.deepEqual(parse('delete 5'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse delete "woot woot"', t => {
    t.deepEqual(parse('delete "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse delete true', t => {
    t.deepEqual(parse('delete true'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse delete null', t => {
    t.deepEqual(parse('delete null'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  });

var thisExpr = plan()
  .test('parse this', t => {
    t.deepEqual(parse('this'), {type: 'ThisExpression'});
  });

var logical = plan()
  .test('parse x || y', t => {
    t.deepEqual(parse('x || y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "||"
    });
  })
  .test('parse x || 23.4', t => {
    t.deepEqual(parse('x || 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "||"
    });
  })
  .test('parse x || null', t => {
    t.deepEqual(parse('x || null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "||"
    });
  })
  .test('parse x || false', t => {
    t.deepEqual(parse('x || false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "||"
    });
  })
  .test('parse x || "woot woot"', t => {
    t.deepEqual(parse('x || "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "||"
    });
  })
  .test('parse x && y', t => {
    t.deepEqual(parse('x && y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&&"
    });
  })
  .test('parse x && 23.4', t => {
    t.deepEqual(parse('x && 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "&&"
    });
  })
  .test('parse x && null', t => {
    t.deepEqual(parse('x && null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&&"
    });
  })
  .test('parse x && false', t => {
    t.deepEqual(parse('x && false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "&&"
    });
  })
  .test('parse x && "woot woot"', t => {
    t.deepEqual(parse('x && "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&&"
    });
  });

var member = plan()
  .test('parse a.b', t => {
    t.deepEqual(parse('a.b'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": false,
      "property": {"type": "Identifier", "name": "b"}
    });
  })
  .test('parse a.catch', t => {
    t.deepEqual(parse('a.catch'), {
      type: 'MemberExpression',
      object: {type: 'Identifier', name: 'a'},
      computed: false,
      property: {type: 'Identifier', name: 'catch'}
    });
  })
  .test('parse foo.in.catch', t => {
    t.deepEqual(parse('foo.in.catch'),
      {
        type: 'MemberExpression',
        object:
          {
            type: 'MemberExpression',
            object: {type: 'Identifier', name: 'foo'},
            computed: false,
            property: {type: 'Identifier', name: 'in'}
          },
        computed: false,
        property: {type: 'Identifier', name: 'catch'}
      });
  })
  .test('parse a[foo]', t => {
    t.deepEqual(parse('a[foo]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Identifier", "name": "foo"}
    });
  })
  .test('parse a[2]', t => {
    t.deepEqual(parse('a[2]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Literal", "value": 2}
    });
  })
  .test('parse a[4+4]', t => {
    t.deepEqual(parse('a[4+4]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {
        "type": "BinaryExpression",
        "left": {"type": "Literal", "value": 4},
        "right": {"type": "Literal", "value": 4},
        "operator": "+"
      }
    });
  })
  .test('parse a["foo"+"bar"]', t => {
    t.deepEqual(parse('a["foo"+"bar"]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {
        "type": "BinaryExpression",
        "left": {"type": "Literal", "value": "foo"},
        "right": {"type": "Literal", "value": "bar"},
        "operator": "+"
      }
    });
  });

var update = plan()
  .test('parse a++', t => {
    t.deepEqual(parse('a++'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "++",
      "prefix": false
    });
  })
  .test('parse ++a', t => {
    t.deepEqual(parse('++a'), {
      "type": "UpdateExpression",
      "operator": "++",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse --a', t => {
    t.deepEqual(parse('--a'), {
      "type": "UpdateExpression",
      "operator": "--",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse a--', t => {
    t.deepEqual(parse('a--'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "--",
      "prefix": false
    });
  });

var literals = plan()
  .test('parse 0x3F3a', t => {
    t.deepEqual(parse('0x3F3a'), {"type": "Literal", "value": 0x3F3a});
  })
  .test('parse 0X3F3a', t => {
    t.deepEqual(parse('0X3F3a'), {"type": "Literal", "value": 0X3F3a});
  })
  .test('parse 0o3705', t => {
    t.deepEqual(parse('0o3705'), {"type": "Literal", "value": 0o3705});
  })
  .test('parse 0O3705', t => {
    t.deepEqual(parse('0O3705'), {"type": "Literal", "value": 0O3705});
  })
  .test('parse 0b0101011', t => {
    t.deepEqual(parse('0b0101011'), {"type": "Literal", "value": 0b0101011});
  })
  .test('parse 0B0101011', t => {
    t.deepEqual(parse('0B0101011'), {"type": "Literal", "value": 0B0101011});
  })
  .test('parse 123', t => {
    t.deepEqual(parse('123'), {"type": "Literal", "value": 123});
  })
  .test('parse 023', t => {
    t.deepEqual(parse('023'), {"type": "Literal", "value": 23});
  })
  .test('parse 34.', t => {
    t.deepEqual(parse('34.'), {"type": "Literal", "value": 34});
  })
  .test('parse .3435', t => {
    t.deepEqual(parse('.3435'), {"type": "Literal", "value": 0.3435});
  })
  .test('parse 345.767', t => {
    t.deepEqual(parse('345.767'), {"type": "Literal", "value": 345.767});
  })
  .test('parse .34e-1', t => {
    t.deepEqual(parse('.34e-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .34E-1', t => {
    t.deepEqual(parse('.34E-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .65e+3', t => {
    t.deepEqual(parse('.65e+3'), {"type": "Literal", "value": 650});
  })
  .test('parse .6E+3', t => {
    t.deepEqual(parse('.6E+3'), {"type": "Literal", "value": 600});
  })
  .test('parse .86e4', t => {
    t.deepEqual(parse('.86e4'), {"type": "Literal", "value": 8600});
  })
  .test('parse .34E4', t => {
    t.deepEqual(parse('.34E4'), {"type": "Literal", "value": 3400});
  })
  .test('parse 4545.4545e+5', t => {
    t.deepEqual(parse('4545.4545e+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E+5', t => {
    t.deepEqual(parse('4545.4545E+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e5', t => {
    t.deepEqual(parse('4545.4545e5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E5', t => {
    t.deepEqual(parse('4545.4545E5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e-5', t => {
    t.deepEqual(parse('4545.4545e-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 4545.4545E-5', t => {
    t.deepEqual(parse('4545.4545E-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 34e+5', t => {
    t.deepEqual(parse('34e+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E+5', t => {
    t.deepEqual(parse('34E+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e5', t => {
    t.deepEqual(parse('34e5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E5', t => {
    t.deepEqual(parse('34E5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e-5', t => {
    t.deepEqual(parse('34e-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse 34E-5', t => {
    t.deepEqual(parse('34E-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse \'foo\'', t => {
    t.deepEqual(parse('\'foo\''), {"type": "Literal", "value": "foo"});
  })
  .test('parse "foo"', t => {
    t.deepEqual(parse('"foo"'), {"type": "Literal", "value": "foo"});
  })
  .test('parse true', t => {
    t.deepEqual(parse('true'), {"type": "Literal", "value": true});
  })
  .test('parse false', t => {
    t.deepEqual(parse('false'), {"type": "Literal", "value": false});
  })
  .test('parse null', t => {
    t.deepEqual(parse('null'), {"type": "Literal", "value": null});
  })
  .test('parse /foo/i', t => {
    t.deepEqual(parse('/foo/i'), {
      type: 'Literal',
      value: /foo/i,
      regex: {pattern: 'foo', flags: 'i'}
    });
  })
  .test('parse /foo/', t => {
    t.deepEqual(parse('/foo/'), {
      type: 'Literal',
      value: /foo/,
      regex: {pattern: 'foo', flags: ''}
    });
  })
  .test('parse /[0-9]*/i', t => {
    t.deepEqual(parse('/[0-9]*/i'), {
      type: 'Literal',
      value: /[0-9]*/i,
      regex: {pattern: '[0-9]*', flags: 'i'}
    });
  })
  .test('parse /foo/gi', t => {
    t.deepEqual(parse('/foo/gi'), {"type": "Literal", "value": {}, "regex": {"pattern": "foo", "flags": "gi"}});
  })
  .test('parse (")")', t => {
    t.deepEqual(parse('(")")'), {"type": "Literal", "value": ")"}
    );
  });

var conditionals = plan()
  .test('parse a ? b : c', t => {
    t.deepEqual(parse('a ? b : c'), {
      "type": "ConditionalExpression",
      "test": {"type": "Identifier", "name": "a"},
      "consequent": {"type": "Identifier", "name": "b"},
      "alternate": {"type": "Identifier", "name": "c"}
    });
  })
  .test('parse true ? "foo" : 3.34', t => {
    t.deepEqual(parse('true ? "foo" : 3.34'), {
      "type": "ConditionalExpression",
      "test": {"type": "Literal", "value": true},
      "consequent": {"type": "Literal", "value": "foo"},
      "alternate": {"type": "Literal", "value": 3.34}
    });
  })
  .test('parse a ? b ? c : d : e', t => {
    t.deepEqual(parse('a ? b ? c : d : e'), {
      "type": "ConditionalExpression",
      "test": {"type": "Identifier", "name": "a"},
      "consequent": {
        "type": "ConditionalExpression",
        "test": {"type": "Identifier", "name": "b"},
        "consequent": {"type": "Identifier", "name": "c"},
        "alternate": {"type": "Identifier", "name": "d"}
      },
      "alternate": {"type": "Identifier", "name": "e"}
    });
  });

var call = plan()
  .test('parse foo()', t => {
    t.deepEqual(parse('foo()'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": []
    });
  })
  .test('parse foo(a)', t => {
    t.deepEqual(parse('foo(a)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,)', t => {
    t.deepEqual(parse('foo(a,)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,b)', t => {
    t.deepEqual(parse('foo(a,b)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    });
  })
  .test('parse foo(a,b,c)', t => {
    t.deepEqual(parse('foo(a,b,c)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    });
  })
  .test('parse foo(0.3,"foo",true,null)', t => {
    t.deepEqual(parse('foo(0.3,"foo",true,null)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Literal", "value": 0.3}, {"type": "Literal", "value": "foo"}, {
        "type": "Literal",
        "value": true
      }, {"type": "Literal", "value": null}]
    });
  })
  .test('parse f.g()', t => {
    t.deepEqual(parse('f.g()'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments: []
    });
  })
  .test('parse f.g(a)', t => {
    t.deepEqual(parse('f.g(a)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse f.g(a, b, c)', t => {
    t.deepEqual(parse('f.g(a, b, c)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse f.g.h(a,b,b)', t => {
    t.deepEqual(parse('f.g.h(a,b,b)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'f'},
              computed: false,
              property: {type: 'Identifier', name: 'g'}
            },
          computed: false,
          property: {type: 'Identifier', name: 'h'}
        },
      arguments:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'b'}]
    });
  });

var news = plan()
  .test('parse new a;', t => {
    t.deepEqual(parse('new a;'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a();', t => {
    t.deepEqual(parse('new a();'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a(b);', t => {
    t.deepEqual(parse('new a(b);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: [{type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse new a(b,c);', t => {
    t.deepEqual(parse('new a(b,c);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse new a(b,c,d);', t => {
    t.deepEqual(parse('new a(b,c,d);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}]
    });
  })
  .test('parse new a.b();', t => {
    t.deepEqual(parse('new a.b();'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: []
    });
  })
  .test('parse new a.b(c);', t => {
    t.deepEqual(parse('new a.b(c);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: [{type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse new a.b(c,d);', t => {
    t.deepEqual(parse('new a.b(c,d);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments:
        [{type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}]
    });
  })
  .test('parse new a.b(c,d,e);', t => {
    t.deepEqual(parse('new a.b(c,d,e);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments:
        [{type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'},
          {type: 'Identifier', name: 'e'}]
    });
  })
  .test('parse new a.b;', t => {
    t.deepEqual(parse('new a.b;'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: []
    });
  });

var precedences = plan()
  .test('parse foo += bar || blah && bim | woot ^ "true" & 34 !== hey < bim >>> 4 + true * blam ** !nope.test++ ', t => {
    t.deepEqual(parse('foo += bar || blah && bim | woot ^ "true" & 34 !== hey < bim >>> 4 + true * blam ** !nope.test++ '), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '+=',
      right:
        {
          type: 'LogicalExpression',
          left: {type: 'Identifier', name: 'bar'},
          right:
            {
              type: 'LogicalExpression',
              left: {type: 'Identifier', name: 'blah'},
              right:
                {
                  type: 'BinaryExpression',
                  left: {type: 'Identifier', name: 'bim'},
                  right:
                    {
                      type: 'BinaryExpression',
                      left: {type: 'Identifier', name: 'woot'},
                      right:
                        {
                          type: 'BinaryExpression',
                          left: {type: 'Literal', value: 'true'},
                          right:
                            {
                              type: 'BinaryExpression',
                              left: {type: 'Literal', value: 34},
                              right:
                                {
                                  type: 'BinaryExpression',
                                  left: {type: 'Identifier', name: 'hey'},
                                  right:
                                    {
                                      type: 'BinaryExpression',
                                      left: {type: 'Identifier', name: 'bim'},
                                      right:
                                        {
                                          type: 'BinaryExpression',
                                          left: {type: 'Literal', value: 4},
                                          right:
                                            {
                                              type: 'BinaryExpression',
                                              left: {type: 'Literal', value: true},
                                              right:
                                                {
                                                  type: 'BinaryExpression',
                                                  left: {type: 'Identifier', name: 'blam'},
                                                  right:
                                                    {
                                                      type: 'UnaryExpression',
                                                      operator: '!',
                                                      argument:
                                                        {
                                                          type: 'UpdateExpression',
                                                          argument:
                                                            {
                                                              type: 'MemberExpression',
                                                              object: {type: 'Identifier', name: 'nope'},
                                                              computed: false,
                                                              property: {type: 'Identifier', name: 'test'}
                                                            },
                                                          operator: '++',
                                                          prefix: false
                                                        },
                                                      prefix: true
                                                    },
                                                  operator: '**'
                                                },
                                              operator: '*'
                                            },
                                          operator: '+'
                                        },
                                      operator: '>>>'
                                    },
                                  operator: '<'
                                },
                              operator: '!=='
                            },
                          operator: '&'
                        },
                      operator: '^'
                    },
                  operator: '|'
                },
              operator: '&&'
            },
          operator: '||'
        }
    });
  })
  .test('parse foo = 4 + bar * test', t => {
    t.deepEqual(parse('foo = 4 + bar * test'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'bar'},
              right: {type: 'Identifier', name: 'test'},
              operator: '*'
            },
          operator: '+'
        }
    });
  })
  .test('parse foo = (4 + bar) * test', t => {
    t.deepEqual(parse('foo = (4 + bar) * test'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 4},
              right: {type: 'Identifier', name: 'bar'},
              operator: '+'
            },
          right: {type: 'Identifier', name: 'test'},
          operator: '*'
        }
    });
  })
  .test('parse foo = bar * test + 4', t => {
    t.deepEqual(parse('foo = bar * test + 4'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'bar'},
              right: {type: 'Identifier', name: 'test'},
              operator: '*'
            },
          right: {type: 'Literal', value: 4},
          operator: '+'
        }
    });
  })
  .test(`parse typeof obj === 'Object'`, t => {
    t.deepEqual(parse('typeof obj === \'Object\''), {
        "type": "BinaryExpression",
        "left": {
          "type": "UnaryExpression",
          "operator": "typeof",
          "argument": {"type": "Identifier", "name": "obj"},
          "prefix": true
        },
        "right": {"type": "Literal", "value": "Object"},
        "operator": "==="
      }
    );
  })
  .test(`parse new foo() + bar`, t => {
    t.deepEqual(parse('new foo() + bar'), {
        type: 'BinaryExpression',
        left: {
          type: 'NewExpression',
          callee: {type: 'Identifier', name: 'foo'},
          arguments: []
        },
        operator: '+',
        right: {type: 'Identifier', name: 'bar'}
      }
    );
  });

var sequence = plan()
  .test(`parse a =0,b++;`, t => {
    t.deepEqual(parse('a=0,b++;'), {
        type: 'SequenceExpression',
        expressions:
          [{
            type: 'AssignmentExpression',
            left: {type: 'Identifier', name: 'a'},
            operator: '=',
            right: {type: 'Literal', value: 0}
          },
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'b'},
              operator: '++',
              prefix: false
            }]
      }
    );
  })
  .test(`parse a,b;`, t => {
    t.deepEqual(parse('a,b;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    });
  })
  .test(`parse a,b,c;`, t => {
    t.deepEqual(parse('a,b,c;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    });
  });

var object = plan()
  .test('parse expression {}', t => {
    t.deepEqual(parse('{}'), {type: 'ObjectExpression', properties: []});
  })
  .test('parse expression {a:true}', t => {
    t.deepEqual(parse('{a:true}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Literal', value: true},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {catch:true, throw:foo}', t => {
    t.deepEqual(parse('{catch:true, throw:foo}'), {
      "type": "ObjectExpression",
      "properties": [{
        "type": "Property",
        "key": {"type": "Identifier", "name": "catch"},
        "value": {"type": "Literal", "value": true},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }, {
        "type": "Property",
        "key": {"type": "Identifier", "name": "throw"},
        "value": {"type": "Identifier", "name": "foo"},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }]
    });
  })
  .test(`parse expression {'a':foo}`, t => {
    t.deepEqual(parse(`{'a':foo}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 'a'},
          value: {type: 'Identifier', name: 'foo'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test(`parse expression = {1:'test'}`, t => {
    t.deepEqual(parse(`{1:'test'}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 1},
          value: {type: 'Literal', value: 'test'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {a:b}', t => {
    t.deepEqual(parse('{a:b}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {a:b,c:d}', t => {
    t.deepEqual(parse('{a:b,c:d}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'c'},
            value: {type: 'Identifier', name: 'd'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false
          }]
    });
  })
  .test('parse expression {[b]:foo}', t => {
    t.deepEqual(parse('{[b]:foo}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'foo'},
          kind: 'init',
          computed: true,
          method: false,
          shorthand: false
        }]
    });
  })
  .test(`parse expression {['a']:foo}`, t => {
    t.deepEqual(parse(`{['a']:foo}`), {
        "type": "ObjectExpression",
        "properties": [{
          "type": "Property",
          "key": {"type": "Literal", "value": "a"},
          "value": {"type": "Identifier", "name": "foo"},
          "kind": "init",
          "computed": true,
          "method": false,
          "shorthand": false
        }]
      }
    );
  })
  .test(`parse expression {a:b, 'c':d, [e]:f}`, t => {
    t.deepEqual(parse(`{a:b, 'c':d, [e]:f}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        },
          {
            type: 'Property',
            key: {type: 'Literal', value: 'c'},
            value: {type: 'Identifier', name: 'd'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false
          },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'e'},
            value: {type: 'Identifier', name: 'f'},
            kind: 'init',
            computed: true,
            method: false,
            shorthand: false
          }]
    });
  })
  .test(`parse expression {a:foo ? bim : bam, b:c}`, t => {
    t.deepEqual(parse(`{a:foo ? bim : bam, b:c}`), {
      "type": "ObjectExpression",
      "properties": [{
        "type": "Property",
        "key": {"type": "Identifier", "name": "a"},
        "value": {
          "type": "ConditionalExpression",
          "test": {"type": "Identifier", "name": "foo"},
          "consequent": {"type": "Identifier", "name": "bim"},
          "alternate": {"type": "Identifier", "name": "bam"}
        },
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }, {
        "type": "Property",
        "key": {"type": "Identifier", "name": "b"},
        "value": {"type": "Identifier", "name": "c"},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }]
    });
  });

var array = plan()
  .test('parse []', t => {
    t.deepEqual(parse('[]'), {type: 'ArrayExpression', elements: []});
  })
  .test('parse [a]', t => {
    t.deepEqual(parse('[a]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,b]', t => {
    t.deepEqual(parse('[a,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,a]', t => {
    t.deepEqual(parse('[,a]'), {
      type: 'ArrayExpression',
      elements: [null, {type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,]', t => {
    t.deepEqual(parse('[a,]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,,b]', t => {
    t.deepEqual(parse('[a,,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,,,a,,,b,,,]', t => {
    t.deepEqual(parse('[,,,a,,,b,,,]'), {
      type: 'ArrayExpression',
      elements:
        [null,
          null,
          null,
          {type: 'Identifier', name: 'a'},
          null,
          null,
          {type: 'Identifier', name: 'b'},
          null,
          null]
    });
  })
  .test('parse [a,,,b,]', t => {
    t.deepEqual(parse('[a,,,b,]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [[a,b],[c,,d],]', t => {
    t.deepEqual(parse('[[a,b],[c,,d],]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'ArrayExpression',
          elements:
            [{type: 'Identifier', name: 'a'},
              {type: 'Identifier', name: 'b'}]
        },
          {
            type: 'ArrayExpression',
            elements:
              [{type: 'Identifier', name: 'c'},
                null,
                {type: 'Identifier', name: 'd'}]
          }]
    });
  });

var functions = plan()
  .test('parse expression function (){foo++}', t => {
    t.deepEqual(parse('function (){foo++}'),{ type: 'FunctionExpression',
      params: [],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(){}', t => {
    t.deepEqual(parse('function a(){}'),{ type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b){}', t => {
    t.deepEqual(parse('function (b){}'),{ type: 'FunctionExpression',
      params: [ { type: 'Identifier', name: 'b' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b){foo++}', t => {
    t.deepEqual(parse('function a(b){foo++}'),{ type: 'FunctionExpression',
      params: [ { type: 'Identifier', name: 'b' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b,c){}', t => {
    t.deepEqual(parse('function (b,c){}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b,c){foo++}', t => {
    t.deepEqual(parse('function a(b,c){foo++}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b,c,d){}', t => {
    t.deepEqual(parse('function (b,c,d){}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b,c,d){foo++}', t => {
    t.deepEqual(parse('function a(b,c,d){foo++}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  });

var expressions = plan()
  .test(assignments)
  .test(binary)
  .test(unary)
  .test(thisExpr)
  .test(logical)
  .test(member)
  .test(update)
  .test(literals)
  .test(conditionals)
  .test(call)
  .test(news)
  .test(precedences)
  .test(sequence)
  .test(object)
  .test(array)
  .test(functions);

const parseFunc$1 = parserFactory();

const parse$1 = code => parseFunc$1(code).program();

var empty = plan()
  .test('parse ;', t => {
    t.deepEqual(parse$1(';').body,[ { type: 'EmptyStatement' } ]);
  })
  .test('parse ;;', t => {
    t.deepEqual(parse$1(';;').body,[ { type: 'EmptyStatement' }, { type: 'EmptyStatement' } ]);
  });

var ifStatements = plan()
  .test('parse if(a)b;', t => {
    t.deepEqual(parse$1('if(a)b;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate: null,
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a === 34)b', t => {
    t.deepEqual(parse$1('if(a === 34)b').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 34},
          operator: '==='
        },
      alternate: null,
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a)b;else c;', t => {
    t.deepEqual(parse$1('if(a)b;else c;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'c'}
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a === 34.34)b;else c', t => {
    t.deepEqual(parse$1('if(a === 34.34)b;else c').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 34.34},
          operator: '==='
        },
      alternate:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'c'}
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a)b;else if(c)d;', t => {
    t.deepEqual(parse$1('if(a)b;else if(c)d;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'IfStatement',
          test: {type: 'Identifier', name: 'c'},
          alternate: null,
          consequent:
            {
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'd'}
            }
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a <= "blah")b;else if(c >= f)d;', t => {
    t.deepEqual(parse$1('if(a <= "blah")b;else if(c >= f)d;').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 'blah'},
          operator: '<='
        },
      alternate:
        {
          type: 'IfStatement',
          test:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'c'},
              right: {type: 'Identifier', name: 'f'},
              operator: '>='
            },
          alternate: null,
          consequent:
            {
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'd'}
            }
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a){b}', t => {
    t.deepEqual(parse$1('if(a){b}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate: null,
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  })
  .test('parse if(a)b;else{c}', t => {
    t.deepEqual(parse$1('if(a)b;else{c}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'c'}
            }]
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a){b}else{c}', t => {
    t.deepEqual(parse$1('if(a){b}else{c}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'c'}
            }]
        },
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  })
  .test('parse if(a){b}else if(d){c}else{foo;}', t => {
    t.deepEqual(parse$1('if(a){b}else if(d){c}else{foo;}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'IfStatement',
          test: {type: 'Identifier', name: 'd'},
          alternate:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression: {type: 'Identifier', name: 'foo'}
                }]
            },
          consequent:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression: {type: 'Identifier', name: 'c'}
                }]
            }
        },
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  });

var whileStatements = plan()
  .test('parse while(foo <= 3.3)blah++;', t => {
    t.deepEqual(parse$1('while(foo <= 3.3)blah++;').body, [{
      type: 'WhileStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'foo'},
          right: {type: 'Literal', value: 3.3},
          operator: '<='
        },
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'blah'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test('parse while(foo <= 3.3)blah++', t => {
    t.deepEqual(parse$1('while(foo <= 3.3)blah++').body, [{
      type: 'WhileStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'foo'},
          right: {type: 'Literal', value: 3.3},
          operator: '<='
        },
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'blah'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test(`parse while(true){foo+=1;}`, t => {
    t.deepEqual(parse$1(`while(true){foo+=1;}`).body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'AssignmentExpression',
                  left: {type: 'Identifier', name: 'foo'},
                  operator: '+=',
                  right: {type: 'Literal', value: 1}
                }
            }]
        }
    }]);
  })
  .test(`parse while(true);`, t => {
    t.deepEqual(parse$1(`while(true);`).body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body: {type: 'EmptyStatement'}
    }]);
  });

var doWhile = plan()
  .test('parse do ; while(true);', t => {
    try {

      t.deepEqual(parse$1('do ; while(true);').body, [{
        type: 'DoWhileStatement',
        body: {type: 'EmptyStatement'},
        test: {type: 'Literal', value: true}
      }]);
    } catch (e){
      console.log(e);
      t.fail('todo');
    }
  })
  .test('parse do foo++; while(blah < 3);', t => {
    t.deepEqual(parse$1('do foo++; while(blah < 3);').body, [{
      type: 'DoWhileStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'foo'},
              operator: '++',
              prefix: false
            }
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'blah'},
          right: {type: 'Literal', value: 3},
          operator: '<'
        }
    }]);
  })
  .test('parse do {} while(false);', t => {
    t.deepEqual(parse$1('do {} while(false);').body, [{
      type: 'DoWhileStatement',
      body: {type: 'BlockStatement', body: []},
      test: {type: 'Literal', value: false}
    }]);
  })
  .test('parse do {foo++} while(blah < 3);', t => {
    t.deepEqual(parse$1('do {foo++} while(blah < 3);').body, [{
      type: 'DoWhileStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'blah'},
          right: {type: 'Literal', value: 3},
          operator: '<'
        }
    }]);
  });

var forStatements = plan()
  .test('parse for(var i = 0;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse$1('for(var i = 0;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(var i = 0, j=4;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse$1('for(var i = 0, j=4;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            },
              {
                type: 'VariableDeclarator',
                init: {type: 'Literal', value: 4},
                id: {type: 'Identifier', name: 'j'}
              }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(i=-1;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse$1('for(i=-1;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'AssignmentExpression',
          left: {type: 'Identifier', name: 'i'},
          operator: '=',
          right:
            {
              type: 'UnaryExpression',
              operator: '-',
              argument: {type: 'Literal', value: 1},
              prefix: true
            }
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse$1('for(;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init: null,
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(var i = 0;i<foo.length;i++)bar++;', t => {
    t.deepEqual(parse$1('for(var i = 0;i<foo.length;i++)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;i<foo.length;i++)bar++;', t => {
    t.deepEqual(parse$1('for(;i<foo.length;i++)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init: null,
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;;){bar++;}', t => {
    t.deepEqual(parse$1('for(;;){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for(;;)bar++;', t => {
    t.deepEqual(parse$1('for(;;)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for(;;);', t => {
    t.deepEqual(parse$1('for(;;);').body, [
      {
        type: 'ForStatement',
        body: {type: 'EmptyStatement'},
        init: null,
        test: null,
        update: null
      }]);
  })
  .test('parse for(;;){}', t => {
    t.deepEqual(parse$1('for(;;){}').body, [{
      type: 'ForStatement',
      body: {type: 'BlockStatement', body: []},
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for ( i = 0, l = 6;;) {}', t => {
    t.deepEqual(parse$1('for ( i = 0, l = 6;;) {}').body, [{
      type: 'ForStatement',
      body: {type: 'BlockStatement', body: []},
      init:
        {
          type: 'SequenceExpression',
          expressions:
            [{
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'i'},
              operator: '=',
              right: {type: 'Literal', value: 0}
            },
              {
                type: 'AssignmentExpression',
                left: {type: 'Identifier', name: 'l'},
                operator: '=',
                right: {type: 'Literal', value: 6}
              }]
        },
      test: null,
      update: null
    }]);
  });

var forIn = plan()
  .test('parse for(var p in blah){foo++;}', t => {
    t.deepEqual(parse$1('for(var p in blah){foo++;}').body, [{
      type: 'ForInStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      left:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: null,
              id: {type: 'Identifier', name: 'p'}
            }],
          kind: 'var'
        },
      right: {type: 'Identifier', name: 'blah'}
    }]);
  })
  .test('parse for(var p in blah.woot)foo++;', t => {
    t.deepEqual(parse$1('for(var p in blah.woot)foo++;').body, [{
      type: 'ForInStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'foo'},
              operator: '++',
              prefix: false
            }
        },
      left:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: null,
              id: {type: 'Identifier', name: 'p'}
            }],
          kind: 'var'
        },
      right:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'blah'},
          computed: false,
          property: {type: 'Identifier', name: 'woot'}
        }
    }]);
  })
  .test('parse for(name in foo){}', t => {
    t.deepEqual(parse$1('for(name in foo){}').body, [{
      type: 'ForInStatement',
      body: {type: 'BlockStatement', body: []},
      left: {type: 'Identifier', name: 'name'},
      right: {type: 'Identifier', name: 'foo'}
    }]);
  });

var varStatement = plan()
  .test('parse var foo, bar, woot;', t => {
    t.deepEqual(parse$1('var foo, bar, woot;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'bar'}
          },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'woot'}
          }],
      kind: 'var'
    }]);
  })
  .test('parse var foo;', t => {
    t.deepEqual(parse$1('var foo;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        }],
      kind: 'var'
    }]);
  })
  .test('parse var foo = 54, bar;', t => {
    t.deepEqual(parse$1('var foo = 54, bar;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: 54},
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'var'
    }]);
  })
  .test('parse var foo, bar=true;', t => {
    t.deepEqual(parse$1('var foo, bar=true;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: {type: 'Literal', value: true},
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'var'
    }]);
  });

var block = plan()
  .test('parse {var foo = 34.5}', t => {
    t.deepEqual(parse$1('{var foo = 34.5}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 34.5},
              id: {type: 'Identifier', name: 'foo'}
            }],
          kind: 'var'
        }]
    }]);
  })
  .test('parse {var foo = 34.5;}', t => {
    t.deepEqual(parse$1('{var foo = 34.5;}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 34.5},
              id: {type: 'Identifier', name: 'foo'}
            }],
          kind: 'var'
        }]
    }]);
  })
  .test('parse {foo=34.43}', t => {
    t.deepEqual(parse$1('{foo=34.43}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'foo'},
              operator: '=',
              right: {type: 'Literal', value: 34.43}
            }
        }]
    }]);
  })
  .test('parse {foo=34.43;}', t => {
    t.deepEqual(parse$1('{foo=34.43;}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'foo'},
              operator: '=',
              right: {type: 'Literal', value: 34.43}
            }
        }]
    }]);
  })
  .test('parse {f()}', t => {
    t.deepEqual(parse$1('{f()}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'f'},
              arguments: []
            }
        }]
    }]);
  })
  .test('parse {f();}', t => {
    t.deepEqual(parse$1('{f();}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'f'},
              arguments: []
            }
        }]
    }]);
  });
  //todo
  // .test('parse {[a,b]}', t => {
  //   t.deepEqual(parse('{[a,b]}').body, [{
  //     type: 'BlockStatement',
  //     body:
  //       [{
  //         type: 'ExpressionStatement',
  //         expression:
  //           {
  //             type: 'ArrayExpression',
  //             elements:
  //               [{type: 'Identifier', name: 'a'},
  //                 {type: 'Identifier', name: 'b'}]
  //           }
  //       }]
  //   }]);
  // })
  // .test('parse {[a,b];}', t => {
  //   t.deepEqual(parse('{[a,b];}').body, [{
  //     type: 'BlockStatement',
  //     body:
  //       [{
  //         type: 'ExpressionStatement',
  //         expression:
  //           {
  //             type: 'ArrayExpression',
  //             elements:
  //               [{type: 'Identifier', name: 'a'},
  //                 {type: 'Identifier', name: 'b'}]
  //           }
  //       }]
  //   }]);
  // })

var functions$1 = plan()
  .test('parse function a(){foo++}', t => {
    t.deepEqual(parse$1('function a(){foo++}').body, [{
      type: 'FunctionDeclaration',
      params: [],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(){}', t => {
    t.deepEqual(parse$1('function a(){}').body, [{
      type: 'FunctionDeclaration',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){}', t => {
    t.deepEqual(parse$1('function a(b){}').body, [{
      type: 'FunctionDeclaration',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){foo++}', t => {
    t.deepEqual(parse$1('function a(b){foo++}').body, [{
      type: 'FunctionDeclaration',
      params: [{type: 'Identifier', name: 'b'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c){}', t => {
    t.deepEqual(parse$1('function a(b,c){}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c){foo++}', t => {
    t.deepEqual(parse$1('function a(b,c){foo++}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c,d){}', t => {
    t.deepEqual(parse$1('function a(b,c,d){}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c,d){foo++}', t => {
    t.deepEqual(parse$1('function a(b,c,d){foo++}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  });

var returns = plan()
  .test('parse function a(){return}', t => {
    t.deepEqual(parse$1('function a(){return}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return;}', t => {
    t.deepEqual(parse$1('function a(){return;}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return blah}', t => {
    t.deepEqual(parse$1('function a(){return blah}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return blah;}', t => {
    t.deepEqual(parse$1('function a(){return blah;}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return 4+24%2}', t => {
    t.deepEqual(parse$1('function a(){return 4+24%2}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 24},
              right: {type: 'Literal', value: 2},
              operator: '%'
            },
          operator: '+'
        }
    });
  })
  .test('parse function a(){return 4+24%2;}', t => {
    t.deepEqual(parse$1('function a(){return 4+24%2;}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 24},
              right: {type: 'Literal', value: 2},
              operator: '%'
            },
          operator: '+'
        }
    });
  });

var labels = plan()
  .test('parse test:foo++;', t => {
    t.deepEqual(parse$1('test:foo++;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'test'},
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'foo'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test('parse bar:function blah(){}', t => {
    t.deepEqual(parse$1('bar:function blah(){}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'bar'},
      body:
        {
          type: 'FunctionDeclaration',
          params: [],
          body: {type: 'BlockStatement', body: []},
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'blah'}
        }
    }]);
  })
  .test('parse bar:{foo++;}', t => {
    t.deepEqual(parse$1('bar:{foo++;}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'bar'},
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        }
    }]);
  });

var switches = plan()
  .test('parse switch(foo){}', t => {
    t.deepEqual(parse$1('switch(foo){}').body, [{
      type: 'SwitchStatement',
      discriminant: {type: 'Identifier', name: 'foo'},
      cases: []
    }]);
  })
  .test(`parse switch(foo){
      case "bar":{
        foo++ 
        break;
      }
      case "blah":
      case "woot":
        break; 
      default:
        foo++;
   }`, t => {
    t.deepEqual(parse$1(`switch(foo){
      case "bar":{
        foo++ 
        break;
      }
      case "blah":
      case "woot":
        break; 
      default:
        foo++;
   }`).body, [{
      type: 'SwitchStatement',
      discriminant: {type: 'Identifier', name: 'foo'},
      cases:
        [{
          type: 'SwitchCase',
          test: {type: 'Literal', value: 'bar'},
          consequent:
            [{
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression:
                    {
                      type: 'UpdateExpression',
                      argument: {type: 'Identifier', name: 'foo'},
                      operator: '++',
                      prefix: false
                    }
                },
                  {type: 'BreakStatement', label: null}]
            }]
        },
          {
            type: 'SwitchCase',
            test: {type: 'Literal', value: 'blah'},
            consequent: []
          },
          {
            type: 'SwitchCase',
            test: {type: 'Literal', value: 'woot'},
            consequent: [{type: 'BreakStatement', label: null}]
          },
          {
            type: 'SwitchCase',
            test: null,
            consequent:
              [{
                type: 'ExpressionStatement',
                expression:
                  {
                    type: 'UpdateExpression',
                    argument: {type: 'Identifier', name: 'foo'},
                    operator: '++',
                    prefix: false
                  }
              }]
          }]
    }]);
  });

var breakStatements = plan()
  .test('parse while(true){break ;}', t => {
    t.deepEqual(parse$1('while(true){break ;}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'BreakStatement', label: null}]
        }
    }]);
  })
  .test('parse while(true){break}', t => {
    t.deepEqual(parse$1('while(true){break}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'BreakStatement', label: null}]
        }
    }]);
  })
  .test('parse block:while(true){break block;}', t => {
    t.deepEqual(parse$1('block:while(true){break block;}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'BreakStatement',
                  label: {type: 'Identifier', name: 'block'}
                }]
            }
        }
    }]);
  })
  .test('parse block:while(true)break block;', t => {
    t.deepEqual(parse$1('block:while(true)break block;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'BreakStatement',
              label: {type: 'Identifier', name: 'block'}
            }
        }
    }]);
  });

var continueStatements = plan()
  .test('parse while(true){continue ;}', t => {
    t.deepEqual(parse$1('while(true){continue ;}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'ContinueStatement', label: null}]
        }
    }]);
  })
  .test('parse while(true){continue}', t => {
    t.deepEqual(parse$1('while(true){continue}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'ContinueStatement', label: null}]
        }
    }]);
  })
  .test('parse block:while(true){continue block;}', t => {
    t.deepEqual(parse$1('block:while(true){continue block;}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ContinueStatement',
                  label: {type: 'Identifier', name: 'block'}
                }]
            }
        }
    }]);
  })
  .test('parse block:while(true)continue block;', t => {
    t.deepEqual(parse$1('block:while(true)continue block;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'ContinueStatement',
              label: {type: 'Identifier', name: 'block'}
            }
        }
    }]);
  });

var withStatements = plan()
  .test('parse with(foo)bar++;', t => {
    t.deepEqual(parse$1('with(foo)bar++;').body, [{
      type: 'WithStatement',
      object: {type: 'Identifier', name: 'foo'},
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test('parse with(foo.bar){test();}', t => {
    t.deepEqual(parse$1('with(foo.bar){test();}').body, [{
      type: 'WithStatement',
      object:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'foo'},
          computed: false,
          property: {type: 'Identifier', name: 'bar'}
        },
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'CallExpression',
                  callee: {type: 'Identifier', name: 'test'},
                  arguments: []
                }
            }]
        }
    }]);
  });

var throwStatements = plan()
  .test('parse throw new Error("foo")', t => {
    t.deepEqual(parse$1('throw new Error("foo")').body, [{
      type: 'ThrowStatement',
      argument:
        {
          type: 'NewExpression',
          callee: {type: 'Identifier', name: 'Error'},
          arguments: [{type: 'Literal', value: 'foo'}]
        }
    }]);
  })
  .test('parse throw foo;', t => {
    t.deepEqual(parse$1('throw foo;').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Identifier', name: 'foo'}
    }]);
  })
  .test('parse throw null', t => {
    t.deepEqual(parse$1('throw null').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Literal', value: null}
    }]);
  });

var tryCatch = plan()
  .test('parse try {} catch(e){}', t => {
    t.deepEqual(parse$1('try {} catch(e){}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler:
        {
          type: 'CatchClause',
          param: {type: 'Identifier', name: 'e'},
          body: {type: 'BlockStatement', body: []}
        },
      finalizer: null
    }]);
  })
  .test('parse try {} catch(e) {} finally {}', t => {
    t.deepEqual(parse$1('try {} catch(e) {} finally {}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler:
        {
          type: 'CatchClause',
          param: {type: 'Identifier', name: 'e'},
          body: {type: 'BlockStatement', body: []}
        },
      finalizer: {type: 'BlockStatement', body: []}
    }]);
  })
  .test('parse try {} finally {}', t => {
    t.deepEqual(parse$1('try {} finally {}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler: null,
      finalizer: {type: 'BlockStatement', body: []}
    }]);
  });

var statements = plan()
  .test(empty)
  .test(ifStatements)
  .test(whileStatements)
  .test(forStatements)
  .test(forIn)
  .test(varStatement)
  .test(block)
  .test(returns)
  .test(functions$1)
  .test(switches)
  .test(labels)
  .test(doWhile)
  .test(breakStatements)
  .test(continueStatements)
  .test(withStatements)
  .test(throwStatements)
  .test(tryCatch);

plan()
  .test(tokens)
  .test(source)
  .test(expressions)
  .test(statements)
  .run();

}());
//# sourceMappingURL=index.js.map
