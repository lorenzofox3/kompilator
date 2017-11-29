import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse while(foo <= 3.3)blah++;', t => {
    t.deepEqual(parse('while(foo <= 3.3)blah++;').body, [{
      type: 'WhileStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'foo'},
          right: {type: 'Literal', value: 3.3},
          operator: '<='
        },
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'blah'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test('parse while(foo <= 3.3)blah++', t => {
    t.deepEqual(parse('while(foo <= 3.3)blah++').body, [{
      type: 'WhileStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'foo'},
          right: {type: 'Literal', value: 3.3},
          operator: '<='
        },
      body:
        {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'blah'},
              operator: '++',
              prefix: false
            }
        }
    }]);
  })
  .test(`parse while(true){foo+=1;}`, t => {
    t.deepEqual(parse(`while(true){foo+=1;}`).body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression:
                {
                  type: 'AssignmentExpression',
                  left: {type: 'Identifier', name: 'foo'},
                  operator: '+=',
                  right: {type: 'Literal', value: 1}
                }
            }]
        }
    }]);
  })
  .test(`parse while(true);`, t => {
    t.deepEqual(parse(`while(true);`).body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body: {type: 'EmptyStatement'}
    }]);
  });
