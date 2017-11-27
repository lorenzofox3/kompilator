import zora from 'zora';
import {categories} from "../src/tokens";
import {whiteSpace} from "../src/scanners";
import {sourceStream} from "../src/source";

const p = zora();

const passingTests = [
  String.fromCodePoint(0x0009), // character tabulation,
  String.fromCodePoint(0x000b), // Line Tabulation,
  String.fromCodePoint(0x000c), // form feed,
  String.fromCodePoint(0x0020), // space
  String.fromCodePoint(0x00a0), // no break space,
  String.fromCodePoint(0xfeff) // zero with no break space,
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a white space token instruction `, (assert) => {
    try {
      const {type, rawValue} = whiteSpace().lexeme(sourceStream(t));
      assert.equal(type, categories.WhiteSpace, `"${t}" should have the white space token category`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;