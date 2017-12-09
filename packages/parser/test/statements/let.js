import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse let foo, bar, woot;', t => {
    t.deepEqual(parse('let foo, bar, woot;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'bar'}
          },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'woot'}
          }],
      kind: 'let'
    }]);
  })
  .test('parse let foo;', t => {
    t.deepEqual(parse('let foo;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        }],
      kind: 'let'
    }]);
  })
  .test('parse let foo = 54, bar;', t => {
    t.deepEqual(parse('let foo = 54, bar;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: 54},
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: null,
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'let'
    }]);
  })
  .test('parse let foo, bar=true;', t => {
    t.deepEqual(parse('let foo, bar=true;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: {type: 'Literal', value: true},
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'let'
    }]);
  });