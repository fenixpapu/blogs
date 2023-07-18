# Know the eight most common DNS records

- Dạo này làm việc với SSL, TLS và Open VPN thấy cần hiểu hơn về DNS ( không phải chỉ từ domain sang IP). Ví dụ khi xác thực SSL cần thêm bản ghi TXT ( tùy thuộc cách tạo cert, kiểu domain (có *.domain) ) chẳng hạn.

- DNS có hàng tá loại bản ghi với các mục đích khác nhau. Hiểu một trong số các bản ghi cơ bản giúp chúng ta phát hiện các mối đe dọa và cập nhật những gì đang xảy ra trên mạng của mình.

## Bản ghi `A` và `AAAA`

- Kiểu bản ghi `A` kiểu phổ biến nhất, nó ánh xạ tên miền sang địa chỉ IPv4.

- Internet chuyển dần từ IPv4 sang IPv6 và bản ghi `AAAA` (quad A) dùng cho mục đích này. Ánh xạ tên miền sang IPv6.

  | DNS Record | Description| 
  | ----- | ----- |
  | A | Ánh xạ domain sang IPv4 |
  | AAAA | Ánh xạ domain sang IPv6 |
  | CNAME | Chuyển hướng domain này sang domain khác |
  | PTR | Chuyển đổi IPv4 hoặc IPv6 sang tên miền|
  | NS | Cung cấp danh sách các máy chủ có thẩm quyền chịu trách nhiệm về tên miền |
  | MX | Cung cấp tên miền máy chủ nhận email |
  | SOA | Cung cấp các chi tiết quan trọng về DNS cần thiết cho mọi DNS |
  | TXT | Cung cấp bất kỳ thông tin mô tả nào ở định dạng văn bản |

## CNAME
- Chuyển hướng tên miền sang tên miền khác. 
- Trong trường hợp bạn muốn user truy cập domain cũ tự động chuyển hướng sang domain mới của bạn.

## PTR

- Thường được sử dụng trong mạng nội bộ để biết IP hiện tại đang dùng cho domain nào (? :v)

## NS

- Cung cấp danh sách các DNS server chịu trách nhiệm cho tên miền.
- Use case: Khi bạn mua tên miền: `domain.com` của google. Hệ thống software build trên AWS. Bạn cũng có thể tạo tên miền trên AWS (route53) `domain.com` trên AWS, bên google với tên miền `domain.com` tạo bản ghi NS trỏ về các DNS của AWS.

- Bản ghi của NS là tên miền ko phải IP

## MX 
- Dùng cho mail server.

## SOA

## TXT
