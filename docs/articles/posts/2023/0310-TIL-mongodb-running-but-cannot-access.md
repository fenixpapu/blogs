---
authors:
  - PaPu
categories:
  - devops
date: 2023-03-10
draft: false
---

# Today I learned: Mongodb is running but I cannot access

- Bài này không đủ dài để làm một bài đăng blog. Nhưng như tiêu đề: `today I learned`, nó làm mình mất thời gian nên cần note lại để lâu lâu đọc lại nhớ lần sau ko bị :))

- Nay có issue mongodb chết ( trước đó có cảnh báo full ổ, nhưng khi mình check thì ai đó đã nâng lên 1T và đang dùng có 74%).

- Mình check thấy service failed. Đã restart lại service mongo với cả 2 lệnh:

```linenums="1"
systemctl restart mongod.service
service mongod restart
```

- Sau đó thử stop, rồi start lại service vẫn running nhưng ko access được.

```linenums="1"
telnet localhost 27017
connection refused
```

- Trong khi đó con số 2 (bên mình chạy mongo replicas PRA) vẫn telnet bình thường.

- Sau đó a sếp check thì báo có lỗi:

```linenums="1"
Error: ENOSPC: no space left on device, write
```

- Lỗi output ra khi chạy lệnh: `service mongod status` (trước đó mình cũng check rồi nhưng ko hiểu mắt mũi để đâu ko thấy?)

- Vấn đề ở đây là ec2 2 volume. Volume của mongo thì mới dùng 74% nhưng vol của root như log trên thì full. Sau khi free ổ cứng cho root thì mongo lại vào bình thường.

- Vậy đó trước đó mình cứ đi theo hướng check mongo service thì bao giờ fix xong bug. Vậy nên ngoài phân vùng của db còn cần nhớ đến phân vùng root nữa (có thể cả trường hợp với các service khác cũng vậy).

- **HAPPY WORKING!!!**
