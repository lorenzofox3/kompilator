import zora from 'zora';
import {ECMAScriptTokenRegistry} from "../src/tokens";
import {categories} from "../../tokenizer/src/tokens";

export default zora()
  .test('token registry should extend lexical registry behaviour', t => {
    const registry = ECMAScriptTokenRegistry();
    t.equal(typeof registry.get, 'function', 'get should be defined as a function');
    t.equal(typeof registry.evaluate, 'function', 'evaluate should be define as a function');
    t.equal(registry.get('{').rawValue, '{', 'should refer to an existing token');
    t.equal(registry.evaluate({
      type: categories.Identifier,
      rawValue: '{'
    }), registry.get('{'), 'should be able to evaluate token');
  })
  .test('should have specific expression wise methods', t => {
    const registry = ECMAScriptTokenRegistry();
    t.ok(registry.hasInfix(registry.get('+')), 'should be able to lookup in its infix table');
    const plusInfix = registry.getInfix(registry.get('+'));
    t.equal(typeof plusInfix.parse, 'function', 'infix should have a parse function');
    t.equal(plusInfix.precedence, 13, 'should have the operator precedence as infix');
    t.ok(registry.hasPrefix(registry.get('+')), 'should be able to lookup in its prefix table');
    const plusPrefix = registry.getPrefix(registry.get('+'));
    t.equal(typeof plusPrefix.parse, 'function', 'prefix should have a parse function');
    t.equal(plusPrefix.precedence, 16, 'should have the operator precedence as prefix');
    t.ok(registry.hasStatement(registry.get('if')),'should be able to lookup in its statement keywords table');
    const ifToken = registry.getStatement(registry.get('if'));
    t.equal(typeof ifToken,'function','token should be mapped to a parse function');
  });
