import {parse} from "../statements/utils";
import zora from 'zora';

export default zora()
  .test('parse function *test(){yield foo;}', t => {
    t.deepEqual(parse('function *test(){yield foo;}').body, [{
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
                  type: 'YieldExpression',
                  argument: {type: 'Identifier', name: 'foo'},
                  delegate: false
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield *foo.bar;}', t => {
    t.deepEqual(parse('function *test(){yield *foo.bar;}').body, [{
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
                  type: 'YieldExpression',
                  argument:
                    {
                      type: 'MemberExpression',
                      object: {type: 'Identifier', name: 'foo'},
                      computed: false,
                      property: {type: 'Identifier', name: 'bar'}
                    },
                  delegate: true
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield 4+3;}', t => {
    t.deepEqual(parse('function *test(){yield 4+3;}').body, [{
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
                  type: 'YieldExpression',
                  argument:
                    {
                      type: 'BinaryExpression',
                      left: {type: 'Literal', value: 4},
                      right: {type: 'Literal', value: 3},
                      operator: '+'
                    },
                  delegate: false
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })
  .test('parse function *test(){yield 4,5;}', t => {
    t.deepEqual(parse('function *test(){yield 4,5;}').body, [{
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
                  type: 'SequenceExpression',
                  expressions:
                    [{
                      type: 'YieldExpression',
                      argument: {type: 'Literal', value: 4},
                      delegate: false
                    },
                      {type: 'Literal', value: 5}]
                }
            }]
        },
      async: false,
      generator: true,
      id: {type: 'Identifier', name: 'test'}
    }]);
  })