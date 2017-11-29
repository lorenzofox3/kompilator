import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse expression function (){foo++}', t => {
    t.deepEqual(parse('function (){foo++}'),{ type: 'FunctionExpression',
      params: [],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(){}', t => {
    t.deepEqual(parse('function a(){}'),{ type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b){}', t => {
    t.deepEqual(parse('function (b){}'),{ type: 'FunctionExpression',
      params: [ { type: 'Identifier', name: 'b' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b){foo++}', t => {
    t.deepEqual(parse('function a(b){foo++}'),{ type: 'FunctionExpression',
      params: [ { type: 'Identifier', name: 'b' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b,c){}', t => {
    t.deepEqual(parse('function (b,c){}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b,c){foo++}', t => {
    t.deepEqual(parse('function a(b,c){foo++}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
  .test('parse expression function (b,c,d){}', t => {
    t.deepEqual(parse('function (b,c,d){}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: null });
  })
  .test('parse expression function a(b,c,d){foo++}', t => {
    t.deepEqual(parse('function a(b,c,d){foo++}'),{ type: 'FunctionExpression',
      params:
        [ { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' } ],
      body:
        { type: 'BlockStatement',
          body:
            [ { type: 'ExpressionStatement',
              expression:
                { type: 'UpdateExpression',
                  argument: { type: 'Identifier', name: 'foo' },
                  operator: '++',
                  prefix: false } } ] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } });
  })
