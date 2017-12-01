import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse throw new Error("foo")', t => {
    t.deepEqual(parse('throw new Error("foo")').body, [{
      type: 'ThrowStatement',
      argument:
        {
          type: 'NewExpression',
          callee: {type: 'Identifier', name: 'Error'},
          arguments: [{type: 'Literal', value: 'foo'}]
        }
    }]);
  })
  .test('parse throw foo;', t => {
    t.deepEqual(parse('throw foo;').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Identifier', name: 'foo'}
    }]);
  })
  .test('parse throw null', t => {
    t.deepEqual(parse('throw null').body, [{
      type: 'ThrowStatement',
      argument: {type: 'Literal', value: null}
    }]);
  });

