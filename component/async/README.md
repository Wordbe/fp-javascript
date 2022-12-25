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



