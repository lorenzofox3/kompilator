import zora from 'zora';
import {spotlight} from "../src/index";

zora()
  .test('return a stream of fragments of n lines', t => {
    const hl = spotlight({lineCount: 1});
    const code = `//comment
    function identifier(test){
      var nullVar = null;
      var string = "test";
      var bool = true;
      var otherbool = false;
      var reg = /test/;
      /*
      multipline comment
      */
    }`;

    const stream = hl(code);
    t.ok(stream[Symbol.iterator] !== void 0, 'should be iterable');
    const container = document.createElement('div');
    container.append(...stream);
    t.equal(container.innerHTML, `<div class="sl-line"><span class="sl-c">//comment</span></div><div class="sl-line">    <span class="sl-k">function</span> <span class="sl-i">identifier</span><span class="sl-p">(</span><span class="sl-i">test</span><span class="sl-p">)</span><span class="sl-p">{</span></div><div class="sl-line">      <span class="sl-k">var</span> <span class="sl-i">nullVar</span> <span class="sl-p">=</span> <span class="sl-l">null</span><span class="sl-p">;</span></div><div class="sl-line">      <span class="sl-k">var</span> <span class="sl-i">string</span> <span class="sl-p">=</span> <span class="sl-l">"test"</span><span class="sl-p">;</span></div><div class="sl-line">      <span class="sl-k">var</span> <span class="sl-i">bool</span> <span class="sl-p">=</span> <span class="sl-l">true</span><span class="sl-p">;</span></div><div class="sl-line">      <span class="sl-k">var</span> <span class="sl-i">otherbool</span> <span class="sl-p">=</span> <span class="sl-l">false</span><span class="sl-p">;</span></div><div class="sl-line">      <span class="sl-k">var</span> <span class="sl-i">reg</span> <span class="sl-p">=</span> <span class="sl-l">/test/</span><span class="sl-p">;</span></div><div class="sl-line">      <span class="sl-c">/*</span></div><div class="sl-line"><span class="sl-c">      multipline comment</span></div><div class="sl-line"><span class="sl-c">      */</span></div><div class="sl-line">    <span class="sl-p">}</span></div>`, 'html content should be equal');
  })
  .run();
