// DOM
const $ = {};

$.qs = (selector, parent = document) => parent.querySelector(selector);
$.qsa = (selector, parent = document) => parent.querySelectorAll(selector);

// curry do not support named arguments
$.find = _.curry($.qs);
$.findAll = _.curry($.qsa);

$.el = html => {
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    return wrap.children[0];
};

$.append = _.curry((parent, child) => parent.appendChild(child));

$.closest = _.curry((sel, el) => el.closest(sel));

$.remove = el => el.parentNode.removeChild(el);

$.on = (event, f) => els =>
    _.each(el => el.addEventListener(event, f), _.isIterable(els) ? els : [els]);

$.addClass = _.curry((name, el) => el.classList.add(name));

// Concurrency
C = {}

_.groupBySize = _.curry((size, iter) => {
    let r = _.rangeL(Infinity);
    return _.groupBy(_ => Math.floor(r.next().value / size), iter);
});

C.takeAllWithLimit = _.curry((limit = Infinity, iter) => _.go(
    iter,
    _.groupBySize(limit),
    _.valuesL,
    _.mapL(_.mapL(f => f())),
    _.mapL(_.takeAllC))
);

// Images
const Images = {};

Images.fetch = () => new Promise(resolve => setTimeout(() => resolve(images), 200));

const strConcat = iter => _.reduce((a, b) => `${a}${b}`, iter);

_.strMap = _.curry(_.pipe(_.mapL, strConcat));

Images.template = imgs => `
    <div class="images">
    ${_.strMap(img => `
        <div class="image">
            <div class="box"><img src="" lazy-src="${img.url}" class="fade" alt=""></div>
            <div class="name">${img.name}</div>
            <div class="remove">x</div>
        </div>
    `, imgs)}
    </div>
`;

Images.load = limit => _.tap(
    $.findAll('img'),
    _.mapL(img => _ => new Promise(resolve => {
        img.onload = () => resolve(img);
        img.src = img.getAttribute('lazy-src');
    })),
    C.takeAllWithLimit(limit),
    _.each(_.each($.addClass('fade-in')))
);

// UI
const Ui = {};

Ui.message = _.curry((btns, msg) => new Promise(resolve => _.go(
    `
    <div class="confirm">
        <div class="body">
            <div class="msg">${msg}</div>
            <div class="buttons">
                ${_.strMap(btn => `
                    <button type="button" class="${btn.type}">${btn.name}</button>
                `, btns)}
            </div>
        </div>
    </div>
    `,
    $.el,
    $.append($.qs('body')),
    ..._.map(btn => _.tap(
        $.find(`.${btn.type}`),
        $.on('click', e => _.go(
            e.currentTarget,
            $.closest('.confirm'),
            $.remove,
            _ => resolve(btn.value)
        ))), btns)
)));

Ui.confirm = Ui.message([
    { name: '취소', type: 'cancel', value: false },
    { name: '확인', type: 'ok', value: true },
]);

Ui.alert = Ui.message([
    { name: '확인', type: 'ok', value: true }
]);

Ui.remove = (btnSel, targetSel, before = a => a, after = a => a) => _.tap(
    $.findAll(btnSel),
    $.on('click', async ({currentTarget}) =>
        await Ui.confirm('정말 삭제하시겠습니까?') &&
            _.go(currentTarget,
                $.closest(targetSel),
                _.tap(before),
                $.remove,
                _.tap(after)))
);

_.go(
    Images.fetch(),
    Images.template,
    $.el,
    $.append($.qs('body')),
    Ui.remove('.remove', '.image', _ => console.log('이미지 삭제 전'), console.log),
    Images.load(4)
);
