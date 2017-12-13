import zora from 'zora';
import {parseModule} from "../../src/index";

export default zora()
  .test(`parse import 'foo';`, t => {
    t.deepEqual(parseModule(`import 'foo';`).body, [{
      "type": "ImportDeclaration",
      "specifiers": [],
      "source": {"type": "Literal", "value": "foo"}
    }]);
  })
  .test(`parse import v from 'foo';`, t => {
    t.deepEqual(parseModule(`import v from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import * as v from 'foo';`, t => {
    t.deepEqual(parseModule(`import * as v from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportNamespaceSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo as bar} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo as bar} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'bar'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers: [],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo,} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo,} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`import {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'b'},
          imported: {type: 'Identifier', name: 'bar'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'what'},
          imported: {type: 'Identifier', name: 'what'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import v, * as b from 'foo';`, t => {
    t.deepEqual(parseModule(`import v, * as b from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }, {
          type: 'ImportNamespaceSpecifier',
          local: {type: 'Identifier', name: 'b'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse import v, {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`import v, {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ImportDeclaration',
      specifiers:
        [{
          type: 'ImportDefaultSpecifier',
          local: {type: 'Identifier', name: 'v'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          imported: {type: 'Identifier', name: 'foo'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'b'},
          imported: {type: 'Identifier', name: 'bar'}
        }, {
          type: 'ImportSpecifier',
          local: {type: 'Identifier', name: 'what'},
          imported: {type: 'Identifier', name: 'what'}
        }],
      source: {type: 'Literal', value: 'foo'}
    }]);
  })
  .test(`parse export * from 'blah'`, t => {
    t.deepEqual(parseModule(`export * from 'blah';`).body, [{
      type: 'ExportAllDeclaration',
      source: {type: 'Literal', value: 'blah'}
    }]);
  })
  .test(`parse export {foo as bar} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo as bar} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'bar'}
        }]
    }]);
  })
  .test(`parse export {foo} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers: [],
      declaration: null
    }]);
  })
  .test(`parse export {foo,} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo,} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {foo,bar as b, what} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {foo,bar as b, what} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'bar'},
            exported: {type: 'Identifier', name: 'b'}
          },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'what'},
            exported: {type: 'Identifier', name: 'what'}
          }],
      declaration: null
    }]);
  })
  .test(`parse export {switch as catch} from 'foo';`, t => {
    t.deepEqual(parseModule(`export {switch as catch} from 'foo';`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: {type: 'Literal', value: 'foo'},
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'switch'},
          exported: {type: 'Identifier', name: 'catch'}
        }]
    }]);
  })
  .test(`parse export {foo as bar};`, t => {
    t.deepEqual(parseModule(`export {foo as bar};`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'bar'}
        }]
    }]);
  })
  .test(`parse export {foo};`, t => {
    t.deepEqual(parseModule(`export {foo};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {};`, t => {
    t.deepEqual(parseModule(`export {};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration: null
    }]);
  })
  .test(`parse export {foo,};`, t => {
    t.deepEqual(parseModule(`export {foo,};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        }],
      declaration: null
    }]);
  })
  .test(`parse export {foo,bar as b, what};`, t => {
    t.deepEqual(parseModule(`export {foo,bar as b, what};`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'foo'},
          exported: {type: 'Identifier', name: 'foo'}
        },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'bar'},
            exported: {type: 'Identifier', name: 'b'}
          },
          {
            type: 'ExportSpecifier',
            local: {type: 'Identifier', name: 'what'},
            exported: {type: 'Identifier', name: 'what'}
          }],
      declaration: null
    }]);
  })
  .test(`parse export {switch as catch};`, t => {
    t.deepEqual(parseModule(`export {switch as catch};`).body, [{
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers:
        [{
          type: 'ExportSpecifier',
          local: {type: 'Identifier', name: 'switch'},
          exported: {type: 'Identifier', name: 'catch'}
        }]
    }]);
  })
  .test(`parse export var answer = 42;`, t => {
    t.deepEqual(parseModule(`export var answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'var'
        }
    }]);
  })
  .test(`parse export const answer = 42;`, t => {
    t.deepEqual(parseModule(`export const answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'const'
        }
    }]);
  })
  .test(`parse export let answer = 42;`, t => {
    t.deepEqual(parseModule(`export let answer = 42`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'VariableDeclaration',
          declarations:
            [{
              type: 'VariableDeclarator',
              init: {type: 'Literal', value: 42},
              id: {type: 'Identifier', name: 'answer'}
            }],
          kind: 'let'
        }
    }]);
  })
  .test(`parse export function answer() {return 42;}`, t => {
    t.deepEqual(parseModule(`export function answer() {return 42;}`).body, [{
      type: 'ExportNamedDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'FunctionDeclaration',
          params: [],
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ReturnStatement',
                  argument: {type: 'Literal', value: 42}
                }]
            },
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'answer'}
        }
    }]);
  })
  .test(`parse export default class answer{};`, t => {
    t.deepEqual(parseModule(`export default class answer{};`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'ClassDeclaration',
          id: {type: 'Identifier', name: 'answer'},
          superClass: null,
          body: {type: 'ClassBody', body: []}
        }
    }]);
  })
  .test(`parse export default function answer() {return 42;}`, t => {
    t.deepEqual(parseModule(`export default function answer() {return 42;}`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'FunctionDeclaration',
          params: [],
          body:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ReturnStatement',
                  argument: {type: 'Literal', value: 42}
                }]
            },
          async: false,
          generator: false,
          id: {type: 'Identifier', name: 'answer'}
        }
    }]);
  })
  .test(`parse export default foo === true ? bar : 42`, t => {
    t.deepEqual(parseModule(`export default foo === true ? bar : 42`).body, [{
      type: 'ExportDefaultDeclaration',
      source: null,
      specifiers: [],
      declaration:
        {
          type: 'ConditionalExpression',
          test:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'foo'},
              right: {type: 'Literal', value: true},
              operator: '==='
            },
          consequent: {type: 'Identifier', name: 'bar'},
          alternate: {type: 'Literal', value: 42}
        }
    }]);
  });
