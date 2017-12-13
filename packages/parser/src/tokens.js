import {tokenRegistry, categories} from "../../tokenizer/src/tokens";
import * as expressions from './expressions';
import * as statements from './statements';
import {parseArrayLiteralExpression, parseSpreadExpression} from "./array";
import {parseObjectLiteralExpression} from "./object";
import {parseClassDeclaration, parseClassExpression} from "./class";
import {parseFunctionExpression, parseFunctionDeclaration, parseCallExpression} from "./function";
import {withEventualSemiColon} from "./utils";

export const ECMAScriptTokenRegistry = () => {
  const registry = tokenRegistry();

  /**
   * EXPRESSIONS
   */

  const prefixMap = new Map();
  //unary operators
  prefixMap.set(registry.get('-'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('+'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('!'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('~'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('typeof'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('void'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('delete'), {parse: expressions.parseUnaryExpression, precedence: 16});
  prefixMap.set(registry.get('...'), {parse: parseSpreadExpression, precedence: 1});
  prefixMap.set(registry.get('yield'), {parse: expressions.parseYieldExpression, precedence: 2});
  //update operators
  prefixMap.set(registry.get('--'), {parse: expressions.parseUpdateExpressionAsPrefix, precedence: 16});
  prefixMap.set(registry.get('++'), {parse: expressions.parseUpdateExpressionAsPrefix, precedence: 16});
  //literals
  prefixMap.set(categories.StringLiteral, {parse: expressions.parseLiteralExpression, precedence: -1});
  prefixMap.set(categories.NumericLiteral, {parse: expressions.parseLiteralExpression, precedence: -1});
  prefixMap.set(categories.RegularExpressionLiteral, {
    parse: expressions.parseRegularExpressionLiteral,
    precedence: -1
  });
  prefixMap.set(registry.get('null'), {parse: expressions.parseLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('false'), {parse: expressions.parseLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('true'), {parse: expressions.parseLiteralExpression, precedence: -1});
  // prefixMap.set(categories.Template, {parse: expressions.parseTemplateLiteral, precedence: -1});
  // prefixMap.set(categories.TemplateHead, {parse: expressions.parseTemplateLiteral, precedence: -1});
  prefixMap.set(registry.get('['), {parse: parseArrayLiteralExpression, precedence: -1});
  prefixMap.set(registry.get('{'), {parse: parseObjectLiteralExpression, precedence: -1});
  //identifiers
  prefixMap.set(registry.get('this'), {parse: expressions.parseThisExpression, precedence: -1});
  prefixMap.set(registry.get('super'), {parse: expressions.parseSuperExpression, precedence: -1});
  prefixMap.set(categories.Identifier, {parse: expressions.parseIdentifierName, precedence: -1});
  //functions
  prefixMap.set(registry.get('function'), {parse: parseFunctionExpression, precedence: -1});
  prefixMap.set(registry.get('class'), {parse: parseClassExpression, precedence: -1});
  prefixMap.set(registry.get('new'), {parse: expressions.parseNewExpression, precedence: 18});
  //group
  prefixMap.set(registry.get('('), {parse: expressions.parseGroupExpression, precedence: 20});

  const infixMap = new Map();
  //sequence
  infixMap.set(registry.get(','), {parse: expressions.parseSequenceExpression, precedence: 0});
  //conditional
  infixMap.set(registry.get('?'), {parse: expressions.parseConditionalExpression, precedence: 4});
  //assignment operators
  infixMap.set(registry.get('='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('+='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('-='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('*='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('/='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('%='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('<<='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('>>='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('>>>='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('&='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('^='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  infixMap.set(registry.get('|='), {parse: expressions.parseAssignmentExpression, precedence: 3});
  //binary operators
  infixMap.set(registry.get('=='), {parse: expressions.parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('!='), {parse: expressions.parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('==='), {parse: expressions.parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('!=='), {parse: expressions.parseBinaryExpression, precedence: 10});
  infixMap.set(registry.get('<'), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('<='), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('>'), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('>='), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('in'), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('instanceof'), {parse: expressions.parseBinaryExpression, precedence: 11});
  infixMap.set(registry.get('<<'), {parse: expressions.parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('>>'), {parse: expressions.parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('>>>'), {parse: expressions.parseBinaryExpression, precedence: 12});
  infixMap.set(registry.get('+'), {parse: expressions.parseBinaryExpression, precedence: 13});
  infixMap.set(registry.get('-'), {parse: expressions.parseBinaryExpression, precedence: 13});
  infixMap.set(registry.get('*'), {parse: expressions.parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('/'), {parse: expressions.parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('%'), {parse: expressions.parseBinaryExpression, precedence: 14});
  infixMap.set(registry.get('**'), {parse: expressions.parseBinaryExpression, precedence: 15});
  infixMap.set(registry.get('|'), {parse: expressions.parseBinaryExpression, precedence: 7});
  infixMap.set(registry.get('^'), {parse: expressions.parseBinaryExpression, precedence: 8});
  infixMap.set(registry.get('&'), {parse: expressions.parseBinaryExpression, precedence: 9});
  //member access operator
  infixMap.set(registry.get('.'), {parse: expressions.parseMemberAccessExpression, precedence: 19});
  infixMap.set(registry.get('['), {parse: expressions.parseMemberAccessExpression, precedence: 19});
  //logical operators
  infixMap.set(registry.get('||'), {parse: expressions.parseLogicalExpression, precedence: 5});
  infixMap.set(registry.get('&&'), {parse: expressions.parseLogicalExpression, precedence: 6});
  //update operators
  infixMap.set(registry.get('++'), {parse: expressions.parseUpdateExpression, precedence: 17});
  infixMap.set(registry.get('--'), {parse: expressions.parseUpdateExpression, precedence: 17});
  //call
  infixMap.set(registry.get('('), {parse: parseCallExpression, precedence: 19});

  /**
   * STATEMENTS
   */

  const statementsMap = new Map();
  statementsMap.set(registry.get('if'), statements.parseIfStatement);
  statementsMap.set(registry.get(';'), statements.parseEmptyStatement);
  statementsMap.set(registry.get('{'), statements.parseBlockStatement);
  statementsMap.set(registry.get('for'), statements.parseForStatement);
  statementsMap.set(registry.get('var'), withEventualSemiColon(statements.parseVariableDeclaration));
  statementsMap.set(registry.get('const'), withEventualSemiColon(statements.parseConstDeclaration));
  statementsMap.set(registry.get('let'), withEventualSemiColon(statements.parseLetDeclaration));
  statementsMap.set(registry.get('function'), parseFunctionDeclaration);
  statementsMap.set(registry.get('class'), parseClassDeclaration);
  statementsMap.set(registry.get('return'), withEventualSemiColon(statements.parseReturnStatement));
  statementsMap.set(registry.get('break'), withEventualSemiColon(statements.parseBreakStatement));
  statementsMap.set(registry.get('continue'), withEventualSemiColon(statements.parseContinueStatement));
  statementsMap.set(registry.get('throw'), withEventualSemiColon(statements.parseThrowStatement));
  statementsMap.set(registry.get('while'), withEventualSemiColon(statements.parseWhileStatement));
  statementsMap.set(registry.get('do'), withEventualSemiColon(statements.parseDoWhileStatement));
  statementsMap.set(registry.get('try'), statements.parseTryStatement);
  statementsMap.set(registry.get('switch'), statements.parseSwitchStatement);
  statementsMap.set(registry.get('with'), statements.parseWithStatement);
  statementsMap.set(registry.get('debugger'), withEventualSemiColon(statements.parseDebuggerStatement));
  statementsMap.set(categories.Identifier, statements.parseExpressionOrLabeledStatement);

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
    addUnaryOperator(precedence){
      return this.addPrefixOperator(precedence,expressions.parseUnaryExpression);
    },
    addBinaryOperator(precedence){
      return this.addPrefixOperator(precedence,expressions.parseBinaryExpression);
    },
    addPrefixOperator(precedence, parseFunction){
      throw new Error('not Implemented');
      return {
        asPunctuator(symbol){},
        asReservedKeyWord(symbol){},
        asIdentifierName(symbol){}
      };
    },
    addInfixOperator(precendence, parseFunction){
      throw new Error('not Implemented');
      return {
        asPunctuator(symbol){},
        asReservedKeyWord(symbol){},
        asKeyword(symbol){}
      };
    },
    addStatement(parseFunction){
      throw new Error('not Implemented');
      return {
        asReservedKeyWord(symbol){},
        asKeyword(symbol){}
      };
    }
  });
};

export default ECMAScriptTokenRegistry();