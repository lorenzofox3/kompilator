import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse const foo = 54, bar = bim;', t => {
    t.deepEqual(parse('const foo = 54, bar = bim;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: 54},
          id: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'VariableDeclarator',
            init: {type: 'Identifier', name: 'bim'},
            id: {type: 'Identifier', name: 'bar'}
          }],
      kind: 'const'
    }]);
  })
  .test('parse const bar=true;', t => {
    t.deepEqual(parse('const bar=true;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Literal', value: true},
          id: {type: 'Identifier', name: 'bar'}
        }],
      kind: 'const'
    }]);
  });