---
authors:
  - PaPu
categories:
  - devops
date: 2023-10-09
draft: false
---

# Deploy aws lambda from terminal

- Cần nói trước có nhiều cách deploy lambda function hay hơn ( bằng sls (serverless) khi bạn tạo project từ serverless) hoặc từ terraform. Tuy nhiên đôi khi lambda function đã có sẵn và được deploy từ terminal nên mình cũng deploy luôn chứ ko tạo lại từ đầu theo 2 cách trên.

- Deploy từ terminal này cũng là cho source code và deploy từ `.zip` file ko phải cho images (lambda có hỗ trợ cả images ko riêng source code).

## Zip file

- Bên trong thư mục source code đã đầy đủ dependencies (ví dụ: Nodejs thì cần `npm install` hoặc `yarn install` ), doc aws bảo thế :D: [A .zip file archive includes your application code and its dependencies.](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip)

- Sau đó zip files thôi:

```linenums="1"
zip -r function.zip ./
```

## Update source code:

- Deploy source code mới:

```linenums="1"
aws lambda update-function-code \
--function-name <lambda_function_name> \
--zip-file fileb://./function.zip \
--region us-east-1
```

- Do ở trên mình zip vào file: `function.zip` nên ở đây mình deploy với file name như vậy.

## Nhận xét

- Đây là 1 step deploy code với lambda đã có sẵn nhé. Nên cần phân biệt:
  - `update-function-code`: để deploy code mới.
  - `update-function-configuration`: để thay đổi cấu hình lambda
