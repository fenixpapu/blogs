---
authors:
  - PaPu
categories:
  - devops
date: 2023-02-22
draft: false
---

# Custom ubuntu image with service ssh ready

- Bài này take note lại từ repo [này](https://github.com/fenixpapu/custom-ubuntu-image-with-ssh-ready)

- Tại sao cần custom ubuntu image dùng bản gốc không phải ngon hơn sao ?

<!-- more -->

- Mình đang thực hành ansible và bản chất cần một số server với quyền ssh vào. Nếu khởi chạy từng server rồi đi add user và ssh sẽ rất cực nên tạo luôn 1 image mang tính cá nhân với quyền ssh từ public key của máy mình. Sau đó chỉ việc run và thực hành ansible thôi

## Dockerfile and id_rsa

- `id_rsa.pub` sẽ chứa public key cần add.

- Dockerfile như dưới sẽ tạo user `ubuntu`, add key file, khởi chạy dịch vụ ssh.

```dockerfile linenums="1"
FROM ubuntu:20.04

RUN mkdir -p /var/run/sshd


RUN apt update && \
  apt install -y openssh-server

RUN useradd -rm -d /home/ubuntu -s /bin/bash ubuntu && \
  echo ubuntu:password1234 | chpasswd

RUN mkdir /home/ubuntu/.ssh && \
  chmod 700 /home/ubuntu/.ssh

COPY id_rsa.pub /home/ubuntu/.ssh/authorized_keys


RUN chown ubuntu:ubuntu -R /home/ubuntu/.ssh && \
  chmod 600 /home/ubuntu/.ssh/authorized_keys

CMD ["/usr/sbin/sshd", "-D"]
```

## Create image and container

- Sau khi đã có `Dockerfile` và `id_rsa.pub` build image thôi:

```sh linenums="1"
docker build -t ubuntu_custom .
```

- Khởi chạy container nào:

```sh linenums="1"
docker run -d --name ubuntu_custom_container_1 -it ubuntu_custom
```

- Check IP của container:

```sh linenums="1"
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ubuntu_custom_container_1
```

- Vậy thôi done rồi sau đó chúng ta có thể bắt đầu ssh vào container luôn và vọc với 1 trong các lệnh ssh:

```sh linenums="1"
ssh ubuntu@<ip_container>
# hoặc
ssh -i id_rsa ubuntu@<ip_container>
```
