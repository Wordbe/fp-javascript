// Iterable Programming (= List Processing = Lisp)
function f1(list, limit) {
    let acc = 0;
    for (const a of list) {
        if (a % 2) {
            const b = a * a;
            acc += b;
            if (--limit == 0) break;
        }
    }
    console.log(acc);
}
f1([1, 2, 3, 4, 5], 2);

function f2(list, limit) {
    const add = (a, b) => a + b;

    _.go(list,
        _.filterL(a => a % 2),
        _.mapL(a => a * a),
        _.takeL(limit),
        _.reduce(add),
        console.log);
}
f2([1, 2, 3, 4, 5], 2);

function f3(end) {
    let i = 1;
    while (i < end) {
        console.log(i);
        i += 2;
    }
}
f3(10);

function f4(end) {
    _.each(console.log, _.rangeL(1, end, 2));
}
f4(10);

// Drawing Stars
const join = sep => _.reduce((a, b) => `${a}${sep}${b}`);

_.go(
    _.rangeL(1, 6),
    _.mapL(_.rangeL),
    _.mapL(_.mapL(_ => '*')),
    _.map(join('')),
    join('\n'),
    console.log
);

// Multiplication table 구구단
_.go(
    _.rangeL(2, 10),
    _.mapL(a => _.go(
        _.rangeL(1, 10),
        _.map(b => `${a} x ${b} = ${a*b}`),
        join('\n')
    )),
    join('\n\n'),
    console.log
);
