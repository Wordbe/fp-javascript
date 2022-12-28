// async:await
const delay = a => new Promise(resolve =>setTimeout(() => resolve(a), 500));

function async_await() {
    const f1 = async () => {
        const a = await delay(10);
        const b = await delay(20);
    
        return a + b;
    }
    
    f1().then(log);
    (async () => {
        log(await f1());
    }) ();
}

// Why FxJS map needed instead of Array.prototype.map
function maps() {
    async function f2() {
        const list = [1, 2, 3, 4];
        const temp = list.map(async a => await delay(a * a));
        log(temp);
        const res = await temp;
        log(res);
    }
    f2();
    
    async function f3() {
        const list = [1, 2, 3, 4];
        const temp = map(a => delay(a * a), list);
        log(temp);
        const res = await temp;
        log(res);
    }
    f3();
}

// Pipeline vs async:await
function pipeline_vs_asyncawait() {
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
}

function asynchronous_error_handling() {
    async function f9(list) {
        try {
            return await go(
                list,
                map(a => JSON.parse(a)),
                filter(a => a.age > 20),
                map(a => a.age),
                take(2)
            );
        } catch (e) {
            log('[f9 ERROR]', e);
            return [];
        }
    }
    
    f9(['{ "age": 24 }', '{ "age": 19 }', '{ "age": 25 }', '{'])
        .then(a => log('f9', a))
        .catch(e => log('DO NOT reach here', e));
}
