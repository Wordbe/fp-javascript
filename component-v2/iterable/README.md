# Iterable Programming (Lisp, List Processing)

명령형 문법을 이터러블 문법으로 변경

- if 를 `filter` 로
- 값 변화 후 변수 할당을 `map` 으로
- break 를 `take` 로
- 축약 및 합산을 `reduce` 로
- while 을 `range` 로
- (부수)효과를 `each` 로

<br />

# 명령형 습관 지우기

- `reduce` 는 만능이 아니다.
- `map` 과 `redcue` 를 조합해서 만드는 것이 더 가독성 좋고, 재사용성이 좋다.
  - `reduce` 에서 받는 두 인자  `acc` 과 `cur` 가 같은 값이면,  다른 인자로 초깃값 `acc` 을 주지 않아도 된다.
  - `reduce` + 복잡한 함수 + `acc` 으로 만드는 것보다 낫다.

```javascript
console.log(
    _.reduce((acc, u) => acc + u.age, 0, users)
);

// vs

const add = (a, b) => a + b;
const ages = _.mapL(u => u.age);
console.log(
    _.reduce(add, ages(users))
);
```

- add, ages 는 재사용이 기대되는 반면, `(acc, u) => acc + u.age` 는 그렇지 않다.

<br />

- `reduce` 하나 안에서 if 로직을 넣어 다 처리하는 것보다, 잘게 쪼개서 `map`, `filter`, `reduce` 를 조합해 사용하는 것이 더 가독성, 재사용성, 유지보수성이 좋다.



```javascript
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

...

const join = _.curry((sep, iter) => _.reduce((a, b) => `${a}${sep}${b}`, iter));const queryString4 = _.pipe(
    Object.entries,
    _.rejectL(([_, v]) => v === undefined),
    _.mapL(join('=')),
    join('&')
);
console.log(queryString4(obj));
```

<br />

- 작은 문제는 큰 문제보다 해결하기 쉽다.
- 문제를 쪼개서 빠르게 조합해 나가는 프로그래밍이 바람직하다.

<br />

# 객체를 이터러블 프로그래밍으로 다루기



