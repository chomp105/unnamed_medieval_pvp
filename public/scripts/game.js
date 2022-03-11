let canvas = document.getElementById("gc");
let ctx = canvas.getContext("2d");
let gameObject, xoffset, yoffset, order, angle = 0,
    attackRange, mousex, mousey, mousedown = false,
    hit_animation_count = 0,
    animation_angle = 0;
var socket = io();
let kp = {
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener("keydown", (e) => {
    if (e.key == 'd') {
        kp.right = true;
    } else if (e.key == 'a') {
        kp.left = true;
    } else if (e.key == 'w') {
        kp.up = true;
    } else if (e.key == 's') {
        kp.down = true;
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key == 'd') {
        kp.right = false;
    } else if (e.key == 'a') {
        kp.left = false;
    } else if (e.key == 'w') {
        kp.up = false;
    } else if (e.key == 's') {
        kp.down = false;
    }
});
document.addEventListener('mousemove', (e) => {
    angle = Math.atan2(-(e.clientX - (canvas.width / 2)), (e.clientY - (canvas.height / 2))) + Math.PI;
    mousex = e.clientX;
    mousey = e.clientY;
});
document.addEventListener('mousedown', (e) => {
    mousedown = true;
    if (hit_animation_count == 0) {
        hit_animation_count = 30;
    }
});
document.addEventListener('mouseup', (e) => {
    mousedown = false;
});

function returnCanvasX(canvas) {
    if (canvas != undefined) {
        return canvas.width;
    }
    return 0;
}

function returnCanvasY(canvas) {
    if (canvas != undefined) {
        return canvas.height;
    }
    return 0;
}

function render(gameObject) {
    if (hit_animation_count > 0) {
        if (hit_animation_count > 20) {
            animation_angle -= 15;
        } else if (hit_animation_count > 10) {
            animation_angle += 15;
        }
        hit_animation_count--;
    } else if (mousedown) {
        hit_animation_count = 30;
    }
    xoffset = -gameObject.circles[order].x + (returnCanvasX(canvas) / 2);
    yoffset = -gameObject.circles[order].y + (returnCanvasY(canvas) / 2);

    ctx.clearRect(0, 0, returnCanvasX(canvas), returnCanvasY(canvas));
    ctx.fillStyle = '#0a1707';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e572a';
    ctx.fillRect(xoffset, yoffset, gameObject.wx2, gameObject.wy2);
    ctx.strokeStyle = '#234d2c';
    ctx.lineWidth = 3;
    for (let i = 0; i < gameObject.wx2 / 200; i++) {
        ctx.beginPath();
        ctx.moveTo(xoffset, i * 200 + yoffset);
        ctx.lineTo(xoffset + gameObject.wx2, i * 200 + yoffset);
        ctx.stroke();
    }
    for (let i = 0; i < gameObject.wx2 / 200; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 200 + xoffset, yoffset);
        ctx.lineTo(i * 200 + xoffset, yoffset + gameObject.wy2);
        ctx.stroke();
    }
    ctx.lineWidth = 10;
    ctx.strokeRect(xoffset, yoffset, gameObject.wx2, gameObject.wy2);
    ctx.lineWidth = 3;

    if (gameObject.circles.length > 0) {
        for (let c of gameObject.circles) {
            if (c.type != 'tree') {
                ctx.translate(c.x + xoffset, c.y + yoffset);
                ctx.rotate(c.angle + (c.animation_angle * Math.PI / 180) - (90 * Math.PI / 180));
                ctx.drawImage(axe, 20, -80, 100, 200);
                ctx.rotate(90 * Math.PI / 180);
                ctx.drawImage((c.type == 'knight') ? knight : orc, -56, -66, 110, 140);
                ctx.rotate(-c.angle - (c.animation_angle * Math.PI / 180));
                ctx.translate(-(c.x + xoffset), -(c.y + yoffset));
            } else if (c.type == 'tree') {
                let width = c.r + 50;
                ctx.translate(c.x + xoffset, c.y + yoffset);
                ctx.rotate(c.angle);
                ctx.drawImage(tree, -width, -width, width * 2, width * 2);
                ctx.rotate(-c.angle);
                ctx.translate(-(c.x + xoffset), -(c.y + yoffset));
            }
        }
    }
}

function game() {
    render(gameObject);
    window.requestAnimationFrame(game);
}
window.requestAnimationFrame(game);

socket.on('update', (sentGameObject) => {
    gameObject = sentGameObject;
    for (let i = 0; i < gameObject.players.length; i++) {
        if (gameObject == undefined) break;
        if (gameObject.players[i].id == socket.id) {
            order = gameObject.players[i].order;
        }
    }
});
setInterval(() => {
    if (gameObject.circles.length > order) {
        socket.emit('action', { kp: kp, mousedown: mousedown, angle: angle, animation_angle: animation_angle });
    }
}, 1000 / 120);

socket.on('start', () => {
    game();
});