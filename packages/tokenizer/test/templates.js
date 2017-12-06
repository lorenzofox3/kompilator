import zora from 'zora';
import {templateHeadOrLiteral} from "../src/scanners";
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";

const p = zora();

const passingTests = [
  '`foo bar`',
  '`fo"o" bar`',
  '`fo\\`o bar`',
  '`fo\\`o bar \n foo bar bis \n another line`',
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a template literal token `, (assert) => {
    try {
      const {type, rawValue} = templateHeadOrLiteral().lexeme(sourceStream(t));
      assert.equal(type, categories.Template, `"${t}" should have the string literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;