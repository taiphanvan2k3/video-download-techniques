# Video Download Techniques

## 1. Progressive Download

✅ **Progressive Download** không phải là một giao thức khác mà là cách trình duyệt tải và phát video dần dần bằng **HTTP Range Requests**.

### Cách hoạt động:
- Khi trình duyệt gặp thẻ `<video>`, nó sẽ:
  - Gửi request có header `Range` để lấy một đoạn byte của file
  - Server trả lại HTTP 206 Partial Content với phần dữ liệu đó
  - Trình duyệt buffer và phát ngay trong khi tải tiếp

👉 **Progressive Download**: fetch theo range để phát ngay mà không cần chờ tải xong toàn bộ file.

### Đặc điểm kỹ thuật:
- Trình duyệt gửi HTTP Range Requests để tải video từng phần
- Server (bất kỳ) trả HTTP 206 Partial Content cho những đoạn được yêu cầu
- Thẻ `<video>` sẽ lấy và phát dần, cho phép seek/tua đến giữa video

### Ưu điểm:
👀 Progressive Download không phải là giao thức mới, mà chỉ là HTTP + range requests để phục vụ video.
→ Không cần custom server nếu server hiện tại hỗ trợ HTTP Range (Nginx, http-server, Express static, MinIO, S3, CDN đều hỗ trợ).

📌 Dù là file local hay HTTP, browser vẫn gửi range requests và tự handle progressive download.

### Ví dụ triển khai:

**Tự custom server để trả về file video theo range request:**
![Custom Server](image/readme/1768151025043.png)

**Thẻ video + local file vẫn hỗ trợ range request:**
![Local File Support](image/readme/1768151094582.png)

*Progressive Download không bắt buộc "phải custom server" - nó đơn giản là dùng HTTP Range để tải video từng phần. Server có thể là bất kỳ server HTTP nào hỗ trợ Range (static server, S3, MinIO, CDN, Express, Nginx,...)*

## 2. HLS (HTTP Live Streaming) Download

HLS là giao thức streaming video phổ biến, chia video thành các segment .ts nhỏ và sử dụng playlist .m3u8 để quản lý.

### Tạo file HLS đơn giản:

```bash
ffmpeg -i ubuntu_installation.mp4 -c:v libx264 -c:a aac -b:a 128k -f hls -hls_time 10 -hls_list_size 0 hls/ubuntu_installation/master.m3u8
```

Lệnh này sẽ tạo ra:
- 1 playlist `master.m3u8`
- Các file segment `.ts` trong thư mục `hls/ubuntu_installation`

### Tạo HLS với nhiều chất lượng (Adaptive Bitrate):

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

### Chạy server HLS:

```bash
http-server ./hls/ubuntu_installation -p 8080 --cors
```

### Sử dụng ở Frontend:

Ở phía frontend chỉ cần gọi file `master.m3u8`. Trình duyệt sẽ:
- Đọc nội dung file master playlist
- Dựa vào đường truyền internet để chọn chất lượng phù hợp
- Tự động tải và phát các segment

![Master Playlist](image/readme/1768151475672.png)

![HLS Streaming](image/readme/1768151504957.png)

![Quality Selection](image/readme/1768151534574.png)

![HLS Server](image/readme/1768151593151.png)

