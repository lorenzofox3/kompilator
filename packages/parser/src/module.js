import * as ast from './ast';
import {categories} from "../../tokenizer/src/tokens";
import {composeArityTwo, grammarParams} from "./utils";
import {parseLiteralExpression} from "./expressions";
import {
  parseBindingIdentifier,
  parseIdentifierName,
  parseConstDeclaration,
  parseLetDeclaration,
  parseVariableDeclaration
} from "./statements";
import {parseFunctionDeclaration} from "./function";
import {parseClassDeclaration} from "./class";

const getNewParams = params => params & ~(grammarParams.yield | grammarParams.await);
const parseNamedImport = (parser, params, specifiers) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const imported = parseIdentifierName(parser, getNewParams(params));
  let hasAs = false;
  if (parser.isReserved(next)) {
    parser.expect('as');
    hasAs = true;
  } else {
    hasAs = parser.eventually('as');
  }

  const local = hasAs ? parseBindingIdentifier(parser, getNewParams(params)) : imported;

  specifiers.push(ast.ImportSpecifier({
    local,
    imported
  }));

  if (parser.eventually(',')) { // elision is not allowed
    const {value: next} = parser.lookAhead();
    if (next === parser.get('}')) {
      return specifiers;
    }
  }

  return parseNamedImport(parser, params, specifiers);
};
const parseImportDefaultSpecifier = (parser, params, specifiers) => {
  specifiers.push(ast.ImportDefaultSpecifier({
    local: parseBindingIdentifier(parser, params)
  }));
  return specifiers;
};
const parseImportNamespaceSpecifier = (parser, params, specifiers) => {
  parser.expect('*');
  parser.expect('as');
  specifiers.push(ast.ImportNamespaceSpecifier({
    local: parseBindingIdentifier(parser, params)
  }));
  return specifiers;
};
const parseImportClause = (parser, params, specifiers = []) => {
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier) {

    parseImportDefaultSpecifier(parser, params, specifiers);

    if (parser.eventually(',')) {
      const {value: next} = parser.lookAhead();

      if (next === parser.get('*')) {
        return parseImportNamespaceSpecifier(parser, params, specifiers);
      } else if (next === parser.get('{')) {
        parser.expect('{');
        parseNamedImport(parser, params, specifiers);
        parser.expect('}');
      } else {
        throw new Error(`expected "{" or "*"`);
      }
    }
    return specifiers;
  }

  if (next === parser.get('*')) {
    return parseImportNamespaceSpecifier(parser, params, specifiers);
  }

  parser.expect('{');
  parseNamedImport(parser, params, specifiers);
  parser.expect('}');
  return specifiers;
};
const parseFromClause = (parser, params) => {
  parser.expect('from');
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.StringLiteral) {
    throw new Error('Expected a string literal');
  }
  return parseLiteralExpression(parser, params);
};

export const parseImportDeclaration = composeArityTwo(ast.ImportDeclaration, (parser, params) => {
  parser.expect('import');
  const {value: next} = parser.lookAhead();
  if (next.type === categories.StringLiteral) {
    return {
      specifiers: [],
      source: parseLiteralExpression(parser, params)
    };
  }
  const specifiers = parseImportClause(parser, params);
  const source = parseFromClause(parser, params);
  return {
    source,
    specifiers
  };
});

const parseExportAllDeclaration = composeArityTwo(ast.ExportAllDeclaration, (parser, params) => {
  parser.expect('*');
  return {
    source: parseFromClause(parser, params)
  };
});
const parseNamedExportDeclaration = (parser, params, specifiers = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const local = parseIdentifierName(parser, params);
  const exported = parser.eventually('as') ? parseIdentifierName(parser, params) : local;

  specifiers.push(ast.ExportSpecifier({
    local,
    exported
  }));

  if (parser.eventually(',')) { // elision is not allowed
    const {value: next} = parser.lookAhead();
    if (next === parser.get('}')) {
      return specifiers;
    }
  }

  return parseNamedExportDeclaration(parser, params, specifiers);
};
const parseExportAsDeclaration = (fn) => composeArityTwo(ast.ExportNamedDeclaration, (parser, params) => ({
  declaration: fn(parser, params)
}));
const parseExportAsDefaultDeclaration = (fn) => composeArityTwo(ast.ExportDefaultDeclaration, (parser, params) => ({
  declaration: fn(parser, params)
}));
export const parseExportDeclaration = (parser, params) => {
  parser.expect('export');
  const {value: next} = parser.lookAhead();
  switch (next) {
    case parser.get('*'):
      return parseExportAllDeclaration(parser, params);
    case parser.get('{'): {
      parser.expect('{');
      const node = ast.ExportNamedDeclaration({
        specifiers: parseNamedExportDeclaration(parser, params)
      });
      parser.expect('}');
      const {value: next} = parser.lookAhead();
      node.source = next === parser.get('from') ? parseFromClause(parser, params) : null;
      return node;
    }
    case parser.get('var'):
      return parseExportAsDeclaration(parseVariableDeclaration)(parser, getNewParams(params));
    case parser.get('const'):
      return parseExportAsDeclaration(parseConstDeclaration)(parser, getNewParams(params));
    case parser.get('let'):
      return parseExportAsDeclaration(parseLetDeclaration)(parser, getNewParams(params));
    case parser.get('function'):
      return parseExportAsDeclaration(parseFunctionDeclaration)(parser, getNewParams(params));
    case parser.get('class'):
      return parseExportAsDeclaration(parseClassDeclaration)(parser, getNewParams(params));
    case parser.get('default'): {
      parser.expect('default');
      const {value: next} = parser.lookAhead();
      switch (next) {
        case parser.get('function'):
          return parseExportAsDefaultDeclaration(parseFunctionDeclaration)(parser, getNewParams(params));
        case parser.get('class'):
          return parseExportAsDefaultDeclaration(parseClassDeclaration)(parser, getNewParams(params));
        default:
          return parseExportAsDefaultDeclaration((parser, params) => parser.expression(-1, getNewParams(params) & grammarParams.in))(parser, params);
      }
    }
    default:
      throw new Error('Unknown export statement');
  }

};