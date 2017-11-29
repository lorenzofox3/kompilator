import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse 0x3F3a', t => {
    t.deepEqual(parse('0x3F3a'), {"type": "Literal", "value": 0x3F3a});
  })
  .test('parse 0X3F3a', t => {
    t.deepEqual(parse('0X3F3a'), {"type": "Literal", "value": 0X3F3a});
  })
  .test('parse 0o3705', t => {
    t.deepEqual(parse('0o3705'), {"type": "Literal", "value": 0o3705});
  })
  .test('parse 0O3705', t => {
    t.deepEqual(parse('0O3705'), {"type": "Literal", "value": 0O3705});
  })
  .test('parse 0b0101011', t => {
    t.deepEqual(parse('0b0101011'), {"type": "Literal", "value": 0b0101011});
  })
  .test('parse 0B0101011', t => {
    t.deepEqual(parse('0B0101011'), {"type": "Literal", "value": 0B0101011});
  })
  .test('parse 123', t => {
    t.deepEqual(parse('123'), {"type": "Literal", "value": 123});
  })
  .test('parse 023', t => {
    t.deepEqual(parse('023'), {"type": "Literal", "value": 23});
  })
  .test('parse 34.', t => {
    t.deepEqual(parse('34.'), {"type": "Literal", "value": 34});
  })
  .test('parse .3435', t => {
    t.deepEqual(parse('.3435'), {"type": "Literal", "value": 0.3435});
  })
  .test('parse 345.767', t => {
    t.deepEqual(parse('345.767'), {"type": "Literal", "value": 345.767});
  })
  .test('parse .34e-1', t => {
    t.deepEqual(parse('.34e-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .34E-1', t => {
    t.deepEqual(parse('.34E-1'), {"type": "Literal", "value": 0.034});
  })
  .test('parse .65e+3', t => {
    t.deepEqual(parse('.65e+3'), {"type": "Literal", "value": 650});
  })
  .test('parse .6E+3', t => {
    t.deepEqual(parse('.6E+3'), {"type": "Literal", "value": 600});
  })
  .test('parse .86e4', t => {
    t.deepEqual(parse('.86e4'), {"type": "Literal", "value": 8600});
  })
  .test('parse .34E4', t => {
    t.deepEqual(parse('.34E4'), {"type": "Literal", "value": 3400});
  })
  .test('parse 4545.4545e+5', t => {
    t.deepEqual(parse('4545.4545e+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E+5', t => {
    t.deepEqual(parse('4545.4545E+5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e5', t => {
    t.deepEqual(parse('4545.4545e5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545E5', t => {
    t.deepEqual(parse('4545.4545E5'), {"type": "Literal", "value": 454545450});
  })
  .test('parse 4545.4545e-5', t => {
    t.deepEqual(parse('4545.4545e-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 4545.4545E-5', t => {
    t.deepEqual(parse('4545.4545E-5'), {"type": "Literal", "value": 0.045454545});
  })
  .test('parse 34e+5', t => {
    t.deepEqual(parse('34e+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E+5', t => {
    t.deepEqual(parse('34E+5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e5', t => {
    t.deepEqual(parse('34e5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34E5', t => {
    t.deepEqual(parse('34E5'), {"type": "Literal", "value": 3400000});
  })
  .test('parse 34e-5', t => {
    t.deepEqual(parse('34e-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse 34E-5', t => {
    t.deepEqual(parse('34E-5'), {"type": "Literal", "value": 0.00034});
  })
  .test('parse \'foo\'', t => {
    t.deepEqual(parse('\'foo\''), {"type": "Literal", "value": "foo"});
  })
  .test('parse "foo"', t => {
    t.deepEqual(parse('"foo"'), {"type": "Literal", "value": "foo"});
  })
  .test('parse true', t => {
    t.deepEqual(parse('true'), {"type": "Literal", "value": true});
  })
  .test('parse false', t => {
    t.deepEqual(parse('false'), {"type": "Literal", "value": false});
  })
  .test('parse null', t => {
    t.deepEqual(parse('null'), {"type": "Literal", "value": null});
  })
  .test('parse /foo/i', t => {
    t.deepEqual(parse('/foo/i'), {
      type: 'Literal',
      value: /foo/i,
      regex: {pattern: 'foo', flags: 'i'}
    });
  })
  .test('parse /foo/', t => {
    t.deepEqual(parse('/foo/'), {
      type: 'Literal',
      value: /foo/,
      regex: {pattern: 'foo', flags: ''}
    });
  })
  .test('parse /[0-9]*/i', t => {
    t.deepEqual(parse('/[0-9]*/i'), {
      type: 'Literal',
      value: /[0-9]*/i,
      regex: {pattern: '[0-9]*', flags: 'i'}
    });
  })
  .test('parse /foo/gi', t => {
    t.deepEqual(parse('/foo/gi'), {"type": "Literal", "value": {}, "regex": {"pattern": "foo", "flags": "gi"}});
  })
  .test('parse (")")', t => {
    t.deepEqual(parse('(")")'), {"type": "Literal", "value": ")"}
    )
  })