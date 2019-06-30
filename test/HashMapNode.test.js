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

test('iterable over its children values', t => {
	const r = new HashMapNode('root')
	let children = Array.from(r)
	t.deepEqual(children, [])

	r.addChild('a', new HashMapNode('goo'))
	r.addChild('b', new HashMapNode('foo'))
	children = Array.from(r)
	t.deepEqual(children, [r.getChild('a'), r.getChild('b')])
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

	const [craClone, crbClone] = Array.from(clone)

	t.is(craClone.value, cra.value)
	t.is(crbClone.value, crb.value)

	const [craaClone, crabClone] = Array.from(craClone)
	t.is(craaClone.value, craa.value)
	t.is(crabClone.value, crab.value)

	const [crbaClone, crbbClone] = Array.from(crbClone)
	t.is(crbaClone.value,  crba.value)
	t.is(crbbClone.value, crbb.value)

	const [crbaaClone, crbabClone] = Array.from(crbaClone)
	t.is(crbaaClone.value, crbaa.value)
	t.is(crbabClone.value, crbab.value)

	t.is(r.describe(), clone.describe())
})
