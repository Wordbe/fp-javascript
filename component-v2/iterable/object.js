// values, entries, keys
const entries = [['a', 1], ['b', 2], ['c', 3]];
const obj = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5
};

console.log(Object.values(obj));

L = {}

L.values = function *(obj) {
    for (const k in obj) {
        yield obj[k];
    }
}

L.entries = function *(obj) {
    for (const k in obj) {
        yield [k, obj[k]];
    }
}

L.keys = function *(obj) {
    for (const k in obj) {
        yield k;
    }
}

_.go(
    obj,
    // Object.values,
    L.values,
    _.takeL(4),
    _.reduce((a, b) => a + b),
    console.log
);

_.go(
    obj,
    L.entries,
    _.filterL(([_, v]) => v % 2),
    _.mapL(([k, v]) => ({ [k]: v })),
    _.reduce(Object.assign),
    console.log
);

_.go(
    obj,
    L.keys,
    _.each(console.log)
);

// object
const object = entries => 
    _.reduce((obj, [k, v]) => (obj[k] = v, obj), {}, entries);

console.log(object(L.entries(obj)));

let m = new Map(); // javascript map is iterable.
m.set('a', 10);
m.set('b', 20);
m.set('c', 30);

console.log(object(m));

// mapObject
const mapObject = (f, obj) => _.go(
    obj,
    L.entries,
    _.mapL(([k, v]) => [k, f(v)]),
    object
);

console.log(mapObject(a => a + 10, { a: 1, b: 2, c: 3}));

// pick
const pick = (keys, obj) => _.go(
    keys,
    _.map(k => [k, obj[k]]),
    _.reject(([k, v]) => v === undefined),
    object
);

console.log(pick(['b', 'c', 'z'], obj)); // { b: 2, c: 3 }

// indexBy : array to map by index
const users = [
    { id: 5, name: 'AA', age: 35 },
    { id: 10, name: 'BB', age: 26 },
    { id: 19, name: 'CC', age: 28 },
    { id: 23, name: 'DD', age: 34 },
    { id: 24, name: 'EE', age: 23 }
];

_.indexBy = (f, iter) =>
    _.reduce((obj, a) => (obj[f(a)] = a, obj), {}, iter);

const users2 = _.indexBy(u => u.id, users)
console.log(users2);

_.go(
    users2,
    L.entries,
    _.filterL(([_, {age}]) => age < 30),
    _.takeL(2),
    object,
    console.log
);
