import {parseProgram} from "../src/index";

// const fs = require('fs');
// const path = require('path');
// const utils = require('util');


// const programPath = path.resolve(__dirname, '../fixtures/jquery.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});

// import {tokenizer} from 'acorn';
// const program = `new foo() + bar`;
// const ast = acorn.parse(program)

// const ast = parseProgram(program);
// console.log(utils.inspect(ast, {depth: null}));


/* browser  */
(async function  () {
   const resp = await fetch('../fixtures/jquery.js');
   const text = await resp.text();

   const ast = parseProgram(text);
   // console.log(ast);
})();
/* end browser */
