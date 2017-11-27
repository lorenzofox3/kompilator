import zora from 'zora';
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";
import {identifiers} from "../src/scanners";


const p = zora();

const passingTests = ['foo', 'f1o2', 'f_oo', '$foo', '_foo', 'const', 'function'];

for (let t of passingTests) {
  p.test(`"${t}" should result in an identifier token `, (assert) => {
    try {
      const source = sourceStream(t);
      const {type, rawValue} = identifiers().lexeme(source);
      assert.equal(type, categories.Identifier, `"${t}" should have scan a token with identifier type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;