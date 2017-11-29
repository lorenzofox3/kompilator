import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse expression {}', t => {
    t.deepEqual(parse('{}'), {type: 'ObjectExpression', properties: []});
  })
  .test('parse expression {a:true}', t => {
    t.deepEqual(parse('{a:true}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Literal', value: true},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {catch:true, throw:foo}', t => {
    t.deepEqual(parse('{catch:true, throw:foo}'), {
      "type": "ObjectExpression",
      "properties": [{
        "type": "Property",
        "key": {"type": "Identifier", "name": "catch"},
        "value": {"type": "Literal", "value": true},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }, {
        "type": "Property",
        "key": {"type": "Identifier", "name": "throw"},
        "value": {"type": "Identifier", "name": "foo"},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }]
    });
  })
  .test(`parse expression {'a':foo}`, t => {
    t.deepEqual(parse(`{'a':foo}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 'a'},
          value: {type: 'Identifier', name: 'foo'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test(`parse expression = {1:'test'}`, t => {
    t.deepEqual(parse(`{1:'test'}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 1},
          value: {type: 'Literal', value: 'test'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {a:b}', t => {
    t.deepEqual(parse('{a:b}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {a:b,c:d}', t => {
    t.deepEqual(parse('{a:b,c:d}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'c'},
            value: {type: 'Identifier', name: 'd'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false
          }]
    });
  })
  .test('parse expression {[b]:foo}', t => {
    t.deepEqual(parse('{[b]:foo}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'foo'},
          kind: 'init',
          computed: true,
          method: false,
          shorthand: false
        }]
    });
  })
  .test(`parse expression {['a']:foo}`, t => {
    t.deepEqual(parse(`{['a']:foo}`), {
        "type": "ObjectExpression",
        "properties": [{
          "type": "Property",
          "key": {"type": "Literal", "value": "a"},
          "value": {"type": "Identifier", "name": "foo"},
          "kind": "init",
          "computed": true,
          "method": false,
          "shorthand": false
        }]
      }
    );
  })
  .test(`parse expression {a:b, 'c':d, [e]:f}`, t => {
    t.deepEqual(parse(`{a:b, 'c':d, [e]:f}`), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'a'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        },
          {
            type: 'Property',
            key: {type: 'Literal', value: 'c'},
            value: {type: 'Identifier', name: 'd'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false
          },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'e'},
            value: {type: 'Identifier', name: 'f'},
            kind: 'init',
            computed: true,
            method: false,
            shorthand: false
          }]
    });
  })
  .test(`parse expression {a:foo ? bim : bam, b:c}`, t => {
    t.deepEqual(parse(`{a:foo ? bim : bam, b:c}`), {
      "type": "ObjectExpression",
      "properties": [{
        "type": "Property",
        "key": {"type": "Identifier", "name": "a"},
        "value": {
          "type": "ConditionalExpression",
          "test": {"type": "Identifier", "name": "foo"},
          "consequent": {"type": "Identifier", "name": "bim"},
          "alternate": {"type": "Identifier", "name": "bam"}
        },
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }, {
        "type": "Property",
        "key": {"type": "Identifier", "name": "b"},
        "value": {"type": "Identifier", "name": "c"},
        "kind": "init",
        "computed": false,
        "method": false,
        "shorthand": false
      }]
    });
  })

