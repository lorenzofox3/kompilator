import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse []', t => {
    t.deepEqual(parse('[]'), {type: 'ArrayExpression', elements: []});
  })
  .test('parse [a]', t => {
    t.deepEqual(parse('[a]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,b]', t => {
    t.deepEqual(parse('[a,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,a]', t => {
    t.deepEqual(parse('[,a]'), {
      type: 'ArrayExpression',
      elements: [null, {type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,]', t => {
    t.deepEqual(parse('[a,]'), {
      type: 'ArrayExpression',
      elements: [{type: 'Identifier', name: 'a'}]
    });
  })
  .test('parse [a,,b]', t => {
    t.deepEqual(parse('[a,,b]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [,,,a,,,b,,,]', t => {
    t.deepEqual(parse('[,,,a,,,b,,,]'), {
      type: 'ArrayExpression',
      elements:
        [null,
          null,
          null,
          {type: 'Identifier', name: 'a'},
          null,
          null,
          {type: 'Identifier', name: 'b'},
          null,
          null]
    });
  })
  .test('parse [a,,,b,]', t => {
    t.deepEqual(parse('[a,,,b,]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'a'},
          null,
          null,
          {type: 'Identifier', name: 'b'}]
    });
  })
  .test('parse [[a,b],[c,,d],]', t => {
    t.deepEqual(parse('[[a,b],[c,,d],]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'ArrayExpression',
          elements:
            [{type: 'Identifier', name: 'a'},
              {type: 'Identifier', name: 'b'}]
        },
          {
            type: 'ArrayExpression',
            elements:
              [{type: 'Identifier', name: 'c'},
                null,
                {type: 'Identifier', name: 'd'}]
          }]
    });
  })
  .test('parse [,...b]', t => {
    t.deepEqual(parse('[,...b]'), {
      type: 'ArrayExpression',
      elements:
        [null,
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'b'}
          }]
    });
  })
  .test('parse [...b]', t => {
    t.deepEqual(parse('[...b]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        }]
    });
  })
  .test('parse [b,...c]', t => {
    t.deepEqual(parse('[b,...c]'), {
      type: 'ArrayExpression',
      elements:
        [{type: 'Identifier', name: 'b'},
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'c'}
          }]
    });
  })
  .test('parse [...b,...c]', t => {
    t.deepEqual(parse('[...b,...c]'), {
      type: 'ArrayExpression',
      elements:
        [{
          type: 'SpreadElement',
          argument: {type: 'Identifier', name: 'b'}
        },
          {
            type: 'SpreadElement',
            argument: {type: 'Identifier', name: 'c'}
          }]
    });
  })
