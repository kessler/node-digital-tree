const test = require('ava')
const TrieIterator = require('../lib/TrieIterator')

test('TrieIterator DFS with keys', t => {
	const { root } = createTree()

	const iterator = new TrieIterator(root, { memory: TrieIterator.Stack })
	const iteration = Array.from(iterator)

	t.deepEqual(iteration, [
		[
			['a'], '456'
		],
		[
			['a', '3'], '4563'
		],
		[
			['a', '2'], '4562'
		],
		[
			['a', '2', 'a'], '45621'
		],
		[
			['a', '1'], '4561'
		],
		[
			['a', '1', 'a'], '45611'
		],
		[
			['a', '1', 'a', '1'], '456111'
		]
	])
})

test('TrieIterator DFS values only', t => {
	const { root } = createTree()

	const iterator = new TrieIterator(root, { memory: TrieIterator.Stack, includeKeys: false })
	const iteration = Array.from(iterator)

	t.deepEqual(iteration, ['456', '4563', '4562', '45621', '4561', '45611', '456111'])
})

test('TrieIterator BFS with keys', t => {
	const { root } = createTree()

	const iterator = new TrieIterator(root, { memory: TrieIterator.Queue })
	const iteration = Array.from(iterator)

	t.deepEqual(iteration, [
		[
			['a'], '456'
		],
		[
			['a', '1'], '4561'
		],
		[
			['a', '2'], '4562'
		],
		[
			['a', '3'], '4563'
		],
		[
			['a', '1', 'a'], '45611'
		],
		[
			['a', '2', 'a'], '45621'
		],
		[
			['a', '1', 'a', '1'], '456111'
		]
	])
})

test('TrieIterator BFS values only', t => {
	const { root } = createTree()

	const iterator = new TrieIterator(root, { memory: TrieIterator.Queue, includeKeys: false })
	const iteration = Array.from(iterator)
	
	t.deepEqual(iteration, ['456', '4561', '4562', '4563', '45611', '45621', '456111'])
})

/*
	root
		c1: a => 456
			c11: 1 => 4561
				c111: a => 45611
					c1111: 1 => 456111
			c12: 2 => 4562
				c121: a => 4561
			c13: 3 => 4563
 */
function createTree() {
	const root = new Map()

	const c1 = new Map()
	const c11 = new Map()
	const c111 = new Map()
	const c1111 = new Map()
	const c12 = new Map()
	const c121 = new Map()
	const c13 = new Map()

	c1.value = '456'
	c11.value = '4561'
	c111.value = '45611'
	c1111.value = '456111'
	c12.value = '4562'
	c121.value = '45621'
	c13.value = '4563'

	root.set('a', c1)
	c1.set('1', c11)
	c1.set('2', c12)
	c12.set('a', c121)
	c1.set('3', c13)
	c11.set('a', c111)
	c111.set('1', c1111)

	return { root, c1, c11, c12, c13, c111, c1111 }
}