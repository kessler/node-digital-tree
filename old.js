const debug = require('debug')('digital-tree')

module.exports = Trie

function Trie() {
	this._data = {}
}

/**
 *	put something in the tree.
 *
 *	@param {Array} key - each member in the array is a level in the tree
 *	@param {variant} value - the value to store
 *
 */
Trie.prototype.put = function(key, value) {
	debug('put( {%s}, {%s} )', key, value)
	var current = this._data

	for (var i = 0; i < key.length; i++) {
		var node = key[i]

		if (current[node] === undefined)
			current[node] = {}

		current = current[node]
	}

	current.$ = value
}

/**
 *	remove something from the tree
 *
 *	@param {Array} key
 *
 *	@return {Object} subtree that was removed
 */
Trie.prototype.remove = function(key) {
	debug('remove( {%s} )', key)

	var current = this._data
	var parent

	// find the path, return nothing if its not there
	for (var i = 0; i < key.length; i++) {
		var node = key[i]

		if (current[node] === undefined)
			return

		parent = current
		current = current[node]
	}

	var last = key[key.length - 1]
	var subtree = parent[last]

	if (parent) {
		delete parent[last]
	}

	return subtree
}

/**
 *	get something from the tree
 *
 *	@param {Array} key
 *
 *	@return {variant} the value that was placed under that key
 */
Trie.prototype.get = function(key) {
	debug('get( {%s} )', key)
	var current = this._data

	for (var i = 0; i < key.length; i++) {
		var node = key[i]

		if (current[node] === undefined)
			return undefined

		current = current[node]
	}

	return current.$
}

/**
 *	Search for something in the tree
 *
 *	@param key an array of tokens
 *	@param excludeKeys if true result will only include the leaves and not the whole path
 *
 *	@return {Array} an array of arrays, each sub array contains the key and the value
 */
Trie.prototype.searchByPrefix = function(key, excludeKeys) {
	debug('search( {%s} )', key)

	var results = []

	var current = this._data

	for (var i = 0; i < key.length; i++) {
		var node = key[i]

		if (current[node] === undefined)
			return results

		current = current[node]
	}

	this._searchByPrefixCollect(key, current, results, excludeKeys)

	return results
}

Trie.prototype._searchByPrefixCollect = function(path, parent, results, excludeKeys) {
	if (!parent) return;

	for (var k in parent) {
		if (k === '$') {

			if (excludeKeys)
				results.push(parent.$)
			else
				results.push([path.concat([]), parent.$])

			continue
		}

		var current = parent[k]

		this._searchByPrefixCollect(path.concat([k]), current, results, excludeKeys)
	}
}