# digital tree

A trie data structure implementation.

This trie is built of nodes, each node has children and an optional leaf value.

- utility (clone, serialization etc)
- 

## Install

    npm install --save digital-tree

## API

### create() / Ctor

using `create()`` is the recommended way to construct new digital trees:

```javascript
    const Trie = require('digital-tree')
    const trie = Trie.create()
    const anotherTrie = new Trie()
```

### put(key, value)

Put something in the tree

```javascript
    trie.put(['a', 'path', 'to'], 'something')
    trie.put(['another', 'thing']) // equivalent to trie.put(['another', 'thing'], true)
    trie.put('strings also', 'work') // equivalent to trie.put('strings also'.split(''), 'work')
```

### get(key)

Get something from the tree

```javascript
    const trie = Trie.create({ rootValue: 'foo' })
    trie.put(['a', 'path', 'to'], 'v1')
    trie.put('also strings', 'v2')

    console.log(trie.get([])) // prints 'foo'
    console.log(trie.get(Trie.root)) // prints 'foo'
    console.log(trie.get(['a', 'path', 'to'])) // prints 'v1'
    console.log(trie.get('also strings')) // prints 'v2'
```

### remove(key)

Remove something from the tree. This will remove the entire subtree that exists under this specified key and return it
as a new trie.

```js
    trie.put(['a', 'b'], 'ab')
    trie.put(['a', 'b', 'c'], 'abc')
    trie.put(['a', 'b', 'c', 1], 'abc1')
    trie.put(['a', 'b', 'c', 2], 'abc2')

    const removed = trie.remove(['a', 'b', 'c'])
    
    // these are the same: 
    console.log(removed.get(Trie.root)) // prints 'abc'
    console.log(removed.get([])) // prints 'abc'

    console.log(removed.get([1])) // prints 'abc1'
    console.log(removed.get([2])) // prints 'abc2'

    console.log(trie.get(['a', 'b', 'c', 1])) // prints 'undefined'
    console.log(trie.get(['a', 'b'])) // prints 'ab'
```

### thoughts

is the root value really making sense? 
remove + search seems weird like that...
```js
trie.put([1,2], 1)
trie.put([1,2,3], 2)
trie.put([1,2,3,4], 3)
trie.put([1,2,3,5], 4)
trie.search([1,2,3]) => [2,3,4]
const removed = trie.remove([1,2,3])
removed.get([]) // => 2
removed.search([]) ???
```

