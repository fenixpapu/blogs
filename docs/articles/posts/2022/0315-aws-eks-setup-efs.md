---
authors:
  - PaPu
categories:
  - devops
date: 2022-03-15
draft: false
---

# SET UP EFS FOR EKS

- EFS có thể sử dụng cross zone ( giữa các zone) nên ko bị hạn chế như EBS.
- Ví dụ khi 1 pod được tạo và nó phải sử dụng vol (ebs) trên `ap-southeast-1a` thì pod cũng bị giới hạn (nodeSelector) vào 1 node thuộc zone này.
- Việc tương tự không xảy ra với EFS ( data trên EFS pod có thể thuộc bất kỳ zone nào `1a`, `1b` hay `1c` đều được)

- Bài này sẽ ko có nhiều hình do account của khách hàng :D

## Cài đặt AWS EFS CSI driver

- Để sử dụng EFS thì eks cần cài: `IAM policy và role`, `AWS EFS driver`, `tạo AWS EFS file system`
- Tất cả có trong [official doc](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html)

## Sử dụng

- Sau khi có File system ( check lại cách tạo EFS có mã hóa hay không). Đường dẫn trên web console: `Amazon EFS > file system`

- Tạo các access point cho file system vừa tạo ( lưu lại file system ID và access point ID): `NOTE`: phải tạo access point thì mới dùng được.

- Bước cuối tạo `storage`, `pv`, `pvc` và `deployment` file để sử dụng thôi

- `storage` `.yml` file:

```linenums="1"
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: efs-storage-class
provisioner: efs.csi.aws.com
```

- `pv` and `pvc` `.yml` file:

```linenums="1"
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-alpha-efs-appdata
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: efs-storage-class
  csi:
    driver: efs.csi.aws.com
    volumeHandle: fs-2f49f26f::fsap-0c7ee979b761b98a4
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-alpha-efs-appdata
  namespace: alpha-private
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs-storage-class
  resources:
    requests:
      storage: 1Gi
---
```

- Khi có `pvc` rồi thì chỉ việc mount vào deployment file thôi:

```linenums="1"
spec:
    volumes:
      - name: efs-appdata-vol
        persistentVolumeClaim:
          claimName: pvc-alpha-efs-appdata
    containers:
      - name: web
        image: <link-to-image>
        ports:
          - name: http
            containerPort: 80
            protocol: TCP
        env:
          - name: LOG_LEVEL
            value: INFO
        resources: {}
        volumeMounts:
          - name: efs-appdata-vol
            mountPath: /app/App_Data
```
