let imageElements = [];
const showcase = document.getElementById("showcase");
let cachedImages = null; 



async function loadImages() { // this function gets images from the backend and displays them
    try {
      const response = await fetch("/images"); //grabs all img from back
      const images = await response.json(); //converts 2 array
  

        /* showcase.innerHTML = ""; //no duplicates
        imageElements = []; //reses array has current images
        */ 
       //instead using alreadyExists

      images.forEach((image) => {
        // skip if this image is already in array
        const alreadyExists = imageElements.some((obj) => obj.el.src === image.url);
        if (alreadyExists) return;
  
        const img = document.createElement("img"); //gives each img a  <img> tag

        img.classList.add("showcase-image");
            // for css to b able to reference
            
            // elvas silly test interactions
        img.addEventListener("mouseenter", () => { 
            img.style.transform = "scale(1.2)"; });
        img.addEventListener("mouseleave", () => {
             img.style.transform = "scale(1)"; });
  
        img.style.width = Math.random() * 100 + 100 + "px";
        img.style.position = "absolute";

        /* random start position
            img.x = Math.random() * showcase.clientWidth;
            img.y = Math.random() * showcase.clientHeight; 
        */

        img.src = image.url; //this is the actual image from the server   
  
        showcase.appendChild(img); 
        //.appendchild adds the image to the page 
  
        imageElements.push({
          el: img,
          x: Math.random() * showcase.clientWidth, //random start position
          y: Math.random() * showcase.clientHeight,

          dx: (Math.random() - 0.5) * 3,
          dy: (Math.random() - 0.5) * 3,
          width: 0,
          height: 0
        }); //saves image so we can reference it later + allows internactions, .push = adds to array
        

      });
  
    } catch (error) {
      console.log("error loading images", error);
    }
  }
  //-----------------------------------------------



  // Call once to load initial images + start loop
  loadImages().then(() => loop());
  //re-check for new images every 10 seconds
  setInterval(loadImages, 10000); 




// --- Update positions + wall bouncing ----------
function update() {

    const screenWidth = window.innerWidth; //screen borders
    const screenHeight = window.innerHeight;
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth

  imageElements.forEach((obj) => {
    obj.width = obj.el.offsetWidth;
    obj.height = obj.el.offsetHeight;
    // https://stackoverflow.com/questions/623172/how-to-get-the-image-size-height-width-using-javascript

    // move; position = position + velocity
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
  });

  handleCollisions(); // <-- plugged in from collision code

  console.log("animate"); // for testing purposes, shows that the function is running
}

// -------------------------------collision function---------------
function handleCollisions() {
  for (let i = 0; i < imageElements.length; i++) { //double loop to check pairs of imgs
    for (let j = i + 1; j < imageElements.length; j++) {
      const a = imageElements[i];
      const b = imageElements[j];

      // AABB (Axis-Aligned Bounding Box) collision check 
        //https://stackoverflow.com/questions/22512319/what-is-aabb-collision-detection

      if (
        a.x < b.x + b.width && //left check of A
          a.x + a.width > b.x && //right check
          a.y < b.y + b.height && //top check A
          a.y + a.height > b.y // bottom A
      ) {
        // bounce by swapping velocity
        const tempDx = a.dx;
        const tempDy = a.dy;
        a.dx = b.dx;
        a.dy = b.dy;
        b.dx = tempDx;
        b.dy = tempDy;

        // push apart so no sticking
        const overlapX = (a.x + a.width / 2) - (b.x + b.width / 2);
        const overlapY = (a.y + a.height / 2) - (b.y + b.height / 2);
        const push = 2; //fixed move to separate them

        a.x += overlapX > 0 ? push: -push; // if A is on the right of B, push A right, B left
          b.x -= overlapX > 0 ? push: -push; //etc
  
          a.y += overlapY > 0 ? push: -push;
          b.y -= overlapY > 0 ? push: -push;
      }
    }
  }
}

// ---------------------render----------------
function render() {
  imageElements.forEach((obj) => {
    obj.el.style.left = obj.x + "px";
    obj.el.style.top = obj.y + "px";
  });
}

// ----------------main loop--------
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loadImages();

