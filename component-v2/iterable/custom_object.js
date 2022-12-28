// Map, Set, NodeList
let m = new Map();
m.set('a', 1);
m.set('b', 2);
m.set('c', 3);

_.go(
    m,
    _.filterL(([k, v]) => v % 2),
    _.takeAll,
    entries => new Map(entries),
    console.log
);

let s = new Set();
s.add(10);
s.add(20);
s.add(30);
const add = (a, b) => a + b;
console.log(_.reduce(add, s));

let nodeList = document.querySelectorAll('*');
console.log(nodeList[Symbol.iterator]());
console.log(_.map(n => n.nodeName, nodeList));

// Model, Collection class
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
    _.each(m => m.set('name', m.get('name').toLowerCase()))
);

_.go(
    coll,
    _.mapL(m => m.get('name')),
    _.each(console.log)
);

// Product, Products
class Product extends Model {}
class Products extends Collection {
    prices() {
        return _.map(p => p.get('price'), this);
    }

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
console.log(products.prices());
