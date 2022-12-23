// queryStr 예제
const queryStr = obj => go(
    obj,
    Object.entries,
    map(([k, v]) => `${k}=${v}`),
    reduce((a, b) => `${a}&${b}`)
);

log(queryStr({ limit: 10, offset: 10, type: 'notice' }));
