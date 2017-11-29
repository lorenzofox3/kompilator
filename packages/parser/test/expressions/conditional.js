import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse a ? b : c', t => {
    t.deepEqual(parse('a ? b : c'), {
      "type": "ConditionalExpression",
      "test": {"type": "Identifier", "name": "a"},
      "consequent": {"type": "Identifier", "name": "b"},
      "alternate": {"type": "Identifier", "name": "c"}
    });
  })
  .test('parse true ? "foo" : 3.34', t => {
    t.deepEqual(parse('true ? "foo" : 3.34'), {
      "type": "ConditionalExpression",
      "test": {"type": "Literal", "value": true},
      "consequent": {"type": "Literal", "value": "foo"},
      "alternate": {"type": "Literal", "value": 3.34}
    });
  })
  .test('parse a ? b ? c : d : e', t => {
    t.deepEqual(parse('a ? b ? c : d : e'), {
      "type": "ConditionalExpression",
      "test": {"type": "Identifier", "name": "a"},
      "consequent": {
        "type": "ConditionalExpression",
        "test": {"type": "Identifier", "name": "b"},
        "consequent": {"type": "Identifier", "name": "c"},
        "alternate": {"type": "Identifier", "name": "d"}
      },
      "alternate": {"type": "Identifier", "name": "e"}
    });
  })
