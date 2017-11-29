import zora from 'zora';
import {default as source} from '../src/source';
import {default as ECMAScriptTokens} from '../src/tokens';
import {categories} from "../../tokenizer/src/tokens";

export default zora()
  .test('the source should be iterable', t => {
    const s = source('const answer = 42;');
    t.ok(s[Symbol.iterator], 'should be iterable');
  })
  .test('the source should be able to lookahead', t => {
    const s = source('const answer = 42;')[Symbol.iterator]();
    t.equal(s.lookAhead().value.rawValue, 'const');
    t.equal(s.lookAhead().value.rawValue, 'const', 'should not have advanced the stream');
    t.equal(s.lookAhead(1).value.rawValue, 'answer', 'should be able to lookahead more than the next token');
    t.equal(s.next().value.rawValue, 'const', 'should not have advanced the stream');
  })
  .test('eat and advance n tokens', t => {
    const s = source('const answer = 42;')[Symbol.iterator]();
    const last = s.eat(2);
    t.equal(last.value.rawValue, 'answer', 'should return the nth token');
    const next = s.next().value;
    t.equal(next.rawValue, '=', 'should have advanced the stream');
    const lastBis = s.eat().value;
    t.equal(lastBis.rawValue, '42', 'should eat one token by default');
  })
  .test('should advance the stream on token condition', t => {
    const s = source('const answer = 42;')[Symbol.iterator]();
    const expected = s.expect(ECMAScriptTokens.get('const')).value;
    t.equal(expected, ECMAScriptTokens.get('const'), 'should have return the expected token');
  })
  .test('should throw an error if the next token is not the expected one', t => {
    try {
      const s = source('const answer = 42;')[Symbol.iterator]();
      s.expect(ECMAScriptTokens.get('if'));
      t.fail();
    } catch (e) {
      t.equal(e.message, 'Unexpected token: expected "if" but got "const"');
    }
  })
  .test('should eventually advance the stream on expected token', t => {
    const s = source('const answer = 42;')[Symbol.iterator]();
    const expected = s.eventually(ECMAScriptTokens.get('const'));
    t.equal(expected, true, 'should return true as the token is the expected one');
    t.equal(s.next().value.rawValue, 'answer', 'should have advanced the stream');
    const nextExpected = s.eventually(ECMAScriptTokens.get('if'));
    t.equal(nextExpected, false, 'should return false as the token does not match');
    t.equal(s.next().value, ECMAScriptTokens.get('='), 'should not have advanced the stream');
  })
  .test('should tokenize based on provided context for slash character', t => {
    const s = source('/foo/')[Symbol.iterator]();
    s.disallowRegexp();
    const v = s.next().value;
    t.equal(v, ECMAScriptTokens.get('/'), 'should have understood a div punctuator token');
    const sBis = source('/foo/')[Symbol.iterator]();
    s.allowRegexp();
    const vBis = sBis.next().value;
    t.equal(vBis.type, categories.RegularExpressionLiteral, 'should have understood the next token to be a regular expression literal');
    t.equal(vBis.rawValue, '/foo/', 'should have understood the next token to be a regular expression literal');
  });

