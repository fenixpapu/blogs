---
authors:
  - PaPu
categories:
  - devops
date: 2021-11-21
draft: false
---

# Site-to-Site VPN Between GCP and AWS Cloud

- Bài gốc trên linkin [ở đây](https://www.linkedin.com/pulse/site-to-site-vpn-between-gcp-aws-cloud-aslam-chandio/?articleId=6668922995207086080).

- Điều kiện tiên quyết:

  - Tác giả coi như bạn đã tạo VPC trên GCP và AWS, đồng thời đã tạo 2 VMs trong public subnet với public IP.

## Step 1 - Create Static IP trong GCP

- Tạo 1 static public IP bên GCP: `VPC network` -> `External IP address`.

- Giả sử sau khi tạo xong public IP của bạn bên GCP là: `35.245.78.201`

## Step 2 - Create a "Customer Gateway" in AWS Cloud

- Customer gateway là một đại diện, trong AWS, để phía VPN bên kia kết nối tới. Cơ bản đây sẽ là 1 IP mà AWS sẽ liên lạc tới.

- AWS: `VPC` -> `Customer Gateways` -> `Create customer gateway`: routing chọn static, IP address là static IP bên GCP vừa tạo ở trên.

## Step 3 - Create "Virtual private gateway" in AWS Cloud

- Một `virtual private gateway` là một đại diện của `VPN connector` trong AWS. Nó như là phía AWS giữa hai kết nối mạng: cổng ra của traffic AWS VPC

- AWS: `Virtual private Gateways` -> `Create virtual private gateway`

## Step 4 - Attach virtual private gateway to the VPC

- Sau khi tạo VPG chúng ta đã có một cổng bên trong AWS nhưng nó đang chẳng liên kết với đâu cả.

- AWS: `VPC` -> `Virtual private gateway` -> `Select your VPC` -> `Actions` -> `Attach to VPC`.

- Mỗi một VPC chỉ connect được tới một VPG.

## Step 5 - Create the "VPN connection" in AWS

- Chúng ta đã sẵn sàng liên kết hai bên.

- AWS: `VPC` -> `Site-to-Site VPN connections` -> `Create VPN connection`:

  - Name tag: `VPN connection`

  - Target gateway type: `Virtual Private gateway`

  - Virtual private gateway: VPG ID

  - Customer Gateway: EXisting

  - Customer Gateway ID: CD ID

  - Routing options: Static(GCP Private Subnet IP) 172.16.1.0/24

## Step 6 - Download the configuration from AWS

- Chúng ta cần download cấu hình AWS đã tạo ra để cấu hình phía GCP (GCE): AWS -> `VPC` -> `Site-to-Site VPN Connections` -> Select VPN connection -> `Download configuration`

  - Vendor: `Generic`

  - Platform: `Generic`

  - Software: `Vendor Agnostic`

- Trong file download này những tham số sau là quan trọng:

  - `Internet Key Exchange Configuration`: IKE Version, Pre-shared key

  - `Tunnel interface configuration`: Virtual private gateway IP

## Back to GCE :D

## Step 7 - Create "VPN connection" in GCP

- Chọn `VPN` từ tab `Hybrid Connectivity`

- Chọn tiếp `VPN` menu bên trái -> `Create VPN connection`

- Chọn `Classic VPN` -> `Continue`

- Google Compute Engine VPN gateway:

  - Name: `gcp-vpn-connection`

  - Network: `company-vpc`

  - Region: `us-east4`

  - IP Address: `35.245.78.201 (GCP Static Public IP)`

  - GP tunnel setting

  - Remote Peer IP Address: `3.212.143.189 (AWS VPG IP)`

  - IKE version: `IKEv1`

  - Remote network IP Range: `10.10.0.0/16 (AWS VPC CIDR)`

## Step 8 - Route propagation in AWS Cloud

- Edit routing table of subnet

- AWS: `VPC` -> `Route Tables` -> Select route table -> `Edit Routes`:

  - Thêm route cho mạng GCP : `172.16.1.0/24  Target (Virtual Private Gateway)`

  - hoặc tự động quảng bá định tuyến(Propagate Route automatically)

## Step 9 - Edit security group in AWS Cloud

- AWS: `VPC` -> `Security Groups` -> Select SG -> `Inbound rules` -> `Edit Rule`:

  - Allow SSH và ICMP cho subnet GCP (GCP subnet CIDR 172.16.1.0/24)

## Step 10 - Edit Firewall Rule in GCP Cloud

- GCP: `VPC network` -> `Firewall rules` -> `Source IP range`: Add CIDR VPC của AWS: `10.10.0.0/16`

- Check lại status sau khi hoàn tất:

  - AWS: VPN connections là `available`, Tunnel Detail là `UP`

  - GCP: `Hybrid Connectivity` -> `VPN` -> `Cloud VPN tunnels` : `enabled`

- Test lại bằng cách vào 2 VMs trên 2 cloud platform để ping sang 2 IP

- AWS VPC CIDR 10.10.0.0/16: PublicSubnet-1 10.10.1.0/24

- GCP PublicSubnet 172.16.1.0/16

## Happy working! :D
