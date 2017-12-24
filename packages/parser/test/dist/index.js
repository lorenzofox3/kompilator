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
  const holdContext = fn => () => {
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

const withEventualSemiColon = (fn) => (parser, params) => {
  const node = fn(parser, params);
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
  // return obj => Object.assign(defaultObj, obj);
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
const TemplateLiteral = nodeFactory({type: 'TemplateLiteral'}, {
  * [Symbol.iterator] () {
    yield* this.quasis;
    yield* this.expressions;
  }
});
const TemplateElement = nodeFactory({type: 'TemplateElement', tail: true});

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
  id: null
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

  if (node === null) {
    return node;
  }

  switch (node.type) {
    case 'ArrayPattern':
    case 'ObjectPattern':
    case 'AssignmentPattern':
    case 'RestElement':
    case 'Identifier':
      break; //skip
    case 'ArrayExpression':
      node.type = 'ArrayPattern';
      for (let ch of node) {
        toAssignable(ch); //recursive descent
      }
      break;
    case 'ObjectExpression':
      node.type = 'ObjectPattern';
      for (let prop of node) {
        if (prop.kind !== 'init' || prop.method) {
          throw new Error('can not convert property as a destructuring pattern');
        }
        toAssignable(prop.value);
      }
      break;
    case 'SpreadElement':
      node.type = 'RestElement';
      toAssignable(node.argument);
      break;
    case 'AssignmentExpression':
      if (node.operator !== '=') {
        throw new Error('can not reinterpret assignment expression with operator different than "="');
      }
      node.type = 'AssignmentPattern';
      delete node.operator;// operator is not relevant for assignment pattern
      toAssignable(node.left);// recursive descent
      break;
    default:
      throw new Error(`Unexpected node could not parse "${node.type}" as part of a destructuring pattern `);
  }
  return node;
};

// "array" parsing is shared across various components:
// - as array literals
// - as array pattern
const parseRestElement = composeArityTwo(RestElement, (parser, params) => {
  parser.expect('...');
  return {
    argument: parseBindingIdentifierOrPattern(parser, params)
  };
});
const parseSpreadExpression = composeArityTwo(SpreadElement, (parser, params) => {
  parser.expect('...');
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('...'), params | grammarParams.in))
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
  const fn = (parser, params, elements = []) => {
    const {value: next} = parser.lookAhead();
    const comma = parser.get(',');

    if (next === parser.get(']')) {
      return elements;
    }

    if (next === parser.get('...')) {
      elements.push(parseEllipsis(parser, params));
      parser.eventually(',');
      return fn(parser, params, elements);
    }

    if (next === comma) {
      parseArrayElision(parser, elements);
      return fn(parser, params, elements);
    }

    process(parser, params, elements);

    return fn(parser, params, elements);
  };
  return fn;
};
const parseArrayElements = arrayElements(parseSpreadExpression, (parser, params, elements) => {
  elements.push(parser.expression(parser.getInfixPrecedence(parser.get(',')), params | grammarParams.in));
  parser.eventually(',');
});
const parseArrayElementsBindingPattern = arrayElements(parseRestElement, (parser, params, elements) => {
  let element = parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    element = parseAssignmentPattern(parser, params | grammarParams.in, element);
  }
  elements.push(element);
  parser.eventually(',');
});

