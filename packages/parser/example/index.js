import {parseProgram} from "../src/index";
import {traverse, visit} from "../src/ast";

const fs = require('fs');
const path = require('path');
const utils = require('util');
const programPath = path.resolve(__dirname, '../fixtures/react.js');
// const program = fs.readFileSync(programPath, {encoding: 'utf8'});
// import {parse as acorn} from 'acorn';

const program = `function foo(a, b){
  console.log('test');
}`;

const ast = parseProgram(program);

const logLiterals = visit({
  Literal (node) {
    console.log(`Literal: ${node.value}`);
  },
  Identifier (node) {
    console.log(node);
  }
}, {
  Literal (node) {
    console.log('visit too !!');
  },
  FunctionDeclaration(node){
    console.log(node);
  }
});

logLiterals(ast);


// const [foo] = identifiers(traverse(ast));


// console.log([...traverse(ast)]);

// console.log('######################');

// const astFromAcorn = acorn(program);
// console.log(utils.inspect(astFromAcorn, {depth: null, colors:true}));


/* browser  */
// (async function  () {
//    const resp = await fetch('../fixtures/jquery.js');
//    const text = await resp.text();
//
//    const ast = parseProgram(text);
//    // console.log(ast);
// })();
/* end browser */
