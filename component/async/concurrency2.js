// Lazy evalution + Promise : L.map, map, take
function promise_lmap_take() {
    go([1, 2, 3],
        L.map(a => a + 10),
        take(2),
        log
    );
    go([1, 2, 3],
        L.map(a => Promise.resolve(a + 10)),
        take(2),
        log
    );
    go([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
        L.map(a => a + 10),
        take(2),
        log
    );
    go([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
        L.map(a => Promise.resolve(a + 10)),
        take(2),
        log
    );

    go([1, 2, 3],
        map(a => a + 10),
        log
    );
    go([1, 2, 3],
        map(a => Promise.resolve(a + 10)),
        log
    );
    go([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
        map(a => a + 10),
        log
    );
    go([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
        map(a => Promise.resolve(a + 10)),
        log
    );
}

function kleisli_composition_filter() {
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
}

const add = (a, b) => a + b;

function reduce_lazyevalutation_promise_efficiency() {
    go([1, 2, 3, 4, 5],
        L.map(a => Promise.resolve(a * a)),
        L.filter(a => Promise.resolve(a % 2)),
        reduce(add),
        log
    );
    
    go([1, 2, 3, 4, 5],
        L.map(a => new Promise(resolve => setTimeout(() => resolve(a * a), 1000))),
        L.filter(a => new Promise(resolve => setTimeout(() => resolve(a % 2), 1000))),
        take(2),
        log
    );
}

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
