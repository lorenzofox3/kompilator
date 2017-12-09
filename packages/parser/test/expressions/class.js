import {parse} from "../expressions/utils";
import zora from 'zora';

export default zora()
  .test('parse class test{}', t => {
    t.deepEqual(parse('class test{}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {}', t => {
    t.deepEqual(parse('class {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {;}', t => {
    t.deepEqual(parse('class {;}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class test{;;}', t => {
    t.deepEqual(parse('class test{;;}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {constructor(){}foo(){}}', t => {
    t.deepEqual(parse('class {constructor(){}foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'constructor'},
              kind: 'constructor',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'foo'},
                kind: 'method',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class {get blah(){}set blah(foo){}}', t => {
    t.deepEqual(parse('class {get blah(){}set blah(foo){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'blah'},
              kind: 'get',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'blah'},
                kind: 'set',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class test{get(){}set(foo){}}', t => {
    t.deepEqual(parse('class test{get(){}set(foo){}}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'get'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'set'},
                kind: 'method',
                static: false,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [{type: 'Identifier', name: 'foo'}],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  .test('parse class {foo(){}}', t => {
    t.deepEqual(parse('class {foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class {[foo](){}}', t => {
    t.deepEqual(parse('class {[foo](){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: true,
              key: {type: 'Identifier', name: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class test{"foo"(){}}', t => {
    t.deepEqual(parse('class test{"foo"(){}}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 'foo'},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class {5(){}}', t => {
    t.deepEqual(parse('class {5(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Literal', value: 5},
              kind: 'method',
              static: false,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            }]
        }
    });
  })
  .test('parse class extends b {}', t => {
    t.deepEqual(parse('class extends b {}'), {
      type: 'ClassExpression',
      id: null,
      superClass: {type: 'Identifier', name: 'b'},
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class a extends b.c {}', t => {
    t.deepEqual(parse('class a extends b.c {}'), {
      type: 'ClassExpression',
      id: {type: 'Identifier', name: 'a'},
      superClass:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'b'},
          computed: false,
          property: {type: 'Identifier', name: 'c'}
        },
      body: {type: 'ClassBody', body: []}
    });
  })
  .test('parse class {static hello(){}static get foo(){}}', t => {
    t.deepEqual(parse('class {static hello(){}static get foo(){}}'), {
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body:
            [{
              type: 'MethodDefinition',
              computed: false,
              key: {type: 'Identifier', name: 'hello'},
              kind: 'method',
              static: true,
              value:
                {
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {type: 'BlockStatement', body: []},
                  generator: false,
                  async: false
                }
            },
              {
                type: 'MethodDefinition',
                computed: false,
                key: {type: 'Identifier', name: 'foo'},
                kind: 'get',
                static: true,
                value:
                  {
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {type: 'BlockStatement', body: []},
                    generator: false,
                    async: false
                  }
              }]
        }
    });
  })
  
