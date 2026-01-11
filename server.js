import express from "express";
import fs from "fs";
import path from "path";

const app = express();

// Route stream video
app.get("/video", (req, res) => {
  const videoPath = path.join(process.cwd(), "assets", "videos", "output.mp4");

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;

  const range = req.headers.range;
  if (!range) {
    // Nếu frontend không gửi range thì trả về error hoặc toàn video
    return res.status(400).send("Requires Range header");
  }

  // Parse range header, format: "bytes=start-end"
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  // Nếu không có phần end thì mặc định tới end file
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Tính kích thước phần chunk cần trả
  const chunkSize = end - start + 1;

  // Set Headers
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`, // chỉ rõ phạm vi trả
    "Accept-Ranges": "bytes", // cho phép range requests
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4" // nhớ MIME đúng định dạng
  });

  // Stream file từ start tới end
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// Bật server
app.listen(3000, () => {
  console.log("Video server listening on http://localhost:3000");
});
