# Asynchronous Concurrency Programming



# Callback, Promise

- Promise 는 대기, 성공, 실패를 다루는 일급값으로 이루어져 있다. 이 것이 callback 과 가장 큰 차이이다.
- 즉 **Promise 는 비동기를 값으로 만든다.**
  - 이 비동기 값이 일급이므로, 함수에 전달될 수 있고, 리턴될 수 있고, 변수에 할당될 수도 있다.



```javascript
function add10(a, callback) {
    setTimeout(() => callback(a + 10), 500);
}

function add20(a) {
    return new Promise(resolve => setTimeout(() => resolve(a + 20), 500));
}

let a = add10(5, res => {
    add10(res, res => {
        add10(res, res => {
            add10(res, res => {
                add10(res, res => {
                    log(res);
                });
            });
        });
    });
});

let b = add20(5)
    .then(add20)
    .then(add20)
    .then(add20)
    .then(add20)
    .then(log);

log(a);
log(b);

// output
undefined
Promise {[[PromiseState]]: 'pending', [[PromiseResult]]: undefined}
```



<br />

## first class 활용

- go1 함수에 분기문을 넣어서 비동기코드와 동기코드 둘 다 다룰 수 있도록 만든다.

```javascript
const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);
const add5 = a => a + 5;
const delay100 = a => new Promise(resolve => setTimeout(() => resolve(a), 100));

go1(go1(10, add5), log);
go1(go1(delay100(10), add5), log);
```

- 그러면 위와 같이, 동기든 비동기든 같은 형태를 유지하며 같은 기능을 하는 함수를 실행할 수 있다.

<br />

## 함수 합성과 합성 관점에서의 Promise 모나드

- **Monad 로 함수 합성을 안전하게 할 수 있다.**
  - 값이 들어오는 지 알 수 없을 때 안전하게 함수를 합성한다.
  - 값이 들어오지 않는 경우 함수를 실행시키지 않는다. → 따라서 외부에 영향을 주는 효과가 나타나지 않는다.
- Promise 모나드는 비동기를 안전하게 합성하여 다루게 도와준다.
- js 에서 모나드 객체는 없지만, array 나 Promise 에서 모나드 개념을 알 수 있다.

```javascript
const f = a => a * a;
const g = a => a + 1;
const delay100 = a => new Promise(resolve => setTimeout(() => resolve(a), 100));

log(f(g(1))); // 4
log(f(g())); // NaN

[1].map(g).map(f).forEach(r => log(r)); // 4
[].map(g).map(f).forEach(r => log(r)); // no output

Promise.resolve(1).then(g).then(f).then(r => log(r)); // 4
delay100(1).then(g).then(f).then(r => log(r)); // 4 after 100ms
```

- 먼저 `f(g(x))` 처럼 바로 함수를 합성해서 실행하는 경우, x 에 값이 들어오지 않으면 `NaN` , 즉 원하지 않는 결과가 출력된다.
- 하지만 값을 박스(배열)에 담아 `map` 을 이용해 함수를 순차적으로 실행하면 (합성하면), 박스 안에 값이 없는 경우 다음 `map` 이 실행되지 않으므로, 안전하게 합성함수를 만들 수 있다.
- 이와 비슷하게 `Promise` 는 순차적으로 `then` 을 실행시키며 (합성하며) 결과를 출력한다. 각각 동기적으로 진행될 때와 비동기적으로 진행될 때 같은 패턴을 사용하며, 둘 다 안전하게 합성함수가 잘 실행된다.

<br />

## Kleisli Composition 관점에서의 Promise

- 중간 연산에서 오류가 있을 경우의 처리 `catch` 로 잡아 오류를 내지 않고, 대신 다르게 처리한다.
  - `Promise.reject()` 사용

```javascript
const users = [
    { id: 1, name: 'aa' },
    { id: 2, name: 'bb' },
    { id: 3, name: 'cc' },
];
const getUserById = id => 
    find(u => u.id == id, users) || Promise.reject('Nothing');

const f = ({name}) => name;
const g = getUserById;
// const fg = id => f(g(id)); // 이렇게 하면 g 가 에러가 났을 경우 처리 불가
const fg = id => Promise.resolve(id)
    .then(g)
    .then(f)
    .catch(reject => reject);

users.pop();
fg(3).then(log); // Nothing
```

<br />

## promise.then 중요 규칙

- 여러 개의 Promise 가 중첩되어있더라도, `.then` 한 번으로 결과를 꺼내어 사용할 수 있다.



<br />

---

## Lazy Evalution + Promise : L.map, map, take

- 일반 값과 Promise 값이 섞여 진행되는 함수들에서, 문제없이 함수가 실행될 수 있도록 `L.map` 과 `take` 를 변경해본다.

