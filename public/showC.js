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


  img.src = image.url; //this is the actual image from the server   

        showcase.appendChild(img); 
    //.appendchild adds the image to the page 
    imageElements.push(img)
    //saves image so we can reference it later + allows internactions, .push = adds to array


    });
  } catch (error) {
    console.log("error loading imagess", error);
  }
}

function animate() {
  const w = showcase.clientWidth;
  const h = showcase.clientHeight;



  imageElements.forEach((img) => {
       if(!img.complete) return; //waits for image to load before animating, prevents glotchses

    img.x += img.dx;
    img.y += img.dy;

    const dw = img.offsetWidth;
    const dh = img.offsetHeight;

    if (img.x <= 0 || img.x + dw >= w) img.dx *= -1;
    if (img.y <= 0 || img.y + dh >= h) img.dy *= -1;

    img.style.left = img.x + "px";
    img.style.top = img.y + "px";
  });

  requestAnimationFrame(animate);
}


loadImages(); 
animate();
setInterval(loadImages, 2000000); 
