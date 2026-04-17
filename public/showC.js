let imageElements = []; // Arrray of ALL image elements
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


