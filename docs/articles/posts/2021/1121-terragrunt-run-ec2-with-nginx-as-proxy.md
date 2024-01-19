# Terragrunt run ec2 with nginx as proxy

- À nhầm rồi :| dạo này hay viết terragrunt chứ task này mình dùng terraform @@!.
- Dù sao thì terragrunt cũng thực sự rất hay, mình chắc chắn sẽ cố gắng viết vài bài hoặc dịch vài bài về terragrunt. Thích nhất idea của terragrant khi bạn làm devops và phải triển khai các môi trường khác nhau (`prod`, `stage`, `qa`). Thực ra chính là trong [đoạn này](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/#promote-immutable-versioned-terraform-modules-across-environments).

- Thôi quay trở lại bài chính :D

- Yêu cầu của bài toán là sử dụng `terraform` chạy một ec2 với 3 container: 2 container là [metabase](https://www.metabase.com/docs/latest/operations-guide/running-metabase-on-docker.html) một cho `prod` và một cho `staging` - hai container này sẽ ko expose port ra ngoài. Một container nginx nhận request và forward sang các container tương ứng.

- Sẽ rất nhanh nếu làm trên local với 1 file `docker-compose.yml` là xong :D hoặc trên ec2 với `user-data` thì cũng nhanh thôi :D. Làm với terraform làm mình mất thời gian hơn :D

- Cấu trúc thư mục sẽ như này:

```sh linenums="1"
.
├── main.tf
├── user_data.conf
└── variables.tf
```

- File `main.tf` sẽ có nội dung gần như thế này:

```terraform linenums="1"
  provider "aws" {
  region  = "ap-southeast-1"
  profile = "<your-aws-profile>"
  }

  terraform {
    backend "s3" {
      bucket  = "<your-aws-s3-bucket>"
      key     = "prod/metabase"
      region  = "ap-southeast-1"
      encrypt = true
      profile = "<your-aws-profile>"
    }
  }

  locals {

    tags = {
      "Project"     = "your-project-name"
      "Environment" = "prod"
      "Terraform"   = "true"
      "Prometheus"  = "production"
      "Name"        = "metabase"
      "Product"     = "Metabase"
      "Service"     = "service-name"
    }
    vpc_id        = "vpc_id"
    ami           = "ami-07191cf2912e097a6"
    instance_type = "t2.large"
    key_name      = "your-project-name-prod-setup"
    subnet_id     = "subnet_id"

  }

  resource "aws_instance" "metabase" {
    ami                         = local.ami
    instance_type               = local.instance_type
    key_name                    = local.key_name
    monitoring                  = true
    associate_public_ip_address = true
    vpc_security_group_ids      = ["${module.security_group.security_group_id}"]
    subnet_id                   = local.subnet_id
    user_data                   = file("${path.module}/user_data.conf")
  }

  resource "aws_ebs_volume" "metabase_volume" {
    availability_zone = "ap-southeast-1c"
    size              = 30
  }

  resource "aws_volume_attachment" "ebs_att" {

    device_name = "/dev/sdh"
    volume_id   = aws_ebs_volume.metabase_volume.id
    instance_id = aws_instance.metabase.id
  }

  module "security_group" {
    source  = "terraform-aws-modules/security-group/aws"
    version = "4.3.0"

    name                     = "metabase-sg"
    description              = "Terraformed security group."
    vpc_id                   = local.vpc_id
    ingress_ipv6_cidr_blocks = []
    egress_ipv6_cidr_blocks  = []

    tags = var.tags

    ingress_with_cidr_blocks = var.ingress_with_cidr_blocks

    egress_with_cidr_blocks = var.egress_with_cidr_blocks
  }

  resource "aws_eip" "lb" {
    instance = aws_instance.metabase.id
    vpc      = true
  }
  resource "aws_eip_association" "eip_assoc" {
    instance_id   = aws_instance.metabase.id
    allocation_id = aws_eip.lb.id
  }
```

- File `variables.tf`

```linenums="1"
  variable "tags" {
  default = {}
  }

  variable "ingress_with_cidr_blocks" {
    default = [{
      rule : "ssh-tcp"
      cidr_blocks : "1.2.3.4/32"
      description = "Public IP"
      },
      {
        from_port : 443
        to_port : 443
        protocol : "tcp"
        cidr_blocks : "0.0.0.0/0"
        description : "metabase service"
    }]
  }

  variable "egress_with_cidr_blocks" {
    default = [{
      rule : "all-all"
      cirdr_blocks : "0.0.0.0/0"
    }]
  }
```

- Nếu bạn truyền tham số và chạy file `main.tf`. Đoạn script trên sẽ khởi tạo một Elastic IP ( static public IP), security group (SG) với các `inbound` và `outbound` được truyền như tham số bạn truyền vào cho `ingress_with_cidr_blocks` và `egress_with_cidr_blocks` nếu ko sẽ lấy giá trị mặc định trong `variables.tf`, một EBS volume, một EC2 với các thuộc tính tạo trước đó.

- Cuối cùng chạy các lệnh có trong `user_data.conf`. Vậy trong file này có gì. Cùng kiểm tra thử:

```linenums="1"
  #cloud-config
  package_upgrade: true

  packages:
      - wget
      - docker
      - curl

  write_files:
      # - path: /etc/systemd/system/node_exporter.service
      #   content: |
      #     [Unit]
      #     Description=Node Exporter

      #     [Service]
      #     User=root
      #     ExecStart=/usr/local/bin/node_exporter

      #     [Install]
      #     WantedBy=default.target
      - path: /metabase/docker-compose.yml
        content: |
            version: "3"
            services:
              metabase:
                image: metabase/metabase
                container_name: metabase
                restart: always
                # ports:
                #   - 8080:3000
                volumes:
                  - ~/metabase-data/:/metabase-data
                environment:
                  MB_DB_FILE: /metabase-data/metabase.db
                networks:
                  - metabase

              metabasestg:
                image: metabase/metabase
                container_name: metabasestg
                restart: always
                # ports:
                #   - 3000:3000
                volumes:
                  - ~/metabase-data-stg/:/metabase-data-stg
                environment:
                  MB_DB_FILE: /metabase-data-stg/metabase.db
                networks:
                  - metabase

              nginx:
                image: nginx:1.21.3
                container_name: nginx
                restart: always
                ports:
                  - 80:80
                  - 443:443
                volumes:
                  - ./nginx.conf:/etc/nginx/nginx.conf
                  - ./eserver.crt:/etc/pki/nginx/eserver.crt
                  - ./server.key:/etc/pki/nginx/private/server.key
                networks:
                  - metabase

            networks:
              metabase: ~
      - path: /metabase/nginx.conf
        content: |
            # For more information on configuration, see:
            #   * Official English Documentation: http://nginx.org/en/docs/
            #   * Official Russian Documentation: http://nginx.org/ru/docs/

            user nginx;
            worker_processes auto;
            error_log /var/log/nginx/error.log;
            pid /run/nginx.pid;

            # Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
            include /usr/share/nginx/modules/*.conf;

            events {
                worker_connections 1024;
            }

            http {
                log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                                  '$status $body_bytes_sent "$http_referer" '
                                  '"$http_user_agent" "$http_x_forwarded_for"';

                access_log  /var/log/nginx/access.log  main;

                sendfile            on;
                tcp_nopush          on;
                tcp_nodelay         on;
                keepalive_timeout   65;
                types_hash_max_size 4096;

                include             /etc/nginx/mime.types;
                default_type        application/octet-stream;

                # Load modular configuration files from the /etc/nginx/conf.d directory.
                # See http://nginx.org/en/docs/ngx_core_module.html#include
                # for more information.
                include /etc/nginx/conf.d/*.conf;

                server {
                    listen       80;
                    listen       [::]:80;
                    server_name  _;
                    #root         /usr/share/nginx/html;

                    # Load configuration files for the default server block.
                    include /etc/nginx/default.d/*.conf;
                    return 301 https://$host$request_uri;

                    error_page 404 /404.html;
                      location = /404.html {
                    }

                    error_page 500 502 503 504 /50x.html;
                      location = /50x.html {
                    }
                }

                # Settings for a TLS enabled server.
                server {
                    listen       443 ssl http2;
                    listen       [::]:443 ssl http2;
                    server_name  metabase.prod.com;
                    # root         /usr/share/nginx/html;

                    ssl_certificate "/etc/pki/nginx/eserver.crt";
                    ssl_certificate_key "/etc/pki/nginx/private/server.key";
                    ssl_session_cache shared:SSL:1m;
                    ssl_session_timeout  10m;
                    ssl_ciphers HIGH:!aNULL:!MD5;
                    ssl_prefer_server_ciphers on;

                    # Load configuration files for the default server block.
                    include /etc/nginx/default.d/*.conf;

                    location / {
                        proxy_pass http://metabase:3000;
                    }

                    error_page 404 /404.html;
                        location = /40x.html {
                    }

                    error_page 500 502 503 504 /50x.html;
                        location = /50x.html {
                    }
                }

              server {
                    listen       443 ssl http2;
                    listen       [::]:443 ssl http2;
                    server_name  metabase.staging.com;
                    # root         /usr/share/nginx/html;

                    ssl_certificate "/etc/pki/nginx/eserver.crt";
                    ssl_certificate_key "/etc/pki/nginx/private/server.key";
                    ssl_session_cache shared:SSL:1m;
                    ssl_session_timeout  10m;
                    ssl_ciphers HIGH:!aNULL:!MD5;
                    ssl_prefer_server_ciphers on;

                    # Load configuration files for the default server block.
                    include /etc/nginx/default.d/*.conf;

                    location / {
                        proxy_pass http://metabasestg:3000;
                    }

                    error_page 404 /404.html;
                        location = /40x.html {
                    }

                    error_page 500 502 503 504 /50x.html;
                        location = /50x.html {
                    }
                }
            }

      - path: /metabase/eserver.crt
        content: |
            -----BEGIN CERTIFICATE-----
            <your-certificate>
            -----END CERTIFICATE-----

      - path: /metabase/server.key
        content: |
            -----BEGIN PRIVATE KEY-----
            <your-private-key>
            -----END PRIVATE KEY-----

  runcmd:
      # system update
      - sudo yum update -y
      # Start Docker service
      - sudo service docker start
      # Install docker-compose
      - sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      - sudo chmod +x /usr/local/bin/docker-compose
      - sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
      - docker-compose version

      # Install Prometheus Node Exporter
      # - wget https://github.com/prometheus/node_exporter/releases/download/v0.17.0/node_exporter-0.17.0.linux-amd64.tar.gz
      # - tar -xvf node_exporter-0.17.0.linux-amd64.tar.gz
      # - mv node_exporter-0.17.0.linux-amd64/node_exporter /usr/local/bin
      # - systemctl daemon-reload
      # - systemctl enable node_exporter.service
      # - systemctl start node_exporter.service

      # Run metabase and metabasetsg and nginx
      - cd /metabase
      - docker-compose up -d


  output: { all: "| tee -a /var/log/cloud-init-output.log" }

```

- Nội dung script trong `user_data.conf` lần lượt thực hiện các việc:

  - Cập nhật các gói: `wget`, `docker`, `curl`
  - Tạo file `docker-compose.yml` , `nginx.conf`, `eserver.crt`, `server.key` with their content. `eserver.crt` và `server.key` là nội dung bạn tự gen ra cho mình để support SSL (cloud flare support self ssl - cần check lại việc này (cwl)).
  - thực thi câu lệnh cài docker, docker-compose và `docker-compose up -d`
  - Sau khi ec2 và các container up thì sẽ tạo ra mô hình như ảnh dưới, phần còn lại là trỏ domain về public IP được tạo trước đó là xong.
    ![ec2-with-nginx-as-proxy](../../images/2021/20211121_014000_ec2_with_nginx_proxy.png)

- Happy working!!!
