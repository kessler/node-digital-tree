const test = require('ava')
const HashMapNode = require('../lib/HashMapNode')

test('expose a value property', t => {
	const r = new HashMapNode('root')
	t.is(r.value, 'root')
})

test('value property is mutable', t => {
	const r = new HashMapNode('root')
	r.value = 'foo'
	t.is(r.value, 'foo')
})

test('children can be added with addChild(key, child) and accessed via getChild(key)', t => {
	const r = new HashMapNode('root')
	t.is(r.getChild('b'), undefined)
	const child = new HashMapNode('foo')
	r.addChild('b', child)
	t.is(r.getChild('b'), child)
})

test('children can be removed using removeChild(key)', t => {
	const r = new HashMapNode('root')
	const child = new HashMapNode('foo')
	r.addChild('b', child)
	t.is(r.getChild('b'), child)
	r.removeChild('b')
	t.is(r.getChild('b'), undefined)
})

test('iterable over its children', t => {
	const r = new HashMapNode('root')
	let children = Array.from(r)
	t.deepEqual(children, [])

	r.addChild('a', new HashMapNode('goo'))
	r.addChild('b', new HashMapNode('foo'))
	children = Array.from(r)
	t.deepEqual(children, [
		[
			'a', r.getChild('a')
		],
		[
			'b', r.getChild('b')
		]
	])
})

const expectedJSON = {
	value: 'root',
	children: {
		a: {
			value: 'goo',
			children: {
				c: {
					value: 'doo',
					children: {}
				}
			}
		},
		b: {
			value: 'foo',
			children: {}
		}
	}
}

test('toJSON()', t => {
	const r = new HashMapNode('root')
	const c1 = new HashMapNode('goo')
	const c2 = new HashMapNode('foo')
	const c1c1 = new HashMapNode('doo')

	r.addChild('a', c1)
	r.addChild('b', c2)
	c1.addChild('c', c1c1)

	const serialized = r.toJSON()
	t.deepEqual(serialized, expectedJSON)
})

test('fromJSON() - parameter is an object', t => {
	const node = HashMapNode.fromJSON(expectedJSON)
	t.is(node.value, 'root')
	t.is(node.getChild('a').value, 'goo')
	t.is(node.getChild('a').getChild('c').value, 'doo')
	t.is(node.getChild('b').value, 'foo')
})

test('fromJSON() - parameter is a string', t => {
	const node = HashMapNode.fromJSON(JSON.stringify(expectedJSON))
	t.is(node.value, 'root')
	t.is(node.getChild('a').value, 'goo')
	t.is(node.getChild('a').getChild('c').value, 'doo')
	t.is(node.getChild('b').value, 'foo')
})

test('clone', t => {
	const r = new HashMapNode('root')
	const cra = new HashMapNode('cra')
	const crb = new HashMapNode('crb')

	r.addChild('a', cra)
	r.addChild('b', crb)

	const craa = new HashMapNode('craa')
	const crab = new HashMapNode('crab')

	const crba = new HashMapNode('crba')
	const crbb = new HashMapNode('crbb')

	cra.addChild('a', craa)
	cra.addChild('b', crab)

	crb.addChild('a', crba)
	crb.addChild('b', crbb)

	const crbaa = new HashMapNode('crbaa')
	const crbab = new HashMapNode('crbbb')

	crba.addChild('a', crbaa)
	crba.addChild('b', crbab)

	const clone = r.clone()
	t.is(clone.value, r.value)

	const [craClone, crbClone] = Array.from(clone.values())
	t.is(craClone.value, cra.value)
	t.is(crbClone.value, crb.value)

	const [craaClone, crabClone] = Array.from(craClone.values())
	t.is(craaClone.value, craa.value)
	t.is(crabClone.value, crab.value)

	const [crbaClone, crbbClone] = Array.from(crbClone.values())
	t.is(crbaClone.value, crba.value)
	t.is(crbbClone.value, crbb.value)

	const [crbaaClone, crbabClone] = Array.from(crbaClone.values())
	t.is(crbaaClone.value, crbaa.value)
	t.is(crbabClone.value, crbab.value)

	t.is(r.describe(), clone.describe())
})