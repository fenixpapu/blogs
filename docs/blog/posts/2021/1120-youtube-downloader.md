---
authors:
  - PaPu
categories:
  - dev
  - python
date: 2021-11-20
draft: false
---

# youtube downloader tool

- Mình có tạo 1 repo [ở đây](https://github.com/y110t/ydl), script mới chỉ support download khi thêm link thủ công. Hy vọng sẽ sớm nâng cấp được tool thành bản phần mềm :muscle:

- Lúc đầu định dùng [pytube](https://github.com/pytube/pytube) với thời điểm `20-11-2021` có 4.9k start, 155 watch. Xong lướt lướt search thử stackoverflow wtf [youtube-dl](https://github.com/ytdl-org/youtube-dl) `20-11-2021` 106k start, 2.2k watch.

- Thôi dùng thư viện youtube-dl luôn :))
<!-- more -->
- Tạo file: `requirements.txt` với thư viện duy nhất(thời điểm hiện tại chỉ support link insert thủ công):

```linenums="1"
youtube-dl==2021.6.6
```

- Tạo file `main.py`:

```python linenums="1"
import youtube_dl

ydl_opts = {
  # 'outtmpl': os.path.join(download_path, '%(title)s-%(id)s.%(ext)s'),
}

with youtube_dl.YoutubeDL(ydl_opts) as ydl:
  ydl.download(['https://www.youtube.com/watch?v=WwOY1o16T4s'])
```

- Rồi chạy lệnh: `pip install -r requirements.txt ` và sau đó `python main.py` để download video về thôi.

- Thư viện này có thể download từ nhiều trang ko riêng youtube, mình cũng có thắc mắc download khá lâu, ko biết có thể chia nhỏ nhiều phần để download nhanh hơn không? Nếu trả lời được những câu hỏi trên mình sẽ câp nhật lại :D.
