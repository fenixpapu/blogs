# Setting up node project with typescript

## Introduction

- Như chúng ta đã biết JS là ngôn ngữ kiểu `[dynamic type](https://en.wikipedia.org/wiki/Programming_language#Static_versus_dynamic_typing)`.
- Typescript giúp có thể đọc và code JS như `static type` thay vì `dynamic type`.
- [Bài viết này](https://scotch.io/tutorials/setting-up-a-node-project-with-typescript) chú trọng tới cài đặt một dự án với typescript.

## Let's start

1. Initializing an Npm project

- Cùng khởi tạo nhanh project NodeJS:

  ```bash
    $ mkdir node_project
    $ cd node_project
    $ npm init -y
  ```

2. Installing Dependencies

- Chúng ta khởi tạo xong project. Phần tiếp theo cần cài đặt các gói phụ thuộc để có thể chạy được `typescript`

  ```bash
    npm i -D typescript
    npm i -D tslint
  ```

- Option `-D` viết tắt cho: `--save-dev`.
- Tiếp theo cài đặt `express` framework:

  ```bash
    npm i express -S
    npm i @types/express -D
  ```

- Câu lệnh thứ hai trên cài đặt Express types. Sở dĩ chúng ta cần package này vì TypeScript và Express là các package độc lập nhau do vậy không có cách nào để `Typescript` biết về các kiểu của các `classs` trong Express.

3. Configuring TypeScript

- Typescript sử dụng file `tsconfig.json` để cấu hình trình biên dịch cho project. Do vậy chúng ta khởi tạo file `tsconfig.json` cùng cấp với file `package.json` với nội dung như dưới:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist"
  },
  "lib": ["es2015"]
}
```

- Cùng nhìn qua một vài tùy chọn trên và chúng làm gì:

  - `module`: Chỉ định phương thức khởi tạo module. Node sử dụng `commonjs`.

  - `target`: Level của output ( ở đây là es6)

  - `moduleResolution`: giúp trình biên dịch tìm ra việc `import` sẽ tham chiếu tới đâu. Giá trị `node` -> bắt chước cơ chế phân phân giải module của `node`.

  - `outDir`: Nơi lưu file `.js` sau khi được biên dịch. Chúng ta lưu trong folder `dist`.

- **_Note_**: Bạn có thể làm việc này tự động bằng câu lệnh: `tsc --init` :D

- Tiếp theo chúng ta sẽ cấu hình Typescript linting cho project. Chạy câu lệnh sau để khởi tạo file `tslint.json`:

```sh
  ./node_modules/.bin/tslint --init
```

- Mở file `tslint.json` và thêm tùy chọn `no-console` như dưới:

```json
{
  "defaultSeverity": "error",
  "extends": ["tslint:recommended"],
  "jsRules": {},
  "rules": {
    "no-console": false
  },
  "rulesDirectory": []
}
```

- Theo mặc định, Typescript linter sẽ chặn `console`, muốn sử dụng chúng ta cần thêm rule như trên.

4. Updating the Package.json file

- Cùng tạo script `start` giúp chúng ta biên dịch code `Typescript` ra file `.js` và chạy chúng. Cập nhật lại file `package.json` như dưới:

```json
{
  "name": "node_project",
  "version": "1.0.0",
  "description": "",
  "main": "dist/app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "tsc && node dist/app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/express": "^4.17.2",
    "tslint": "^5.20.1",
    "typescript": "^3.7.4"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}
```

- Chúng ta đã cập nhật lại `main` path. Và tạo script `start`: khởi chạy `tsc` trước và sao đó chạy lệnh `node`. Việc này cho phép chúng ta biên dịch trước và chạy kết quả sau khi biên dịch với `node`.

5. Setting up the folder structure

- Chúng ta sẽ tạo folder `src` cùng cấp với file `package.json` và tạo một file `app.ts` bên trong nó như dưới:

```sh
  mkdir src
  cd src
  touch app.ts
```

- Đến thời điểm này bạn nên có cấu trúc thư mục như dưới:

```sh
.
├── package.json
├── package-lock.json
├── src
│   └── app.ts
├── tsconfig.json
└── tslint.json

1 directory, 5 files
```

6. Create and running a basic Express Server

- Chúng ta đã cấu hình Typescript và Typescript linter, tiếp theo chúng ta sẽ xây dựng Node Express Server. Với nội dung trong file `app.ts` như dưới.

```javascript
import express from "express";

const app = express();
const port = 3000;
app.get("/", (req, res) => {
  res.send("The sedulous hyena ate the antelope!");
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
```

- Đoạn code trên tạo một server Node đơn giản lắng nghe trên port 3000. Cùng chạy ứng dụng với câu lệnh sau.

```sh
npm start
```

- Khi câu lệnh thực thi hoàn tất bạn nên thấy thông báo server đang chạy trên port 3000:

```sh
> tsc && node dist/app.js

server is listening on 3000
```

- Và cấu trúc thư mục sẽ trông như thế này ( folder dist được "xinh" ra với các file bên trong):

```sh
.
├── dist
│   ├── app.js
│   └── app.js.map
├── package.json
├── package-lock.json
├── src
│   └── app.ts
├── tsconfig.json
└── tslint.json

2 directories, 7 files
```

- Bạn cũng có thể truy cập local với đường link: `localhost:3000`.

```sh
curl localhost:3000
The sedulous hyena ate the antelope!
```

- Nếu muốn bạn cũng có thể mở file `dist/app.js` để xem phiên phản biên dịch của `Typescript` code. ;)

- Nice! như vậy chúng ta đã setup thành công cho project Node sử dụng Typescript!

## Conclusion

- Cảm ơn bạn đã theo dõi tới đây và chúc bạn:

**_Happy coding with Typescript_**
