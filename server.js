//create server here


//bring in packages we installed
require("dotenv").config() //load secret keys from .env 
const cloudinary = require("cloudinary").v2;

const express = require("express");
const multer = require("multer");
const path = require("path"); //works with file + directroy paths

const app = express();
const port = 3000;

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
  ); //checks file name likejpg

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

app.get("/gallery", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "participation-machine/",
      resource_type: "image",
      max_results: 100
    });

    const images = result.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id
    }));

    res.render("index", { images });
  } catch (err) {
    console.log("CLOUDINARY LIST ERROR:", err);
    res.render("index", { images: [] });
  }
});

//BackEND gettingimag from cloud 
app.get("/images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "participation-machine/",
      resource_type: "image",
      max_results: 100
    }); //arraw of images from cloudinary 

    const images = result.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id
    })); //simple array of image URLs and IDs

   res.json(images);// place on the screen aka front end
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
      }
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

    res.status(200).send("success delete");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("delete failed");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});