const { isString, isFunction } = require('util')
const debug = require('./lib/debug')('Trie')
const _DFS = Symbol('dfs')
const _BFS = Symbol('bfs')
const HashMapNode = require('./lib/HashMapNode')
const TrieIterator = require('./lib/TrieIterator')
const NoopIterator = require('./lib/NoopIterator')

const noopIterator = new NoopIterator()

class Trie {

	static get DFS() { return _DFS }
	static get BFS() { return _BFS }

	/**
	 *    Create a new Trie
	 *    
	 *    @param  {variant} [options.rootValue]	The root value of the trie, normally you will not use this.
	 *    @param  {Symbol} [options.iterationOrder=Trie.DFS] The trie is `iterable`, setting this will change the default iteration order.
	 *    iteration order can be either `Trie.BFS` or `Trie.DFS`. You can still use an explicit iteration order by calling `trie.bfsIterator()` or `trie.dfsIterator()`
	 *    @param  {HashMapNode} [options.NodeClass=HashMapNode] 
	 *    
	 *    @return {Trie}
	 */
	static create({
		iterationOrder = _DFS,
		NodeClass = HashMapNode
	} = {}) {

		if (iterationOrder !== _DFS && iterationOrder !== _BFS) {
			throw new Error('invalid iteration order, try Trie.BFS or Trie.DFS')
		}

		return new Trie({ NodeClass, iterationOrder })
	}

	constructor({ NodeClass, iterationOrder }) {
		this._nodeClass = NodeClass
		this._root = this._newNode()
		this._iterationOrder = iterationOrder
	}

	/**
	 *	put something in the tree.
	 *
	 *	@param {Iterable} key - each member in the array is a level in the tree
	 *	@param {variant} [value=true] - the value to store
	 *
	 */
	put(key, value = true) {
		debug('put( {%s}, {%s} )', key, value)

		if (!this._isValidKey(key)) {
			throw new Error('invalid key')
		}

		let current = this._root
		let count = 0

		for (let part of key) {
			let node = current.getChild(part)

			if (node === undefined) {
				node = this._newNode()
				current.addChild(part, node)
			}

			count++
			current = node
		}

		// prevent "losing" a value in root 
		// if iterable was "empty"
		// empty interables doesn't make sense anyways
		if (count === 0) {
			throw new Error('invalid key')
		}

		current.value = value
	}

	putAll(iterable) {
		for (let key of iterable) {
			this.put(key, true)
		}
	}

	/**
	 *	get something from the tree.
	 *
	 *	@param {Iterable} [key] - a path in the tree.
	 *
	 *	@return {variant} the value that was placed under that key
	 */
	get(key) {
		debug('get( {%s} )', key)
		const current = this._getNode(key)
		if (current === undefined) return
		return current.value
	}

	/**
	 *    get a Trie view of the tree under "key"
	 *    
	 *    @param {Iterable}  key 
	 *    @param {boolean} [shallow] defaults to false
	 *    
	 *    @return {Trie} 
	 */
	getSubTrie(key, shallow = false) {
		debug('getSubTrie( {%s} }', key)

		const current = this._getNode(key)
		return this._newTrieLikeThis(current, shallow)
	}

	/**
	 *    clone this trie.
	 *
	 *    - Object keys will not be cloned
	 *    
	 *    @return {Trie}
	 */
	clone() {
		return this._newTrieLikeThis(this._root)
	}

	/**
	 *	remove something from the tree
	 *
	 *	@param {Iterable} key
	 *
	 *	@return {Trie} subtree that was removed
	 */
	remove(key) {
		// this whole thing can go away if HashMapNode will have a 
		// parent reference... then removeChild() will not have
		// to accept keyPart
		const { current, parent, keyPart } = this._getNodeAndParent(key)

		if (current === undefined) return

		parent.removeChild(keyPart)

		return this._newTrieLikeThis(current)
	}

	/**
	 *    search for all values that are associated with keys that have the specified prefix
	 *    values will be ordered based on the default ordering of the trie (dfs/bfs)
	 *     
	 *    @param  {Iterable} prefix 
	 *    @param  {boolean} [options.includeKeys=false] if set to true result will include keys as values.
	 *    @return {Iterable}
	 */
	search(prefix, { includeKeys = false } = {}) {
		if (!this._isValidKey(prefix)) {
			throw new Error('invalid key')
		}

		const node = this._getNode(prefix)

		if (node === undefined) {
			return noopIterator
		}

		return this._newTrieIterator(node, { includeKeys, iterationOrder: this._iterationOrder, prefix })
	}

	[Symbol.iterator]() {
		return this._newTrieIterator(this._root)
	}

	/**
	 *    return a DFS iterator for this trie
	 *    
	 *    @param  {boolean} [includeKeys=false] if set to true result will include keys as values.
	 *    @return {Iterator}
	 */
	dfsIterator(includeKeys = false) {
		return this._newTrieIterator(this._root, { includeKeys, iterationOrder: Trie.DFS })
	}

	/**
	 *    return a BFS iterator for this trie
	 *    
	 *    @param  {boolean} [includeKeys=false] if set to true result will include keys as values.
	 *    @return {Iterator}
	 */
	bfsIterator(includeKeys = false) {
		return this._newTrieIterator(this._root, { includeKeys, iterationOrder: Trie.BFS })
	}

	_getNode(key) {
		if (!this._isValidKey(key)) {
			throw new Error('invalid key')
		}

		let current = this._root
		let count = 0
		
		for (let part of key) {
			let node = current.getChild(part)
			if (node === undefined) {
				return
			}

			count++
			current = node
		}

		// prevent obtaining access to root
		// if iterable is empty
		if (count === 0) {
			throw new Error('invalid key')
		}

		return current
	}

	_getNodeAndParent(key) {

		if (!this._isValidKey(key)) {
			throw new Error('invalid key')
		}

		let keyPart = undefined
		let parent = undefined
		let current = this._root
		let count = 0
		for (keyPart of key) {
			let node = current.getChild(keyPart)
			if (node === undefined) {
				return {}
			}

			count++
			parent = current
			current = node
		}

		// prevent getting access to root
		// if iterable is empty
		if (count > 0) {
			return { current, parent, keyPart }
		}

		throw new Error('invalid key')
	}

	_newNode(value) {
		return new this._nodeClass(value)
	}

	_isValidKey(key) {
		// const rightType = Array.isArray(key) || isString(key)
		// return rightType && key.length > 0
		return isFunction(key[Symbol.iterator])
	}

	_newTrieLikeThis(root, shallow = false) {
		const trie = new Trie({
			NodeClass: this._nodeClass,
			iterationOrder: this._iterationOrder
		})

		trie._root = shallow ? root : root.clone()

		return trie
	}

	_newTrieIterator(rootNode, { includeKeys = false, iterationOrder = this._iterationOrder, prefix } = {}) {
		if (iterationOrder === _DFS) {
			return new TrieIterator(rootNode, { memory: TrieIterator.Stack, includeKeys, prefix })
		}

		if (iterationOrder === _BFS) {
			return new TrieIterator(rootNode, { memory: TrieIterator.Queue, includeKeys, prefix })
		}

		throw new Error('invalid iteration order, try Trie.BFS or Trie.DFS')
	}
}

module.exports = Trie