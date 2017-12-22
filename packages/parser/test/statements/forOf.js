import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse for(var p of blah){foo++;}', t => {
    t.deepEqual(parse('for(var p of blah){foo++;}').body, [{
      type: 'ForOfStatement',
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
      left:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: null,
              id: {type: 'Identifier', name: 'p'}
            }],
          kind: 'var'
        },
      right: {type: 'Identifier', name: 'blah'}
    }]);
  })
  .test('parse for(var p of blah.woot)foo++;', t => {
    t.deepEqual(parse('for(var p of blah.woot)foo++;').body, [{
      type: 'ForOfStatement',
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'foo'},
              operator: '++',
              prefix: false
            }
        },
      left:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: null,
              id: {type: 'Identifier', name: 'p'}
            }],
          kind: 'var'
        },
      right:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'blah'},
          computed: false,
          property: {type: 'Identifier', name: 'woot'}
        }
    }]);
  })
  .test('parse for(name of foo){}', t => {
    t.deepEqual(parse('for(name of foo){}').body, [{
      type: 'ForOfStatement',
      body: {type: 'BlockStatement', body: []},
      left: {type: 'Identifier', name: 'name'},
      right: {type: 'Identifier', name: 'foo'}
    }]);
  })

