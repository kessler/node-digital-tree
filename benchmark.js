const Benchmarkify = require('benchmarkify')
const lorem = require('./lorem')
const Trie = require('./index')
const OldTrie = require('./old')
const TrieD = require('trie-d')

const benchmark = new Benchmarkify('digital-tree benchmark').printHeader()
const putBench = benchmark.createSuite('Trie put/add')
const putAllBench = benchmark.createSuite('Trie put/add all')
const getBench = benchmark.createSuite('Trie get')
const searchBench = benchmark.createSuite('Trie search by prefix')

const testSubjects = [{
		create: () => Trie.create(),
		name: 'current implementation',
		put: (trie, key, value) => trie.put(key, value),
		putAll: (trie, keys) => trie.putAll(keys),
		get: (trie, key) => trie.get(key),
		search: (trie, key) => trie.search(key)
	},
	{
		create: () => new OldTrie(),
		name: 'old implementation',
		put: (trie, key, value) => trie.put(key, value),
		get: (trie, key) => trie.get(key),
		search: (trie, key) => trie.searchByPrefix(key)
	},
	{
		create: () => new TrieD(),
		name: 'trie-d',
		put: (trie, key, value) => trie.add(key),
		putAll: (trie, keys) => trie.addAll(keys)
	}
]

for (let { name, create, put, putAll, get, search } of testSubjects) {
	const instance = create()

	if (put) {
		putBench.add(name, () => {
			for (let word of lorem) {
				put(instance, word, 1)
			}
		})
	}

	if (putAll) {
		putAllBench.add(name, () => {
			putAll(instance, lorem)
		})
	}

	if (get) {
		getBench.add(name, () => {
			for (let word of lorem) {
				get(instance, word)
			}
		})
	}

	if (search) {
		searchBench.add(name, () => {
			for (let word of lorem) {
				for (let i = 1; i <= word.length; i++) {
					let part = word.substr(0, i)
					let result = search(instance, part)
				}
			}
		})
	}
}

async function main() {
	await putBench.run()
	await putAllBench.run()
	// await getBench.run()
	// await searchBench.run()
}

main()