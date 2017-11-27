import comments from './comments';
import identifiers from './identifiers';
import punctuators from './punctuators';
import numerics from './numerics';
import regexps from './regexps';
import strings from './strings';
import whiteSpaces from './whitespaces';
import lineTerminators from './lineTerminators';
import scanner from './scanner';

import zora from 'zora';

zora()
  .test(comments)
  .test(identifiers)
  .test(punctuators)
  .test(numerics)
  .test(regexps)
  .test(strings)
  .test(whiteSpaces)
  .test(lineTerminators)
  .test(scanner)
  .run();