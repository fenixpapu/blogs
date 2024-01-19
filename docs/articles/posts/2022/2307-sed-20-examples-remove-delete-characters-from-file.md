# [sed remove / delete characters from file](https://www.theunixschool.com/2014/08/sed-examples-remove-delete-chars-from-line-file.html)

- Vì dòng mô tả sau đây mà mình quyết định dịch bài này. Cú pháp của `sed` sẽ như thế này:

```linenums="1"
$ sed 's/find/replace/' file
```

- Dễ hiểu vãi nồi :D :`sed` sẽ tìm (find) pattern và thay thế ( replace) với một pattern khác.

- Giả sử chúng ta có 1 file ntn:

```linenums="1"
$ cat file
Linux
Solaris
Ubuntu
Fedora
RedHat
```

1. Remove 1 ký tự đặc biệt. Ví dụ kí tự 'a'

```linenums="1"
$ sed 's/a//' file
Linux
Solris
Ubuntu
Fedor
RedHt
```

- Đoạn trên sẽ xoá ký tự `a` đầu tiên gặp phẩi. Để xoá tất cả các ký tự `a` chúng ta có thể dùng: `$ sed 's/a//g' file`

2. Xoá ký tự đầu tiên của các dòng

```linenums="1"
$ sed 's/^.//' file
inux
olaris
buntu
edora
edHat
```

3. Xoá ký tự cuối cùng của mỗi dòng

```linenums="1"
$ sed 's/.$//' file
Linu
Solari
Ubunt
Fedor
RedHa
```

4. Xoá ký tự đầu tiên và cuối cùng của mỗi dòng trong một command

```linenums="1"
$ sed 's/.//;s/.$//' file
inu
olari
bunt
edor
edHa
```

- Hai câu lệnh có thể thực hiện một lượt với dấu `;` ở giữa.

5. Xoá ký tự đầu tiên nếu nó là một ký tự nhất định

```linenums="1"
$ sed 's/^F//' file
Linux
Solaris
Ubuntu
edora
RedHat
```

6. Tương tự như vậy xoá ký tự cuối cùng của dòng nếu nó là một ký tự nhất định

```linenums="1"
$ sed 's/x$//' file
Linu
Solaris
Ubuntu
Fedora
RedHat
```

7. Xoá 3 ký tự đầu tiên của mỗi dòng

```linenums="1"
$ sed 's/...//' file
ux
aris
ntu
ora
Hat
```

8. Xoá n ký tự đầu tiên của mỗi dòng

```linenums="1"
$ sed -r 's/.{4}//' file
x
ris
tu
ra
at
```

9. Tương tự như vậy xoá n ký tự cuối cùng của mỗi dòng

```linenums="1"
$ sed -r 's/.{3}$//' file
Li
Sola
Ubu
Fed
Red
```

10. Xoá mọi thứ trừ n ký tự đầu tiên của mỗi dòng

```linenums="1"
$ sed -r 's/(.{3}).*/\1/' file
Lin
Sol
Ubu
Fed
Red
```

- `\1` giữ lại group phần còn lại bị bỏ đi

11. Xoá mọi thứ trừ n ký tự cuối của file

```linenums="1"
$ sed -r 's/.*(.{3})/\1/' file
nux
ris
ntu
ora
Hat
```

12. Xoá nhiều ký tự trong file

```linenums="1"
$ sed 's/[aoe]//g' file
Linux
Slris
Ubuntu
Fdr
RdHt
```

13. Xoá 1 pattern

```linenums="1"
$ sed 's/lari//g' file
Linux
Sos
Ubuntu
Fedora
RedHat
```

- Ko chỉ các ký tự mà cả pattern cũng bị remove. Ở đây chúng ta có `lari` đã làm xoá cả `Solaris`

14. Chỉ xoá match thứ n

```linenums="1"
$ sed 's/u//2' file
Linux
Solaris
Ubunt
Fedora
RedHat
```

15. Xoá mọi thứ trong dòng theo sau bởi ký tự nhất định

```linenums="1"
$ sed 's/a.*//' file
Linux
Sol
Ubuntu
Fedor
RedH
```

16. Xoá tất cả các số có trong dòng:

```linenums="1"
$ sed 's/[0-9]//g' file
```

17. Xoá tất cả các chữ viết thường

```linenums="1"
$ sed 's/[a-z]//g' file
L
S
U
F
RH
```

18. Xoá tất cả trừ chữ viết thường

```linenums="1"
$ sed 's/[^a-z]//g' file
inux
olaris
buntu
edora
edat
```

19. Xoá tất cả chữ và số trong dòng ( ví dụ trừ các ký tự đặc biệt)

```linenums="1"
$ sed 's/[a-zA-Z0-9]//g' file
```

20. Xoá ký tự ko phân biệt hoa thường ( tưởng thế nào :D )

```linenums="1"
$ sed 's/[uU]//g' file
Linx
Solaris
bnt
Fedora
RedHat
```

- HAPPY BASH SCRIPT kk!
