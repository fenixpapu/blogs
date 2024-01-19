# Connect to your Linux instance if you lose your private key

- Official ở [đây](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/replacing-lost-key-pair.html)

- Bài này dịch từ doc official của AWS, mình thấy nó có giá trị trong cả các server khác ( hiểu hệ thống và cách ổ cứng được đọc bởi hệ điều hành) nên dịch lại đây sau có thể cần dùng :D

- Đôi khi ec2 instance có thể còn có cách khác truy cập nhanh hơn cách này nếu nó được enable. Các đó ở đây: [Remote-into-EC2-with-ssm-session-manager](https://cevo.com.au/post/remoting-into-ec2s-with-ssm-session-manager/)

## Here we go

- Nếu bạn mất private key của một instance chạy EBS, bạn có thể lấy lại quyền truy cập vào instance đó. Bạn cần `stop` instance, detach root volume và attach nó ( root volume) vào một instance khác như volume data, thay đổi `authorized_keys` file với public key mới, gắn trả root volume vào instance cũ và `restart` lại instance.

- Các bước dưới đây chỉ support cho instance với EBS root volumes. Nếu root device là một instance store volume, bạn không thể sử dụng cách này để lấy lại quyền truy cập vào instance của bạn; bạn phải có private key để connect vào instance. Để xác định kiểu của root device instance của bạn, mở AWS EC2 console, chọn `Instances`, tích chọn instance cần thiết, và kiểm tra giá trị của `Root device type` trong thanh details. Giá trị hoặc là `ebs` hoặc `instance store`

- Ngoài các bước bên dưới sắp trình bày. Chúng ta còn có các cách khác nhau để lấy lại quyền truy cập chi tiết [tại đây](https://aws.amazon.com/premiumsupport/knowledge-center/user-data-replace-key-pair-ec2/)

### Các bước để kết nối tới ec2 (ebs root device) với key pair khác

- Step 1: Tạo key pair mới
- Step 2: Lấy thông tin về instance gốc và root volume của nó
- Step 3: Stop instance gốc
- Step 4: Start một instance tạm thời
- Step 5: Detach root volume từ instance gốc, và attach nó và instance tạm thời
- Step 6: Thêm mới một public key vào `authorized_keys` trong original volume đã được mount vào instance tạm thời
- Step 7: Unmount và detach original volume từ instance tạm thời, và attach lại instance gốc
- Step 8: Connect vào instance gốc sử dụng key pair mới
- Step 9: Clean up

---

## Step 1: Create new key pair

- Dùng AWS console tạo một keypair mới hoặc third-party tool. Nếu muốn tạo keypair name chính xác như cái đã mất, trước hết phải xóa cái đang tồn tại đi.

---

## Step 2: Get information about the original instance and its root volume

- Note lại các thông tin sau vì bạn sẽ cần nó để hoàn tất quá trình, sau khi đã vào aws console của instance gốc:

  - Trên tab `Detail`, note `instance ID` và `AMI ID`
  - Trên tab `Networking`, note lại `Availability Zone`
  - Trên tab, dưới `Root device name`, note lại device name của root volume( ví dụ: `/dev/xvda`). Dưới `Block devices`, tìm device name và note lại `Volume ID` ( ví dụ: `vol-0a1234b5678c910de`)

---

## Step 3:

- Stop instance gốc

```linenums="1"
WARNING: HÃY CHẮC CHẮN ĐÃ BACKUP MỘT BẢN TRƯỚC KHI STOP INSTANCE
```

---

## Step 4:

- Chạy một instance tạm thời ( hoặc dùng luôn 1 instance nào đó (bastion chẳng hạn), mà bạn có quyền truy cập)
- Nếu chạy một instance tạm thời mới, hãy thêm tag: `Name=Temporary` (để lúc sau dễ nhận biết)

---

## Step 5: Detach root volume from the original instance and attach it to the temporary instance

- Trong `navigation pane`, chọn `Volumes` và chọn root device volume của instance gốc ( bạn đã note lại volume ID trong bước 2). Chọn `Actions`, `Detach Volume` và chọn `Yes, Detach`. Chờ đến khi volume có trạng thái `available`(có thể bạn cần nhấn `Refresh` để tải lại)

- Với volume vẫn đang tích chọn, chọn `Actions` và chọn `Attach Volume`. Chọn instance ID của instance tạm thời, ghi chú lại tên thiết bị được chỉ định dưới `Device` ( ví dụ: `/dev/sdf`) và chọn `Attach`

- Note khi dùng AMI ngoài: `If you launched your original instance from an AWS Marketplace AMI and your volume contains AWS Marketplace codes, you must first stop the temporary instance before you can attach the volume.`

---

## Step 6: Add the new public key to authorized_keys on the original volume mounted to the temporary instance

- Connect vào instance tạm thời
- Từ instance tạm thời, mount volume bạn đã attach vào instance vì vậy bạn có thể truy cập vào file hệ thống. Ví dụ nếu device name là: `/dev/sdf`, dùng lệnh dưới đây để mount volume vào `mnt/tempvol`
- Note: `Device name có thể khác nhau trên thiết bị của bạn. Ví dụ, device được mount có thể là '/dev/sdf' và được hiển thị như '/dev/xvdf' trên instance. Một vài phiên bản của Red Hat có thể tăng ký tự lên 4 như từ '/dev/sdf' thành '/dev/xvdk'`

  - Sử dụng lệnh `lsblk` để xác định nếu vol đã được phân vùng

```linenums="1"
[ec2-user ~]$ lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvda    202:0    0    8G  0 disk
└─xvda1 202:1    0    8G  0 part /
xvdf    202:80   0  101G  0 disk
└─xvdf1 202:81   0  101G  0 part
xvdg    202:96   0   30G  0 disk
```

- Trong ví dụ trên `/dev/xvda` và `/dev/xvdf` đã được phân vùng và `/dev/xvdg` thì chưa. Nếu vol đã được phân vùng thì chúng ta sẽ mount phân vùng `/dev/xvdf1` thay vì raw device (`/dev/xvdf`) trong các bước tiếp theo.

- Tạo thực mục tạm để mount volume

```linenums="1"
[ec2-user ~]$ sudo mkdir /mnt/tempvol
```

- Mount vol (hoặc phân vùng) vào thư mục tạm, sử dụng vol name hoặc device name đã xác định bước trên. Câu lệnh tùy thuộc vào hệ điều hành mà bạn đang sử dụng. Lưu ý tên thiết bị ( device name) có thể khác nhau tùy thuộc vào instance của bạn:
  - Amazon Linux, Ubuntu, and Debian:

```linenums="1"
[ec2-user ~]$ sudo mount /dev/xvdf1 /mnt/tempvol
```

- Amazon Linux 2, CentOS, SUSE Linux 12 và RHEL 7.x

```linenums="1"
[ec2-user ~]$ sudo mount -o nouuid /dev/xvdf1 /mnt/tempvol
```

- Note: `Nếu gặp lỗi bắt đầu với 'file system is corrupt' chạy lệnh sau để kiểm tra và sửa lỗi: '[ec2-user ~]$ sudo fsck /dev/xvdf1' `

- Từ instance tạm dùng lệnh sau để update `authorized_keys` trên vol được mount vào với public key mới từ `authorized_keys` của instance tạm:
  - Comment người dịch: Phần dưới có 1 đoạn cần check lại file permission do đã thay đổi file permission. Hãy thử copy nội dung vào file thôi thay vì copy file (khỏi bận tâm permission của file)
  - Note: `Lệnh dưới dùng cho user: 'ec2-user' nếu là user khác bạn cẩn sửa lại cho phù hợp`

```linenums="1"
[ec2-user ~]$ cp .ssh/authorized_keys /mnt/tempvol/home/ec2-user/.ssh/authorized_keys
```

- Nếu lệnh trên thành công có thể đi tới step tiếp theo.
- Nếu không có quyền edit file trong `/mnt/tempvol` bạn cần update file dùng lệnh sudo, và check permission trên file để xác thực bạn có quyền login vào instance gốc. Dùng lệnh sau:

```linenums="1"
[ec2-user ~]$ sudo ls -l /mnt/tempvol/home/ec2-user/.ssh
total 4
-rw------- 1 222 500 398 Sep 13 22:54 authorized_keys
```

- Ví dụ trên `222` là user ID, và `500` là group ID, tiếp theo dùng lệnh sudo để chạy lại câu lệnh

```linenums="1"
[ec2-user ~]$ sudo cp .ssh/authorized_keys /mnt/tempvol/home/ec2-user/.ssh/authorized_keys
```

- Chạy lại câu lệnh lần nữa để check xem permission đã đổi rồi hay chưa:

```linenums="1"
sudo ls -l /mnt/tempvol/home/ec2-user/.ssh
```

- Nếu user ID và group ID đã bị thay đổi, sử dụng lệnh sau để restore lại:

```linenums="1"
[ec2-user ~]$ sudo chown 222:500 /mnt/tempvol/home/ec2-user/.ssh/authorized_keys
```

---

## Step 7: Unmount and detach the original volume from the temporary instance, and reattach it to the original instance

- Từ instance tạm, unmount vol ( để mount lại vào instance gốc sau đó) với lệnh:

```linenums="1"
sudo umount /mnt/tempvol
```

- Detach volume ( vừa unmount ở trên) khỏi instance ( lên aws console thực hiện)

- Attach volume trở lại instance gốc: chỉ định đúng tên thiết bị (device name) mà đã note lại trước đó trong step 2. Important: `nếu không chỉ định đúng device name có thể sẽ ko start được instance. Amazon EC2 mong đợi root volume ở sda1 hoặc /dev/xvda`

---

## Step 8: Connect to the original instance using the new key pair

---

## Step 9: Clean up

- Nếu bạn dùng một instance sẵn có thì bỏ qua bước này.
- Nếu bạn chạy một instance tạm hãy terminate nó để giảm chi phí
