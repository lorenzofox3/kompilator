import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse for(var i = 0;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse('for(var i = 0;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(var i = 0, j=4;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse('for(var i = 0, j=4;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            },
              {
                type: 'VariableDeclarator',
                init: {type: 'Literal', value: 4},
                id: {type: 'Identifier', name: 'j'}
              }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(i=-1;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse('for(i=-1;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init:
        {
          type: 'AssignmentExpression',
          left: {type: 'Identifier', name: 'i'},
          operator: '=',
          right:
            {
              type: 'UnaryExpression',
              operator: '-',
              argument: {type: 'Literal', value: 1},
              prefix: true
            }
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;i<foo.length;i++){bar++;}', t => {
    t.deepEqual(parse('for(;i<foo.length;i++){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init: null,
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(var i = 0;i<foo.length;i++)bar++;', t => {
    t.deepEqual(parse('for(var i = 0;i<foo.length;i++)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 0},
              id: {type: 'Identifier', name: 'i'}
            }],
          kind: 'var'
        },
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;i<foo.length;i++)bar++;', t => {
    t.deepEqual(parse('for(;i<foo.length;i++)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init: null,
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'i'},
          right:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'foo'},
              computed: false,
              property: {type: 'Identifier', name: 'length'}
            },
          operator: '<'
        },
      update:
        {
          type: 'UpdateExpression',
          argument: {type: 'Identifier', name: 'i'},
          operator: '++',
          prefix: false
        }
    }]);
  })
  .test('parse for(;;){bar++;}', t => {
    t.deepEqual(parse('for(;;){bar++;}').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'UpdateExpression',
                  argument: {type: 'Identifier', name: 'bar'},
                  operator: '++',
                  prefix: false
                }
            }]
        },
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for(;;)bar++;', t => {
    t.deepEqual(parse('for(;;)bar++;').body, [{
      type: 'ForStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'bar'},
              operator: '++',
              prefix: false
            }
        },
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for(;;);', t => {
    t.deepEqual(parse('for(;;);').body, [
      {
        type: 'ForStatement',
        body: {type: 'EmptyStatement'},
        init: null,
        test: null,
        update: null
      }]);
  })
  .test('parse for(;;){}', t => {
    t.deepEqual(parse('for(;;){}').body, [{
      type: 'ForStatement',
      body: {type: 'BlockStatement', body: []},
      init: null,
      test: null,
      update: null
    }]);
  })
  .test('parse for ( i = 0, l = 6;;) {}', t => {
    t.deepEqual(parse('for ( i = 0, l = 6;;) {}').body, [{
      type: 'ForStatement',
      body: {type: 'BlockStatement', body: []},
      init:
        {
          type: 'SequenceExpression',
          expressions:
            [{
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'i'},
              operator: '=',
              right: {type: 'Literal', value: 0}
            },
              {
                type: 'AssignmentExpression',
                left: {type: 'Identifier', name: 'l'},
                operator: '=',
                right: {type: 'Literal', value: 6}
              }]
        },
      test: null,
      update: null
    }]);
  })
