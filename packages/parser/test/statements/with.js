import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse with(foo)bar++;', t => {
    t.deepEqual(parse('with(foo)bar++;').body, [{
      type: 'WithStatement',
      object: {type: 'Identifier', name: 'foo'},
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
        }
    }]);
  })
  .test('parse with(foo.bar){test();}', t => {
    t.deepEqual(parse('with(foo.bar){test();}').body, [{
      type: 'WithStatement',
      object:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'foo'},
          computed: false,
          property: {type: 'Identifier', name: 'bar'}
        },
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'CallExpression',
                  callee: {type: 'Identifier', name: 'test'},
                  arguments: []
                }
            }]
        }
    }]);
  });
