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
import breakStatements from './break';
import continueStatements from './continue';
import withStatements from './with';
import throwStatements from './throws';
import tryCatch from './tryCatchFinally';
import destructuring from './destructuring';
import letDeclaration from './let';
import constDeclaration from './const';
import classDeclaration from './class';
import modules from './module';

export default zora()
  .test(empty)
  .test(ifStatements)
  .test(whileStatements)
  .test(forStatements)
  .test(forIn)
  .test(varStatement)
  .test(letDeclaration)
  .test(constDeclaration)
  .test(block)
  .test(returns)
  .test(functions)
  .test(switches)
  .test(labels)
  .test(doWhile)
  .test(breakStatements)
  .test(continueStatements)
  .test(withStatements)
  .test(throwStatements)
  .test(tryCatch)
  .test(destructuring)
  .test(classDeclaration)
  .test(modules)

