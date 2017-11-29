import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse if(a)b;', t => {
    t.deepEqual(parse('if(a)b;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate: null,
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a === 34)b', t => {
    t.deepEqual(parse('if(a === 34)b').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 34},
          operator: '==='
        },
      alternate: null,
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a)b;else c;', t => {
    t.deepEqual(parse('if(a)b;else c;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'c'}
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a === 34.34)b;else c', t => {
    t.deepEqual(parse('if(a === 34.34)b;else c').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 34.34},
          operator: '==='
        },
      alternate:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'c'}
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a)b;else if(c)d;', t => {
    t.deepEqual(parse('if(a)b;else if(c)d;').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'IfStatement',
          test: {type: 'Identifier', name: 'c'},
          alternate: null,
          consequent:
            {
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'd'}
            }
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a <= "blah")b;else if(c >= f)d;', t => {
    t.deepEqual(parse('if(a <= "blah")b;else if(c >= f)d;').body, [{
      type: 'IfStatement',
      test:
        {
          type: 'BinaryExpression',
          left: {type: 'Identifier', name: 'a'},
          right: {type: 'Literal', value: 'blah'},
          operator: '<='
        },
      alternate:
        {
          type: 'IfStatement',
          test:
            {
              type: 'BinaryExpression',
              left: {type: 'Identifier', name: 'c'},
              right: {type: 'Identifier', name: 'f'},
              operator: '>='
            },
          alternate: null,
          consequent:
            {
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'd'}
            }
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a){b}', t => {
    t.deepEqual(parse('if(a){b}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate: null,
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  })
  .test('parse if(a)b;else{c}', t => {
    t.deepEqual(parse('if(a)b;else{c}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'c'}
            }]
        },
      consequent:
        {
          type: 'ExpressionStatement',
          expression: {type: 'Identifier', name: 'b'}
        }
    }]);
  })
  .test('parse if(a){b}else{c}', t => {
    t.deepEqual(parse('if(a){b}else{c}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'c'}
            }]
        },
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  })
  .test('parse if(a){b}else if(d){c}else{foo;}', t => {
    t.deepEqual(parse('if(a){b}else if(d){c}else{foo;}').body, [{
      type: 'IfStatement',
      test: {type: 'Identifier', name: 'a'},
      alternate:
        {
          type: 'IfStatement',
          test: {type: 'Identifier', name: 'd'},
          alternate:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression: {type: 'Identifier', name: 'foo'}
                }]
            },
          consequent:
            {
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression: {type: 'Identifier', name: 'c'}
                }]
            }
        },
      consequent:
        {
          type: 'BlockStatement',
          body:
            [{
              type: 'ExpressionStatement',
              expression: {type: 'Identifier', name: 'b'}
            }]
        }
    }]);
  })


