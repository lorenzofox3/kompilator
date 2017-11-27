import zora from 'zora';
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";
import {numbers} from "../src/scanners";

const p = zora();

const passingTests = [
  '0x3F3a',
  '0X3F3a',
  '0o3705',
  '0O3705',
  '0b0101011',
  '0B0101011',
  '123',
  '023',
  '34.',
  '.3435',
  '345.767',
  '.34e-1',
  '.34E-1',
  '.65e+3',
  '.6E+3',
  '.86e4',
  '.34E4',
  '4545.4545e+5',
  '4545.4545E+5',
  '4545.4545e5',
  '4545.4545E5',
  '4545.4545e-5',
  '4545.4545E-5',
  '34e+5',
  '34E+5',
  '34e5',
  '34E5',
  '34e-5',
  '34E-5',
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a numeric literal token `, (assert) => {
    try {
      const {type, rawValue} = numbers().lexeme(sourceStream(t));
      assert.equal(type, categories.NumericLiteral, `"${t}" should have the numeric literal token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;