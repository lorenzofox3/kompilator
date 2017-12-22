import {parse} from './utils';
import zora from 'zora';
import {grammarParams} from "../../src/utils";

export default zora()
  .test('parse x == y', t => {
    t.deepEqual(parse('x == y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "=="
    });
  })
  .test('parse x == 5', t => {
    t.deepEqual(parse('x == 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "=="
    });
  })
  .test('parse x == null', t => {
    t.deepEqual(parse('x == null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "=="
    });
  })
  .test('parse x == false', t => {
    t.deepEqual(parse('x == false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "=="
    });
  })
  .test('parse x == "woot woot"', t => {
    t.deepEqual(parse('x == "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "=="
    });
  })
  .test('parse x != y', t => {
    t.deepEqual(parse('x != y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!="
    });
  })
  .test('parse x != 5', t => {
    t.deepEqual(parse('x != 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!="
    });
  })
  .test('parse x != null', t => {
    t.deepEqual(parse('x != null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!="
    });
  })
  .test('parse x != false', t => {
    t.deepEqual(parse('x != false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!="
    });
  })
  .test('parse x != "woot woot"', t => {
    t.deepEqual(parse('x != "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!="
    });
  })
  .test('parse x === y', t => {
    t.deepEqual(parse('x === y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "==="
    });
  })
  .test('parse x === 5', t => {
    t.deepEqual(parse('x === 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "==="
    });
  })
  .test('parse x === null', t => {
    t.deepEqual(parse('x === null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "==="
    });
  })
  .test('parse x === false', t => {
    t.deepEqual(parse('x === false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "==="
    });
  })
  .test('parse x === "woot woot"', t => {
    t.deepEqual(parse('x === "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "==="
    });
  })
  .test('parse x !== y', t => {
    t.deepEqual(parse('x !== y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "!=="
    });
  })
  .test('parse x !== 5', t => {
    t.deepEqual(parse('x !== 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "!=="
    });
  })
  .test('parse x !== null', t => {
    t.deepEqual(parse('x !== null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "!=="
    });
  })
  .test('parse x !== false', t => {
    t.deepEqual(parse('x !== false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "!=="
    });
  })
  .test('parse x !== "woot woot"', t => {
    t.deepEqual(parse('x !== "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "!=="
    });
  })
  .test('parse x < y', t => {
    t.deepEqual(parse('x < y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<"
    });
  })
  .test('parse x < 5', t => {
    t.deepEqual(parse('x < 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<"
    });
  })
  .test('parse x < null', t => {
    t.deepEqual(parse('x < null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<"
    });
  })
  .test('parse x < true', t => {
    t.deepEqual(parse('x < true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<"
    });
  })
  .test('parse x < "woot woot"', t => {
    t.deepEqual(parse('x < "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<"
    });
  })
  .test('parse x <= y', t => {
    t.deepEqual(parse('x <= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<="
    });
  })
  .test('parse x <= 5', t => {
    t.deepEqual(parse('x <= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<="
    });
  })
  .test('parse x <= null', t => {
    t.deepEqual(parse('x <= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<="
    });
  })
  .test('parse x <= true', t => {
    t.deepEqual(parse('x <= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<="
    });
  })
  .test('parse x <= "woot woot"', t => {
    t.deepEqual(parse('x <= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<="
    });
  })
  .test('parse x > y', t => {
    t.deepEqual(parse('x > y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">"
    });
  })
  .test('parse x > 5', t => {
    t.deepEqual(parse('x > 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">"
    });
  })
  .test('parse x > null', t => {
    t.deepEqual(parse('x > null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">"
    });
  })
  .test('parse x > true', t => {
    t.deepEqual(parse('x > true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">"
    });
  })
  .test('parse x > "woot woot"', t => {
    t.deepEqual(parse('x > "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">"
    });
  })
  .test('parse x >= y', t => {
    t.deepEqual(parse('x >= y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">="
    });
  })
  .test('parse x >= 5', t => {
    t.deepEqual(parse('x >= 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">="
    });
  })
  .test('parse x >= null', t => {
    t.deepEqual(parse('x >= null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">="
    });
  })
  .test('parse x >= true', t => {
    t.deepEqual(parse('x >= true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">="
    });
  })
  .test('parse x >= "woot woot"', t => {
    t.deepEqual(parse('x >= "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">="
    });
  })
  .test('parse x << y', t => {
    t.deepEqual(parse('x << y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "<<"
    });
  })
  .test('parse x << 5', t => {
    t.deepEqual(parse('x << 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "<<"
    });
  })
  .test('parse x << null', t => {
    t.deepEqual(parse('x << null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "<<"
    });
  })
  .test('parse x << true', t => {
    t.deepEqual(parse('x << true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "<<"
    });
  })
  .test('parse x << "woot woot"', t => {
    t.deepEqual(parse('x << "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "<<"
    });
  })
  .test('parse x >> y', t => {
    t.deepEqual(parse('x >> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>"
    });
  })
  .test('parse x >> 5', t => {
    t.deepEqual(parse('x >> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>"
    });
  })
  .test('parse x >> null', t => {
    t.deepEqual(parse('x >> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>"
    });
  })
  .test('parse x >> true', t => {
    t.deepEqual(parse('x >> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>"
    });
  })
  .test('parse x >> "woot woot"', t => {
    t.deepEqual(parse('x >> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>"
    });
  })
  .test('parse x >>> y', t => {
    t.deepEqual(parse('x >>> y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": ">>>"
    });
  })
  .test('parse x >>> 5', t => {
    t.deepEqual(parse('x >>> 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": ">>>"
    });
  })
  .test('parse x >>> null', t => {
    t.deepEqual(parse('x >>> null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": ">>>"
    });
  })
  .test('parse x >>> true', t => {
    t.deepEqual(parse('x >>> true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": ">>>"
    });
  })
  .test('parse x >>> "woot woot"', t => {
    t.deepEqual(parse('x >>> "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": ">>>"
    });
  })
  .test('parse x + y', t => {
    t.deepEqual(parse('x + y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "+"
    });
  })
  .test('parse x + 5', t => {
    t.deepEqual(parse('x + 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "+"
    });
  })
  .test('parse x + null', t => {
    t.deepEqual(parse('x + null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "+"
    });
  })
  .test('parse x + true', t => {
    t.deepEqual(parse('x + true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "+"
    });
  })
  .test('parse x + "woot woot"', t => {
    t.deepEqual(parse('x + "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "+"
    });
  })
  .test('parse x - y', t => {
    t.deepEqual(parse('x - y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "-"
    });
  })
  .test('parse x - 5', t => {
    t.deepEqual(parse('x - 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "-"
    });
  })
  .test('parse x - null', t => {
    t.deepEqual(parse('x - null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "-"
    });
  })
  .test('parse x - true', t => {
    t.deepEqual(parse('x - true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "-"
    });
  })
  .test('parse x - "woot woot"', t => {
    t.deepEqual(parse('x - "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "-"
    });
  })
  .test('parse x * y', t => {
    t.deepEqual(parse('x * y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "*"
    });
  })
  .test('parse x * 5', t => {
    t.deepEqual(parse('x * 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "*"
    });
  })
  .test('parse x * null', t => {
    t.deepEqual(parse('x * null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "*"
    });
  })
  .test('parse x * true', t => {
    t.deepEqual(parse('x * true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "*"
    });
  })
  .test('parse x * "woot woot"', t => {
    t.deepEqual(parse('x * "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "*"
    });
  })
  .test('parse x ** y', t => {
    t.deepEqual(parse('x ** y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "**"
    });
  })
  .test('parse x ** 5', t => {
    t.deepEqual(parse('x ** 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "**"
    });
  })
  .test('parse x ** null', t => {
    t.deepEqual(parse('x ** null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "**"
    });
  })
  .test('parse x ** true', t => {
    t.deepEqual(parse('x ** true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "**"
    });
  })
  .test('parse x ** "woot woot"', t => {
    t.deepEqual(parse('x ** "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "**"
    });
  })
  .test('parse x / y', t => {
    t.deepEqual(parse('x / y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "/"
    });
  })
  .test('parse x / 5', t => {
    t.deepEqual(parse('x / 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "/"
    });
  })
  .test('parse x / null', t => {
    t.deepEqual(parse('x / null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "/"
    });
  })
  .test('parse x / true', t => {
    t.deepEqual(parse('x / true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "/"
    });
  })
  .test('parse x / "woot woot"', t => {
    t.deepEqual(parse('x / "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "/"
    });
  })
  .test('parse x % y', t => {
    t.deepEqual(parse('x % y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "%"
    });
  })
  .test('parse x % 5', t => {
    t.deepEqual(parse('x % 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "%"
    });
  })
  .test('parse x % null', t => {
    t.deepEqual(parse('x % null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "%"
    });
  })
  .test('parse x % true', t => {
    t.deepEqual(parse('x % true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "%"
    });
  })
  .test('parse x % "woot woot"', t => {
    t.deepEqual(parse('x % "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "%"
    });
  })
  .test('parse x | y', t => {
    t.deepEqual(parse('x | y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "|"
    });
  })
  .test('parse x | 5', t => {
    t.deepEqual(parse('x | 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "|"
    });
  })
  .test('parse x | null', t => {
    t.deepEqual(parse('x | null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "|"
    });
  })
  .test('parse x | true', t => {
    t.deepEqual(parse('x | true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "|"
    });
  })
  .test('parse x | "woot woot"', t => {
    t.deepEqual(parse('x | "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "|"
    });
  })
  .test('parse x & y', t => {
    t.deepEqual(parse('x & y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "&"
    });
  })
  .test('parse x & 5', t => {
    t.deepEqual(parse('x & 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "&"
    });
  })
  .test('parse x & null', t => {
    t.deepEqual(parse('x & null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "&"
    });
  })
  .test('parse x & true', t => {
    t.deepEqual(parse('x & true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "&"
    });
  })
  .test('parse x & "woot woot"', t => {
    t.deepEqual(parse('x & "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "&"
    });
  })
  .test('parse x ^ y', t => {
    t.deepEqual(parse('x ^ y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "^"
    });
  })
  .test('parse x ^ 5', t => {
    t.deepEqual(parse('x ^ 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "^"
    });
  })
  .test('parse x ^ null', t => {
    t.deepEqual(parse('x ^ null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "^"
    });
  })
  .test('parse x ^ false', t => {
    t.deepEqual(parse('x ^ false'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": false},
      "operator": "^"
    });
  })
  .test('parse x ^ "woot woot"', t => {
    t.deepEqual(parse('x ^ "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "^"
    });
  })
  .test('parse x in y', t => {
    t.deepEqual(parse('x in y', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "in"
    });
  })
  .test('parse x in 5', t => {
    t.deepEqual(parse('x in 5', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "in"
    });
  })
  .test('parse x in null', t => {
    t.deepEqual(parse('x in null', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "in"
    });
  })
  .test('parse x in true', t => {
    t.deepEqual(parse('x in true', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "in"
    });
  })
  .test('parse x in "woot woot"', t => {
    t.deepEqual(parse('x in "woot woot"', grammarParams.in), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "in"
    });
  })
  .test('parse x instanceof y', t => {
    t.deepEqual(parse('x instanceof y'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Identifier", "name": "y"},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof 5', t => {
    t.deepEqual(parse('x instanceof 5'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": 5},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof null', t => {
    t.deepEqual(parse('x instanceof null'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": null},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof true', t => {
    t.deepEqual(parse('x instanceof true'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": true},
      "operator": "instanceof"
    });
  })
  .test('parse x instanceof "woot woot"', t => {
    t.deepEqual(parse('x instanceof "woot woot"'), {
      "type": "BinaryExpression",
      "left": {"type": "Identifier", "name": "x"},
      "right": {"type": "Literal", "value": "woot woot"},
      "operator": "instanceof"
    });
  });
