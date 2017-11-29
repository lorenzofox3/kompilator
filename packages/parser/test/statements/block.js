import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse {var foo = 34.5}', t => {
    t.deepEqual(parse('{var foo = 34.5}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 34.5},
              id: {type: 'Identifier', name: 'foo'}
            }],
          kind: 'var'
        }]
    }]);
  })
  .test('parse {var foo = 34.5;}', t => {
    t.deepEqual(parse('{var foo = 34.5;}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 34.5},
              id: {type: 'Identifier', name: 'foo'}
            }],
          kind: 'var'
        }]
    }]);
  })
  .test('parse {foo=34.43}', t => {
    t.deepEqual(parse('{foo=34.43}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'foo'},
              operator: '=',
              right: {type: 'Literal', value: 34.43}
            }
        }]
    }]);
  })
  .test('parse {foo=34.43;}', t => {
    t.deepEqual(parse('{foo=34.43;}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'AssignmentExpression',
              left: {type: 'Identifier', name: 'foo'},
              operator: '=',
              right: {type: 'Literal', value: 34.43}
            }
        }]
    }]);
  })
  .test('parse {f()}', t => {
    t.deepEqual(parse('{f()}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'f'},
              arguments: []
            }
        }]
    }]);
  })
  .test('parse {f();}', t => {
    t.deepEqual(parse('{f();}').body, [{
      type: 'BlockStatement',
      body:
        [{
          type: 'ExpressionStatement',
          expression:
            {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'f'},
              arguments: []
            }
        }]
    }]);
  })
  //todo
  // .test('parse {[a,b]}', t => {
  //   t.deepEqual(parse('{[a,b]}').body, [{
  //     type: 'BlockStatement',
  //     body:
  //       [{
  //         type: 'ExpressionStatement',
  //         expression:
  //           {
  //             type: 'ArrayExpression',
  //             elements:
  //               [{type: 'Identifier', name: 'a'},
  //                 {type: 'Identifier', name: 'b'}]
  //           }
  //       }]
  //   }]);
  // })
  // .test('parse {[a,b];}', t => {
  //   t.deepEqual(parse('{[a,b];}').body, [{
  //     type: 'BlockStatement',
  //     body:
  //       [{
  //         type: 'ExpressionStatement',
  //         expression:
  //           {
  //             type: 'ArrayExpression',
  //             elements:
  //               [{type: 'Identifier', name: 'a'},
  //                 {type: 'Identifier', name: 'b'}]
  //           }
  //       }]
  //   }]);
  // })
