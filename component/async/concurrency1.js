// callback, promise
function callback_promise() {
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
    log(a);

    let b = add20(5)
        .then(add20)
        .then(add20)
        .then(add20)
        .then(add20)
        .then(log);
        log(b);
}

// first class
function first_class() {
    const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);
    const add5 = a => a + 5;
    const delay100 = a => new Promise(resolve => setTimeout(() => resolve(a), 100));
    
    go1(go1(10, add5), log);
    go1(go1(delay100(10), add5), log);
}

// Monad, Promise Monad
function monad() {
    const f = a => a * a;
    const g = a => a + 1;
    
    log(f(g(1)));
    log(f(g()));
    
    [1].map(g).map(f).forEach(r => log(r));
    [].map(g).map(f).forEach(r => log(r));
    
    Promise.resolve(1).then(g).then(f).then(r => log(r));
    delay100(1).then(g).then(f).then(r => log(r));    
}

// Promise from the perspective of Kleisli Composition
function kleisli_composition() {
    const users = [
        { id: 1, name: 'aa' },
        { id: 2, name: 'bb' },
        { id: 3, name: 'cc' },
    ];
    const getUserById = id => 
        find(u => u.id == id, users) || Promise.reject('Nothing');
    
    const f = ({name}) => name;
    const g = getUserById;
    // const fg = id => f(g(id));
    const fg = id => Promise.resolve(id)
        .then(g)
        .then(f)
        .catch(reject => reject);
    
    fg(3).then(log);
    users.pop();
}

// control asynchronization in go, pipe, reduce
go(
    Promise.resolve(1),
    a => a + 10,
    a => Promise.reject(a + 100),
    a => a + 1000,
    log
).catch(a => log(a));

// promise.then
Promise.resolve(Promise.resolve(1)).then(a => log(a));
new Promise(resolve => resolve(new Promise(resolve => resolve(1)))).then(log);
