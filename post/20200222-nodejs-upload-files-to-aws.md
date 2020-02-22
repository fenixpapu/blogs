# Nodejs upload files to aws

## Introdution

- Dự án mình đang tham gia có sử dụng dịch vụ S3 của AWS. Nhân tiện tài khoản AWS đến 29/02/2020 cũng hết hạn free nên nay mình test thử luôn dịch vụ này của AWS.
- S3 là dịch vụ lưu trữ file của AWS. Trước khi sử dụng dịch vụ upload file lên chúng ta cần tạo Bucket( nơi sẽ chứa các file chúng ta upload lên).
- FYI: Khi bạn tạo tài khoản AWS một số dịch vụ sẽ free trong 12 tháng: EC2, S3, RDS, CloudFront ( nhớ đọc kỹ free như thế nào ví S3 sẽ free 5GB, 20k GET request và 2k PUT request - chỉ thế thôi, hơn tính phí đấy nên cẩn thận). Tuy nhiên nhiên một số dịch vụ khác lại luôn luôn miễn phí ( kể cả sau 12 tháng - nên tha hồ nghịch): DynamoDB, Lamda..

## Before start

- Trước khi bắt đầu chúng ta cần có 1 tài khoản AWS ( nếu bạn chưa có thì tạo nha).
- Tạo mới (nếu bạn chưa có) một [AWS Access Key](https://www.youtube.com/watch?v=KngM5bfpttA).

## Create Bucket

- Ok! Sau khi có tài khoản và Access Key chúng ta cần tạo Bucket để tải test upload file.
- Có nhiều cách để có thể tạo Bucket:

  - Bạn có thể tạo trực tiếp trên [trang AWS](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
  - Hoặc có thể tạo bằn [AWS cli](https://docs.aws.amazon.com/cli/latest/reference/s3/mb.html) với lệnh: `aws s3 mb s3://created-by-cli` với `created-by-cli` là tên của Bucket bạn muốn đặt.
  - Tạo bằng [API]](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

- Khi tạo Bucket còn rất nhiều thiết lập (tạo thử đi sẽ thấy :) ) như region, public, CORS.. theo mình cách 1 và 2 (tạo trên trang AWS, aws cli) chỉ nên thực hiện test cho biết. Còn lại nên tạo bằng API như vậy các thông số thiết lập sẽ được lưu lại không cần phải nhớ. Tuy nhiên trong ví dụ mình sẽ chỉ tạo theo kiểu default thôi :|

- Trước khi bắt đầu chúng ta set up project một chút.
- Tạo folder, khởi tạp project `npm init -y`, khởi tạo git: `git init`

```sh
mkdir nodejs-aws-s3
cd nodejs-aws-s3
npm init -y
git init
```

- Tạo file `config.json` với nội dung:

```json
{
  "BUCKET": "created-by-api",
  "REGION": "ap-southeast-1",
  "AWS_ACCESS_KEY": "NHAP_ACCESS_KEY_CUA_BAN_VAO_DAY",
  "AWS_SECRET_KEY": "NHAP_SECRET_CUA_BAN_VAO_DAY"
}
```

- Tạo một file `makeBucket.js` (cho trùng với aws-cli thôi ý mà)

```javascript
const AWS = require("aws-sdk");
const config = require("./config.json");

const REGION = config.REGION;
const ACCESS_KEY = config.AWS_ACCESS_KEY;
const SECRET_KEY = config.AWS_SECRET_KEY;

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION
});

var s3 = new AWS.S3();

const params = {
  Bucket: config.BUCKET,
  CreateBucketConfiguration: {
    LocationConstraint: "ap-southeast-1"
  }
};
s3.createBucket(params, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log(data);
});
```

- Cấu trúc thư mục hiện tại đang ntn:

```sh
.
├── config.json
├── makeBucket.js
├── node_modules
├── package.json
└── package-lock.json

```

- File `makeBucket.js` sẽ lấy cấu hình trong `config.json` và tạo mới một Bucket với tên `created-by-api`.
- Sau khi cài đặt các gói phụ thuộc `npm i aws-sdk`, cấu hình key chính xác, ta chạy file với: `node makeBucket.js` sẽ có output như sau là tạo thành công:

```sh
$ node makeBucket.js
{ Location: 'http://created-by-api.s3.amazonaws.com/' }
```

- ta cũng có thể kiểm tra bằng giao diện web hoặc cli, máy mình tạo Bucket theo các cách trên thì khi kiểm tra bằng cli sẽ có output như thế này:

```sh
$ aws s3 ls
2020-02-18 23:05:59 craft-created
2020-02-22 22:28:01 created-by-api
2020-02-22 10:49:55 created-by-cli
```

- Chỉ chạy 1 file `makeBucket.js` thôi sao phải cấu hình project, config các thứ làm gì? Hãy làm quen với cách quản lý các file cấu hình liên quan tới Key của các dịch vụ như AWS hay Google... một cách là bạn lưu vào file config và add file đó vào trong .gitignore. ( Nếu triển khai trên cloud thì các file cấu hình này nên được lưu vào vùng có mã hóa và hạn chế quyền truy xuất như vậy sẽ an toàn hơn). Sau đó banj có thể yên tâm đẩy project của mình lên github hoặc thâm trí share link repo cho người khác.

- File .gitignore của mình sẽ ntn:

```sh
config.json
node_modules/
```

## Upload file

- Sau khi đã có `bucket` chúng ta sẽ sang phần upload file lên S3

- Tùy thuộc dịch vụ của mình mà chúng ta có các cách upload file lên S3 khác nhau.

### Direct upload

- Bài tán thứ nhất: giả sử server của bạn tự tạo `invoice - hóa đơn` khi đó chúng ta cần đẩy trực tiếp file lên S3 và trả về link cho khách hàng xem hóa đợn.

- Để server trực tiếp đẩy file lên S3. Chúng ta tạo file `directUpload.js` với nội dung như sau:

```javascript
const AWS = require("aws-sdk");
const fs = require("fs");
const config = require("./config.json");

const BUCKET = config.BUCKET;
const REGION = config.REGION;
const ACCESS_KEY = config.AWS_ACCESS_KEY;
const SECRET_KEY = config.AWS_SECRET_KEY;

const localImage = "./cat.jpeg";
const imageRemoteName = `directUpload_catImage_${new Date().getTime()}.jpeg`;

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION
});

var s3 = new AWS.S3();

s3.putObject({
  Bucket: BUCKET,
  Body: fs.readFileSync(localImage),
  Key: imageRemoteName
})
  .promise()
  .then(res => {
    console.log(`Upload succeeded - `, res);
  })
  .catch(err => {
    console.log("Upload failed:", err);
  });
```

- Thư mục chúng ta lúc này thêm 2 file: `directUpload.js` và `cat.jpg`

```sh
.
├── cat.jpg
├── config.json
├── directUpload.js
├── makeBucket.js
├── node_modules
├── package.json
└── package-lock.json

1 directory, 6 files
```

- Chạy thử chương trình, ok upload ngon lành:

```sh
node directUpload.js
Upload succeeded -  { ETag: '"550cf35812c2447027f8e4d547a78adb"' }
```

### Upload with signedURL

- Bài toán thứ 2: Ứng dụng của bạn cho phép người dùng tải file trực tiếp lên S3. Lúc này không thể để người dùng tải lên server rồi server lại tải lên S3 được. Thay vì thế Client sẽ call server để lấy 1 `signedURL` và client sẽ dùng `signedURL` này để tải file lên S3.

- Đầu tiên ở phía server chúng ta tạo 1 file: `uploadWithSignedURL.js` với nội dung như sau:

```javascript
const cors = require("cors");
const aws = require("aws-sdk");
const express = require("express");
const configAWS = require("./config");

const app = express();
app.use(cors());
app.get("/sign-s3", (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query["file-name"];
  const fileType = req.query["file-type"];
  const s3Params = {
    Bucket: configAWS.BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(`getSignedUrl error: `, err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${configAWS.BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

app.listen(3000, () => {
  console.log("come here babe...");
});
```

- Đoạn server trên làm gì ? Khởi tạo một api nhận request với route `sign-s3` và các query: file-name, file-type. Sau đó request signedURL (với `s3.getSignedUrl`) và trả về cho client. Ok thế là đủ rồi, phần còn lại là của client.

- Ở đây mình sẽ tạo một file `ugly-client` `index.html` với nội dung như dưới:

```html
<html>
  <head> </head>
  <body>
    <input type="file" id="file-input" />
    <p id="status">Please select a file</p>

    <script>
      (() => {
        document.getElementById("file-input").onchange = () => {
          const files = document.getElementById("file-input").files;
          const file = files[0];
          if (file == null) {
            return alert("No file selected.");
          }
          getSignedRequest(file);
        };
      })();
      const getSignedRequest = file => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          `http://localhost:3000/sign-s3?file-name=${file.name}&file-type=${file.type}`
        );
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              uploadFile(file, response.signedRequest, response.url);
            } else {
              console.log("Could not get signed URL.");
            }
          }
        };
        xhr.send();
      };
      const uploadFile = (file, signedRequest, url) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedRequest);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log(`Upload succeed to: ${url}`);
            } else {
              console.log("Could not upload file.");
            }
          }
        };
        xhr.send(file);
      };
    </script>
  </body>
</html>
```

- Đến đây folder có thêm 2 file mới rồi nha:

```sh
.
├── cat.jpg
├── config.json
├── directUpload.js
├── index.html
├── makeBucket.js
├── node_modules
├── package.json
├── package-lock.json
└── uploadWithSignedURL.js

1 directory, 8 files
```

- Nói qua một chút. File chỉ có 1 thẻ input để người dùng chọn file. `Script` sẽ lắng nghe `onchange` để gửi request tới server bằng `getSignedRequest`. Ở đây mình đang fix cứng URL local như bạn thấy: `http://localhost:3000/sign-s3?file-name=${file.name}&file-type=${file.type}`. Sau khi nhận được signedURL do server trả về client sẽ upload file lên S3 bằng: `uploadFile`.

- Ok! Chạy thử luôn đi. Đầu tiên `npm i express cors`. Chạy server trước:

```sh
node uploadWithSignedURL.js
come here babe...

```

- Sau đó mở file `index.html` bằng chrome và chọn file `cat.jpg` chờ 1 lát `console` browser sẽ có như sau:

```sh

```
