const Benchmarkify = require('benchmarkify')
const lorem = require('./lorem')
const Trie = require('./index')
const OldTrie = require('./old')

const benchmark = new Benchmarkify('digital-tree benchmark').printHeader()
const putBench = benchmark.createSuite('Trie put')
const getBench = benchmark.createSuite('Trie get')

const testSubjects = [{
		create: () => Trie.create(),
		name: 'current implementation',
		put: (trie, key, value) => trie.put(key, value),
		get: (trie, key) => trie.get(key)
	},
	{
		create: () => new OldTrie(),
		name: 'old implementation',
		put: (trie, key, value) => trie.put(key, value),
		get: (trie, key) => trie.get(key)
	}
]

for (let { name, create, put, get } of testSubjects) {
	const instance = create()

	putBench.add(name, () => {
		for (let word of lorem) {
			put(instance, word, 1)
		}		
	})

	getBench.add(name, () => {
		for (let word of lorem) {
			get(instance, word)
		}		
	})
}

async function main() {
	await putBench.run()
	await getBench.run()	
}

main()
