# map, filter, reduce

```javascript
const map = (f, iter) => {
    res = [];
    for (const it of iter) {
        res.push(f(it));
    }
    return res;
};

const filter = (f, iter) => {
    res = [];
    for (const it of iter) {
        if (f(it)) {
            res.push(it);
        }
    }
    return res;
};

const reduce = (f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const it of iter) {
        acc = f(acc, it)
    }
    return acc;
};
```

- 이터러블에는 기본적으로 map, filter, reduce 가 없다. 그래서 위처럼 만들고 미리 정의해두면 사용 가능하다.
- array (`[]`) 같은 경우에는 기본적으로 map, filter, reduce 프로토콜이 구현되어있다.

<br />

**사용 예시**

```javascript
const products = [
    { name: '반팔티', price: 15000 },
    { name: '긴팔티', price: 20000 },
    { name: '핸드폰케이스', price: 15000 },
    { name: '후드티', price: 30000 },
    { name: '바지', price: 25000 },
];

log(...map(p => p.name, products));
log(...filter(p => p.price >= 20000, products));
log(reduce((acc, p) => acc + p.price, 0, products));

반팔티 긴팔티 핸드폰케이스 후드티 바지
{name: '긴팔티', price: 20000} {name: '후드티', price: 30000} {name: '바지', price: 25000}
105000
```

<br />

<br />

# go, pipe, curry

## go

- go 를 이용해서, 초깃값과 함수들을 인자로 받아 함수들을 순서대로 실행시켜줄 수 있다.
- reduce 함수를 사용해서 사용한 함수들이 누적해서 호출될 수 있도록 만들면 된다.

```javascript
const go = (...args) => reduce((a, f) => f(a), args);
```

go 를 통해 아래와 같이 가독성 좋은 코드를 만들 수 있다.

```javascript
go(
    products,
    products => filter(p => p.price < 20000, products),
    products => map(p => p.price, products),
    prices => reduce(add, prices),
    log,
);
```

<br />

## pipe

- `pipe` 함수를 만들고 `pipe(f1, f2, f3)(0, 1)` 처럼 인자가 들어온다면, 0, 1 이라는 마지막에 들어온 인자들은 f1 에 들어가서 실행되도록 만든 함수이다.
- 함수 여러개를 하나의 파이프라인으로 만들어 놓고, 필요한 시점에 인자들을 대입해서 pipe 안의 모든 함수들을 거친 결과를 얻을 수 있다.

```javascript
const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);
```

```javascript
const add = (a, b) => a + b;
const f = pipe(
    add,
    a => a + 10,
    a => a + 100
);
log(f(0, 1));
```

<br />

## curry

- `curry` 함수는 `curry(f1)` 으로 미리 함수를 담아 만들어 놓았다가, `curry(f1)(a, [1, 2, 3])` 처럼 실행한다.
  - 뒤 이터러블이 있다면 `f(a, ..._)` 처럼 함수를 실행시킨다.
  - 이터러블이 없다면 a 가 적용된 함수를 반환한다. 그리고 다음에 이터러블이 들어오면 사용하면 된다.

```javascript
const curry = f =>
    (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);
```

그래서 아래와 같이 우리가 기존에 사용하던 함수를 curry 로 감싸고 활용해보자.

```javascript
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

go(
    products,
    products => filter(p => p.price < 20000)(products),
    products => map(p => p.price)(products),
    products => reduce(add)(products),
    log,
);

// 아래와 같이 쓰면 더 가독성이 좋아진다.
go(
    products,
    filter(p => p.price < 20000),
    map(p => p.price),
    reduce(add),
    log,
);
```

이제 pipe 를 사용해서 조금 더 재사용성을 늘려보자.

그러면 아래와 같이 간결한 구현이 되었고, 개발자는 아래 함수를 자연스럽게 읽을 수 있다.

```javascript
const total_price = pipe(
    map(p => p.price),
    reduce(add),
);

go(
    products, 
    filter(p => p.price < 20000), 
    total_price, 
    log
);
```

<br />

<br />

<br />

<br />

<br />