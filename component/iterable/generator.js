function *gen() {
    yield 1;
    yield 2;
    yield 3;
    return 100;
}

let iter = gen();
for (const it of iter) log(it);
iter.next();
iter.next();
iter.next();
iter.next();

// Generator Example: odds
function *inf(i = 0) {
    while (true) yield i++;
}

function *limit(l, iter) {
    for (const i of iter) {
        yield i;
        if (i == l) return;
    }
}

function *odds(l) {
    for (const i of limit(l, inf())) {
        if (i % 2) yield i;
    }
}

let oddIter = odds(10);
for (const a of oddIter) log(a);

const [head, ...tail] = odds(5);
const [first, second, ...rest] = odds(10);
log(head, tail);
log(first, second, rest);