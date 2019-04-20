# Dockerizing a Node.js web app

## Introdution

Hi guys! Sau khi có ý định tìm hiểu docker và đọc [document](https://docs.docker.com/get-started/). Nhận thấy để thực hành các phần của docker: `containers, services...` chúng ta cần có một image.

Bài hướng dẫn trên trang chủ của docker bằng `python` bản thân đang làm `nodejs`. Nên mình quyết định việc đầu tiên sẽ: build docker image của nodejs.

Mời các bạn theo dõi:

## Create the Node.js app

- Để tạo một docker container của Nodejs việc đầu tiên chúng ta phải tạo nodejs app, bằng cách tạo file `package.json` với nội dung như dưới:

```javascript
  {
    "name": "docker_web_app",
    "version": "1.0.0",
    "description": "Node.js on Docker",
    "author": "phucluongngoc@gmail.com",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.16.1"
    }
  }
```

- Từ `package.json` chúng ta sẽ cài gói phụ thuộc với `npm install`.
- Và tạo web app hết sức đơn giản trong `index.js` file:

```javascript
  'use strict';

  const express = require('express');

  // Constants
  const PORT = 8080;
  const HOST = '0.0.0.0';

  // App
  const app = express();
  app.get('/', (req, res) => {
    res.send('Hello world 2019!\n');
  });

  app.listen(PORT, HOST);
  console.log(`Devil's running on http://${HOST}:${PORT}`);
```

- Done! Thử check lại web-app của chúng ta có hoạt động.
- Đầu tiên khởi chạy server với: `npm start` sau đó thử request tới server chúng ta được kết quả như dưới:

```sh
  $ curl -i localhost:8080
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Content-Type: text/html; charset=utf-8
  Content-Length: 18
  ETag: W/"12-7ewqKCFbMISMUMaXguJLPYCIvw0"
  Date: Sat, 20 Apr 2019 08:59:27 GMT
  Connection: keep-alive

  Hello world 2019!
```

- Fine! Như vậy web-app của chúng ta hoạt động, phần tiếp theo sẽ tạo các cấu hình cần thiết để có build docker image từ web app này.

## Creating a Dockerfile

- Tạo một file trống với tên chính xác: `Dockerfile` bằng cách:

```sh
touch Dockerfile
```

- Image của chúng ta sẽ build dựa trên image gốc được cung cấp bởi Node bằng câu lệnh:

```sh
  FROM node:8
```

- Tiếp theo ta sẽ tạo thư mục chứa toàn bộ source code bên trong image. Đây cũng sẽ là thư mục làm việc của web app.

```sh
  #Create app directory
  WORKDIR /usr/src/app
```

- Bước tiếp theo chúng ta sẽ copy file `package*.json` và cài đặt các gói phụ thuộc cần thiết(thay vì copy toàn bộ) việc này cho phép tận dụng lợi thế cached của Docker layers).

```sh
  # Install app dependencies
  # A wildcard is used to ensure both package.json AND package-lock.json are copied
  # where available (npm@5+)
  COPY package*.json ./

  RUN npm install
  # If you are building your code for production
  # RUN npm ci --only=production
```

- COPY toàn bộ source code vào trong Docker image với câu lệnh:

```sh
  #Bundle app source
  COPY . .
```

- Map tới port 8080 của container

```sh
  EXPOSE 8080
```

- Khởi chạy ứng dụng:

```sh
 CMD ["npm", "start"]
```

- `Dockerfile` hoàn chỉnh của chúng ta trông sẽ như thế này:

```sh
  FROM node:8

  #Create app directory
  WORKDIR /usr/src/app

  # Install app dependencies
  # A wildcard is used to ensure both package.json AND package-lock.json are copied
  # where available (npm@5+)
  COPY package*.json ./

  RUN npm install
  # If you are building your code for production
  # RUN npm ci --only=production

  #Bundle app source
  COPY . .

  EXPOSE 8080

  CMD ["npm", "start"]
```

## Add .dockerignore file

- Tạo file `.dockerignore` cùng cấp với file `Dockerfile`. Cấu hình dưới sẽ chỉ cho docker biết bỏ qua các file ko cần copy vào trong image:

```sh
  node_modules
  npm-debug.log
```

## Building our image

- Chúng ta đã setup xong web app và cấu hình cho docker. Bước tiếp theo build docker image từ các chuẩn bị đó:

```sh
  docker build -t node-web-app .
```

- `-t node-web-app` gắn cho image được một tag với tên `node-web-app`.
- Đừng quên `.`, nó có thể là PATH hoặc URL, dấu chấm `.` cho docker biết sẽ đọc file `Dockerfile` cùng cấp với thư mục đang chạy lệnh `docker build`

## Run the image

- Khởi chạy image với `-d` | detached mode, để container chạy nền ( background). `-p` để map port local với port trên container.

```sh
  docker run -p 3000:8080 -d node-web-app
```

- Kiểm tra container của bạn đang chạy 

```sh
  # Get container ID
  docker ps

  # Print app output
  docker logs <container id>
```

- Nếu cần login bên trong container đang chạy, thực hiện lệnh sau:

```sh
  docker exec -ti <container id> /bin/bash
```

## Test

- Thử truy cập tới dịch vụ, ta sẽ được như dưới:

```sh
  # curl -i localhost:3000
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Content-Type: text/html; charset=utf-8
  Content-Length: 18
  ETag: W/"12-7ewqKCFbMISMUMaXguJLPYCIvw0"
  Date: Sat, 20 Apr 2019 09:56:54 GMT
  Connection: keep-alive

  Hello world 2019!
```

## Question

- Một số câu hỏi mình thắc mắc khi build image này:

  1. `Port` trong web-app, và `EXPOSE` trong `Dockerfile`, trong `-p 3000:8080` khi run image có mối liên hệ như thế nào?

    `Port` trong web-app là port cấu hình dịch vụ. Web-app sẽ lắng nghe request thông qua port này.

    `EXPOSE` trong `Dockerfile` chỉ ra rằng container lắng nghe trên cổng này trong mạng (`network`) cụ thể.

    `-p 3000:8080` Giúp map giữa `localhost:3000` vào port `8080` của container. Lưu ý container và localhost thuộc 2 dải mạng khác nhau.

    Hai port của `-p` và `EXPOSE` mang hai ý nghĩa khác nhau, không liên quan. Bạn có thể command `EXPOSE` và chạy lại. Container khác ( nếu có) được cấu hình cùng dải mạng với conatiner web-app sẽ ko truy cập được. Nhưng từ máy chủ sẽ vẫn truy cập được qua: `localhost:3000`. Không tin à? Làm thử đi thì biết :D.

  2. Chẳng phải `COPY . .` sẽ copy toàn bộ source code vào trong image rồi. Tại sao lại phải copy `package.json` và `npm install` trước.

    `npm install` thường là bước tốn thời gian, nhưng chúng ta chỉ cần chạy lại nó khi `package.json` có sự thay đổi. Bởi vậy thường bước một sẽ cài các gói phụ thuộc và bước hai mới thực sự thêm source code. Ví dụ khi bạn thay đổi source code `src/*.js` nhưng không thay đổi các gói phụ thuộc `package.json`. Nhờ thực hiện theo cách này, khi bạn build lại image, Docker sẽ không cần chạy lại chúng(`npm install`). Nguyên nhân từ cách Docker image được build ( dựa trên layer và cache).

- Cảm ơn mọi người đã theo dõi tới bước này :D.
