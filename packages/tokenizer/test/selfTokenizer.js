import {tokenize} from "../src/index";
import {categories, default as tokensRegistry} from '../src/tokens';
import zora from 'zora';

export default zora()
  .test('should be able to switch syntactic context alone (for regexp)', t => {
    const tokens = [...tokenize('foo = bar / 4')];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator,
      categories.NumericLiteral
    ]);
  })
  .test('should be able to switch syntactic context alone (for regexp)', t => {
    const tokens = [...tokenize('foo = /bar/g')];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.Identifier,
      categories.Punctuator,
      categories.RegularExpressionLiteral
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("`foo ${bar + bim}blah`")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.TemplateHead,
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.TemplateTail
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("if(foo){ bar } else { bim }")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("`foo ${bar + bim}blah ${bar} woot`")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.TemplateHead,
      categories.Identifier,
      categories.Punctuator,
      categories.Identifier,
      categories.TemplateMiddle,
      categories.Identifier,
      categories.TemplateTail
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("`foo ${({bim:'blah'})}`")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.TemplateHead,
      categories.Punctuator,
      categories.Punctuator,
      categories.Identifier,
      categories.Punctuator,
      categories.StringLiteral,
      categories.Punctuator,
      categories.Punctuator,
      categories.TemplateTail
    ]);
  });