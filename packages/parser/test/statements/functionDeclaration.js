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
  .test('parse function *a(){foo++}', t => {
    t.deepEqual(parse('function *a(){foo++}').body, [{
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
      generator: true,
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
  .test('parse function a(...b){}', t => {
    t.deepEqual(parse('function a(...b){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'RestElement',
          argument: { type: 'Identifier', name: 'b' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(aa,...b){}', t => {
    t.deepEqual(parse('function a(aa,...b){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'Identifier', name: 'aa' },
          { type: 'RestElement',
            argument: { type: 'Identifier', name: 'b' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(aa,b = c){}', t => {
    t.deepEqual(parse('function a(aa,b = c){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'Identifier', name: 'aa' },
          { type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'b' },
            right: { type: 'Identifier', name: 'c' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a(b = c){}', t => {
    t.deepEqual(parse('function a(b = c){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  .test('parse function a([a,{b:{c:d}}] = {}){}', t => {
    t.deepEqual(parse('function a([a,{b:{c:d}}] = {}){}').body,[ { type: 'FunctionDeclaration',
      params:
        [ { type: 'AssignmentPattern',
          left:
            { type: 'ArrayPattern',
              elements:
                [ { type: 'Identifier', name: 'a' },
                  { type: 'ObjectPattern',
                    properties:
                      [ { type: 'Property',
                        kind: 'init',
                        key: { type: 'Identifier', name: 'b' },
                        computed: false,
                        value:
                          { type: 'ObjectPattern',
                            properties:
                              [ { type: 'Property',
                                kind: 'init',
                                key: { type: 'Identifier', name: 'c' },
                                computed: false,
                                value: { type: 'Identifier', name: 'd' },
                                method: false,
                                shorthand: false } ] },
                        method: false,
                        shorthand: false } ] } ] },
          right: { type: 'ObjectExpression', properties: [] } } ],
      body: { type: 'BlockStatement', body: [] },
      async: false,
      generator: false,
      id: { type: 'Identifier', name: 'a' } } ]);
  })
  
