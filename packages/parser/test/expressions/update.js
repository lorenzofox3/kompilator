import zora from 'zora';
import {parse} from "./utils"

export default zora()
  .test('parse a++', t => {
    t.deepEqual(parse('a++'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "++",
      "prefix": false
    });
  })
  .test('parse ++a', t => {
    t.deepEqual(parse('++a'), {
      "type": "UpdateExpression",
      "operator": "++",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse --a', t => {
    t.deepEqual(parse('--a'), {
      "type": "UpdateExpression",
      "operator": "--",
      "prefix": true,
      "argument": {"type": "Identifier", "name": "a"}
    });
  })
  .test('parse a--', t => {
    t.deepEqual(parse('a--'), {
      "type": "UpdateExpression",
      "argument": {"type": "Identifier", "name": "a"},
      "operator": "--",
      "prefix": false
    });
  });
