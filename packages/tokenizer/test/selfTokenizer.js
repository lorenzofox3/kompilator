import {tokenize} from "../src/index";
import {categories, default as tokensRegistry} from '../src/tokens';
import zora from 'zora';

export default zora()
  .test('should be able to switch syntactic context alone (for regexp)', t => {
    const tokens = [...tokenize('foo = bar / 4')];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.Identifier,
      tokensRegistry.get('='),
      categories.Identifier,
      tokensRegistry.get('/'),
      categories.NumericLiteral
    ]);
  })
  .test('should be able to switch syntactic context alone (for regexp)', t => {
    const tokens = [...tokenize('foo = /bar/g')];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.Identifier,
      tokensRegistry.get('='),
      categories.RegularExpressionLiteral
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("`foo ${bar + bim}blah`")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.TemplateHead,
      categories.Identifier,
      tokensRegistry.get('+'),
      categories.Identifier,
      categories.TemplateTail
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("if(foo){ bar } else { bim }")];
    t.deepEqual(tokens.map(tok => tok.type), [
      tokensRegistry.get('if'),
      tokensRegistry.get('('),
      categories.Identifier,
      tokensRegistry.get(')'),
      tokensRegistry.get('{'),
      categories.Identifier,
      tokensRegistry.get('}'),
      tokensRegistry.get('else'),
      tokensRegistry.get('{'),
      categories.Identifier,
      tokensRegistry.get('}'),
    ]);
  })
  .test('should be able to switch syntactic context alone (for template literals)', t => {
    const tokens = [...tokenize("`foo ${bar + bim}blah ${bar} woot`")];
    t.deepEqual(tokens.map(tok => tok.type), [
      categories.TemplateHead,
      categories.Identifier,
      tokensRegistry.get('+'),
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
      tokensRegistry.get('('),
      tokensRegistry.get('{'),
      categories.Identifier,
      tokensRegistry.get(':'),
      categories.StringLiteral,
      tokensRegistry.get('}'),
      tokensRegistry.get(')'),
      categories.TemplateTail
    ]);
  });



