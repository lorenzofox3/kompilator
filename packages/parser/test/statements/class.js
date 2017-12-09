import {parse} from "./utils";
import zora from 'zora';

export default zora()
  .test('parse class test{}', t => {
    t.deepEqual(parse('class test{}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{;}', t => {
    t.deepEqual(parse('class test{;}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{;;}', t => {
    t.deepEqual(parse('class test{;;}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class test{constructor(){}foo(){}}', t => {
    t.deepEqual(parse('class test{constructor(){}foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
      superClass: null,
      body:
        {
          type: 'ClassBody',
          body: [{
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
    }]);
  })
  .test('parse class test{get blah(){}set blah(foo){}}', t => {
    t.deepEqual(parse('class test{get blah(){}set blah(foo){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
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
    }]);
  })
  .test('parse class test{get(){}set(foo){}}', t => {
    t.deepEqual(parse('class test{get(){}set(foo){}}').body, [{
      type: 'ClassDeclaration',
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
    }]);
  })
  .test('parse class test{foo(){}}', t => {
    t.deepEqual(parse('class test{foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
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
    }]);
  })
  .test('parse class test{[foo](){}}', t => {
    t.deepEqual(parse('class test{[foo](){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
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
    }]);
  })
  .test('parse class test{"foo"(){}}', t => {
    t.deepEqual(parse('class test{"foo"(){}}').body, [{
      type: 'ClassDeclaration',
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
    }]);
  })
  .test('parse class test{5(){}}', t => {
    t.deepEqual(parse('class test{5(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'test'},
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
    }]);
  })
  .test('parse class a extends b {}', t => {
    t.deepEqual(parse('class a extends b {}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
      superClass: {type: 'Identifier', name: 'b'},
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class a extends b.c {}', t => {
    t.deepEqual(parse('class a extends b.c {}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
      superClass:
        {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'b'},
          computed: false,
          property: {type: 'Identifier', name: 'c'}
        },
      body: {type: 'ClassBody', body: []}
    }]);
  })
  .test('parse class a {static hello(){}static get foo(){}}', t => {
    t.deepEqual(parse('class a {static hello(){}static get foo(){}}').body, [{
      type: 'ClassDeclaration',
      id: {type: 'Identifier', name: 'a'},
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
    }]);
  })




