const test = require('ava')
const Trie = require('../index')

test('trie simple put() / get()', t => {
	const { subject } = t.context
	const key = [1, 2, 3]
	const value = 'foo'
	subject.put(key, value)
	t.is(subject.get(key), value)
})

test('trie keys can be any iterable that has more than zero values', t => {
	const { subject } = t.context
	const iterable = new TestIterator(2)
	subject.put(iterable, 'foo')
	t.deepEqual(Array.from(subject), ['foo'])
	t.is(subject.get([1, 2]), 'foo')
})

test('trie put throws an error if iterable has zero values', t => {
	const { subject } = t.context
	const iterable = new TestIterator(0)

	t.throws(() => {
		subject.put(iterable, 'foo')
	}, 'invalid key')
})

test('trie put() same key, different value', t => {
	const { subject } = t.context
	const key = [1, 2, 3]
	const v1 = 'foo'
	const v2 = 'foo'
	subject.put(key, v1)
	subject.put(key, v2)

	t.is(subject.get(key), v1)
})

test('trie put() string)', t => {
	const { subject } = t.context
	const key = 'strings also work'
	const v1 = 'foo'
	subject.put(key, v1)

	t.is(subject.get(key), v1) // works with string
	t.is(subject.get(key.split('')), v1) // also an array with the same chars
})

test('trie put() object)', t => {
	const { subject } = t.context

	const key = [{ foo: 'bar' }, { bar: 'foo' }]
	const v1 = 'foo'
	subject.put(key, v1)

	t.is(subject.get(key), v1) // works with string
})

test('trie keys can be longer than one character', t => {
	const { subject } = t.context
	const key = ['foo', 'bar', 'meow']
	subject.put(key, 1)

	t.is(subject.get(key), 1)
})

test('trie put() invalid key', t => {
	const { subject } = t.context
	t.throws(() => {
		subject.put(1, 1)
	}, 'invalid key')
})

test('trie get() a non existent key', t => {
	const { subject } = t.context

	t.is(subject.get(['1']), undefined)
})

test('trie get() empty key', t => {
	const { subject } = t.context

	t.throws(() => {
		// empty iterable
		subject.get('')
	}, 'invalid key')
})

test('trie get() invalid key', t => {
	const { subject } = t.context

	t.throws(() => {
		// not iterable
		subject.get(1)
	}, 'invalid key')
})

test('trie getSubTrie()', t => {
	const { subject } = t.context
	createMediumGraph(subject)
	const subTrie = subject.getSubTrie([1, 2, 3])

	// [1,2,3,4] in original trie
	t.is(subTrie.get([4]), 'zoo')

	// [1,2,3,5] in original trie
	t.is(subTrie.get([5]), 'goo')
})

test('trie getSubTrie() shallow === true', t => {
	const { subject } = t.context
	createMediumGraph(subject)
	const subTrie = subject.getSubTrie([1, 2, 3], true)

	// [1,2,3,4] in original trie
	t.is(subTrie.get([4]), 'zoo')

	// [1,2,3,5] in original trie
	t.is(subTrie.get([5]), 'goo')
})

test('trie remove()', t => {
	const { subject } = t.context
	createMediumGraph(subject)
	const removed = subject.remove([1, 2, 3])

	// [1,2,3,4] in original trie
	t.is(removed.get([4]), 'zoo')

	// [1,2,3,5] in original trie
	t.is(removed.get([5]), 'goo')

	t.is(subject.get([1, 2, 3]), undefined)
})

test('trie remove() a non existent key', t => {
	const { subject } = t.context
	subject.put('abc', 'foo')
	const removed = subject.remove('bar')
	t.is(removed, undefined)
	t.is(subject.get('abc'), 'foo')
})

test('trie remove() empty key', t => {
	const { subject } = t.context

	t.throws(() => {
		subject.remove('')
	}, 'invalid key')
})

test('trie remove() invalid key', t => {
	const { subject } = t.context

	t.throws(() => {
		subject.remove(1)
	}, 'invalid key')
})

test('iteration order is DFS by default', t => {
	const { subject } = t.context
	createBigGraph(subject)
	const iterationOrder = Array.from(subject)

	t.deepEqual(iterationOrder, EXPECTED_DFS_ITERATION_ORDER)
})

test('Specify DFS iteration order in Ctor', t => {
	const subject = Trie.create({ iterationOrder: Trie.DFS })
	createBigGraph(subject)
	const iterationOrder = Array.from(subject)

	t.deepEqual(iterationOrder, EXPECTED_DFS_ITERATION_ORDER)
})

