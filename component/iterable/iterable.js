// iterable, iterator protocol
const arr = [1, 2, 3];
for (const e of arr) {
    log(e);
}

const set = new Set([1, 2, 3]);
for (const s of set) log(s);

const map = new Map([['a', 1], ['b', 2]]);
for (const m of map) log(m);
for (const m of map.keys()) log(m);
for (const m of map.values()) log(m);
for (const m of map.entries()) log(m);

// custom iterable
const iterable = {
    [Symbol.iterator]() {
        let i = 3;
        return {
            next() {
                return i == 0 ? { value: undefined, done: true } :  { value: i--, done: false};
            },
            [Symbol.iterator]() { return this; }
        }
    }
};
let iterator = iterable[Symbol.iterator]();
log(iterator.next());
for (const it of iterator) log(it);

// document.querySelectorAll iterable
let all = document.querySelectorAll('*');
for (const a of all) log(a);
let allIterator = all[Symbol.iterator]();
log(allIterator.next())

// spread operator
log([...arr, ...map, ...all])