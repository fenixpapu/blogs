# [Creational Design Patterns](https://refactoring.guru/design-patterns/creational-patterns)

- Creational patterns cung cấp cơ chế tạo đối tượng khác nhau, làm tăng tính uyển chuyển và tái sử dụng code đã tồn tại.

- `Factory Method`: Cung cấp giao diện cho việc tạo đối tượng trong một lớp cha (super class), nhưng cho phép lớp con (subclass) thay đổi kiểu của đối tượng sẽ được tạo ra.
- `Abstract Factory`: Cho phép tạo ra các đối tượng liên quan mà không cần chỉ định các lớp cụ thể của chúng.
- `Builder`: Cho phép bạn xây dựng các đối tượng phức tạp từng bước một. Các mẫu cho phép bạn tạo ra các kiểu khác nhau và đại diện của một đối tượng sử dụng cùng một mã khởi tạo ( constructor code).
- `Prototype`: Cho phép bạn copy một đối tượng đã tồn tại mà không làm code của bạn bị phụ thuộc vào lớp của chúng.
- `Singleton`: Cho phép bạn đảm bảo rằng lớp này chỉ có một thể hiện ( instance = object) trong khi cung cấp khả năng truy cập global tới instance này.
