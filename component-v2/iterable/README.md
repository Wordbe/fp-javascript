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

# 객체(Javascript Object)를 이터러블 프로그래밍으로 다루기

- 어떠한 값이든 이터러블 프로그래밍을 사용한다.

  → 어떤 제너레이터든 이터레이터로 만들어서 이터러블 프로그래밍이 가능하다.

  → 객체도 **제너레이터를 이용해서 이터레이터로 만들어서 이터러블 프로그래밍**한다.

- 제너레이터 함수 안의 코드 한줄 한줄을 '값'으로 사용할 수 있어서 자유도가 높다.

<br />

- runtime 에서 `undefined` 는 최대한 사용하지 않는 것이 좋다.
  - DB에 저장하거나 서버에 전달할 수 없는 값이다.

<br />

# 사용자 정의 객체를 이터러블 프로그래밍으로

- Map, Set 은 자바스크립트에서 사용자 정의된 객체라고 볼 수 있다.
- **객체지향 프로그래밍과 이터러블 프로그래밍을 같이 사용할 수 있다.**
  - 함수형 프로그래밍은 패러다임을 대체하려는 것이 아니라, 언어 자체를 더 편하고 효율적인 표현으로 대체로하려고 한다. 따라서 객체지향 프로그래밍과 같이 사용할 수 있다.

```javascript
class Model {
    constructor(attrs = {}) {
        this._attrs = attrs;
    }

    get(k) {
        return this._attrs[k];
    }

    set(k, v) {
        this._attrs[k] = v;
        return this;
    }
}

class Collection {
    constructor(models = []) {
        this._models = models;
    }

    at(idx) {
        return this._models[idx];
    }

    add(model) {
        this._models.push(model);
        return this;
    }

    *[Symbol.iterator]() {
        yield *this._models;
    }
}

const coll = new Collection();
coll.add(new Model({ id: 1, name: 'AA' }));
coll.add(new Model({ id: 3, name: 'BB' }));
coll.add(new Model({ id: 5, name: 'CC' }));
console.log(coll.at(2).get('name'));
console.log(coll.at(1).get('id'));

_.go(
    coll,
    _.mapL(m => m.get('name')),
    _.each(console.log)
);
```

- `Collection` 을 이터러블로 사용하고싶다면, `[Symbol.iterator]() {}` 프로토콜을 정의해주면 된다.
  - 위 코드는 제너레이터로 정의해주어서 지연 처리가 가능하도록 한다.

```javascript
// Product, Products
class Product extends Model {}
class Products extends Collection {
    totalPrice() {
        return _.go(
            this, // iterable
            _.mapL(p => p.get('price')),
            _.reduce((a, b) => a + b)
        );
    }
}

const products = new Products();
products.add(new Product({ id: 1, price: 10000 }));
console.log(products.totalPrice());
products.add(new Product({ id: 3, price: 25000 }));
console.log(products.totalPrice());
products.add(new Product({ id: 5, price: 35000 }));
console.log(products.totalPrice());
```

- `Model`, `Collection` 을 상속해서 `Product`, `Products` 를 만들어보자.
- `Products` 의 `this` 는 products iterable 을 의미하기 때문에 ( `*[Symbol.iterator]() { }` 을 정의했으므로 가능 )
  - 그대로 이터러블 프로그래밍을 할 수 있다.

<br />

<br />

# 시간을 이터러블로 다루기

- `new Date` 를 말하는 것이 아니라, `delay` 가 된 경우 이터러블의 순서를 제어할 수 있다는 의미
- 여기서 좀 더 나아가면 iterable programming 에서 reactive programming 으로 간다.



```javascript
async function job() {
    const payments = await _.go(
        _.rangeL(1, Infinity),
        _.mapL(Iamport.getPayments),
        _.takeUntilL(({length}) => length < 3),
        _.flat
    );

    console.log(payments);
}
job();
```

- page 단위로 가져온다.
- 결제모듈(Iamport) 에서 결제된 내역 payments 를 가져온다.
- 결제 데이터 있을 때까지 모두 가져온다.
- 하나로 합친다.

