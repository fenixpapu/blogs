# Aws Kinesis Firehose delivery streams

- Mình dùng terraform ( thực ra có dùng tý terragrunt, nhưng thôi terraform cho dễ mô tả) theo doc [ở đây](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kinesis_firehose_delivery_stream)

- File `main.tf` trông sẽ như thế này:

```linenums="1"
  resource "aws_kinesis_firehose_delivery_stream" "extended_s3_stream" {
    name        = "terraform-kinesis-firehose-extended-s3-test-stream"
    destination = "extended_s3"

    extended_s3_configuration {
      role_arn   = aws_iam_role.firehose_role.arn
      bucket_arn = aws_s3_bucket.bucket.arn

      processing_configuration {
        enabled = "true"
      }
    }
  }

  resource "aws_s3_bucket" "bucket" {
    bucket = "tf-test-bucket"
    acl    = "private"
  }

  resource "aws_iam_role" "firehose_role" {
    name = "firehose_test_role"

    assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "firehose.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
  }
```

- Do ko có nhu cầu xử lý dữ liệu trước khi đẩy vào destination (S3). Nên mình lọc bỏ đoạn lambda (trên docs của terraform). Destination S3 thì cần dùng `extended_s3` nhé `S3` bị `deprecated` không nên dùng.

- Ok! chạy thì nó tạo thành công `kinesis firehose delivery streams`, và S3 (lưu ý cái trên là S3 public access nhé, tý sẽ sửa lại sau).

- Vấn đề là sau khi `terraform apply` thành công và test lại dịch vụ như hướng dẫn aws [ở đây](https://docs.aws.amazon.com/firehose/latest/dev/test-drive-firehose.html) - đơn giản chỉ là trên giao diện mục: `Test with demo data` -> click: `Start sending demo data`

- Và chờ 5 phút (do buffer interval là 300 seconds) vẫn ko thấy dữ liệu trong S3 như hướng dẫn.

- F\*ckkk sau khi check lại thì vấn đề ở chỗ tạo IAM role cho Kinesis nhưng chưa assign permission gì cả cho nên cần phải sửa lại cái IAM role như này:

```linenums="1"
resource "aws_iam_role" "firehose_role" {
  name = var.firehose_role_name

  inline_policy {
    name = "allow_s3_kinesis"
    policy = jsonencode({
      "Version" : "2012-10-17"
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : [
            "s3:AbortMultipartUpload",
            "s3:GetBucketLocation",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:PutObject"
          ],
          "Resource" : [
            "arn:aws:s3:::${var.s3_bucket_name}",
            "arn:aws:s3:::${var.s3_bucket_name}/*"
          ]
        },
        {
          "Effect" : "Allow",
          "Action" : [
            "kinesis:DescribeStream",
            "kinesis:GetShardIterator",
            "kinesis:GetRecords",
            "kinesis:ListShards"
          ],
          "Resource" : "arn:aws:kinesis:ap-southeast-1:${var.account_id}:stream/${var.kinesis_firehose_delivery_stream_name}"
        },
      ]
    })
  }

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}
```

- Ok! Sau khi tạo lại thì `kinesis` đã có thể đẩy dữ liệu vào S3 rồi phewwww.

- Thực ra vấn đề chính mình gặp phải là đã ko hiểu rõ IAM role được tạo bằng terraform thì nó ntn. Biết thiếu permission nhưng loay hoay mãi ko thêm được :|. Cảm ơn em đồng nghiệp tên Minh(Peter Bùi :D) ^^!

- Và phần S3 cũng cần sửa chút để bucket khi được tạo ra trở thành private chứ ko bị public. Cuối cùng file `.tf` trông sẽ ntn:

```linenums="1"
  resource "aws_kinesis_firehose_delivery_stream" "extended_s3_stream" {
    name        = var.kinesis_firehose_delivery_stream_name
    destination = "extended_s3"
    tags        = var.tags

    extended_s3_configuration {
      role_arn   = aws_iam_role.firehose_role.arn
      bucket_arn = aws_s3_bucket.bucket.arn

      processing_configuration {
        enabled = "false"
      }
    }
  }

  resource "aws_s3_bucket" "bucket" {
    bucket = var.s3_bucket_name
    acl    = "private"
  }

  resource "aws_s3_bucket_public_access_block" "bucket" {
    bucket = aws_s3_bucket.bucket.id

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  resource "aws_iam_role" "firehose_role" {
    name = var.firehose_role_name

    inline_policy {
      name = "allow_s3_kinesis_${var.firehose_role_name}"
      policy = jsonencode({
        "Version" : "2012-10-17"
        "Statement" : [
          {
            "Effect" : "Allow",
            "Action" : [
              "s3:AbortMultipartUpload",
              "s3:GetBucketLocation",
              "s3:GetObject",
              "s3:ListBucket",
              "s3:ListBucketMultipartUploads",
              "s3:PutObject"
            ],
            "Resource" : [
              "arn:aws:s3:::${var.s3_bucket_name}",
              "arn:aws:s3:::${var.s3_bucket_name}/*"
            ]
          },
          {
            "Effect" : "Allow",
            "Action" : [
              "kinesis:DescribeStream",
              "kinesis:GetShardIterator",
              "kinesis:GetRecords",
              "kinesis:ListShards"
            ],
            "Resource" : "arn:aws:kinesis:ap-southeast-1:${var.account_id}:stream/${var.kinesis_firehose_delivery_stream_name}"
          },
        ]
      })
    }

    assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal": {
          "Service": "firehose.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  EOF
  }
```

- Các cái `var` kia là tham số truyền vào khi chạy terragrunt nhé :D

- Happy working!!!
