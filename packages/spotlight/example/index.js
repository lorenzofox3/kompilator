import {spotlight, bootstrap} from "../src/index";

(async function () {

  // 1. automatic bootstrap
  bootstrap({selector: '#bootstrap'});

  // 2. interesting use case: using intersection observer api to render very long file efficiently
  const lineCount = 200;
  const highlight = spotlight({lineCount: lineCount});
  const container = document.getElementById('long-file');
  const resp = await fetch('./jquery.js'); // > 8000 lines
  const text = await resp.text();

  const stream = highlight(text)[Symbol.iterator]();

  container.innerHTML = '';

  container.append(stream.next().value);

  let strech = 1;
  let sentinel = container.children[Math.floor(lineCount / 2)];

  const options = {
    threshold: 0
  };

  const observer = new IntersectionObserver(([entry]) => {

    if (entry.isIntersecting) {

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
        console.log('sentinel index: ' + sentinelIndex);
        sentinel = container.children[sentinelIndex];
        observer.observe(sentinel);
      }
    }
  }, options);

  observer.observe(sentinel);

})();