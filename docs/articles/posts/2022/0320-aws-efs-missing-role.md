---
authors:
  - PaPu
categories:
  - devops
date: 2022-03-20
draft: false
---

# Missing permission in the example IAM policy file

- Source form [github](https://github.com/kubernetes-sigs/aws-efs-csi-driver/issues/489)

- Mình không cùng kịch bản với bạn này - link github trên( của mình là hệ thống đang sử dụng rồi, zone `ap-southeast-1a` và `ap-southeast-1b` đang dùng bình thường). Nhưng khi deploy pod vào zone `ap-southeast-1c` thì nhận lỗi tương tự bạn này:

```linenums="1"
Output: Failed to resolve "fs-bdfc7009.efs.us-east-1.amazonaws.com". The file system mount target ip address cannot be found, please pass mount target ip address via mount options.
User: arn:aws:sts::888888888888:assumed-role/LordOfTheVolumes/i-0dc4f12f9fdb8dcd3 is not authorized to perform: elasticfilesystem:DescribeMountTargets on the specified resource
```

- Ông tạo ra issue đã fix được nhưng ko tạo merge commit mà kệ cho AWS sửa :v, cần thêm policy như dưới:

<!-- more -->

```linenums="1"
{
    "Effect": "Allow",
    "Action": [
        "elasticfilesystem:DescribeAccessPoints",
        "elasticfilesystem:DescribeFileSystems",
        "elasticfilesystem:DescribeMountTargets"
    ],
    "Resource": "*"
},
```

- Ồ sau khi thêm dòng trên thì mình hết lỗi trên nhưng vẫn còn 1 lỗi khác nữa và ông khác ở dưới cũng đã fix luôn lỗi này:D

```linenums="1"
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "elasticfilesystem:DescribeMountTargets",
              "ec2:DescribeAvailabilityZones"
          ],
          "Resource": "*"
      }
  ]
}
```

- Yeah vậy là tổng 2 phần trên sẽ fix được lỗi thiếu policy. Phần cuối trong case study của mình là EFS chưa enable trên zone `ap-southeast-1c` ( trước đó mình chỉ enable trên 1a và 1b). Và sau khi thêm xong thì pod trên k8s đã up và link được tới EFS.

- Happy be devops !!
