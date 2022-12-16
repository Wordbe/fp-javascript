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

const reduce = curry((f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const it of iter) {
        acc = f(acc, it)
    }
    return acc;
});

const go = (...args) => reduce((a, f) => f(a), args);

const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);
