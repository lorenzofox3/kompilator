import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse foo += bar || blah && bim | woot ^ "true" & 34 !== hey < bim >>> 4 + true * blam ** !nope.test++ ', t => {
    t.deepEqual(parse('foo += bar || blah && bim | woot ^ "true" & 34 !== hey < bim >>> 4 + true * blam ** !nope.test++ '), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '+=',
      right:
        {
          type: 'LogicalExpression',
          left: {type: 'Identifier', name: 'bar'},
          right:
            {
              type: 'LogicalExpression',
              left: {type: 'Identifier', name: 'blah'},
              right:
                {
                  type: 'BinaryExpression',
                  left: {type: 'Identifier', name: 'bim'},
                  right:
                    {
                      type: 'BinaryExpression',
                      left: {type: 'Identifier', name: 'woot'},
                      right:
                        {
                          type: 'BinaryExpression',
                          left: {type: 'Literal', value: 'true'},
                          right:
                            {
                              type: 'BinaryExpression',
                              left: {type: 'Literal', value: 34},
                              right:
                                {
                                  type: 'BinaryExpression',
                                  left: {type: 'Identifier', name: 'hey'},
                                  right:
                                    {
                                      type: 'BinaryExpression',
                                      left: {type: 'Identifier', name: 'bim'},
                                      right:
                                        {
                                          type: 'BinaryExpression',
                                          left: {type: 'Literal', value: 4},
                                          right:
                                            {
                                              type: 'BinaryExpression',
                                              left: {type: 'Literal', value: true},
                                              right:
                                                {
                                                  type: 'BinaryExpression',
                                                  left: {type: 'Identifier', name: 'blam'},
                                                  right:
                                                    {
                                                      type: 'UnaryExpression',
                                                      operator: '!',
                                                      argument:
                                                        {
                                                          type: 'UpdateExpression',
                                                          argument:
                                                            {
                                                              type: 'MemberExpression',
                                                              object: {type: 'Identifier', name: 'nope'},
                                                              computed: false,
                                                              property: {type: 'Identifier', name: 'test'}
                                                            },
                                                          operator: '++',
                                                          prefix: false
                                                        },
                                                      prefix: true
                                                    },
                                                  operator: '**'
                                                },
                                              operator: '*'
                                            },
                                          operator: '+'
                                        },
                                      operator: '>>>'
                                    },
                                  operator: '<'
                                },
                              operator: '!=='
                            },
                          operator: '&'
                        },
                      operator: '^'
                    },
                  operator: '|'
                },
              operator: '&&'
            },
          operator: '||'
        }
    });
  })
  .test('parse foo = 4 + bar * test', t => {
    t.deepEqual(parse('foo = 4 + bar * test'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'bar'},
              right: {type: 'Identifier', name: 'test'},
              operator: '*'
            },
          operator: '+'
        }
    });
  })
  .test('parse foo = (4 + bar) * test', t => {
    t.deepEqual(parse('foo = (4 + bar) * test'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 4},
              right: {type: 'Identifier', name: 'bar'},
              operator: '+'
            },
          right: {type: 'Identifier', name: 'test'},
          operator: '*'
        }
    });
  })
  .test('parse foo = bar * test + 4', t => {
    t.deepEqual(parse('foo = bar * test + 4'), {
      type: 'AssignmentExpression',
      left: {type: 'Identifier', name: 'foo'},
      operator: '=',
      right:
        {
          type: 'BinaryExpression',
          left:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'bar'},
              right: {type: 'Identifier', name: 'test'},
              operator: '*'
            },
          right: {type: 'Literal', value: 4},
          operator: '+'
        }
    });
  })
  .test(`parse typeof obj === 'Object'`, t => {
    t.deepEqual(parse('typeof obj === \'Object\''), {
        "type": "BinaryExpression",
        "left": {
          "type": "UnaryExpression",
          "operator": "typeof",
          "argument": {"type": "Identifier", "name": "obj"},
          "prefix": true
        },
        "right": {"type": "Literal", "value": "Object"},
        "operator": "==="
      }
    );
  })
  .test(`parse new foo() + bar`, t => {
    t.deepEqual(parse('new foo() + bar'), {
        type: 'BinaryExpression',
        left: {
          type: 'NewExpression',
          callee: {type: 'Identifier', name: 'foo'},
          arguments: []
        },
        operator: '+',
        right: {type: 'Identifier', name: 'bar'}
      }
    );
  });