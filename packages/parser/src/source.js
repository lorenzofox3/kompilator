import {lazyMapWith, lazyFilterWith} from "../../tokenizer/src/utils"
import {lexemes} from "../../tokenizer/src/index";
import {default as ECMAScriptTokens} from './tokens';
import {default as ECMAScriptScanner} from "../../tokenizer/src/scanners"

//forward method of arrity one (more efficient than using spread operator on arguments)
export const forwardArrityOne = (receiver, stream, ...methods) => {
  for (let m of methods) {
    receiver[m] = (arg) => stream[m](arg);
  }
  return receiver;
};

//a buffered stream token
const tokenStream = ({scanner, tokenRegistry, filter, evaluate}) => {
  const filterFunc = lazyFilterWith(filter || (t => t.type >= 4));
  const map = lazyMapWith(evaluate || tokenRegistry.evaluate);
  const filterMap = it => map(filterFunc(it));

  //as generator(only consumed once)
  return (code) => {

    const stream = lexemes(code, scanner);
    const iterator = filterMap(stream)[Symbol.iterator]();
    const buffer = [];
    let lastLoc;

    const next = () => iterator.next();

    return forwardArrityOne({
      [Symbol.iterator] () {
        return this;
      },
      lookAhead (offset = 0) {
        if (buffer.length > offset) {
          return buffer[offset]
        }
        buffer.push(next());
        return this.lookAhead(offset);
      },
      eventually (expected) {
        const {value: token, done} = this.lookAhead();
        if (!done && expected === token) {
          this.eat();
          return true;
        }
        return false;
      },
      expect (expected) {
        const nextToken = this.next();
        if (expected !== nextToken.value) {
          throw new Error(`Unexpected token: expected "${expected.rawValue}" but got "${nextToken.value.rawValue}"`);
        }
        return nextToken;
      },
      next () {
        return buffer.length ? buffer.shift() : next();
      },
      eat (number = 1) {
        const n = this.next();
        number -= 1;
        return number < 1 ? n : this.eat(number);
      }
    }, stream, 'allowRegexp', 'disallowRegexp', 'allowRightBrace', 'disallowRightBrace');
  };
};

export default tokenStream({scanner: ECMAScriptScanner, tokenRegistry: ECMAScriptTokens});