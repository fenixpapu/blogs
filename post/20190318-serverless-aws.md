# DEPLOY MỘT REST API SỬ DỤNG SERVERLESS, EXPRESS VÀ NODE.JS

## MỞ ĐẦU

- Lý do bạn tìm hiểu serverless là gì?
  - Vì nghe nó nổi có nhiều công ty lớn sử dụng nên tìm hiểu?
  - Vì nó là sản phẩm của AWS?
  - Hay lý do nào khác?
- Cá nhân mình thì do muốn làm quen với các dịch vụ cloud của AWS, và trong project hiện tại có sử dụng Lambda function. Nên mình chọn serverless để bắt đầu luôn :D.
- Các phần dưới đây sẽ trình bày về cách deploy một API lên AWS sử dụng serverless, express và Nodejs.

OK LET GO!!!

## DEPLOY REST API

### [Cài đặt serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)

- Trước khi bắt đầu chúng ta cần cài đặt môi trường đã:
  - [NodeJS](https://nodejs.org/en/download/)
  - [Serverless CLI v1.9.0 hoặc mới hơn](https://www.npmjs.com/package/serverless)
  - [Một tài khoản AWS](https://portal.aws.amazon.com/billing/signup#/start)
  - [Thiết lập Provider Credential với tài khoản AWS của bạn](https://www.youtube.com/watch?v=KngM5bfpttA)

- Nếu bạn gặp khó khăn trong việc cài `serverless CLI` khi có `nvm` hãy thử  gỡ bỏ `nvm` xem sao.

 ### Create API

- Tạo thư mục với file `package.json`.

  ```bash
  mkdir my-first-serverless && cd my-first-serverless
  npm init -f
  ```

- Cài đặt các gói phụ thuộc cần thiết:

  ```bash
  npm install --save express serverless-http
  ```

- Để khởi tạo một REST API ngoài sử dụng `Express` chúng ta sẽ sử dụng thêm `serverless-http` như một middleware giao tiếp giữa NodeJS và API Gateway của AWS.

- Implement code file `index.js` như dưới:

  ```javascript
  // index.js
  const serverless = require('serverless-http');
  const express = require('express')
  const app = express()

  app.get('/', function (req, res) {
    res.send('Hello World!')
  })
  module.exports.handler = serverless(app);
  ```

### Config Serverless

- Trong cùng thư mục với hai file `index.js` và `package.json` ở trên chúng ta tạo file `serverless.yml` với nội dung:

  ```yml
  # serverless.yml
  service: my-first-serverless
  provider:
    name: aws
    runtime: nodejs6.10
    stage: dev
    region: us-east-1

  functions:
    app:
      handler: index.handler
      events:
        - http: ANY /
        - http: 'ANY {proxy+}'
  ```

- Nói qua một chút:
  - my-first-serverless: là tên service.
  - Khai báo một function `app` của serverless.
  - `app` sử dụng function handler trong file `index.js` như là một handler của mình: `handler: index.handler` để xử lý các sự kiện( `events`): `http`

### Deploy

- Dùng lệnh: `serverless deploy` hoặc ngắn gọn hơn `sls deploy`. Thêm `-v`(verbose) nếu bạn muốn xem chi tiết tất cả các tiến trình.

  ```console
  my-first-serverless$ sls deploy
  ...
  endpoints:
    ANY - https://8gagnsxxnl.execute-api.us-east-1.amazonaws.com/dev
    ANY - https://8gagnsxxnl.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
  functions:
    app: my-first-serverless-dev-app
  layers:
    None
  ```

- Nếu code của bạn sai, deploy có thể vẫn trả về một public link, nhưng truy cập có thể trả về message internal server error. Hãy dùng `sls logs` để [xem log](https://serverless.com/framework/docs/providers/aws/cli-reference/logs/) của các function.

- Thử truy cập chúng ta thấy server đã hoạt động:

  ![Hello World](../images/20190318_2_server_work.png)

- Dùng serverless deploy một API chỉ *đơn giản* vậy thôi! Ngoài ra:
  - Trong file `serverless.yml` có thể khai báo nhiều function thay vì chỉ có một function `app` như trong demo phía trên.
  - Function `app` đang xử lý các request đến server. Tuy nhiên có thể làm hoàn toàn ngược lại đó là dùng function để call tới một API khác. Lúc này function có thể đóng vai trò như một trigger.

- Hiện tại API chưa có gì. Phần tiếp theo chúng ta sẽ cùng thử thêm [DynamoDB](https://aws.amazon.com/dynamodb/) như nơi lưu trữ dữ liệu cho API.

## THÊM DYNAMODB CHO REST-API

### Cập nhật cấu hình serverless

- Cùng thay đổi cấu hình một chút như dưới:

  ```yml
  # serverless.yml

  service: my-first-serverless

  custom:
    tableName: 'users-table-${self:provider.stage}'

  provider:
    name: aws
    runtime: nodejs6.10
    stage: dev
    region: us-east-1
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:Query
          - dynamodb:Scan
          - dynamodb:GetItem
          - dynamodb:PutItem
          - dynamodb:UpdateItem
          - dynamodb:DeleteItem
        Resource:
          - { "Fn::GetAtt": ["UsersDynamoDBTable", "Arn" ] }
    environment:
      USERS_TABLE: ${self:custom.tableName}

  functions:
    app:
      handler: index.handler
      events:
        - http: ANY /
        - http: 'ANY {proxy+}'

  resources:
    Resources:
      UsersDynamoDBTable:
        Type: 'AWS::DynamoDB::Table'
        Properties:
          AttributeDefinitions:
            -
              AttributeName: userId
              AttributeType: S
          KeySchema:
            -
              AttributeName: userId
              KeyType: HASH
          ProvisionedThroughput:
            ReadCapacityUnits: 1
            WriteCapacityUnits: 1
          TableName: ${self:custom.tableName}
  ```

- Cấu hình trên chúng ta sẽ có:
  - Do `provider.stage: dev` nên `customer.tableName` sẽ là: `users-table-dev`.
  - Cung cấp cho function một `table` trong phần `resource` sử dụng cú pháp [CloudFormation](https://serverless.com/framework/docs/providers/aws/guide/variables/).
  - Thêm phân quyền IAM trong phần `iamRoleStatements`.

### Cập nhật code

- Để app sử dụng table đã thêm ở trên. Chúng ta sẽ thêm 2 phương thức: POST và GET cho phép người dùng tạo: user và lấy thông tin user.
- Đầu tiên cài đặt `aws-sdk` và `body-parser`:

  ```sh
  npm install --save aws-sdk body-parser
  ```

- Cập nhật lại code:

  ```javascript
  // index.js

  const serverless = require('serverless-http');
  const bodyParser = require('body-parser');
  const express = require('express')
  const app = express()
  const AWS = require('aws-sdk');


  const USERS_TABLE = process.env.USERS_TABLE;
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  app.use(bodyParser.json({ strict: false }));

  app.get('/', function (req, res) {
    res.send('Hello World!')
  })

  // Get User endpoint
  app.get('/users/:userId', function (req, res) {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId,
      },
    }

    dynamoDb.get(params, (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: 'Could not get user' });
      }
      if (result.Item) {
        const {userId, name} = result.Item;
        res.json({ userId, name });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  })

  // Create User endpoint
  app.post('/users', function (req, res) {
    const { userId, name } = req.body;
    if (typeof userId !== 'string') {
      res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== 'string') {
      res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: userId,
        name: name,
      },
    };

    dynamoDb.put(params, (error) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: 'Could not create user' });
      }
      res.json({ userId, name });
    });
  })

  module.exports.handler = serverless(app);
  ```

### Deploy

- Deploy để cập nhật lại cấu hình và code:

  ```sh
  sls deploy
  ```

- Sau khi có public link chúng ta thử tạo user:
  
  ```sh
  $ curl -H "Content-Type: application/json" -X POST https://8gagnsxxnl.execute-api.us-east-1.amazonaws.com/dev/users -d '{"userId": "FRAMGIA", "name": "SUN*"}'
  ```

- Trước khi deploy hãy chắc chắn bạn đã save code nếu không sẽ nhận được kết quả:
  
  ```sh
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="utf-8">
  <title>Error</title>
  </head>
  <body>
  <pre>Cannot POST /dev/users</pre>
  </body>
  </html>
  ```

- Sau khi save code deploy chúng ta đã có thể thêm mới user:

  ```yml
  $ curl -H "Content-Type: application/json" -X POST https://8gagnsxxnl.execute-api.us-east-1.amazonaws.com/dev/users -d '{"userId": "FRAMGIA", "name": "SUN*"}'
  {"userId":"FRAMGIA","name":"SUN*"}
  ```

- Thử GET lại thông tin user đã add. May quá GET được:

  ```sh
  $curl -H "Content-Type: application/json" -X GET https://8gagnsxxnl.execute-api.us-east-1.amazonaws.com/dev/users/FRAMGIA
  {"userId":"FRAMGIA","name":"SUN*"}
  ```

### Path specific routing

- API đã được deploy sử dụng serverless framework. Tuy nhiên nhìn lại có thể thấy chúng ta đang forward tất cả traffic và để Express xử lý toàn bộ các request này. Hãy sử dụng lợi thế của kiến trúc serverless bằng cách chia các route được handle bởi các Lambda function khác nhau, và khi đó bạn có thể biết:
  - Mỗi route đã được gọi bao nhiêu lần.
  - Có bao nhiêu lỗi đã xảy ra cho mỗi route.
  - Mỗi route mất bao lâu để có response(và bạn sẽ tiết kiệm được bao nhiêu tiền nếu tối ưu route đó có thời gian phản hồi nhanh hơn).
- Cấu hình có dạng như dưới:

  ```yml
  # serverless.yml

  functions:
    app:
      handler: index.handler
      events:
        - http: ANY /
        - http: 'ANY {proxy+}'
    getUser:
      handler: index.handler
      events:
        - http: 'GET /users/{proxy+}'
    createUser:
      handler: index.handler
      events:
        - http: 'POST /users'
  ```

### Options

- Để hiểu kĩ hơn về serverless bạn nên tìm hiểu qua một lượt [User Guide](https://serverless.com/framework/docs/providers/aws/guide/intro/)
- Để cấu hình serverless linh hoạt hơn, bạn nên xem kĩ các cách sử dụng [`variable`](https://serverless.com/framework/docs/providers/aws/guide/variables/) của serverless. Một số cách sử dụng nên ưu tiên xem trước:
  - Environment variables.
  - CLI options
  - External YAML/JSON files
  - CloudFormation stack outputs
  - Properties exported from Javascript files (sync or async)

## Billing

- Lưu ý [đoạn sau](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

  ```
  While in the AWS Free Tier, you can build an entire application on AWS Lambda, AWS API Gateway, and more, without getting charged for 1 year... As long as you don't exceed the resources in the free tier, of course.
  ```

- Bạn sẽ được dùng miễn phí một năm miễn sao không sử dụng tài nguyên vượt ngưỡng. Còn nếu vượt ngưỡng sẽ ra sao thì không nói ^^. Và cái account của bạn chắc chắn có link tới một thẻ có thể bị trừ tiền. Vậy nên hãy lưu tâm đến vấn đề này.

- Việc đầu tiên sau khi test thử dịch vụ đã ok mà không cần duy trì hãy `remove` ứng dụng bạn đã vừa deploy với lệnh:

  ```console
  sls remove
  ```
- Nếu bạn muốn để ứng dụng public để test. AWS có mục liên quan [billing](https://console.aws.amazon.com/billing/home?#/freetier) mục này sẽ cho bạn biết đang sử dụng tài nguyên hết bao nhiêu % của mức free ;).

- Hết! Cảm ơn bạn đã theo dõi tới phần này! :D