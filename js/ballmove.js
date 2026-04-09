const main = document.querySelector('.main');

main.style.width = '600px';
main.style.height = '400px';
main.style.backgroundColor = 'black';

const ball = document.createElement('div')
const b = {x:50,y:30,w:40,h:40}
ball.style.backgroundColor = 'red';
ball.style.borderRadius = '50%';
ball.style.width = '${b.w}px'
ball.style.height = '${b.h}px'
ball.style.position = 'relative';
ball.style.left = '${b.x}px';
ball.style.top = '${b.y}px';
main.append(ball);
