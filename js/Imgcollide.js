const images = [];

const IMAGE_COUNT = 10;

for (let i = 0; i < IMAGE_COUNT; i++) { // it doesnt work currently since no image to connect it to.. 
    //uhh hopefully when its conneced it should work?
  const img = document.createElement("img");
  
  
  img.style.position = "absolute";
  document.body.appendChild(img);


  images.push({
    el: img, // .el (element) to store DOM for multiple images
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    dx: (Math.random() - 0.5) * 4,
    dy: (Math.random() - 0.5) * 4,
    width: 0,
    height: 0
  });
}

function update() { 
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    for (let i = 0; i < images.length; i++) {
      const obj = images[i];
      img.style.width = "100px"; 
      img.style.height = "100px"; 
  
      // get size (based on vega code)
      obj.width = obj.el.offsetWidth; 
      obj.height = obj.el.offsetHeight;
  
      // move
      obj.x += obj.dx;
      obj.y += obj.dy;
  
      // bounce off left/right
      if (obj.x <= 0 || obj.x + obj.width >= screenWidth) {
        obj.dx *= -1;
      }
      // bounce off top/bottom
      if (obj.y <= 0 || obj.y + obj.height >= screenHeight) {
        obj.dy *= -1;
      }
    }
    handleCollisions();
  }

   //-----------------------------------------collision function---
  function handleCollisions() {

    for (let i = 0; i < images.length; i++) { //double loop to check pairs of imgs
      for (let j = i + 1; j < images.length; j++) {
        const a = images[i];
        const b = images[j];
  
        // AABB (Axis-Aligned Bounding Box) collision check 
        //https://stackoverflow.com/questions/22512319/what-is-aabb-collision-detection

        if (
          a.x < b.x + b.width && //left check of A
          a.x + a.width > b.x && //right check
          a.y < b.y + b.height && //top check A
          a.y + a.height > b.y // bottom A
        ) 
        { //collide then bounce
          // bounce by swapping velocity
          const tempDx = a.dx;
          const tempDy = a.dy;
  
          a.dx = b.dx;
          a.dy = b.dy;
  
          b.dx = tempDx;
          b.dy = tempDy;
  
          // push apart so no sticking
          const overlapX =
            (a.x + a.width / 2) - (b.x + b.width / 2);
          const overlapY =
            (a.y + a.height / 2) - (b.y + b.height / 2);
  
          const push = 2; //fixed move to separate them (might clip/jitter?)
  
          a.x += overlapX > 0 ? push: -push; // if A is on the right of B, push A right, B left
          b.x -= overlapX > 0 ? push: -push; //etc
  
          a.y += overlapY > 0 ? push: -push;
          b.y -= overlapY > 0 ? push: -push;
        }
      }
    }
  }
//--------------------------------------------------render-----------
  function render() { //applying position change like vega code
    for (let i = 0; i < images.length; i++) {
      const obj = images[i];
  
      obj.el.style.left = obj.x + "px";
      obj.el.style.top = obj.y + "px";
    }
  }
  //------------------------------------------loop function-------------
  function loop() {
    
    update();
    render();
    requestAnimationFrame(loop);
  }
  
  loop();