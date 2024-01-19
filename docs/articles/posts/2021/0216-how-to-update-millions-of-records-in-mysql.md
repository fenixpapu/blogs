---
authors:
  - PaPu
categories:
  - devops
  - dev
  - database
date: 2021-02-16
draft: false
---

# [How to update millions of records in MySQL](https://www.startdataengineering.com/post/update-mysql-in-batch/)

## Introduction

- Khi update một lượng lớn bản ghi trong một `OLTP` database, như là MySQL, bạn sẽ phải chú ý về việc khóa các bản ghi. Nếu những bản ghi này bị khóa, chúng sẽ không thể chỉnh sửa (cập nhật hoặc xóa), bởi các giao dịch khác trên db của bạn. Một cách tiếp cận thông dụng được sử dụng khi cập nhật một lượng lớn bản ghi là chạy nhiều update nhỏ trong các `batch`. Với cách này, chỉ có các bản ghi đang được cập nhật mới bị khóa.
- Nếu bạn đang tự hỏi :

```terminal linenums="1"
  Làm sao cập nhật hàng triệu các bản ghi mà không ảnh hưởng đáng kể tới trải nghiệm người dùng ?
```

```terminal linenums="1"
  Làm thế nào lệnh cập nhật lại khóa các bản ghi lại ?
```

- Bài viết này dành cho bạn, lưu ý rằng đây không phải là cách duy nhất. Có những cách tiếp cận khác như là `swapping tables`, chạy các cập nhật tiêu chuẩn tùy thuộc vào mức độ cô lập các `transaction` của bạn, etc.. Sử dụng cách tiếp cận nào thì tùy thuộc vào từng trường hợp cụ thể của bạn. Với case của chúng ta, giả sử rằng chúng ta update table `user`, mà nếu nó bị khóa trong khoảng thời gian lớn hơn `10s` có thể tác động đáng kể đến trải nghiệm người dùng và là không lý tưởng.
-
