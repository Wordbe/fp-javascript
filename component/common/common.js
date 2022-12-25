const log = console.log;

const curry = f =>
    (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);

const map = curry((f, iter) => {
    res = [];
    for (const it of iter) {
        res.push(f(it));
    }
    return res;
});

const filter = curry((f, iter) => {
    res = [];
    for (const it of iter) {
        if (f(it)) {
            res.push(it);
        }
    }
    return res;
});

const goThen = (a, f) => a instanceof Promise ? a.then(f) : f(a);

const reduce = curry((f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    } else {
        iter = iter[Symbol.iterator]();
    }

    return goThen(acc, function recur(acc) {
        for (const it of iter) {
            acc = f(acc, it);
            if (acc instanceof Promise) return acc.then(recur);
        }
        return acc;
    });
});

const go = (...args) => reduce((a, f) => f(a), args);

const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);

const range = length => {
    let i = -1;
    let res = [];
    while (++i < length) {
        res.push(i);
    }
    return res;
};

const take = curry((l, iter) => {
    let res = [];
    for (const a of iter) {
        res.push(a);
        if (res.length == l) return res;
    }
    return res;
});

const find = curry((f, iter) => go(
    iter,
    L.filter(f),
    take(1),
    ([a]) => a
));

// Lazy Functions
const L = {};

L.range = function *(l) {
    let i = -1;
    while(++i < l) {
        yield i;
    }
}

L.map = curry(function *(f, iter) {
    for (const a of iter) yield f(a);
});

L.filter = curry(function *(f, iter) {
    for (const a of iter) if (f(a)) yield a;
});

// Lazy version of Object.entries
L.entries = function *(obj) {
    for (const k in obj) yield [k, obj[k]];
};

const isIterable = a => a && a[Symbol.iterator];

L.flatten = function *(iter) {
    for (const a of iter) {
        if (isIterable(a)) yield *a;
        else yield a;
    }
};

L.deepFlat = function *f(iter) {
    for (const a of iter) {
        if (isIterable(a)) yield *f(a);
        else yield a;
    }
};

L.flatMap = curry(pipe(L.map, L.flatten));
