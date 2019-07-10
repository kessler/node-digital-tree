const debug = require('./debug')('HashMapNode')
const NoopIterator = require('./NoopIterator')
const noopIterator = new NoopIterator()
const jsonStringify = require('json-stringify-safe')
const { isString } = require('util')

/**
 *    internal class for nodes in the trie
 */
class HashMapNode {
	constructor(value) {
		if (debug.enabled) {
			HashMapNode.ctor++
		}

		this._children = undefined
		this._value = value
	}

	get value() {
		return this._value
	}

	set value(value) {
		this._value = value
	}

	[Symbol.iterator]() {

		// it's quite annoying to have the if (this._children) {} guard
		// all around. I tested this on the benchmark lorem and found that
		// lazily creating the _children map will reduce approximately 20% 
		// map instances so for now i decided it's worth it.
		// the number of unnecessary map instances will probably be bigger
		// in trees with lots of leaves in them. I think the penalty of several if
		// clauses should be insignificant
		if (this._children) {
			return this._children.entries()
		}

		return noopIterator
	}

	entries() {
		if (this._children) {
			return this._children.entries()
		}

		return noopIterator
	}

	values() {
		if (this._children) {
			return this._children.values()
		}

		return noopIterator	
	}

	keys() {
		if (this._children) {
			return this._children.keys()
		}

		return noopIterator
	}

	getChild(key) {
		if (this._children) {
			return this._children.get(key)
		}
	}

	addChild(key, child) {

		// see the _children comment above first.
		// when debug is enabled I count these stats for all instances
		if (debug.enabled) {
			HashMapNode.add++
		}

		debug('add child %s', key)

		if (!this._children) {
			if (debug.enabled) {
				HashMapNode.lazy++
			}
			this._children = new Map()
		}

		this._children.set(key, child)
	}

	removeChild(key) {
		if (this._children) {
			this._children.delete(key)
		}
	}

	clone() {
		const clone = new HashMapNode(this._value)

		if (this._children) {
			for (let [key, child] of this) {
				clone.addChild(key, child.clone())
			}
		}

		return clone
	}

	toJSON() {
		const result = {
			value: this.value,
			children: {}
		}

		for (let [key, child] of this.entries()) {
			result.children[key] = child.toJSON()
		}

		return result
	}

	static fromJSON(json) {
		if (isString(json)) {
			json = JSON.parse(json)
		}

		if (!json) {
			throw new Error('missing json value')
		}

		const root = new HashMapNode(json.value)

		for (let key in json.children) {
			const entry = json.children[key]
			if (!entry) {
				throw new Error('empty child entry in json')
			}

			const child = HashMapNode.fromJSON(entry)
			root.addChild(key, child)
		}

		return root
	}

	/**
	 *    describe this node in a pseudo json way
	 *
	 *    @return {string}
	 */
	describe(_depth = 0) {
		let tabs = ''
		for (let i = 0; i < _depth; i++) {
			tabs += '\t'
		}

		let tabsPlus = `\n${tabs}\t`
		let result = `{${tabsPlus}value: ${this._value}`

		let children = Array.from(this)

		if (children.length > 0) {
			_depth++
			result += `,${tabsPlus}children (${children.length}): {`
			for (let i = 0; i < children.length; i++) {
				let [key, child] = children[i]

				if (i > 0) {
					result += ','
				}

				result += `${tabsPlus}\t${jsonStringify(key)}: ${child.describe(_depth + 1)}`
			}
			result += `${tabsPlus}}`
		}

		result += `\n${tabs}}`

		return result
	}
}

if (debug.enabled) {
	HashMapNode.ctor = 0
	HashMapNode.lazy = 0
	HashMapNode.add = 0
}

module.exports = HashMapNode