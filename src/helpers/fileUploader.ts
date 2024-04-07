const Multer = require("multer");
const { getDownloadURL } = require("firebase-admin/storage");

import admin from "./initFirebaseService";
// Initialize Firebase Admin SDK

const bucket = admin.storage().bucket();

const multer = Multer({
  storage: Multer.memoryStorage(),
  // limits: {
  //   fileSize: 5 * 1024 * 1024 * 8, // no larger than 5mb
  // },
});

const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No image file");
    }
    let newFileName = `${file.originalname}_${Date.now()}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      reject("Something is wrong! Unable to upload at the moment.");
    });

    blobStream.on("finish", () => {
      // The public URL can be used to directly access the file via HTTP.
      getDownloadURL(fileUpload).then((url) => {
      return resolve({
          url: url,
          alt: file.originalname,
          type: file.mimetype,
        });
      });
    });

    blobStream.end(file.buffer);
  });
};
// Configure Multer middleware
function uploadImageToStorage(fields) {
  return function (req, res, next) {
    multer.fields(fields)(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).send("Error uploading file");
      }
      Object.keys(req.files).forEach(async (key) => {
        const filesArr = req.files[key];
        const urls = await Promise.all(filesArr.map(uploadFile));
        req.files[key] = urls;
        console.log(key, req.files[key], );
          next();
      });
    });
  
  };
}

export { multer, uploadImageToStorage };
