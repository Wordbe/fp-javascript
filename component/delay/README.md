# 지연성

 

## 느긋한 range

generator 를 사용해서 평가가 필요한 시점에 값을 순회하는 리스트를 만들어보자.

```javascript
const add = (a, b) => a + b;

// 1)
const range = length => {
    let i = -1;
    let res = [];
    while (++i < length) {
        res.push(i);
    }
    return res;
}

let list = range(4);
log(list);
log(reduce(add, list));

// 2) Lazy Loading L.range
const L = {};
L.range = function *(l) {
    let i = -1;
    while(++i < l) {
        yield i;
    }
}

let l_list = L.range(4);
log(l_list);
log(reduce(add, l_list));

// output
(4) [0, 1, 2, 3]
6
L.range {[[GeneratorState]]: 'suspended'}
6
```

- L.range 를 출력하면 제너레이터상태가 `suspended` 인 함수가 나온다.

<br />

## 느긋한 range test

`reduce` 내부 로직에서 iter 를 인자로 주지않으면 `acc` 변수를 이터레이터로 변환하는 과정이 있는데, `iter = acc[Symbol.iterator]();` 와 같은 코드가 동작한다. 여기서 1) 번 로직은 배열을 이터레이터로 바꾸는 반면, 2) 번 로직은 이터레이터 자기 자신을 바로 리턴하기 때문에 성능상 조금 더 효율적인 이점이 생긴다. 이를 테스트 해보자.

(내 PC에서 테스트해보니까 1번이 더 빨랐다.. 이상하다)

<br />

## take

```javascript
const take = curry((l, iter) => {
    let res = [];
    for (const a of iter) {
        res.push(a);
        if (res.length == l) return res;
    }
    return res;
});

console.time('');
go(
    range(10000),
    take(5),
    log
)
console.timeEnd('');

console.time('');
go(
    L.range(Infinity),
    take(5),
    log
)
console.timeEnd('');

// output
(5) [0, 1, 2, 3, 4]
: 0.289794921875 ms
(5) [0, 1, 2, 3, 4]
: 0.0947265625 ms
```

- range 는 10,000 개의 요소를 가진 배열을 모두 만들고 5개만 취하지만, `L.range` 는 5개만 만들고 바로 리턴하므로 (나머지 요소를 만드는 것은 지연시킴) 연산의 효율이 좋다.

<br />

## 제너레이터/이터레이터 프로토콜로 구현하는 지연 평가

- Lazy Evaluation
- 값을 만드는 것을 최소화하고, 필요할 때마다 값을 취해 최소한의 연산을 한다. 지연 평가는 곧 영리한 연산이다.



**common.js**

```javascript
// Lazy Functions
const L = {};

L.map = function *(f, iter) {
    for (const a of iter) yield f(a);
};

L.filter = function *(f, iter) {
    for (const a of iter) if (f(a)) yield a;
}
```

```javascript
// map
let it = L.map(a => a + 10, [1, 2, 3]);
log(it.next());
log(it.next());
log(it.next());

// filter
let it2 = L.filter(a => a % 2, [1, 2, 3, 4]);
log(it2.next());
log(it2.next());
log(it2.next());
```



## range, map, filter, take, reduce 중첩 사용

디버깅 준비

```javascript
const reduce = curry((f, acc, iter) => {
  iter = acc[Symbol.iterator]();
  if (!iter) {
    acc = iter.next().value;
  }
  
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    acc = f(acc, a);
  }
  return acc;
});
```

- `for (const a of iter)` 를 위와 같이 조금 더 상세한 코드로 고친다. 동작 결과는 같고, 디버깅 할 때 조금 더 동작 과정을 자세히 보기 위함이다.
- `reduce` 의 경우 2~5 번 라인과 같이 약간 코드를 수정해준다.

<br />

```javascript
go(
    range(10),
    map(a => a + 10),
    filter(a => a % 2 == 1),
    take(2),
    log
);
```

- [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] 배열(이터러블)을 만들고,
- map 에서는 위 배열을 이터레이터로 바꾸어 [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] 변환하여 반환한다.
- filter 에서도 위 배열을 이터레이터로 바꾸어 [11, 13, 15, 17, 19] 로 걸러 반환하고,
- take 에서도 위 배열을 이터레이터로 바꾸어 [11, 13] 만 남아 출력된다.

```javascript
go(
    L.range(10),
    L.map(a => a + 10),
    L.filter(a => a % 2),
    take(2),
    log
);
```

반면 위 lazy 함수들을 사용하면 결과가 아래와 같다.

- range, map, filter 는 평가를 미루다가 take 함수가 첫번째로 실행됨
- take 에서 filter 가준 iterater 의 next() 함수를 호출하는 순간 filter 실행.
- 순차적으로 map, range 실행, range 가 0 을 반환
- range 0 → map 10 → filter false → range 1 → map 11 → filter true → take 결과 배열에 11을 담음
- range 2 → map 12 → filter false → range 3 → map 13 → filter true → take 결과 배열에 13을 담고 반환



> - map, filter 계열의 함수들은 결합법칙이 성립해서, 순서 상관없이 같은 결과를 낼 수 있다.
> - reduce, take 계열의 함수들은 최종적인 결과를 만드는 함수이다. 이런 함수는 지연성을 가지기 보다는 종결내는 종류의 함수이다.







<br />

<br />

<br />

<br />

<br />