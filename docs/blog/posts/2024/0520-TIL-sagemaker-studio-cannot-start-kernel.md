---
authors:
  - PaPu
categories:
  - devops
date: 2024-05-20
draft: false
---

# TIL Sagemaker Studio can not start kernel

## Hiện tượng

- Sau khi dùng terraform khởi tạo sagemaker với `VPC only` mode thành công và vào sagemaker studio classic thì mình không thể khởi tạo notebook được. Với error output là ko start kernel được.
- Trước đó nếu để `public access` thì start notebook từ studio bình thường.
- Search thử chatGPT thì toàn báo lỗi liên quan VPC endpoint tới sagemaker API ( điều này là hợp lý) nhưng không liên quan case của mình, vì mình đang có 1 sagemaker khác không hề có VPC endpoint mà vẫn khởi tạo được notebook như bình thường.
- Lỗi ntn:
![can not start kernel for notebook from sagemaker studio](../../images/2024/0520-TIL-sagemaker-studio-cannot-start-kernel.png)
<!-- more -->

## Nguyên nhân

- Sau 1 hồi tâm sự với `chatGPT`, rồi lại về với `stackoverflow` thì vòng lại về doc troubleshoot của aws :D : [kernel gateway application issues](https://docs.aws.amazon.com/sagemaker/latest/dg/studio-troubleshooting.html#studio-troubleshooting-kg)

  - Cái đầu tiên doc này nói là phải allow inbound rule với range port khá lớn (lưu ý allow range port khá lớn nhưng chúng ta đang ở trong VPC only mode): `8192-65535`
  - Sau khi đổi current inbound:

  ```yml
  ingress {
  from_port   = 443
  to_port     = 443
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  }
  ```

  - về thành:

  ```yml
  ingress {
  from_port   = 8192
  to_port     = 65535
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  }
  ```

  - thì cuối cùng mình cũng đã start được notebook từ sagemaker studio trong `VPC only` mode (điều này giúp notebook kết nối tới database trong private subnet)
  - Bonus: với terraform ko hiểu sao nhưng khi khởi tạo domain bằng resource `aws_sagemaker_domain` thì cái `default_user_settings` setup: `execution_role` có vẻ như không ăn ( bằng chứng lên giao diện user trong sagemaker domain - ít nhất là khi tạo với IAM authentication mode) cái role này không ăn. Mà cần tạo `execution_role` trong resource: `aws_sagemaker_user_profile` thì lúc này lên giao diện mới thấy role này ăn vào user.
  - Nên check cẩn thận khi fix bug này, chatGPT sẽ hướng dẫn tạo VPC endpoint ( nghe thì có lý nhưng nếu không cần thì nên xoá bỏ) - ko cần VPC endpoint mà vẫn đáp ứng được yêu cầu thì nên xoá bỏ - vì đơn giản VPC endpoint mất tiền. Mình đã test thêm 1 lần nữa để chắc chắn ko cần vpc endpoint nên mình xoá bỏ.

- P/s: định ăn sổi đi tắt đón đầu, copy terraform code từ chatGPT vào mà cuối cùng mất 3 ngày (2 ngày cuối tuần) để vòng lại vẫn phải đọc doc của aws (cwl)

- Dù sao thì: **_ HAPPY WORKING :D _**
