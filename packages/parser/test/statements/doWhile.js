import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse do ; while(true);', t => {
    try {

      t.deepEqual(parse('do ; while(true);').body, [{
        type: 'DoWhileStatement',
        body: {type: 'EmptyStatement'},
        test: {type: 'Literal', value: true}
      }]);
    } catch (e){
      console.log(e);
      t.fail('todo');
    }
  })
  .test('parse do foo++; while(blah < 3);', t => {
    t.deepEqual(parse('do foo++; while(blah < 3);').body, [{
      type: 'DoWhileStatement',
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
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'blah'},
          right: {type: 'Literal', value: 3},
          operator: '<'
        }
    }]);
  })
  .test('parse do {} while(false);', t => {
    t.deepEqual(parse('do {} while(false);').body, [{
      type: 'DoWhileStatement',
      body: {type: 'BlockStatement', body: []},
      test: {type: 'Literal', value: false}
    }]);
  })
  .test('parse do {foo++} while(blah < 3);', t => {
    t.deepEqual(parse('do {foo++} while(blah < 3);').body, [{
      type: 'DoWhileStatement',
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
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'blah'},
          right: {type: 'Literal', value: 3},
          operator: '<'
        }
    }]);
  });
