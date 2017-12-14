import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse var foo, bar, woot;', t => {
    t.deepEqual(parse('var foo, bar, woot;').body, [{
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
      kind: 'var'
    }]);
  })
  .test('parse var foo;', t => {
    t.deepEqual(parse('var foo;').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: null,
          id: {type: 'Identifier', name: 'foo'}
        }],
      kind: 'var'
    }]);
  })
  .test('parse var foo = 54, bar;', t => {
    t.deepEqual(parse('var foo = 54, bar;').body, [{
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
      kind: 'var'
    }]);
  })
  .test('parse var foo, bar=true;', t => {
    t.deepEqual(parse('var foo, bar=true;').body, [{
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
      kind: 'var'
    }]);
  })
  .test('parse var foo = 54;', t => {
    t.deepEqual(parse('var foo = (a,b,c) => a+b+c;').body, [{
      "type": "VariableDeclaration",
      "kind": "var",
      "declarations": [{
        "type": "VariableDeclarator",
        "id": {"type": "Identifier", "name": "foo"},
        "init": {
          "type": "ArrowFunctionExpression",
          "expression": true,
          "async": false,
          "generator": false,
          "id": null,
          "params": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
            "type": "Identifier",
            "name": "c"
          }],
          "body": {
            "type": "BinaryExpression",
            "left": {
              "type": "BinaryExpression",
              "left": {"type": "Identifier", "name": "a"},
              "right": {"type": "Identifier", "name": "b"},
              "operator": "+"
            },
            "right": {"type": "Identifier", "name": "c"},
            "operator": "+"
          }
        }
      }]
    }]);
  })