/*let imageElements = []; // Arrray of ALL image elements
const showcase = document.getElementById("showcase");
let cachedImages = null; 


async function loadImages() { // this function gets images from the backend and displays them
try {
    const response = await fetch("/images"); //grabs all img from back
    const images = await response.json();  //converts 2 array
   
    showcase.innerHTML = ""; //no duplicates
    imageElements = []; //reses array has current images

    images.forEach((image) => {
    const img = document.createElement("img"); //gives each img a  <img> tag
    
  
    img.classList.add("showcase-image"); 
        // for css to b able to refrence 

        // elvas silly test interactions
    img.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.2)";
    });
    img.addEventListener("mouseleave", () => { 
      img.style.transform = "scale(1)";
    });
    
    img.style.width = Math.random() * 100 + 100 + "px";
    img.style.position = "absolute";

    // random start position
    // img.x = Math.random() * showcase.clientWidth;
    // img.y = Math.random() * showcase.clientHeight;

    // random speed
    img.dx = (Math.random() - 0.5) * 5;
    img.dy = (Math.random() - 0.5) * 5;

    // img.style.left = img.x + "px";
    // img.style.top = img.y + "px";

    img.src = image.url; //this is the actual image from the server   

    showcase.appendChild(img); 
    //.appendchild adds the image to the page 

    imageElements.push({ 
      drawing: img,
      x: Math.random() * showcase.clientWidth, // random start position
      y: Math.random() * showcase.clientHeight, // random start position

//this is 
      dx: (Math.random() - 0.5) * 1, // random speed
      dy: (Math.random() - 0.5) * 1
    });
    //saves image so we can reference it later + allows internactions, .push = adds to array





  const screenWidth = window.innerWidth; // screen borders
  const screenHeight = window.innerHeight;
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
  
  imageElements.forEach((obj) => { // for each individual image + their movement controls
    const imgWidth = obj.drawing.offsetWidth;
    const imgHeight = obj.drawing.offsetHeight;
    // https://stackoverflow.com/questions/623172/how-to-get-the-image-size-height-width-using-javascript

    // move; position = position + velocity
    obj.x += obj.dx; 
    obj.y += obj.dy;

    // bounce off left/right
    if (obj.x <= 0 || obj.x + imgWidth >= screenWidth) { 
      obj.dx *= -1;
    }

    // bounce off top/bottom
    if (obj.y <= 0 || obj.y + imgHeight >= screenHeight) {
      obj.dy *= -1;
    }

    // apply position change
    obj.drawing.style.left = obj.x + "px";
    obj.drawing.style.top = obj.y + "px";
  });

  console.log("animate"); // for testing purposes, shows that the function is running
  requestAnimationFrame(loadImages);

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame



    });
  } catch (error) {
    console.log("error loading imagess", error);
  }
}

loadImages(); 
setInterval(loadImages, 2000000); 
*/














// function animate()
// {
//   const screenWidth = window.innerWidth; // screen borders
//   const screenHeight = window.innerHeight;
//   // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
  
//   imageElements.forEach((img) => { // for each individual image + their movement controls
//     const imgWidth = img.drawing.offsetWidth;
//     const imgHeight = img.drawing.offsetHeight;
//     // https://stackoverflow.com/questions/623172/how-to-get-the-image-size-height-width-using-javascript

//     // move; position = position + velocity
//     img.x += img.dx; 
//     img.y += img.dy;

//     // bounce off left/right
//     if (img.x <= 0 || img.x + imgWidth >= screenWidth) { 
//       img.dx *= -1;
//     }

//     // bounce off top/bottom
//     if (img.y <= 0 || img.y + imgHeight >= screenHeight) {
//       img.dy *= -1;
//     }

//     // apply position change
//     img.drawing.style.left = img.x + "px";
//     img.drawing.style.top = img.y + "px";
//   });

//   console.log("animate"); // for testing purposes, shows that the function is running
//   return new Promise(animate => {
//   requestAnimationFrame(animate);
//   });
//   // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// }

// function animate() {
//   const w = showcase.clientWidth;
//   const h = showcase.clientHeight;



  
//   imageElements.forEach((img) => {
//        if(!img.complete) return; //waits for image to load before animating, prevents glotchses

//     img.x += img.dx;
//     img.y += img.dy;

//     const dw = img.offsetWidth;
//     const dh = img.offsetHeight;

//     if (img.x <= 0 || img.x + dw >= w) img.dx *= -1;
//     if (img.y <= 0 || img.y + dh >= h) img.dy *= -1;

//     img.style.left = img.x + "px";
//     img.style.top = img.y + "px";
//   });

//   requestAnimationFrame(animate);
// }


