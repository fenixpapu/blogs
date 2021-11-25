# Get a Shell to a Running Container

- Bài gốc ở [đây](https://kubernetes.io/docs/tasks/debug-application-cluster/get-shell-running-container/)
- Thi thoảng phải chạy lệnh trong container trong pod trên k8s lại phải đi search google. Nay thấy docs official nên thôi dịch luôn.

## Before you begin

- Trước khi bắt đầu bạn phải có k8s cluster và `kubectl` 

## Get a shell to a container

- Trong phần này bạn tạo một pod chạy một container. Container chạy image nginx. File `shell-demo.yaml` có nội dung như dưới:

```
  apiVersion: v1
  kind: Pod
  metadata:
    name: shell-demo
  spec:
    volumes:
    - name: shared-data
      emptyDir: {}
    containers:
    - name: nginx
      image: nginx
      volumeMounts:
      - name: shared-data
        mountPath: /usr/share/nginx/html
    hostNetwork: true
    dnsPolicy: Default
```

- Tạo pod: `kubectl apply -f shell-demo.yaml`.

- Kiểm tra rằng pod đang chạy: `kubectl get pod shell-demo`

- Với môi trường thực, khi bạn deploy bằng file `deployment.yml` bạn có thể liệt kê các pod đang chạy với namespace tương ứng: `kubectl get pod`. Không có option `-n <namespace_name>` thì sẽ là namespace default.

- Truy cập shell của container đang chạy: 

```
  kubectl exec --stdin --tty shell-demo -- /bin/bash
```

- ***LƯU Ý***: Double dash `--` phân biệt các tham số bạn muốn truyền vào câu lệnh (command) với các tham số của `kubectl`

- Sau khi vào trong `shell` của container thì bạn có thể thực thi các câu lệnh mình muốn:

```
  user@computer-name:Desktop$ kubectl exec --stdin --tty shell-demo -- /bin/bash
  root@shell-demo:/# cat etc/hosts 
  # Kubernetes-managed hosts file.
  127.0.0.1       localhost
  ::1     localhost ip6-localhost ip6-loopback
  fe00::0 ip6-localnet
  fe00::0 ip6-mcastprefix
  fe00::1 ip6-allnodes
  fe00::2 ip6-allrouters
  10.100.10.117   shell-demo
```

- Chạy một câu lệnh độc lập trong container bạn có thể thực thi trực tiếp như sau:
```
 kubectl exec shell-demo env
```

## Truy cập vào `shell` khi một Pod có nhiều container

- Sử dụng tùy chọn `--container` hoặc `-c` trong `kubectl exec`.
- Giả sử chúng ta có một pod: `my-pod` và trong pod có 2 container `main-app` và `helper-app`.
- Command dưới sẽ mở một shell trong container `main-app`:

```
  kubectl exec -i -t my-pod --container main-app -- /bin/bash
```

- ***NOTE***: Tùy chọn dạng ngắn `-i` và `-t` tương ứng với dạng đầy đủ `--stdin` và `--tty`. 

- `-it` nghe quen quen như trong docker nhể :D 

- Happy working!!