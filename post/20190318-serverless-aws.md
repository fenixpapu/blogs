# DEPLOY MỘT REST API SỬ DỤNG SERVERLESS, EXPRESS VÀ NODE.JS

## MỞ ĐẦU

- Có nhiều lý do để chúng ta tìm hiểu serverless: AWS là nhà cung cấp cloud lớn. Serverless là dịch vụ nổi tiếng được nhiều công ty sử dụng.
- Cá nhân: trong project có sử dụng serverless và còn một vài chỗ chưa được rõ ràng nên mình muốn tìm hiểu.
- Các phần tiếp theo sẽ trình bày cách sử dụng serverless deploy một API.

- LET START!

## DEPLOY REST API

### [Cài đặt serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)

- Muốn deploy được một API bằng serverless chúng ta cần cài đặt các phần dưới đây trước:
  - [NodeJS](https://nodejs.org/en/download/)
  - [Serverless CLI v1.9.0 hoặc mới hơn](https://www.npmjs.com/package/serverless)
  - [Một tài khoản AWS](https://portal.aws.amazon.com/billing/signup#/start)
  - [Thiết lập Provider Credential với tài khoản AWS của bạn](https://www.youtube.com/watch?v=KngM5bfpttA)

- Nếu bạn gặp khó khăn trong việc cài `serverless CLI` khi có `nvm` có thể hãy thử  gỡ bỏ `nvm`.

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

- Đoạn code trên gần như ví dụ đơn giản của [Express document](https://expressjs.com/en/starter/hello-world.html) ngoại trừ thêm hai điểm nhỏ: thêm gói `serverless-http` và export ra function `handler`.

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

- Chúng ta vừa tạo cấu hình cơ bản cho serverless có thể chạy được: Tạo một function `app` trong `serverless.yml` sử dụng `handler` được export từ `index.js`. Cuối cùng function được cấu hình với một vài http trigger.

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

- Nếu code của bạn sai, deploy vẫn trả về một public link, nhưng truy cập có thể trả về message internal server error. Hãy dùng `sls logs` để [xem log](https://serverless.com/framework/docs/providers/aws/cli-reference/logs/) của các function.

- Thử truy cập chúng ta thấy server đã hoạt động:

  ![Hello World](../images/20190318_2_server_work.png)

- Dùng serverless deploy một API chỉ *đơn giản* vậy thôi: File `index.js` triển khai một Express app. API này được wrap bởi middleware `serverless-http` và export ra như một function `handler`, function này sau đó sẽ được sử dụng trong cấu hình serverless file `serverless.yml`.

- Hiện tại API chưa có gì. Phần tiếp theo chúng ta sẽ cùng thử thêm [DynamoDB](https://aws.amazon.com/dynamodb/) như nơi lưu trữ dữ liệu cho API.

## THÊM DYNAMODB CHO REST-API

### Các khái niệm

- Để hiểu các cấu hình trong serverless bạn nên nắm được các khái niệm trong [User Guide](https://serverless.com/framework/docs/providers/aws/guide/functions/#environment-variables). Phần dưới đây sẽ trình bày vắn tắt một số khái niệm cơ bản.

- SERVICE

  - Một service giống như một project. Trong demo service chính là `my-first-serverless`. Service này là nơi định nghĩa các:  `AWS lambda Function` (`app` trong demo), `events` sẽ trigger các funciton, `resource` là các nguồn tài nguyên được sử dụng bởi service. Tất cả đều được định nghĩa trong file `serverless.yml`.

  - Mức beginer có thể để chung tất cả các `funciton` , `event` và `resource` như trong demo trên. Tuy nhiên khi ứng dụng phát triển chúng ta có thể chia nhỏ service theo `work flow` hoặc `data model`.

  - **LƯU Ý**: Thời điểm hiện tại mỗi một service sẽ chỉ tạo riêng một REST API trên AWS API Gateway hay chúng ta sẽ chỉ có một domain / REST API. Lưu ý giới hạn này nếu bạn muốn tạo một REST API lớn.

- VARIABLE

  - Giúp chúng ta tùy biến giá trị trong cấu hình `serverless.yml`. Đặc biệt hữu dụng khi cần làm việc với thông tin mật hay trên nhiều môi trường: dev, stg, prd. Mức beginer chúng ta nên nắm các loại `variable` như dưới.
  - Recursively reference properties:
    - Sử dụng chính các thuộc tính trong cấu hình như là biến:
  
      ```yml
      provider:
      name: aws
      stage: ${opt:stage, 'dev'}
      environment:
        MY_SECRET: ${file(../config.${self:provider.stage}.json):CREDS}
      ```

    - Khi deploy service:  `sls deploy --stage qa`. Thuộc tính `stage` sẽ được gán giá trị  `qa` và sử dụng trong `${file(../config.${self:provider.stage}.json):CREDS}` lúc này sẽ thành: sử dụng key `CREDS` đã được định nghĩa trong `config.qa.json`.

  - Referencing Environment Variables:

    - Để sử dụng biến môi trường chúng ta sử dụng cú pháp: `${env:SOME_VAR}` trong file `serverless.yml`.  Các biến này được khai báo trong `process.env`.

    - **Note** : các thông tin nhạy cảm ( pass) có thể  bị hiển thị public ví dụ như: log build, CloudFormation templates.
  
      ```yml
      service: new-service
      provider: aws
      functions:
        hello:
          name: ${env:FUNC_PREFIX}-hello
          handler: handler.hello
        world:
          name: ${env:FUNC_PREFIX}-world
          handler: handler.world
      ```
  - Reference Variables in Other Files:
    - Chúng ta có thể truyền giá trị cho biến từ một các file khác như YAML hay JSON. Lưu ý file extension cần chính xác(`yml`, `json`).

      ```yml
      # myCustomFile.yml
      globalSchedule: rate(10 minutes)
      ```

      ```yml
      # serverless.yml
      service: new-service
      provider: aws
      custom: ${file(../myCustomFile.yml)} # You can reference the entire file
      functions:
        hello:
            handler: handler.hello
            events:
              - schedule: ${file(../myCustomFile.yml):globalSchedule} # Or you can reference a specific property
        world:
            handler: handler.world
            events:
              - schedule: ${self:custom.globalSchedule} # This would also work in this case
      ```

    - Trong ví dụ trên `customer` sẽ được gán giá trị: `globalSchedule: rate(10 minutes)` và các `schedule` được gán giá trị: `rate(10 minutes)`. Với file JSON cách làm tương tự.
  
  - Serverless còn support rất nhiều kiểu biến khác chúng ta có thể [xem thêm](https://serverless.com/framework/docs/providers/aws/guide/variables/):
    - Properties exported from Javascript files (sync or async).
    - Variables from S3.
    - Variables from AWS SSM Parameter Store.
    - Variables from AWS Secrets Manager.
    - CloudFormation stack outputs
    - Pseudo Parameters Reference

- [IAM](https://serverless.com/framework/docs/providers/aws/guide/iam/)

  - Mỗi Lambda function cần gán quyền để tương tác được với các tài nguyên AWS trong account của bạn. Các quyền này được set qua một AWS IAM Role, Serverless Framework sau đó sẽ tự động tạo cho mỗi dịch vụ serverless, và chia sẻ cho các function của bạn. Tuy nhiên, chúng ta có thể tùy biến các Role này.

- Plugins

  - Ngoài việc sử dụng các command sẵn có của Framework. Plugin chính là một code Javascript tạo mới hoặc mở rộng các lệnh sẵn có trong Serverless Framework.

### Cập nhật cấu hình serverless

- Sau khi đã nắm được một số khái niệm, cùng cập nhật thêm cấu hình cho ứng dụng:
  - Thêm table trong phần `resources` sử dụng cú pháp CloudFormation.
  - Thêm quyền IAM cho function trong phần `iamRoleStatements` của mục `provider`.
  - Truyền table name như biến môi trường(enviroment variable) để các function có thể sử dụng.

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

### Cập nhật code

- Để app sử dụng table được thêm ở trên. Chúng ta implement thêm 2 phương thức: POST và GET cho phép người dùng tạo: user và lấy thông tin user.
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

- API đã được deploy sử dụng serverless framework. Tuy nhiên nhìn lại có thể thấy chúng ta đang forward tất cả traffic và để Express xử lý toàn bộ các request này. Hãy sử dụng lợi thế của kiến trúc serverless bằng cách chia các route được handle bởi các Lambda function khác nhau, và bạn có thể biết:
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