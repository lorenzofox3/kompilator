import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test(`parse a =0,b++;`, t => {
    t.deepEqual(parse('a=0,b++;'), {
        type: 'SequenceExpression',
        expressions:
          [{
            type: 'AssignmentExpression',
            left: {type: 'Identifier', name: 'a'},
            operator: '=',
            right: {type: 'Literal', value: 0}
          },
            {
              type: 'UpdateExpression',
              argument: {type: 'Identifier', name: 'b'},
              operator: '++',
              prefix: false
            }]
      }
    )
  })
  .test(`parse a,b;`, t => {
    t.deepEqual(parse('a,b;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}]
    })
  })
  .test(`parse a,b,c;`, t => {
    t.deepEqual(parse('a,b,c;'), {
      "type": "SequenceExpression",
      "expressions": [{"type": "Identifier", "name": "a"}, {"type": "Identifier", "name": "b"}, {
        "type": "Identifier",
        "name": "c"
      }]
    })
  });