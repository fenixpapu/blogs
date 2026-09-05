---
authors:
  - PaPu
categories:
  - devops
date: 2026-09-04
draft: false
---

# EKS vpc-cni vs kube-proxy

- EKS addon: `vpc-cni` và `kube-proxy` là 2 addon của eks đều liên quan đến `network` vậy chúng khác nhau cụ thể ntn?
<!-- more -->

## `kube-proxy`

- Là 1 k8s component giúp k8s service hoạt động:
- Được chạy như một DaemonSet trong worker Nodes.
- Theo dõi k8s API để cập nhật Service và Endpoint.
- Quản lý Iptables hoặc IPVS rules trên mỗi node nhằm đảm bảo traffic được chuyển tiếp đến đúng pod
- `traffic manager` cho k8s service.

## `vpc-cni`

- là một network plugin cung cấp cho pods địa chỉ IP của AWS VPC:
- Gán địa chỉ IP cho mỗi pod từ VPC subnet.
- Quản lý network từ pod-to-pod bên trong cluster.
- Quản lý ENI và cấp phát IP cho nodes và pods.

## Summary:

- `kukbe-proxy`: giúp đảm bảo service trong k8s hoạt động đúng bằng cách định tuyến lưu lượng.
- `vpc-cni`: cung cấp cho pod địa chỉ mạng và kết nối chúng với AWS VPC.

### HAPPY WORKING!!!
