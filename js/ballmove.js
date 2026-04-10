// const main = document.querySelector('.main');

// main.style.width = '600px';
// main.style.height = '400px';
// main.style.backgroundColor = 'black';

// const ball = document.createElement('div')
// const b = {x:50,y:30,w:40,h:40}
// ball.style.backgroundColor = 'red';
// ball.style.borderRadius = '50%';
// ball.style.width = '${b.w}px'
// ball.style.height = '${b.h}px'
// ball.style.position = 'relative';
// ball.style.left = '${b.x}px';
// ball.style.top = '${b.y}px';
// main.append(ball);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const BUG_COUNT = 10; // can change..just put 10
const bugs = [];

// bug... change size and speed and wiggliness here
for (let i = 0; i < BUG_COUNT; i++) {
  bugs.push({
    x: Math.random() * canvas.width, 
    y: Math.random() * canvas.height,
    radius: 30, // bug size

    angle: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random(), // speeds

    turnSpeed: 0.5 // how wiggly it is
  });
}
//---------------------------------------------------------------UPDATE---------------
function update() { 
  for (let i = 0; i < bugs.length; i++) {
    const b = bugs[i]; 

    // ONE random call per frame (efficient)
    const rand = Math.random() - 0.5;

    // Smooth wandering
    b.angle += rand * b.turnSpeed;

    const cos = Math.cos(b.angle);
    const sin = Math.sin(b.angle);

    b.x += cos * b.speed;
    b.y += sin * b.speed;

    // Wall bounce
    if (b.x < b.radius || b.x > canvas.width - b.radius) {
      b.angle = Math.PI - b.angle;
    }
    if (b.y < b.radius || b.y > canvas.height - b.radius) {
      b.angle = -b.angle;
    }
  }

  handleCollisions();
}
//----------------------------------------------------------Collision-function-----------
// adding collision so they dont overlap //MATH HELLLLLLLLLLLLLLLLLL idek how these utube codebros think
// b for bug/germ ------ double loop check for collision so it checks all the bugs(?)
function handleCollisions() {
  for (let i = 0; i < bugs.length; i++) {
    for (let j = i + 1; j < bugs.length; j++) {
      const a = bugs[i];
      const b = bugs[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;

      const distSq = dx * dx + dy * dy;
      const minDist = a.radius + b.radius;

      // distance between bugs check, rotate away if too close (based on radius of two bugs)
      if (distSq < minDist * minDist) {
        // rotate away like bounce
        const angle = Math.atan2(dy, dx); // math.atan2 measures counterclockwise angle in radians

        a.angle = angle;
        b.angle = angle + Math.PI;

        // Push apart so there isnt overlap (prevents sticking)
        const overlap = minDist - Math.sqrt(distSq);
        const pushX = Math.cos(angle) * overlap * 0.5;
        const pushY = Math.sin(angle) * overlap * 0.5;

        a.x += pushX;
        a.y += pushY;
        b.x -= pushX;
        b.y -= pushY;
      }
    }
  }
}
//-------------------------------------------------------------------DRAW-----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < bugs.length; i++) { // draw for every bug... this will need to change for when we insert custom images for bugs
    const b = bugs[i];

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle, counterclockwise (just circles)
    ctx.fill();
    ctx.fillStyle = "purple";
    
  }
}
//------------------------------------------------------loop function-------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

