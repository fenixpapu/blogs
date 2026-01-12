---
authors:
  - PaPu
categories:
  - devops
date: 2024-06-13
draft: false
---

# TIL AWS ASG switch from launch configuration to launch template without downtime

- Trên AWS nếu bạn có các ASG (auto scaling group) được tạo từ lâu thì có thể các ASG này vẫn đang chạy từ `launch configuration`, và hiện tại aws đã khuyến nghị đổi sang `launch template` hướng dẫn của aws [tại đây](https://docs.aws.amazon.com/autoscaling/ec2/userguide/migrate-to-launch-templates.html). Một số ưu điểm launch templates:

  - Dễ quản lý các version hơn
  - Các tính năng hỗ trợ mới nhất (launch configuration 1 số ec2 có thể ko khởi tạo được)

- Switch `launch configuration` sang `launch template` theo doc thì cũng khá đơn giản và chẳng có gì để nói: copy từ `configuration` sang template là xong.
- Cho tới bước replace instance
<!-- more -->
- Sau khi đổi sang dùng `launch template` các instance đã tồn tại sẽ ko bị ảnh hưởng, các instance tạo mới sẽ sử dụng `launch template` và có 1 số tuỳ chọn để stop instance cũ:

  - [Termination policies](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-termination.html) : nghĩa chúng ta sẽ định nghĩa instance nào được ưu tin terminate trong quá trình scale in - out
  - [Instance refresh](https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html) dùng instance refresh của ASG
  - terminate thủ công bằng tay :D

- Mình dùng instance refresh của ASG và vấn đề ở chỗ option này đảm bảo số ec2 instance up ( ví dụ bạn có 4 instances up và chọn min 50% up): -> ASG chỉ đảm bảo ec2 up chứ ko phải service ready -> tắt các con cũ rất nhanh và up con mới nhưng service thì chưa ready -> down time :D.
- Chỉ vậy thôi nếu muốn ko có downtime thì `KHÔNG` nên dùng với cách `instance refresh` này :D

- Dù sao thì: **_HAPPY WORKING_**
