# Take note about k8s autoscaler

- Bài này sẽ không có ảnh do sợ lộ thông tin cấu hình của khách hàng mình đang làm :D. Hy vọng sau có điều kiện sẽ làm demo được.
- Bài này cũng ko dài chỉ 1 dòng note lại công việc hôm nay.

- Sau khi implement auto scale cho k8s như file `1117-eks-cluster-autoscaler.md`. Mình muốn test lại xem đã ok chưa.

- Mình có xem 1 video của bạn này khá hữu ích nó đầy đủ thông tin mình cần. Video ở [đây](https://www.youtube.com/watch?v=gwmdboC-BtE&lc=UgzBAD87uA8iSbwapSN4AaABAg.9Ur60HH5-RY9UsVtfsRPie). Đoạn cuối sau khi tạo eks cluster, implement `cluster autoscaler`. Bạn deploy thêm nginx để test autoscaler.

- Mình làm tương tự và gặp chút vấn đề. Ban đầu không có pod nào , và có 2 node. Sau khi deploy với `replica: 3`. 2 pod lên running và 1 pod vẫn penđing. Theo tính toán chỉ cần 1 node tạo thêm là đáp ứng đủ cho 3 replica. ( mỗi pod được chỉ định trên một node). Nhưng không node thứ 3 rồi node thứ 4 được tạo ra và pod thứ 5 có thể được tạo tại sao?

- Câu trả lời là do mình để deployment file chỉ định vào node có label cụ thể. Nhưng node được tạo mới không có label này. Nên node mới tiếp tục được tạo.

- Vậy cần lưu ý những gì?
  - Cần biết được `launch template` của `Auto Scaling Group` trên AWS đang như thế nào ? Nếu không có thể node mới tạo ra nhưng pod ko bao giờ được assign vào.
  - Xem xét cấu hình `min` và `max` trong ASG với con số hợp lý.  Như trường hợp trên mà max lớn thì hơi toang.


- Happy working :D!!