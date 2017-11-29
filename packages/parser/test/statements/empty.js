import {parse} from './utils';
import zora from 'zora';

export default zora()
  .test('parse ;', t => {
    t.deepEqual(parse(';').body,[ { type: 'EmptyStatement' } ]);
  })
  .test('parse ;;', t => {
    t.deepEqual(parse(';;').body,[ { type: 'EmptyStatement' }, { type: 'EmptyStatement' } ]);
  })


