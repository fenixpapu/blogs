# Terraform basic create aws lambda trigger by eventbridge schedule

- Có nhiều cách để tạo lambda thậm chí mình nghĩ nên dùng serverless của aws ngon hơn :v
- Tuy nhiên đang cần thực hành terraform (terraform cũng có cái lợi riêng) nên mình tạo lambda theo terraform.
- Tương tự như cách tạo lambda thì cách trigger lambda có có `n` cách. Trong bài này mình sẽ tạo một module khởi tạo lambda được trigger bởi eventbridge schedule. Tức lambda này sẽ chạy theo lập lịch ( như dưới đây sẽ là 1h chạy 1 lần).
- Đặc biệt nếu trigger bởi eventbridge schedule thì khi vào lambda trên aws phần trigger nó sẽ trống trơn (tưởng lambda này đang ko được chạy) nhưng check log cloudwatch ( nếu có quyền ghi log) thì vẫn có nhé.

## Module lambda_eventbridge_schedule
- Module sẽ bao gồm 2 file: `main.tf` và `variables.tf`. Chúng ta sẽ đi từng phần như dưới

- File `main.tf` nhìn sẽ ntn:

```
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "lambda_function_payload.zip"
}




resource "aws_lambda_function" "this" {
  filename      = "lambda_function_payload.zip"
  function_name = var.function_name
  role          = aws_iam_role.this.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = var.timeout
  tags          = var.tags

  source_code_hash = data.archive_file.lambda.output_base64sha256
  environment {
    variables = var.lambda_envs
  }


  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
}

resource "aws_iam_role" "this" {
  name = "${var.function_name}-role"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]

}


resource "aws_scheduler_schedule" "this" {
  name       = "${var.function_name}-schedule"
  group_name = "default"


  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = var.schedule_expression

  target {
    arn      = aws_lambda_function.this.arn
    role_arn = aws_iam_role.event_schedule_role.arn
  }
}


resource "aws_iam_role" "event_schedule_role" {
  name = "${var.function_name}-eventbridge-role"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {
    name = "${var.function_name}-eventbridge-policy"

    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : [
            "lambda:InvokeFunction"
          ],
          "Resource" : [
            "arn:aws:lambda:us-east-1:<aws_account_id>:function:${var.function_name}:*",
            "arn:aws:lambda:us-east-1:<aws_account_id>:function:${var.function_name}"
          ]
        }
      ]
    })
  }

}

```

- `data "archive_file" "lambda"`: Phần này khai báo cho source code lambda. Chúng ta sẽ cần nhập giá trị cho `source_dir`. Khi terraform chạy sẽ nén các file trong đường link `source_dir` thành output: `lambda_function_payload.zip` như đang khai báo. File này sau đó được upload thành source code của lambda. Ngoài `source_dir` chúng ta còn có thể dùng `source_file` chi tiết search thêm doc terraform nhé.

- `resource "aws_lambda_function" "this"`. Đoạn này khai báo khởi tạo 1 lambda nhé.
  - `filename`: chính là tên file zip trong đoạn trên
  - `function_name`: là tên function thôi, nên có ý nghĩa 1 chút như từ dự án nào, môi trường nào(qa, prod) và service nào (backend, fe)...
  - `role`: để lambda có thể ghi log ra cloudwatch, hoặc connect tới db thuộc một VPC cụ thể chúng ta cần khai báo các quyền vào role rồi gắn vào lambda.
  - `handler`: Source code đang expose hanlder qua file, function nào thì cần điền đúng nhé. Trong ví dụ trên thì mình đang để trong file `index.js` và expose function handler.
  - `runtime`: ở đây dev team đang dùng nodejs và mình khai báo `nodejs18.x`
  - `timeout`: đây là thời gian tối đa lambda có thể tồn tại đừng set bé quá nếu ko lambda chưa chạy xong job đã bị dừng ngang. Chi phí lambda cũng ko phụ thuộc thông số này ( phụ thuộc cấu hình resource và thời gian chạy thực tế), nên kinh nghiệm là cứ set cao lên `15m` gì đó.

  - `tags`: đơn giản chỉ là các tag cho lambda này thôi. Nó có thể hữu ích khi cần theo dõi billing..
  - `source_code_hash`: cái source_code_hash này sẽ giúp terraform biết được khi có code mới nhé ví dụ thêm 1 dòng console.log thôi chẳng hạn nó sẽ vẫn deploy version code mới. ( nếu ko nó sẽ tính uptodate và ko deploy gì đâu)

  - `vpc_config`: trong trường hợp bạn cần connect vào db trong 1 vpc thì cần cấu hình lambda cũng thuộc vpc đó ( hoặc vpc có route tới db). Mặc định nếu rỗng thì lambda sẽ ko thuộc vpc nào. Ngay cả khi lambda cấu hình vpc thì nó cũng cần có quyền tạo network interface thì mới join được vào vpc. Phần iam role phía dưới sẽ cover việc này.
  
  - `environment`: Lambda chạy sẽ cần 1 số thứ ví dụ như user/pass nhập vào như một biến môi trường -> sẽ được insert ở đây.

