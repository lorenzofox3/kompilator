// import {parseScript} from "../src/index";
// const fs = require('fs');
// const path = require('path');
const utils = require('util');
// const programPath = path.resolve(__dirname, '../fixtures/react.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});
// const acorn = require('acorn');
const cherow = require('cherow');

const program = `export default foo === true ? bar : 42`;
const ast = cherow.parseModule(program);
console.log(utils.inspect(ast, {depth: null, colors: true}));

/* browser  */
// (async function  () {
//    const resp = await fetch('../fixtures/jquery.js');
//    const text = await resp.text();
//
//   const ast = parseScript(text);
//    // console.log(ast);
// })();
/* end browser */
