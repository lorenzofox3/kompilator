import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse switch(foo){}', t => {
    t.deepEqual(parse('switch(foo){}').body, [{
      type: 'SwitchStatement',
      discriminant: {type: 'Identifier', name: 'foo'},
      cases: []
    }]);
  })
  .test(`parse switch(foo){
      case "bar":{
        foo++ 
        break;
      }
      case "blah":
      case "woot":
        break; 
      default:
        foo++;
   }`, t => {
    t.deepEqual(parse(`switch(foo){
      case "bar":{
        foo++ 
        break;
      }
      case "blah":
      case "woot":
        break; 
      default:
        foo++;
   }`).body, [{
      type: 'SwitchStatement',
      discriminant: {type: 'Identifier', name: 'foo'},
      cases:
        [{
          type: 'SwitchCase',
          test: {type: 'Literal', value: 'bar'},
          consequent:
            [{
              type: 'BlockStatement',
              body:
                [{
                  type: 'ExpressionStatement',
                  expression:
                    {
                      type: 'UpdateExpression',
                      argument: {type: 'Identifier', name: 'foo'},
                      operator: '++',
                      prefix: false
                    }
                },
                  {type: 'BreakStatement', label: null}]
            }]
        },
          {
            type: 'SwitchCase',
            test: {type: 'Literal', value: 'blah'},
            consequent: []
          },
          {
            type: 'SwitchCase',
            test: {type: 'Literal', value: 'woot'},
            consequent: [{type: 'BreakStatement', label: null}]
          },
          {
            type: 'SwitchCase',
            test: null,
            consequent:
              [{
                type: 'ExpressionStatement',
                expression:
                  {
                    type: 'UpdateExpression',
                    argument: {type: 'Identifier', name: 'foo'},
                    operator: '++',
                    prefix: false
                  }
              }]
          }]
    }]);
  });






