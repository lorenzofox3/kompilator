import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse +x', t => {
    t.deepEqual(parse('+x'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse +5', t => {
    t.deepEqual(parse('+5'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse +"woot woot"', t => {
    t.deepEqual(parse('+"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse +true', t => {
    t.deepEqual(parse('+true'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse +null', t => {
    t.deepEqual(parse('+null'), {
      "type": "UnaryExpression",
      "operator": "+",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse -x', t => {
    t.deepEqual(parse('-x'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse -5', t => {
    t.deepEqual(parse('-5'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse -"woot woot"', t => {
    t.deepEqual(parse('-"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse -true', t => {
    t.deepEqual(parse('-true'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse -null', t => {
    t.deepEqual(parse('-null'), {
      "type": "UnaryExpression",
      "operator": "-",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse !x', t => {
    t.deepEqual(parse('!x'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse !5', t => {
    t.deepEqual(parse('!5'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse !"woot woot"', t => {
    t.deepEqual(parse('!"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse !true', t => {
    t.deepEqual(parse('!true'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse !null', t => {
    t.deepEqual(parse('!null'), {
      "type": "UnaryExpression",
      "operator": "!",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse ~x', t => {
    t.deepEqual(parse('~x'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse ~5', t => {
    t.deepEqual(parse('~5'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse ~"woot woot"', t => {
    t.deepEqual(parse('~"woot woot"'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse ~true', t => {
    t.deepEqual(parse('~true'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse ~null', t => {
    t.deepEqual(parse('~null'), {
      "type": "UnaryExpression",
      "operator": "~",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse typeof x', t => {
    t.deepEqual(parse('typeof x'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse typeof 5', t => {
    t.deepEqual(parse('typeof 5'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse typeof "woot woot"', t => {
    t.deepEqual(parse('typeof "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse typeof true', t => {
    t.deepEqual(parse('typeof true'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse typeof null', t => {
    t.deepEqual(parse('typeof null'), {
      "type": "UnaryExpression",
      "operator": "typeof",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse void x', t => {
    t.deepEqual(parse('void x'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse void 5', t => {
    t.deepEqual(parse('void 5'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse void "woot woot"', t => {
    t.deepEqual(parse('void "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse void true', t => {
    t.deepEqual(parse('void true'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse void null', t => {
    t.deepEqual(parse('void null'), {
      "type": "UnaryExpression",
      "operator": "void",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  })
  .test('parse delete x', t => {
    t.deepEqual(parse('delete x'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Identifier", "name": "x"},
      "prefix": true
    });
  })
  .test('parse delete 5', t => {
    t.deepEqual(parse('delete 5'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": 5},
      "prefix": true
    });
  })
  .test('parse delete "woot woot"', t => {
    t.deepEqual(parse('delete "woot woot"'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": "woot woot"},
      "prefix": true
    });
  })
  .test('parse delete true', t => {
    t.deepEqual(parse('delete true'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": true},
      "prefix": true
    });
  })
  .test('parse delete null', t => {
    t.deepEqual(parse('delete null'), {
      "type": "UnaryExpression",
      "operator": "delete",
      "argument": {"type": "Literal", "value": null},
      "prefix": true
    });
  });
