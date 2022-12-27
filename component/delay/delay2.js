// join
const join = curry((sep=',', iter) => 
    reduce((a, b) => `${a}${sep}${b}`, iter));

// queryStr 예제
const queryStr = obj => go(
    obj,
    L.entries,
    L.map(([k, v]) => `${k}=${v}`),
    join('&')
);

log(queryStr({ limit: 10, offset: 10, type: 'notice' }));

// take, find
const ages = [
    { age: 28 },
    { age: 29 },
    { age: 30 },
    { age: 31 },
    { age: 32 },
    { age: 33 },
    { age: 34 },
    { age: 35 },
    { age: 36 },
];

log(find(u => u.age < 30)(ages));

// Make map, filter using L.map, L.filter
const lmap = curry(pipe(L.map, takeAll));

log(lmap(a => a + 10, L.range(4)));

const lfilter = curry(pipe(L.filter, takeAll));

log(lfilter(a => a % 2, L.range(4)));

// L.flatten, flatten, yield *, L.deepFlat
const dummyIter = [[1, 2], 3, 4, [5, 6], [7, 8, 9]];
let it = L.flatten(dummyIter);
log(it.next());
log(it.next());
log(it.next());
log(it.next());

const lflatten = pipe(L.flatten, takeAll);
log(lflatten(dummyIter));

const deepIt = L.deepFlat([1, [2, [3, 4], [[5]]]]);
log([...deepIt]);

// L.flatMap, flatMap
const dummyIter2 = [[1, 2,], [3, 4], [5, 6, 7]];
let flatMapped = L.flatMap(map(a => a * a), dummyIter2);
log([...flatMapped]);

const lflatMap = curry(pipe(L.flatMap, takeAll));
log(lflatMap(map(a => a * a), dummyIter2));

// iterable driven practical codes
const users = [
    { name: 'a', age: 21, family: [
        { name: 'a1', age: 53 }, { name: 'a2', age: 47 },
        { name: 'a3', age: 16 }, { name: 'a4', age: 15 }
    ]},
    { name: 'b', age: 24, family: [
        { name: 'b1', age: 58 }, { name: 'b2', age: 51 },
        { name: 'b3', age: 19 }, { name: 'b4', age: 22 }
    ]},
    { name: 'c', age: 31, family: [
        { name: 'c1', age: 64 }, { name: 'c2', age: 62 },
    ]},
    { name: 'd', age: 20, family: [
        { name: 'd1', age: 42 }, { name: 'd2', age: 42 },
        { name: 'd3', age: 11 }, { name: 'd4', age: 7 }
    ]},
];

const add = (a, b) => a + b;

go(
    users,
    L.flatMap(u => u.family),
    L.filter(u => u.age < 20),
    L.map(u => u.age),
    take(3),
    reduce(add),
    log
);
