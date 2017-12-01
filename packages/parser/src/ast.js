const nodeFactory = (type, proto = null) => obj => Object.assign(Object.create(proto), {type}, obj);

//pefix nodes
export const UnaryExpression = nodeFactory('UnaryExpression', {
  * [Symbol.iterator] () {
    yield this.argument;
  }
});
export const ThisExpression = nodeFactory('ThisExpression');
export const Literal = nodeFactory('Literal');
export const Identifier = nodeFactory('Identifier');
export const UpdateExpression = nodeFactory('UpdateExpression', {
  * [Symbol.iterator] () {
    yield this.argument;
  }
});
export const FunctionExpression = nodeFactory('FunctionExpression', {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
});
export const NewExpression = nodeFactory('NewExpression', {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
});
export const ArrayExpression = nodeFactory('ArrayExpression', {
  * [Symbol.iterator] () {
    yield* this.elements;
  }
});
export const ObjectExpression = nodeFactory('ObjectExpression', {
  * [Symbol.iterator] () {
    yield* this.properties;
  }
});
export const Property = nodeFactory('Property', {
  * [Symbol.iterator] () {
    yield this.key;
    yield this.value;
  }
});

//infix nodes
const asBinary = type => nodeFactory(type, {
  * [Symbol.iterator] () {
    yield this.left;
    yield this.right;
  }
});
export const AssignmentExpression = asBinary('AssignmentExpression');
export const BinaryExpression = asBinary('BinaryExpression');
export const LogicalExpression = asBinary('LogicalExpression');
export const MemberExpression = nodeFactory('MemberExpression', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.property;
  }
});
export const ConditionalExpression = nodeFactory('ConditionalExpression', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
});
export const CallExpression = nodeFactory('CallExpression', {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
});
export const SequenceExpression = nodeFactory('SequenceExpression', {
  * [Symbol.iterator] () {
    yield* this.expressions;
  }
});

//statements nodes
//todo refactoring with function expression
export const FunctionDeclaration = nodeFactory('FunctionDeclaration', {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
});
//todo refactoring with conditional expression
export const IfStatement = nodeFactory('IfStatement', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
});
export const BlockStatement = nodeFactory('BlockStatement', {
  * [Symbol.iterator] () {
    yield* this.body;
  }
});
export const ExpressionStatement = nodeFactory('ExpressionStatement', {
  * [Symbol.iterator] () {
    yield this.expression;
  }
});
export const EmptyStatement = nodeFactory('EmptyStatement');
export const DebuggerStatement = nodeFactory('DebuggerStatement');
const withArgument = (type) => nodeFactory(
  type, {
    * [Symbol.iterator] () {
      yield this.argument;
    }
  });
export const ReturnStatement = withArgument('ReturnStatement');
export const BreakStatement = withArgument('BreakStatement');
export const ContinueStatement = withArgument('ContinueStatement');
export const WithStatement = nodeFactory('WithStatement', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.body;
  }
});
export const SwitchStatement = nodeFactory('SwitchStatement', {
  * [Symbol.iterator] () {
    yield this.discriminant;
    yield* this.cases;
  }
});
export const SwitchCase = nodeFactory('SwitchCase', {
  * [Symbol.iterator] () {
    yield this.test;
    yield* this.consequent;
  }
});
export const ThrowStatement = nodeFactory('ThrowStatement', {
  * [Symbol.iterator] () {
    yield this.expression;
  }
});
export const TryStatement = nodeFactory('TryStatement', {
  * [Symbol.iterator] () {
    yield this.block;
    yield this.handler;
    yield this.finalizer;
  }
});
export const CatchClause = nodeFactory('CatchClause', {
  * [Symbol.iterator] () {
    yield this.param;
    yield this.body;
  }
});
export const WhileStatement = nodeFactory('WhileStatement', {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.body;
  }
});
export const DoWhileStatement = nodeFactory('DoWhileStatement', {
  * [Symbol.iterator] () {
    yield this.body;
    yield this.test;
  }
});
export const VariableDeclarator = nodeFactory('VariableDeclarator', {
  * [Symbol.iterator] () {
    yield this.id;
    yield this.init;
  }
});
export const VariableDeclaration = nodeFactory('VariableDeclaration', {
  * [Symbol.iterator] () {
    yield* this.declarations;
  }
});
export const ForInStatement = nodeFactory('ForInStatement', {
  * [Symbol.iterator] () {
    yield this.left;
    yield this.right;
  }
});
export const ForStatement = nodeFactory('ForStatement', {
  * [Symbol.iterator] () {
    yield this.init;
    yield this.test;
    yield this.update;
  }
});
export const LabeledStatement = nodeFactory('LabeledStatement', {
  * [Symbol.iterator] () {
    yield this.body;
  }
});

export const Program = nodeFactory('Program', {
  * [Symbol.iterator] () {
    yield* this.body;
  }
});

//walk & traverse
export function* traverse (node) {
  yield node;
  if (node && node[Symbol.iterator]) {
    for (let child of node) {
      yield* traverse(child);
    }
  }
}


export const visitWithAncestors = visitor => node => {

};

export const visit = (...visitors) => {
  const aggregatedVisitor = visitors.reduce((acc, curr) => {
    for (let nodeType of Object.keys(curr)) {
      const fns = acc[nodeType] || [];
      fns.push(curr[nodeType]);
      acc[nodeType] = fns;
    }
    return acc;
  }, {});

  return node => {
    for (let n of traverse(node)) {
      if (aggregatedVisitor[n.type]) {
        for (let vfunc of aggregatedVisitor[n.type]) {
          vfunc(n);
        }
      }
    }
  };
};