```javascript
const goThen = (a, f) => a instanceof Promise ? a.then(f) : f(a);

L.map = curry(function *(f, iter) {
    for (const a of iter) yield goThen(a, f);
});

const take = curry((l, iter) => {
    let res = [];
    iter = iter[Symbol.iterator]();
    return function recur() {
        let cur;
        while (!(cur = iter.next()).done) {
            const a = cur.value;
            if (a instanceof Promise) 
                return a.then(a => (res.push(a), res).length == l ? res : recur());

            res.push(a);
            if (res.length == l) return res;
        }
        return res;
    } ();
});
```

- `goThen` 함수는 프로미스가 들어오면 `then` 을 실행해주고, 아니면 `f(a)` 를 그대로 실행해준다.
- `L.map` 을 보면 `goThen` 을 사용해 프로미스, 일반 값 둘 다 사용할 수 있도록 했다.
- `take` 함수를 보면, `recur` 함수를 작성해서, 내부 분기문에 `Promise` 값이 들어오는 경우, `then` 을 호출하면서, 재귀 호출을 하고 있다.

```javascript
go(
    [1, 2, 3],
    L.map(a => a + 10),
    take(2),
    log
);
go(
    [1, 2, 3],
    L.map(a => Promise.resolve(a + 10)),
    take(2),
    log
);
go(
    [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
    L.map(a => a + 10),
    take(2),
    log
);
go(
    [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
    L.map(a => Promise.resolve(a + 10)),
    take(2),
    log
);

// output
(2) [11, 12]
(2) [11, 12]
(2) [11, 12]
(2) [11, 12]
```

- 4 가지 케이스 모두 성공적으로 작동한다.

<br />

## Kleisli Composition : L.filter, filter, nop, take

```javascript
const nop = Symbol('nop');

L.filter = curry(function *(f, iter) {
    for (const a of iter) {
        const fa = goThen(a, f);
        if (fa instanceof Promise) {
            yield fa.then(fa => fa ? a : Promise.reject(nop));
        }
        else if (fa) yield a;
    }
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
```

- filter 함수에서 필터링 결과(fa)가 Promise 이고, 참이면 그대로 값(a, 이 때는 Promise 객체이다.)을 반환하고, 그렇지 않다면 `Promise.reject()` 에 우리가 의도한 상황임을 뜻하는 `nop` 심볼을 담는다. 이렇게 되면 `catch` 할 때 `nop` 인지 여부를 판단해 원하는 처리를 할 수 있다.
- take 함수도 `catch` 부분을 추가한다.

```javascript
go(
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    map(a => Promise.resolve(a * a)),
    filter(a => a % 2),
    log
);

go(
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    L.map(a => Promise.resolve(a * a)),
    L.filter(a => a % 2),
    take(4),
    log
);

// output
(5) [1, 9, 25, 49, 81]
(4) [1, 9, 25, 49]
```

합성함수에서 중간에 에러가 난 경우는, 이 후에 영향을 미치지 않고 따로 처리할 수 있도록 `Promise.reject` 와 `catch` 를 사용한다.

- `Promise.reject` 이 발생하면 중간 `then` 을 모두 무시하고, 바로 `catch` 코드로 넘어간다.
- 이로써 `L.map`, 비동기 동시성과 지연 평가를 모두 지원하는 코드로 변경되었다.

<br />

<br />

## reduce 에서 nop 지원

```javascript
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
```

- reduce 는 2개의 값(**acc, cur**)을 받아서, 전달 받은 함수를 실행시킨다.
  - 이 두 변수가 타입이 다를 경우 원하지 않는 결과가 나오므로, 타입에 관계없이 원하는 결과를 반환하도록 만들어본다.

<br />

<br />

## 지연된 함수열을 병렬적으로 평가하기 : C.reduce, C.take

- I/O 작업, 외부 요청 작업 등에 대해 병렬적으로 구성하면 효율적이다.
- `C` 맵에 동시성을 높여 진행되도록 하는 `[...iter]` 로직을 담아 병렬처리가 되는 코드로 변경한다.

```javascript
// Concurrency
const C = {};
const noop = () => {}; // no opreation function
const catchNoop = arr =>
    (arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);

C.reduce = curry((f, acc, iter) => {
    const cIter = catchNoop(iter ? [...iter] : [...acc]);
    return iter ? 
        reduce(f, acc, [...cIter]) :
        reduce(f, [...cIter]);
});

C.take = curry((l, iter) => take(l, catchNoop([...iter])));

const delay500 = a => new Promise(resolve => setTimeout(() => resolve(a), 500));

console.time('');
go([1, 2, 3, 4, 5, 6, 7, 8, 9],
    L.map(a => delay500(a * a)),
    L.filter(a => delay500(a % 2)),
    C.take(2),
    C.reduce(add),
    log,
    _ => console.timeEnd('')
);

// output
10
: 1008.380859375 ms
```

