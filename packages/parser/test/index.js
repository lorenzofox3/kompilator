import source from './source';
import tokens from './tokens';
import expressions from './expressions';
import statements from './statements';
import zora from 'zora';

zora()
  .test(tokens)
  .test(source)
  .test(expressions)
  .test(statements)
  .run();