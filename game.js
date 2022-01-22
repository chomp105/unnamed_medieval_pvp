let canvas = document.getElementById("gc");
let ctx = canvas.getContext("2d");
ctx.strokeStyle = "magenta";

// keypresses
let kp = {
    up: false,
    down: false,
    left: false,
    right: false
};

function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xf = 0;
    this.yf = 0;
    // ("cl" means "collision list")
    this.cl = [];
}

// o1 and o2 (object 1 and 2)
// d = distance (xd = x-distance)
function Collision(o1, o2, xd, yd, d) {
    this.o1 = o1;
    this.o2 = o2;
    this.xd = xd;
    this.yd = yd;
    this.d = d;
}

let circles = [];
for (let i = 0; i < 15; i++) {
    circles.push(new Circle(100 + (i * 2), 0 + (i * 2), 40));
}
let player = 0;
circles[1] = new Circle(100, 100, 50);

let collisions = [];

// "e.which is deprecated" idc ᕙ(▀̿̿Ĺ̯̿̿▀̿ ̿)ᕗ i'll change it later
document.addEventListener("keydown", (e) => {
    if (e.which == 39) {
        kp.right = true;
    } else if (e.which == 37) {
        kp.left = true;
    } else if (e.which == 38) {
        kp.up = true;
    } else if (e.which == 40) {
        kp.down = true;
    }
});
document.addEventListener("keyup", (e) => {
    if (e.which == 39) {
        kp.right = false;
    } else if (e.which == 37) {
        kp.left = false;
    } else if (e.which == 38) {
        kp.up = false;
    } else if (e.which == 40) {
        kp.down = false;
    }
});

function render() {
    ctx.clearRect(0, 0, 400, 400);
    for (let i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
}

function checkCollision(o1, o2) {
    let xd = o2.x - o1.x;
    let yd = o2.y - o1.y;
    let d = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2));
    if (d < o1.r + o2.r) {
        collisions.push(new Collision(o1, o2, xd, yd, d));
    }
}

function resolveCollisions() {
    // math that I only sort of understand.
    for (let c of collisions) {
        // from what I can tell, nx and ny are just the ratios of x and y movement-
        // along the vector formed with the centers of the two circles
        let nx = c.xd / c.d;
        let ny = c.yd / c.d;
        let s = c.o1.r + c.o2.r - c.d;

        // this just finds how far the circle should move
        // if a big and little circle collide, the little one will move more
        o2d = (c.o1.r / (c.o1.r + c.o2.r));
        o1d = (c.o2.r / (c.o1.r + c.o2.r));

        c.o1.x -= nx * s * o1d;
        c.o1.y -= ny * s * o1d;
        c.o2.x += nx * s * o2d;
        c.o2.y += ny * s * o2d;
    }
    collisions = [];
}

function testCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < circles.length; j++) {
            if (i < j) {
                checkCollision(circles[i], circles[j]);
            }
        }
    }
}

// if its touching or going through the wall it teleports it back
function wallCollisions() {
    for (let c of circles) {
        if (c.x - c.r < 0) {
            c.x = 0 + c.r;
            c.xf = 0;
        } else if (c.x + c.r > 400) {
            c.x = 400 - c.r;
            c.xf = 0;
        }
        if (c.y - c.r < 0) {
            c.y = 0 + c.r;
            c.yf = 0;
        } else if (c.y + c.r > 400) {
            c.y = 400 - c.r;
            c.yf = 0;
        }
    }
}

let previousTime;

function game() {
    // this part is a quick test and is temporary
    circles[player].xf += (2 * kp.right) + (-2 * kp.left);
    circles[player].yf += (2 * kp.down) + (-2 * kp.up);
    circles[player].x += circles[player].xf / circles[player].r;
    circles[player].y += circles[player].yf / circles[player].r;
    circles[player].xf -= circles[player].xf / 30;
    circles[player].yf -= circles[player].yf / 30;

    // the names are pretty self-explanatory
    resolveCollisions();
    testCollisions();
    wallCollisions();
    render();

    window.requestAnimationFrame(game);
}
window.requestAnimationFrame(game);