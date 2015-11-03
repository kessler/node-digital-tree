# digital tree

Trie data structure implementation

## Install
```
npm install --save digital-tree
```

## API

```javascript
    var Trie = require('digital-tree')

    var trie = new Trie()
```

### put(key, value)
Put something in the tree
```javascript
    trie.puth(['a', 'path', 'to'], 'something')
```

### remove(key)
Remove something from the tree

given:
```json
{ "a": {
        "path": {
            "to": {
                "$": "value"
            }
        }
    }
}
```

```javascript
    var subtree = trie.remove(['a', 'path'])
```

subtree will be:
```json
{ "to": { "$": "value" } }
```

Trie underlying data will look like this after the removal:
```json
{ "a": {}}
```

### get(key)
Get something from the tree
```javascript
    var value = trie.get(['a', 'path', 'to'])
```
value will be the string "something"

### searchByPrefix(key, excludeEmptyKeys)
Search for all the entries under key

```javascript
    var result = trie.searchByPrefix(['a', 'path'])
```

result will be:
```json
[ [ [ "a", "path", "to" ], "something" ] ]
```

TODO
- add benchmarks of other similar modules