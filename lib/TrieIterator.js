const debug = require('./debug')('TrieIterator')

class TrieIterator {

	constructor(root, ArrayWrapper) {
		this._done = false
		this._memory = new ArrayWrapper()
		this._memory.add(root)
		this._current = undefined
		this._done = false 
	}

	next() {
		debug('i:next()')
		const current = this._memory.next()

		if (!current) {
			this._done = true
			return this
		}

		for (let child of current) {
			this._memory.add(child)
		}

		if (!current.value) {
			return this.next()
		}

		this._current = current

		return this
	}

	get done() {
		debug('i:done()')
		return this._done
	}

	get value() {
		debug('i:value()', this._current)
		return this._current.value
	}

	[Symbol.iterator]() {
		return this
	}
}

class StackWrapper {
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

class QueueWrapper {
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

TrieIterator.QueueWrapper = QueueWrapper
TrieIterator.StackWrapper = StackWrapper

module.exports = TrieIterator
