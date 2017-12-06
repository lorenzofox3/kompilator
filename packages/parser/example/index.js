// import {parseProgram} from "../src/index";
// import {traverse, visit} from "../src/ast";

// const fs = require('fs');
// const path = require('path');
const utils = require('util');
// const programPath = path.resolve(__dirname, '../fixtures/react.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});


// const cherow = require('cherow');
import {parse} from 'acorn';

const program = `var a={get foo(){}, set blah(val){}, foo(a){}}`;

const ast = parse(program);


// const ast = cherow.parseScript(program,{raw:true,comments:[], locations:true});
console.log(utils.inspect(ast, {depth: null, colors: true}));


/* browser  */
// (async function  () {
//    const resp = await fetch('../fixtures/jquery.js');
//    const text = await resp.text();
//
//    const ast = parseProgram(text);
//    // console.log(ast);
// })();
/* end browser */
