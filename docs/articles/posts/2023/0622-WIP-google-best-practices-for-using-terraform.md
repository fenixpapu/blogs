---
authors:
  - PaPu
categories:
  - devops
date: 2023-06-22
draft: true
---

# [WIP] Best practices for using Terraform

- From [google](https://cloud.google.com/docs/terraform/best-practices-for-terraform)

- Bài này dành cho những ai đã dùng qua terraform(không phải những ai bắt đầu tìm hiểu)

## General style and structure guidelines

- Những khuyến nghị sau đây bao gồm các style và structure cơ bản cho cấu hình Terraform của bạn. Các khuyến nghị hướng tới việc tái sử dụng module Terraform và cấu hình root.

### Follow a standard module structure

- Modules phải theo [cấu trúc module chuẩn](https://www.terraform.io/docs/modules/create.html) của Terraform.

- Bắt đầu mỗi module với `main.tf`, mặc định là nơi chứa các resource.

- Trong mỗi module, có một file `README.md` chứa các tài liệu cơ bản về module.

- Các ví dụ được đặt trong thư mục `examples/`. Các ví dụ được tách riêng trong các thư mục con và `README.md` cụ thể của từng ví dụ.

- Nhóm các resource theo group logic với tên dễ hình dung, như `network.tf`, `instance.tf` hay `loadbalaner.tf`

  - Tránh tạo nhiều resource riêng lẻ, gom các resource với cùng một mục đích. Ví dụ, kết hợp: `google_dns_managed_zone` và `google_dns_record_set` vào `dns.tf`

- Trong thư mục gốc của module, chỉ bao gồm `*.tf` file và metadata của repo ( như `README.md` hay `CHANGELOG.md`)

- Đặt tất cả các documents còn lại trong `docs/`.

### Adopt a naming convention

- Đặt tên tất cả các object cấu hình dùng underscores `_` để phân cách các từ. Cách này đảm bảo tính nhất quán với quy ước đặt tên của resource, data resource, và các giá trị định nghĩa sẵn. Quy ước này không áp dụng cho đặt tên [biến](https://developer.hashicorp.com/terraform/docs/glossary#argument)

  - Recommended:

```linenums="1"
resource "google_compute_instance" "web_server" {
  name = "web-server"
}
```

- Not recommended:

```linenums="1"
resource "google_compute_instance" "web-server" {
  name = "web-server"
}
```

- Để đơn giản hóa việc tham chiếu resource, chỉ có một loại duy nhất ( ví dụ, một load balancer cho toàn bộ module), đặt tên resource `main`

  - Sẽ mất thời gian hơn để nhớ `some_google_resource.my_special_resource.id` so với `some_google_resource.main.id`

- Để phân biệt giữa các resource của cùng một loại (ví dụ `primary` và `secondary` ), đặt tên resource có ý nghĩa.

- Đặt tên resource duy nhất.

- Trong tên của resource, đừng lặp lại resource type:

  - Recommended:

```linenums="1"
resource "google_compute_global_address" "main" { ... }
```

- Not recommended:

```linenums="1"
resource "google_compute_global_address" "main_global_address" { … }
```

### Use variables carefully

- Khai báo tất cả các biến trong `variables.tf`

- Đặt tên biến mô tả cách sử dụng hoặc mục đích của chúng:

  - Input, biến cục bộ, và output đại diện cho các số - như kích cỡ ổ cứng hoặc RAM - phải đặt tên với các đơn vị ( như ram_size_gb).

  - Với các đơn vị lưu trữ, sử dụng tiền tố đơn vị nhị phân (powers by 1024) - `kibi`, `mebi`, `gibi`. Tát cả các đơn vị khác, sử dụng đơn vị tiền tố hệ thập phân ( powers by 1000) - `kilo`, `mega`, `giaga`.

  - Để đơn giản các điều kiện logic, đặt tên các biến boolean variables like: `enable_external_access`

- Các biến phải có mô tả. Các mô tả được tự động tạo khi module được publish. Mô tả thêm ngữ cảnh bố sung mà tên mô tả không thể cung cấp.

- Biến được định nghĩa kiểu.

- Cung cấp giá trị mặc định khi có thể:

  - Các biến ko phụ thuộc theo môi trường ( dev, qa, prod), cung cấp giá trị mặc định.
  - Với các biến phụ thuộc theo môi trường ( như `project_id`), ko cung cấp giá trị mặc định.

- Dùng empty string cho giá trị mặc định chỉ khi biến để rỗng là hợp lệ.

- Thận trọng trong việc sử dụng các biến. Chỉ dùng khi giá trị thay đổi theo từng instance hoặc environment. Khi bạn quyết định expose biến ra ngoài, đảm bảo chắc chắn có sử dụng đến. Nếu chỉ có một khả năng nhỏ dùng đến, đừng expose.

  - Thêm biến với giá trị mặc định là tương thích ngược.

  - Loại bỏ một biến là không tương thích ngược.

  - Trong trường hợp một giá trị được sử dụng ở nhiều nơi, có thể sử dụng giá trị cục bộ thay vì expose một biến ra ngoài.

### Expose outputs

- Tổ chức tất cả outputs vào một file `output.tf`

- Cung cấp các mô tả có ý nghĩa cho tất cả outputs.

- Viết tài liệu mô tả cho output trong `README.md`. Tự động tạo mô tả khi commit với tools như [terraform-docs](https://github.com/terraform-docs/terraform-docs)

- Output tất cả các giá trị hữu dụng mà modules root cần tham chiếu hoặc chia sẻ. Đặc biệt với open source hoặc các modules được sử dụng nhiều, expose tất cả các output có khả năng dùng nhiều.

- Không truyền các outputs trực tiếp qua các biến input, làm vậy ngăn cả việc thêm chúng một cách đúng đắn vào biểu đồ phụ thuộc. Đảm bảo rằng [implicit dependencies](https://developer.hashicorp.com/terraform/tutorials/configuration-language/dependencies) được tạo và chắc chắn output tham chiếu đến các thuộc tính từ resource. Thay vì tham chiếu tới biến input.

  - Recommended:

```linenums="1"
output "name" {
  description = "Name of instance"
  value       = google_compute_instance.main.name
}
```

- Not recommended:

```linenums="1"
output "name" {
  description = "Name of instance"
  value       = var.name
}
```

### Use data sources

- Để [datasource](https://developer.hashicorp.com/terraform/language/data-sources) cạnh các resource tham chiếu tới chúng. Ví dụ bạn tải về một `image` để sử dụng chạy một instance, để `datasource` cạnh instance thay về tập trung datasource trong file của chúng.

- Nếu số lượng datasource trở nên lớn, xem xét việc move vào chung 1 file `data.tf`

- Để tải các dữ liệu liên quan env hiện tại, sử dụng biến hoặc các resource [interpolation](https://developer.hashicorp.com/terraform/language/expressions/strings#interpolation)

### Limit the use of custom scripts

- Chỉ sử dụng script khi cần thiết. State của resource được tạo qua script không được tính hoặc quản lý bởi Terraform:

  - Tránh script tùy chỉnh nếu có thể. Chỉ sử dụng khi Terraform không hỗ trợ.

  - Bất kỳ script tùy biến nào được sử dụng phải có tài liệu rõ ràng lý do tồn tại và kế hoạch cho việc loại bỏ script.

- Terraform có thể gọi scripts tùy chỉnh qua provisiones, bao gồm cả local-excec provisioner.

- Để scripts tùy chỉnh được gọi bởi Terraform trong thư mục `scripts/`

### Include helper scripts in a separate directory

- Để các script trợ giúp ( helper script) không được gọi bởi Terraform trong thư mục `helpers/`.

- Tài liệu các scripts trợ giúp trong `README.md` với giải thích và ví dụ.

- Trong scripts trợ giúp chấp nhận biến, cung cấp biến `--help`

### Put static files in a separate directory

- File tĩnh, Terraform tham chiếu nhưng không thực thi(execute) ví dụ như file script load vào instances phải được để trong thư mục `files/`

- Place lengthy HereDocs in external files, separate from their HCL. Reference them with the [file() function](https://developer.hashicorp.com/terraform/language/functions/file).

- Với những file được đọc vào bởi Terraform từ function `templatefile`, sử dụng extension `.tftpl`.
  - Templates phải được để trong thư mục `templates`

### Protect stateful resources

- Với những stateful resource như database, đảm bảo enable [deletion protection](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle). Ví dụ:

```linenums="1"
resource "google_sql_database_instance" "main" {
  name = "primary-instance"
  settings {
    tier = "D0"
  }

  lifecycle {
    prevent_destroy = true
  }
}
```

### Use built-in formatting

- Tất cả files Terraform phải tuân thủ chuẩn của `terraform fmt`

### Limit the complexity of expressions

- Hạn chế sử dụng biểu thức phức tạp. Nếu nhiều functions cần trong một biểu thức, xem xét tách ra nhiều biểu thức bằng [local values](https://developer.hashicorp.com/terraform/language/values/locals)

- Không bao giờ có hơn 1 toán tử ba ngôi (ternary operation) trong một dòng. Thay vì thế, sử dụng nhiều local values để tăng tính logic.

### Use `count` for conditional values

- Để khởi tạo một resource có điều kiện, sử dụng [count](https://developer.hashicorp.com/terraform/language/meta-arguments/count) meta-argument. Ví dụ:

```linenums="1"
variable "readers" {
  description = "..."
  type        = list
  default     = []
}

resource "resource_type" "reference_name" {
  // Do not create this resource if the list of readers is empty.
  count = length(var.readers) == 0 ? 0 : 1
  ...
}
```

- Tiết kiệm khi sử dụng biến người dùng chỉ định để đặt các `count` cho resource. Nếu thuộc tính của resource được cung cấp như một biến ( ví dụ `project_id`) và resource không còn tồn tại. Terraform không thể tạo ra `plan`. Thay vì thế Terraform báo cáo một lỗi: [value of count cannot be computed](https://github.com/hashicorp/terraform/issues/17421). Trong những trường hợp như vậy, sử dụng một biến riêng biệt `enable_x` để tính toán điều kiện.

### Use `for_each` for iterated resources

- Nếu muốn tạo nhiều bản copy của một resource dựa trên một resource đầu vào, sử dụng [for_each](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each) meta-argument.

### Publish modules to a registry

- Reuseable modules: Publish module tái sử dụng lên [module registry](https://developer.hashicorp.com/terraform/internals/module-registry-protocol)

- Open source modules: Publish open source modules lên [Terraform Registry](https://registry.terraform.io/)

- Private modules: Public private modules lên một [private registry](https://developer.hashicorp.com/terraform/cloud-docs/registry)

## Reusable modules

- Với modules nó có nghĩa tái sử dụng, sử dụng các hướng dẫn dưới đây bên cạnh các hướng dẫn trước đó.

### Activate required APIs in modules
