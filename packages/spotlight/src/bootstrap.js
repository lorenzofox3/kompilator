import {spotlight} from "./index";

const highlight = spotlight();

export const bootstrap = ({selector = 'code.sl-js'} = {selector: 'code.sl-js'}) => {

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
        setTimeout(append, 60); //make browser render
      }
    };
    append();
  }
};