<br />

## 즉시 병렬적으로 평가하기 : C.map, C.filter

- 모두 엄격하게 평가할 것인지,
- 지연 평가하여 꼭 필요한 연산만 할 것인지
- CPU 부하는 있더라도, 빠른 연산을 위해 병렬 연산을 할 것인지 섞어서 사용 가능

<br />

## async, await

- async 가 붙은 함수는 `Promise` 를 리턴한다. 즉, 즉시 평가되지 않는다.
- 따라서 결과값을 보려면 `Promise.then` 처리를 해주어야 한다. `await` 문법은 `Promise` 에 대해 즉시 평가해주는 문법이다.

```javascript
const delay = a => new Promise(resolve =>setTimeout(() => resolve(a), 500));

const f1 = async () => {
    const a = await delay(10);
    const b = await delay(20);

    return a + b;
}

f1().then(log); // 30
```

<br /><br />

`Array.prototype.map` 보다 FxJS `map` 이 다형성 높은 함수이다. 아래 예제를 보자.

```javascript
async function f2() {
    const list = [1, 2, 3, 4];
    const temp = list.map(async a => await delay(a * a));
    log(temp); // (4) [Promise, Promise, Promise, Promise]
    const res = await temp;
    log(res); // (4) [Promise, Promise, Promise, Promise]
}
f2();

async function f3() {
    const list = [1, 2, 3, 4];
    const temp = map(a => delay(a * a), list);
    log(temp); // Promise {[[PromiseState]]: 'pending', [[PromiseResult]]: undefined}
    const res = await temp;
    log(res); // (4) [1, 4, 9, 16]
}
f3();
```

- `list.map` 은 Promise 가 담긴 배열을 리턴한다. 반면, `map` 은 Promise 를 리턴한다. 따라서 `await` 에서 평가가 가능하다.

<br />

## Pipeline vs async:await

목적이 다르다.

- 비동기코드, 동기코드든 상관없이 pipeline 은 함수를 조합하고, 가독성 좋게 유지보수하기 좋은(쉽고 안전한) 코드를 만들기 위함이다.
  - 읽기가 쉽다.
  - 안정적일 것이라 기대할 수 있다.
  - 기능 변경이 용이하다.
- async:await 는 비동기 코드를 동기코드처럼 쉽게 사용할 수 있도록 하기 위함이다.
  - 절차형에서 비동기 코드를 좀 더 잘쓰게 하기 위함.
  - pipeline 을 이 방식으로 하려면 읽기 어려운 코드가 됨.
  - 개발자마다 구현방식도 다르므로 안정성도 떨어져 테스트하기도 어렵게 됨
  - 기능 변경시 매우 복잡함.

```javascript
const arr = [1, 2, 3, 4, 5, 6, 7, 8];

function f5(list) {
    return go(list,
        L.map(a => delay(a * a)),
        L.filter(a => delay(a % 2)),
        L.map(a => delay(a + 1)),
        take(3),
        reduce((a, b) => delay(a + b)),
    )
}

go(f5(arr), log);


async function f6(list) {
    let temp = [];
    for (const a of list) {
        const b = await delay(a * a);
        if (await delay(b % 2)) {
            const c = await delay(b + 1);
            temp.push(c);
            if (temp.length == 3) break;      
        }
    }
    let res = temp[0], i = 0;
    while (++i < temp.length) {
        res = await delay(res + temp[i]);
    }
    return res;
}

f6(arr).then(log);
```

<br />

## 비동기 에러핸들링

- 비동기 에러핸들링을 위해 `Promise.reject` 로 나온 에러를 `await` 으로 받아주고 이것을 `try ~ catch` 로 감싸주면 된다.
- pipeline 코드는 Kleisli composition 으로 중간에 에러가나면 결국 `Promise.reject` 를 내보내도록 코딩이 되어있으므로, 비동기 에러핸들링이 용이하다.

```javascript
async function f9(list) {
  try {
    return await go(
      list,
      map(a => JSON.parse(a)),
      filter(a => a % 2),
      take(2)
    );
  } catch (e) {
    log('[f9 ERROR]', e);
    return [];
  }
}

f9(['0', '1', '2', '3', '4', '{'])
  .then(a => log('f9', a))
  .catch(e => log('DO NOT reach here', e));

// output
[f9 ERROR] SyntaxError: Expected property name or '}' in JSON at position 1
    ...
{stack: 'SyntaxError: Expected property name or '}' in…p-javascript/component/common/common.js:17:5)', message: 'Expected property name or '}' in JSON at position 1'}

f9 (0) []
```



