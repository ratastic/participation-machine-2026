require("dotenv").config(); //load secret keys from .env 

console.log("RUNNING THIS SERVER FILE");
console.log("__dirname:", __dirname);
console.log("cwd:", process.cwd());
console.log("secret exists:", !!process.env.CLOUDINARY_API_SECRET);

//create server 
console.log("cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("has api key:", !!process.env.CLOUDINARY_API_KEY);
console.log("has api secret:", !!process.env.CLOUDINARY_API_SECRET);

//bring in packages we installed
const cloudinary = require("cloudinary").v2;

const express = require("express");
const multer = require("multer");
const path = require("path"); //works with file + directroy paths

const app = express();
const port = process.env.PORT || 3000;

let cachedImages = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 1000;

//telling cloudinary hi this is me pls let me upload
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //user
  api_key: process.env.CLOUDINARY_API_KEY, //login ID
  api_secret: process.env.CLOUDINARY_API_SECRET //password
});

async function getImagesFromCloudinary(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cachedImages.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedImages;
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "participation-machine/",
      max_results: 30
    });

    cachedImages = result.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id
    }));

    lastFetchTime = now;
    return cachedImages;
  } catch (err) {
    console.log("CLOUDINARY RESOURCES ERROR MESSAGE:", err.message);
    console.log("CLOUDINARY RESOURCES ERROR HTTP:", err.http_code);
    console.log("CLOUDINARY RESOURCES ERROR FULL:", err);
    throw err;
  }
}

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

app.get("/gallery", async (req, res) => {
  try {
    const images = await getImagesFromCloudinary(true);
    res.render("index", { images });
  } catch (err) {
    console.log("CLOUDINARY LIST ERROR:", err);
    res.render("index", { images: [] });
  }
});

//BackEND getting imag from cloud 
app.get("/images", async (req, res) => {
  try {
    const images = await getImagesFromCloudinary(true);
    res.json(images);
  } catch (err) {
    console.log("IMAGE FETCH ERROR MESSAGE:", err.message);
    res.status(500).json({ error: err.message });
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
            { resource_type: "image", folder: "participation-machine" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        console.log("uploadd:", result.secure_url);

      cachedImages.unshift({
        url: result.secure_url,
        public_id: result.public_id
      });

      // image dies after 30 seconds, permanently
      setTimeout(async () => {
        try {
        const deleteResult = await cloudinary.uploader.destroy(result.public_id, {
          resource_type: "image",
          invalidate: true
        });     
             console.log("AUTO DELETE RESULT:", result.public_id, deleteResult);

          cachedImages = cachedImages.filter(
            (img) => img.public_id !== result.public_id
          );
        } catch (err) {
          console.log("AUTO DELETE ERROR:", err);
        }
      }, 30000);
            }

      lastFetchTime = Date.now();
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
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true
      });

      console.log("DELETE RESULT:", publicId, result);

      if (result.result === "ok") {
        cachedImages = cachedImages.filter(
          (img) => img.public_id !== publicId
        );
      } else {
        console.log("DID NOT DELETE:", publicId, result.result);
      }
    }

    lastFetchTime = 0;
    res.status(200).send("success delete");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("delete failed");
  }
});


app.put("/delete-all", async (req, res) => {
  const { deleteSecret } = req.body;

  if (deleteSecret !== process.env.DELETE_SECRET) {
    return res.status(403).send("nope wrong delete code");
  }

  try {
    let nextCursor = null;
    let deletedCount = 0;

    do {
      const result = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix: "participation-machine/",
        max_results: 100,
        next_cursor: nextCursor
      });

      const publicIds = result.resources.map((img) => img.public_id);

      if (publicIds.length > 0) {
        const deleteResult = await cloudinary.api.delete_resources(publicIds, {
          resource_type: "image",
          invalidate: true
        });

        console.log("DELETE ALL RESULT:", deleteResult);
        deletedCount += publicIds.length;
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    cachedImages = [];
    lastFetchTime = 0;

    res.status(200).send(`deleted ${deletedCount} images`);
  } catch (err) {
    console.log("DELETE ALL ERROR:", err);
    res.status(500).send("delete all failed");
  }
});

// every 5 minutes wipe all images from cloudinary
setInterval(async () => {

  console.log("STARTING 5 MINUTE WIPE");

  try {

    const result = await cloudinary.api.delete_resources_by_prefix(
      "participation-machine/",
      {
        resource_type: "image",
        invalidate: true
      }
    );

    console.log("5 MINUTE DELETE RESULT:", result);

    // clear backend cache
    cachedImages = [];
    lastFetchTime = 0;

  } catch (err) {

    console.log("5 MINUTE DELETE ERROR:", err);

  }

}, 10 * 60 * 1000);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});