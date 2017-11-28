//generic bootstrap
// import {bootstrap} from "../src/bootstrap";
//
// bootstrap();

import {spotlight} from "../src/index";

const lineCount = 200;
const highlight = spotlight({lineCount: lineCount});

const [container] = document.querySelectorAll('code');

(async function () {

  const resp = await fetch('./react.js');
  const text = await resp.text();

  const stream = highlight(text)[Symbol.iterator]();

  container.innerHTML = '';

  container.append(stream.next().value);

  let strech = 1;
  let sentinel = container.children[Math.floor(lineCount / 2)];

  const options = {
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {

    if (entries[0].isIntersecting) {
      const {value, done} = stream.next();

      strech++;

      if (value) {
        container.append(value);
      }

      if (done === true) {
        observer.disconnect();
      } else {
        observer.unobserve(sentinel);
        let sentinelIndex = Math.floor((strech - 1) * lineCount + lineCount / 4);
        console.log(sentinelIndex);
        sentinel = container.children[sentinelIndex];
        observer.observe(sentinel);
      }
    }
  },options);

  observer.observe(sentinel);

})();