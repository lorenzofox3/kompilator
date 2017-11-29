import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse function a(){return}', t => {
    t.deepEqual(parse('function a(){return}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return;}', t => {
    t.deepEqual(parse('function a(){return;}').body[0].body.body[0], {type: 'ReturnStatement', argument: null});
  })
  .test('parse function a(){return blah}', t => {
    t.deepEqual(parse('function a(){return blah}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return blah;}', t => {
    t.deepEqual(parse('function a(){return blah;}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument: {type: 'Identifier', name: 'blah'}
    });
  })
  .test('parse function a(){return 4+24%2}', t => {
    t.deepEqual(parse('function a(){return 4+24%2}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 24},
              right: {type: 'Literal', value: 2},
              operator: '%'
            },
          operator: '+'
        }
    });
  })
  .test('parse function a(){return 4+24%2;}', t => {
    t.deepEqual(parse('function a(){return 4+24%2;}').body[0].body.body[0], {
      type: 'ReturnStatement',
      argument:
        {
          type: 'BinaryExpression',
          left: {type: 'Literal', value: 4},
          right:
            {
              type: 'BinaryExpression',
              left: {type: 'Literal', value: 24},
              right: {type: 'Literal', value: 2},
              operator: '%'
            },
          operator: '+'
        }
    });
  });
