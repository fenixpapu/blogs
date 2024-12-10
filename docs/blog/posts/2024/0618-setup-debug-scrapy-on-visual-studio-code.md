---
authors:
  - PaPu
categories:
  - python
date: 2024-06-18
draft: false
---

# Setup debug scrapy on visual studio code

## Why scrapy

- Có thể dùng nhiều tool khác nhau để crawl data tại sao lại chọn scrapy:
  - Nodejs ? mình muốn thực hành python (cho các mục đích khác nữa nên ko chọn nodejs - playwright native trên nodejs).
  - playwright trên python, selenimum...mấy thằng này mục đích cho automation test hơn là crawl data (scrapy sẽ nhanh gọn hơn).
  - crawl data mà trên python có thể dùng `beautifulsoup` cũng khá phổ biến nhưng nó ...chậm.

## Set up

- Mình có thói quen luôn muốn setup debug để đặt break point, debug bằng `print` thấy cực cực.
- Sau khi setup project như doc của scrapy chúng ta có thể setup thêm để debug được trên visual studio code như ở [official doc](https://docs.scrapy.org/en/latest/topics/debug.html#visual-studio-code)
- Tạo file `launch.json` với nội dung:

```json
{
  "version": "0.1.0",
  "configurations": [
    {
      "name": "Python: Launch Scrapy Spider",
      "type": "python",
      "request": "launch",
      "module": "scrapy",
      "args": ["runspider", "${file}"],
      "console": "integratedTerminal"
    }
  ]
}
```

- Đổi `${file}` với đường dẫn tương đối tới spider bạn cần debug. Ví dụ 1 đường dẫn tương đối trong project scrapy của mình sẽ có dạng ntn: `spiderweb/spiders/aws_architecture.py`

- Yeah chỉ vậy thôi trỏ tới spider bạn cần debug sau đó F5 là debug ok -> có thể view variable và trong `debug console` giờ có thể chạy thử code để xem ntn

- hehe **_HAPPY WORKING_**
