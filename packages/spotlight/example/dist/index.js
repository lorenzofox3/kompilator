(function () {
'use strict';

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

//return an iterable sequence of lexemes (note it can only be consumed once like a generator)
const streamTokens = (code, scanner$$1) => {
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
    }
  }
};

let defaultFilter = t => t.type >= 4;
const defaultOptions = {
  scanner: defaultScanner,
  tokenRegistry: defaultRegistry,
  evaluate:defaultRegistry.evaluate,
  filter: defaultFilter
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash
const tokenize = function* (code, {scanner: scanner$$1 = defaultScanner, tokenRegistry: tokenRegistry$$1 = defaultRegistry, filter, evaluate} = defaultOptions) {
  const filterFunc = lazyFilterWith(filter || defaultFilter);
  const mapFunc = lazyMapWith(evaluate || tokenRegistry$$1.evaluate);
  const filterMap = iter => mapFunc(filterFunc(iter)); // some sort of compose (note: we could improve perf by setting the filter map through a sequence of if but it would be less flexible)
  const stream = streamTokens(code, scanner$$1);

  for (let t of filterMap(stream)) {
    yield t;
    if (Object.is(t.type, t) || t.type >= 4) {
      if (allowRegexpAfter.includes(t.rawValue)) {
        stream.allowRegexp();
      } else {
        stream.disallowRegexp();
      }
    }
  }
};

const classNames = {
  keyword: 'sl-k',
  punctuator: 'sl-p',
  comment: 'sl-c',
  identifier: 'sl-i',
  literal: 'sl-l',
};
const lineTerminatorRegex = /[\u000a\u000d\u2028\u2029]/;
const defaultTokenRegistry = tokenRegistry();

const freshLine = () => {
  const line = document.createElement('div');
  line.classList.add('sl-line');
  return line;
};

const withLine = ({count}) => function* (iterable) {
  let i, fragment, line;

  const reset = () => {
    i = 0;
    fragment = document.createDocumentFragment();
    line = freshLine();
  };

  reset();

  for (let {node, token} of iterable) {

    if (token.type !== categories.LineTerminator) {
      line.appendChild(node);
    } else {
      i++;
      fragment.appendChild(line);
      line = freshLine();
    }

    if (i >= count) {
      yield fragment;
      reset();
    }
  }

  //remaining
  fragment.appendChild(line);
  yield fragment;
};

const spotlight = ({tokens = defaultTokenRegistry, lineCount = 100} = {
  tokens: defaultTokenRegistry,
  lineCount: 100
}) => {

  const block = withLine({count: lineCount});

  function* highlight (code) {
    for (let t of tokenize(code, {tokenRegistry: tokens, filter: () => true})) {
      let node = t.type === categories.WhiteSpace || t.type === categories.LineTerminator ?
        document.createTextNode(t.rawValue) :
        document.createElement('span');
      switch (t.type) {
        case categories.WhiteSpace:
        case categories.LineTerminator:
          break;
        case categories.SingleLineComment: {
          node.classList.add(classNames.comment);
          break;
        }
        case categories.MultiLineComment: {
          //we split by lines
          const split = t.rawValue.split(lineTerminatorRegex);
          for (let i = 0; i < split.length; i++) {
            const n = document.createElement('span');
            n.classList.add(classNames.comment);
            n.textContent = split[i];
            yield {node: n, token: t};
            if (i + 1 < split.length) {
              yield {node: document.createTextNode('\n'), token: {type: categories.LineTerminator}};
            }
          }
          continue;
        }
        case categories.NumericLiteral:
        case categories.StringLiteral:
        case categories.RegularExpressionLiteral:
        case tokens.get('null'):
        case tokens.get('true'):
        case tokens.get('false'): {
          node.classList.add(classNames.literal);
          break;
        }
        case categories.Identifier: {
          node.classList.add(classNames.identifier);
          break;
        }
        default: {
          const className = t.isReserved ? classNames.keyword : classNames.punctuator;
          node.classList.add(className);
        }
      }
      node.textContent = t.rawValue;
      yield {token: t, node};
    }
  }

  return code => block(highlight(code))[Symbol.iterator]();
};

//default highlight;
const highlight = spotlight();

const bootstrap = ({selector = 'code.sl-js'} = {selector: 'code.sl-js'}) => {

  //sequentially highlight code (in the order of the document)
  for (let t of document.querySelectorAll(selector)) {
    const code = t.textContent;
    t.innerHTML = '';
    const blocks = highlight(code)[Symbol.iterator]();

    const append = () => {

      const {value, done} = blocks.next();

      if (value) {
        t.append(value);
      }

      if (done === false) {
        setTimeout(append, 60); //make browser render
      }
    };
    append();
  }
};

(async function () {

  // 1. automatic bootstrap
  bootstrap({selector: '#bootstrap'});

  // 2. interesting use case: using intersection observer api to render very long file efficiently
  const lineCount = 200;
  const highlight = spotlight({lineCount: lineCount});
  const container = document.getElementById('long-file');
  const resp = await fetch('./jquery.js'); // > 8000 lines
  const text = await resp.text();

  const stream = highlight(text)[Symbol.iterator]();

  container.innerHTML = '';

  container.append(stream.next().value);

  let strech = 1;
  let sentinel = container.children[Math.floor(lineCount / 2)];

  const options = {
    threshold: 0
  };

  const observer = new IntersectionObserver(([entry]) => {

    if (entry.isIntersecting) {

      const {value, done} = stream.next();
      strech++;
      if (value) {
        container.append(value);
      }
      if (done === true) {
        observer.disconnect();
      } else {
        observer.unobserve(sentinel);
        let sentinelIndex = Math.floor((strech - 1) * lineCount + lineCount / 4);
        console.log('sentinel index: ' + sentinelIndex);
        sentinel = container.children[sentinelIndex];
        observer.observe(sentinel);
      }
    }
  }, options);

  observer.observe(sentinel);

})();

}());
//# sourceMappingURL=index.js.map
