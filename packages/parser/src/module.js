import * as ast from './ast';
import {categories} from "../../tokenizer/src/tokens";
import {composeArityOne} from "./utils";
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

const parseNamedImport = (parser, specifiers) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const imported = parseIdentifierName(parser);
  let hasAs = false;
  if (parser.isReserved(next)) {
    parser.expect('as');
    hasAs = true;
  } else {
    hasAs = parser.eventually('as');
  }

  const local = hasAs ? parseBindingIdentifier(parser) : imported;

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

  return parseNamedImport(parser, specifiers);
};
const parseImportDefaultSpecifier = (parser, specifiers) => {
  specifiers.push(ast.ImportDefaultSpecifier({
    local: parseBindingIdentifier(parser)
  }));
  return specifiers;
};
const parseImportNamespaceSpecifier = (parser, specifiers) => {
  parser.expect('*');
  parser.expect('as');
  specifiers.push(ast.ImportNamespaceSpecifier({
    local: parseBindingIdentifier(parser)
  }));
  return specifiers;
};
const parseImportClause = (parser, specifiers = []) => {
  const {value: next} = parser.lookAhead();
  if (next.type === categories.Identifier) {

    parseImportDefaultSpecifier(parser, specifiers);

    if (parser.eventually(',')) {
      const {value: next} = parser.lookAhead();

      if (next === parser.get('*')) {
        return parseImportNamespaceSpecifier(parser, specifiers);
      } else if (next === parser.get('{')) {
        parser.expect('{');
        parseNamedImport(parser, specifiers);
        parser.expect('}');
      } else {
        throw new Error(`expected "{" or "*"`);
      }
    }
    return specifiers;
  }

  if (next === parser.get('*')) {
    return parseImportNamespaceSpecifier(parser, specifiers);
  }

  parser.expect('{');
  parseNamedImport(parser, specifiers);
  parser.expect('}');
  return specifiers;
};
const parseFromClause = (parser) => {
  parser.expect('from');
  const {value: next} = parser.lookAhead();
  if (next.type !== categories.StringLiteral) {
    throw new Error('Expected a string literal');
  }
  return parseLiteralExpression(parser);
};

export const parseImportDeclaration = composeArityOne(ast.ImportDeclaration, parser => {
  parser.expect('import');
  const {value: next} = parser.lookAhead();
  if (next.type === categories.StringLiteral) {
    return {
      specifiers: [],
      source: parseLiteralExpression(parser)
    };
  }
  const specifiers = parseImportClause(parser);
  const source = parseFromClause(parser);
  return {
    source,
    specifiers
  };
});

const parseExportAllDeclaration = composeArityOne(ast.ExportAllDeclaration, parser => {
  parser.expect('*');
  return {
    source: parseFromClause(parser)
  };
});
const parseNamedExportDeclaration = (parser, specifiers = []) => {
  const {value: next} = parser.lookAhead();

  if (next === parser.get('}')) {
    return specifiers;
  }

  const local = parseIdentifierName(parser);
  const exported = parser.eventually('as') ? parseIdentifierName(parser) : local;

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

  return parseNamedExportDeclaration(parser, specifiers);
};
const parseExportAsDeclaration = (fn) => composeArityOne(ast.ExportNamedDeclaration, parser => ({
  declaration: fn(parser)
}));
const parseExportAsDefaultDeclaration = (fn) => composeArityOne(ast.ExportDefaultDeclaration, parser => ({
  declaration: fn(parser)
}));
export const parseExportDeclaration = parser => {
  parser.expect('export');
  const {value: next} = parser.lookAhead();
  switch (next) {
    case parser.get('*'):
      return parseExportAllDeclaration(parser);
    case parser.get('{'): {
      parser.expect('{');
      const node = ast.ExportNamedDeclaration({
        specifiers: parseNamedExportDeclaration(parser)
      });
      parser.expect('}');
      const {value: next} = parser.lookAhead();
      node.source = next === parser.get('from') ? parseFromClause(parser) : null;
      return node;
    }
    case parser.get('var'):
      return parseExportAsDeclaration(parseVariableDeclaration)(parser);
    case parser.get('const'):
      return parseExportAsDeclaration(parseConstDeclaration)(parser);
    case parser.get('let'):
      return parseExportAsDeclaration(parseLetDeclaration)(parser);
    case parser.get('function'):
      return parseExportAsDeclaration(parseFunctionDeclaration)(parser);
    case parser.get('class'):
      return parseExportAsDeclaration(parseClassDeclaration)(parser);
    case parser.get('default'): {
      parser.expect('default');
      const {value: next} = parser.lookAhead();
      switch (next) {
        case parser.get('function'):
          return parseExportAsDefaultDeclaration(parseFunctionDeclaration)(parser);
        case parser.get('class'):
          return parseExportAsDefaultDeclaration(parseClassDeclaration)(parser);
        default:
          return parseExportAsDefaultDeclaration(parser => parser.expression())(parser);
      }
    }
    default:
      throw new Error('Unknown export statement');
  }

};