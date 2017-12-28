import {default as stream, forwardArrityOne} from './source';
import {default as defaultRegistry} from './tokens';
import {parseModuleItemList, parseStatementList} from "./statements";
import {Program} from "./ast";
import {grammarParams} from "./utils";

const parserFactory = (tokens = defaultRegistry) => {

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
      }, tokenStream, 'lookAhead', 'next', 'eat', 'allowRegexp', 'disallowRegexp', 'allowRightBrace', 'disallowRightBrace'),
      tokens);

    return parser;
  };

};

export const parseModule = program => {
  const parse = parserFactory();
  return parse(program).module();
};

export const parseExpression = (expression, precedence = -1, params = 0) => {
  const parse = parserFactory();
  return parse(expression).expression(precedence, params);
};

export const parseScript = program => {
  const parse = parserFactory();
  return parse(program).program();
};

export const parse = parseModule; //alias