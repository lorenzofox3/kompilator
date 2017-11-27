import zora from 'zora';
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";
import {punctuators} from "../src/scanners";

const p = zora();
const passingTests = ["}", "{", "(", ")", "[", "]", "/", "/=", ".", "...", ";", ",", "<", ">", "<=", ">=", "==", "!=", "===", "!==", "+", "-", "*", "%", "**", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "=", "+=", "-=", "*=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "=>"];
for (let t of passingTests) {
  p.test(`"${t}" should result in a punctuator token `, (assert) => {
    try {
      const {type, rawValue} = punctuators().lexeme(sourceStream(t), false);
      assert.equal(type, categories.Punctuator, `"${t}" should have the punctuator token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;