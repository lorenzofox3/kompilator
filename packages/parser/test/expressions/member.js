import {parse} from "./utils";
import zora from 'zora';

export default zora()
  .test('parse a.b', t => {
    t.deepEqual(parse('a.b'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": false,
      "property": {"type": "Identifier", "name": "b"}
    });
  })
  .test('parse a.catch', t => {
    t.deepEqual(parse('a.catch'), {
      type: 'MemberExpression',
      object: {type: 'Identifier', name: 'a'},
      computed: false,
      property: {type: 'Identifier', name: 'catch'}
    });
  })
  .test('parse foo.in.catch', t => {
    t.deepEqual(parse('foo.in.catch'),
      {
        type: 'MemberExpression',
        object:
          {
            type: 'MemberExpression',
            object: {type: 'Identifier', name: 'foo'},
            computed: false,
            property: {type: 'Identifier', name: 'in'}
          },
        computed: false,
        property: {type: 'Identifier', name: 'catch'}
      });
  })
  .test('parse a[foo]', t => {
    t.deepEqual(parse('a[foo]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Identifier", "name": "foo"}
    });
  })
  .test('parse a[2]', t => {
    t.deepEqual(parse('a[2]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {"type": "Literal", "value": 2}
    });
  })
  .test('parse a[4+4]', t => {
    t.deepEqual(parse('a[4+4]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {
        "type": "BinaryExpression",
        "left": {"type": "Literal", "value": 4},
        "right": {"type": "Literal", "value": 4},
        "operator": "+"
      }
    });
  })
  .test('parse a["foo"+"bar"]', t => {
    t.deepEqual(parse('a["foo"+"bar"]'), {
      "type": "MemberExpression",
      "object": {"type": "Identifier", "name": "a"},
      "computed": true,
      "property": {
        "type": "BinaryExpression",
        "left": {"type": "Literal", "value": "foo"},
        "right": {"type": "Literal", "value": "bar"},
        "operator": "+"
      }
    });
  });

