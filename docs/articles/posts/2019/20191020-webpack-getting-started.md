---
authors:
  - PaPu
categories:
  - dev
date: 2019-10-20
draft: false
---

# Webpack getting stared

## Introduction

- Hi guys! với mục đích cá nhân: tìm hiểu webpack là gì? Bước đầu cấu hình webpack như thế nào? Bài viết này sẽ trình bày các bước cơ bản để cáu hình một webpack và các khái niệm cần biết của webpack.

## Before we start

- Ơ nhưng tại sao cần dùng webpack? và nó là gì?

- Nếu không sử dụng webpack. Khi viết code phía `client-side`, giả sử chúng ta có rất nhiều file, module cần import, tương ứng với mỗi file browser sẽ cần tải về, điều này làm giảm hiệu năng cũng như trải nghiệm phía người dùng (tốn tài nguyên mạng, bộ xử lý). Khi sử dụng webpack các gói phụ thuộc sẽ được gom lại thành 1 file duy nhất và client chỉ cần tải 1 lần.

## Goal

- Trong bài này mình sẽ sử dụng webpack gom (`bundle`) các file: Javascript, styles(may-be), images, và fonts(may-be) vào trong thư mục `dist`.

- Cùng bắt đầu: Khởi tạo folder `webpack-demo` bên trong khai báo 2 folder `dist` và `src` và các thư mục con như bên dưới.

```bash linenums="1"
├── dist
└── src
    ├── fonts
    ├── images
    ├── javascript
    └── sass
```

- Webpack sẽ tạo ra 1 file Javascript và 1 file CSS đã được `bundle`. Chúng ta có thể đơn giản thêm file đó vào trong HTML file.

## Get started

### Install webpack

- Sử dụng npm: `npm init -y` để khởi tạo project và `package.json` file, các gói phụ thuộc của JS sẽ được khai báo trong file này. Sau đó chúng ta cài đặt webpack với lệnh: `npm i --save-dev webpack webpack-cli`. Sau 2 lệnh này chúng ta có thư mục như dưới(các lần sau mình sẽ remove bỏ `node_modules` trong cây thư mục):

```bash linenums="1"
├── dist
├── node_modules
├── package.json
├── package-lock.json
└── src
    ├── fonts
    ├── images
    ├── javascript
    └── sass
```

### Create entry point file

- Webpack bắt đầu công việc của mình từ một file Javascript được gọi là `entry point`. Từ đây nó sẽ tìm ra tất các cả gói phụ thuộc mà chương trình cần. Chúng ta tạo một file `index.js` trong thư mục Javascript làm entry point. Viết một đoạn code nào đó trong file này:

```javascript linenums="1" title="index.js"
console.log(`webpack is awesome!`);
```

```bash linenums="1"
├── dist
├── package.json
├── package-lock.json
└── src
    ├── fonts
    ├── images
    ├── javascript
    │   └── index.js
    └── sass
```

### Create webpack.config.js

- Ở thời điểm hiện tại webpack có thể chạy mà không cần cấu hình( nó có cấu hình mặc định), tuy nhiên để tận dụng được các tính năng, cũng như sự linh hoạt của mỗi project. File cấu hình sẽ giúp webpack tương thích tốt nhất với dự án của chúng ta.

- Đây là một ví dụ về bước đầu cấu hình webpack:

```javascript linenums="1" title="webpack.config.js"
// Webpack sử dụng path để làm việc với thư mục
const path = require("path");

// Dưới đây sẽ chứa phần cấu hình chính của webpack
// Bạn sẽ viết các cấu hình khác nhau dựa theo mỗi dự án và chỉ rõ cho webpack biết // nó phải làm gì
module.exports = {
  // Đường dẫn tới thư mục `entry point`. `Webpack` sẽ bắt đầu công việc của mình //// từ đây
  entry: "./src/javascript/index.js",

  // Đường dẫn và tên file sau khi đã được `bundle`
  // Webpack sẽ bundle tất cả JS vào trong file này.
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  // Mặc định webpack là mode production.
  // Tùy thuộc vào mode mà webpack sẽ bundle ra các file khác nhau:
  // Thường thì với mode production chúng ta sẽ cấu hình để bundle ra file có dung /// lượng nhỏ nhất. Trong khi đó mode development chúng ta muốn xem log để debug.
  mode: "development",
};
```

```bash linenums="1"
├── dist
├── package.json
├── package-lock.json
├── src
└── webpack.config.js
```

### Add npm script in `package.json` to run Webpack

- Để chạy được webpack chúng ta cần có script cho npm với câu lệnh đơn giản `webpack` và được cấu hình:

```json linenums="1" title="package.json"
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --config webpack.config.js"
  },
```

### Run Webpack

- Với cấu hình cơ bản như trên chúng ta có thể chạy webpack: `npm run build`. Webpack sẽ tìm kiếm trong entry file, và tìm ra tất cả các gói phụ thuộc được import bên trong đó và `bundle` chúng vào 1 file `.js` trong thư mục `dist`. Màn hình sau khi chạy lệnh build như thế này:

```bash linenums="1"
> webpack --config webpack.config.js

Hash: ce0af5daa3e00f4bfac5
Version: webpack 4.41.2
Time: 78ms
Built at: 10/20/2019 4:08:06 PM
    Asset      Size  Chunks             Chunk Names
bundle.js  3.87 KiB    main  [emitted]  main
Entrypoint main = bundle.js
[./src/javascript/index.js] 36 bytes {main} [built]
```

## Loaders

- Great! Chúng ta đã bundled trong JS. Nhưng nếu chúng ta muốn chạy code ES6( hoặc mới hơn) và muốn tương thích với trình duyệt? Làm sao chúng ta nói được với webpack để chuyển đổi (transform | transpile) code ES6 sang code tương thích với trình duyệt ?

