---
authors:
  - PaPu
categories:
  - devops
date: 2021-11-26
draft: false
---

# K8s overwrite hosts file on pod

- Nay đi làm khách hàng có một bài toán: `Tao muốn có một private domain my-private-domain.com trỏ tới 127.0.0.1 sử dụng nội bộ trong pod`
- Hiện tại KHG đang dùng route53 để giải quyết và muốn hỏi mình có giải pháp nào khác không ?

- Idea của mình là ghi đè vào docker `container` lúc chạy hoặc `image` lúc buid.
<!-- more -->
- Search thử qua thì hình như có chút vấn đề với việc ghi đè lên `image` lúc build. (nếu cần thì chắc có thể test thử lại). Thấy không ổn nên mình chuyển luôn ^^!. Solution thứ hai: ghi đè file hosts của container lúc chạy. Phía dưới file deployment cho nginx image sẽ ghi đè `/etc/hosts` khi container được chạy:

```linenums="1"
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: nginx-deployment
  spec:
    selector:
      matchLabels:
        app: nginx
    replicas: 1
    template:
      metadata:
        labels:
          app: nginx
      spec:
        hostAliases:
        - ip: "127.0.0.1"
          hostnames:
          - "foo.local"
          - "bar.local"
        - ip: "10.1.2.3"
          hostnames:
          - "foo.remote"
          - "bar.remote"
        containers:
        - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
```

- Deployment file trên sẽ ghi đè file `etc/hosts` với 2 bản ghi mới cho domain: `foo.local`, `bar.local` và `foo.remote`, `bar.remote`.
- Deploy thử file trên và check lại trên trong pod, với lệnh curl foo.local:

```linenums="1"
  papu@computer:Desktop$ kubectl exec --stdin --tty nginx-deployment-88b8b5cf8-m8km8 -- /bin/bash
  root@nginx-deployment-88b8b5cf8-m8km8:/# cat etc/hosts
  # Kubernetes-managed hosts file.
  127.0.0.1       localhost
  ::1     localhost ip6-localhost ip6-loopback
  fe00::0 ip6-localnet
  fe00::0 ip6-mcastprefix
  fe00::1 ip6-allnodes
  fe00::2 ip6-allrouters
  10.100.10.117   nginx-deployment-88b8b5cf8-m8km8

  # Entries added by HostAliases.
  127.0.0.1       foo.local       bar.local
  10.1.2.3        foo.remote      bar.remote
  root@nginx-deployment-88b8b5cf8-m8km8:/# curl foo.local
  <!DOCTYPE html>
  <html>
  <head>
  <title>Welcome to nginx!</title>
  <style>
      body {
          width: 35em;
          margin: 0 auto;
          font-family: Tahoma, Verdana, Arial, sans-serif;
      }
  </style>
  </head>
  <body>
  <h1>Welcome to nginx!</h1>
  <p>If you see this page, the nginx web server is successfully installed and
  working. Further configuration is required.</p>

  <p>For online documentation and support please refer to
  <a href="http://nginx.org/">nginx.org</a>.<br/>
  Commercial support is available at
  <a href="http://nginx.com/">nginx.com</a>.</p>

  <p><em>Thank you for using nginx.</em></p>
  </body>
  </html>
```

- Cách này có gì khác so với route53:

  - Route53 sẽ mất tiền cho mỗi bản ghi
  - Cách này thì không tuy nhiên khi IP thay đổi thì route53 chỉ cần sửa và sẽ được apply ngay. Còn với cách này chúng ta phải vào sửa tay từng pod hoặc sửa file deployment rồi deploy lại.

- Happy working :D!!
