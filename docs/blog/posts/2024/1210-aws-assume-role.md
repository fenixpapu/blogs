---
authors:
  - PaPu
categories:
  - devops
date: 2024-12-10
draft: false
---

# aws assume role

- Bài này về các cách switch role trong aws account hoặc giữa các aws account, về Role là gì mình có viết [1 bài hồi 2021 ở đây](../2021/1201-aws-switch-link-role.md)

## Assume role

1. AWS management console: (assume giữa các aws account)

- Đăng nhập trên giao diên web với account aws của mình
- Phía trên bên phải click vào aws account (ID hoặc name)
- Chọn: `Switch Role`
- Đăng nhập account ID muốn switch và role name sau đó click `switch role`
- Vậy chúng ta đã đăng nhập account của mình và switch sang role aws account khác

2. AWS CLI

- Sử dụng: `aws sts assume-role` command để switch:

```sh linenums="1"
aws sts assume-role --role-arn "arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME" --role-session-name SESSION_NAME
```

- Lệnh này sẽ trả về: Access key, Secret key, Session Token: có thể được sử dụng như biến môi trường hoặc dùng trong profiles

3. AWS SDKs

- AWS SDK (python, nodejs, java) cung cấp có thể assume trong quá trình code:

```python linenums="1"
import boto3

client = boto3.client('sts')
response = client.assume_role(
    RoleArn="arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME",
    RoleSessionName="SESSION_NAME"
)

credentials = response['Credentials']
```

4.  IAM Identity Center (Formerly AWS SSO)

- Cho trường hợp chúng ta dùng: IAM identity Center Portal

5. AWS Profiles in CLI Configuration

- Chúng ta có thể config nhiều profile trong `~/.aws/config` để switch role:

```sh linenums="1"
[profile ROLE_NAME]
role_arn = arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME
source_profile = base-profile
```

- Sử dụng profile name là: ROLE_NAME

```sh linenums="1"
aws s3 ls --profile default
```

- Chúng ta sẽ có 1 profile: `base-profile` ( ví dụ 1 account của devops), và 1 role: `ROLE_NAME` trong cấu hình trên khi dùng profile `ROLE_NAME` chúng ta switch từ source: `base-profile`

- Chắc vậy thôi, chúc mọi người làm việc vui vẻ :D
- **_HAPPY WORKING!!!_**