- Giờ là lúc `Loaders` phát huy tác dụng. Loaders là một trong những tính năng chính của webpack. Cùng thêm vào trong `webpack.config.js` một tùy chọn `module.rules`. Với tùy chọn này chúng ta nói cho webpack biết chính xác nên chuyển đổi các định dạng file khác nhau như thế nào?

### babel-loader

- [Babel](https://babeljs.io/) là trình chuyển đổi JS tốt nhất hiện có. Ta sẽ nói với webpack sử dụng babel để chuyển đổi code JS tương thích các trình duyệt. Đầu tiên cài đặt babel:

```sh linenums="1"
npm i --save-dev babel-loader @babel/core @babel/preset-env
```

- Giờ hãy cùng thêm rule cho những file JS.

```js linenums="1"
rules: [
    {
      test: / \.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: "babel-loader",
        options: {
          preset: ["@babel/preset-env"]
        }
      }
    }
  ],
```

- Cùng nhìn lại 1 chút:

  - `test` là một regular expression cho định dạng file. Với trường hợp này nó ám chỉ các file JS

  - `exclude`cũng là một regular expression, chỉ cho Webpack biết phần nào nên được bỏ qua khi chuyển đổi file JS. Ở đây webpack sẽ bỏ qua thư mục `node_modules`

  - `use` là phần chính của rule này. Webpack sẽ áp dụng rule trong phần `loader` cho những file trong phần `test`.

  - `options`: phụ thuộc vào các loader. Tương ứng mỗi `loader` chúng ta có thể tìm hiểu sâu hơn khi sử dụng trong dự án thực tế.

## Plugins

- Plugins là xương sống của webpack, bản thân webpack cũng được xây dựng dựa trên cùng một `plugin system` (các bạn có thể thấy điều này trong file config của webpack). Mục đích của `Plugins` là làm các phần việc mà loaders không thể.

## More loaders: images and fonts

- Hãy cùng thử làm việc với `file-loader`

### file-loader

- Install với

```sh linenums="1"
npm i --save-dev file-loader
```

- Sau đó thêm mới rule cho file `webpack.config.js` như dưới:

```sh linenums="1"
{
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [
      "file-loader",
      ]
    }
```

- Cùng thêm file `icon.png` trong project như dưới:

```sh linenums="1"
.
├── dist
│   └── bundle.js
├── package.json
├── package-lock.json
├── src
│   ├── fonts
│   ├── icon.png
│   ├── images
│   ├── javascript
│   └── sass
└── webpack.config.js
```

- Và thay đổi code trong file `index.js` như dưới:

```js linenums="1"
import Icon from "../icon.png";

const component = () => {
  const myIcon = new Image();
  myIcon.src = Icon;
  Element.appendChild(myIcon);
  return Element;
};
document.body.appendChild(component());
```

- Chạy lại `webpack` : `npm run build`. Terminal tương tự như dưới:

```sh linenums="1"
> webpack --config webpack.config.js

Hash: 99e14bd8069d9d883131
Version: webpack 4.41.2
Time: 214ms
Built at: 10/20/2019 5:03:27 PM
                              Asset      Size  Chunks             Chunk Names
76f686ca7590b10beaa3064309902337.png  2.93 KiB          [emitted]
                          bundle.js  4.75 KiB    main  [emitted]  main
Entrypoint main = bundle.js
[./src/icon.png] 82 bytes {main} [built]
[./src/javascript/index.js] 202 bytes {main} [built]
```

- Và nếu bạn nhìn vào trong thư mục `dist` sẽ thấy xuất hiện thêm 1 file `76f686ca7590b10beaa3064309902337.png` ( tên file có thể khác một chút). Bên trong file `bundle.js` 1 dòng:

```sh linenums="1"
eval("module.exports = __webpack_require__.p + \"76f686ca7590b10beaa3064309902337.png\";\n\n//# sourceURL=webpack:///./src/icon.png?");
```

- Như vậy webpack đã chuyển đổi thành công route `../icon.png` trong `index.js` thành `dist/76f686ca7590b10beaa3064309902337.png` khi bundle.

## Wrapping up

- Trên đây mình đã trình bày một vài bước ban đầu của cấu hình webpack. Các khái niệm cơ bản `entry point`, `loaders`, và `plugins` cách webpack chuyển đổi và bundle các file. Tuy nhiên vẫn còn nhiều thứ phải xem để có thể hiểu kỹ hơn về webpack. Trước hết là các [khái niệm](https://webpack.js.org/concepts/) cơ bản trong webpack. Ngoài 3 khái niệm trên còn có `output`, `mode`, `modules` `target`, `Dependency Graph`. Nếu muốn bạn có thể truy cập link trên để đào sâu tìm hiểu.

- Sau khi đã hiểu các khái niệm cơ bản chúng ta có thể thực hành. Webpack có rất nhiều [loaders](https://webpack.js.org/loaders/), [plugin](https://webpack.js.org/plugins/) hay ho giúp chúng ta làm việc với các định dạng file khác nhau.

- Sau cùng chúng ta có thể tìm hiểu đến [configuration](https://webpack.js.org/configuration/) để cấu hình linh hoạt phù hợp với dự án. Và tham khảo phần [guides](https://webpack.js.org/guides/development/) để thấy được chúng ta có thể tối ưu cách xử dụng webpack (webpack-dev-server hay code splitting không bị dư thừa khi bundle).

- Trên đây là phần tìm hiểu của mình về webpack. Cảm ơn mọi người đã theo dõi tới đây.

- `Happy configuring!!!`
