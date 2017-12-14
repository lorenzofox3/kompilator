import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse expression function (){foo++}', t => {
    t.deepEqual(parse('function (){foo++}'), {
      type: 'FunctionExpression',
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
      id: null
    });
  })
  .test('parse expression function *(){foo++}', t => {
    t.deepEqual(parse('function *(){foo++}'), {
      type: 'FunctionExpression',
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
      id: null
    });
  })
  .test('parse expression function a(){}', t => {
    t.deepEqual(parse('function a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function *a(){}', t => {
    t.deepEqual(parse('function *a(){}'), {
      type: 'FunctionExpression',
      params: [],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'a'}
    });
  })
  .test('parse expression function (b){}', t => {
    t.deepEqual(parse('function (b){}'), {
      type: 'FunctionExpression',
      params: [{type: 'Identifier', name: 'b'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b){foo++}', t => {
    t.deepEqual(parse('function a(b){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (b,c){}', t => {
    t.deepEqual(parse('function (b,c){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b,c){foo++}', t => {
    t.deepEqual(parse('function a(b,c){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (b,c,d){}', t => {
    t.deepEqual(parse('function (b,c,d){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function a(b,c,d){foo++}', t => {
    t.deepEqual(parse('function a(b,c,d){foo++}'), {
      type: 'FunctionExpression',
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
    });
  })
  .test('parse expression function (...b){}', t => {
    t.deepEqual(parse('function (...b){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'RestElement',
        argument: {type: 'Identifier', name: 'b'}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (aa,...b){}', t => {
    t.deepEqual(parse('function (aa,...b){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'aa'},
          {
            type: 'RestElement',
            argument: {type: 'Identifier', name: 'b'}
          }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (aa,b = c){}', t => {
    t.deepEqual(parse('function (aa,b = c){}'), {
      type: 'FunctionExpression',
      params:
        [{type: 'Identifier', name: 'aa'},
          {
            type: 'AssignmentPattern',
            left: {type: 'Identifier', name: 'b'},
            right: {type: 'Identifier', name: 'c'}
          }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function (b = c){}', t => {
    t.deepEqual(parse('function (b = c){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'AssignmentPattern',
        left: {type: 'Identifier', name: 'b'},
        right: {type: 'Identifier', name: 'c'}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse expression function ([a,{b:{c:d}}] = {}){}', t => {
    t.deepEqual(parse('function ([a,{b:{c:d}}] = {}){}'), {
      type: 'FunctionExpression',
      params: [{
        type: 'AssignmentPattern',
        left:
          {
            type: 'ArrayPattern',
            elements:
              [{type: 'Identifier', name: 'a'},
                {
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'b'},
                      computed: false,
                      value:
                        {
                          type: 'ObjectPattern',
                          properties:
                            [{
                              type: 'Property',
                              kind: 'init',
                              key: {type: 'Identifier', name: 'c'},
                              computed: false,
                              value: {type: 'Identifier', name: 'd'},
                              method: false,
                              shorthand: false
                            }]
                        },
                      method: false,
                      shorthand: false
                    }]
                }]
          },
        right: {type: 'ObjectExpression', properties: []}
      }],
      body: {type: 'BlockStatement', body: []},
      async: false,
      generator: false,
      id: null
    });
  })
  .test('parse () => {}', t => {
    t.deepEqual(parse('() => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => {}', t => {
    t.deepEqual(parse('a => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a) => {}', t => {
    t.deepEqual(parse('(a) => {}'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'BlockStatement', body: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse ()=>({})', t => {
    t.deepEqual(parse('()=>({})'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'ObjectExpression', properties: []},
      params: [],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a =>({})', t => {
    t.deepEqual(parse('a =>({})'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'ObjectExpression', properties: []},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => a', t => {
    t.deepEqual(parse('a => a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse a => a+b', t => {
    t.deepEqual(parse('a => a+b'), {
      type: 'ArrowFunctionExpression',
      body:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Identifier', name: 'b'},
          operator: '+'
        },
      params: [{type: 'Identifier', name: 'a'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a,b,c,d) => a', t => {
    t.deepEqual(parse('(a,b) => a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'}],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse ({a})=>a', t => {
    t.deepEqual(parse('({a})=>a'), {
      type: 'ArrowFunctionExpression',
      body: {type: 'Identifier', name: 'a'},
      params:
        [{
          type: 'ObjectPattern',
          properties:
            [{
              type: 'Property',
              key: {type: 'Identifier', name: 'a'},
              value: {type: 'Identifier', name: 'a'},
              kind: 'init',
              computed: false,
              method: false,
              shorthand: true
            }]
        }],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })
  .test('parse (a, ...b) => a+b', t => {
    t.deepEqual(parse('(a, ...b) => a+b'), {
      type: 'ArrowFunctionExpression',
      body:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Identifier', name: 'b'},
          operator: '+'
        },
      params:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'RestElement',
            argument: {type: 'Identifier', name: 'b'}
          }],
      id: null,
      async: false,
      generator: false,
      expression: true
    });
  })