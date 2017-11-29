import {parse} from "./utils";
import zora from 'zora';

export default zora()
  .test('parse x=42', t => {
    t.deepEqual(parse('x=42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse (x)=(42)', t => {
    t.deepEqual(parse('(x)=(42)'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse ((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0', t => {
    t.deepEqual(parse('((((((((((((((((((((((((((((((((((((((((a)))))))))))))))))))))))))))))))))))))))) = 0'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "a"},
      "operator": "=",
      "right": {"type": "Literal", "value": 0}
    });
  })
  .test('parse x <<= 2', t => {
    t.deepEqual(parse('x <<= 2'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 2}
    });
  })
  .test('parse eval = 42', t => {
    t.deepEqual(parse('eval = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "eval"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse arguments = 42', t => {
    t.deepEqual(parse('arguments = 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "arguments"},
      "operator": "=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x *= 42', t => {
    t.deepEqual(parse('x *= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "*=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x /= 42', t => {
    t.deepEqual(parse('x /= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "/=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x %= 42', t => {
    t.deepEqual(parse('x %= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "%=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x += 42', t => {
    t.deepEqual(parse('x += 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "+=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x -= 42', t => {
    t.deepEqual(parse('x -= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "-=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x <<= 42', t => {
    t.deepEqual(parse('x <<= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "<<=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>= 42', t => {
    t.deepEqual(parse('x >>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x >>>= 42', t => {
    t.deepEqual(parse('x >>>= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": ">>>=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x &= 42', t => {
    t.deepEqual(parse('x &= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "&=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x ^= 42', t => {
    t.deepEqual(parse('x ^= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "^=",
      "right": {"type": "Literal", "value": 42}
    });
  })
  .test('parse x |= 42', t => {
    t.deepEqual(parse('x |= 42'), {
      "type": "AssignmentExpression",
      "left": {"type": "Identifier", "name": "x"},
      "operator": "|=",
      "right": {"type": "Literal", "value": 42}
    });
  });
