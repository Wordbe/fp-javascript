const add = (a, b) => a + b;

const sum = curry((f, iter) => go(
    iter,
    map(f),
    reduce(add)
));

const total_quantity = sum(p => p.quantity);
const total_price = sum(p => p.price * p.quantity);
const filtered_products = filter(p => p.is_selected, products);

document.querySelector('#cart').innerHTML = `
    <table>
        <tr>
            <th></th>
            <th>상품 이름</th>
            <th>가격</th>
            <th>수량</th>
            <th>총 가격</th>
        </tr>
        ${go(products, sum(p => `
            <tr>
                <td><input type="checkbox" ${p.is_selected ? 'checked' : ''}></td>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td><input type="number" value="${p.quantity}"></td>
                <td>${p.price * p.quantity}</td>
            </tr>
        `))}
        <tr>
            <td colspan="3">합계</td>
            <td>${total_quantity(filtered_products)}</td>
            <td>${total_price(filtered_products)}</td>
        </tr>
    </table>
`