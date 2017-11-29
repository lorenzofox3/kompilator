import {parse} from "./utils";
import zora from 'zora';

export default zora()
  .test('parse x || y', t => {
    t.deepEqual(parse('x || y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "||"
    });
  })
  .test('parse x || 23.4', t => {
    t.deepEqual(parse('x || 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "||"
    });
  })
  .test('parse x || null', t => {
    t.deepEqual(parse('x || null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "||"
    });
  })
  .test('parse x || false', t => {
    t.deepEqual(parse('x || false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "||"
    });
  })
  .test('parse x || "woot woot"', t => {
    t.deepEqual(parse('x || "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "||"
    });
  })
  .test('parse x && y', t => {
    t.deepEqual(parse('x && y'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&&"
    });
  })
  .test('parse x && 23.4', t => {
    t.deepEqual(parse('x && 23.4'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 23.4},
      "operator": "&&"
    });
  })
  .test('parse x && null', t => {
    t.deepEqual(parse('x && null'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&&"
    });
  })
  .test('parse x && false', t => {
    t.deepEqual(parse('x && false'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "&&"
    });
  })
  .test('parse x && "woot woot"', t => {
    t.deepEqual(parse('x && "woot woot"'), {
      "type": "LogicalExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&&"
    });
  });
