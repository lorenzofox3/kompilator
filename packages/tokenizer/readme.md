# @kompilator/tokenizer

//todo links

[tokenize]() [ECMAScript]() code

## Installation

with your favorite package client manager

``npm install --save-dev @kompilator/tokenizer``

or

``yarn add @kompilator/tokenizer --dev``

## Usage

### tokenize(code)

returns an iterable as generator (of tokens)

```Javascript
import {tokenize} from '@kompilator/tokenizer';

//or Nodejs specific: const tokenize = require('@kompilator/tokenizer').tokenize;

const program = `const answer = 42;`;

for (let token of tokenize(program){
    console.log(token.value)
}

// > { type:[Getter], rawValue: 'const', value:'const', isReserved: true }
// > { type: 5, rawValue: 'answer', value: 'answer', isReserved:false }
// > { type:[Getter], rawValue: '=', value:'=', isReserved: false }
// > { type: 6, rawValue: '42', value: 42 }
// > { type: [Getter], rawValue: ';', isReserved: false }
```

or

```Javascript
const tokens = tokenize(program)[Symbol.iterator]();

token.next();
// ...

//>{done:false, value:{ type:[Getter], rawValue: 'const', value:'const', isReserved: true }}
// ...
```
or

```Javascript
const tokens = [...tokenize(program)]

// > [...]
```

#### remarks

1. These generators can only be iterated over **once** !

```Javascript
const myTokens = tokenize(program);

const tokens1 = [...myTokens];

// > [...]

const tokens2 = [...myTokens];

// > [] //empty array !!! (the generator has already been exhausted)
```

2. These generators are **lazy evaluated**

A bit like a stream, a generator can produce one value at the time making it more memory efficient

```Javascript
const lazyMap = (fn) => function* (iterator) {
    for (let item of iterator){
        console.count('is mapped');
        yield fn(item);
    }
}

const doNothing = lazyMap(item => item);

for (let token of doNothing(tokenize(program))){
    console.log(token);
}

// > is mapped: 1
// > { rawValue: 'const', isReserved: true }
// > is mapped: 2
// > { type: 5, rawValue: 'answer', value: 'answer' }
// > is mapped: 3
// > { rawValue: '=', isReserved: false }
// > is mapped: 4
// > { type: 6, rawValue: '42', value: 42 }
// > is mapped: 5
// > { rawValue: ';', isReserved: false }
```

3. Note about token anatomy

//todo

4. Note about ignored tokens

//todo

### tokenizer (opts)

Alternatively if you are familiar with a tokenizer anatomy you can create your own tokenizer with a custom *scanner* and a custom *token registry*

#### scanner

//todo

#### token Registry

//todo

## ECMAScript and tokenization

ECMAScript lexical grammar is mostly [context free](). However it defines various lexical goals and there are some conditions in which the tokenizer would technically need a syntax context to wave any ambiguity:

for example the text ``/test/ig`` could be interpreted as

* "div punctuator", "test identifier", "div punctuator" and "ig identifier"
* regular expression literal "/test/ig"

It is therefore technically not possible to tokenize ECMAScript code without an actual parser. However in most of the cases, by looking at the last meaningful token we can find out whether the slash "/" introduces a regular expression literal or is a div punctuator.
That is what this standalone tokenizer does. You can refer to this [Stackoverflow question](https://stackoverflow.com/questions/5519596/when-parsing-javascript-what-determines-the-meaning-of-a-slash) for more details.

## Applications

This tokenizer is used in [@kompilator/spotlight](../spotlight) syntax highlighter and is the tokenizer of the ECMAScript compliant parser [@kompilator/parser](../parser)

## Licence

MIT