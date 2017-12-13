import zora from 'zora';
import assignments from './assignment';
import binary from './binary';
import unary from './unary';
import thisExpr from './this';
import logical from './logical';
import member from './member';
import update from './update';
import literals from './literals';
import conditionals from './conditional';
import call from './call';
import news from './new';
import precedences from './precedences';
import sequence from './sequence';
import object from './objectLiterals';
import array from './arrayLiterals';
import functions from './function';
import klass from './class';
import yieldExpression from './yield';

export default zora()
  .test(assignments)
  .test(binary)
  .test(unary)
  .test(thisExpr)
  .test(logical)
  .test(member)
  .test(update)
  .test(literals)
  .test(conditionals)
  .test(call)
  .test(news)
  .test(precedences)
  .test(sequence)
  .test(object)
  .test(array)
  .test(functions)
  .test(klass)
  .test(yieldExpression)
