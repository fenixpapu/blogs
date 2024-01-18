# Lambda timeout argument


- Bài này gần như là 1 TIL (today I learned) thôi.

- Chuyện là mình đang thử việc (flex tý đã pass), dev backend có ping check 1 lambda không work. Các bạn dev code không thay đổi gì.
- Mình có check log thấy có 1 đoạn liên quan `timeout 3s`. Đặt thử thêm thử log vào trong code thì đoạn đọc vào db ok.
- Đến đoạn call sang 3th party thì dừng làm mình nghĩ api bên kia có vấn đề nên timeout.
- Nhưng dùng postman call api bên kia bình thường. Đặt thêm log thì 2 dòng `console.log` liền kề nhau 1 dòng in ra được 1 dòng ko: `timeout 3s`.
- Rồi xong đến đây nghĩ ngay đến cái `timeout` của lambda ( khoảng thời gian lambda tồn tại để chạy job) -> Chuẩn luôn timeout 3s.
- Cay thặc chớ ^^!:
  - Khi check bug lambda mọi người đừng quên biến này nhé :| 
  - Khi tạo lambda cứ set lên 15m vào. Giá của lambda tính theo cấu hình và khoảng thời gian thực thi (chạy bao nhiêu tính tiền bấy nhiêu) chứ ko liên quan đến việc khai báo timeout. Nhưng timeout thấp có thể làm lambda dừng khi chưa thực thi xong như trường hợp kể trên của mình.



### HAPPY WORKING (Devops)