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
  .test('parse expression {get test(){}}', t => {
    t.deepEqual(parse('{get test(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'get',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {get: function(){}}', t => {
    t.deepEqual(parse('{get: function(){}}'), {
        "type": "ObjectExpression",
        "properties": [{
          "type": "Property",
          "kind": "init",
          "value": {
            "type": "FunctionExpression",
            "id": null,
            "async": false,
            "generator": false,
            "params": [],
            "body": {"type": "BlockStatement", "body": []}
          },
          "computed": false,
          "shorthand": false,
          "method": false,
          "key": {"type": "Identifier", "name": "get"}
        }]
      }
    );
  })
  .test('parse expression {set test(val){}}', t => {
    t.deepEqual(parse('{set test(val){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [{type: 'Identifier', name: 'val'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'set',
          computed: false,
          method: false,
          shorthand: false
        }]
    });
  })
  .test('parse expression {get(){}}', t => {
    t.deepEqual(parse('{get(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'get'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(){}}', t => {
    t.deepEqual(parse('{test(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(foo){}}', t => {
    t.deepEqual(parse('{test(foo){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [{type: 'Identifier', name: 'foo'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {test(foo, bar){}}', t => {
    t.deepEqual(parse('{test(foo, bar){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params:
                [{type: 'Identifier', name: 'foo'},
                  {type: 'Identifier', name: 'bar'}],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {[foo](){}}', t => {
    t.deepEqual(parse('{[foo](){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'foo'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: true,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {5(){}}', t => {
    t.deepEqual(parse('{5(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 5},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression {"test"(){}}', t => {
    t.deepEqual(parse('{"test"(){}}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Literal', value: 'test'},
          value:
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {type: 'BlockStatement', body: []},
              generator: false,
              async: false
            },
          kind: 'init',
          computed: false,
          method: true,
          shorthand: false
        }]
    });
  })
  .test('parse expression{b}', t => {
    t.deepEqual(parse('{b}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: true
        }]
    });
  })
  .test('parse expression{b, c}', t => {
    t.deepEqual(parse('{b, c}'), {
      type: 'ObjectExpression',
      properties:
        [{
          type: 'Property',
          key: {type: 'Identifier', name: 'b'},
          value: {type: 'Identifier', name: 'b'},
          kind: 'init',
          computed: false,
          method: false,
          shorthand: true
        },
          {
            type: 'Property',
            key: {type: 'Identifier', name: 'c'},
            value: {type: 'Identifier', name: 'c'},
            kind: 'init',
            computed: false,
            method: false,
            shorthand: true
          }]
    });
  })