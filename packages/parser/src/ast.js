const param = {type: 'Identifier', name: 'bar'};
const id = {type: 'Identifier', name: 'foo'};


const left = {type: 'Identifier', name: 'bar'};
const right = {type: 'Literal', value: 1};

const binaryExpression = {
  type: 'BinaryExpression',
  left,
  right,
  operator: '+',
  *[Symbol.iterator](){
    yield this.left;
    yield this.right;
  }
};

const returnStatement = {
  type: 'ReturnStatement',
  argument: binaryExpression,
  * [Symbol.iterator] () {
    yield this.argument;
  }
};

const body = {
  type: 'BlockStatement',
  body: [returnStatement],
  * [Symbol.iterator] () {
    yield* this.body;
  }
};


const functionDeclaration = {
  type: 'FunctionDeclaration',
  id,
  params: [param],
  body,
  * [Symbol.iterator] () {
    yield this.id;
    yield* this.params;
    yield this.body;
  }
};

const program = {
  type: 'Program',
  body: [functionDeclaration],
  * [Symbol.iterator] () {
    yield* this.body;
  }
};


function  *traverse (node) {
  yield node;
  if (node && node[Symbol.iterator]) {
    for (let child of node) {
      yield * traverse(child);
    }
  }
}

for(let t of traverse(program)){
  console.log(t.type);
  console.count('node');
}

