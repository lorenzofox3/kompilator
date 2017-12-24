const nodeFactory = (defaultOrType, proto = null) => {
  const defaultObj = typeof defaultOrType === 'string' ? {type: defaultOrType} : defaultOrType;
  return obj => Object.assign(Object.create(proto), defaultObj, obj);
  // return obj => Object.assign(defaultObj, obj);
};

const yieldArgument = {
  * [Symbol.iterator] () {
    yield this.argument;
  }
};
const yieldLeftRight = {
  * [Symbol.iterator] () {
    yield this.left;
    yield this.right;
  }
};
const yieldExpression = {
  * [Symbol.iterator] () {
    yield this.expression;
  }
};
const delegateBody = {
  * [Symbol.iterator] () {
    yield* this.body;
  }
};
const delegateElements = {
  * [Symbol.iterator] () {
    yield* this.elements;
  }
};
const delegateProperties = {
  * [Symbol.iterator] () {
    yield* this.properties;
  }
};
const iterateFunction = {
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
};
const iterateCall = {
  * [Symbol.iterator] () {
    yield this.callee;
    yield* this.arguments;
  }
};
const iterateProperty = {
  * [Symbol.iterator] () {
    yield this.key;
    yield this.value;
  }
};
const iterateCondition = {
  * [Symbol.iterator] () {
    yield this.test;
    yield this.consequent;
    yield this.alternate;
  }
};

//pefix nodes
export const UnaryExpression = nodeFactory('UnaryExpression', yieldArgument);
export const ThisExpression = nodeFactory('ThisExpression');
export const Super = nodeFactory('Super');
export const Literal = nodeFactory('Literal');
export const Identifier = nodeFactory('Identifier');
export const UpdateExpression = nodeFactory('UpdateExpression', yieldArgument);
export const FunctionExpression = nodeFactory({
  type: 'FunctionExpression',
  id: null,
  async: false,
  generator: false
}, iterateFunction);
export const ClassExpression = nodeFactory('ClassExpression', delegateBody);
export const NewExpression = nodeFactory('NewExpression', iterateCall);
export const SpreadElement = nodeFactory('SpreadElement', yieldArgument);
export const ArrayExpression = nodeFactory('ArrayExpression', delegateElements);
export const ObjectExpression = nodeFactory('ObjectExpression', delegateProperties);
export const Property = nodeFactory({
  type: 'Property',
  shorthand: false,
  computed: false,
  kind: 'init',
  method: false,
  value: null
}, iterateProperty);
export const YieldExpression = nodeFactory({type: 'YieldExpression', delegate: false}, yieldArgument);
export const TemplateLiteral = nodeFactory({type: 'TemplateLiteral'}, {
  * [Symbol.iterator] () {
    yield* this.quasis;
    yield* this.expressions;
  }
});
export const TemplateElement = nodeFactory({type: 'TemplateElement', tail: true});

//infix nodes
const asBinary = type => nodeFactory(type, yieldLeftRight);
export const AssignmentExpression = asBinary('AssignmentExpression');
export const BinaryExpression = asBinary('BinaryExpression');
export const LogicalExpression = asBinary('LogicalExpression');
export const MemberExpression = nodeFactory('MemberExpression', {
  * [Symbol.iterator] () {
    yield this.object;
    yield this.property;
  }
});
export const ConditionalExpression = nodeFactory('ConditionalExpression', iterateCondition);
export const CallExpression = nodeFactory('CallExpression', iterateCall);
export const SequenceExpression = nodeFactory('SequenceExpression', {
  * [Symbol.iterator] () {
    yield* this.expressions;
  }
});
export const ArrowFunctionExpression = nodeFactory({
  type: 'ArrowFunctionExpression',
  expression: true,
  async: false,
  generator: false,
  id: null
}, iterateFunction);

//statements nodes
export const IfStatement = nodeFactory('IfStatement', iterateCondition);
export const BlockStatement = nodeFactory('BlockStatement', delegateBody);
export const ExpressionStatement = nodeFactory('ExpressionStatement', yieldExpression);
export const EmptyStatement = nodeFactory('EmptyStatement');
export const DebuggerStatement = nodeFactory('DebuggerStatement');
const withArgument = (type) => nodeFactory(type, yieldArgument);
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
export const ThrowStatement = nodeFactory('ThrowStatement', yieldExpression);
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
export const ForInStatement = nodeFactory('ForInStatement', yieldLeftRight);
export const ForStatement = nodeFactory('ForStatement', {
  * [Symbol.iterator] () {
    yield this.init;
    yield this.test;
    yield this.update;
  }
});
export const ForOfStatement = nodeFactory('ForOfStatement', yieldLeftRight);
export const LabeledStatement = nodeFactory('LabeledStatement', {
  * [Symbol.iterator] () {
    yield this.body;
  }
});

export const Program = nodeFactory({type: 'Program', sourceType: 'script'}, delegateBody);

//declarations
export const AssignmentPattern = nodeFactory('AssignmentPattern', yieldLeftRight);
export const FunctionDeclaration = nodeFactory({
  type: 'FunctionDeclaration',
  async: false,
  generator: false
}, iterateFunction);
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
export const ArrayPattern = nodeFactory('ArrayPattern', delegateElements);
export const RestElement = nodeFactory('RestElement', yieldArgument);
export const ObjectPattern = nodeFactory('ObjectPattern', delegateProperties);
export const Class = nodeFactory('ClassDeclaration', {
  * [Symbol.iterator] () {
    yield this.id;
    yield this.superClass;
    yield this.body;
  }
});
export const ClassBody = nodeFactory('ClassBody', delegateBody);
export const MethodDefinition = nodeFactory('MethodDefinition', iterateProperty);

//modules
export const ImportDeclaration = nodeFactory('ImportDeclaration', {
  * [Symbol.iterator] () {
    yield* this.specifiers;
    yield this.source;
  }
});
export const ImportSpecifier = nodeFactory('ImportSpecifier', {
  * [Symbol.iterator] () {
    yield this.imported;
    yield this.local;
  }
});
export const ImportDefaultSpecifier = nodeFactory('ImportDefaultSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
  }
});
export const ImportNamespaceSpecifier = nodeFactory('ImportNamespaceSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
  }
});
export const ExportNamedDeclaration = nodeFactory({
  type: 'ExportNamedDeclaration',
  specifiers: [],
  declaration: null,
  source: null
}, {
  * [Symbol.iterator] () {
    yield this.declaration;
    yield* this.specifiers;
    yield this.source;
  }
});
export const ExportSpecifier = nodeFactory('ExportSpecifier', {
  * [Symbol.iterator] () {
    yield this.local;
    yield this.exported;
  }
});
export const ExportDefaultDeclaration = nodeFactory({type: 'ExportDefaultDeclaration', specifiers: [], source: null}, {
  * [Symbol.iterator] () {
    yield this.declaration;
  }
});
export const ExportAllDeclaration = nodeFactory('ExportAllDeclaration', {
  * [Symbol.iterator] () {
    yield this.source;
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
      if (n) {
        if (aggregatedVisitor[n.type]) {
          for (let vfunc of aggregatedVisitor[n.type]) {
            vfunc(n);
          }
        }
      }
    }
  };
};

