import zora from 'zora';
import {categories} from "../src/tokens";
import {lineTerminator} from "../src/scanners";
import {sourceStream} from "../src/source";

const p = zora();

const passingTests = [
  String.fromCodePoint(0x000A), //	LINE FEED (LF)	<LF>
  String.fromCodePoint(0x000D), //	CARRIAGE RETURN (CR)	<CR>
  String.fromCodePoint(0x2028), //	LINE SEPARATOR	<LS>
  String.fromCodePoint(0x2029) //	PARAGRAPH SEPARATOR	<PS>
];

for (let t of passingTests) {
  p.test(`"${t}" should result in a line terminator token instruction `, (assert) => {
    try {
      const {type, rawValue} = lineTerminator().lexeme(sourceStream(t));
      assert.equal(type, categories.LineTerminator, `"${t}" should have the line terminator token category`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;