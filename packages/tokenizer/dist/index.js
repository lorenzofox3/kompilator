(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.tokenizer = {})));
}(this, (function (exports) { 'use strict';

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
  return Object.freeze(Object.assign(Object.create(null, {
    type: {
      get () {
        return this; //type is an alias to itself (so we can use in Maps as we would to for other categories such literals, etc)
      }
    }
  }), {
    value: value !== void  0 ? value : symbol,
    rawValue: symbol,
    isReserved: reservedKeywords.includes(symbol)
  }));
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
              value: lexeme.rawValue.substr(1, lexeme.rawValue.length - 2),
              isReserved: false
            });
          case categories.NumericLiteral:
            return Object.assign(lexeme, {value: Number(lexeme.rawValue), isReserved: false});
          case categories.RegularExpressionLiteral:
            return Object.assign(lexeme, {isReserved: false, value: new RegExp(lexeme.pattern, lexeme.flags)});
          default:
            return Object.assign(lexeme, {isReserved: false, value: lexeme.rawValue});
        }
      }
      return tokenMap.get(lexeme.rawValue);
    },
    addToken () {
      throw new Error('not implemented');
    }
  }
};

var defaultRegistry = tokenRegistry();

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
  const source = sourceStream(code);
  return {
    * [Symbol.iterator] () {
      while (true) {
        if (source.done === true) {
          return;
        }
        yield scanner$$1(source, context);
      }
    },
    allowRegexp () {
      context |= syntacticFlags.allowRegexp;
    },
    disallowRegexp () {
      context &= ~syntacticFlags.allowRegexp;
    },
    allowRightBrace () { // as punctuator vs template middle/tail
      context |= syntacticFlags.allowRightBrace;
    },
    disallowRightBrace () {
      context &= ~syntacticFlags.allowRightBrace;
    },
    loc () {
      return source.loc();
    }
  }
};

let defaultFilter = t => t.type >= 4;
const defaultOptions = {
  scanner: defaultScanner,
  tokenRegistry: defaultRegistry,
  evaluate: defaultRegistry.evaluate,
  filter: defaultFilter
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash
const tokenize = function* (code, {scanner: scanner$$1 = defaultScanner, tokenRegistry: tokenRegistry$$1 = defaultRegistry, filter, evaluate} = defaultOptions) {
  const filterFunc = lazyFilterWith(filter || defaultFilter);
  const mapFunc = lazyMapWith(evaluate || tokenRegistry$$1.evaluate);
  const filterMap = iter => mapFunc(filterFunc(iter));
  const stream = lexemes(code, scanner$$1);

  let substitutionStack = []; //pending braces

  for (let t of filterMap(stream)) {
    yield t;
    //meaningful tokens
    if (Object.is(t.type, t) || t.type >= 4) {

      //heuristic for regexp context
      if (allowRegexpAfter.includes(t.rawValue)) {
        stream.allowRegexp();
      } else {
        stream.disallowRegexp();
      }

      //template literal substitution
      if (t.type === categories.TemplateHead || t.type === categories.TemplateMiddle) {
        substitutionStack.push(0);
        stream.disallowRightBrace();
        stream.allowRegexp();
      } else if (t.type === categories.TemplateTail) {
        substitutionStack.pop();
      }

      //without context we need to backtrack braces
      if (substitutionStack.length) {

        const lastSubstitutionIndex = substitutionStack.length - 1;

        if (t.rawValue === '{') {
          substitutionStack[lastSubstitutionIndex] = substitutionStack[lastSubstitutionIndex] + 1;
          stream.allowRightBrace();
        }

        if (t.rawValue === '}') {
          let pending = substitutionStack[lastSubstitutionIndex] = substitutionStack[lastSubstitutionIndex] - 1;
          if (pending === 0) {
            stream.disallowRightBrace();
          }
        }
      }
    }
  }
};

exports.lexemes = lexemes;
exports.tokenize = tokenize;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
