/*
 this convert a node initially parsed as a literal (likely object or array) to an assignment pattern
 this will mutate node and its descendant to match the new grammar used
 it occurs in cases where we have parsed as literal first and then encounter a token (such "=" which actually indicates the literal was a pattern)
 example:

 let a = 3,b =4;
 [a,b] = [b,a];

 we don't know we have a assignment pattern until we reach the "=" token

 */
export const toAssignable = node => {
  switch (node.type) {
    case 'ArrayPattern':
    case 'ObjectPattern':
    case 'AssignmentPattern':
    case 'RestElement':
    case 'Identifier':
      break; //skip
    case 'ArrayExpression': {
      node.type = 'ArrayPattern';
      for (let ch of node) {
        toAssignable(ch); //recursive descent
      }
      break;
    }
    case 'ObjectExpression': {
      node.type = 'ObjectPattern';
      for (let prop of node) {
        if (prop.kind !== 'init' || prop.method) {
          throw new Error('can not convert property as a destructuring pattern');
        }
        toAssignable(prop.value);
      }
      break
    }
    case 'SpreadElement': {
      node.type = 'RestElement';
      toAssignable(node.argument);
      break;
    }
    case 'AssignmentExpression': {
      if (node.operator !== '=') {
        throw new Error('can not reinterpret assignment expression with operator different than "="');
      }
      node.type = 'AssignmentPattern';
      delete node.operator; // operator is not relevant for assignment pattern
      toAssignable(node.left);//recursive descent
      break;
    }
    default:
      throw new Error(`Unexpected node could not parse "${node.type}" as part of a destructuring pattern `);
  }
  return node;
};
