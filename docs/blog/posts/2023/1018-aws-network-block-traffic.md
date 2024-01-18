# AWS network block traffic

- Bài này note lại TIL thôi. Mình có 1 yêu cầu từ dev team block traffic từ 1 service tới 1 service khác. Chính xác là block traffic từ spark job tới kafka.

- Về mặt lý thuyết chúng ta sẽ có 1 số cách block tuỳ vào hạ tầng cụ thể, từ ngoài vào trong lần lượt sẽ:

  - chặn routing ( nếu khác VPC và đang đang routing).
  - chặn ở NACL
  - Chặn SG
  - Chăn firewall

- Hình minh hoạ:

```

 ┌───────────────────────────────┐
 │             VPC               │
 │                               │
 │    ┌───────────────────┐      │
 │    │        NACL       │      │
 │    │   ┌───────────┐   │      │
 │    │   │    SG     │   │      │
 │    │   │  ┌─────┐  │   │      │
 │    │   │  │     │  │   │      │
 │    │   │  │ EC2 │  │   │      │
 │    │   │  │     │  │   │      │
 │    │   │  └─────┘  │   │      │
 │    │   │           │   │      │
 │    │   └───────────┘   │      │
 │    │                   │      │
 │    └───────────────────┘      │
 │                               │
 │                               │
 └───────────────────────────────┘

```

## Đánh giá:

- Mình note lại theo quan điểm cá nhân nếu sau có thêm sẽ cập nhật hoặc sửa đổi:

  - VPC: chặn level VPC quá to có thể gây ảnh hưởng cả các service khác trong cùng VPC cũng bị block trong khi thật ra ko cần hoặc ko nên ( nên hạn chế dùng).

  - NACL: Vừa đẹp thường NACL ít cấu hình và các rule đơn giản nhìn thấy ngay, chặn hay cho phép riêng 1 service đơn giản hơn so với VPC, nếu sai sửa lại cũng dễ dàng hơn so với SG hay firewall trên ec2

  - SG: đa phần các dự án mình thấy SG hơi nhiều rule ( nhất là inbound) nhiều hơn rất nhiều so với NACL. Chưa kể SG lại có kiểu tham chiếu đến SG khác nên việc check đã chặn hết chưa phức tạp hơn NACL nhiều. Khi rollback lại cũng phức tạp hơn.

  - Firewall: với các instance ec2 linux có thể enable firewall để block traffic: con dao hai lưỡi hãy cẩn thận. Cơ bản thì ko khuyến khích dùng vì nếu chặn nhầm (block all) thì thôi khỏi ssh vào luôn lúc này chỉ còn cách kết nối theo console. Nói chung nhỡ cái phức tạp lắm :D

- Bài viết này chỉ có vậy thôi. Note lại phần TIL khi mình nhận được request check block traffic từ 1 service tới 1 service khác :D

### HAPPY WORKING!!!
