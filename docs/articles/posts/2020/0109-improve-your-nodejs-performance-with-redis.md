# Improve your nodejs performance with redis

## Introduction

- Dự án mình đang làm có liên quan redis, nên tiện thể note lại một chút thực hành luôn.
- Bài này mình sẽ không trình bày: [Redis](https://redis.io/) là gì?. Vì sao nên dùng redis.
- Bài viết này chỉ đưa ra kết quả so sánh khi chuyển sang dùng redis làm cache hoặc thay thế các kiểu dữ liệu truyền thống (SQL và NoSQL).

## Redis as cache

- Cùng xem ví dụ nodejs app trả về thông tin sách thông qua dữ liệu của google api.

  - Không sử dụng Redis:

```javascript linenums="1" title="withoutRedisAsCache.js"
//Define all dependencies needed
const express = require("express");
const responseTime = require("response-time");
const axios = require("axios");

//Load Express Framework
var app = express();

//Create a middleware that adds a X-Response-Time header to responses.
app.use(responseTime());

const getBook = (req, res) => {
  let isbn = req.query.isbn;
  let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  axios
    .get(url)
    .then((response) => {
      let book = response.data.items;
      res.send(book);
    })
    .catch((err) => {
      res.send("The book you are looking for is not found !!!");
    });
};

app.get("/book", getBook);

app.listen(3000, function () {
  console.log("Your node is running on port 3000 !!!");
});
```

- Có sử dụng redis làm cache:

```javascript linenums="1" title="withRedisAsCache.js"
const express = require("express");
const responseTime = require("response-time");
const axios = require("axios");
const redis = require("redis");
const client = redis.createClient();

// Load express Framework
const app = express();

// Create a middleware that adds a X-Response-Time header to response.
app.use(responseTime());

const getBook = (req, res) => {
  let isbn = req.query.isbn;
  let url = `https://wwww.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  return axios
    .get(url)
    .then((response) => {
      let book = response.data.items;
      // Set the string-key: isbn in our cache. With his contents of the cache: title
      // Set cache expirations to 1 hour (60minutes)
      client.setex(isbn, 3600, JSON.stringify(book));

      res.send(book);
    })
    .catch((err) => {
      res.send("The book you are looking for is not found!!!");
    });
};

const getCache = (req, res) => {
  let isbn = req.query.isbn;
  //Check the cache data from the server redis
  client.get(isbn, (err, result) => {
    if (result) {
      res.send(result);
    } else {
      getBook(req, res);
    }
  });
};
app.get("/book", getCache);
app.listen(3000, () => {
  console.log(`Your node is running on port 3000!!!`);
});
```

- Khi nhận được request từ client. Server với `withoutRedisAsCache.js` sẽ call api bên thứ ba (ở đây là google) và trả về cho người dùng. Server với `withRedisAsCache.js` sẽ check redis trước không có mới gọi api google ( và sẽ được cập nhật vào redis cho lần gọi sau).
- Để chạy phía server ngoài khởi tạo 2 file như trên. Mình cài đặt 1 số thứ:

  - `npm init -y` khởi tạo project
  - Cài đặt các module cần thiết: `npm i express axios response-time redis`
  - Khởi chạy phía server side với `node withoutRedisAsCache.js` hoặc `node withRedisAsCache.js`.

- Giờ cùng xem thời gian phản hồi của mỗi api như nào. Với cùng một truy vấn tới server. Ở đây mình muốn check thời gian server phản hồi. Nếu bạn muốn xem full response thì bỏ option `--head` là được:

```curl linenums="1"
curl --head --request GET 'http://localhost:3000/book?isbn=0747532699'
```

- Khi không có redis thời gian server xử lý **748.695ms**:

```bash linenums="1"
curl --head --request GET 'http://localhost:3000/book?isbn=0747532699'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 5555
ETag: W/"15b3-oclsTdp62saXpCDwbRd1UpovElU"
X-Response-Time: 748.695ms
Date: Tue, 04 Feb 2020 21:47:10 GMT
Connection: keep-alive
```

- Khi có redis làm cache thời gian xử lý **151.236ms**:

```sh linenums="1"
curl --head --request GET 'http://localhost:3000/book?isbn=0747532699'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 44
ETag: W/"2c-MIHHo48jJM1V6k/iF6QDT81JmfU"
X-Response-Time: 151.236ms
Date: Tue, 04 Feb 2020 21:45:40 GMT
Connection: keep-alive
```

## Redis as DB

- Một ví dụ thứ hai, một số trường hợp thay vì lưu vào db truyền thống SQL hay noSQL chúng ta có thể sử dụng redis thay thế.

- Sử dụng mongodb:

```javascript linenums="1" title="mongoDB.js"
const mongoose = require("mongoose");
const express = require("express");
const responseTime = require("response-time");

