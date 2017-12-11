import {parse} from './utils';
import zora from 'zora';

export default zora()
  .test('parse foo()', t => {
    t.deepEqual(parse('foo()'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": []
    });
  })
  .test('parse foo(a)', t => {
    t.deepEqual(parse('foo(a)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,)', t => {
    t.deepEqual(parse('foo(a,)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}]
    });
  })
  .test('parse foo(a,b)', t => {
    t.deepEqual(parse('foo(a,b)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    });
  })
  .test('parse foo(a,b,c)', t => {
    t.deepEqual(parse('foo(a,b,c)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    });
  })
  .test('parse foo(0.3,"foo",true,null)', t => {
    t.deepEqual(parse('foo(0.3,"foo",true,null)'), {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "foo"},
      "arguments": [{"type": "Literal", "value": 0.3}, {"type": "Literal", "value": "foo"}, {
        "type": "Literal",
        "value": true
      }, {"type": "Literal", "value": null}]
    });
  })
  .test('parse f.g()', t => {
    t.deepEqual(parse('f.g()'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments: []
    });
  })
  .test('parse f.g(a)', t => {
    t.deepEqual(parse('f.g(a)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse f.g(a, b, c)', t => {
    t.deepEqual(parse('f.g(a, b, c)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'f'},
          computed: false,
          property: {type: 'Identifier', name: 'g'}
        },
      arguments:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse f.g.h(a,b,b)', t => {
    t.deepEqual(parse('f.g.h(a,b,b)'), {
      type: 'CallExpression',
      callee:
        {
          type: 'MemberExpression',
          object:
            {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: 'f'},
              computed: false,
              property: {type: 'Identifier', name: 'g'}
            },
          computed: false,
          property: {type: 'Identifier', name: 'h'}
        },
      arguments:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse f(...a)', t => {
    t.deepEqual(parse('f(...a)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'a'}
        }]
    });
  })
  .test('parse f(a,...b)', t => {
    t.deepEqual(parse('f(a,...b)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  })
  .test('parse f(a,...b,)', t => {
    t.deepEqual(parse('f(a,...b,)'), {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'f'},
      arguments:
        [{type: 'Identifier', name: 'a'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  });