- `resource "aws_iam_role" "this"`: Khởi tạo các quyền cho một lambda:
  - `managed_policy_arns`: với role `arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole` sẽ giúp lambda có quyền tạo log trên cloudwatch và khởi tạo network interface để join 1 vpc.

- `resource "aws_scheduler_schedule" "this"`: Khởi tạo schedule
  - `flexible_time_window`: cần phải set thì mới khởi tạo được, chi tiết chắc đọc doc quá.
  - `schedule_expression`: phần định nghĩa lambda sẽ được trigger như nào( theo ngày, theo giờ, theo phút...)
  - `target`: phần này định nghĩa lambda nào sẽ được trigger, vào role nào được apply cho schedule.
- `resource "aws_iam_role" "event_schedule_role"`: Role cho schedule. Nếu schedule trigger lambda L1 thì role cần có quyền `invokeFunction`: với `L1` và `L1:*`

- File `variables.tf` sẽ như dưới, nó khá đơn giản nên mình sẽ ko giải thích gì thêm:

```
variable "timeout" {
  description = "(Optional) Amount of time your Lambda Function has to run in seconds."
  type        = number
  default     = 900 # 15 minutes
}

variable "tags" {
  description = "Tags for specific env"
  type        = map(any)
}

variable "source_dir" {
  description = "(String) Package entire contents of this directory into the archive. One and only one of source, source_content_filename (with source_content), source_file, or source_dir must be specified."
  type        = string
}

variable "function_name" {
  description = "(Required) Unique name for your Lambda Function."
  type        = string
}

variable "schedule_expression" {
  description = "(Required) Defines when the schedule runs"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs associated with the Lambda function"
  type        = list(any)
  default     = []
}

variable "security_group_ids" {
  description = "List of security group IDs associated with the Lambda function."
  type        = list(any)
  default     = []
}

variable "lambda_envs" {
  description = "Map of environment variables that are accessible from the function code during execution. If provided at least one key must be present."
  type        = map(any)
  default     = {}
}

```

## Cách dùng.

- Khi tạo resource từ module ở trên chúng ta sẽ cần 1 file terraform nội dung tương tự như dưới:

```
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "<aws_bucket_name>"
    key            = "<key_aka_path_of_s3_bucket>"
    region         = "us-east-1"
    dynamodb_table = "dynamodb_table_to_lock_tf_state"
  }
}

provider "aws" {
  region = "us-east-1"
}


data "aws_ssm_parameter" "MONGODB_URI" {
  name = "MONGODB_URI"
}

module "resource_name" {
  source = "../../modules/lambda_eventbridge_schedule"

  source_dir          = "src/"
  schedule_expression = "cron(0 * * * ? *)"
  function_name       = "function_name"
  subnet_ids          = []
  security_group_ids  = []
  lambda_envs = {
    MONGODB_URI : data.aws_ssm_parameter.MONGODB_URI.value,
  }
  tags = var.tags
}
```

- Khai báo các thông số cụ thể cho module, source code được đặt trong folder `src`. Ok rồi thế là chạy thôi.


### Happy working (as devops)