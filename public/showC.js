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
    img.src = image.url; 
      //this is the actual image from the server   
      
      //elvas silly test interactions
      img.addEventListener("mouseenter", () => {
        img.style.transform = "scale(1.2)"; });
       img.style.width = Math.random() * 100 + 100 + "px";

      img.classList.add("showcase-image"); 
      //for css
      showcase.appendChild(img); 
      //.appendchild adds the image to the page
     imageElements.push(img); 
      //saves image so we can reference it later + allows internactions, .push = adds to array 
    });

  } catch (error) {
    console.log("error loading imagess", error);
  }
}



loadImages(); 
setInterval(loadImages, 3000); 
