const users = [
    { name: 'A', age: 35 },
    { name: 'B', age: 26 },
    { name: 'C', age: 28 },
    { name: 'D', age: 34 },
    { name: 'E', age: 23 },
];

console.log(
    _.reduce((acc, u) => acc + u.age, 0, users)
);

const add = (a, b) => a + b;
const ages = _.mapL(u => u.age);
console.log(
    _.reduce(add, ages(users))
);

const obj = {
    page: 0,
    size: 10,
    a: undefined,
    type: 'PAY'
};

function queryString1(obj) {
    let res = '';
    for (const k in obj) {
        const v = obj[k];
        if (v === undefined) continue;
        if (res != '') res += '&';
        res += k + '=' + v;
    }
    return res;
}
console.log(queryString1(obj));

function queryString2(obj) {
    return Object.entries(obj)
        .reduce((query, [k, v], i) => {
            if (v === undefined) return query;
            return `${query}${i > 0 ? '&' : ''}${k}=${v}`;
        }, '');
}
console.log(queryString2(obj));

const join = _.curry((sep, iter) => _.reduce((a, b) => `${a}${sep}${b}`, iter));
const queryString3 = obj =>
    join('&',
        _.map(([k, v]) => `${k}=${v}`,
            _.reject(([_, v]) => v === undefined,
                Object.entries(obj))));
console.log(queryString3(obj));

const queryString4 = _.pipe(
    Object.entries,
    _.rejectL(([_, v]) => v === undefined),
    _.mapL(join('=')),
    join('&')
);
console.log(queryString4(obj));

const split = _.curry((sep, str) => str.split(sep));
const queryStringToObject = _.pipe(
    split('&'),
    _.map(split('=')),
    _.map(([k, v]) => ({ [k]: v })),
    _.reduce(Object.assign)
);
console.log(queryStringToObject('page=0&size=10&type=PAY'));

// Safe Composition
const f = x => x + 10;
const g = x => x - 5;
const fg = x => f(g(x));

_.go(
    10,
    fg,
    console.log
);

// Use map, it is safer
_.go(
    [10],
    _.mapL(fg),
    _.each(console.log)
);

// Use filter instead of find
const user = _.find(u => u.name =='F', users);
if (user) console.log(user); // handle undefined

_.go(
    users,
    _.filterL(u => u.name == 'F'),
    _.takeL(1),
    _.each(console.log)
);
