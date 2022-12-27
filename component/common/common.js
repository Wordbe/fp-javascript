const log = console.log;
const nop = Symbol('nop');

const curry = f =>
    (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);

const go = (...args) => reduce((a, f) => f(a), args);

const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);

const goThen = (a, f) => a instanceof Promise ? a.then(f) : f(a);

const head = iter => goThen(take(1, iter), ([h]) => h);

const reduceThen = (acc, a, f) => a instanceof Promise ?
    a.then(a => f(acc, a), e => e == nop ? acc : Promise.reject(e)) :
    f(acc, a);

const reduce = curry((f, acc, iter) => {
    if (!iter) return reduce(f, head(iter = acc[Symbol.iterator]()), iter);

    iter = iter[Symbol.iterator]();
    return goThen(acc, function recur(acc) {
        let cur;
        while (!(cur = iter.next()).done) {
            acc = reduceThen(acc, cur.value, f);
            if (acc instanceof Promise) return acc.then(recur);
        }
        return acc;
    });
});

const take = curry((l, iter) => {
    let res = [];
    iter = iter[Symbol.iterator]();
    return function recur() {
        let cur;
        while (!(cur = iter.next()).done) {
            const a = cur.value;
            if (a instanceof Promise) 
                return a
                    .then(a => (res.push(a), res).length == l ? res : recur())
                    .catch(e => e == nop ? recur() : Promise.reject(e));

            res.push(a);
            if (res.length == l) return res;
        }
        return res;
    } ();
});

const takeAll = take(Infinity);

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
    for (const a of iter) yield goThen(a, f);
});

L.filter = curry(function *(f, iter) {
    for (const a of iter) {
        const fa = goThen(a, f);
        if (fa instanceof Promise) {
            yield fa.then(fa => fa ? a : Promise.reject(nop));
        }
        else if (fa) yield a;
    }
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

const map = curry(pipe(L.map, takeAll));

const filter = curry(pipe(L.filter, takeAll));

const range = pipe(L.range, takeAll);

// Concurrency
const C = {};
const noop = () => {}; // no opreation function
const catchNoop = ([...arr]) =>
    (arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);

C.reduce = curry((f, acc, iter) => iter ? 
        reduce(f, acc, catchNoop(iter)) :
        reduce(f, catchNoop(acc)));

C.take = curry((l, iter) => take(l, catchNoop(iter)));

C.takeAll = C.take(Infinity);

C.map = curry(pipe(L.map, C.takeAll));

C.filter = curry(pipe(L.filter, C.takeAll));

