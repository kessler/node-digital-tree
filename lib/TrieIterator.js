const debug = require('./debug')('TrieIterator')

class TrieIterator {

	/**
	 *    
	 *    @param  {HashMapNode}  root
	 *    @param  {Stack|Queue}  options.memory
	 *    @param  {Boolean} [options.includeKeys=true] include keys in the iteration 
	 *    @param  {Array}  options.prefix attach a prefix to all the keys
	 *
	 */
	constructor(root, { memory, includeKeys = true, prefix }) {
		this._done = false
		this._memory = new memory()
		this._root = root

		let key

		if (includeKeys) {
			
			this._value = this._valueWithKey
			this._addChildrenToMemory = this._addChildrenToMemoryIncludeKeys
			key = toKey(prefix)

			debug('includeKeys', key)
		} else {
			debug('excludeKeys')
			this._value = this._valueWithoutKey
			this._addChildrenToMemory = this._addChildrenToMemoryExcludeKeys
		}

		this._memory.add({ key, node: root })
	}

	next() {
		const current = this._memory.next()

		// we're done
		if (!current) {
			debug('done')
			this._done = true
			return this
		}

		const { node: currentNode, key: currentKey } = current
		debug(currentNode)

		// defined in the Ctor based on withKeys state
		this._addChildrenToMemory(this._memory, currentNode, currentKey)

		// proceed to next if there's no value
		if (!currentNode.value) {
			debug('no value')
			return this.next()
		}

		this._current = current

		return this
	}

	_addChildrenToMemoryIncludeKeys(memory, currentNode, currentKey) {
		debug('_addChildrenToMemoryIncludeKeys')

		for (let [key, childNode] of currentNode.entries()) {
			this._memory.add({ key: currentKey.concat([key]), node: childNode })
		}
	}

	_addChildrenToMemoryExcludeKeys(memory, currentNode, currentKey) {
		debug('_addChildrenToMemoryExcludeKeys')

		for (let childNode of currentNode.values()) {
			this._memory.add({ key: undefined, node: childNode })
		}
	}

	get done() {
		return this._done
	}

	get value() {
		// defined in the Ctor based on withKeys state
		return this._value()
	}

	_valueWithKey() {
		const { key, node } = this._current
		return [key, node.value]
	}

	_valueWithoutKey() {
		const { node } = this._current
		return node.value
	}

	[Symbol.iterator]() {
		return this
	}
}

function toKey(prefix) {
	if (prefix) {
		return Array.from(prefix)
	}

	return []
}

class Stack {
	constructor() {
		this._arr = []
	}

	add(something) {
		this._arr.push(something)
	}

	next() {
		return this._arr.pop()
	}
}

class Queue {
	constructor() {}

	add(something) {
		const next = { something }

		if (!this._head) {
			this._head = next
			this._tail = next
			return
		}

		this._tail.next = next
		this._tail = next
	}

	next() {
		if (this._head) {
			const next = this._head
			this._head = this._head.next
			return next.something
		}
	}
}

TrieIterator.Queue = Queue
TrieIterator.Stack = Stack

module.exports = TrieIterator