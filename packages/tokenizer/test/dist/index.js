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
  BooleanLiteral: 9,
  NullLiteral: 10,
  Template: 11,
  TemplateHead: 12,
  TemplateMiddle: 13,
  TemplateTail: 14
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

const sourceStream = (code) => {
  let index = 0;
  const advance = (number = 1) => {
    index += number;
  };

  const test = (regexp) => nextStretch().search(regexp) === 0;
  const nextSubStr = (count = 1) => code.substr(index, count);
  const seeNextAt = (offset = 0) => code[index + offset];
  const nextStretch = () => nextSubStr(3); //we need three chars to be really sure of the current lexical production

  const stream = {
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

const singleLineComment$1 = () => {
  const lexemeRegExp = /\/\/.*/y;
  return {
    test: (sourceStream) => sourceStream.nextSubStr(2) === SINGLE_LINE_COMMENT_START,
    lexeme: lexemeFromRegExp(lexemeRegExp, categories.SingleLineComment)
  };
};

const multiLineComment$1 = () => {
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
  singleLineComment$1,
  multiLineComment$1,
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

var scanner$1 = scanner();

const p = plan();

const singleLineComment$$1 = [`//foo`, '//* const foo bar woot f1o2*/'];
const multiLineComment$$1 = ['/* f_oo const \n foo * / bar = "what" */', '/* const foo \n bar = "what"  sdfd\n */'];

for (let t of singleLineComment$$1) {
  p.test(`"${t}" should result in an single Line comment token `, (assert) => {
    try {
      const scanner$$1 = singleLineComment$1();
      const source = sourceStream(t);
      const {type, rawValue} = scanner$$1.lexeme(source);
      assert.equal(type, categories.SingleLineComment, `"${t}" should have the single line comment token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

for (let t of multiLineComment$$1) {
  p.test(`"${t}" should result in an multi Line comment token `, (assert) => {
    try {
      const scanner$$1 = multiLineComment$1();
      const source = sourceStream(t);
      const {type, rawValue} = scanner$$1.lexeme(source);
      assert.equal(type, categories.MultiLineComment, `"${t}" should have the multiple line comment token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$1 = plan();

const passingTests = ['foo', 'f1o2', 'f_oo', '$foo', '_foo', 'const', 'function'];

for (let t of passingTests) {
  p$1.test(`"${t}" should result in an identifier token `, (assert) => {
    try {
      const source = sourceStream(t);
      const {type, rawValue} = identifiers().lexeme(source);
      assert.equal(type, categories.Identifier, `"${t}" should have scan a token with identifier type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$2 = plan();
const passingTests$1 = ["}", "{", "(", ")", "[", "]", "/", "/=", ".", "...", ";", ",", "<", ">", "<=", ">=", "==", "!=", "===", "!==", "+", "-", "*", "%", "**", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "=", "+=", "-=", "*=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "=>"];
for (let t of passingTests$1) {
  p$2.test(`"${t}" should result in a punctuator token `, (assert) => {
    try {
      const {type, rawValue} = punctuators().lexeme(sourceStream(t), false);
      assert.equal(type, categories.Punctuator, `"${t}" should have the punctuator token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$3 = plan();

const passingTests$2 = [
  '0x3F3a',
  '0X3F3a',
  '0o3705',
  '0O3705',
  '0b0101011',
  '0B0101011',
  '123',
  '023',
  '34.',
  '.3435',
  '345.767',
  '.34e-1',
  '.34E-1',
  '.65e+3',
  '.6E+3',
  '.86e4',
  '.34E4',
  '4545.4545e+5',
  '4545.4545E+5',
  '4545.4545e5',
  '4545.4545E5',
  '4545.4545e-5',
  '4545.4545E-5',
  '34e+5',
  '34E+5',
  '34e5',
  '34E5',
  '34e-5',
  '34E-5',
];

for (let t of passingTests$2) {
  p$3.test(`"${t}" should result in a numeric literal token `, (assert) => {
    try {
      const {type, rawValue} = numbers().lexeme(sourceStream(t));
      assert.equal(type, categories.NumericLiteral, `"${t}" should have the numeric literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$4 = plan();

const passingTests$3 = [
  `/a+b?*/`,
  `/a+b?*/ig`,
  `/\\s+sbw/`,
  `/\\s+sbw/ig`,
  `/\\s|[0-9]*/`,
  `/\\s|[0-9]+/ig`,
  `/\\s|[0-9\\-]/`,
];

for (let t of passingTests$3) {
  p$4.test(`"${t}" should result in a regexp literal token`, (assert) => {
    try {
      const {type, rawValue} = regularExpression().lexeme(sourceStream(t),true);
      assert.equal(type, categories.RegularExpressionLiteral, `"${t}" should have the regexp literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$5 = plan();

const passingTests$4 = [
  `"test"`,
  `'test'`,
  `"te\\"st"`,
  `'te\\'st'`,
  `"te'st"`,
  `'te"st'`
];

for (let t of passingTests$4) {
  p$5.test(`"${t}" should result in a string literal token `, (assert) => {
    try {
      const {type, rawValue} = stringLiteral().lexeme(sourceStream(t));
      assert.equal(type, categories.StringLiteral, `"${t}" should have the string literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$6 = plan();

const passingTests$5 = [
  String.fromCodePoint(0x0009), // character tabulation,
  String.fromCodePoint(0x000b), // Line Tabulation,
  String.fromCodePoint(0x000c), // form feed,
  String.fromCodePoint(0x0020), // space
  String.fromCodePoint(0x00a0), // no break space,
  String.fromCodePoint(0xfeff) // zero with no break space,
];

for (let t of passingTests$5) {
  p$6.test(`"${t}" should result in a white space token instruction `, (assert) => {
    try {
      const {type, rawValue} = whiteSpace().lexeme(sourceStream(t));
      assert.equal(type, categories.WhiteSpace, `"${t}" should have the white space token category`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$7 = plan();

const passingTests$6 = [
  String.fromCodePoint(0x000A), //	LINE FEED (LF)	<LF>
  String.fromCodePoint(0x000D), //	CARRIAGE RETURN (CR)	<CR>
  String.fromCodePoint(0x2028), //	LINE SEPARATOR	<LS>
  String.fromCodePoint(0x2029) //	PARAGRAPH SEPARATOR	<PS>
];

for (let t of passingTests$6) {
  p$7.test(`"${t}" should result in a line terminator token instruction `, (assert) => {
    try {
      const {type, rawValue} = lineTerminator().lexeme(sourceStream(t));
      assert.equal(type, categories.LineTerminator, `"${t}" should have the line terminator token category`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

const p$8 = plan();

p$8.test('scanner should detect a white space', assert => {
  const {type} = scanner$1(sourceStream(' '));
  assert.equal(type, categories.WhiteSpace, 'should have set the type to whitespace');
});

p$8.test('scanner should detect single line comment', assert => {
  const {type} = scanner$1(sourceStream(`// foo bar`), false);
  assert.equal(type, categories.SingleLineComment, 'should have set the type to single line comment');
});

p$8.test('scanner should detect multi line comment', assert => {
  const {type} = scanner$1(sourceStream('/* foo bar */'), false);
  assert.equal(type, categories.MultiLineComment, 'should have set the type to multi line comment');
});

p$8.test('scanner should detect with context a regexp literal', assert => {
  const {type} = scanner$1(sourceStream('/test/ig'), true);
  assert.equal(type, categories.RegularExpressionLiteral, 'should have set the type to regexp literal');
});

p$8.test('scanner should detect a division operator if context does not fit regexp literal goal', assert => {
  const {type} = scanner$1(sourceStream('/test/ig'), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator');
});

p$8.test('scanner should detect a numeric starting by a dot', assert => {
  const {type} = scanner$1(sourceStream('.34'), false);
  assert.equal(type, categories.NumericLiteral, 'should have set the type to Numeric literal');
});

p$8.test('scanner should detect a period punctuator if not followed by numbers', assert => {
  const {type} = scanner$1(sourceStream(`.dfo`), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator literal');
});

p$8.test('scanner should detect punctuator', assert => {
  const {type} = scanner$1(sourceStream('<='), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator');
});

p$8.test('scanner should detect identifier', assert => {
  const {type} = scanner$1(sourceStream('foo'), false);
  assert.equal(type, categories.Identifier, 'should have set the type to Identifier');
});

p$8.test('scanner should detect line Terminator', assert => {
  const {type} = scanner$1(sourceStream(`
  `), false);
  assert.equal(type, categories.LineTerminator, 'should have set the type to Line terminator');
});

p$8.test('scanner should detect numeric literal', assert => {
  const {type} = scanner$1(sourceStream(`34.5`), false);
  assert.equal(type, categories.NumericLiteral, 'should have set the type to Numeric literal');
});

p$8.test('scanner should detect a string literal starting with single quote', assert => {
  const {type} = scanner$1(sourceStream(`'test'`), false);
  assert.equal(type, categories.StringLiteral, 'should have set the type to String literal');
});

p$8.test('scanner should detect a string literal starting with double quote', assert => {
  const {type} = scanner$1(sourceStream(`"test"`), false);
  assert.equal(type, categories.StringLiteral, 'should have set the type to String literal');
});

plan()
  .test(p)
  .test(p$1)
  .test(p$2)
  .test(p$3)
  .test(p$4)
  .test(p$5)
  .test(p$6)
  .test(p$7)
  .test(p$8)
  .run();

}());
//# sourceMappingURL=index.js.map
