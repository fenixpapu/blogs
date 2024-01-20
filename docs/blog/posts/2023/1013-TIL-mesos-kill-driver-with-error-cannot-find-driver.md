---
authors:
  - PaPu
categories:
  - devops
date: 2023-10-13
draft: false
---

# TIL Mesos kill driver with error cannot find driver

- Note lại bài này cho kinh nghiệm về mesos và aws :D

- Bên mình dùng mesos để handle spark job. Trước khi job mới chạy thì sẽ kill job cũ.

- Mọi chuyện vẫn bình thường cho đến khi:

<!-- more -->

```linenums="1"
{
  "action" : "KillSubmissionResponse",
  "message" : "Cannot find driver",
  "serverSparkVersion" : "3.0.1",
  "submissionId" : "driver-20231013041033-0802",
  "success" : false
}
```

- Check lại các thay đổi thì mesos có bị đổi master. Driver được tạo bởi master01 nhưng khi kill job thì master02 đã lên làm master nên nhận về response kia.
- Do call qua domain nên tự động redirect vào con master. Nên cần call trực tiếp vào con master01( lúc này là đang ko làm master).

- Lúc đầu mình ssh vào con master01 và call trực tiếp trên con master01:

```linenums="1"
curl -X POST http://localhost:7077/v1/submissions/kill/driver-20231013041033-0802
```

- Response:

```linenums="1"
curl: (7) Failed to connect to localhost port 7077: Connection refused
```

- Mình nghi nghờ do security group chưa allow (có thể là từ chính IP của ec2 này). Nên vpn vào cùng vpc rồi call:

```linenums="1"
curl -X POST http://10.20.30.40:7077/v1/submissions/kill/driver-20231013041033-0802
```

- Với `10.20.30.40` là IP của master01 thì lúc này thành công:

```linenums="1"
{
  "action" : "KillSubmissionResponse",
  "message" : "Killing running driver",
  "serverSparkVersion" : "3.0.1",
  "submissionId" : "driver-20231013041033-0802",
  "success" : true
}
```

- Hai điều cần lưu ý ở đây:

  - Mesos nếu nhận về: `Cannot find driver` khi kill job thì có thể do master hiện tại ko biết job đó nên cần kill trực tiếp trên master đã tạo ra.
  - Call từ local ko được thì sửa SG hoặc có thể đứng từ 1 host khác connect được đến để call

- HAPPY WORKING!!!
