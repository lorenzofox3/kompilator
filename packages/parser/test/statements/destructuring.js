import {parse} from './utils';
import zora from 'zora';

export default zora()
  .test('parse var [,a] = b', t => {
    t.deepEqual(parse('var [,a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a] = b', t => {
    t.deepEqual(parse('var [,,a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a,] = b', t => {
    t.deepEqual(parse('var [,,a,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,a,,,] = b', t => {
    t.deepEqual(parse('var [,,a,,,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [null, null, {type: 'Identifier', name: 'a'}, null, null]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,] = b', t => {
    t.deepEqual(parse('var [a,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,] = b', t => {
    t.deepEqual(parse('var [a,,] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}, null]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,...a]=b', t => {
    t.deepEqual(parse('var [,...a]=b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'a'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [,,...a]=b', t => {
    t.deepEqual(parse('var [,,...a]=b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'a'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,...b]=c', t => {
    t.deepEqual(parse('var [a,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,...b]=c', t => {
    t.deepEqual(parse('var [a,b,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,...b]=c', t => {
    t.deepEqual(parse('var [a,b,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,,...b]=c', t => {
    t.deepEqual(parse('var [a,b,,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,,...b]=c', t => {
    t.deepEqual(parse('var [a,,,...b]=c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  null,
                  {
                    type: 'RestElement',
                    argument: {type: 'Identifier', name: 'b'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a] = b', t => {
    t.deepEqual(parse('var [a] = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ArrayPattern',
              elements: [{type: 'Identifier', name: 'a'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b] = c', t => {
    t.deepEqual(parse('var [a,b] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,c] = d', t => {
    t.deepEqual(parse('var [a,b,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,c] = d', t => {
    t.deepEqual(parse('var [a,b,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,b,,,c] = d', t => {
    t.deepEqual(parse('var [a,b,,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  {type: 'Identifier', name: 'b'},
                  null,
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,c] = d', t => {
    t.deepEqual(parse('var [a,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a,,,c] = d', t => {
    t.deepEqual(parse('var [a,,,c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{type: 'Identifier', name: 'a'},
                  null,
                  null,
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a} = b', t => {
    t.deepEqual(parse('var {a} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {[a]:c} = b', t => {
    t.deepEqual(parse('var {[a]:c} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: true,
                  value: {type: 'Identifier', name: 'c'},
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a,} = b', t => {
    t.deepEqual(parse('var {a,} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a, b} = c', t => {
    t.deepEqual(parse('var {a, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a, b, c} = d', t => {
    t.deepEqual(parse('var {a, b, c} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'a'},
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b} = c', t => {
    t.deepEqual(parse('var {a:b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b, c} = d', t => {
    t.deepEqual(parse('var {a:b, c} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:b, c:d} = e', t => {
    t.deepEqual(parse('var {a:b, c:d} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value: {type: 'Identifier', name: 'b'},
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'd'},
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b}} = c', t => {
    t.deepEqual(parse('var {a:{b}} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b},c} = e', t => {
    t.deepEqual(parse('var {a:{b},c} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value: {type: 'Identifier', name: 'c'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b},c:{d}} = e', t => {
    t.deepEqual(parse('var {a:{b},c:{d}} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'b'},
                          method: false,
                          shorthand: true
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'c'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'd'},
                            computed: false,
                            value: {type: 'Identifier', name: 'd'},
                            method: false,
                            shorthand: true
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b:c},d:{e}} = e', t => {
    t.deepEqual(parse('var {a:{b:c},d:{e}} = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value: {type: 'Identifier', name: 'c'},
                          method: false,
                          shorthand: false
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'd'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'e'},
                            computed: false,
                            value: {type: 'Identifier', name: 'e'},
                            method: false,
                            shorthand: true
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:[{g},c]} = d', t => {
    t.deepEqual(parse('var {a:[{g},c]} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ArrayPattern',
                      elements:
                        [{
                          type: 'ObjectPattern',
                          properties:
                            [{
                              type: 'Property',
                              kind: 'init',
                              key: {type: 'Identifier', name: 'g'},
                              computed: false,
                              value: {type: 'Identifier', name: 'g'},
                              method: false,
                              shorthand: true
                            }]
                        },
                          {type: 'Identifier', name: 'c'}]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:[g,c]} = d', t => {
    t.deepEqual(parse('var {a:[g,c]} = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ArrayPattern',
                      elements:
                        [{type: 'Identifier', name: 'g'},
                          {type: 'Identifier', name: 'c'}]
                    },
                  method: false,
                  shorthand: false
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [{a:[b]}] = c', t => {
    t.deepEqual(parse('var [{a:[b]}] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'a'},
                      computed: false,
                      value:
                        {
                          type: 'ArrayPattern',
                          elements: [{type: 'Identifier', name: 'b'}]
                        },
                      method: false,
                      shorthand: false
                    }]
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5} = b', t => {
    t.deepEqual(parse('var {a=5} = b').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'b'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5, b=foo} = c', t => {
    t.deepEqual(parse('var {a=5, b=foo} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'AssignmentPattern',
                        left: {type: 'Identifier', name: 'b'},
                        right: {type: 'Identifier', name: 'foo'}
                      },
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a=5, b} = c', t => {
    t.deepEqual(parse('var {a=5, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: true
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:aa = 5, b} = c', t => {
    t.deepEqual(parse('var {a:aa = 5, b} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'aa'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value: {type: 'Identifier', name: 'b'},
                    method: false,
                    shorthand: true
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:aa = 5, b:bb=foo} = c', t => {
    t.deepEqual(parse('var {a:aa = 5, b:bb=foo} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'aa'},
                      right: {type: 'Literal', value: 5}
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'AssignmentPattern',
                        left: {type: 'Identifier', name: 'bb'},
                        right: {type: 'Identifier', name: 'foo'}
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var {a:{b:bb = 5}, b:{bb:asb = foo}} = c', t => {
    t.deepEqual(parse('var {a:{b:bb = 5}, b:{bb:asb = foo}} = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ObjectPattern',
              properties:
                [{
                  type: 'Property',
                  kind: 'init',
                  key: {type: 'Identifier', name: 'a'},
                  computed: false,
                  value:
                    {
                      type: 'ObjectPattern',
                      properties:
                        [{
                          type: 'Property',
                          kind: 'init',
                          key: {type: 'Identifier', name: 'b'},
                          computed: false,
                          value:
                            {
                              type: 'AssignmentPattern',
                              left: {type: 'Identifier', name: 'bb'},
                              right: {type: 'Literal', value: 5}
                            },
                          method: false,
                          shorthand: false
                        }]
                    },
                  method: false,
                  shorthand: false
                },
                  {
                    type: 'Property',
                    kind: 'init',
                    key: {type: 'Identifier', name: 'b'},
                    computed: false,
                    value:
                      {
                        type: 'ObjectPattern',
                        properties:
                          [{
                            type: 'Property',
                            kind: 'init',
                            key: {type: 'Identifier', name: 'bb'},
                            computed: false,
                            value:
                              {
                                type: 'AssignmentPattern',
                                left: {type: 'Identifier', name: 'asb'},
                                right: {type: 'Identifier', name: 'foo'}
                              },
                            method: false,
                            shorthand: false
                          }]
                      },
                    method: false,
                    shorthand: false
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a=b] = c', t => {
    t.deepEqual(parse('var [a=b] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [a=b,c =d] = e', t => {
    t.deepEqual(parse('var [a=b,c =d] = e').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'e'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'AssignmentPattern',
                  left: {type: 'Identifier', name: 'a'},
                  right: {type: 'Identifier', name: 'b'}
                },
                  {
                    type: 'AssignmentPattern',
                    left: {type: 'Identifier', name: 'c'},
                    right: {type: 'Identifier', name: 'd'}
                  }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [[a=b]] = c', t => {
    t.deepEqual(parse('var [[a=b]] = c').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'c'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ArrayPattern',
                  elements:
                    [{
                      type: 'AssignmentPattern',
                      left: {type: 'Identifier', name: 'a'},
                      right: {type: 'Identifier', name: 'b'}
                    }]
                }]
            }
        }],
      kind: 'var'
    }]);
  })
  .test('parse var [{a=b},c] = d', t => {
    t.deepEqual(parse('var [{a=b},c] = d').body, [{
      type: 'VariableDeclaration',
      declarations:
        [{
          type: 'VariableDeclarator',
          init: {type: 'Identifier', name: 'd'},
          id:
            {
              type: 'ArrayPattern',
              elements:
                [{
                  type: 'ObjectPattern',
                  properties:
                    [{
                      type: 'Property',
                      kind: 'init',
                      key: {type: 'Identifier', name: 'a'},
                      computed: false,
                      value:
                        {
                          type: 'AssignmentPattern',
                          left: {type: 'Identifier', name: 'a'},
                          right: {type: 'Identifier', name: 'b'}
                        },
                      method: false,
                      shorthand: true
                    }]
                },
                  {type: 'Identifier', name: 'c'}]
            }
        }],
      kind: 'var'
    }]);
  })