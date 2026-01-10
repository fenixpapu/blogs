---
authors:
  - PaPu
categories:
  - devops
date: 2024-12-10
draft: false
---

# nginx 502 bad gateway and pm2 no-daemon

- Nay support dự án gặp lỗi 502 bad gateway, mình note lại cho các lần sau nếu có :D

## Bug info

- Traffic từ user sẽ đi theo flow: `DNS --> cloudfront -> loadbalancer -> nginx(k8s) -> service`
- Context:
  - Các service trước đó đã chạy ok, service mới mình check config giống các service trước.
  - Nhưng khi truy cập theo sub domain thì bị lỗi nginx 502 bad gateway.
  - Vừa join dự án được 2 ngày chưa kịp hiểu chuyện gì check bug luôn (cwl)
  <!-- more -->

## Fix bug

- Sau khi search thử lỗi này có 1 số trường hợp:
  - Nginx config sai: tỷ lệ rất thấp, vì trước đó đã chạy ok giờ thêm y hệt.
  - Backend service lỗi: lúc đầu nghĩ ok rồi do ku em backend báo test ngon.
- Sau khi port-forward về local thử ( môi trường dev) thì thấy ko truy cập được thật, ngó lại docker build local thì ko vào được ( @#$%^&)

### solution

- Con service này có 2 process nodejs và chỉ có 1 đang chạy ( service cần expose ra đang ko chạy)
- Sau khi ku em backend support pm2 chạy đồng thời 2 nodejs process thì service đã ok: `pm2 start ./process.json --no-daemon`. Phải có `--no-daemon` mới work nhé, đã test. File `process.json` thì có dạng ntn:

```json linenums="1"
{
  "apps": [
    {
      "name": "facetec-dashboard",
      "script": "./server/bundle.js"
    },
    {
      "name": "proxy",
      "script": "./index.js"
    }
  ]
}
```

- ok sau khi sửa dockerfile để chạy được 2 process nodejs thì service đã up và sub domain cũng truy cập được.
- Happy working!!!