const mongoDB = "mongodb://127.0.0.1/test";
mongoose.connect(mongoDB, { useNewUrlParser: true });

const app = express();
app.use(responseTime());

// create a Schema
const UserSchema = new mongoose.Schema({
  name: String,
  lastLogin: { type: String, index: true },
});

// create model from Schema
const UserModel = mongoose.model("Users", UserSchema);

// run this block only one time to create new User
// start block create user
const newUser = UserModel({
  name: "Asterisk",
  lastLogin: `${new Date().getTime()}`,
});
newUser.save((err) => {
  if (err) console.error(`save to db error: `, err);
  console.log("User created");
});
// end block create user

app.get("/user", (req, res) => {
  UserModel.findOne({ name: "Asterisk" }, (err, response) => {
    res.json(response);
  });
});

app.listen(3000, () => {
  console.log(`Your node runiing on port 3000!`);
});
```

- Ở đây mình tạo 1 collection `User` với một document đơn giản {name: Asterisk, lastLogin: string} với lastLogin là time theo mili giây.
- Cài đặt gói mongoose: `npm i mongoose`.
- Chạy server: `node mongoDB.js`.
- Check response từ phía server:

```sh linenums="1"
$ curl --request GET 'http://localhost:3000/user'
{"_id":"5e39ef517017466d73374df9","name":"Asterisk","lastLogin":"1580855121662","__v":0}
```

- Check Header xem thời gian phản hồi:

```sh linenums="1"
curl --head --request GET 'http://localhost:3000/user'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 88
ETag: W/"58-tbwvkcJnjDHdbM+ylOQJecz0iEs"
X-Response-Time: 2.821ms
Date: Tue, 04 Feb 2020 22:35:27 GMT
Connection: keep-alive
```

- Như vậy với một bản ghi, đã được index, thời gian cỡ khoảng **2.821ms**

- Nếu cùng mục đích sử dụng lưu lastLogin nhưng lần này mình sẽ lưu trong redis thì sao:
- Sử dụng redis:

```javascript linenums="1" title="redisDB.js"
const express = require("express");
const responseTime = require("response-time");
const axios = require("axios");
const redis = require("redis");
const client = redis.createClient();

const app = express();
app.use(responseTime());

// Run this line only one time to set for redis
client.set(`Asterisk`, `${new Date().getTime()}`);

