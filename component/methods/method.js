// There are defined functions in common.js: map, filter, reduce, go, pipe, curry, ...
log(...map(p => p.name, products));
log(...filter(p => p.price >= 20000, products));
log(reduce((acc, p) => acc + p.price, 0, products));

// go
go(0, a => a + 1, a => a + 10, a => a + 100, log);

// pipe
const add = (a, b) => a + b;
const f = pipe(
    add,
    a => a + 10,
    a => a + 100
);
log(f(0, 1));

// More readable code with go
go(
    products,
    products => filter(p => p.price < 20000, products),
    products => map(p => p.price, products),
    prices => reduce(add, prices),
    log,
);

// More readable code with curry
go(
    products,
    products => filter(p => p.price < 20000)(products),
    products => map(p => p.price)(products),
    products => reduce(add)(products),
    log,
);

go(
    products,
    filter(p => p.price < 20000),
    map(p => p.price),
    reduce(add),
    log,
);

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