test('explicit DFS iterator', t => {
	const subject = Trie.create({ iterationOrder: Trie.BFS })
	createBigGraph(subject)
	const iterationOrder = Array.from(subject.dfsIterator())

	t.deepEqual(iterationOrder, EXPECTED_DFS_ITERATION_ORDER)
})

test('Specify BFS iteration order in Ctor', t => {
	const subject = Trie.create({ iterationOrder: Trie.BFS })
	createBigGraph(subject)
	const iterationOrder = Array.from(subject)

	t.deepEqual(iterationOrder, EXPECTED_BFS_ITERATION_ORDER)
})

test('explicit BFS iterator', t => {
	const subject = Trie.create({ iterationOrder: Trie.DFS })
	createBigGraph(subject)
	const iterationOrder = Array.from(subject.bfsIterator())

	t.deepEqual(iterationOrder, EXPECTED_BFS_ITERATION_ORDER)
})

test('trie clone', t => {
	const { subject } = t.context
	subject.put('ab', 'moo')
	subject.put('abc', 'foo')

	const clone = subject.clone()

	t.is(clone.get('ab'), 'moo')
	t.is(clone.get('abc'), 'foo')

	// make sure that stuff that's added to the 
	// clone dont show up on the original
	clone.put('abcd', 'floop')
	t.is(subject.get('abcd'), undefined)

	// other way around
	subject.put('cbd', 'cbd')
	t.is(clone.get('cbd'), undefined)
})

test('trie search(prefix)', t => {
	const { subject } = t.context
	createBigGraph(subject)
	const results = Array.from(subject.search([1, 2, 3]))
	t.deepEqual(results, ['foo', 'goo', 'zoo', 'fee'])
})

test('trie search(prefix) include keys', t => {
	const { subject } = t.context
	createBigGraph(subject)
	const results = Array.from(subject.search([1, 2, 3], { includeKeys: true }))
	console.log(results)
	t.deepEqual(results, [
		[
			[1, 2, 3], 'foo'
		],
		[
			[1, 2, 3, 5], 'goo'
		],
		[
			[1, 2, 3, 4], 'zoo'
		],
		[
			[1, 2, 3, 4, 1], 'fee'
		]
	])
})

test('trie search(prefix) invalid key', t => {
	const { subject } = t.context

	t.throws(() => {
		subject.search(1)
	}, 'invalid key')
})

test('trie search(prefix) non existent prefix', t => {
	const { subject } = t.context
	const results = subject.search('kjhasd')
	t.deepEqual(Array.from(results), [])
})

test('trie create() with invalid iteration ordering', t => {
	t.throws(() => {
		Trie.create({ iterationOrder: 'bla' })
	}, 'invalid iteration order, try Trie.BFS or Trie.DFS')
})

test.beforeEach(t => {
	t.context.subject = Trie.create()
})

const EXPECTED_BFS_ITERATION_ORDER = ['moo', 'foo', 'bar', 'zoo', 'goo', 'shmoo', 'fee']
const EXPECTED_DFS_ITERATION_ORDER = ['moo', 'bar', 'shmoo', 'foo', 'goo', 'zoo', 'fee']

function createBigGraph(subject) {
	subject.put([1, 2], 'moo')
	subject.put([1, 2, 3], 'foo')
	subject.put([1, 2, 4], 'bar')
	subject.put([1, 2, 4, 1], 'shmoo')
	subject.put([1, 2, 3, 4], 'zoo')
	subject.put([1, 2, 3, 5], 'goo')
	subject.put([1, 2, 3, 4, 1], 'fee')
}

function createMediumGraph(subject) {
	subject.put([1, 2], 'moo')
	subject.put([1, 2, 3], 'foo')
	subject.put([1, 2, 4], 'bar')
	subject.put([1, 2, 3, 4], 'zoo')
	subject.put([1, 2, 3, 5], 'goo')
}

class TestIterator {
	constructor(count) {
		this._count = count
		this._value = undefined
		this._done = false
	}

	next() {
		if (this._value === undefined) {
			this._value = 0
		}

		if (this._value === this._count) {
			this._done = true
		}

		this._value++

		return this
	}

	get value() {
		return this._value
	}

	get done() {
		return this._done
	}

	[Symbol.iterator]() {
		return this
	}
}