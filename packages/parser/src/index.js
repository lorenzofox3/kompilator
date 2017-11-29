import {default as stream, forwardArrityOne} from './source';
import {default as defaultRegistry} from './tokens';
import {parseStatementList} from "./statements";

export const parserFactory = (tokens = defaultRegistry) => {

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
          return {
            type: 'Program',
            body: parseStatementList(parser)
          };
        },
        module () {
          throw new Error('not implemented');
        },
      }, tokenStream, 'lookAhead', 'next', 'eat', 'allowRegexp', 'disallowRegexp'),
      tokens);

    return parser;
  };

};

export const parseExpression = (expression) => {
  const parse = parserFactory();
  return parse(expression).expression();
};

export const parseProgram = program => {
  const parse = parserFactory();
  return parse(program).program();
};
