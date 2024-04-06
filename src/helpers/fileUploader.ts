import multer from "multer";

import admin from "./initFirebaseService";

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Firebase storage bucket
const bucket = admin.storage().bucket();

// Upload file to firebase storage 

export const uploadFile = async (file: any, folder: string) => {
  const { originalname } = file;
  const blob = bucket.file(`${folder}/${originalname}`);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  blobWriter.on("error", (err) => {
    console.error(err);
  });

  blobWriter.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    console.log(publicUrl);
  });

  blobWriter.end(file.buffer);

    return blobWriter;
};






