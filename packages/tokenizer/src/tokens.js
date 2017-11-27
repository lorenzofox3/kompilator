export const categories = {
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
export const puncutators = `{ ( ) [ ] . ... ; , < > <= >= == != === !== + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= **= <<= >>= >>>= &= |= ^= => / /= }`.split(' ');

export const allowRegexpAfter = 'case delete do else in instanceof new return throw typeof void { ( [ . ; , < > <= >= == != === !== + - * << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ^= /='.split(' ');

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
export const tokenRegistry = () => {
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

export default tokenRegistry();