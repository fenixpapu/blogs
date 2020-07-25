tag: [es6], [vscode][draf]
Đây vẫn đang làm bản nháp, đừng phí thời gian của bạn cho post này.
Bài dịch từ [medium](https://medium.com/@drcallaway/debugging-es6-in-visual-studio-code-4444db797954)

## Step 1 Configure a New ES6 Project

- Trước hết chúng ta tạo 1 project

```bash
    $ mkdir debug-es6 && cd debug-es6
    $ npm init -f
    $ code .
```

- Cài đặt các module của Babel như lệnh dưới:

```bash
    npm install --save-dev babel-cli babel-preset-es2015
```

- `babel-cli` là trình biên dịch (compiler) và `babel-preset-es2015` là một plugin hỗ trợ ES6. Khi các module này được cài đặt. Chúng ta cần cập nhật thêm trong `package.json` hoặc tạo file `.babelrc` để cấu hình `Babel` sử dụng plugin ES6. Để demo chúng ta chỉ thêm vào trong `package.json` như dưới đây:

```javascript
    {
        "name": "debug-es6",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "devDependencies": {
            "babel-cli": "^6.26.0",
            "babel-preset-es2015": "^6.24.1"
        },
        "babel": {
            "presets": [
            "es2015"
            ]
        }
    }
```

- Ok fine! Tiếp theo cùng tạo app đơn giản miễn sao có thể debug :3. Chúng ta sẽ tạo file `math.js` bên trong folder `src` với nội dung như dưới. `src/math.js`:

```javascript
export function add(num1, num2) {
  return num1 + num2;
}

export function multiply(num1, num2) {
  return numb1 * num2;
}
```

- Đồng thời tạo một `src/app.js` như dưới:

```javascript
import { add, multiply } from "./math";

const num1 = 5;
num2 = 10;

console.log("Add: ", add(num1, num2));
console.log("Multiply: ", multiply(num1, num2));
```

## Step 2 -- Configure Babel to Transpile ES6 to ES5

- Bước đầu tiên cho việc debugging ES6 là cấu hình một `transpiler` để dịch code từ ES6 sang ES5. Nhưng trong code được chuyển đổi, chúng ta cũng cần tạo ra [source maps](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) cho phép Node debugger trong VS Code ánh xạ `breakpoints` giữa source code ban đầu và code đã được chuyển đổi.
- Tất nhiên, luôn có những cách để debug không cần cấu hình một `transpiler`. Tuy nhiên tác giả chưa có nhiều may mắn với các giải pháp như `babel-node` và `babel-register`.
- Ngoài việc chuyển đổi code và tạo ra `source maps`, chúng ta còn muốn Babel theo dõi code của chúng ta khi có thay đổi và biên dịch lại khi cần thiết. Điều này giữ cho vòng lặp write-compile-debug của chúng ta nhẹ nhàng và chặt chẽ. Để thực hiện việc trên thêm một script `compile` vào package.json như dưới:

```json
	"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "compile": "babel src --out-dir .compiled --source-maps --watch"
  },
```

- Script này sẽ chuyển đổi code trong folder `src` và xuất kết quả ra folder `.compiled`.Tùy chọn `--srouce-maps` và `--watch` trong câu lệnh của Babel để tạo ra source maps và tiếp tục theo dõi files nguồn khi có sự thay đỏi ( và biên dịch lại bất cứ khi nào thay đổi xảy ra). Bắt đầu Babel compiler:

```bash
	$ npm run compile
```

- Chúng ta có một ứng dụng ES6 tự động biên dịch lại bất cứ khi nào có sự thay đổi. Tuyệt phải không!!!

## Step 3 Add launch configuration

- Bước tiếp theo là thêm một cấu hình trong file `launch` để chạy ứng dụng với mode debug. Trên thanh `menu`, click `Debug -> Open Configurations` và chọn `Node.js` trong `prompted`. Và cập nhật cấu hình như dưới:

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch App.js",
      "program": "${workspaceRoot}/src/app.js",
      "outFiles": ["${workspaceRoot}/.compiled/**/*.js"]
    }
  ]
}
```

- Tùy chọn `type` và `request` trong cấu hình này chỉ ra rằng chúng ta sẽ dùng Node.js để chạy ứng dụng ES6. `program` chỉ định tới ứng dụng và `outFiles` nói cho VS Code cầm tìm file biên dichj( và source maps) ở đâu. Source maps sẽ cho phép VS Code ánh xạ giữa code ES5 đã được biên dịch sang source code ES6.

## Step 4 - Debug your application

- Bước cuối cùng debug thôi :D

## Conclusion

- Whew! Đây coi như bản dịch nháp. Người dịch sẽ quay lại khi có kiến thức sâu hơn về ES5, ES6, Babel và VS Code. Để trả lời câu hỏi như: Node đã hỗ trợ natively cho ES6 tại sao khi chạy VS Code để debug lại cần cấu hình Babel.
- Hy vọng mình sẽ sớm cập nhật lại bài dịch này :).
