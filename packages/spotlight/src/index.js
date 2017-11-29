import {tokenize} from "@kompilator/tokenizer";
import {categories, tokenRegistry} from "../../tokenizer/src/tokens";

const classNames = {
  keyword: 'sl-k',
  punctuator: 'sl-p',
  comment: 'sl-c',
  identifier: 'sl-i',
  literal: 'sl-l',
};
const lineTerminatorRegex = /[\u000a\u000d\u2028\u2029]/;

// we use our own token registry so we can refer to it when mapping tokens to classNames
const defaultTokenRegistry = tokenRegistry();

const freshLine = () => {
  const line = document.createElement('div');
  line.classList.add('sl-line');
  return line;
};

const withLine = ({count}) => function* (iterable) {
  let i, fragment, line;

  const reset = () => {
    i = 0;
    fragment = document.createDocumentFragment();
    line = freshLine();
  };

  reset();

  for (let {node, token} of iterable) {

    if (token.type !== categories.LineTerminator) {
      line.appendChild(node);
    } else {
      i++;
      fragment.appendChild(line);
      line = freshLine();
    }

    if (i >= count) {
      yield fragment;
      reset();
    }
  }

  //remaining
  fragment.appendChild(line);
  yield fragment;
};

export const spotlight = ({tokens = defaultTokenRegistry, lineCount = 100} = {
  tokens: defaultTokenRegistry,
  lineCount: 100
}) => {

  const block = withLine({count: lineCount});

  function* highlight (code) {
    //we return every lexemes (including white spaces, etc) so we can respect the code format
    for (let t of tokenize(code, {tokenRegistry: tokens, filter: () => true})) {
      let node = t.type === categories.WhiteSpace || t.type === categories.LineTerminator ?
        document.createTextNode(t.rawValue) :
        document.createElement('span');
      switch (t.type) {
        case categories.WhiteSpace:
        case categories.LineTerminator:
          break;
        case categories.SingleLineComment: {
          node.classList.add(classNames.comment);
          break;
        }
        case categories.MultiLineComment: {
          //we split by lines
          const split = t.rawValue.split(lineTerminatorRegex);
          for (let i = 0; i < split.length; i++) {
            const n = document.createElement('span');
            n.classList.add(classNames.comment);
            n.textContent = split[i];
            yield {node: n, token: t};
            if (i + 1 < split.length) {
              yield {node: document.createTextNode('\n'), token: {type: categories.LineTerminator}};
            }
          }
          continue;
        }
        case categories.NumericLiteral:
        case categories.StringLiteral:
        case categories.RegularExpressionLiteral:
        case tokens.get('null'):
        case tokens.get('true'):
        case tokens.get('false'): {
          node.classList.add(classNames.literal);
          break;
        }
        case categories.Identifier: {
          node.classList.add(classNames.identifier);
          break;
        }
        default: {
          const className = t.isReserved ? classNames.keyword : classNames.punctuator;
          node.classList.add(className);
        }
      }
      node.textContent = t.rawValue;
      yield {token: t, node};
    }
  }

  return code => block(highlight(code))[Symbol.iterator]();
};

//default highlight;
const highlight = spotlight();
const defaultSelector = 'code.sl-js';

//bootstrap takes all <code> elements matching a css selector and highlight its content by chunk (to let the browser render by parts)
export const bootstrap = ({selector = defaultSelector} = {selector: defaultSelector}) => {

  //sequentially highlight code (in the order of the document)
  for (let t of document.querySelectorAll(selector)) {
    const code = t.textContent;
    t.innerHTML = '';
    const blocks = highlight(code)[Symbol.iterator]();

    const append = () => {

      const {value, done} = blocks.next();

      if (value) {
        t.append(value);
      }

      if (done === false) {
        setTimeout(append, 60); //let a window of time for the browser to render
      }
    };
    append();
  }
};