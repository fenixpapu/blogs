# Script generate env variables


- Nay có một đoạn setup deployment file trước khi deploy, mà cu em đồng nghiệp feedback chuyển từ file `.env` sang `env` trên deployment dễ bị thiếu quá, đã thế check bằng mắt thường tốn performance, và request nên có tool.

- Ok! Bài này take note cho đoạn bash script đọc từ file `.env` và in ra `stdout` để chỉ việc copy vào deployment file. - bash script và sed hay phết :3 


- Mình có 1 file `.env` example như dưới:

```
user=papu
pass='mypassword'
sex="male"
```

- Đây là đoạn script của mình:

```
#!/bin/bash
echo "place me same folder with .env file!"
echo "===================================="
file_name='.env'
while IFS= read -r line || [ -n "$line" ]; do
[ -z "$line" ] && continue
line=$(echo $line | sed 's/['\''\"]//g')
echo "- name: ${line%=*}"
echo "  value: '${line#*=}'"
done < $file_name
```

- Chú thích:
  - `file_name='.env'` fix luôn tên file cho biến
  - `while IFS= read -r line || [ -n "$line" ]; do` đoạn này sẽ đọc hết file. `[ -n "$line" ]` nếu ko có dòng này nó sẽ bị bỏ sót mất dòng cuối , mình cũng chưa rõ tại sao.
  - `[ -z "$line" ] && continue` cái này để bỏ qua một line trống ( line ko có gì ).
  - `line=$(echo $line | sed 's/['\''\"]//g')` do giá trị của biến `env` có thể chứa `'` hoặc `"` nên dòng này sẽ xoá hết các dấu `'` và `"` đi.
  - Rồi phần còn lại là log ra biến thôi.

- Nếu chạy xong thì nó có dạng output ntn:

```
#bash env_generate.sh 
place me same folder with .env file!
====================================
- name: user
  value: 'papu'
- name: pass
  value: 'mypassword'
- name: sex
  value: 'male'
```

- P/s: bài này take note một số thứ mình tìm hiểu về bash script và sed. Bọn này thực sự tiện vãi nếu phải làm các script nhỏ và liên quan đến nội dung file :D. Mình vẫn đang cố gắng improve mảng này sẽ cố gắng take note tiếp một số bài.

- Happy devops and bash scripts :D