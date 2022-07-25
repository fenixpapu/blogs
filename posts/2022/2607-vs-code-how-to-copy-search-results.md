# VS code how to copy search results

## Introduction

- Hôm nay mình gặp một case có rất nhiều dòng có kiểu: `"duration": miliseconds`. Xấp xỉ 800 lines.
- Yêu cầu cần phải copy hết tất cả các giá trị đó ra để so sánh. @@!. Nếu in ít thì còn dùng multiple cursor của vs code ( Alt + Left click) để click rồi copy chứ 800 lines mà click để copy thì chắc há hốc :D 

- Sau khi lấy regex được đoạn này để search nên mình nghĩ ra google cách để copy cái kết quả search này. Tada [stackoverflow](https://stackoverflow.com/a/47024020/1406656) mãi đỉnh :D 


## How to
- Take note lại cho lần sau còn cần dùng:
  1. `CTRL + F`
  2. Type your search
  3. `CTRL + SHIFT + L`: chọn tất cả kết quả tìm kiếm hợp lệ ( max 999 thôi nhé)
  4. `CTRL + I`: để chọn cả dòng ( trong trường hợp cần lấy cả dòng thôi nhé)
  5. `CTRL + C`
  6. `CTRL + V`

- Trong trường hợp có vài nghìn kết quả hợp lệ chắc `CTRL + X` để lấy 999 thằng đầu tiên quá rồi lại `cut` tiếp. Nhưng nếu là vài trăm nghìn hoặc hơn chắc phải tính đến dùng code: bash, python.