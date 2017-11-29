import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse new a;', t => {
    t.deepEqual(parse('new a;'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a();', t => {
    t.deepEqual(parse('new a();'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: []
    });
  })
  .test('parse new a(b);', t => {
    t.deepEqual(parse('new a(b);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments: [{type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse new a(b,c);', t => {
    t.deepEqual(parse('new a(b,c);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse new a(b,c,d);', t => {
    t.deepEqual(parse('new a(b,c,d);'), {
      type: 'NewExpression',
      callee: {type: 'Identifier', name: 'a'},
      arguments:
        [{type: 'Identifier', name: 'b'},
          {type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}]
    });
  })
  .test('parse new a.b();', t => {
    t.deepEqual(parse('new a.b();'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: []
    });
  })
  .test('parse new a.b(c);', t => {
    t.deepEqual(parse('new a.b(c);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: [{type: 'Identifier', name: 'c'}]
    });
  })
  .test('parse new a.b(c,d);', t => {
    t.deepEqual(parse('new a.b(c,d);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments:
        [{type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'}]
    });
  })
  .test('parse new a.b(c,d,e);', t => {
    t.deepEqual(parse('new a.b(c,d,e);'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments:
        [{type: 'Identifier', name: 'c'},
          {type: 'Identifier', name: 'd'},
          {type: 'Identifier', name: 'e'}]
    });
  })
  .test('parse new a.b;', t => {
    t.deepEqual(parse('new a.b;'), {
      type: 'NewExpression',
      callee:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'a'},
          computed: false,
          property: {type: 'Identifier', name: 'b'}
        },
      arguments: []
    });
  })

