import {grammarParams} from "./utils";

const tokens = {};

//var declarator
const v ={
  Identifier(n, params){

    if (n.name === 'yield' && (params & grammarParams.yield)) {
      throw new Error('yield as binding identifier is not allowed in the current context');
    }

    if (n.name === 'await' && (params & grammarParams.await)) {
      throw new Error('await as binding identifier is not allowed in the current context');
    }

    if (tokens.isReserved(n.name) && n.name !== 'yield' && n.name !== 'await') {
      throw new Error(`Binding identifier can not be reserved keyword "${n.name}"`);
    }
  }
};