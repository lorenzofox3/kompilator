import {sourceStream} from "./source";
import {allowRegexpAfter, categories} from "./tokens";
import {syntacticFlags, lazyFilterWith, lazyMapWith} from "./utils";
import {default as defaultScanner} from './scanners';
import {default as defaultRegistry} from './tokens';

/* Note

we could greatly improve perf by directly yielding filtered (and evaluated token?) at the scanner level instead of passing every lexeme through a lazy stream combinators pipe chain,
however we would lost the great flexibility we have here !

for example if we simply ignored white space, line terminators, etc.
our filter combinator would have to run much less (at least for big files)

bottom line: we value more modularity and flexibility of the system over performance

todo: later we can give ability to the consumer to configure the scanner to perform better

*/


//return an iterable sequence of lexemes (note it can only be consumed once like a generator)
//The consumer (like a parser) will have to handle the syntactic state and the token evaluation by itself
export const lexemes = (code, scanner) => {
  let context = syntacticFlags.allowRegexp | syntacticFlags.allowRightBrace;
  let previousContext = context;
  const source = sourceStream(code);
  const holdContext = fn => _ => {
    previousContext = context;
    fn();
  };
  return {
    * [Symbol.iterator] () {
      while (true) {
        if (source.done === true) {
          return;
        }
        yield scanner(source, context);
      }
    },
    restoreContext () {
      context = previousContext
    },
    allowRegexp: holdContext(() => {
      context |= syntacticFlags.allowRegexp;
    }),
    disallowRegexp: holdContext(() => {
      context &= ~syntacticFlags.allowRegexp;
    }),
    allowRightBrace: holdContext(() => { // as punctuator vs template middle/tail
      context |= syntacticFlags.allowRightBrace;
    }),
    disallowRightBrace: holdContext(() => {
      context &= ~syntacticFlags.allowRightBrace;
    }),
    loc () {
      return source.loc();
    }
  }
};

let defaultFilter = t => t.type >= 4;
const defaultOptions = {
  scanner: defaultScanner,
  tokenRegistry: defaultRegistry,
  evaluate: defaultRegistry.evaluate,
  filter: defaultFilter
};

// a standalone tokenizer (ie uses some heuristics based on the last meaningful token to know how to scan a slash)
// https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash
export const tokenize = function* (code, {scanner = defaultScanner, tokenRegistry = defaultRegistry, filter, evaluate} = defaultOptions) {
  const filterFunc = lazyFilterWith(filter || defaultFilter);
  const mapFunc = lazyMapWith(evaluate || tokenRegistry.evaluate);
  const filterMap = iter => mapFunc(filterFunc(iter));
  const stream = lexemes(code, scanner);

  let substitutionStack = []; //pending braces

  for (let t of filterMap(stream)) {
    yield t;
    //meaningful tokens
    if (Object.is(t.type, t) || t.type >= 4) {

      //heuristic for regexp context
      if (allowRegexpAfter.includes(t.rawValue)) {
        stream.allowRegexp();
      } else {
        stream.disallowRegexp();
      }

      //template literal substitution
      if (t.type === categories.TemplateHead || t.type === categories.TemplateMiddle) {
        substitutionStack.push(0);
        stream.disallowRightBrace();
        stream.allowRegexp();
      } else if (t.type === categories.TemplateTail) {
        substitutionStack.pop();
      }

      //without context we need to backtrack braces
      if (substitutionStack.length) {

        const lastSubstitutionIndex = substitutionStack.length - 1;

        if (t.rawValue === '{') {
          substitutionStack[lastSubstitutionIndex] = substitutionStack[lastSubstitutionIndex] + 1;
          stream.allowRightBrace();
        }

        if (t.rawValue === '}') {
          let pending = substitutionStack[lastSubstitutionIndex] = substitutionStack[lastSubstitutionIndex] - 1;
          if (pending === 0) {
            stream.disallowRightBrace();
          }
        }
      }
    }
  }
};