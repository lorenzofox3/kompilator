import zora from 'zora';
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";
import {default as scanner} from "../src/scanners";

const p = zora();

p.test('scanner should detect a white space', assert => {
  const {type} = scanner(sourceStream(' '));
  assert.equal(type, categories.WhiteSpace, 'should have set the type to whitespace');
});

p.test('scanner should detect single line comment', assert => {
  const {type} = scanner(sourceStream(`// foo bar`), false);
  assert.equal(type, categories.SingleLineComment, 'should have set the type to single line comment');
});

p.test('scanner should detect multi line comment', assert => {
  const {type} = scanner(sourceStream('/* foo bar */'), false);
  assert.equal(type, categories.MultiLineComment, 'should have set the type to multi line comment');
});

p.test('scanner should detect with context a regexp literal', assert => {
  const {type} = scanner(sourceStream('/test/ig'), true);
  assert.equal(type, categories.RegularExpressionLiteral, 'should have set the type to regexp literal');
});

p.test('scanner should detect a division operator if context does not fit regexp literal goal', assert => {
  const {type} = scanner(sourceStream('/test/ig'), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator');
});

p.test('scanner should detect a numeric starting by a dot', assert => {
  const {type} = scanner(sourceStream('.34'), false);
  assert.equal(type, categories.NumericLiteral, 'should have set the type to Numeric literal');
});

p.test('scanner should detect a period punctuator if not followed by numbers', assert => {
  const {type} = scanner(sourceStream(`.dfo`), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator literal');
});

p.test('scanner should detect punctuator', assert => {
  const {type} = scanner(sourceStream('<='), false);
  assert.equal(type, categories.Punctuator, 'should have set the type to punctuator');
});

p.test('scanner should detect identifier', assert => {
  const {type} = scanner(sourceStream('foo'), false);
  assert.equal(type, categories.Identifier, 'should have set the type to Identifier');
});

p.test('scanner should detect line Terminator', assert => {
  const {type} = scanner(sourceStream(`
  `), false);
  assert.equal(type, categories.LineTerminator, 'should have set the type to Line terminator');
});

p.test('scanner should detect numeric literal', assert => {
  const {type} = scanner(sourceStream(`34.5`), false);
  assert.equal(type, categories.NumericLiteral, 'should have set the type to Numeric literal');
});

p.test('scanner should detect a string literal starting with single quote', assert => {
  const {type} = scanner(sourceStream(`'test'`), false);
  assert.equal(type, categories.StringLiteral, 'should have set the type to String literal');
});

p.test('scanner should detect a string literal starting with double quote', assert => {
  const {type} = scanner(sourceStream(`"test"`), false);
  assert.equal(type, categories.StringLiteral, 'should have set the type to String literal');
});

export default p;