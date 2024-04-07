export const handleFileUpload = (req, res) => {
    // Access the uploaded file using req.files
    try {
      const file = req.files.file;
      console.log("file", file);
      res.json({ message: "File uploaded successfully", file: file[0]});
    } catch (error) {
      console.error("Error in file-upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  