# How to config NGINX

- Bài gốc tại [đây](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx/)

- [NGINX](https://www.nginx.com/) là một web server nhẹ, hiệu năng cao được thiết kế cho trường hợp traffic lớn.

- Một trong các tính năng mạnh nhất của NGINX là khả năng phục vụ hiệu quả nội dung tĩnh (static content) như file HTML và media. NGINX sử dụng một cơ chế bất đồng bộ, cung cấp dự đoán hiệu năng theo tải.(đoạn này lú chưa hiểu lắm :v).

- NGINX trao đổi nội dung động cho CGI, FastCGI, hoặc các web server khác như Apache. Các nội dung này sau đó được truyền ngược lại cho NGINX để chuyển tới client. Bài viết này sẽ giúp bạn làm quen với các tham số và quy ước cơ bản của NGINX

## Directives, Blocks, and Contexts

- Tất cả file cấu hình NGINX được đặt trong thư mục `/etc/nginx`.

- File cấu hình chính trong `/etc/nginx/nginx.conf`.

- Các cấu hình tùy chọn trong NGINX được gọi là các [directives(các chỉ thị)](https://nginx.org/en/docs/dirindex.html). Các chỉ thị được tổ chức vào các groups (nhóm) được biết đến như `blocks` hay `contexts`. Hai thuật ngữ này tương đương nhau.

- Các dòng bắt đầu với ký tự `#` là các comment và không được biên dịch bởi NGINX. Các dòng chưa các chỉ thị phải kết thúc với `;` hoặc NGINX sẽ bị lỗi khi tả cấu hình và report lại lỗi này.

- Cùng xem thử cấu hình mặc định của `/etc/nginx/nginx.conf`.

  ```sh
  # cat /etc/nginx/nginx.conf

  user  nginx;
  worker_processes  1;

  error_log  /var/log/nginx/error.log warn;
  pid        /var/run/nginx.pid;

  events {
  worker_connections 1024;
  }

  http {
    ...
  }

  ```

- File bắt đầu với 4 directives(chỉ thị): `user`, `worker_processes`, `error_log`, và `pid`. Chúng đặt ngoài bất kỳ block hay context cụ thể nào, do vậy chúng được coi tồn tại trong context chính ( `main context`). `events` và `http` blocks là các chỉ thị thêm (additional directive), chúng cũng tồn tại trong `main context`.

## The http block

- ```sh
  http {
      include       /etc/nginx/mime.types;
      default_type  application/octet-stream;

      log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';

      access_log  /var/log/nginx/access.log  main;

      sendfile        on;
      #tcp_nopush     on;

      keepalive_timeout  65;

      #gzip  on;

      include /etc/nginx/conf.d/*.conf;
  }
  ```

- `http` block chứa các chỉ thị cho việc điều khiển traffic web. Những chỉ thị này thường tham chiếu như là `universal` vì chúng được truyền tới tất cả các website cấu hình NGINX phục vụ. Xem [NGINX docs](https://nginx.org/en/docs/http/ngx_http_core_module.html) để thấy list các chỉ thị có trong `http` block, bao gồm cả `server`.

## Server blocks

- `http` block ở trên chưa một directive(chỉ thị) `include`, sẽ nói cho NGINX biết file cấu hình cho website được đặt ở đâu.

  - Nếu bạn cài đặt NGINX từ repository chính thức, bạn sẽ thấy line này sẽ cho biết:
    `include /etc/nginx/conf.d/*.conf;` như có trong `http` block ở trên. Mỗi website bạn đặt host với NGINX sẽ có cho riêng mình một file cấu hình trong `/etc/nginx/conf.d/`, với tên được định dạng kiểu như `example.com.conf`. Các site bị disabled (không còn được phục vụ bởi NGINX) nên được đặt tên như `example.com.conf.disabled`.

  - Nếu bạn cài đặt NGINX từ Debian hoặc Ubuntu, có thể sẽ có line này (tuy nhiên các bản mới ko còn) `include /etc/nginx/sites-enabled/*;`. Các thư mục `../sites-enabled/` chứa các đường dẫn tượng trưng tới file cấu hình site được lưu trong `/etc/nginx/sites-available/`. Sites trong `sites-available` có thể bị disable bằng cách xóa liên kết tượng trưng (symlink) tới `sites-enabled`.

  - Dựa trên source cài đặt của bạn, bạn có thể tìm thấy cấu hình ví dụ ở `/etc/nginx/conf.d/default.conf` hoặc `/etc/nginx/sites-enabled/default`.

- Bất kể source cài đặt như thế nào, file cấu hình server sẽ chứa một block (hoặc các block) `server` cho một web site. Ví dụ:

  ```sh
  #/etc/nginx/conf.d/example.com.conf
  server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name example.com www.example.com;
  root /var/www/example.com;
  index index.html;
  try_files \$uri /index.html;
  }
  ```

## Listening Ports

- Directive `listen` nói với NGINX hostname/IP và TCP port nó nên lắng nghe cho kết nối HTTP. Tham số `default_server` có nghĩa máy ảo này sẽ trả lời request trên port 80 nếu không có bất kỳ host nào phù hợp. Câu lệnh thứ hai lắng nghe trên IPv6 với cách cư xử tương tự.

## Name-based virtual hosting

- Directive `server_name` cho phép nhiều domain được phục vụ như một IP duy nhất. Server quyết định domain được phục vụ dựa trên request header mà nó nhận được.

- Bạn thường nên tạo một file trên mỗi một domain hoặc site bạn muốn host trên server của bạn. Dưới đây một vài ví dụ:

  1. Xử lý request cho cả `example.com` và `www.example.com`

  ```sh
    #/etc/nginx/conf.d/example.com.conf
    server_name example.com www.example.com;
  ```

  2. Chỉ thị `server_name` có thể sử dụng wildcards `*.example.com` và `.example.com` cả hai đều chỉ server cách xử lý requests với tất cả các sub domain của `example.com`

  ```sh
  #/etc/nginx/conf.d/example.com.conf
  server_name *.example.com;
  server_name .example.com;
  ```

  3. Xử lý với tất của request với domain bắt đầu bằng `example.`:

  ```sh
  # /etc/nginx/conf.d/example.com.conf
  server_name example;
  ```

- NGINX cho phép bạn chỉ rõ server name không phù hợp. NGINX sử dụng name từ http header để trả lời request, dù request đó hợp lệ hay không.

- Sử dụng non-domain hostname thì hữu ích nếu server của bạn trong một mạng LAN, howacj nếu bạn biết tất cả các client sẽ tạo ra request tới server. Bao gồm cả front-end proxy server với /etc/hosts` cấu hình cho IP address mà NGINX đang lắng nghe.

## Location Blocks

- Thiết lập `location` cho phép bạn cấu hình cách NGINX sẽ phản hồi request với tài nguyên trong server. Giống như directive `server_name`nói cho NGINX biết cách xử lý request tới domain, directive `location` đảm bảo cho request tới các file hoặc thư mục cụ thể như `http://example.com/blog/`. Đây là một ví dụ:

```sh
  #/etc/nginx/sites-available/example.com
  location / {}
  location /images/ {}
  location /blog/ {}
  location /planet/ {}
  location /planet/blog/ {}
```

- Các directive `localtion` trên khớp theo chuỗi ký tự:

- **Request** : `http://example.com/`

- **Returns**: Giả sử rằng có một `server_name` cho `example.com`,directive `location /` sẽ xác định điều gì xảy ra với request này.

- NGINX luôn luôn đáp ứng các request bằng cách sử dụng các kết quả phù hợp nhất:

- **Request**: `http://example.com/planet/blog/` hoặc `http:/example.com/planet/blog/about/`

- **Returns**: sẽ được đáp ứng bởi chỉ thị `location /planet/blog/` vì nó có thể hơn, dù `location /planet/` cũng phù hợp với request này.

  ```sh
  #/etc/nginx/sites-available/example.com
  location ~ IndexPage\.php$ {}
  locaiton ~ ^/BlogPlanet(/|/index\.php)$ {}
  ```

- Khi một directive `location` được theo sau bởi một dấu ngã (~), NGINX thực thi một regex (regular expression) match. Những regex này luôn luôn case-sensitive ( phân biệt hoa thường). Vì vậy, `IndexPage.php` sẽ match với ví dụ đầu tiên ở trên, nhưng `indexpage.php` sẽ không. Trong ví dụ thứ 2, regex `^/BlogPlanet(/|/index\.php)$` sẽ match với request cho `/BlogPlanet/` và `/BlogPlanet/index.php`, nhưng **KHÔNG** match `/BlogPlanet`, `blogplanet`, hoặc `/blogplanet/index.php`. NGINX sử dụng [Perl Compatible Regular Expressions - PCRE](https://perldoc.perl.org/perlre.html)

  ```sh
  #/etc/nginx/sites-available/example.com
  location ~* \.(pl|cgi|perl|prl)$ { }
  location ~* \.(md|mdwn|txt|mkdn)$ { }
  ```

- Nếu bạn muốn match với `case-insensitive` (match KHÔNG phân biệt hoa thường), sử dụng một dấu ngã với một dấu sao (~\*). Các ví dụ trên chỉ định cách NGINX nên sử lý tất cả các request mà kết thúc trong một phần mở rộng file. Ví dụ đầu tiên, bất kỳ file nào kết thúc với: `.pl`, `.PL`, `.cgi`, `.CGI`, `.perl`, `.Perl`, `.prl`, và `.PrL` sẽ match.

  ```sh
  #/etc/nginx/sites-available/example.com
  location ^~/images/IndexPage/ {}
  location ^~/blog/BlogPlanet/ {}
  ```

  - Thêm một dấu mũ và dấu ngã (^~) vào directive `location` nới với NGINX, nếu nó match một string cụ thể , dừng tìm kiếm một match cụ thể hơn (match dài hơn) và sử dụng luôn các chỉ thị (directive) ở đây.

  ```sh
  #/etc/nginx/sites-available/example.com
  location = / {}
  ```

- Cuối cùng, nếu bạn thêm một dấu bằng (=) vào `location`, điều này ấp đặt một match chính xác với path request và dừng tìm kiếm cho một match cụ thể hơn. Ví dụ trên sẽ chỉ match `http://example.com/`, không match `http://example.com/index.html`. Sử dụng match chính xác có thể tăng tốc độ phản hồi request lên một chút, hữu ích khi bạn có một vài request đặc biệt phỏ biến.

- Các directive (chỉ thị) được xử lý theo thứ tự sau:

  - String match chính xác được xử lý trước tiên. Nếu một match được tìm thấy, NGINX dừng tìm kiếm và đáp ứng request.

  - Các directive còn lại được xử lý tiếp theo. Nếu NGINX gặp một match với `^~` được sử dụng, nó sẽ dừng ở đây và đáp ứng yêu cầu. Nếu không, NGINX tiếp tục xử lý các directive location tiếp theo.

  - Tất cả các directives với regexx (~ và ~\*) được xử lý. Nếu một regex khớp với request, NGINX dừng tìm kiếm và đáp ứng yêu cầu.

  - Nếu không regex nào match, string khớp nhất có thể sẽ được sử dụng.

- Đảm bảo rằng mỗi file và folder dưới một domain sẽ match ít nhất một `location` directive.

  ```text
  NOTE:
  Location lồng nhau thì không được khuyến khích hoặc supported.
  ```

## Location Root and Index

- `location` là một biến khác, có block của riêng nó

- Một khi NGINX xác định một directive `location` phù hợp nhất với request, response cho request này được xác định bởi nội dung liên quan trong block của directive `location`. Đây là một ví dụ:

  ```sh
  #/etc/nginx/sites-available/example.com
  location / {
    root html;
    index index.html index.htm;
  }
  ```

- Trong ví dụ này, tài liệu root được đặt trong thư mục `html/` Bên dưới cài đặt mặc định của NGINX, đường dẫn đầy đủ cho vị trí này là `/etc/nginx/html/`.

- **Request**: `http://example.com/blog/includes/style.css`

- **Returns**: NGINX sẽ cố gắng phục vụ các file được đặt ở: `/etc/nginx/html/blog/includes/styles.css`

  ```sh
  NOTE:
  Bạn có thể sử dụng đường dẫn tuyệt đối nếu muốn
  ```

- Biến `index` nói với NGINX file được phục vụ nếu không được chỉ định rõ ràng.
- Ví dụ:

- **Request**: `http://example.com`

- **Returns**: NGINX sẽ cố phục vụ file được đặt ở `/etc/nginx/html/index.html`.

- Nếu nhiều file được chỉ định cho directive `index`, NGINX sẽ xử lý theo thứ tự liệt kê và phục vụ request với file đầu tiên tồn tại. Nếu `index.html` không tồn tại trong thư mục liên quan, khi đó `index.htm` sẽ được sử dụng. Nếu `index.htm` cũng không tồn tại, một message 404 sẽ được gửi đi.

- Đây là một ví dụ phức tạp hơn một chút, hiển thị một tập các directive `location` cho một server response với domain `example.com`:

  ```sh
  # /etc/nginx/sites-available/example.com location directive
  location / {
    root /srv/www/example.com/public_html;
    index index.html index.htm;
  }

  location ~ \.pl$ {
    gzip off;
    include /etc/nginx/fastcgi_params;
    fastcgi_pass unix:/var/run/fcgiwrap.socket;
    fastcgi_index index.pl;
    fastcgi_param SCRIPT_FILENAME /srv/www/example.com/public_html$fastcgi_script_name;
  }
  ```

- Trong ví dụ này, tất cả request cho resource kết thúc với đuôi `.pl` được xử lý bởi `location` block, chỉ rõ một `fastcgi` xử lý cho những request này. Nếu không, NGINX sử dụng directive location đầu tiên. Tài nguyên được đặt trong file hệ thống ở `/srv/www/example.com/public_html/`. Nếu không file name nào được chỉ định trong request, NGINX sẽ tìm kiếm và cung cấp file `index.html` hoặc `index.htm`. Nếu không `index` file nào được tìm thấy, server sẽ trả về 404.

- Cùng phân tích điều gì xảy ra với một vài request:

- **Request**: `http://example.com/`

- **Returns**: `/srv/www/example.com/public_html/index.html` nếu nó tồn tại. nếu file không tồn tại, nó sẽ trả về file `/srv/www/example.com/public_html/index.htm`. Nếu file này cũng không tòn tại NGINX trả về lỗi 404.

- **Request**: `http://example.com/tasks.pl`

- **Returns**: NGINX sẽ sử dụng trình xử lý FastCGI để thực thi file được lưu tại `/srv/www/example.com/public_html/tasks.pl` và trả về kết quả.

- **Request**: `http://example.com/username/roster.pl`

- **Returns**: NGINX sẽ sử dụng trình xử lý FastCGI để thực thi file đặt tại `srv/www/example.com/public_html/username/roster.pl` và trả về kết quả.
