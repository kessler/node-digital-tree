/*

	this program adds the benchmark lorem to a trie
	and prints the stats about creation of map instances
	for the children collection of HashMapNode

 */
const debug = require('./lib/debug')('countChildrenMapInstances')

if (!debug.enabled) {
	console.error(`must enable debug for this program:
env DEBUG=digital-tree\* node countChildrenMapInstances.js`)
	process.exit(1)
}

const lorem = require('./lorem')
const Trie = require('./index')
const HashMapNode = require('./lib/HashMapNode')

const tree = Trie.create()

for (let word of lorem) {
	tree.put(word, 1)
}

console.log('maps created if creation was in Ctor (not lazy)', HashMapNode.ctor)
console.log('maps created lazily', HashMapNode.lazy)
console.log('calls to add()', HashMapNode.add)