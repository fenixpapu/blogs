# Script generate env variables

- Nay có một đoạn setup deployment file trước khi deploy, mà cu em đồng nghiệp feedback chuyển từ file `.env` sang `env` trên deployment dễ bị thiếu quá, đã thế check bằng mắt thường tốn performance, và request nên có tool.

- Ok! Bài này take note cho đoạn bash script đọc từ file `.env` và in ra `stdout` để chỉ việc copy vào deployment file. - bash script và sed hay phết :3

- Mình có 1 file `.env` example như dưới:

```linenums="1"
user=papu
pass='mypassword'
sex="male"
```

- Đây là đoạn script của mình:

```linenums="1"
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

## Chú thích:

- Phần này có liên quan [string operators](https://www.oreilly.com/library/view/learning-the-bash/1565923472/ch04s03.html) tong bash script
- `file_name='.env'` fix luôn tên file cho biến
- `while IFS= read -r line || [ -n "$line" ]; do` đoạn này sẽ đọc hết file. `[ -n "$line" ]` nếu ko có dòng này nó sẽ bị bỏ sót mất dòng cuối , mình cũng chưa rõ tại sao.
- `[ -z "$line" ] && continue` cái này để bỏ qua một line trống ( line ko có gì ).
- `line=$(echo $line | sed 's/['\''\"]//g')` do giá trị của biến `env` có thể chứa `'` hoặc `"` nên dòng này sẽ xoá hết các dấu `'` và `"` đi.

- `${line%=*}`: `%` là một string operator sẽ kiểm tra từ cuối string và pattern ở đây là `=*`, pattern này sẽ match từ dấu `=` đầu tiên tới cuối string, xoá phần match này và trả về phần còn lại -> sẽ xoá phần `=value` và trả về `key`
- `${line#*=}`: `#` là một string operator sẽ kiểm tra từ đầu một string và pattern ở đây là `*=` , parttern này sẽ match từ đầu tới dấu `=` ( vì \* match tất cả các ký tự). `#` sẽ xoá phần match và trả về phần còn lại -> sẽ xoá từ `key=` và trả về phần `value` trong biến `env`

- Nếu chạy xong thì nó có dạng output ntn:

```linenums="1"

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
