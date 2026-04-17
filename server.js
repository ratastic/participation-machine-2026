//create server 

//bring in packages we installed
require("dotenv").config(); //load secret keys from .env 
const cloudinary = require("cloudinary").v2;

const express = require("express");
const multer = require("multer");
const path = require("path"); //works with file + directroy paths

const app = express();
const port = process.env.PORT || 3000;

//telling cloudinary hi this is me pls let me upload
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //user
  api_key: process.env.CLOUDINARY_API_KEY, //login ID
  api_secret: process.env.CLOUDINARY_API_SECRET //password
});

//store images TEMP in RAM 
const storage = multer.memoryStorage(); 

//multer setup (this is what grabs the uploaded files)
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); //only allow images
  }
}).any();

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;

  const extname = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  ); //checks file name like jpg

  const mimetype = fileTypes.test(file.mimetype); //checks actual file type

  if (mimetype && extname) {
    return cb(null, true); 
  } else {
    cb("Images Only!"); 
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/showC.html");
});


//this stores the most recent image list in memory
let cachedImages = [];

//stores when we last asked cloudinary
let lastImageFetchTime = 0;

//how long to keep cache before asking cloudinary again
const CACHE_DURATION = 30000;

//we don’t repeat the same cloudinary code everywhere
async function fetchImagesFromCloudinary() {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "participation-machine/",
    resource_type: "image",
    max_results: 30
  });

  const images = result.resources.map((img) => ({
    url: img.secure_url,
    public_id: img.public_id
  }));

  //update cache
  cachedImages = images;
  lastImageFetchTime = Date.now();

  return images;
}


app.get("/gallery", async (req, res) => {
  try {
    //use cache if still fresh
    const now = Date.now();
    let images;

    if (cachedImages.length > 0 && now - lastImageFetchTime < CACHE_DURATION) {
      console.log("GALLERY: using cached images");
      images = cachedImages;
    } else {
      console.log("GALLERY: fetching from cloudinary");
      images = await fetchImagesFromCloudinary();
    }

    res.render("index", { images });
  } catch (err) {
    console.log("CLOUDINARY LIST ERROR:", err);
    res.render("index", { images: [] });
  }
});


//BackEND getting imag from cloud 
app.get("/images", async (req, res) => {
  try {
    const now = Date.now();

    //if cache is fresh, return cache instead of hitting cloudinary
    if (cachedImages.length > 0 && now - lastImageFetchTime < CACHE_DURATION) {
      console.log("IMAGES: serving from cache");
      return res.json(cachedImages);
    }

    console.log("IMAGES: fetching from cloudinary");
    const images = await fetchImagesFromCloudinary();

    res.json(images); //place on the screen aka front end
  } catch (err) {
    console.log("IMAGE FETCH ERROR:", err);
    res.status(500).json([]); 
  }
});


//uploading
app.post("/upload", (req, res) => {
  console.log("UPLOAD START");

  upload(req, res, async (err) => {
    console.log("ERRorRR:", err);
    console.log("files:", req.files);

    if (err) {
      return res.status(400).send(err); 
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("uh no files"); 
    }

    try {
      const uploadedImages = []; //save uploaded results so we can update cache

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "participation-machine" }, //tells cloudinary its a pic
            (error, result) => {
              if (error) reject(error); 
              else resolve(result); 
            }
          );
          stream.end(file.buffer); //send file from RAM to cloudinary
        });

        console.log("uploadd:", result.secure_url);

        // save uploaded image info
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }

    
      // add new uploads to the FRONT of the cache so they appear immediately
    
      cachedImages = [...uploadedImages, ...cachedImages].slice(0, 30);
      lastImageFetchTime = Date.now();

      res.status(200).send("upload successful");
    } catch (err) {
      console.log("error:", err);
      res.status(500).send("upload failed");
    }
  });
});


app.put("/delete", async (req, res) => {
  const { deleteImages, deleteSecret } = req.body;

  if (deleteSecret !== process.env.DELETE_SECRET) {
    return res.status(403).send("nope wrong delete code");
  }

  if (!deleteImages || deleteImages.length === 0) {
    return res.status(400).send("plz chose image to delete");
  }

  try {
    for (const publicId of deleteImages) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("DELETE RESULT:", publicId, result);
    }

    //remove deleted images from cache too
    cachedImages = cachedImages.filter(
      (img) => !deleteImages.includes(img.public_id)
    );
    lastImageFetchTime = Date.now();

    res.status(200).send("success delete");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("delete failed");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});