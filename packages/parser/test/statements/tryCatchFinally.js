import zora from 'zora';
import {parse} from './utils';

export default zora()
  .test('parse try {} catch(e){}', t => {
    t.deepEqual(parse('try {} catch(e){}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler:
        {
          type: 'CatchClause',
          param: {type: 'Identifier', name: 'e'},
          body: {type: 'BlockStatement', body: []}
        },
      finalizer: null
    }]);
  })
  .test('parse try {} catch(e) {} finally {}', t => {
    t.deepEqual(parse('try {} catch(e) {} finally {}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler:
        {
          type: 'CatchClause',
          param: {type: 'Identifier', name: 'e'},
          body: {type: 'BlockStatement', body: []}
        },
      finalizer: {type: 'BlockStatement', body: []}
    }]);
  })
  .test('parse try {} finally {}', t => {
    t.deepEqual(parse('try {} finally {}').body, [{
      type: 'TryStatement',
      block: {type: 'BlockStatement', body: []},
      handler: null,
      finalizer: {type: 'BlockStatement', body: []}
    }]);
  });
