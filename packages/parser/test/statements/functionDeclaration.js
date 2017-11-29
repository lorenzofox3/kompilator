import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse function a(){foo++}', t => {
    t.deepEqual(parse('function a(){foo++}').body, [{
      type: 'FunctionDeclaration',
      params: [],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(){}', t => {
    t.deepEqual(parse('function a(){}').body, [{
      type: 'FunctionDeclaration',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){}', t => {
    t.deepEqual(parse('function a(b){}').body, [{
      type: 'FunctionDeclaration',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b){foo++}', t => {
    t.deepEqual(parse('function a(b){foo++}').body, [{
      type: 'FunctionDeclaration',
      params: [{type: 'Identifier', name: 'b'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c){}', t => {
    t.deepEqual(parse('function a(b,c){}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c){foo++}', t => {
    t.deepEqual(parse('function a(b,c){foo++}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c,d){}', t => {
    t.deepEqual(parse('function a(b,c,d){}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
  .test('parse function a(b,c,d){foo++}', t => {
    t.deepEqual(parse('function a(b,c,d){foo++}').body, [{
      type: 'FunctionDeclaration',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    }]);
  })
