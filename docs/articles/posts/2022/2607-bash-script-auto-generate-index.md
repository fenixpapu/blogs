# auto generate index with bash script

- Mình có các bài viết theo các năm mỗi tội muốn đọc lại phải vào từng folder của năm để check ( hơi tù).
- Có ý định dùng code để generate cái mục lục tự động mà vẫn chưa code được ( nodejs, python hay rust :D)
- Dạo này đang viết bash nhiều mà lại thấy nhanh gọn tiện nên làm luôn cái generate này :D

## Line by line

- File gốc: [generate-index.sh](../../generate-index.sh)

```sh linenums="1"
#!/bin/bash
posts=`find posts | grep .md | sort -nr`
sed -i ""  '15,$d'  README.md
echo '| Post | Year |' >> README.md
echo '| -----| -----|' >> README.md
for post in $posts
do
  file_name=${post##*/}
  name_with_ext=${file_name#*-}
  name=${name_with_ext%%.*}
  year_and_name=${post#*/}
  year=${year_and_name%/*}
  year=${year%/*} # remove 2020/1203-design-patterns -> 2020
  echo "|[${name}](${post})| ${year}|" >> README.md
done
```

- Chúng ta có thể thực thi 1 câu lệnh trong bash script khi để chúng trong 2 dấu backtick '`'
- Dòng đâu tiên liệt kê tất cả các file trong folder `posts` và lấy ra tất cả các file có đuôi `.md`. Tất cả các bài viết của mình để trong file `.md` sau đó sắp xếp lại chúng với `sort -nr` - mình muốn bài viết mới nhất lên đầu
- `sed -i ""  '15,$d'  README.md` Mình sẽ xoá từ line số 15 tới cuối file `README.md`. Lý do mục lục mình sẽ thêm từ line 15 trở đi. Dĩ nhiên nếu sau file này thay đổi thì cần phải check lại :). Trên [macos](https://www.markhneedham.com/blog/2011/01/14/sed-sed-1-invalid-command-code-r-on-mac-os-x/) phải thêm đoạn `""` hơi lạ.

- `echo '| Post | Year |' >> README.md` và `echo '| -----| -----|' >> README.md` ghi vào file README.md với phần đầu của định dạng table trong markdown. `>>` là append ghi tiếp vào file đã có nội dung.

- `for post in $posts` đoạn loop qua các bài viết

- `file_name=${post##*/}` lấy ra tên của các file. Ví dụ dạng: `2607-bash-script-auto-generate-index.md`

- `name_with_ext=${file_name#*-}`: xoá bỏ phần ngày và tháng ở đầu: `bash-script-auto-generate-index.md`

- `name=${name_with_ext%%.*}` xoá bỏ phần extention: `bash-script-auto-generate-index`

- `year_and_name=${post#*/}` từ đường link bài post lấy ra year và name. Post có giá trị ntn: `posts/2022/2607-bash-script-auto-generate-index.md` và `year_and_name` có giá trị ntn:`2022/2607-bash-script-auto-generate-index.md`

- `year=${year_and_name%/*}` remove bỏ phần tên file để lấy year: `2020`

- `year=${year%/*}` # remove 2020/1203-design-patterns -> 2020: comment đầy đủ rồi nên ko nói :D

- `echo "|[${name}](${post})| ${year}|" >> README.md` tạo ra các records cho table trong index thôi.

## Finished

- Done vậy là giờ mỗi lần có bài viết chỉ cần `$bash generate-index.sh` là có thể check bài viết từ file README rồi mà ko cần phải đi tìm trong từng thư mục @@.

### HAPPY WRITING SCRIPT :D
