let imageElements = []; // ALL image elements
const showcase = document.getElementById("showcase");


async function loadImages() { // this function gets images from the backend and displays them
try {
    const response = await fetch("/images"); //grabs all img from back
    const images = await response.json();  //converts 2 array
   
    showcase.innerHTML = ""; //no duplicates
    imageElements = []; //reses array has current images

    images.forEach((image) => {
    const img = document.createElement("img"); //gives each img a  <img> tag
    img.src = image.url; //this is the actual image from the server   
  
    // elvas silly test interactions
    img.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.2)";
    });
    img.addEventListener("mouseleave", () => { 
      img.style.transform = "scale(1)";
    });
    
    // for css (why isn't this put in a css file instead? /genq)
    // img.style.width = Math.random() * 100 + 100 + "px";
    img.style.position = "absolute";
    // random start position
    img.x = Math.random() * showcase.clientWidth;
    img.y = Math.random() * showcase.clientHeight;

    // random speed
    img.dx = (Math.random() - 0.5) * 5;
    img.dy = (Math.random() - 0.5) * 5;

    img.style.left = img.x + "px";
    img.style.top = img.y + "px";

    img.classList.add("showcase-image"); 
   
    showcase.appendChild(img); 
    //.appendchild adds the image to the page 

    imageElements.push(img)

    });
      //saves image so we can reference it later + allows internactions, .push = adds to array
  } catch (error) {
    console.log("error loading imagess", error);
  }
}

function animate() {
  const w = showcase.clientWidth;
  const h = showcase.clientHeight;

  imageElements.forEach((drawing) => {
    drawing.x += drawing.dx;
    drawing.y += drawing.dy;

    const dw = drawing.offsetWidth;
    const dh = drawing.offsetHeight;

    if (drawing.x <= 0 || drawing.x + dw >= w) drawing.dx *= -1;
    if (drawing.y <= 0 || drawing.y + dh >= h) drawing.dy *= -1;

    drawing.style.left = drawing.x + "px";
    drawing.style.top = drawing.y + "px";
  });

  requestAnimationFrame(animate);
}

animate();
loadImages(); 
setInterval(loadImages, 8000); 
