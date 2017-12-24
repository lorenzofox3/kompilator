// import {parseScript} from "../src/index";

// const fs = require('fs');
// const path = require('path');
const utils = require('util');
// const programPath = path.resolve(__dirname, '../fixtures/jquery.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});
//
// const tokens = [...tokenize(program, {filter: _ => true})];
//
// const ws = tokens.filter(t => t.type === 0);
// const lt = tokens.filter(t => t.type === 1);
// const sc = tokens.filter(t => t.type === 2);
// const mc = tokens.filter(t => t.type === 3);
// const punc = tokens.filter(t => t.type === 4);
// const id = tokens.filter(t => t.type === 5);
//
// console.log(`white space ${ws.length}`);
// console.log(`line terminator ${lt.length}`);
// console.log(`single line comment ${sc.length}`);
// console.log(`multi line comment ${mc.length}`);
// console.log(`punctuators ${punc.length}`);
// console.log(`id ${id.length}`);


const acorn = require('acorn');
// const cherow = require('cherow');

const program = '`foo`';
console.log(utils.inspect(acorn.parse(program), {depth: null, colors: true}))
// const ast = parseScript(program);
// const ast = cherow.parse(program, {sourceType: 'script'});
// const ast = acorn.parse(program,{sourceType:'script'});
// console.log(utils.inspect(ast, {depth: null, colors: true}));

/* browser  */
// (async function  () {
//    const resp = await fetch('../fixtures/jquery.js');
//    const text = await resp.text();
//
//   const ast = parseScript(text);
//    // console.log(ast);
// })();
/* end browser */
