import {sourceStream} from "./source";
import {allowRegexpAfter} from "./tokens";
import {lazyFilterWith, lazyMapWith} from "./utils";
import {default as defaultScanner, scanner} from './scanners';
import {default as defaultRegistry, tokenRegistry} from './tokens';

//return an iterable sequence of lexemes (note it can only be consumed once like a generator)
export const streamTokens = (code, scanner) => {
  let isRegexpAllowed = true;
  const source = sourceStream(code);
  return {
    * [Symbol.iterator] () {
      while (true) {
        if (source.done === true) {
          return;
        }
        yield scanner(source, isRegexpAllowed);
      }
    },
    allowRegexp () {
      isRegexpAllowed = true;
    },
    disallowRegexp () {
      isRegexpAllowed = false;
    }
  }
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash
export const tokenize = function* (code, opts = {}, scanner = defaultScanner, tokenRegistry = defaultRegistry) {
  const filter = lazyFilterWith(opts.filter || (t => t.type >= 4));
  const map = lazyMapWith(opts.evaluate || tokenRegistry.evaluate);
  const filterMap = iter => map(filter(iter)); // some sort of compose (note: we could improve perf by setting the filter map through a sequence of if but it would be less flexible)
  const stream = streamTokens(code, scanner);

  for (let t of filterMap(stream)) {
    yield t;
    if (Object.is(t.type, t) || t.type >= 4) {
      if (allowRegexpAfter.includes(t.rawValue)) {
        stream.allowRegexp();
      } else {
        stream.disallowRegexp();
      }
    }
  }
};

export {tokenRegistry as tokenRegistry};
export {scanner as scanner};
