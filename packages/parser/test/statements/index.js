import zora from 'zora';
import empty from './empty';
import ifStatements from './if';
import whileStatements from './while';
import doWhile from './doWhile';
import forStatements from './forStatement';
import forIn from './forIn';
import varStatement from './var';
import block from './block';
import functions from './functionDeclaration';
import returns from './return';
import labels from './label';
import switches from './switch';


export default zora()
  .test(empty)
  .test(ifStatements)
  .test(whileStatements)
  .test(forStatements)
  .test(forIn)
  .test(varStatement)
  .test(block)
  .test(returns)
  .test(functions)
  .test(switches)
  .test(labels)
  .test(doWhile);
