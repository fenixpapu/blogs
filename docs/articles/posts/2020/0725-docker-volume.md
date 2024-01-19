---
authors:
  - PaPu
categories:
  - devops
date: 2020-07-25
draft: false
---

# Manage data in Docker

- Bài này dịch từ tài liệu doc của Docker [ở đây](https://docs.docker.com/storage/)

- Theo mặc định tất cả các file được tạo ra bên trong một container đều được lưu trữ trên một `writeable container layer`(nên hiểu qua về các docker layer). Điều này có nghĩa rằng:

  - Dữ liệu sẽ không còn khi container bị xóa, và sẽ là khó khăn để lấy được dữ liệu nếu một container khác cần xử dụng tới dữ liệu này.
  - Một writable layer( lớp ghi được) của container liên kết chặt chẽ với host mà container đang chạy. Việc di chuyển dữ liệu đi bất kỳ đâu không hề dễ dàng.
  - Ghi dữ liệu vào một writable layer của container yêu cầu một [storage driver](https://docs.docker.com/storage/storagedriver/) để quản lý hệ thống file (filesystem). Storage driver cung cấp một hệ thống tập tin kết hợp, sử dụng nhân Linux. Việc trừu tượng hóa này làm giảm đáng kể hiệu năng khi so với sử dụng `data volume`, cái mà ghi trực tiếp lên filesystem của host.

- Docker có hai tùy chọn: `volumes` và `bind mounts` để lưu file trên host, với các cách này dữ liệu vẫn còn tồn tại ngay khi container bị dừng lại. Nếu bạn chạy Docker trên linux bạn có thể sử dụng `tmpfs mount`. Nếu bạn đang chạy Docker trên windows bạn có thể sử dụng `pipe`.

## Choose the right type of mount

- Bất kể bạn dùng loại `mount` nào thì dữ liệu đều như nhau đứng từ góc độ của container. Nó được hiển thị riêng lẻ trong một thư mục hoặc một file độc lập trong filesystem của container.

- Cách dễ dàng nhất để hình dung sự khác nhau giữa `volumes` , `bind mounts` và `tmpfs` là vị trí dữ liệu tồn tại trên máy chủ chạy Docker (host).

- ![type of mounts](../../images/2020/20200725-types-of-mounts.png)

  - `Volumes` được lưu trong một phần filesystem của host và được _quản lý bởi Docker_ (**/var/lib/docker/volumes** trên Linux). Các process không phải của Docker không nên thay đổi các filesystem này. Volume là cách tốt nhất để toàn vẹn dữ liệu (persist data) trên Docker.
  - `Bind mounts` có thể lưu bất kỳ đâu trong host. Chúng thậm chí có thể là các tập tin hệ thống (filesystem) hoặc thư mục quan trọng. Các tiến trình của Docker hoặc không phải Docker đều có thể thay đổi chúng bất kỳ khi nào.
  - `tmpfs` mounts: chỉ lưu trữ dữ liệu trong `memory`(RAM) của host, và không bao giờ ghi vào tập tin hệ thống của host.

## More detail about mount types.

- `Volumes` tạo và quản lý bởi Docker. Bạn có thể tạo volume bằng câu lệnh `docker volume create`, hoặc Docker có thể tạo một volume trong quá trình chạy container hoặc service.

  - Khi bạn tạo một volume, nó lưu trong một thư mục trong Docker host. Khi bạn mount volume vào container, thư mục này sẽ xuất hiện trong container. Cách này cũng tương tự như cách `bind mount` hoạt động, trừ việc volumes được quản lý bởi Docker và độc lập với các tiến trình khác của host.
  - Một volume có thể cùng lúc được mount vào nhiều container. Khi không có container nào đang sử dụng volume, volume vẫn sẵn có với Docker và không bị xóa một cách tự động. Bạn có thể xóa một volume không sử dụng với câu lệnh `docker volume prune`.
  - Khi bạn mount một volume nó có thể được đặt tên hoặc vô danh(anonymous). Anonymous volume không có tên cụ thể khi chúng được mount vào container, do vậy Docker chọn một tên ngẫu nhiên đảm bảo duy nhất cho volume. Named or anonymous hoạt động như nhau.
  - Volume cũng hỗ trợ `volume drivers`, cho phép bạn lưu dữ liệu của bạn trên `remote host` hoặc `cloud providers`.

- `Bind mounts` có sẵn từ những ngày đầu của Docker. `Bind mounts` có những giới hạn so với volumes. Khi sử dụng bind mounts một file hoặc thư mục trên máy chủ sẽ được mount vào container.File hoặc thư mục được tham chiếu với đường dẫn đầy đủ trên máy chủ. File và thư mục này không cần thiết phải đã tồn tại trên máy chủ. Nó sẽ được tạo nếu nó chưa tồn tại. Bind mounts có hiệu suất rất tốt nhưng lại phụ thuộc vào cấu trúc thư mục sẵn có trên máy chủ. Nếu bạn đang phát triển một ứng dụng mới trên Docker, hãy xem xét việc sử dụng volume được đặt tên. Bạn sẽ không thể sử dụng Docker CLI để quản lý trực tiếp bind mounts.

```text linenums="1"
  BIND MOUNTS CHO PHÉP TRUY CẬP CÁC TẬP TIN NHẠY CẢM
  - Một tác dụng phụ của bind mounts, có thể tốt hơn hoặc tồi hơn, đó là nó cho phép bạn thay đổi nội dung file hệ thống trên MÁY CHỦ (HOST chạy docker) từ tiến trình đang chạy trên CONTAINER, bao gồm tạo , thay đổi, hoặc xóa các file hoặc thư mục của hệ thống. Đây là một khả năng mạnh mẽ mang ý nghĩa về mặt bảo mật tác động lên các tiến trình KHÔNG PHẢI CỦA DOCKER trên hệ thống máy chủ(HOST).
```

- `tmpfs mount`: Một `tmpfs` mount thì không lưu dữ liệu trên ổ cứng của cả container lẫn mấy chủ. Nó có thể được sử dụng bởi một container trong suốt vòng đời của container, để lưu những dữ liệu không cần đảm bảo tính toàn vẹn hoặc thông tin nhạy cảm.

- `Named pipes`: Một `npipe` mount có thể sử dụng cho việc truyền thông giữa máy chủ Docker và container. Trường hợp sử dụng phổ biến là chạy một tool của bên thứ ba bên trong container và kết nối tới Docker Engine API sử dụng một named pipe.

- Bind mount và volume có thể đều được mount vào container bằng cờ `-v` hoặc `--volume`, dù cú pháp có hơi khác nhau đôi chút. Với `tmpfs` bạn có thể dùng cờ `--tmpfs`. Tuy nhiên từ Docker 17.06 trở đi, khuyến khích dùng `--mount` cho cả container và service dùng với bind mount ,volume, và cả tmpfs, như một cú pháp rõ ràng hơn.

## Good use cases for volumes

- Volume là cách nên dùng nhất cho Docker container và services khi muốn bảo toàn dữ liệu. Một vài trường hợp sử dụng volume bao gồm:

  - Chia sẻ dữ liệu giữ các container đang chạy. Nếu bạn không tạo một cách rõ ràng thì volume sẽ được tạo lần chạy đầu tiên và mount vào container. Khi container dừng hoặc bị xóa, volume sẽ vẫn còn tồn tại. Nhiều container có thể mount đồng thời vào cùng một volume, dù là đọc-ghi hay chỉ đọc (read-only). Volume chỉ bị xóa đi khi bạn xóa chúng một cách cụ thể.

  - Khi máy chủ Docker không có cấu trúc thực mục hoặc file nhất định (container lúc chạy trên Window lúc chạy trên Ubuntu - người dịch). Volume sẽ giúp bạn tách rời cấu hình của máy chủ Docker với container.

  - Khi bạn muốn lưu dữ liệu của container trên một máy chủ khác hoặc dịch vụ cloud, hơn là local.

  - Khi bạn cần backed, restore hoặc migrate dữ liệu từ một máy chủ Docker tới một máy khác. Volume luôn là lựa chọn tốt nhất. Chúng ta có thể dừng container sử dụng volume, sau đó backed thư mục volume( như `/var/lib/docker/volumes/<volume-name>`)

## Good use cases for bind mounts

- Thường thì nên sử dụng volume bất cứ khi nào có thể. Bind mounts sẽ thích hợp cho các kiểu trường hợp sau:

  - Chi sẻ cấu file cấu hình từ máy chủ Docker tới container. Đây là cách mặc định Docker cung cấp DNS cho container, bằng cách mount `/etc/resolv.conf` từ máy chủ tới mỗi container.

  - Chia sẻ source code hoặc build artifacts giữa các môi trường phát triển trên Docker host và một container. Ví dụ bạn mount một thư mục Maven `target/` vào một container, và mỗi khi bạn build project Maven trên máy chủ Docker, container sẽ có quyền truy cập vào artifacts đã được build lại này. Nếu bạn sử dụng Docker cho phát triển theo cách này, thực tế file Dockerfile trên production của bạn nên copy file artifacts trực tiếp vào image hơn là dùng bind mount

  - Khi file hoặc cấu trúc thư mục của máy chủ Docker được đảm bảo thích hợp với bind mounts của container.

## Good use cases for tmpfs mounts

- `tmpfs` mounts được sử dụng tốt nhất cho trường hợp khi bạn không muốn dữ liệu được lưu trên cả máy chủ lẫn trong container. Đây có thể là vì lý do bảo mật hoặc đảm bảo hiệu năng của container khi ứng dụng của bạn cần ghi một lượng lớn dữ liệu `non-persistent state`.

## Tips for using bind mounts or volumes

- Nếu bạn sử dụng bind mounts hoặc volumne, ghi nhớ những điều sau:

  - Nếu bạn mount một `empty volume` vào một thư mục trong container, khi thư mục này đã tồn tại file hoặc thư mục, các file hoặc các thư mục khi đó được `propagated`(copied) vào trong volume. Tương tự nếu bạn start một container và chỉ định một volume chưa tồn tại, một empty volume sẽ được tạo cho bạn.

  - Nếu bạn mount một bind mount hoặc một non-empty volume vào một thư mục trong container, khi thư mục đó đã có file hoặc các thư mục con tồn tại, các file hoặc các thư mục này sẽ bị che khuất bởi mount. Việc này tương tự như khi bạn lưu file vào `/mnt` trên Linux và sau đó bạn mount một USB vào `/mnt` vậy. Nội dung của `/mnt` sẽ bị che khuất bởi nội dung của USB cho tới khi USB được rút ra (hoặc unmount). Nội dung các file hay các thư mục không bị xóa hay thay thế, chúng chỉ đơn giản không thể truy xuất trong khi bind mount hoặc volume được mount vào :D

### Happy using Docker <3 :D :D :D
