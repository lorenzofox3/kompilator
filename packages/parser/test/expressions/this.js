import zora from 'zora';
import {parse} from "./utils";

export default zora()
  .test('parse this', t => {
    t.deepEqual(parse('this'), {type: 'ThisExpression'});
  });