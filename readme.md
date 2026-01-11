# Video Download Techniques

## 1. Progressive Download

✅ **Progressive Download** is not a different protocol but rather how browsers progressively download and play video using **HTTP Range Requests**.

### How it works:
- When the browser encounters a `<video>` tag, it will:
  - Send requests with `Range` header to get a byte segment of the file
  - Server returns HTTP 206 Partial Content with that data portion
  - Browser buffers and plays immediately while continuing to download

👉 **Progressive Download**: fetch by range to play immediately without waiting for the entire file to download.

### Technical Features:
- Browser sends HTTP Range Requests to download video in parts
- Any server returns HTTP 206 Partial Content for requested segments
- `<video>` tag progressively loads and plays, allowing seeking to the middle of the video

### Advantages:
👀 Progressive Download is not a new protocol, just HTTP + range requests for video serving.
→ No need for custom server if current server supports HTTP Range (Nginx, http-server, Express static, MinIO, S3, CDN all support it).

📌 Whether local file or HTTP, browser still sends range requests and handles progressive download automatically.

### Implementation Examples:

**Custom server to return video file by range request:**
![Custom Server](image/readme/1768151025043.png)

**Video tag + local file still supports range request:**
![Local File Support](image/readme/1768151094582.png)

*Progressive Download doesn't require a "custom server" - it's simply using HTTP Range to download video in parts. The server can be any HTTP server that supports Range (static server, S3, MinIO, CDN, Express, Nginx,...)*

## 2. HLS (HTTP Live Streaming) Download

HLS is a popular video streaming protocol that divides video into small .ts segments and uses .m3u8 playlist files for management.

### Create Simple HLS Files:

```bash
ffmpeg -i ubuntu_installation.mp4 -c:v libx264 -c:a aac -b:a 128k -f hls -hls_time 10 -hls_list_size 0 hls/ubuntu_installation/master.m3u8
```

This command will create:
- 1 playlist `master.m3u8`
- Segment `.ts` files in the `hls/ubuntu_installation` directory

### Create HLS with Multiple Qualities (Adaptive Bitrate):

```bash
ffmpeg -i ubuntu_installation.mp4 \
  -vf "scale=1920:-2" -c:v libx264 -b:v 5000k -c:a aac -b:a 192k \
  -hls_time 10 -hls_playlist_type vod \
  -hls_segment_filename "hls/ubuntu_installation/1080p_%03d.ts" \
  hls/ubuntu_installation/1080p.m3u8 \
  -vf "scale=1280:-2" -c:v libx264 -b:v 2500k -c:a aac -b:a 128k \
  -hls_time 10 -hls_playlist_type vod \
  -hls_segment_filename "hls/ubuntu_installation/720p_%03d.ts" \
  hls/ubuntu_installation/720p.m3u8 \
  -vf "scale=854:-2" -c:v libx264 -b:v 1200k -c:a aac -b:a 96k \
  -hls_time 10 -hls_playlist_type vod \
  -hls_segment_filename "hls/ubuntu_installation/480p_%03d.ts" \
  hls/ubuntu_installation/480p.m3u8
```

![HLS Creation](image/readme/1768150661299.png)

### Run HLS Server:

```bash
http-server ./hls/ubuntu_installation -p 8080 --cors
```

### Frontend Usage:

In the frontend, simply call the `master.m3u8` file. The browser will:
- Read the master playlist content
- Select appropriate quality based on internet connection
- Automatically download and play segments

![Master Playlist](image/readme/1768151475672.png)

![HLS Streaming](image/readme/1768151504957.png)

![Quality Selection](image/readme/1768151534574.png)

![HLS Server](image/readme/1768151593151.png)

## Demo Files

- `progressive-download.html` - Examples of progressive download (server-based and local file)
- `hls-basic.html` - Basic HLS player with automatic quality selection
- `hls-quality-selector.html` - HLS player with manual quality selection control
