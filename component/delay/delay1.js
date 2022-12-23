const add = (a, b) => a + b;

// range (in common.js)
let list = range(4);
log(list);
log(reduce(add, list));

// Lazy Loading L.range (in common.js)
let l_list = L.range(4);
log(l_list);
log(reduce(add, l_list));

// performance test
function test(name, time, f) {
    console.time(name);
    while (time--) f();
    console.timeEnd(name);
}

test('range', 10, () => reduce(add, range(1000000)));
test('L.range', 10, () => reduce(add, L.range(1000000)));

// take (in common.js)
console.time('');
go(
    range(10000),
    take(5),
    log
)
console.timeEnd('');

console.time('');
go(
    L.range(Infinity),
    take(5),
    log
)
console.timeEnd('');

let it1 = L.map(a => a + 10, [1, 2, 3]);
log(it1.next());
log(it1.next());
log(it1.next());

let it2 = L.filter(a => a % 2, [1, 2, 3, 4]);
log(it2.next());
log(it2.next());
log(it2.next());

// 중첩
go(
    range(10),
    map(a => a + 10),
    filter(a => a % 2),
    take(2),
    log
);


go(
    L.range(10),
    L.map(a => a + 10),
    L.filter(a => a % 2),
    take(2),
    log
);
