import zora from 'zora';
import {categories} from "../src/tokens";
import {sourceStream} from "../src/source";
import {
  singleLineComment as singleLineCommentScanner,
  multiLineComment as multiLineCommentScanner
} from "../src/scanners";

const p = zora();

const singleLineComment = [`//foo`, '//* const foo bar woot f1o2*/'];
const multiLineComment = ['/* f_oo const \n foo * / bar = "what" */', '/* const foo \n bar = "what"  sdfd\n */'];

for (let t of singleLineComment) {
  p.test(`"${t}" should result in an single Line comment token `, (assert) => {
    try {
      const scanner = singleLineCommentScanner();
      const source = sourceStream(t);
      const {type, rawValue} = scanner.lexeme(source);
      assert.equal(type, categories.SingleLineComment, `"${t}" should have the single line comment token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

for (let t of multiLineComment) {
  p.test(`"${t}" should result in an multi Line comment token `, (assert) => {
    try {
      const scanner = multiLineCommentScanner();
      const source = sourceStream(t);
      const {type, rawValue} = scanner.lexeme(source);
      assert.equal(type, categories.MultiLineComment, `"${t}" should have the multiple line comment token type`);
      assert.equal(rawValue, t, `should match the input`);
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });
}

export default p;