const parseArrayBindingPattern = composeArityTwo(ArrayPattern, (parser, params) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElementsBindingPattern(parser, params)
  };
  parser.expect(']');
  return node;
});
const parseArrayLiteralExpression = composeArityTwo(ArrayExpression, (parser, params) => {
  parser.expect('[');
  const node = {
    elements: parseArrayElements(parser, params)
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

const parseFormalParameterList = (parser, params, paramList = []) => {
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
const asPropertyFunction = (parser, params, prop) => {
  parser.expect('(');
  const paramList = parseFormalParameterList(parser, params);
  parser.expect(')');
  const body = parseBlockStatement(parser, params);
  return Object.assign(prop, {
    value: FunctionExpression({
      params: paramList,
      body
    })
  });
};
const parseClassMethod = composeArityTwo(MethodDefinition, (parser, params) => {
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

const parseFunctionDeclaration = composeArityTwo(FunctionDeclaration, (parser, params) => {
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
const parseFunctionExpression = composeArityTwo(FunctionExpression, (parser, params) => {
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
const parseArrowFunctionExpression = composeArityThree(ArrowFunctionExpression, (parser, params, left) => {
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

const parseCallExpression = composeArityThree(CallExpression, (parser, params, callee) => {
  const node = {
    callee,
    arguments: parseFunctionCallArguments(parser, params)
  };
  parser.expect(')');
  return node;
});

// "object" parsing is shared across various components:
// - as object literals
// - as object pattern
// - within class bodies as well

const asPropertyList = (parseDefinition) => {
  const fn = (parser, params, properties = []) => {
    const {value: nextToken} = parser.lookAhead();
    if (nextToken === parser.get('}')) {
      return properties;
    }

    if (parser.eventually(',')) {
      if (parser.eventually(',')) {
        throw new Error('Elision not allowed in object property list');
      }
    } else {
      properties.push(parseDefinition(parser, params));
    }
    return fn(parser, params, properties);
  };
  return fn;
};
const parseComputedPropertyName = (parser, params) => {
  parser.expect('[');
  const key = parser.expression(-1, params | grammarParams.in);
  parser.expect(']');
  return {
    key,
    computed: true
  };
};
const parseLiteralPropertyName = (parser, params) => ({key: parser.expression(20, params), computed: false});// max precedence => a literal or an identifier or a keyword

const parsePropertyName = (parser, params) => {
  const {value: next} = parser.lookAhead();
  return next === parser.get('[') ?
    parseComputedPropertyName(parser, params) :
    parseLiteralPropertyName(parser, params);
};
const parseWithValue = (parser, params, prop) => {
  prop = prop !== void 0 ? prop : parsePropertyName(parser, params);
  const {value: next} = parser.lookAhead();
  if (next === parser.get('(')) {
    //method
    return asPropertyFunction(parser, params, Object.assign(prop, {method: true}));
  } else if (next === parser.get(':')) {
    //with initializer
    parser.expect(':');
    return Object.assign(prop, {
      value: parser.expression(parser.getInfixPrecedence(parser.get(',')), params | grammarParams.in)
    });
  }
  throw new Error(`Unexpected token: expected ":" or "(" but got ${next.rawValue}`);
};
const parsePropertyDefinition = composeArityTwo(Property, (parser, params) => {
  let {value: next} = parser.lookAhead();
  let prop;
  const {value: secondNext} = parser.lookAhead(1);

  //binding reference
  if (next.type === categories.Identifier) {
    if ((secondNext === parser.get(',') || secondNext === parser.get('}'))) {
      const key = parseBindingIdentifier(parser, params);
      return {
        shorthand: true,
        key,
        value: key
      };
    }
    //cover Initialized grammar https://tc39.github.io/ecma262/#prod-CoverInitializedName
    if (secondNext === parser.get('=')) {
      const key = parseBindingIdentifier(parser, params);
      const value = parseAssignmentPattern(parser, params, key);
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
      prop = Object.assign(parsePropertyName(parser, params), {kind: accessor.rawValue});
      return asPropertyFunction(parser, params, prop);
    }

    prop = {
      key: Identifier({name: accessor.value})
    };
  }

  return parseWithValue(parser, params, prop);
});
const parsePropertyList = asPropertyList(parsePropertyDefinition);
const parseObjectLiteralExpression = composeArityTwo(ObjectExpression, (parser, params) => {
  parser.expect('{');
  const node = {
    properties: parsePropertyList(parser, params)
  };
  parser.expect('}');
  return node;
});

const parseSingleNameBindingProperty = (parser, params) => {
  const key = parseIdentifierName(parser, params);
  const shorthand = !parser.eventually(':');
  let value = shorthand ? key : parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    value = parseAssignmentPattern(parser, params | grammarParams.in, value);
  }
  return {shorthand, key, value};
};
const parsePropertyNameProperty = (parser, params) => {
  const property = parsePropertyName(parser, params);
  parser.expect(':');
  return Object.assign(property, {
    value: parseBindingIdentifierOrPattern(parser, params)
  });
};
const parseBindingProperty = (parser, params) => {
  const {value: next} = parser.lookAhead();
  const property = Property({});
  return next.type === categories.Identifier && parser.isReserved(next) === false ? //identifier but not reserved word
    Object.assign(property, parseSingleNameBindingProperty(parser, params)) :
    Object.assign(property, parsePropertyNameProperty(parser, params));
};
const parseBindingPropertyList = asPropertyList(parseBindingProperty);
const parseObjectBindingPattern = composeArityTwo(ObjectPattern, (parser, params) => {
  parser.expect('{');
  const node = {
    properties: parseBindingPropertyList(parser, params)
  };
  parser.expect('}');
  return node;
});

const parseClassElementList = (parser, params, elements = []) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('}')) {
    return elements;
  }

  if (!parser.eventually(';')) {
    elements.push(parseClassMethod(parser, params));
  }

  return parseClassElementList(parser, params, elements);
};
const parseClassBody = composeArityTwo(ClassBody, (parser, params) => {
  parser.expect('{');
  const node = {
    body: parseClassElementList(parser, params)
  };
  parser.expect('}');
  return node;
});

const parseClassTail = (parser, params, id) => {
  const superClass = parser.eventually('extends') ? parser.expression(-1, params) : null;
  return {
    id,
    superClass,
    body: parseClassBody(parser, params)
  };
};

const parseClassDeclaration = composeArityTwo(Class, (parser, params) => {
  parser.expect('class');
  const id = parseBindingIdentifier(parser, params);
  return parseClassTail(parser, params, id);
});
const parseClassExpression = composeArityTwo(ClassExpression, (parser, params) => {
  parser.expect('class');
  let id = null;
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier && next !== parser.get('extends')) {
    id = parseBindingIdentifier(parser);
  }
  return parseClassTail(parser, params, id);
});

const getNewParams$1 = params => params & ~(grammarParams.yield | grammarParams.await);
const parseNamedImport = (parser, params, specifiers) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const imported = parseIdentifierName(parser, getNewParams$1(params));
  let hasAs = false;
  if (parser.isReserved(next)) {
    parser.expect('as');
    hasAs = true;
  } else {
    hasAs = parser.eventually('as');
  }

  const local = hasAs ? parseBindingIdentifier(parser, getNewParams$1(params)) : imported;

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

  return parseNamedImport(parser, params, specifiers);
};
const parseImportDefaultSpecifier = (parser, params, specifiers) => {
  specifiers.push(ImportDefaultSpecifier({
    local: parseBindingIdentifier(parser, params)
  }));
  return specifiers;
};
const parseImportNamespaceSpecifier = (parser, params, specifiers) => {
  parser.expect('*');
  parser.expect('as');
  specifiers.push(ImportNamespaceSpecifier({
    local: parseBindingIdentifier(parser, params)
  }));
  return specifiers;
};
const parseImportClause = (parser, params, specifiers = []) => {
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier) {

    parseImportDefaultSpecifier(parser, params, specifiers);

    if (parser.eventually(',')) {
      const {value: next} = parser.lookAhead();

      if (next === parser.get('*')) {
        return parseImportNamespaceSpecifier(parser, params, specifiers);
      } else if (next === parser.get('{')) {
        parser.expect('{');
        parseNamedImport(parser, params, specifiers);
        parser.expect('}');
      } else {
        throw new Error(`expected "{" or "*"`);
      }
    }
    return specifiers;
  }

  if (next === parser.get('*')) {
    return parseImportNamespaceSpecifier(parser, params, specifiers);
  }

  parser.expect('{');
  parseNamedImport(parser, params, specifiers);
  parser.expect('}');
  return specifiers;
};
const parseFromClause = (parser, params) => {
  parser.expect('from');
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.StringLiteral) {
    throw new Error('Expected a string literal');
  }
  return parseLiteralExpression(parser, params);
};

const parseImportDeclaration = composeArityTwo(ImportDeclaration, (parser, params) => {
  parser.expect('import');
  const {value: next} = parser.lookAhead();
  if (next.type === categories.StringLiteral) {
    return {
      specifiers: [],
      source: parseLiteralExpression(parser, params)
    };
  }
  const specifiers = parseImportClause(parser, params);
  const source = parseFromClause(parser, params);
  return {
    source,
    specifiers
  };
});

const parseExportAllDeclaration = composeArityTwo(ExportAllDeclaration, (parser, params) => {
  parser.expect('*');
  return {
    source: parseFromClause(parser, params)
  };
});
const parseNamedExportDeclaration = (parser, params, specifiers = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const local = parseIdentifierName(parser, params);
  const exported = parser.eventually('as') ? parseIdentifierName(parser, params) : local;

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

  return parseNamedExportDeclaration(parser, params, specifiers);
};
const parseExportAsDeclaration = (fn) => composeArityTwo(ExportNamedDeclaration, (parser, params) => ({
  declaration: fn(parser, params)
}));
const parseExportAsDefaultDeclaration = (fn) => composeArityTwo(ExportDefaultDeclaration, (parser, params) => ({
  declaration: fn(parser, params)
}));
const parseExportDeclaration = (parser, params) => {
  parser.expect('export');
  const {value: next} = parser.lookAhead();
  switch (next) {
    case parser.get('*'):
      return parseExportAllDeclaration(parser, params);
    case parser.get('{'): {
      parser.expect('{');
      const node = ExportNamedDeclaration({
        specifiers: parseNamedExportDeclaration(parser, params)
      });
      parser.expect('}');
      const {value: next} = parser.lookAhead();
      node.source = next === parser.get('from') ? parseFromClause(parser, params) : null;
      return node;
    }
    case parser.get('var'):
      return parseExportAsDeclaration(parseVariableDeclaration)(parser, getNewParams$1(params));
    case parser.get('const'):
      return parseExportAsDeclaration(parseConstDeclaration)(parser, getNewParams$1(params));
    case parser.get('let'):
      return parseExportAsDeclaration(parseLetDeclaration)(parser, getNewParams$1(params));
    case parser.get('function'):
      return parseExportAsDeclaration(parseFunctionDeclaration)(parser, getNewParams$1(params));
    case parser.get('class'):
      return parseExportAsDeclaration(parseClassDeclaration)(parser, getNewParams$1(params));
    case parser.get('default'): {
      parser.expect('default');
      const {value: next} = parser.lookAhead();
      switch (next) {
        case parser.get('function'):
          return parseExportAsDefaultDeclaration(parseFunctionDeclaration)(parser, getNewParams$1(params));
        case parser.get('class'):
          return parseExportAsDefaultDeclaration(parseClassDeclaration)(parser, getNewParams$1(params));
        default:
          return parseExportAsDefaultDeclaration((parser, params) => parser.expression(-1, getNewParams$1(params) & grammarParams.in))(parser, params);
      }
    }
    default:
      throw new Error('Unknown export statement');
  }

};

// statements
// Note: Function declarations,class declarations, array and object binding pattern are in they own files

// statement list and blocks
const needToBreak = (parser, nextToken) => !(parser.hasStatement(nextToken) || parser.hasPrefix(nextToken)) || nextToken === parser.get('case') || nextToken === parser.get('default');
const parseStatementList = (parser, params, statements = []) => {
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
const parseBlockStatement = composeArityTwo(BlockStatement, (parser, params) => {
  parser.expect('{');
  const node = {
    body: parseStatementList(parser, params)
  };
  parser.expect('}');
  return node;
});
const parseStatement = (parser, params) => {
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
const parseModuleItemList = (parser, params, items = []) => {
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
const parseVariableDeclarator = composeArityTwo(VariableDeclarator, (parser, params) => {
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
  return composeArityTwo(VariableDeclaration, (parser, params) => {
    parser.expect(keyword);
    return {
      kind: keyword,
      declarations: parseVariableDeclarators(parser, params | modifier)
    };
  });
};
const parseVariableDeclaration = variableDeclaration('var');
const parseConstDeclaration = variableDeclaration('const');
const parseLetDeclaration = variableDeclaration('let');

const parseEmptyStatement = parser => {
  parser.expect(';');
  return EmptyStatement();
};

// expression
const parseExpressionStatement = composeArityTwo(ExpressionStatement, (parser, params) => ({
  expression: parser.expression(-1, params | grammarParams.in)
}));
const parseExpression = withEventualSemiColon(parseExpressionStatement);

const parseIfStatement = composeArityTwo(IfStatement, (parser, params) => {
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

const parseExpressionOrLabeledStatement = (parser, params) => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser, params) : parseExpression(parser, params);
};

const parseDoWhileStatement = composeArityTwo(DoWhileStatement, (parser, params) => {
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

const parseWhileStatement = composeArityTwo(WhileStatement, (parser, params) => {
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
const asFor = composeArityThree(ForStatement, (parser, params, init) => {
  parser.expect(';');
  const n = {
    init,
    test: parser.expression(-1, params | grammarParams.in)
  };
  parser.expect(';');
  n.update = parser.expression(-1, params | grammarParams.in);
  return n;
});
const asForIn = composeArityThree(ForInStatement, (parser, params, left) => {
  parser.expect('in');
  return {
    left,
    right: parser.expression(-1, params | grammarParams.in)
  };
});
const asForOf = composeArityThree(ForOfStatement, (parser, params, left) => {
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
const parseForStatement = (parser, params) => {
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
const parseCaseClause = composeArityTwo(SwitchCase, (parser, params) => {
  parser.expect('case');
  const test = parser.expression(-1, params | grammarParams.in);
  parser.expect(':');
  return {
    test,
    consequent: parseStatementList(parser, params)
  };
});
const parseDefaultClause = composeArityTwo(SwitchCase, (parser, params) => {
  parser.expect('default');
  parser.expect(':');
  return {
    test: null,
    consequent: parseStatementList(parser, params)
  };
});
const parseSwitchCases = (parser, params, cases = []) => {
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
const parseSwitchStatement = composeArityTwo(SwitchStatement, (parser, params) => {
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

const parseLabelIdentifier = composeArityTwo(Identifier, (parser, params) => {
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
const parseLabeledStatement = composeArityTwo(LabeledStatement, (parser, params) => {
  const node = {
    label: parseLabelIdentifier(parser, params)
  };
  parser.expect(':');
  node.body = parseStatement(parser, params & ~grammarParams.default);
  return node;
});
const parseBreakStatement = withLabel('break', BreakStatement);
const parseContinueStatement = withLabel('continue', ContinueStatement);

const parseReturnStatement = composeArityTwo(ReturnStatement, (parser, params) => {
  parser.expect('return');
  return {
    argument: parser.expression(-1, params | grammarParams.in)
  };
});

const parseWithStatement = composeArityTwo(WithStatement, (parser, params) => {
  parser.expect('with');
  parser.expect('(');
  const object = parser.expression(-1, params | grammarParams.in);
  parser.expect(')');
  return {
    object,
    body: parseStatement(parser, params)
  };
});

const parseThrowStatement = composeArityTwo(ThrowStatement, (parser, params) => {
  parser.expect('throw');
  return {
    argument: parser.expression(-1, params | grammarParams.in)
  };
});

const parseTryStatement = composeArityTwo(TryStatement, (parser, params) => {
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

const parseDebuggerStatement = parser => {
  parser.expect('debugger');
  return DebuggerStatement();
};

// identifiers and bindings
const parseBindingElement = (parser, params) => {
  const binding = parseBindingIdentifierOrPattern(parser, params);
  if (parser.eventually('=')) {
    return AssignmentPattern({
      left: binding,
      right: parser.expression(-1, params | grammarParams.in)
    });
  }
  return binding;
};
const parseBindingIdentifierOrPattern = (parser, params) => {
  const {value: next} = parser.lookAhead();
  if (next === parser.get('[')) {
    return parseArrayBindingPattern(parser, params);
  } else if (next === parser.get('{')) {
    return parseObjectBindingPattern(parser, params);
  }
  return parseBindingIdentifier(parser, params);
};
const parseBindingIdentifier = composeArityTwo(Identifier, (parser, params) => {
  const identifier = parseIdentifierName(parser, params);
  if (parser.isReserved(identifier.name)) {
    throw new Error(`can not use reseved word  ${identifier.name} as binding identifier`);
  }
  return identifier;
});
const parseIdentifierName = composeArityTwo(Identifier, (parser, params) => {
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  parser.eat();
  return {
    name: next.value
  };
});
const parseAssignmentPattern = composeArityThree(AssignmentPattern, (parser, params, left) => ({
  left,
  right: parser.expression(parser.getInfixPrecedence(parser.get(',')), params)
}));

// expressions based on Javascript operators whether they are "prefix" or "infix"
// Note: Functions and Class expressions, Object literals and Array literals are in their own files

//prefix
const asValue = (type, key) => composeArityOne(type, (parser) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => composeArityTwo(type, (parser, params) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token), params),
    prefix: true
  };
});
const parseGroupExpression = (parser, params) => {
  parser.expect('(');
  const exp = parser.expression(-1, params);
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
  };
});
const parseUpdateExpressionAsPrefix = asUnaryExpression(UpdateExpression);
const parseNewExpression = composeArityTwo(NewExpression, (parser, params) => {
  const {value: newToken} = parser.expect('new');
  const callee = parser.expression(parser.getPrefixPrecedence(newToken), params);
  return {
    callee: callee.callee ? callee.callee : callee,
    arguments: callee.arguments ? callee.arguments : []
  };
});
const parseYieldExpression = (parser, params) => {
  if (params & grammarParams.yield) {
    parser.expect('yield');
    const delegate = parser.eventually('*');
    return YieldExpression({
      argument: parser.expression(parser.getPrefixPrecedence(parser.get('yield')), params),
      delegate
    });
  }
  return parseIdentifierName(parser, params);
};
const parseTemplateElement = composeArityTwo(TemplateElement,(parser, params) => {
  const {value: next} = parser.next();
  return {
    value: {
      raw: next.rawValue,
      cooked: next.value
    }
  };
});
const parseTemplateLiteralExpression = composeArityTwo(TemplateLiteral, (parser, params) => {
  const node = {
    expressions: [],
    quasis: [parseTemplateElement(parser, params)]
  };

  return node;
});

//infix
const asBinaryExpression = type => composeArityFour(type, (parser, params, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator), params),
    operator: operator.value
  };
});
const parseEqualAssignmentExpression = composeArityFour(AssignmentExpression, (parser, params, left, operator) => {
  const {type} = left;
  if (type === 'ArrayExpression' || type === 'ObjectExpression') {
    toAssignable(left);
  }
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator), params),
    operator: operator.value
  };
});
const parseAssignmentExpression = asBinaryExpression(AssignmentExpression);
const parseBinaryExpression = asBinaryExpression(BinaryExpression);
const parseLogicalExpression = asBinaryExpression(LogicalExpression);
const parseMemberAccessExpression = composeArityFour(MemberExpression, (parser, params, left, operator) => {
  const computed = operator === parser.get('[');
  const node = {
    object: left,
    computed: computed,
    property: computed ? parser.expression(-1, params | grammarParams.in) : parseIdentifierName(parser)
  };
  if (computed) {
    parser.expect(']');
  }
  return node;
});
const parseUpdateExpression = composeArityFour(UpdateExpression, (parser, params, left, operator) => ({
  argument: left,
  operator: operator.value,
  prefix: false
}));
const parseConditionalExpression = composeArityThree(ConditionalExpression, (parser, params, test) => {
  const node = {
    test
  };
  const commaPrecedence = parser.getInfixPrecedence(parser.get(','), params);
  node.consequent = parser.expression(commaPrecedence, params | grammarParams.in);
  parser.expect(':');
  node.alternate = parser.expression(commaPrecedence, params);
  return node;
});
const parseSequenceExpression = composeArityThree(SequenceExpression, (parser, params, left) => {
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
  prefixMap.set(categories.Template, {
    parse: parseTemplateLiteralExpression,
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

var defaultRegistry$1 = ECMAScriptTokenRegistry();

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
            return null; //todo maybe throw ?
          }
          const left = tokens.getPrefix(token).parse(parser, params);
          return parseInfix(parser, params, left, precedence);
        },
        program (params = 0) {
          return Program({
            body: parseStatementList(parser, params)
          });
        },
        module (params = 0) {
          return Program({
            sourceType: 'module',
            body: parseModuleItemList(parser, params)
          });
        },
      }, tokenStream, 'lookAhead', 'next', 'eat', 'allowRegexp', 'disallowRegexp'),
      tokens);

    return parser;
  };

};

const parseModule = program => {
  const parse = parserFactory();
  return parse(program).module();
};

const parseExpression$1 = (expression,precedence = -1, params = 0) => {
  const parse = parserFactory();
  return parse(expression).expression(precedence, params);
};

const parseScript = program => {
  const parse = parserFactory();
  return parse(program).program();
};

 //alias

const parse = (code, params) => parseExpression$1(code, -1, params);

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
    t.deepEqual(parse('x in y', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "in"
    });
  })
  .test('parse x in 5', t => {
    t.deepEqual(parse('x in 5', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "in"
    });
  })
  .test('parse x in null', t => {
    t.deepEqual(parse('x in null', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "in"
    });
  })
  .test('parse x in true', t => {
    t.deepEqual(parse('x in true', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "in"
    });
  })
  .test('parse x in "woot woot"', t => {
    t.deepEqual(parse('x in "woot woot"', grammarParams.in), {
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
    t.deepEqual(parse('(")")'), {"type": "Literal", "value": ")"});
  })
  .only('parse `foo`', t => {
    t.deepEqual(parse('`foo`'), {
      "type": "TemplateLiteral", expressions: [], quasis: [
        {type: 'TemplateElement', tail: true, value: {raw: 'foo', cooked: 'foo'}},
      ]
    });
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
  })
  .test('parse f(...a)', t => {
    t.deepEqual(parse('f(...a)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'a'}
        }]
    });
  })
  .test('parse f(a,...b)', t => {
    t.deepEqual(parse('f(a,...b)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  })
  .test('parse f(a,...b,)', t => {
    t.deepEqual(parse('f(a,...b,)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  })
  .test('parse f(...a,...b,)', t => {
    t.deepEqual(parse('f(...a,...b,)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments: [{
        type: 'SpreadElement',
        argument: {type: 'Identifier', name: 'a'}
      },
        {
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        }]
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
  })
  .test('parse expression {get test(){}}', t => {
    t.deepEqual(parse('{get test(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'get',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {get: function(){}}', t => {
    t.deepEqual(parse('{get: function(){}}'), {
        "type": "ObjectExpression",
        "properties": [{
          "type": "Property",
          "kind": "init",
          "value": {
            "type": "FunctionExpression",
            "id": null,
            "async": false,
            "generator": false,
            "params": [],
            "body": {"type": "BlockStatement", "body": []}
          },
          "computed": false,
          "shorthand": false,
          "method": false,
          "key": {"type": "Identifier", "name": "get"}
        }]
      }
    );
  })
  .test('parse expression {set test(val){}}', t => {
    t.deepEqual(parse('{set test(val){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [{type: 'Identifier', name: 'val'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'set',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {get(){}}', t => {
    t.deepEqual(parse('{get(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'get'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(){}}', t => {
    t.deepEqual(parse('{test(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(foo){}}', t => {
    t.deepEqual(parse('{test(foo){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [{type: 'Identifier', name: 'foo'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(foo, bar){}}', t => {
    t.deepEqual(parse('{test(foo, bar){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params:
                [{type: 'Identifier', name: 'foo'},
                  {type: 'Identifier', name: 'bar'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {[foo](){}}', t => {
    t.deepEqual(parse('{[foo](){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'foo'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: true,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {5(){}}', t => {
    t.deepEqual(parse('{5(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 5},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {"test"(){}}', t => {
    t.deepEqual(parse('{"test"(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression{b}', t => {
    t.deepEqual(parse('{b}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: true
        }]
    });
  })
  .test('parse expression{b, c}', t => {
    t.deepEqual(parse('{b, c}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: true
        },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'c'},
            value: {type: 'Identifier', name: 'c'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: true
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
  })
  .test('parse [,...b]', t => {
    t.deepEqual(parse('[,...b]'), {
      type: 'ArrayExpression',
      elements:
        [null,
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  })
  .test('parse [...b]', t => {
    t.deepEqual(parse('[...b]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        }]
    });
  })
  .test('parse [b,...c]', t => {
    t.deepEqual(parse('[b,...c]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'b'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'c'}
          }]
    });
  })
  .test('parse [...b,...c]', t => {
    t.deepEqual(parse('[...b,...c]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        },
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'c'}
          }]
    });
  })
  .test('parse [a = b, 4+3, function(){}]', t => {
    t.deepEqual(parse('[a = b, 4+3, function(){}]'), {
        "type": "ArrayExpression",
        "elements": [{
          "type": "AssignmentExpression",
          "left": {"type": "Identifier", "name": "a"},
          "right": {"type": "Identifier", "name": "b"},
          "operator": "="
        }, {
          "type": "BinaryExpression",
          "left": {"type": "Literal", "value": 4},
          "right": {"type": "Literal", "value": 3},
          "operator": "+"
        }, {
          "type": "FunctionExpression",
          "id": null,
          "async": false,
          "generator": false,
          "params": [],
          "body": {"type": "BlockStatement", "body": []}
        }]
      }
    );
  });

var functions = plan()
  .test('parse expression function (){foo++}', t => {
    t.deepEqual(parse('function (){foo++}'), {
      type: 'FunctionExpression',
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
      id: null
    });
  })
  .test('parse expression function *(){foo++}', t => {
    t.deepEqual(parse('function *(){foo++}'), {
      type: 'FunctionExpression',
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
      generator: true,
      id: null
    });
  })
  .test('parse expression function a(){}', t => {
    t.deepEqual(parse('function a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function *a(){}', t => {
    t.deepEqual(parse('function *a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function (b){}', t => {
    t.deepEqual(parse('function (b){}'), {
      type: 'FunctionExpression',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b){foo++}', t => {
    t.deepEqual(parse('function a(b){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (b,c){}', t => {
    t.deepEqual(parse('function (b,c){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b,c){foo++}', t => {
    t.deepEqual(parse('function a(b,c){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (b,c,d){}', t => {
    t.deepEqual(parse('function (b,c,d){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b,c,d){foo++}', t => {
    t.deepEqual(parse('function a(b,c,d){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (...b){}', t => {
    t.deepEqual(parse('function (...b){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'RestElement',
        argument: {type: 'Identifier', name: 'b'}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (aa,...b){}', t => {
    t.deepEqual(parse('function (aa,...b){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'aa'},
          {
            type: 'RestElement',
            argument: {type: 'Identifier', name: 'b'}
          }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (aa,b = c){}', t => {
    t.deepEqual(parse('function (aa,b = c){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'aa'},
          {
            type: 'AssignmentPattern',
            left: {type: 'Identifier', name: 'b'},
            right: {type: 'Identifier', name: 'c'}
          }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (b = c){}', t => {
    t.deepEqual(parse('function (b = c){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'AssignmentPattern',
        left: {type: 'Identifier', name: 'b'},
        right: {type: 'Identifier', name: 'c'}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function ([a,{b:{c:d}}] = {}){}', t => {
    t.deepEqual(parse('function ([a,{b:{c:d}}] = {}){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'AssignmentPattern',
        left:
          {
            type: 'ArrayPattern',
            elements:
              [{type: 'Identifier', name: 'a'},
                {
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'b'},
                      computed: false,
                      value:
                        {
                          type: 'ObjectPattern',
                          properties:
                            [{
                              type: 'Property',
                              kind: 'init',
                              key: {type: 'Identifier', name: 'c'},
                              computed: false,
                              value: {type: 'Identifier', name: 'd'},
                              method: false,
                              shorthand: false
                            }]
                        },
                      method: false,
                      shorthand: false
                    }]
                }]
          },
        right: {type: 'ObjectExpression', properties: []}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse () => {}', t => {
    t.deepEqual(parse('() => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => {}', t => {
    t.deepEqual(parse('a => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a) => {}', t => {
    t.deepEqual(parse('(a) => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse ()=>({})', t => {
    t.deepEqual(parse('()=>({})'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'ObjectExpression', properties: []},
      params: [],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a =>({})', t => {
    t.deepEqual(parse('a =>({})'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'ObjectExpression', properties: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => a', t => {
    t.deepEqual(parse('a => a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => a+b', t => {
    t.deepEqual(parse('a => a+b'), {
      type: 'ArrowFunctionExpression',
      body:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Identifier', name: 'b'},
          operator: '+'
        },
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a,b,c,d) => a', t => {
    t.deepEqual(parse('(a,b) => a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse ({a})=>a', t => {
    t.deepEqual(parse('({a})=>a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params:
        [{
          type: 'ObjectPattern',
          properties:
            [{
              type: 'Property',
              key: {type: 'Identifier', name: 'a'},
              value: {type: 'Identifier', name: 'a'},
              kind: 'init',
              computed: false,
              method: false,
              shorthand: true
            }]
        }],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a, ...b) => a+b', t => {
    t.deepEqual(parse('(a, ...b) => a+b'), {
      type: 'ArrowFunctionExpression',
      body:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Identifier', name: 'b'},
          operator: '+'
        },
      params:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'RestElement',
            argument: {type: 'Identifier', name: 'b'}
          }],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  });

var klass = plan()
  .test('parse class test{}', t => {
    t.deepEqual(parse('class test{}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {}', t => {
    t.deepEqual(parse('class {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {;}', t => {
    t.deepEqual(parse('class {;}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class test{;;}', t => {
    t.deepEqual(parse('class test{;;}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {constructor(){}foo(){}}', t => {
    t.deepEqual(parse('class {constructor(){}foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'constructor'},
              kind: 'constructor',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'foo'},
                kind: 'method',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class {get blah(){}set blah(foo){}}', t => {
    t.deepEqual(parse('class {get blah(){}set blah(foo){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'blah'},
              kind: 'get',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'blah'},
                kind: 'set',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class test{get(){}set(foo){}}', t => {
    t.deepEqual(parse('class test{get(){}set(foo){}}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'get'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'set'},
                kind: 'method',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class {foo(){}}', t => {
    t.deepEqual(parse('class {foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class {[foo](){}}', t => {
    t.deepEqual(parse('class {[foo](){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: true,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class test{"foo"(){}}', t => {
    t.deepEqual(parse('class test{"foo"(){}}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class {5(){}}', t => {
    t.deepEqual(parse('class {5(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 5},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class extends b {}', t => {
    t.deepEqual(parse('class extends b {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: {type: 'Identifier', name: 'b'},
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class a extends b.c {}', t => {
    t.deepEqual(parse('class a extends b.c {}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'a'},
      superClass:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'b'},
          computed: false,
          property: {type: 'Identifier', name: 'c'}
        },
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {static hello(){}static get foo(){}}', t => {
    t.deepEqual(parse('class {static hello(){}static get foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'hello'},
              kind: 'method',
              static: true,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'foo'},
                kind: 'get',
                static: true,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  });

const parse$2 = code => parseScript(code);

var yieldExpression$1 = plan()
  .test('parse function *test(){yield foo;}', t => {
    t.deepEqual(parse$2('function *test(){yield foo;}').body, [{
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
                  type: 'YieldExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  delegate: false
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield *foo.bar;}', t => {
    t.deepEqual(parse$2('function *test(){yield *foo.bar;}').body, [{
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
                  type: 'YieldExpression',
                  argument:
                    {
                      type: 'MemberExpression',
                      object: {type: 'Identifier', name: 'foo'},
                      computed: false,
                      property: {type: 'Identifier', name: 'bar'}
                    },
                  delegate: true
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield 4+3;}', t => {
    t.deepEqual(parse$2('function *test(){yield 4+3;}').body, [{
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
                  type: 'YieldExpression',
                  argument:
                    {
                      type: 'BinaryExpression',
                      left: {type: 'Literal', value: 4},
                      right: {type: 'Literal', value: 3},
                      operator: '+'
                    },
                  delegate: false
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield 4,5;}', t => {
    t.deepEqual(parse$2('function *test(){yield 4,5;}').body, [{
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
                  type: 'SequenceExpression',
                  expressions:
                    [{
                      type: 'YieldExpression',
                      argument: {type: 'Literal', value: 4},
                      delegate: false
                    },
                      {type: 'Literal', value: 5}]
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
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
  .test(functions)
  .test(klass)
  .test(yieldExpression$1);

var empty = plan()
  .test('parse ;', t => {
    t.deepEqual(parse$2(';').body,[ { type: 'EmptyStatement' } ]);
  })
  .test('parse ;;', t => {
    t.deepEqual(parse$2(';;').body,[ { type: 'EmptyStatement' }, { type: 'EmptyStatement' } ]);
  });

var ifStatements = plan()
  .test('parse if(a)b;', t => {
    t.deepEqual(parse$2('if(a)b;').body, [{
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
    t.deepEqual(parse$2('if(a === 34)b').body, [{
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
    t.deepEqual(parse$2('if(a)b;else c;').body, [{
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
    t.deepEqual(parse$2('if(a === 34.34)b;else c').body, [{
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
    t.deepEqual(parse$2('if(a)b;else if(c)d;').body, [{
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
    t.deepEqual(parse$2('if(a <= "blah")b;else if(c >= f)d;').body, [{
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
    t.deepEqual(parse$2('if(a){b}').body, [{
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
    t.deepEqual(parse$2('if(a)b;else{c}').body, [{
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
    t.deepEqual(parse$2('if(a){b}else{c}').body, [{
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
    t.deepEqual(parse$2('if(a){b}else if(d){c}else{foo;}').body, [{
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
    t.deepEqual(parse$2('while(foo <= 3.3)blah++;').body, [{
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
    t.deepEqual(parse$2('while(foo <= 3.3)blah++').body, [{
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
    t.deepEqual(parse$2(`while(true){foo+=1;}`).body, [{
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
    t.deepEqual(parse$2(`while(true);`).body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body: {type: 'EmptyStatement'}
    }]);
  });

var doWhile = plan()
  .test('parse do ; while(true);', t => {
    try {

      t.deepEqual(parse$2('do ; while(true);').body, [{
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
    t.deepEqual(parse$2('do foo++; while(blah < 3);').body, [{
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
    t.deepEqual(parse$2('do {} while(false);').body, [{
      type: 'DoWhileStatement',
      body: {type: 'BlockStatement', body: []},
      test: {type: 'Literal', value: false}
    }]);
  })
  .test('parse do {foo++} while(blah < 3);', t => {
    t.deepEqual(parse$2('do {foo++} while(blah < 3);').body, [{
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
    t.deepEqual(parse$2('for(var i = 0;i<foo.length;i++){bar++;}').body, [{
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
    t.deepEqual(parse$2('for(var i = 0, j=4;i<foo.length;i++){bar++;}').body, [{
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
    t.deepEqual(parse$2('for(i=-1;i<foo.length;i++){bar++;}').body, [{
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
    t.deepEqual(parse$2('for(;i<foo.length;i++){bar++;}').body, [{
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
    t.deepEqual(parse$2('for(var i = 0;i<foo.length;i++)bar++;').body, [{
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
    t.deepEqual(parse$2('for(;i<foo.length;i++)bar++;').body, [{
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
    t.deepEqual(parse$2('for(;;){bar++;}').body, [{
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
    t.deepEqual(parse$2('for(;;)bar++;').body, [{
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
    t.deepEqual(parse$2('for(;;);').body, [
      {
        type: 'ForStatement',
        body: {type: 'EmptyStatement'},
        init: null,
        test: null,
        update: null
      }]);
  })
  .test('parse for(;;){}', t => {
    t.deepEqual(parse$2('for(;;){}').body, [{
      type: 'ForStatement',
      body: {type: 'BlockStatement', body: []},
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for ( i = 0, l = 6;;) {}', t => {
    t.deepEqual(parse$2('for ( i = 0, l = 6;;) {}').body, [{
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

plan()
  .test('parse for(var p in blah){foo++;}', t => {
    t.deepEqual(parse$2('for(var p in blah){foo++;}').body, [{
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
    t.deepEqual(parse$2('for(var p in blah.woot)foo++;').body, [{
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
    t.deepEqual(parse$2('for(name in foo){}').body, [{
      type: 'ForInStatement',
      body: {type: 'BlockStatement', body: []},
      left: {type: 'Identifier', name: 'name'},
      right: {type: 'Identifier', name: 'foo'}
    }]);
  })

plan()
  .test('parse for(var p of blah){foo++;}', t => {
    t.deepEqual(parse$2('for(var p of blah){foo++;}').body, [{
      type: 'ForOfStatement',
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
  .test('parse for(var p of blah.woot)foo++;', t => {
    t.deepEqual(parse$2('for(var p of blah.woot)foo++;').body, [{
      type: 'ForOfStatement',
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
  .test('parse for(name of foo){}', t => {
    t.deepEqual(parse$2('for(name of foo){}').body, [{
      type: 'ForOfStatement',
      body: {type: 'BlockStatement', body: []},
      left: {type: 'Identifier', name: 'name'},
      right: {type: 'Identifier', name: 'foo'}
    }]);
  })

var varStatement = plan()
  .test('parse var foo, bar, woot;', t => {
    t.deepEqual(parse$2('var foo, bar, woot;').body, [{
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
    t.deepEqual(parse$2('var foo;').body, [{
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
    t.deepEqual(parse$2('var foo = 54, bar;').body, [{
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
    t.deepEqual(parse$2('var foo, bar=true;').body, [{
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
  })
  .test('parse var foo = (a,b,c) => a+b+c;', t => {
    t.deepEqual(parse$2('var foo = (a,b,c) => a+b+c;').body, [{
      "type": "VariableDeclaration",
      "kind": "var",
      "declarations": [{
        "type": "VariableDeclarator",
        "id": {"type": "Identifier", "name": "foo"},
        "init": {
          "type": "ArrowFunctionExpression",
          "expression": true,
          "async": false,
          "generator": false,
          "id": null,
          "params": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
            "type": "Identifier",
            "name": "c"
          }],
          "body": {
            "type": "BinaryExpression",
            "left": {
              "type": "BinaryExpression",
              "left": {"type": "Identifier", "name": "a"},
              "right": {"type": "Identifier", "name": "b"},
              "operator": "+"
            },
            "right": {"type": "Identifier", "name": "c"},
            "operator": "+"
          }
        }
      }]
    }]);
  });

var block = plan()
  .test('parse {var foo = 34.5}', t => {
    t.deepEqual(parse$2('{var foo = 34.5}').body, [{
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
    t.deepEqual(parse$2('{var foo = 34.5;}').body, [{
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
    t.deepEqual(parse$2('{foo=34.43}').body, [{
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
    t.deepEqual(parse$2('{foo=34.43;}').body, [{
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
    t.deepEqual(parse$2('{f()}').body, [{
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
    t.deepEqual(parse$2('{f();}').body, [{
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
    t.deepEqual(parse$2('function a(){foo++}').body, [{
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
  .test('parse function *a(){foo++}', t => {
    t.deepEqual(parse$2('function *a(){foo++}').body, [{
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
      generator: true,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(){}', t => {
    t.deepEqual(parse$2('function a(){}').body, [{
      type: 'FunctionDeclaration',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){}', t => {
    t.deepEqual(parse$2('function a(b){}').body, [{
      type: 'FunctionDeclaration',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){foo++}', t => {
    t.deepEqual(parse$2('function a(b){foo++}').body, [{
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
    t.deepEqual(parse$2('function a(b,c){}').body, [{
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
    t.deepEqual(parse$2('function a(b,c){foo++}').body, [{
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
    t.deepEqual(parse$2('function a(b,c,d){}').body, [{
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
    t.deepEqual(parse$2('function a(b,c,d){foo++}').body, [{
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
  })
  .test('parse function a(...b){}', t => {
    t.deepEqual(parse$2('function a(...b){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'RestElement',
          argument: { type: 'Identifier', name: 'b' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(aa,...b){}', t => {
    t.deepEqual(parse$2('function a(aa,...b){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'Identifier', name: 'aa' },
          { type: 'RestElement',
            argument: { type: 'Identifier', name: 'b' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(aa,b = c){}', t => {
    t.deepEqual(parse$2('function a(aa,b = c){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'Identifier', name: 'aa' },
          { type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'b' },
            right: { type: 'Identifier', name: 'c' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(b = c){}', t => {
    t.deepEqual(parse$2('function a(b = c){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a([a,{b:{c:d}}] = {}){}', t => {
    t.deepEqual(parse$2('function a([a,{b:{c:d}}] = {}){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'AssignmentPattern',
          left:
            { type: 'ArrayPattern',
              elements:
                [ { type: 'Identifier', name: 'a' },
                  { type: 'ObjectPattern',
                    properties:
                      [ { type: 'Property',
                        kind: 'init',
                        key: { type: 'Identifier', name: 'b' },
                        computed: false,
                        value:
                          { type: 'ObjectPattern',
                            properties:
                              [ { type: 'Property',
                                kind: 'init',
                                key: { type: 'Identifier', name: 'c' },
                                computed: false,
                                value: { type: 'Identifier', name: 'd' },
                                method: false,
                                shorthand: false } ] },
                        method: false,
                        shorthand: false } ] } ] },
          right: { type: 'ObjectExpression', properties: [] } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } } ]);
  });

var returns = plan()
  .test('parse function a(){return}', t => {
    t.deepEqual(parse$2('function a(){return}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return;}', t => {
    t.deepEqual(parse$2('function a(){return;}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return blah}', t => {
    t.deepEqual(parse$2('function a(){return blah}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return blah;}', t => {
    t.deepEqual(parse$2('function a(){return blah;}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return 4+24%2}', t => {
    t.deepEqual(parse$2('function a(){return 4+24%2}').body[0].body.body[0], {
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
    t.deepEqual(parse$2('function a(){return 4+24%2;}').body[0].body.body[0], {
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
    t.deepEqual(parse$2('test:foo++;').body, [{
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
    t.deepEqual(parse$2('bar:function blah(){}').body, [{
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
    t.deepEqual(parse$2('bar:{foo++;}').body, [{
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
    t.deepEqual(parse$2('switch(foo){}').body, [{
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
    t.deepEqual(parse$2(`switch(foo){
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
    t.deepEqual(parse$2('while(true){break ;}').body, [{
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
    t.deepEqual(parse$2('while(true){break}').body, [{
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
    t.deepEqual(parse$2('block:while(true){break block;}').body, [{
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
    t.deepEqual(parse$2('block:while(true)break block;').body, [{
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
    t.deepEqual(parse$2('while(true){continue ;}').body, [{
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
    t.deepEqual(parse$2('while(true){continue}').body, [{
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
    t.deepEqual(parse$2('block:while(true){continue block;}').body, [{
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
    t.deepEqual(parse$2('block:while(true)continue block;').body, [{
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
    t.deepEqual(parse$2('with(foo)bar++;').body, [{
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
    t.deepEqual(parse$2('with(foo.bar){test();}').body, [{
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
    t.deepEqual(parse$2('throw new Error("foo")').body, [{
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
    t.deepEqual(parse$2('throw foo;').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Identifier', name: 'foo'}
    }]);
  })
  .test('parse throw null', t => {
    t.deepEqual(parse$2('throw null').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Literal', value: null}
    }]);
  });

var tryCatch = plan()
  .test('parse try {} catch(e){}', t => {
    t.deepEqual(parse$2('try {} catch(e){}').body, [{
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
    t.deepEqual(parse$2('try {} catch(e) {} finally {}').body, [{
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
    t.deepEqual(parse$2('try {} finally {}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler: null,
      finalizer: {type: 'BlockStatement', body: []}
    }]);
  });

var destructuring = plan()
  .test('parse var [,a] = b', t => {
    t.deepEqual(parse$2('var [,a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a] = b', t => {
    t.deepEqual(parse$2('var [,,a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a,] = b', t => {
    t.deepEqual(parse$2('var [,,a,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a,,,] = b', t => {
    t.deepEqual(parse$2('var [,,a,,,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}, null, null]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,] = b', t => {
    t.deepEqual(parse$2('var [a,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,] = b', t => {
    t.deepEqual(parse$2('var [a,,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}, null]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,...a]=b', t => {
    t.deepEqual(parse$2('var [,...a]=b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'a'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,...a]=b', t => {
    t.deepEqual(parse$2('var [,,...a]=b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'a'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,...b]=c', t => {
    t.deepEqual(parse$2('var [a,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,...b]=c', t => {
    t.deepEqual(parse$2('var [a,b,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,...b]=c', t => {
    t.deepEqual(parse$2('var [a,b,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,,...b]=c', t => {
    t.deepEqual(parse$2('var [a,b,,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,,...b]=c', t => {
    t.deepEqual(parse$2('var [a,,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a] = b', t => {
    t.deepEqual(parse$2('var [a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b] = c', t => {
    t.deepEqual(parse$2('var [a,b] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,c] = d', t => {
    t.deepEqual(parse$2('var [a,b,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,c] = d', t => {
    t.deepEqual(parse$2('var [a,b,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,,c] = d', t => {
    t.deepEqual(parse$2('var [a,b,,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,c] = d', t => {
    t.deepEqual(parse$2('var [a,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,,c] = d', t => {
    t.deepEqual(parse$2('var [a,,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a} = b', t => {
    t.deepEqual(parse$2('var {a} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {[a]:c} = b', t => {
    t.deepEqual(parse$2('var {[a]:c} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: true,
                  value: {type: 'Identifier', name: 'c'},
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a,} = b', t => {
    t.deepEqual(parse$2('var {a,} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a, b} = c', t => {
    t.deepEqual(parse$2('var {a, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a, b, c} = d', t => {
    t.deepEqual(parse$2('var {a, b, c} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b} = c', t => {
    t.deepEqual(parse$2('var {a:b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b, c} = d', t => {
    t.deepEqual(parse$2('var {a:b, c} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b, c:d} = e', t => {
    t.deepEqual(parse$2('var {a:b, c:d} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'd'},
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b}} = c', t => {
    t.deepEqual(parse$2('var {a:{b}} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b},c} = e', t => {
    t.deepEqual(parse$2('var {a:{b},c} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b},c:{d}} = e', t => {
    t.deepEqual(parse$2('var {a:{b},c:{d}} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'd'},
                            computed: false,
                            value: {type: 'Identifier', name: 'd'},
                            method: false,
                            shorthand: true
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b:c},d:{e}} = e', t => {
    t.deepEqual(parse$2('var {a:{b:c},d:{e}} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'c'},
                          method: false,
                          shorthand: false
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'd'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'e'},
                            computed: false,
                            value: {type: 'Identifier', name: 'e'},
                            method: false,
                            shorthand: true
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:[{g},c]} = d', t => {
    t.deepEqual(parse$2('var {a:[{g},c]} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ArrayPattern',
                      elements:
                        [{
                          type: 'ObjectPattern',
                          properties:
                            [{
                              type: 'Property',
                              kind: 'init',
                              key: {type: 'Identifier', name: 'g'},
                              computed: false,
                              value: {type: 'Identifier', name: 'g'},
                              method: false,
                              shorthand: true
                            }]
                        },
                          {type: 'Identifier', name: 'c'}]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:[g,c]} = d', t => {
    t.deepEqual(parse$2('var {a:[g,c]} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ArrayPattern',
                      elements:
                        [{type: 'Identifier', name: 'g'},
                          {type: 'Identifier', name: 'c'}]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [{a:[b]}] = c', t => {
    t.deepEqual(parse$2('var [{a:[b]}] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'a'},
                      computed: false,
                      value:
                        {
                          type: 'ArrayPattern',
                          elements: [{type: 'Identifier', name: 'b'}]
                        },
                      method: false,
                      shorthand: false
                    }]
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5} = b', t => {
    t.deepEqual(parse$2('var {a=5} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5, b=foo} = c', t => {
    t.deepEqual(parse$2('var {a=5, b=foo} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'AssignmentPattern',
                        left: {type: 'Identifier', name: 'b'},
                        right: {type: 'Identifier', name: 'foo'}
                      },
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5, b} = c', t => {
    t.deepEqual(parse$2('var {a=5, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:aa = 5, b} = c', t => {
    t.deepEqual(parse$2('var {a:aa = 5, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'aa'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:aa = 5, b:bb=foo} = c', t => {
    t.deepEqual(parse$2('var {a:aa = 5, b:bb=foo} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'aa'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'AssignmentPattern',
                        left: {type: 'Identifier', name: 'bb'},
                        right: {type: 'Identifier', name: 'foo'}
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b:bb = 5}, b:{bb:asb = foo}} = c', t => {
    t.deepEqual(parse$2('var {a:{b:bb = 5}, b:{bb:asb = foo}} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value:
                            {
                              type: 'AssignmentPattern',
                              left: {type: 'Identifier', name: 'bb'},
                              right: {type: 'Literal', value: 5}
                            },
                          method: false,
                          shorthand: false
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'bb'},
                            computed: false,
                            value:
                              {
                                type: 'AssignmentPattern',
                                left: {type: 'Identifier', name: 'asb'},
                                right: {type: 'Identifier', name: 'foo'}
                              },
                            method: false,
                            shorthand: false
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a=b] = c', t => {
    t.deepEqual(parse$2('var [a=b] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a=b,c =d] = e', t => {
    t.deepEqual(parse$2('var [a=b,c =d] = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                },
                  {
                    type: 'AssignmentPattern',
                    left: {type: 'Identifier', name: 'c'},
                    right: {type: 'Identifier', name: 'd'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [[a=b]] = c', t => {
    t.deepEqual(parse$2('var [[a=b]] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ArrayPattern',
                  elements:
                    [{
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Identifier', name: 'b'}
                    }]
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [{a=b},c] = d', t => {
    t.deepEqual(parse$2('var [{a=b},c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'a'},
                      computed: false,
                      value:
                        {
                          type: 'AssignmentPattern',
                          left: {type: 'Identifier', name: 'a'},
                          right: {type: 'Identifier', name: 'b'}
                        },
                      method: false,
                      shorthand: true
                    }]
                },
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  });

var letDeclaration = plan()
  .test('parse let foo, bar, woot;', t => {
    t.deepEqual(parse$2('let foo, bar, woot;').body, [{
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
      kind: 'let'
    }]);
  })
  .test('parse let foo;', t => {
    t.deepEqual(parse$2('let foo;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        }],
      kind: 'let'
    }]);
  })
  .test('parse let foo = 54, bar;', t => {
    t.deepEqual(parse$2('let foo = 54, bar;').body, [{
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
      kind: 'let'
    }]);
  })
  .test('parse let foo, bar=true;', t => {
    t.deepEqual(parse$2('let foo, bar=true;').body, [{
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
      kind: 'let'
    }]);
  });

var constDeclaration = plan()
  .test('parse const foo = 54, bar = bim;', t => {
    t.deepEqual(parse$2('const foo = 54, bar = bim;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: 54},
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: {type: 'Identifier', name: 'bim'},
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'const'
    }]);
  })
  .test('parse const bar=true;', t => {
    t.deepEqual(parse$2('const bar=true;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: true},
          id: {type: 'Identifier', name: 'bar'}
        }],
      kind: 'const'
    }]);
  });

var classDeclaration = plan()
  .test('parse class test{}', t => {
    t.deepEqual(parse$2('class test{}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{;}', t => {
    t.deepEqual(parse$2('class test{;}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{;;}', t => {
    t.deepEqual(parse$2('class test{;;}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{constructor(){}foo(){}}', t => {
    t.deepEqual(parse$2('class test{constructor(){}foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body: [{
            type: 'MethodDefinition',
            computed: false,
            key: {type: 'Identifier', name: 'constructor'},
            kind: 'constructor',
            static: false,
            value:
              {
                type: 'FunctionExpression',
                id: null,
                params: [],
                body: {type: 'BlockStatement', body: []},
                generator: false,
                async: false
              }
          },
            {
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test{get blah(){}set blah(foo){}}', t => {
    t.deepEqual(parse$2('class test{get blah(){}set blah(foo){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'blah'},
              kind: 'get',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'blah'},
                kind: 'set',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    }]);
  })
  .test('parse class test{get(){}set(foo){}}', t => {
    t.deepEqual(parse$2('class test{get(){}set(foo){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'get'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'set'},
                kind: 'method',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    }]);
  })
  .test('parse class test{foo(){}}', t => {
    t.deepEqual(parse$2('class test{foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test{[foo](){}}', t => {
    t.deepEqual(parse$2('class test{[foo](){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: true,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test{"foo"(){}}', t => {
    t.deepEqual(parse$2('class test{"foo"(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test{5(){}}', t => {
    t.deepEqual(parse$2('class test{5(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 5},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class a extends b {}', t => {
    t.deepEqual(parse$2('class a extends b {}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
      superClass: {type: 'Identifier', name: 'b'},
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class a extends b.c {}', t => {
    t.deepEqual(parse$2('class a extends b.c {}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
      superClass:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'b'},
          computed: false,
          property: {type: 'Identifier', name: 'c'}
        },
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class a {static hello(){}static get foo(){}}', t => {
    t.deepEqual(parse$2('class a {static hello(){}static get foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'hello'},
              kind: 'method',
              static: true,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'foo'},
                kind: 'get',
                static: true,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    }]);
  })
  .test('parse class test extends foo{constructor(){super()}}', t => {
    t.deepEqual(parse$2('class test extends foo{constructor(){super()}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: {type: 'Identifier', name: 'foo'},
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'constructor'},
              kind: 'constructor',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body:
                    {
                      type: 'BlockStatement',
                      body:
                        [{
                          type: 'ExpressionStatement',
                          expression:
                            {
                              type: 'CallExpression',
                              callee: {type: 'Super'},
                              arguments: []
                            }
                        }]
                    },
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test {foo(){super["test"]++}}', t => {
    t.deepEqual(parse$2('class test {foo(){super["test"]++}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
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
                              argument:
                                {
                                  type: 'MemberExpression',
                                  object: {type: 'Super'},
                                  computed: true,
                                  property: {type: 'Literal', value: 'test'}
                                },
                              operator: '++',
                              prefix: false
                            }
                        }]
                    },
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  })
  .test('parse class test {foo(){super.bar}}', t => {
    t.deepEqual(parse$2('class test {foo(){super.bar}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body:
                    {
                      type: 'BlockStatement',
                      body:
                        [{
                          type: 'ExpressionStatement',
                          expression:
                            {
                              type: 'MemberExpression',
                              object: {type: 'Super'},
                              computed: false,
                              property: {type: 'Identifier', name: 'bar'}
                            }
                        }]
                    },
                  generator: false,
                  async: false
                }
            }]
        }
    }]);
  });

var modules = plan()
  .test(`parse import 'foo';`, t => {
    t.deepEqual(parseModule(`import 'foo';`).body, [{
      "type": "ImportDeclaration",
      "specifiers": [],
      "source": {"type": "Literal", "value": "foo"}
    }]);
  })
  .test(`parse import v from 'foo';`, t => {
    t.deepEqual(parseModule(`import v from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import * as v from 'foo';`, t => {
    t.deepEqual(parseModule(`import * as v from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportNamespaceSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo as bar} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo as bar} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'bar'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers: [],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo,} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo,} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'b'},
          imported: {type: 'Identifier', name: 'bar'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'what'},
          imported: {type: 'Identifier', name: 'what'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import v, * as b from 'foo';`, t => {
    t.deepEqual(parseModule(`import v, * as b from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }, {
          type: 'ImportNamespaceSpecifier',
          local: {type: 'Identifier', name: 'b'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import v, {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`import v, {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'b'},
          imported: {type: 'Identifier', name: 'bar'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'what'},
          imported: {type: 'Identifier', name: 'what'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse export * from 'blah'`, t => {
    t.deepEqual(parseModule(`export * from 'blah';`).body, [{
      type: 'ExportAllDeclaration',
      source: {type: 'Literal', value: 'blah'}
    }]);
  })
  .test(`parse export {foo as bar} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo as bar} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'bar'}
        }]
    }]);
  })
  .test(`parse export {foo} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers: [],
      declaration: null
    }]);
  })
  .test(`parse export {foo,} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo,} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'bar'},
            exported: {type: 'Identifier', name: 'b'}
          },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'what'},
            exported: {type: 'Identifier', name: 'what'}
          }],
      declaration: null
    }]);
  })
  .test(`parse export {switch as catch} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {switch as catch} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'switch'},
          exported: {type: 'Identifier', name: 'catch'}
        }]
    }]);
  })
  .test(`parse export {foo as bar};`, t => {
    t.deepEqual(parseModule(`export {foo as bar};`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'bar'}
        }]
    }]);
  })
  .test(`parse export {foo};`, t => {
    t.deepEqual(parseModule(`export {foo};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {};`, t => {
    t.deepEqual(parseModule(`export {};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration: null
    }]);
  })
  .test(`parse export {foo,};`, t => {
    t.deepEqual(parseModule(`export {foo,};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {foo,bar as b, what};`, t => {
    t.deepEqual(parseModule(`export {foo,bar as b, what};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'bar'},
            exported: {type: 'Identifier', name: 'b'}
          },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'what'},
            exported: {type: 'Identifier', name: 'what'}
          }],
      declaration: null
    }]);
  })
  .test(`parse export {switch as catch};`, t => {
    t.deepEqual(parseModule(`export {switch as catch};`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'switch'},
          exported: {type: 'Identifier', name: 'catch'}
        }]
    }]);
  })
  .test(`parse export var answer = 42;`, t => {
    t.deepEqual(parseModule(`export var answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'var'
        }
    }]);
  })
  .test(`parse export const answer = 42;`, t => {
    t.deepEqual(parseModule(`export const answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'const'
        }
    }]);
  })
  .test(`parse export let answer = 42;`, t => {
    t.deepEqual(parseModule(`export let answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'let'
        }
    }]);
  })
  .test(`parse export function answer() {return 42;}`, t => {
    t.deepEqual(parseModule(`export function answer() {return 42;}`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'FunctionDeclaration',
          params: [],
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ReturnStatement',
                  argument: {type: 'Literal', value: 42}
                }]
            },
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'answer'}
        }
    }]);
  })
  .test(`parse export default class answer{};`, t => {
    t.deepEqual(parseModule(`export default class answer{};`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'ClassDeclaration',
          id: {type: 'Identifier', name: 'answer'},
          superClass: null,
          body: {type: 'ClassBody', body: []}
        }
    }]);
  })
  .test(`parse export default function answer() {return 42;}`, t => {
    t.deepEqual(parseModule(`export default function answer() {return 42;}`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'FunctionDeclaration',
          params: [],
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ReturnStatement',
                  argument: {type: 'Literal', value: 42}
                }]
            },
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'answer'}
        }
    }]);
  })
  .test(`parse export default foo === true ? bar : 42`, t => {
    t.deepEqual(parseModule(`export default foo === true ? bar : 42`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'ConditionalExpression',
          test:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'foo'},
              right: {type: 'Literal', value: true},
              operator: '==='
            },
          consequent: {type: 'Identifier', name: 'bar'},
          alternate: {type: 'Literal', value: 42}
        }
    }]);
  });

var assign = plan()
  .test('parse [a,b] =[b,a]', t => {
    t.deepEqual(parse$2('[a,b] = [b,a];').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'}]
            },
          operator: '=',
          right:
            {
              type: 'ArrayExpression',
              elements:
                [{type: 'Identifier', name: 'b'},
                  {type: 'Identifier', name: 'a'}]
            }
        }
    }]);
  })
  .test('parse [a,...b] =b', t => {
    t.deepEqual(parse$2('[a, ...b] = b;').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            },
          operator: '=',
          right: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse [a = b,[c],d = [...e] ] = f', t => {
    t.deepEqual(parse$2('[a = b,[c],d = [...e] ] = f').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                },
                  {
                    type: 'ArrayPattern',
                    elements: [{type: 'Identifier', name: 'c'}]
                  },
                  {
                    type: 'AssignmentPattern',
                    left: {type: 'Identifier', name: 'd'},
                    right:
                      {
                        type: 'ArrayExpression',
                        elements:
                          [{
                            type: 'SpreadElement',
                            argument: {type: 'Identifier', name: 'e'}
                          }]
                      }
                  }]
            },
          operator: '=',
          right: {type: 'Identifier', name: 'f'}
        }
    }]);
  });

var statements = plan()
  .test(empty)
  .test(ifStatements)
  .test(whileStatements)
  .test(forStatements)
  // .test(forIn)
  // .test(forOf)
  .test(varStatement)
  .test(letDeclaration)
  .test(constDeclaration)
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
  .test(tryCatch)
  .test(destructuring)
  .test(classDeclaration)
  .test(modules)
  .test(assign);

plan()
  .test(tokens)
  .test(source)
  .test(expressions)
  .test(statements)
  .run();

}());
//# sourceMappingURL=index.js.map
