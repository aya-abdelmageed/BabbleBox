import { handleFileUpload } from "controllers/cloud.controller";
import { uploadImageToStorage } from "helpers/fileUploader";
import { Router } from "express";

const router = Router();

router.post(
  "/upload",
  uploadImageToStorage([{ name: "file", maxCount: 1 }]),
  handleFileUpload
);

export default router;
