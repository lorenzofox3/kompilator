import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse test:foo++;', t => {
    t.deepEqual(parse('test:foo++;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'test'},
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
        }
    }]);
  })
  .test('parse bar:function blah(){}', t => {
    t.deepEqual(parse('bar:function blah(){}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'bar'},
      body:
        {
          type: 'FunctionDeclaration',
          params: [],
          body: {type: 'BlockStatement', body: []},
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'blah'}
        }
    }]);
  })
  .test('parse bar:{foo++;}', t => {
    t.deepEqual(parse('bar:{foo++;}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'bar'},
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
        }
    }]);
  });
