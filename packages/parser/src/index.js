import {default as stream, forwardArrityOne} from './source';
import {default as defaultRegistry} from './tokens';
import {parseModuleItemList, parseStatementList} from "./statements";
import {Program} from "./ast";

const parserFactory = (tokens = defaultRegistry) => {

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

export const parseModule = program => {
  const parse = parserFactory();
  return parse(program).module();
};

export const parseExpression = (expression) => {
  const parse = parserFactory();
  return parse(expression).expression();
};

export const parseScript = program => {
  const parse = parserFactory();
  return parse(program).program();
};

export const parse = parseModule; //alias