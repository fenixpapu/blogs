# [Criticism of patterns](https://refactoring.guru/design-patterns/criticism)

- Có vẻ như chỉ người lười mới không chỉ trích các mẫu thiết kế. Cùng xem qua một số lập luận tiêu biểu nhất chống lại `patterns`.

## Kludges cho một ngôn ngữ lập trình yếu

- Thông thường sự cần thiết các mẫu thiết kế phát sinh khi mọi người chọn một ngôn ngữ hoặc một công nghệ bị thiếu sự trừu tượng. Trong trường hợp này, các mẫu trở thành vô cùng khó khăn mang lại cho ngôn ngữ những khả năng đặc biệt cần thiết.

- Ví dụ, một `Strategy` pattern có thể được thực hiện với một simple anonymous function(lambda) trong hầu hết các ngôn ngữ hiện đại.

## Giải pháp không hiệu quả.

- Pattern đang cố gắng hệ thống hóa cách tiếp cận, những thứ đã được sử dụng rộng rãi. Sự thống nhất này được coi là một giáo điều, và họ thực hiện các patterns `tới nơi tới chốn`, mà không hề điều chỉnh cho phù hợp với bối cảnh của dự án thực tế.

## Sử dụng không hợp lý

```
  Nếu tất cả những gì bạn có là một cây búa, mọi thứ đều trông giống như một cái đinh.
```

- Đây là vấn đề ám ảnh người mới, những người vừa mới làm quen với `patterns`, phải học về các patterns, họ cố gắng áp dụng chúng mọi nơi, ngay cả khi các đoạn code đơn giản hoạt động tốt.
