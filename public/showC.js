const showcase = document.getElementById("showcase");

async function loadImages() {
  try {
    const response = await fetch("/images");
    const images = await response.json();

    showcase.innerHTML = ""; // wipe old ones first

    images.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.url;
      img.alt = "drawing";
      img.classList.add("showcase-image");
      showcase.appendChild(img);
    });
  } catch (error) {
    console.log("error loading images 😭", error);
  }
}

loadImages();
setInterval(loadImages, 3000);