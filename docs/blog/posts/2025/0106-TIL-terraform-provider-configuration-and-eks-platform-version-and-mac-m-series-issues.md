---
authors:
  - PaPu
categories:
  - devops
  - terraform
date: 2025-01-06
draft: false
---

# TIL terraform provider's configuration, eks platform version and mac M series issues

## Hiện tượng

- Bài này mình note lại một vài bug liên quan khi chạy terraform (note cho nhớ lần sau gặp fix nhanh hơn :D)
  - Lỗi liên quan Mac chip M series issues: `terraform init` ok nhưng `terraform plan` lỗi: `Template v2.2.0 does not have a package available - Mac Mx` M series.
  - Lỗi liên quan cấu hình credential của provider
  - Lỗi liên quan eks platform version ( lỗi ko đúng lắm nhưng tạm coi vậy đi)

<!-- more -->

## Mac M series

- Máy mình chip M2 ( nhưng lỗi tương tự với chip M series) như [ở đây](https://discuss.hashicorp.com/t/template-v2-2-0-does-not-have-a-package-available-mac-m1/35099/1)
- Hiện tượng: đã cấu hình xong `aws`, `vpn`, `terraform init` ok nhưng `terraform plan` thì lỗi:

```sh linenums="1"
template v2.2.0 does not have a package available for your current platform, darwin_arm64
```

- Search một số hướng dẫn cài `tfenv` và cài lại bản terraform khác như dưới:

```sh linenums="1"
brew uninstall terraform
brew install tfenv
TFENV_ARCH=amd64 tfenv install 1.3.3
tfenv use 1.3.3
```

- Ê nó ko work với mình :D (đã thử 1 số version của terraform) nhưng được cái thằng này dùng switch terraform version ngon nên vẫn note đây :D
- Một cách khác hay được hướng dẫn ( nó work thật), mình cũng chưa xác thực brew package này có malware gì ko :|, sẽ quay lại update nếu phát hiện :cry:

```sh linenums="1"
brew install kreuzwerker/taps/m1-terraform-provider-helper
m1-terraform-provider-helper activate
m1-terraform-provider-helper install hashicorp/template -v v2.2.0
```

- Oki sau khi setup thêm các bước ở trên thì đã có thể `terraform init` được rồi

## Terraform provider configuration

- Setup xong bước trên thì có thể `terraform init` nhưng đến bước `terraform plan` thì lại lỗi này:

```sh linenums="1"
╷
│ Error: Invalid provider configuration
│
│ Provider "registry.terraform.io/hashicorp/aws" requires explicit configuration. Add a provider block to the root module and
│ configure the provider's required arguments as described in the provider documentation.
│
╵
```

- Search 1 hồi thì [ở đây](https://stackoverflow.com/a/71906575/1406656) bạn này hỏi 1 câu làm rõ vấn đề luôn: `Can you use your AWS CLI to connect to your AWS account?`. Thử `aws s3 ls` ko được ạ. Vấn đề là trước kia toàn chạy với aws profile default. Lần này mình lại cấu hình aws credential với profile name khác (không phải default). Và dù terraform đã setup như này:

```terraform linenums="1"
provider "aws" {
  region  = "us-east-1"
  alias   = "global"
  profile = "project-name"
}
```

- Dù aws đã cấu hình profile (role) với `project-name` rồi mà nó ko ăn. Nên phải chạy với lệnh:

```sh linenums="1"
AWS_PROFILE=project-name terraform plan
```

- Ok giờ thì nó work rồi @@! (và đương nhiên cũng work với `terraform apply`)

## eks platform version

- Sau tất cả thì `terraform plan` cũng work yeah thì vấn đề mới xuất hiện:

```sh linenums="1"
Terraform detected the following changes made outside of Terraform since the last "terraform apply" which may have affected
this plan:

  # module.eks.module.eks_cluster.aws_eks_cluster.this[0] has changed
  ~ resource "aws_eks_cluster" "this" {
        id                        = "cluster-name"
        name                      = "cluster-name"
      ~ platform_version          = "eks.23" -> "eks.26"
        tags                      = {
            "Environment"            = "hll-main"
            "karpenter.sh/discovery" = "cluster-name"
        }
        # (10 unchanged attributes hidden)

        # (4 unchanged blocks hidden)
    }
```

- `~ platform_version          = "eks.23" -> "eks.26"` : đoạn này về lý thuyết nếu không sửa gì cứ thế apply `terraform sẽ rollback về eks.23` làm mình tìm mãi chỗ để cấu hình hoặc add lifecycle cho terraform ignore mà không được.
- Cuối cùng thấy đoạn [Change platform version](https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html?icmpid=docs_eks_help_panel_hp_cluster_k8s_version#change-platform-version) trên doc của aws:

```sh linenums="1"
You cannot change the platform version of an EKS cluster. When new Amazon EKS platform versions become available for a Kubernetes version, EKS automatically upgrades all existing clusters to the latest Amazon EKS platform version for their corresponding Kubernetes version. Automatic upgrades of existing Amazon EKS platform versions are rolled out incrementally. You cannot use the AWS Console or CLI to change the platform version.
```

- Tức là cứ làm đi ko ảnh hưởng gì đâu :D mạnh dạn thay đổi phần mình cần rồi apply thôi.

## HAPPY WORKING!!!

- chỉ vậy thôi thế work rồi, happy working :D
