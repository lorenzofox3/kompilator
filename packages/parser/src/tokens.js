import {tokenRegistry, categories} from "../../tokenizer/src/tokens";
import * as expressions from './expressions';
import * as statements from './statements';
import {parseArrayLiteralExpression, parseSpreadExpression} from "./array";
import {parseObjectLiteralExpression} from "./object";
import {parseClassDeclaration, parseClassExpression} from "./class";
import {parseFunctionExpression, parseFunctionDeclaration, parseCallExpression} from "./function";

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
  prefixMap.set(categories.Identifier, {parse: expressions.parseIdentifierExpression, precedence: -1});
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
  statementsMap.set(registry.get('var'), statements.withEventualSemiColon(statements.parseVariableDeclaration));
  statementsMap.set(registry.get('const'), statements.withEventualSemiColon(statements.parseConstDeclaration));
  statementsMap.set(registry.get('let'), statements.withEventualSemiColon(statements.parseLetDeclaration));
  statementsMap.set(registry.get('function'), parseFunctionDeclaration);
  statementsMap.set(registry.get('class'), parseClassDeclaration);
  statementsMap.set(registry.get('return'), statements.withEventualSemiColon(statements.parseReturnStatement));
  statementsMap.set(registry.get('break'), statements.withEventualSemiColon(statements.parseBreakStatement));
  statementsMap.set(registry.get('continue'), statements.withEventualSemiColon(statements.parseContinueStatement));
  statementsMap.set(registry.get('throw'), statements.withEventualSemiColon(statements.parseThrowStatement));
  statementsMap.set(registry.get('while'), statements.withEventualSemiColon(statements.parseWhileStatement));
  statementsMap.set(registry.get('do'), statements.withEventualSemiColon(statements.parseDoWhileStatement));
  statementsMap.set(registry.get('try'), statements.parseTryStatement);
  statementsMap.set(registry.get('switch'), statements.parseSwitchStatement);
  statementsMap.set(registry.get('with'), statements.parseWithStatement);
  statementsMap.set(registry.get('debugger'), statements.withEventualSemiColon(statements.parseDebuggerStatement));
  statementsMap.set(categories.Identifier, statements.parseExpressionOrLabeledStatement);

  return Object.assign(registry, {
    getInfix (token) {
      return infixMap.get(token.type);
    },
    getPrefix (token) {
      return prefixMap.get(token.type);
    },
    getStatement (token) {
      return statementsMap.get(token.type);
    },
    hasPrefix (token) {
      return prefixMap.has(token.type);
    },
    hasInfix (token) {
      return infixMap.has(token.type)
    },
    hasStatement (token) {
      return statementsMap.has(token.type);
    }
  });
};

export default ECMAScriptTokenRegistry();