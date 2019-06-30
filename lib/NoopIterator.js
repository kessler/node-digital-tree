class NoopIterator {
	next() {
		return this
	}

	get value() {}
	get done() { return true }

	[Symbol.iterator]() {
		return this
	}
}

module.exports = NoopIterator