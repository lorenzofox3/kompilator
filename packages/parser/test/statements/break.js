import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse while(true){break ;}', t => {
    t.deepEqual(parse('while(true){break ;}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'BreakStatement', label: null}]
        }
    }]);
  })
  .test('parse while(true){break}', t => {
    t.deepEqual(parse('while(true){break}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'BreakStatement', label: null}]
        }
    }]);
  })
  .test('parse block:while(true){break block;}', t => {
    t.deepEqual(parse('block:while(true){break block;}').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'BreakStatement',
                  label: {type: 'Identifier', name: 'block'}
                }]
            }
        }
    }]);
  })
  .test('parse block:while(true)break block;', t => {
    t.deepEqual(parse('block:while(true)break block;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'BreakStatement',
              label: {type: 'Identifier', name: 'block'}
            }
        }
    }]);
  });

