// Reinterpretation of range and take
function range_take() {
    _.go(
        _.range(10), // 0 ~ 9 까지 배열
        _.take(3), // 앞에서부터 3개만 자르기
        _.each(console.log)
    );
    
    _.go(
        _.rangeL(10), // 0 ~ 9 까지 이터러블, 최대 10번 일어날 일
        _.mapL(_.delay(500)),
        _.takeL(3), // 최대 3개 값이 필요하고, 최대 3번의 일을 수행
        _.each(console.log)
    );
}

// takeWhile, takeUntil
function takeWhile_takeUntil() {
    const dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0];
    _.go(
        dummy,
        _.takeWhile(a => a),
        _.each(console.log)
    );
    
    _.go(
        [0, false, undefined, null, 10, 20, 30],
        _.takeUntil(a => a),
        _.each(console.log)
    );
}

// Car race
function carRace() {
    const track = [
        { cars: ['철수', '영희', '철희', '영수'] },
        { cars: ['하든', '커리', '듀란트', '탐슨'] },
        { cars: ['폴', '어빙', '릴라드', '맥컬럼'] },
        { cars: ['스파이더맨', '아이언맨'] },
        { cars: [] },
    ];
    
    _.go(
        _.rangeL(Infinity),
        _.mapL(i => track[i]),
        _.mapL(({cars}) => cars),
        _.mapL(_.delay(500)),
        _.takeWhileL(({length: l}) => l == 4),
        _.flatL,
        _.mapL(car => `${car} 출발!`),
        _.each(console.log)
    );
}

// Iamport
const Iamport = {
    payment: {
        1: [
            { imp_id: 11, order_id: 1, amount: 15000 },
            { imp_id: 12, order_id: 2, amount: 25000 },
            { imp_id: 13, order_id: 3, amount: 10000 },
        ],
        2: [
            { imp_id: 14, order_id: 4, amount: 25000 },
            { imp_id: 15, order_id: 5, amount: 45000 },
            { imp_id: 16, order_id: 6, amount: 15000 },
        ],
        3: [
            { imp_id: 17, order_id: 7, amount: 20000 },
            { imp_id: 18, order_id: 8, amount: 30000 },
        ],
        4: [],
        5: [],
    },
    getPayments: page => {
        console.log(`https://12.29.23.28?page=${page}`);
        return _.delay(500, Iamport.payment[page]);
    },
    cancelPayment: imp_id => Promise.resolve(`${imp_id}: 취소완료`)
};

const Db = {
    getOrders: ids => _.delay(100, [
        { id: 1 },
        { id: 3 },
        { id: 7 }
    ])
};

async function job() {
    // Completed payments from Iamport
    const payments = await _.go(
        _.rangeL(1, Infinity),
        _.mapL(Iamport.getPayments),
        _.takeUntilL(({length}) => length < 3),
        _.flat
    );

    // Order ids from database that matches the completed payments
    const order_ids = await _.go(
        payments,
        _.map(p => p.order_id),
        Db.getOrders,
        _.map(({id}) => id)
    );

    // Cancel payments that don't match the order ids.
    await _.go(
        payments,
        _.rejectL(p => order_ids.includes(p.order_id)),
        _.mapL(p => p.imp_id),
        _.mapL(Iamport.cancelPayment),
        _.each(console.log)
    );
}

// Scheduler
// Execute jobs every 7 seconds. If jobs() takes more than 7 seconds, wait jobs().
(function recur() {
    Promise.all([
        _.delay(7000, undefined),
        job()
    ]).then(recur);
}) ();
