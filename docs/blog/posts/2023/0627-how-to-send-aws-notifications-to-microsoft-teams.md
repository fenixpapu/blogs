---
authors:
  - PaPu
categories:
  - devops
date: 2023-06-27
draft: false
---

# How to send AWS notifications to Microsoft Teams

- From [dev.to](https://dev.to/aws-builders/how-to-send-aws-notifications-aws-sns-to-microsoft-teams-1d1l)

## Introduction

- Công ty mình chuyển từ slack sang dùng MS teams, và có yêu cầu push noti vào channel của team thay vì slack.

- Bài viết này đề cập hai giải pháp push noti từ aws vào MS team. Có hai cách: 1 là lambda + webhook và 2 là push thẳng sns vào email.

<!-- more -->

- Mục đích mình note lại việc MS team có support tạo email cho 1 channel (cái này lạ à nha).

## Using lambda và webhook.

- Lấy webhook từ MS team:

  - Từ channel của MS team -> dấu 3 chấm -> `connectors` -> `Incoming Webhook` -> `Configure`

- Đặt tên cho webhook, chọn `upload a logo` nếu muốn ( ví dụ noti từ aws có thể upload avatar AWS)

- Lưu lại đường link webhook.

- Bài viết này giả thiết chúng ta đã có lambda và subscribe vào 1 kênh SNS.

- Lambda function có thể dùng bất kỳ ngôn ngữ nào ( python, nodejs..) push noti vào link webhook vừa tạo ở trên.

## Send notification without lambda

- Từ channel của MS team -> dấu 3 chấm -> `Get email address` -> MS team sẽ tạo cho bạn 1 email tương ứng với channel đó.

- Với email vừa tạo có thể subscription thẳng vào SNS hoặc trước đó đã có lambda gửi email thì chỉ cần thêm email vừa tạo vào list nhận mail là xong.

## Happy coding :D
