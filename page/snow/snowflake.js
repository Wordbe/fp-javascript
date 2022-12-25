const body = document.querySelector("body");

const NUM_SNOWFLAKES = 50;
const MIN_DURATION = 10;

function makeSnowflake() {
    const snowflake = document.createElement("div");
    const delay = Math.random() * 10;
    const duration = Math.random() * 20 + MIN_DURATION;
    
    snowflake.classList.add("snowflake");
    snowflake.style.left = `${Math.random() * window.screen.width}px`;
    snowflake.style.animationDelay = `${delay}s`;
    snowflake.style.opacity = Math.random();
    snowflake.style.animation = `fall ${duration}s linear`;

    body.appendChild(snowflake);
    setTimeout(() => {
        body.removeChild(snowflake);
        makeSnowflake();
    }, (duration + delay) * 1000);
}

for (let i = 0; i < NUM_SNOWFLAKES; i++) {
    setTimeout(makeSnowflake, 500 * i);
}