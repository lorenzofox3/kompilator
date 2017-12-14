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
const asValue = (type, key) => composeArityOne(type, (parser) => {
  const {value: token} = parser.next();
  return key ? {[key]: token.value} : {};
});
const asUnaryExpression = (type) => composeArityOne(type, (parser) => {
  const {value: token} = parser.next();
  return {
    operator: token.value,
    argument: parser.expression(parser.getPrefixPrecedence(token)),
    prefix: true
  };
});

//no reserved word
const parseBindingIdentifier = composeArityOne(Identifier, parser => {
  const {value: next} = parser.next();
  if (parser.isReserved(next)) {
    throw new Error(`Binding identifier can not be reserved keyword "${next.value}"`);
  }
  if (next.type !== categories.Identifier) {
    throw new Error('expected an identifier');
  }
  return {
    name: next.value
  };
});
const parseIdentifierName = composeArityOne(Identifier, parser => {
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
const parseYieldExpression = composeArityOne(YieldExpression, parser => {
  parser.expect('yield');
  let delegate = false;
  if (parser.eventually('*')) {
    delegate = true;
  }
  return {
    argument: parser.expression(parser.getPrefixPrecedence(parser.get('yield'))),
    delegate
  };
});

//infix
const asBinaryExpression = type => composeArityThree(type, (parser, left, operator) => {
  return {
    left,
    right: parser.expression(parser.getInfixPrecedence(operator)),
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

const parserFactory = (tokens = defaultRegistry$1) => {

  const getInfixPrecedence = operator => tokens.hasInfix(operator) ? tokens.getInfix(operator).precedence : -1;
  const getPrefixPrecedence = operator => tokens.hasPrefix(operator) ? tokens.getPrefix(operator).precedence : -1;

  const parseInfix = (parser, left, precedence, exits) => {
    parser.disallowRegexp(); //regexp as a literal is a "prefix operator" so a "/" in infix position is a div punctuator
    const {value: operator} = parser.lookAhead();
    if (!operator || precedence >= getInfixPrecedence(operator) || exits.includes(operator)) {
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
          parser.allowRegexp(); //regexp as literal is a "prefix operator"
          const {value: token} = parser.lookAhead();
          if (!tokens.hasPrefix(token)) {
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

const parseModule = program => {
  const parse = parserFactory();
  return parse(program).module();
};

const parseExpression$1 = (expression) => {
  const parse = parserFactory();
  return parse(expression).expression();
};

const parseScript = program => {
  const parse = parserFactory();
  return parse(program).program();
};

 //alias

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

const parseStatementList = (parser, exit = ['}'], statements = []) => {
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

const parseExpressionStatement = Statement(ExpressionStatement, parser => ({
  expression: parser.expression()
}));

const parseExpression = withEventualSemiColon(parseExpressionStatement);
const parseStatement = (parser) => {
  const {value: nextToken} = parser.lookAhead();
  return parser.hasStatement(nextToken) ? parser.getStatement(nextToken)(parser) : parseExpression(parser);
};

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

const parseExpressionOrLabeledStatement = parser => {
  const {value: nextToken} = parser.lookAhead(1);
  return nextToken === parser.get(':') ? parseLabeledStatement(parser) : parseExpression(parser);
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

const parseBindingIdentifierOrPattern = parser => {
  const {value: next} = parser.lookAhead();
  if (parser.get('{') === next) {
    return parseObjectBindingPattern(parser);
  } else if (parser.get('[') === next) {
    return parseArrayBindingPattern(parser);
  }
  return parseBindingIdentifier(parser);
};

const asVariableDeclaration = (keyword = 'var') => Statement(VariableDeclaration, parser => {
  parser.expect(keyword);
  return {
    kind: keyword,
    declarations: parseVariableDeclarators(parser)
  };
});
const parseVariableDeclarator = Statement(VariableDeclarator, (parser) => {
  const comma = parser.get(',');
  const node = {id: parseBindingIdentifierOrPattern(parser), init: null};
  if (parser.eventually('=')) {
    node.init = parser.expression(parser.getInfixPrecedence(comma));
  }
  return node;
});
const parseVariableDeclarators = (parser, declarators = []) => {
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
    }, stream, 'allowRegexp', 'disallowRegexp', 'allowRightBrace', 'disallowRightBrace');
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

const parse$1 = code => parseExpression$1(code);

var assignments = plan()
  .test('parse x=42', t => {
    t.deepEqual(parse$1('x=42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse (x)=(42)', t => {
    t.deepEqual(parse$1('(x)=(42)'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse ((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0', t => {
    t.deepEqual(parse$1('((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "a"},
      "operator": "=",
      "right": {"type": "Literal", "value": 0}
    });
  })
  .test('parse x <<= 2', t => {
    t.deepEqual(parse$1('x <<= 2'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 2}
    });
  })
  .test('parse eval = 42', t => {
    t.deepEqual(parse$1('eval = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "eval"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse arguments = 42', t => {
    t.deepEqual(parse$1('arguments = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "arguments"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x *= 42', t => {
    t.deepEqual(parse$1('x *= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "*=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x /= 42', t => {
    t.deepEqual(parse$1('x /= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "/=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x %= 42', t => {
    t.deepEqual(parse$1('x %= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "%=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x += 42', t => {
    t.deepEqual(parse$1('x += 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "+=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x -= 42', t => {
    t.deepEqual(parse$1('x -= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "-=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x <<= 42', t => {
    t.deepEqual(parse$1('x <<= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>= 42', t => {
    t.deepEqual(parse$1('x >>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>>= 42', t => {
    t.deepEqual(parse$1('x >>>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x &= 42', t => {
    t.deepEqual(parse$1('x &= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "&=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x ^= 42', t => {
    t.deepEqual(parse$1('x ^= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "^=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x |= 42', t => {
    t.deepEqual(parse$1('x |= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "|=",
      "right": {"type": "Literal", "value": 42}
    });
  });

var binary = plan()
  .test('parse x == y', t => {
    t.deepEqual(parse$1('x == y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "=="
    });
  })
  .test('parse x == 5', t => {
    t.deepEqual(parse$1('x == 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "=="
    });
  })
  .test('parse x == null', t => {
    t.deepEqual(parse$1('x == null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "=="
    });
  })
  .test('parse x == false', t => {
    t.deepEqual(parse$1('x == false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "=="
    });
  })
  .test('parse x == "woot woot"', t => {
    t.deepEqual(parse$1('x == "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "=="
    });
  })
  .test('parse x != y', t => {
    t.deepEqual(parse$1('x != y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!="
    });
  })
  .test('parse x != 5', t => {
    t.deepEqual(parse$1('x != 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!="
    });
  })
  .test('parse x != null', t => {
    t.deepEqual(parse$1('x != null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!="
    });
  })
  .test('parse x != false', t => {
    t.deepEqual(parse$1('x != false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!="
    });
  })
  .test('parse x != "woot woot"', t => {
    t.deepEqual(parse$1('x != "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!="
    });
  })
  .test('parse x === y', t => {
    t.deepEqual(parse$1('x === y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "==="
    });
  })
  .test('parse x === 5', t => {
    t.deepEqual(parse$1('x === 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "==="
    });
  })
  .test('parse x === null', t => {
    t.deepEqual(parse$1('x === null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "==="
    });
  })
  .test('parse x === false', t => {
    t.deepEqual(parse$1('x === false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "==="
    });
  })
  .test('parse x === "woot woot"', t => {
    t.deepEqual(parse$1('x === "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "==="
    });
  })
  .test('parse x !== y', t => {
    t.deepEqual(parse$1('x !== y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!=="
    });
  })
  .test('parse x !== 5', t => {
    t.deepEqual(parse$1('x !== 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!=="
    });
  })
  .test('parse x !== null', t => {
    t.deepEqual(parse$1('x !== null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!=="
    });
  })
  .test('parse x !== false', t => {
    t.deepEqual(parse$1('x !== false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!=="
    });
  })
  .test('parse x !== "woot woot"', t => {
    t.deepEqual(parse$1('x !== "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!=="
    });
  })
  .test('parse x < y', t => {
    t.deepEqual(parse$1('x < y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<"
    });
  })
  .test('parse x < 5', t => {
    t.deepEqual(parse$1('x < 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<"
    });
  })
  .test('parse x < null', t => {
    t.deepEqual(parse$1('x < null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<"
    });
  })
  .test('parse x < true', t => {
    t.deepEqual(parse$1('x < true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<"
    });
  })
  .test('parse x < "woot woot"', t => {
    t.deepEqual(parse$1('x < "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<"
    });
  })
  .test('parse x <= y', t => {
    t.deepEqual(parse$1('x <= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<="
    });
  })
  .test('parse x <= 5', t => {
    t.deepEqual(parse$1('x <= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<="
    });
  })
  .test('parse x <= null', t => {
    t.deepEqual(parse$1('x <= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<="
    });
  })
  .test('parse x <= true', t => {
    t.deepEqual(parse$1('x <= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<="
    });
  })
  .test('parse x <= "woot woot"', t => {
    t.deepEqual(parse$1('x <= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<="
    });
  })
  .test('parse x > y', t => {
    t.deepEqual(parse$1('x > y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">"
    });
  })
  .test('parse x > 5', t => {
    t.deepEqual(parse$1('x > 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">"
    });
  })
  .test('parse x > null', t => {
    t.deepEqual(parse$1('x > null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">"
    });
  })
  .test('parse x > true', t => {
    t.deepEqual(parse$1('x > true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">"
    });
  })
  .test('parse x > "woot woot"', t => {
    t.deepEqual(parse$1('x > "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">"
    });
  })
  .test('parse x >= y', t => {
    t.deepEqual(parse$1('x >= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">="
    });
  })
  .test('parse x >= 5', t => {
    t.deepEqual(parse$1('x >= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">="
    });
  })
  .test('parse x >= null', t => {
    t.deepEqual(parse$1('x >= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">="
    });
  })
  .test('parse x >= true', t => {
    t.deepEqual(parse$1('x >= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">="
    });
  })
  .test('parse x >= "woot woot"', t => {
    t.deepEqual(parse$1('x >= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">="
    });
  })
  .test('parse x << y', t => {
    t.deepEqual(parse$1('x << y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<<"
    });
  })
  .test('parse x << 5', t => {
    t.deepEqual(parse$1('x << 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<<"
    });
  })
  .test('parse x << null', t => {
    t.deepEqual(parse$1('x << null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<<"
    });
  })
  .test('parse x << true', t => {
    t.deepEqual(parse$1('x << true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<<"
    });
  })
  .test('parse x << "woot woot"', t => {
    t.deepEqual(parse$1('x << "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<<"
    });
  })
  .test('parse x >> y', t => {
    t.deepEqual(parse$1('x >> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>"
    });
  })
  .test('parse x >> 5', t => {
    t.deepEqual(parse$1('x >> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>"
    });
  })
  .test('parse x >> null', t => {
    t.deepEqual(parse$1('x >> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>"
    });
  })
  .test('parse x >> true', t => {
    t.deepEqual(parse$1('x >> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>"
    });
  })
  .test('parse x >> "woot woot"', t => {
    t.deepEqual(parse$1('x >> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>"
    });
  })
  .test('parse x >>> y', t => {
    t.deepEqual(parse$1('x >>> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>>"
    });
  })
  .test('parse x >>> 5', t => {
    t.deepEqual(parse$1('x >>> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>>"
    });
  })
  .test('parse x >>> null', t => {
    t.deepEqual(parse$1('x >>> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>>"
    });
  })
  .test('parse x >>> true', t => {
    t.deepEqual(parse$1('x >>> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>>"
    });
  })
  .test('parse x >>> "woot woot"', t => {
    t.deepEqual(parse$1('x >>> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>>"
    });
  })
  .test('parse x + y', t => {
    t.deepEqual(parse$1('x + y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "+"
    });
  })
  .test('parse x + 5', t => {
    t.deepEqual(parse$1('x + 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "+"
    });
  })
  .test('parse x + null', t => {
    t.deepEqual(parse$1('x + null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "+"
    });
  })
  .test('parse x + true', t => {
    t.deepEqual(parse$1('x + true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "+"
    });
  })
  .test('parse x + "woot woot"', t => {
    t.deepEqual(parse$1('x + "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "+"
    });
  })
  .test('parse x - y', t => {
    t.deepEqual(parse$1('x - y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "-"
    });
  })
  .test('parse x - 5', t => {
    t.deepEqual(parse$1('x - 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "-"
    });
  })
  .test('parse x - null', t => {
    t.deepEqual(parse$1('x - null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "-"
    });
  })
  .test('parse x - true', t => {
    t.deepEqual(parse$1('x - true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "-"
    });
  })
  .test('parse x - "woot woot"', t => {
    t.deepEqual(parse$1('x - "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "-"
    });
  })
  .test('parse x * y', t => {
    t.deepEqual(parse$1('x * y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "*"
    });
  })
  .test('parse x * 5', t => {
    t.deepEqual(parse$1('x * 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "*"
    });
  })
  .test('parse x * null', t => {
    t.deepEqual(parse$1('x * null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "*"
    });
  })
  .test('parse x * true', t => {
    t.deepEqual(parse$1('x * true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "*"
    });
  })
  .test('parse x * "woot woot"', t => {
    t.deepEqual(parse$1('x * "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "*"
    });
  })
  .test('parse x ** y', t => {
    t.deepEqual(parse$1('x ** y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "**"
    });
  })
  .test('parse x ** 5', t => {
    t.deepEqual(parse$1('x ** 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "**"
    });
  })
  .test('parse x ** null', t => {
    t.deepEqual(parse$1('x ** null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "**"
    });
  })
  .test('parse x ** true', t => {
    t.deepEqual(parse$1('x ** true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "**"
    });
  })
  .test('parse x ** "woot woot"', t => {
    t.deepEqual(parse$1('x ** "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "**"
    });
  })
  .test('parse x / y', t => {
    t.deepEqual(parse$1('x / y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "/"
    });
  })
  .test('parse x / 5', t => {
    t.deepEqual(parse$1('x / 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "/"
    });
  })
  .test('parse x / null', t => {
    t.deepEqual(parse$1('x / null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "/"
    });
  })
  .test('parse x / true', t => {
    t.deepEqual(parse$1('x / true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "/"
    });
  })
  .test('parse x / "woot woot"', t => {
    t.deepEqual(parse$1('x / "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "/"
    });
  })
  .test('parse x % y', t => {
    t.deepEqual(parse$1('x % y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "%"
    });
  })
  .test('parse x % 5', t => {
    t.deepEqual(parse$1('x % 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "%"
    });
  })
  .test('parse x % null', t => {
    t.deepEqual(parse$1('x % null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "%"
    });
  })
  .test('parse x % true', t => {
    t.deepEqual(parse$1('x % true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "%"
    });
  })
  .test('parse x % "woot woot"', t => {
    t.deepEqual(parse$1('x % "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "%"
    });
  })
  .test('parse x | y', t => {
    t.deepEqual(parse$1('x | y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "|"
    });
  })
  .test('parse x | 5', t => {
    t.deepEqual(parse$1('x | 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "|"
    });
  })
  .test('parse x | null', t => {
    t.deepEqual(parse$1('x | null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "|"
    });
  })
  .test('parse x | true', t => {
    t.deepEqual(parse$1('x | true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "|"
    });
  })
  .test('parse x | "woot woot"', t => {
    t.deepEqual(parse$1('x | "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "|"
    });
  })
  .test('parse x & y', t => {
    t.deepEqual(parse$1('x & y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&"
    });
  })
  .test('parse x & 5', t => {
    t.deepEqual(parse$1('x & 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "&"
    });
  })
  .test('parse x & null', t => {
    t.deepEqual(parse$1('x & null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&"
    });
  })
  .test('parse x & true', t => {
    t.deepEqual(parse$1('x & true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "&"
    });
  })
  .test('parse x & "woot woot"', t => {
    t.deepEqual(parse$1('x & "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&"
    });
  })
  .test('parse x ^ y', t => {
    t.deepEqual(parse$1('x ^ y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "^"
    });
  })
  .test('parse x ^ 5', t => {
    t.deepEqual(parse$1('x ^ 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "^"
    });
  })
  .test('parse x ^ null', t => {
    t.deepEqual(parse$1('x ^ null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "^"
    });
  })
  .test('parse x ^ false', t => {
    t.deepEqual(parse$1('x ^ false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "^"
    });
  })
  .test('parse x ^ "woot woot"', t => {
    t.deepEqual(parse$1('x ^ "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "^"
    });
  })
  .test('parse x in y', t => {
    t.deepEqual(parse$1('x in y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "in"
    });
  })
  .test('parse x in 5', t => {
    t.deepEqual(parse$1('x in 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "in"
    });
  })
  .test('parse x in null', t => {
    t.deepEqual(parse$1('x in null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "in"
    });
  })
  .test('parse x in true', t => {
    t.deepEqual(parse$1('x in true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "in"
    });
  })
  .test('parse x in "woot woot"', t => {
    t.deepEqual(parse$1('x in "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "in"
    });
  })
  .test('parse x instanceof y', t => {
    t.deepEqual(parse$1('x instanceof y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof 5', t => {
    t.deepEqual(parse$1('x instanceof 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof null', t => {
    t.deepEqual(parse$1('x instanceof null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof true', t => {
    t.deepEqual(parse$1('x instanceof true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof "woot woot"', t => {
    t.deepEqual(parse$1('x instanceof "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "instanceof"
    });
  });

var unary = plan()
  .test('parse +x', t => {
    t.deepEqual(parse$1('+x'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse +5', t => {
    t.deepEqual(parse$1('+5'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse +"woot woot"', t => {
    t.deepEqual(parse$1('+"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse +true', t => {
    t.deepEqual(parse$1('+true'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse +null', t => {
    t.deepEqual(parse$1('+null'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse -x', t => {
    t.deepEqual(parse$1('-x'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse -5', t => {
    t.deepEqual(parse$1('-5'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse -"woot woot"', t => {
    t.deepEqual(parse$1('-"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse -true', t => {
    t.deepEqual(parse$1('-true'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse -null', t => {
    t.deepEqual(parse$1('-null'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse !x', t => {
    t.deepEqual(parse$1('!x'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse !5', t => {
    t.deepEqual(parse$1('!5'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse !"woot woot"', t => {
    t.deepEqual(parse$1('!"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse !true', t => {
    t.deepEqual(parse$1('!true'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse !null', t => {
    t.deepEqual(parse$1('!null'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse ~x', t => {
    t.deepEqual(parse$1('~x'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse ~5', t => {
    t.deepEqual(parse$1('~5'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse ~"woot woot"', t => {
    t.deepEqual(parse$1('~"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse ~true', t => {
    t.deepEqual(parse$1('~true'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse ~null', t => {
    t.deepEqual(parse$1('~null'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse typeof x', t => {
    t.deepEqual(parse$1('typeof x'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse typeof 5', t => {
    t.deepEqual(parse$1('typeof 5'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse typeof "woot woot"', t => {
    t.deepEqual(parse$1('typeof "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse typeof true', t => {
    t.deepEqual(parse$1('typeof true'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse typeof null', t => {
    t.deepEqual(parse$1('typeof null'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse void x', t => {
    t.deepEqual(parse$1('void x'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse void 5', t => {
    t.deepEqual(parse$1('void 5'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse void "woot woot"', t => {
    t.deepEqual(parse$1('void "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse void true', t => {
    t.deepEqual(parse$1('void true'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse void null', t => {
    t.deepEqual(parse$1('void null'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse delete x', t => {
    t.deepEqual(parse$1('delete x'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse delete 5', t => {
    t.deepEqual(parse$1('delete 5'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse delete "woot woot"', t => {
    t.deepEqual(parse$1('delete "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse delete true', t => {
    t.deepEqual(parse$1('delete true'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse delete null', t => {
    t.deepEqual(parse$1('delete null'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  });

var thisExpr = plan()
  .test('parse this', t => {
    t.deepEqual(parse$1('this'), {type: 'ThisExpression'});
  });

var logical = plan()
  .test('parse x || y', t => {
    t.deepEqual(parse$1('x || y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "||"
    });
  })
  .test('parse x || 23.4', t => {
    t.deepEqual(parse$1('x || 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "||"
    });
  })
  .test('parse x || null', t => {
    t.deepEqual(parse$1('x || null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "||"
    });
  })
  .test('parse x || false', t => {
    t.deepEqual(parse$1('x || false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "||"
    });
  })
  .test('parse x || "woot woot"', t => {
    t.deepEqual(parse$1('x || "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "||"
    });
  })
  .test('parse x && y', t => {
    t.deepEqual(parse$1('x && y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&&"
    });
  })
  .test('parse x && 23.4', t => {
    t.deepEqual(parse$1('x && 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "&&"
    });
  })
  .test('parse x && null', t => {
    t.deepEqual(parse$1('x && null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&&"
    });
  })
  .test('parse x && false', t => {
    t.deepEqual(parse$1('x && false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "&&"
    });
  })
  .test('parse x && "woot woot"', t => {
    t.deepEqual(parse$1('x && "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&&"
    });
  });

var member = plan()
  .test('parse a.b', t => {
    t.deepEqual(parse$1('a.b'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": false,
      "property": {"type": "Identifier", "name": "b"}
    });
  })
  .test('parse a.catch', t => {
    t.deepEqual(parse$1('a.catch'), {
      type: 'MemberExpression',
      object: {type: 'Identifier', name: 'a'},
      computed: false,
      property: {type: 'Identifier', name: 'catch'}
    });
  })
  .test('parse foo.in.catch', t => {
    t.deepEqual(parse$1('foo.in.catch'),
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
    t.deepEqual(parse$1('a[foo]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Identifier", "name": "foo"}
    });
  })
  .test('parse a[2]', t => {
    t.deepEqual(parse$1('a[2]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Literal", "value": 2}
    });
  })
  .test('parse a[4+4]', t => {
    t.deepEqual(parse$1('a[4+4]'), {
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
    t.deepEqual(parse$1('a["foo"+"bar"]'), {
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
    t.deepEqual(parse$1('a++'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "++",
      "prefix": false
    });
  })
  .test('parse ++a', t => {
    t.deepEqual(parse$1('++a'), {
      "type": "UpdateExpression",
      "operator": "++",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse --a', t => {
    t.deepEqual(parse$1('--a'), {
      "type": "UpdateExpression",
      "operator": "--",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse a--', t => {
    t.deepEqual(parse$1('a--'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "--",
      "prefix": false
    });
  });

var literals = plan()
  .test('parse 0x3F3a', t => {
    t.deepEqual(parse$1('0x3F3a'), {"type": "Literal", "value": 0x3F3a});
  })
  .test('parse 0X3F3a', t => {
    t.deepEqual(parse$1('0X3F3a'), {"type": "Literal", "value": 0X3F3a});
  })
  .test('parse 0o3705', t => {
    t.deepEqual(parse$1('0o3705'), {"type": "Literal", "value": 0o3705});
  })
  .test('parse 0O3705', t => {
    t.deepEqual(parse$1('0O3705'), {"type": "Literal", "value": 0O3705});
  })
  .test('parse 0b0101011', t => {
    t.deepEqual(parse$1('0b0101011'), {"type": "Literal", "value": 0b0101011});
  })
  .test('parse 0B0101011', t => {
    t.deepEqual(parse$1('0B0101011'), {"type": "Literal", "value": 0B0101011});
  })
  .test('parse 123', t => {
    t.deepEqual(parse$1('123'), {"type": "Literal", "value": 123});
  })
  .test('parse 023', t => {
    t.deepEqual(parse$1('023'), {"type": "Literal", "value": 23});
  })
  .test('parse 34.', t => {
    t.deepEqual(parse$1('34.'), {"type": "Literal", "value": 34});
  })
  .test('parse .3435', t => {
    t.deepEqual(parse$1('.3435'), {"type": "Literal", "value": 0.3435});
  })
  .test('parse 345.767', t => {
    t.deepEqual(parse$1('345.767'), {"type": "Literal", "value": 345.767});
  })
  .test('parse .34e-1', t => {
    t.deepEqual(parse$1('.34e-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .34E-1', t => {
    t.deepEqual(parse$1('.34E-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .65e+3', t => {
    t.deepEqual(parse$1('.65e+3'), {"type": "Literal", "value": 650});
  })
  .test('parse .6E+3', t => {
    t.deepEqual(parse$1('.6E+3'), {"type": "Literal", "value": 600});
  })
  .test('parse .86e4', t => {
    t.deepEqual(parse$1('.86e4'), {"type": "Literal", "value": 8600});
  })
  .test('parse .34E4', t => {
    t.deepEqual(parse$1('.34E4'), {"type": "Literal", "value": 3400});
  })
  .test('parse 4545.4545e+5', t => {
    t.deepEqual(parse$1('4545.4545e+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E+5', t => {
    t.deepEqual(parse$1('4545.4545E+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e5', t => {
    t.deepEqual(parse$1('4545.4545e5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E5', t => {
    t.deepEqual(parse$1('4545.4545E5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e-5', t => {
    t.deepEqual(parse$1('4545.4545e-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 4545.4545E-5', t => {
    t.deepEqual(parse$1('4545.4545E-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 34e+5', t => {
    t.deepEqual(parse$1('34e+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E+5', t => {
    t.deepEqual(parse$1('34E+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e5', t => {
    t.deepEqual(parse$1('34e5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E5', t => {
    t.deepEqual(parse$1('34E5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e-5', t => {
    t.deepEqual(parse$1('34e-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse 34E-5', t => {
    t.deepEqual(parse$1('34E-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse \'foo\'', t => {
    t.deepEqual(parse$1('\'foo\''), {"type": "Literal", "value": "foo"});
  })
  .test('parse "foo"', t => {
    t.deepEqual(parse$1('"foo"'), {"type": "Literal", "value": "foo"});
  })
  .test('parse true', t => {
    t.deepEqual(parse$1('true'), {"type": "Literal", "value": true});
  })
  .test('parse false', t => {
    t.deepEqual(parse$1('false'), {"type": "Literal", "value": false});
  })
  .test('parse null', t => {
    t.deepEqual(parse$1('null'), {"type": "Literal", "value": null});
  })
  .test('parse /foo/i', t => {
    t.deepEqual(parse$1('/foo/i'), {
      type: 'Literal',
      value: /foo/i,
      regex: {pattern: 'foo', flags: 'i'}
    });
  })
  .test('parse /foo/', t => {
    t.deepEqual(parse$1('/foo/'), {
      type: 'Literal',
      value: /foo/,
      regex: {pattern: 'foo', flags: ''}
    });
  })
  .test('parse /[0-9]*/i', t => {
    t.deepEqual(parse$1('/[0-9]*/i'), {
      type: 'Literal',
      value: /[0-9]*/i,
      regex: {pattern: '[0-9]*', flags: 'i'}
    });
  })
  .test('parse /foo/gi', t => {
    t.deepEqual(parse$1('/foo/gi'), {"type": "Literal", "value": {}, "regex": {"pattern": "foo", "flags": "gi"}});
  })
  .test('parse (")")', t => {
    t.deepEqual(parse$1('(")")'), {"type": "Literal", "value": ")"}
    );
  });

var conditionals = plan()
  .test('parse a ? b : c', t => {
    t.deepEqual(parse$1('a ? b : c'), {
      "type": "ConditionalExpression",
      "test": {"type": "Identifier", "name": "a"},
      "consequent": {"type": "Identifier", "name": "b"},
      "alternate": {"type": "Identifier", "name": "c"}
    });
  })
  .test('parse true ? "foo" : 3.34', t => {
    t.deepEqual(parse$1('true ? "foo" : 3.34'), {
      "type": "ConditionalExpression",
      "test": {"type": "Literal", "value": true},
      "consequent": {"type": "Literal", "value": "foo"},
      "alternate": {"type": "Literal", "value": 3.34}
    });
  })
  .test('parse a ? b ? c : d : e', t => {
    t.deepEqual(parse$1('a ? b ? c : d : e'), {
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
    t.deepEqual(parse$1('foo()'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": []
    });
  })
  .test('parse foo(a)', t => {
    t.deepEqual(parse$1('foo(a)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,)', t => {
    t.deepEqual(parse$1('foo(a,)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,b)', t => {
    t.deepEqual(parse$1('foo(a,b)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    });
  })
  .test('parse foo(a,b,c)', t => {
    t.deepEqual(parse$1('foo(a,b,c)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    });
  })
  .test('parse foo(0.3,"foo",true,null)', t => {
    t.deepEqual(parse$1('foo(0.3,"foo",true,null)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Literal", "value": 0.3}, {"type": "Literal", "value": "foo"}, {
        "type": "Literal",
        "value": true
      }, {"type": "Literal", "value": null}]
    });
  })
  .test('parse f.g()', t => {
    t.deepEqual(parse$1('f.g()'), {
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
    t.deepEqual(parse$1('f.g(a)'), {
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
    t.deepEqual(parse$1('f.g(a, b, c)'), {
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
    t.deepEqual(parse$1('f.g.h(a,b,b)'), {
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
    t.deepEqual(parse$1('f(...a)'), {
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
    t.deepEqual(parse$1('f(a,...b)'), {
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
    t.deepEqual(parse$1('f(a,...b,)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  });

var news = plan()
  .test('parse new a;', t => {
    t.deepEqual(parse$1('new a;'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a();', t => {
    t.deepEqual(parse$1('new a();'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a(b);', t => {
    t.deepEqual(parse$1('new a(b);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: [{type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse new a(b,c);', t => {
    t.deepEqual(parse$1('new a(b,c);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse new a(b,c,d);', t => {
    t.deepEqual(parse$1('new a(b,c,d);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}]
    });
  })
  .test('parse new a.b();', t => {
    t.deepEqual(parse$1('new a.b();'), {
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
    t.deepEqual(parse$1('new a.b(c);'), {
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
    t.deepEqual(parse$1('new a.b(c,d);'), {
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
    t.deepEqual(parse$1('new a.b(c,d,e);'), {
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
    t.deepEqual(parse$1('new a.b;'), {
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
    t.deepEqual(parse$1('foo += bar || blah && bim | woot ^ "true" & 34 !== hey < bim >>> 4 + true * blam ** !nope.test++ '), {
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
    t.deepEqual(parse$1('foo = 4 + bar * test'), {
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
    t.deepEqual(parse$1('foo = (4 + bar) * test'), {
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
    t.deepEqual(parse$1('foo = bar * test + 4'), {
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
    t.deepEqual(parse$1('typeof obj === \'Object\''), {
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
    t.deepEqual(parse$1('new foo() + bar'), {
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
    t.deepEqual(parse$1('a=0,b++;'), {
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
    t.deepEqual(parse$1('a,b;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    });
  })
  .test(`parse a,b,c;`, t => {
    t.deepEqual(parse$1('a,b,c;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    });
  });

var object = plan()
  .test('parse expression {}', t => {
    t.deepEqual(parse$1('{}'), {type: 'ObjectExpression', properties: []});
  })
  .test('parse expression {a:true}', t => {
    t.deepEqual(parse$1('{a:true}'), {
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
    t.deepEqual(parse$1('{catch:true, throw:foo}'), {
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
    t.deepEqual(parse$1(`{'a':foo}`), {
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
    t.deepEqual(parse$1(`{1:'test'}`), {
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
    t.deepEqual(parse$1('{a:b}'), {
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
    t.deepEqual(parse$1('{a:b,c:d}'), {
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
    t.deepEqual(parse$1('{[b]:foo}'), {
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
    t.deepEqual(parse$1(`{['a']:foo}`), {
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
    t.deepEqual(parse$1(`{a:b, 'c':d, [e]:f}`), {
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
    t.deepEqual(parse$1(`{a:foo ? bim : bam, b:c}`), {
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
    t.deepEqual(parse$1('{get test(){}}'), {
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
    t.deepEqual(parse$1('{get: function(){}}'), {
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
    t.deepEqual(parse$1('{set test(val){}}'), {
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
    t.deepEqual(parse$1('{get(){}}'), {
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
    t.deepEqual(parse$1('{test(){}}'), {
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
    t.deepEqual(parse$1('{test(foo){}}'), {
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
    t.deepEqual(parse$1('{test(foo, bar){}}'), {
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
    t.deepEqual(parse$1('{[foo](){}}'), {
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
    t.deepEqual(parse$1('{5(){}}'), {
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
    t.deepEqual(parse$1('{"test"(){}}'), {
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
    t.deepEqual(parse$1('{b}'), {
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
    t.deepEqual(parse$1('{b, c}'), {
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
    t.deepEqual(parse$1('[]'), {type: 'ArrayExpression', elements: []});
  })
  .test('parse [a]', t => {
    t.deepEqual(parse$1('[a]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,b]', t => {
    t.deepEqual(parse$1('[a,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,a]', t => {
    t.deepEqual(parse$1('[,a]'), {
      type: 'ArrayExpression',
      elements: [null, {type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,]', t => {
    t.deepEqual(parse$1('[a,]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,,b]', t => {
    t.deepEqual(parse$1('[a,,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,,,a,,,b,,,]', t => {
    t.deepEqual(parse$1('[,,,a,,,b,,,]'), {
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
    t.deepEqual(parse$1('[a,,,b,]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [[a,b],[c,,d],]', t => {
    t.deepEqual(parse$1('[[a,b],[c,,d],]'), {
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
    t.deepEqual(parse$1('[,...b]'), {
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
    t.deepEqual(parse$1('[...b]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        }]
    });
  })
  .test('parse [b,...c]', t => {
    t.deepEqual(parse$1('[b,...c]'), {
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
    t.deepEqual(parse$1('[...b,...c]'), {
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
    t.deepEqual(parse$1('[a = b, 4+3, function(){}]'), {
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
    t.deepEqual(parse$1('function (){foo++}'), {
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
    t.deepEqual(parse$1('function *(){foo++}'), {
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
    t.deepEqual(parse$1('function a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function *a(){}', t => {
    t.deepEqual(parse$1('function *a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function (b){}', t => {
    t.deepEqual(parse$1('function (b){}'), {
      type: 'FunctionExpression',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b){foo++}', t => {
    t.deepEqual(parse$1('function a(b){foo++}'), {
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
    t.deepEqual(parse$1('function (b,c){}'), {
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
    t.deepEqual(parse$1('function a(b,c){foo++}'), {
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
    t.deepEqual(parse$1('function (b,c,d){}'), {
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
    t.deepEqual(parse$1('function a(b,c,d){foo++}'), {
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
    t.deepEqual(parse$1('function (...b){}'), {
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
    t.deepEqual(parse$1('function (aa,...b){}'), {
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
    t.deepEqual(parse$1('function (aa,b = c){}'), {
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
    t.deepEqual(parse$1('function (b = c){}'), {
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
    t.deepEqual(parse$1('function ([a,{b:{c:d}}] = {}){}'), {
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
    t.deepEqual(parse$1('() => {}'), {
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
    t.deepEqual(parse$1('a => {}'), {
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
    t.deepEqual(parse$1('(a) => {}'), {
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
    t.deepEqual(parse$1('()=>({})'), {
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
    t.deepEqual(parse$1('a =>({})'), {
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
    t.deepEqual(parse$1('a => a'), {
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
    t.deepEqual(parse$1('a => a+b'), {
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
    t.deepEqual(parse$1('(a,b) => a'), {
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
    t.deepEqual(parse$1('({a})=>a'), {
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
    t.deepEqual(parse$1('(a, ...b) => a+b'), {
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
    t.deepEqual(parse$1('class test{}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {}', t => {
    t.deepEqual(parse$1('class {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {;}', t => {
    t.deepEqual(parse$1('class {;}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class test{;;}', t => {
    t.deepEqual(parse$1('class test{;;}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {constructor(){}foo(){}}', t => {
    t.deepEqual(parse$1('class {constructor(){}foo(){}}'), {
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
    t.deepEqual(parse$1('class {get blah(){}set blah(foo){}}'), {
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
    t.deepEqual(parse$1('class test{get(){}set(foo){}}'), {
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
    t.deepEqual(parse$1('class {foo(){}}'), {
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
    t.deepEqual(parse$1('class {[foo](){}}'), {
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
    t.deepEqual(parse$1('class test{"foo"(){}}'), {
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
    t.deepEqual(parse$1('class {5(){}}'), {
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
    t.deepEqual(parse$1('class extends b {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: {type: 'Identifier', name: 'b'},
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class a extends b.c {}', t => {
    t.deepEqual(parse$1('class a extends b.c {}'), {
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
    t.deepEqual(parse$1('class {static hello(){}static get foo(){}}'), {
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

var forIn = plan()
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
  });

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
  .test('parse var foo = 54;', t => {
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
  .test(forIn)
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
