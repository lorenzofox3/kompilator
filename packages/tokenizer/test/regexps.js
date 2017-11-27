import zora from 'zora';
import {regularExpression} from "../src/scanners";
import {sourceStream} from "../src/source";
import {categories} from "../src/tokens";


const p = zora();

const passingTests = [
  `/a+b?*/`,
  `/a+b?*/ig`,
  `/\\s+sbw/`,
  `/\\s+sbw/ig`,
  `/\\s|[0-9]*/`,
  `/\\s|[0-9]+/ig`,
  `/\\s|[0-9\\-]/`,
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a regexp literal token`, (assert) => {
    try {
      const {type, rawValue} = regularExpression().lexeme(sourceStream(t),true);
      assert.equal(type, categories.RegularExpressionLiteral, `"${t}" should have the regexp literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}


export default p;