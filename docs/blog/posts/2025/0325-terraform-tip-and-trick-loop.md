---
authors:
  - PaPu
categories:
  - devops
  - terraform
date: 2025-03-25
draft: false
---

# Terraform loop and conditional with count, for_each and for

- [Source](https://www.youtube.com/watch?v=7S94oUTy2z4) từ Anton Putra :D
- Bài này với mục đích để code terraform tốt hơn cũng như đọc code terraform dễ hơn :D
<!-- more -->

## Terraform build in functions cho loop, conditional với:

- count
- for_each
- for expressions

## Loops

### Count parameters

- `count` cho phép chúng ta tạo nhiều resource ( dùng trong resource hoặc module) một cách tự động mà không cần lặp lại code nhiều lần.

- Ví dụ dưới tự động tạo 4 ec2 instance server, với 1 khai báo:

```terraform linenums="1"
resource "aws_instance" "server" {
  count         = 4
  ami           = "ami-abcdhehe"
  instance_type = "t2.micro"
}
```

- Nhưng sẽ thế nào nếu muốn tạo 3 subnet tự động:

```terraform linenums="1"
resource "aws_subnet" "private" {
  vpc_id = aws_vpc.main.id

  cidr_block        = "10.0.0.0/19"
  availability_zone = "us-east-1a"
}
```

- Đoạn trên sẽ bị lỗi do 3 subnet asign cùng 1 `cidr_block`, chúng ta có thể dùng list(string) trong `subnet_cidr_blocks` như dưới để giải quyết:

```terraform linenums="1"
resource "aws_subnet" "private" {
  count  = length(vars.subnet_cidr_blocks)
  vpc_id = aws_vpc.main.id

  cidr_block        = vars.subnet_cidr_blocks[count.index]
  availability_zone = "us-east-1a"
}


variable "subnet_cidr_blocks" {
  description = "CIDR blocks for the subnets."
  type        = list(string)
  default     = ["10.0.0.0/19", "10.0.32.0/19", "10.0.64.0/19"]
}

output "subnet_at_index_1" {
  value = var.subnet_cidr_blocks[1]
}
output "first_id" {
  value       = aws_subnet.private[0].id
  description = "The ID for the first subnet"
}
output "all_ids" {
  value       = aws_subnet.private[*].id
  description = "The IDs for all subnets"
}
```

- Giới hạn: `count` sẽ loop toàn bộ block code (resource hoặc module), trong khi như ví dụ dưới ta sẽ chỉ muốn loop qua 1 phần là `ingress` thôi (để tạo nhiều rule của SG):

```terraform linenums="1"
resource "aws_security_group" "web" {
  name   = "allow-web-access"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

- Đừng nhét `count` vào trong block `ingress` nhé - ko support đâu :D
- Sẽ ra sao nếu chúng ta xoá 1 phần tử trong list, ví dụ ở đây xoá subnet range thứ 2: `default     = ["10.0.0.0/19", "10.0.32.0/19", "10.0.64.0/19"]` (xoá "10.0.32.0/19") hệ quả terraform sẽ xoá phần tử này và các phần tử sau nó (rồi tạo lại các phần tử sau nó) hoặc có thể không xoá được nếu có resoruce khác đang attach vào ( ví dụ ec2 đang chạy trong subnet đó).
- Để khắc phục điều này chúng ta có `for_each` sau đây.

### for_each expressions (lists, sets, and maps)

- `for_each` cho phép tạo nhiều resources một cách tự động từ `map` hoặc `set` (khác với count).
  - Multiple instances của một `entire resource`
  - Multiple instances của một `inline block`
  - Multiple instances của một `module`
- Ví dụ `for_each` với Map:

```terraform linenums="1"
resource "aws_instance" "example" {
  for_each = {
    web  = "t2.micro"
    app  = "t3.small"
    db   = "t3.medium"
  }

  ami           = "ami-12345678"
  instance_type = each.value
  tags = {
    Name = each.key
  }
}
```

- Hoặc `for_each` với Set:

```terraform linenums="1"
resource "aws_s3_bucket" "example" {
  for_each = toset(["bucket-one", "bucket-two", "bucket-three"])

  bucket = each.key
  acl    = "private"
}
```

- Ví dụ `for_each`

```terraform linenums="1"
variable "subnet_cidr_blocks" {
  description = "CIDR blocks for the subnets"
  type        = list(string)
  default     = ["10.0.0.0/19", "10.0.32.0/19", "10.0.64.0/19"]
}

resource "aws_subnet" "example" {
  for_each = toset(var.subnet_cidr_blocks) # foreach support sets and maps only

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-1a"
}

output "all_subnets" {
  value = aws_subnet.example
}
output "all_ids" {
  value = values(aws_subnet.example)[*].id
}
```

- Giờ chúng ta có maps thay vì list điều này cho phép chúng ta xoá các phần tử (items) ở giữa một cách an toàn.
- Vì lý do này mà `for_each` thường được khuyến nghị hơn `count` khi dùng khởi tạo resource.

- Example `for_each`:

```terraform linenums="1"
variable "custom_ports" {
  description = "Custom ports to open on the security group."
  type        = map(any)

  default = {
    80   = ["0.0.0.0/0"]
    8080 = ["10.0.0.0/16"]
  }
}
resource "aws_security_group" "web" {
  name   = "allow-web-access"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.custom_ports

    content {
      from_port   = ingress.key
      to_port     = ingress.key
      protocol    = "tcp"
      cidr_blocks = ingress.value
    }
  }
}

