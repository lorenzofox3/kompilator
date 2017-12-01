import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse while(true){continue ;}', t => {
    t.deepEqual(parse('while(true){continue ;}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'ContinueStatement', label: null}]
        }
    }]);
  })
  .test('parse while(true){continue}', t => {
    t.deepEqual(parse('while(true){continue}').body, [{
      type: 'WhileStatement',
      test: {type: 'Literal', value: true},
      body:
        {
          type: 'BlockStatement',
          body: [{type: 'ContinueStatement', label: null}]
        }
    }]);
  })
  .test('parse block:while(true){continue block;}', t => {
    t.deepEqual(parse('block:while(true){continue block;}').body, [{
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
                  type: 'ContinueStatement',
                  label: {type: 'Identifier', name: 'block'}
                }]
            }
        }
    }]);
  })
  .test('parse block:while(true)continue block;', t => {
    t.deepEqual(parse('block:while(true)continue block;').body, [{
      type: 'LabeledStatement',
      label: {type: 'Identifier', name: 'block'},
      body:
        {
          type: 'WhileStatement',
          test: {type: 'Literal', value: true},
          body:
            {
              type: 'ContinueStatement',
              label: {type: 'Identifier', name: 'block'}
            }
        }
    }]);
  });

