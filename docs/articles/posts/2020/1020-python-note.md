# Một số note khi tìm hiểu về python

## casefold() vs lower()

- Cùng là method của `String` để lowercase một string. Casefold có vẻ mạnh hơn vì nó loại bỏ tất cả phân biệt hoa thường trong một chuỗi. Nếu chỉ làm việc với tiếng Anh thì 2 method này tương tự nhau. Ví dụ khác nhau trong tiếng Đức.

```python linenums="1"
S = `Das straße`
x = S.casefold() # das strasse
y = S.lower() # das straße
```

## Python collections (Arrays)

- Có 4 kiểu dữ liệu dạng collection trong ngôn ngữ Python:
  - **List** là một collection có thứ tự và có thể thay đổi. Cho phép trùng lặp.
  - **Tuple** là một collection có thứ tự và không thể thay đổi. Cho phép trùng lặp.
  - **Set** là một collection không có thứ tự và không đánh chỉ mục (index). Không trùng lặp.
  - **Dictionary** là collection không có thứ tự, có thể thay đổi, và có chỉ mục. Không trùng lặp.

## Parameters or Arguments

- Parameter là biến được liệt kê trong dấu ngoặc khi function được định nghĩa.
- Argument là giá trị truyền vào một function khi nó được gọi.

## Python Lambda

- Lamba function là một function vô danh nhỏ
- Có thể nhận vào số thâm số (parameter) tùy thích nhưng chỉ có thể có một biểu thức.
- Thằng này có một cách dùng khá giống `closure` của javascript.

## Class - Method

- Từ khóa `self` được tham chiếu tới đối tượng hiện tại của một class ( tức object), và được sử dụng để truy vấn các biến thuộc về đối tượng này.

- `Self` không nhất thiết phải tên `self`, chúng ta có thể đặt tên bất kỳ, nhưng nó phải là tham số đầu tiên của bất kỳ function nào trong class.
