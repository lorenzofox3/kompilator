import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse [a,b] =[b,a]', t => {
    t.deepEqual(parse('[a,b] = [b,a];').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'}]
            },
          operator: '=',
          right:
            {
              type: 'ArrayExpression',
              elements:
                [{type: 'Identifier', name: 'b'},
                  {type: 'Identifier', name: 'a'}]
            }
        }
    }]);
  })
  .test('parse [a,...b] =b', t => {
    t.deepEqual(parse('[a, ...b] = b;').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            },
          operator: '=',
          right: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse [a = b,[c],d = [...e] ] = f', t => {
    t.deepEqual(parse('[a = b,[c],d = [...e] ] = f').body, [{
      type: 'ExpressionStatement',
      expression:
        {
          type: 'AssignmentExpression',
          left:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                },
                  {
                    type: 'ArrayPattern',
                    elements: [{type: 'Identifier', name: 'c'}]
                  },
                  {
                    type: 'AssignmentPattern',
                    left: {type: 'Identifier', name: 'd'},
                    right:
                      {
                        type: 'ArrayExpression',
                        elements:
                          [{
                            type: 'SpreadElement',
                            argument: {type: 'Identifier', name: 'e'}
                          }]
                      }
                  }]
            },
          operator: '=',
          right: {type: 'Identifier', name: 'f'}
        }
    }]);
  })