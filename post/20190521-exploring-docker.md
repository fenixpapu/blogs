## Mở đầu
Hi guys!
Là một người mới tìm hiểu `docker` và mới dừng ở run `container` từ `image` :D. Mình có lên trang web của docker để đọc [documentation](https://docs.docker.com/get-started/). Nhưng thấy khá dối vì có quá nhiều khái niệm: docker-something( docker-compose, docker-machine, docker engine, docker swarm, docker image, docker container...). Vì vậy mình quyết định không đọc tiếp documentation nữa. Mà sẽ tìm hiểu tổng quát qua các khái niệm của docker, để có cái nhìn bao quát trước khi đi vào chi tiết từng khái niệm. Đó cũng chính là nội dung của bài viết này sẽ trình bày. Ngoài khái niệm về định nghĩa, nội dung có viêt theo ý hiểu của cá nhân :)

## [Docker Engine](https://github.com/docker/engine)

- Là một lightweight runtime tool sẽ build và run các docker containers. Nó hoạt động như thế nào? Docker thực chất là một ứng dụng dạng client-sever. Docker Client sẽ giao tiếp với Docker Engine qua một RESTful API, để thực hiện việc build, ship và run các containers.

- Có bốn khái niệm chính trong thế giới Docker Engine - chúng đều có ID - bằng cách kết hợp chúng cùng nhau, chúng ta có thể build, ship và run ứng dụng, ở bất kỳ đâu( Như website của Docker tóm tắt: [Docker — Build, Ship, and Run Any App, Anywhere.](https://www.docker.com/))
    - Images: image được sử dụng để đóng gói các ứng dụng và gói phụ thuộc. Image có thể được lưu local hoặc trên registry (ví dụ: https://hub.docker.com/).
    - Containers. Container chính là một thể hiện của images.( khi bạn chạy một ứng dụng)
    - Networks: Bạn có thể kết nối cũng như tách biệt các containers vào trọng một mạng riêng.
    - Volumes: Volumes được thiết kế để lưu dữ liệu, độc lập với vòng đời của containers - thế nghĩa là sao ? Thông thường chúng ta có thể lưu dữ liệu ngay trong containers kiểu thiết kế này làm containers bị phình to ra, và quan trọng hơn mỗi khi containers bị xóa, toàn bộ dữ liệu sẽ bị mất. Volumes sẽ giải quyết vấn đề này.
- Hình bên dưới mô tả cách thức các Docker Client trên hoạt động và tương tác với nhau:
    ![Docker-engine-diagram](../images/20190523_docker_engine_diagram.png)
    - Loằng ngoằng khó hiểu vậy? Mình sẽ giải thích qua một chút. Docker thực hiện chính các việc: ship, build, run. Trong hình trên chia ra 3 phần tương ứng cho các việc này.
    - Nhìn từ trên xuống ví dụ cho phần ship: từ `Dockerfile` chúng ta có thể build ra 1 `image` hoặc từ một `repository` chúng ta có thể `pull` về `images` hoặc ngược lại từ các `image` này chúng ta có thể `push` lên `repository` đó chính là `ship`.
    - Phần thứ 2 từ `images` chúng ta có thể `run` thành một `container` hoặc `container` chúng ta có thể `commit` để tạo ra images. Đó là phần `build`.
    - Phần cuối: trong quá trình `contaiers` được chạy. Nó sẽ có thể liên kết với nhau( `networks`) và lưu trữ giữ liệu đâu đó ngoài `container` (`volumes`) đó phần run của docker.

## Distribution tools( công cụ quản lý phân tán các images)

-   Để lưu trữ và quản lý các Docker image chúng ta có các công cụ sau:
    - Docker Registry: là một mã nguồn mở giúp bạn tự lưu trữ và quản lý Docker images.
    - Docker Trusted Registry: là công cụ quản lý và lưu trữ images có tính phí( nếu bạn có nhu cầu thì có thể tìm hiểu thêm - mình hiện tại chưa có :D)
    - Docker Hub: Được cung cấp bởi docker, và mặc định docker Client sẽ sử dụng Docker Hub này nếu không có registry nào được cấu hình. Nếu đụng đến Docker chắc chắn bạn sẽ dùng dùng tới nó nhiều :D

## Orchestration tools ( công cụ điều phối)
- [Docker Machine](https://github.com/docker/machine): cho phép tạo Docker hots trên máy tính của bạn, dịch vụ cloud, trong datacenter. Docker tạo server và cài đặt Docker lên chúng, kế đến cấu hình để Docker Client có thể giao tiếp được với Docker server.
- [Docker Swarm](https://github.com/docker/swarm): là một tool giúp phân cụm (clustering) cho Docker containers. Gom vài Docker Engines lại với nhau và expose chúng ra ngoài như một virtual Docker Engine. Swarm hỗ trợ chuẩn Docker API, bởi vậy tool nào kết nối với Docker Engine thì đều có thể sử dụng Swarm. Swarm cũng nên cấu hình và deployed với Docker Machine.
- [Docker compose](https://github.com/docker/compose): là tool cho việc định nghĩa và chạy nhiều docker-container. Ví dụ để `run` 10 container thay vì 10 lần lệnh. Giờ đây với cấu hình sẵn trước trong docker-compose.yml chúng ta chỉ cần chạy 1 lệnh: `docker-compose up`. (nhẹ nhàng hơn không? :D)

## Third party tools
- Ngoài ra còn có một số tools cho trong hệ sinh thái Docker bạn cũng nên biết qua:
    - ***Orchestration*** : như Kubernets hoặc Mesos Marathon.
    - ***Clustering***: như Fleet hoặc Nomad.
    - ***Registries***: như Quay.io hoặc Artifactory.
    - ***Managed container services***: AWS ECS, Google Container Engine.
## Summing up
- Tool Docker cho phép build, ship, và run bất kỳ ứng dụng nào, ở bất kỳ đâu:
    - ***Build***: `Docker Engine`( docker build -t) và `Docker Compose` (docker-compose build, các ứng dụng chạy nhiều container)
    - ***Ship***: Docker Registry, Docker Trusted Registry, Docker Hub(SaaS)
    - ***Run***: `Docker Engine`(Docker run), `Docker Swarm` (quản lý nhiều Docker Engine), `Docker Compose` (docker-compose up)
    - ***Manage***: Docker Universal Control Plane và Docker Cloud(CaaS).
    - ***Provisioning of Docker Engines***: Docker Machine, Docker Toolbox, Docker for Mac, Docker for Windows(với máy cá nhân)

## Kết
- Khi tìm hiểu viết bài này, giúp mình có cái nhìn tổng quan về Docker cũng như hiểu, phân biệt các khái niệm `Docker-something`.
- Giúp mình nhìn các phần trong documentation của Docker dễ dàng hơn, định hướng được mình đang đọc phần nào của docker, hoặc cần tìm ở đâu dễ dàng hơn.
- Chúc bạn có chung cảm nhận giống như mình!