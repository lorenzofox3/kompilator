import zora from 'zora';
import {stringLiteral} from "../src/scanners";
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";

const p = zora();

const passingTests = [
  `"test"`,
  `'test'`,
  `"te\\"st"`,
  `'te\\'st'`,
  `"te'st"`,
  `'te"st'`
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a string literal token `, (assert) => {
    try {
      const {type, rawValue} = stringLiteral().lexeme(sourceStream(t));
      assert.equal(type, categories.StringLiteral, `"${t}" should have the string literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;