app.get("/user", (req, res) => {
  client.get(`Asterisk`, (err, result) => {
    if (err) console.error(err);
    res.send(result);
  });
});
app.listen(3000, () => {
  console.log(`Your node is running on port 3000!!!`);
});
```

- Test thử response từ phía server:

```sh linenums="1"
$ curl --request GET 'http://localhost:3000/user'
1580857007517
```

- Check header xem thời gian phản hồi **0.384ms**:

```sh linenums="1"
curl --head --request GET 'http://localhost:3000/user'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 13
ETag: W/"d-JS5kVrHA/I/MbbqfR1u35i9JqlI"
X-Response-Time: 0.384ms
Date: Tue, 04 Feb 2020 23:04:12 GMT
Connection: keep-alive
```

## Conclusion

- Phần trên mình demo 2 ví dụ thay đổi thời gian phản hồi server tới client:
  - Khi dùng redis làm cache thời gian giảm: 748.695ms -> 151.236ms.
  - Khi dùng redis làm db thời gian giảm: 2.821ms -> 0.384ms.
- Hai thay đổi về thời gian trên chỉ mang tính tương đối vì mỗi lần chạy thời gian có thay đổi đôi chút. Nhưng dù sao cũng thấy được tỉ lệ thay đổi khá rõ dệt về mặt thời gian phản hồi.
- Khi các kết quả trả về client ít thay đổi chúng ta có thể xem xét việc dùng Redis làm cache và cập nhật lại khi có thay đổi ví dụ: thông tin người dùng, hoặc trong ví dụ trên thông tin một quyển sách: tác giả, năm phát hành ...
- Khi API ưu tiên tính thời gian thực phản hồi nhanh như trong ví dụ 2 chúng ta có cũng thế xem xét lưu một số thông tin trong redis thay vì db thông thường. Dù mỗi loại DB vẫn có điểm mạnh riêng chúng ta cần cân nhắc khi [chọn lựa](https://stackoverflow.com/questions/5400163/when-to-redis-when-to-mongodb)

## Bonus Redis command exec on:

- String:

  - `GET`: lấy ra giá trị của key (get value of key) trả về nil nếu key không tồn tại và error nếu gía trị lưu trong key không phải string. GET chỉ handle giá trị là string.
  - `SET`: gán giá trị (kiểu string ) cho một key. Nếu key đã có giá trị nó sẽ bị ghi đè ( không quan tâm kiểu trước đó là gì). Các options:
    - EX giây: thời gian bị hết hạn theo giây.
    - PX mili giây: thời gian bị hết hạn theo mili giây.
    - NX: Chỉ xét khi key chưa chứa giá trị.
    - XX: Chỉ xét nếu key đã chưa giá trị.
  - Do SET có các options như trên nên các câu lệnh như sau có thể bị bỏ trong tương lại: SETEX, SETNX, PSETEX.
  - `INCR`: Tăng số đang được lưu trong key lên một. Nếu key không có giá trị nó được gán về 0 và tăng lên 1 ( tức = 1).Trả về lỗi nếu giá trị lưu trong key không phải là string hoặc string không chuyển thành số được. Phép cộng 1 giới hạn bởi 64 bit signed integers.
  - `DECR`: Tương tự `INCR` nhưng thằng này trừ 1.

- List:

  - `LRANGE` KEY START STOP: Độ phức tạp câu lệnh này: `O(S+N)`: S độ lệch giữa `START` và 0. N số phần tử trong list. Lệnh này trả về một danh sách (array) các phần tử được lưu trong key. Độ lệch của `START` và `STOP` được tính từ `0`. Tức ko là phần tử đầu tiên. Cũng có thể lấy từ cuối danh sách trở đi với `-1` là phần tử cuối cùng. Out of range sẽ không trả về một `error`. Start lớn hơn phần tử cuối cùng mảng rỗng sẽ được trả về. Stop lớn hơn phần tử cuối cùng, Redis sẽ trả về tới phần tử cuối cùng.
  - `RPUSH` KEY ELEMENT [ELEMENT...]: Độ phức tạp `O(1)` cho mỗi phần tử được thêm mới, nên O(N) với N phần tử được thêm vào. Thêm tất cả các giá trị vào đuôi của list được lưu bởi key. Key không tồn tại nó sẽ được tạo mới và chèn dữ liệu vào. Nếu Key lưu giá trị không phải list, error sẽ được trả về.
  - `LPUSH` KEY ELEMENT [ELEMENT...]: Độ phúc tạp tương tự `RPUSH`. Tương tự `RPUSH` khác insert từ đầu (HEAD) thay vì đuôi (tail).

- HASHES:

  - `hgetall`: Độ phức tạp `O(N)` N là kích thước hash. Trả về tất cả các field và value của chúng được lưu trong hash. Giá trị trả về field được theo value của chúng -> gấp đôi kích thước hash.
  - `hmget`: Độ phức tạp `O(N)` N là kích thước fields được truy vấn. Trả về các giá trị (value) tương ứng với fields của hash được lưu trong key. Request field không tồn tại sẽ nhận về nil.
  - `hmset`: Độ phức tạp `O(N)` N là số field được set. Set các giá trị cho các hash fields. Ver `4.0.0` `hmset` deprecated được thay mởi `hset`.
  - `hdel`: Độ phức tạp `O(N)` N kích thước số fields xóa bỏ. Xóa một hoặc nhiều fields trong hash. Fields không tồn tại đơn giản bị bỏ qua. Nhưng nếu Key không tồn tại được xem như một hash rỗng và trả về 0.

- SET:

  - `SMEMBERS` KEY: Độ phức tạp `O(N)`. Lấy tất cả members trong set.
  - `SADD` KEY member [members...]: Độ phức tạp `O(1)` với mỗi member được thêm mới nên `O(N)` với N phần tử thêm mới. `Sound like: set add`. Thêm một hoặc nhiều member vào set.
  - `SREM` key member [members...]: Độ phức tạp `O(N)` với N là số phần tử bị xóa. Xóa các members khỏi set. Các member không thuộc set đơn giản bị bỏ qua. Nếu key không tồn tại trả về 0 (coi như empty set). Trả về lỗi nếu giá trị lưu trong key không phải set.

- ZSET:

  - `ZRANGE` KEY START STOP [WITHSCORE...]: Độ phức tạp `O(log(N) + M)`: với N số phần tử trong set, M số các phần tử trả về. Trả về mảng các phần tử trong set. Các phần tử được sắp xếp từ điểm (score) thấp nhất tới cao nhất.

- Chi tiết tất cả các command trong redis có thể tra cứu [tại đây](https://redis.io/commands#) :D

- Happy using Redis!!!