```

- Một ví dụ khác `for_each`

```terraform linenums="1"
locals {
  web_servers = {
    nginx-0 = {
      instance_type = "e2-micro"
      availability_zone = "us-east1-a"
    }
    nginx-1 = {
      instance_type = "e2-micro"
      availability_zone = "us-east1-b"
    }
  }
}

resource "aws_instance" "web" {
  for_each = local.web_servers

  ami  = "ami-1234567890"
  instance_type = each.value.instance_type
  availability_zone = each.value.availability_zone

  tags = {
    Name = each.key
  }
}
```

### for expressions

- `for` dùng chuyển đổi `lists` và `maps` thành lists và maps mới.
- Ví dụ:

```terraform linenums="1"
[for item in var.list: item * 2]

# or
{for key, value in var.map: key => value * 2}
```

- Một ví dụ khác:

```terraform linenums="1"
variable "vpcs" {
  description = "A list of VPCs."
  default     = ["main", "database"]
}

output "new_vps" {
  value = [for vpc in var.vpcs : title(vpc)]
}

output "new_v2_vpc" {
  value = [for vpc in var.vpcs : title(vpc) if length(vpc) < 5]
}
```

- Cũng có thể dùng `for` để loop qua 1 maps:

```terraform linenums="1"
variable "my_vpcs" {
  default = {
    main = "main vpc"
    database = "vpc for database"
  }
}

output "my_vpcs" {
  value = [for name, desc in var.my_vpcs : "${name} is the ${desc}"]
}

output "my_vpcs_v2" {
  value = {for name, desc in var.my_vpcs : title(name) => title(desc)}
}

output "vpcs" {
  value = "%${for vpc in var.vpcs}${vpc}, %${endfor}" # ${vpc} là body, hai cái % là bắt đầu và kết thúc
}

output "vpcs_index" {
  value = "%{for i, vpc in var.vpcs}(${i}) ${vpc}, %${endfor}
}
```

### for string directive

- `for` bên trong string template (<<-EOF .... EOF>>) được sử dụng loop qua `lists/maps` để tạo text động
- Ví dụ:

```terraform linenums="1"
%{ for item  in var.list }
some text with ${item}
%{ endfor}
```

## Conditional

- Count trong ví dụ dưới như `if` statement:

```terraform linenums="1"
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main"
  }
}

variable "enable_database_vpc" {
  default = true
}

resource "aws_vpc" "database" {
  count = var.enable_database_vpc ? 1 : 0  # nếu enable_database_vpc là true database vpc sẽ được tạo ngược lại thì ko

  cidr_block = "10.1.0.0/16"

  tags = {
    Name = "database"
  }
}
```

- `if-else` condition:

```terraform linenums="1"
resource "aws_subnet" "public" {
  count = var.enable_public ? 1 : 0

  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.0.0/19"
}

resource "aws_subnet" "private" {
  count = var.enable_public ? 0 : 1
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.0.0/19"
}

output "subnet_id" {
  value = {
    var.enable_public
    ? aws_subnet.public[0].id
    : aws_subnet.private[0].id
  }
}
output "subnet_id_v2" {
  value = one(concat(
    aws_subnet.public[*].id,
    aws_subnet.private[*].id
    ))
}
```
