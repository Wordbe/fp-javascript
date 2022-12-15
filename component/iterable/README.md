# iterable / iterator protocol

<br />

## Iteratable, Iterator

```javascript
const log = console.log;


const arr = [1, 2, 3];
for (const e of arr) {
    log(e);
}

const set = new Set([1, 2, 3])
for (const s of set) log(s)

const map = new Map([['a', 1], ['b', 2]])
for (const m of map) log(m)
for (const m of map.keys()) log(m)
for (const m of map.values()) log(m)
for (const m of map.entries()) log(m)
```

- iterable : 이터레이터를 리턴하는 `[Symbol.iterator]()` 를 가진 값
  - `arr[Symbol.iterator]()` 는 이터레이터를 리턴한다. (`Array Iterator {}`)
  - array, set, map 은 각각 이터러블이다.
- iterator : `{value, done}` 객체를 리턴하는 `next()` 를 가진 값
  - 이터러블로부터 반환된 이터레이터는 `next()` 메소드 사용 가능
- iterator / iterator protocol : 이터러블을 `for ... of`, 전개 연산자 등과 함께 동작하도록한 규약

```shell
# map output results
iterable.js:13 (2) ['a', 1]
iterable.js:13 (2) ['b', 2]
iterable.js:14 a
iterable.js:14 b
iterable.js:15 1
iterable.js:15 2
iterable.js:16 (2) ['a', 1]
iterable.js:16 (2) ['b', 2]
```

<br />

## Custom Iterable

잘 정의된 이터러블(Well-formed iterable)은 두 가지로 만족하도록 만들면된다.

- `[Symbol.iterator]()` 가 이터레이터를 반환하도록 한다.
- 반환된 이터레이터는 자신을 반환하는 이터러블이 되도록한다.

```javascript
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
```

<br />

<br />

추가로, DOM 에서 모든 tag 를 찾는 `querySelectorAll` 도 이터러블 프로토콜을 따른다. (`Symbol.iterator` 가 구현되어 있다.)

```javascript
let all = document.querySelectorAll('*');
for (const a of all) log(a);
let allIterator = all[Symbol.iterator]();
log(allIterator.next());
```

<br />

## 전개 연산자

이터러블 프로토콜을 따르는 이터러블이라면, `...` 를 통해 그 안의 요소들을 바로 펼쳐서 사용하는 문법을 사용할 수 있다.

```javascript
log([...arr, ...map, ...all]);
```

<br />

# Generator

- 제너레이터의 `yield` 를 통해 이터러블이 담는 값을 만들 수 있다.
- `return` 값은 이터러블에 담기지 않는다.

```javascript
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
```

<br />

## 구조분해, 나머지 연산자

```javascript
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

const [head, ...tail] = odds(5);
const [first, second, ...rest] = odds(10);
log(head, tail); 
log(first, second, rest);

// () 안의 값은 마지막 이터러블의 길이를 의미
// 1 (2) [3, 5]
// 1 3 (3) [5, 7, 9]
```

- 제너레이터는 이터러블을 리턴한다. 이는 이터레이터 프로토콜이 담긴 well-formed 이터러블을 반환한다.
- `inf()` :  제너레이터로 무한수열을 만들 수 있다. `next()` 메소드가 호출될 때마다 다음 값을 호출할 수 있다.
- `limit()` : 제한값(l)과 이터러블을 받아서, 제한값까지만 담긴 이터러블을 반환한다.
- `odds()` : 주어진 제한값만큼의 홀수 이터러블을 반환한다.

<br />

<br />

<br />

<br />

<br />

