---
authors:
  - PaPu
categories:
  - devops
date: 2024-12-27
draft: false
---

# Deploy cert-manager on EKS and use Let's encrypt to sign a TLS certificate for an HTTPS website

- Bài gốc ở trang của [cert-manager](https://cert-manager.io/docs/tutorials/getting-started-aws-letsencrypt/#create-a-production-ready-certificate), bài này chi tiết rõ ràng nên mình dịch lại ở đây :D.
- Trong link có cả cho GCP, Azure có thể tham khảo nếu cần.
- Trong bài này chúng ta sẽ học cách: deploy, cấu hình `cert-manager` trên EKS và cách deploy một HTTPS web server sau đó đưa nó lên internet.
- Chúng ta cũng sẽ học cấu hình `cert-manager` để lấy được một signed certificate từ Let's Encrypt và dùng cert này cho phép người dùng kết nối với web của chúng ta một cách bảo mật.
- Chúng ta sẽ cấu hình `cert-manager` sử dụng: [Let's Encrypt DNS-01 challenge protocol](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge) cùng với AWS Route53 DNS. Chúng ta sẽ dùng service account để xác thực với Route53.
<!-- more -->

- Để lấy được cert từ Let's Encrypt chúng ta có [hai cách](https://letsencrypt.org/docs/challenge-types/): HTTP-01 challenge hoặc DNS-01 challenge trong bài này sẽ dùng DNS-01.

## Part 1

- Phần này sẽ thực hiện các bước cơ bản cần làm để deploy HTTPS websites lên EKS.
- Chúng ta sẽ:
  - Tạo một DNS domain cho website
  - Tạo một EKS cluster
  - Cài `cert-manager`, tạo TLS certificate
  - Deploy một web server phục vụ truy cập https từ internet
  - TLS ở Part 1 chỉ cho mục đích testing
  - Part 2 chúng ta sẽ cấu hình `cert-manager` sử dụng `Let's Encrypt` và `Route53 DNS` để tạo một `trusted certificate` có thể sử dụng trên production.

### Cấu hình AWS CLI

- Coi như đã biết :D

### Tạo một public domain name

- Mua một public domain name để cấu hình https cho nó.
- Lưu lại như một biến env:

```sh linenums="1"
export DOMAIN_NAME=example.com # ❗ Replace this with your own DNS domain name
```

- Tạo một Route53 hosted zone:

```sh linenums="1"
aws route53 create-hosted-zone --caller-reference $(uuidgen) --name $DOMAIN_NAME
```

- Output sẽ ntn:

```sh linenums="1"
{
    "Location": "https://route53.amazonaws.com/2013-04-01/hostedzone/Z0984294TRL0R8AT3SQA",
    "HostedZone": {
        "Id": "/hostedzone/Z0984294TRL0R8AT3SQA",
        "Name": "cert-manager-aws-tutorial.richard-gcp.jetstacker.net.",
        "CallerReference": "77274711-b648-4da5-81b7-74512897d0db",
        "Config": {
            "PrivateZone": false
        },
        "ResourceRecordSetCount": 2
    },
    "ChangeInfo": {
        "Id": "/change/C04685872DX6N6587E1TL",
        "Status": "PENDING",
        "SubmittedAt": "2024-09-03T16:29:11.960000+00:00"
    },
    "DelegationSet": {
        "NameServers": [
            "ns-1504.awsdns-60.org",
            "ns-538.awsdns-03.net",
            "ns-278.awsdns-34.com",
            "ns-1765.awsdns-28.co.uk"
        ]
    }
}
```

- Đăng nhập vào control panel của nhà cung cấp domain chúng ta vừa mua và thêm các bản ghi NS từ: [authoritative DNS servers](https://www.cloudflare.com/en-gb/learning/dns/dns-server-types/) for Route53 hosted zone ( phần `NameServers` trong output trên)
- Hoặc nếu không có thể tìm lại bằng cách:

```sh linenums="1"
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query "HostedZones[0].Id" --output text)
aws route53 get-hosted-zone --id ${HOSTED_ZONE_ID}
```

- Có thể kiểm tra lại bản ghi NS đã được update bằng lệnh `dig` với "trace":

```sh linenums="1"
dig $DOMAIN_NAME ns +trace +nodnssec
```

- Note: Nó có thể mất lên tới hơn 1 giờ để bản ghi NS được update hoặc thay thế bản ghi NS cũ

### Tạo EKS cluster

- Tạo EKS cluster bằng `eksctl`
- Set env với cluster name:

```sh linenums="1"
export CLUSTER=test-cluster-1
```

- Tạo cluster với lệnh sau:

```sh linenums="1"
eksctl create cluster \
  --name $CLUSTER \
  --nodegroup-name node-group-1 \
  --node-type t3.small \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed \
  --spot
```

- Sẽ tốn thời gian để tạo cluster EKS, region tạo tương ứng với region setup trong step AWS CLI

### Install cert-manager

- Cài đặt và cấu hình `cert-manager` thôi:

```sh linenums="1"
helm install cert-manager cert-manager \
  --repo https://charts.jetstack.io \
  --namespace cert-manager \
  --create-namespace \
  --set crds.enabled=true
```

- Step trên sẽ cài đặt deployments, services và pods trong namespace: `cert-manager`.
- Nó cũng sẽ cài đặt một vài tài nguyên hỗ trợ khác trong phạm vi cluster như: `RBAC` roles và `Custom Resource Definitions`(aka: CRD).
- Chúng ta có thể xem các resource đã được cài:

```sh linenums="1"
kubectl -n cert-manager get all
```

- Có thể explore CRD (cert-manager's API) sử dụng `kubectl explain`:

```sh linenums="1"
kubectl explain Certificate
kubectl explain CertificateRequest
kubectl explain Issuer
```

### Create a test ClusterIssuer and a Certificate

- Phần này là self-signed certificate ( phần 2 chúng ta sẽ thay thế bằng Let's Encrypt để tạo cert)

```yml title="clusterissuer-selfsigned.yaml" linenums="1"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned
spec:
  selfSigned: {}
```

- Apply cấu hình:

```sh linenums="1"
kubectl apply -f clusterissuer-selfsigned.yaml
```

- Tạo certificate:

```yaml title="certificate.yaml" linenums="1"
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: www
spec:
  secretName: www-tls
  revisionHistoryLimit: 1
  privateKey:
    rotationPolicy: Always
  commonName: www.$DOMAIN_NAME
  dnsNames:
    - www.$DOMAIN_NAME
  usages:
    - digital signature
    - key encipherment
    - server auth
  issuerRef:
    name: selfsigned
    kind: ClusterIssuer
```

- Apply cấu hình với `envsubst` ( sẽ thay thế biến môi trường với giá trị của biến):

```sh linenums="1"
envsubst < certificate.yaml | kubectl apply -f -
```

- Dùng `cmctl status certificate` để check status của Certificate (?) what is this :D

```sh linenums="1"
cmctl status certificate www
```

- Nếu thành công: private key và signed certificate sẽ được lưu trong Secret tên: `www-tls`. Có thể sử dụng `cmctl inspect secret www-tls` để decode base64 xem nội dung Secret:

```sh linenums="1"
$ cmctl inspect secret www-tls
...
Valid for:
        DNS Names:
                - www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net
        URIs: <none>
        IP Addresses: <none>
        Email Addresses: <none>
        Usages:
                - digital signature
                - key encipherment
                - server auth
...
```

### Deploy a sample web server

- Deploy một web đơn giản, TLS key và certificate được cung cấp cho web server sử dụng: `www-tls` secret được mount vào như một volume:

```yaml title="deployment.yaml" linenums="1"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: helloweb
  labels:
    app: hello
spec:
  selector:
    matchLabels:
      app: hello
      tier: web
  template:
    metadata:
      labels:
        app: hello
        tier: web
    spec:
      containers:
        - name: hello-app
          image: us-docker.pkg.dev/google-samples/containers/gke/hello-app-tls:1.0
          imagePullPolicy: Always
          ports:
            - containerPort: 8443
          volumeMounts:
            - name: tls
              mountPath: /etc/tls
              readOnly: true
          env:
            - name: TLS_CERT
              value: /etc/tls/tls.crt
            - name: TLS_KEY
              value: /etc/tls/tls.key
      volumes:
        - name: tls
          secret:
            secretName: www-tls
```

- Apply cấu hình:

```sh linenums="1"
kubectl apply -f deployment.yaml
```

- Chúng ta tạo k8s loadbalancer service giúp kết nối từ internet có thể truy cập được pod. Khi tạo k8s service như dưới, một AWS classic loadbalancer với một ephemeral public IP cũng sẽ được khởi tạo:

```yaml title="service.yaml" linenums="1"
apiVersion: v1
kind: Service
metadata:
  name: helloweb
spec:
  ports:
    - port: 443
      protocol: TCP
      targetPort: 8443
  selector:
    app: hello
    tier: web
  type: LoadBalancer
```

- Apply cấu hình:

```sh linenums="1"
kubectl apply -f service.yaml
```

- Sau 2, 3 phút loadbalancer sẽ được tạo với một public IP. Dùng lệnh: `kubectl get service helloweb` để kiểm tra.

- **_Note_**: Mặc định EKS tạo classic load balancers cho service trong k8s bằng: [Legacy Cloud Provider Load balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html#lbc-legacy). Tuy nhiên nó dần trở nên di sản (legacy) và chỉ được support critical bug. Theo [EKS Best Practices Guide](https://docs.aws.amazon.com/eks/latest/best-practices/introduction.html) chúng ta nên xem xét sử dụng [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html) thay thế.

- Stable DNS host name của load balancer có thể sử dụng như bản ghi `www` của `$DOMAIN` bằng cách tạo Route53 Alias Record:

```sh linenums="1"
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query "HostedZones[0].Id" --output text)
ELB_CANONICAL_HOSTED_ZONE_NAME=$(kubectl get svc helloweb --output=jsonpath='{ .status.loadBalancer.ingress[0].hostname }')
aws elb describe-load-balancers --query "LoadBalancerDescriptions[?CanonicalHostedZoneName == '$ELB_CANONICAL_HOSTED_ZONE_NAME'] | [0]" \
| jq '{
  "Comment": "Creating an alias record",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.\($DOMAIN_NAME)",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": .CanonicalHostedZoneNameID,
          "DNSName": .CanonicalHostedZoneName,
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}' \
    --arg DOMAIN_NAME "${DOMAIN_NAME}" \
| aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch file:///dev/stdin
```

- Một cách khác là có thể sử dụng [ExternalDNS](https://kubernetes-sigs.github.io/external-dns/latest/#what-it-does)
- Kiểm tra lại: `www.$DOMAIN_NAME` giờ có thể resolved ephemeral public IP của service:

```sh linenums="1"
$ dig www.$DOMAIN_NAME A
...
;; QUESTION SECTION:
;www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net. IN A

;; ANSWER SECTION:
www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net. 60 IN A 34.212.236.229
www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net. 60 IN A 44.232.234.71
www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net. 60 IN A 35.164.69.198
```

- Nếu DNS đúng, loadbalancers hoạt động và helloworld đang chạy chúng ta nên có thể truy cập được dịch vụ:

```sh linenums="1"
curl --insecure -v https://www.$DOMAIN_NAME
```

- Chúng ta dùng `--insecure` vì curl sẽ reject untrusted certificate do chúng ta tự gen trước đó. Part 2 chúng ta sẽ dùng Let's Encrypt để gen.

```sh linenums="1"
..
* Server certificate:
*  subject: CN=www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net
*  start date: Sep  4 08:43:56 2024 GMT
*  expire date: Dec  3 08:43:56 2024 GMT
*  issuer: CN=www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net
*  SSL certificate verify result: self-signed certificate (18), continuing anyway.
...
Hello, world!
Protocol: HTTP/2.0!
Hostname: helloweb-55cb4cd887-tjlvh
```

## Part 2

- Phần 1 chúng ta tạo certificate test. Phần này sẽ học cách cấu hình cert-manager dùng Let's Encrypt và AWS Route53 DNS để tạo trusted certificate có thể dùng cho môi trường production.
- Chúng ta cần chứng minh với Let's Encrypt rằng chúng ta sở hữu domain mà chúng ta sẽ request tạo cert, bằng cách tạo một bản ghi DNS record trong domain này. Cách này được biết đến như: [DNS-01 challenge type](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge)
- `cert-manager` có thể tạo bản ghi DNS này bằng cách sử dụng API của Route53 nhưng nó cần authen trước và cách bảo mật nhất hiện nay là sử dụng AWS Role với service account k8s.

### Create an IAM OIDC provider for your cluster

- Tạo 1 OIDC ( open ID connect) cho cluster:

```sh linenums="1"
eksctl utils associate-iam-oidc-provider --cluster $CLUSTER --approve
```

### Create an IAM policy

- Tạo một IAM policy

```sh linenums="1"
aws iam create-policy \
     --policy-name cert-manager-acme-dns01-route53 \
     --description "This policy allows cert-manager to manage ACME DNS01 records in Route53 hosted zones. See https://cert-manager.io/docs/configuration/acme/dns01/route53" \
     --policy-document file:///dev/stdin <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "route53:GetChange",
      "Resource": "arn:aws:route53:::change/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "arn:aws:route53:::hostedzone/*"
    },
    {
      "Effect": "Allow",
      "Action": "route53:ListHostedZonesByName",
      "Resource": "*"
    }
  ]
}
EOF
```

### Create an IAM role and associate it with a Kubernetes service account

- Bước này sẽ làm các task:
  - Tạo một service account trong namespace: `cert-manager`,
  - Cấu hình một role mới với quyền trong policy được tạo ở bước trên
  - cấu hình role chỉ có thể assume bởi service account trước đó

```sh linenums="1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
eksctl create iamserviceaccount \
  --name cert-manager-acme-dns01-route53 \
  --namespace cert-manager \
  --cluster ${CLUSTER} \
  --role-name cert-manager-acme-dns01-route53 \
  --attach-policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/cert-manager-acme-dns01-route53 \
  --approve
```

### Grant permission for cert-manager to create ServiceAccount tokens

- `cert-manager` cần quyền để genenrate JWT token cho service account được tạo ở trên. Apply RBAC Role và RoleBinding phía dưới trong namespace: `cert-manager`:

```yml title="rbac.yml" linenums="1"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cert-manager-acme-dns01-route53-tokenrequest
  namespace: cert-manager
rules:
  - apiGroups: [""]
    resources: ["serviceaccounts/token"]
    resourceNames: ["cert-manager-acme-dns01-route53"]
    verbs: ["create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: cert-manager-acme-dns01-route53-tokenrequest
  namespace: cert-manager
subjects:
  - kind: ServiceAccount
    name: cert-manager
    namespace: cert-manager
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: cert-manager-acme-dns01-route53-tokenrequest
```

- Apply:

```sh linenums="1"
kubectl apply -f rbac.yaml
```

### Create a ClusterIssuer for Let's Encrypt Staging

- `ClusterIssuer` là một custom resource nói cho `cert-manager` cách ký (sign) một certificate. Phần này chúng ta sẽ tạo một `ClusterIssuer` cấu hình kết nối đến Let's Encrypt staging server, giúp chúng ta kiểm thử mọi thứ mà không bị giới hạn (Let's Encrypt cho môi trường production có giới hạn số lần request)
- Tạo file `clusterissuer-lets-encrypt-staging.yaml` như dưới:

```yaml title="clusterissuer-lets-encrypt-staging.yaml" linenums="1"
# clusterissuer-lets-encrypt-staging.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: ${EMAIL_ADDRESS}
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
      - dns01:
          route53:
            region: ${AWS_DEFAULT_REGION}
            role: arn:aws:iam::${AWS_ACCOUNT_ID}:role/cert-manager-acme-dns01-route53
            auth:
              kubernetes:
                serviceAccountRef:
                  name: cert-manager-acme-dns01-route53
```

- Đổi email với `email` của chúng ta, và apply cấu hình, một vài biến đã được định nghĩa trong các phần trên:

```sh linenums="1"
export EMAIL_ADDRESS=<email-address> # ❗ Replace this with your email address
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
envsubst < clusterissuer-lets-encrypt-staging.yaml | kubectl apply -f  -
```

- Chúng ta có thể check lại status của ClusterIssuer:

```sh linenums="1"
kubectl describe clusterissuer letsencrypt-staging
```

- Output trông sẽ ntn:

```sh linenums="1"
Status:
  Acme:
    Last Registered Email:  firstname.lastname@example.com
    Uri:                    https://acme-staging-v02.api.letsencrypt.org/acme/acct/77882854
  Conditions:
    Last Transition Time:  2024-09-04T15:41:18Z
    Message:               The ACME account was registered with the ACME server
    Observed Generation:   1
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
```

- Note:
  - Let's Encrypt dùng giao thức Automatic Certificate Management Environment (ACME) đó là lý do tại sao yaml file trên có key: `acme`
  - Email: dùng để Let's Encrypt remind chúng ta làm mới cert 30 ngày trước khi cert expired.
  - Let's Encrypt cho production có giới hạn tỷ lệ rất nghiêm ngặt rất dễ bị chạm ngưỡng giới hạn này nên chúng ta test với staging trước

### Re-issue the Certificate using Let's Encrypt

- Patch lại cert sử dụng ClussterIssuer của staging:

```sh linenums="1"
kubectl patch certificate www --type merge  -p '{"spec":{"issuerRef":{"name":"letsencrypt-staging"}}}'
```

- Việc này sẽ trigger `cert-manager` renew certificate. Dùng lệnh `cmctl` để check:

```sh linenums="1"
cmctl status certificate www
cmctl inspect secret www-tls
```

- Khi cert được issued, restart lại web server để apply:

```sh linenums="1"
kubectl rollout restart deployment helloweb
```

- Truy cập thử:

```sh linenums="1"
$ curl -v --insecure https://www.$DOMAIN_NAME
...
* Server certificate:
*  subject: CN=www.cert-manager-tutorial-22.site
*  start date: Jan  5 12:41:14 2023 GMT
*  expire date: Apr  5 12:41:13 2023 GMT
*  issuer: C=US; O=(STAGING) Let's Encrypt; CN=(STAGING) Artificial Apricot R3
*  SSL certificate verify result: unable to get local issuer certificate (20), continuing anyway.
...
Hello, world!
Protocol: HTTP/2.0!
Hostname: helloweb-9b8bcdd56-6rxm8
```

### Create a production ready certificate

- Staging works as expected :D chuyển qua production thôi.
- Tạo một Let's Encrypt production Issuer thôi:

```sh title="clusterissuer-lets-encrypt-production.yaml" linenums="1"
# clusterissuer-lets-encrypt-production.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $EMAIL_ADDRESS
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - dns01:
        route53:
          region: ${AWS_DEFAULT_REGION}
          role: arn:aws:iam::${AWS_ACCOUNT_ID}:role/cert-manager-acme-dns01-route53
          auth:
            kubernetes:
              serviceAccountRef:
                name: cert-manager-acme-dns01-route53
```

- Apply cấu hình:

```sh linenums="1"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
envsubst < clusterissuer-lets-encrypt-production.yaml | kubectl apply -f  -
```

- Check status của ClusterIssuer:

```sh linenums="1"
kubectl describe clusterissuer letsencrypt-production
```

- Patch certificate để dùng production ClusterIssuer:

```sh linenums="1"
kubectl patch certificate www --type merge  -p '{"spec":{"issuerRef":{"name":"letsencrypt-production"}}}'
```

- Việc này sẽ trigger `cert-manager` trigger để tạo một certificate mới. Dùng `cmctl` để check:

```sh linenums="1"
cmctl status certificate www
cmctl inspect secret www-tls
```

- Cuối cùng khi cert được gen, restart lại web server thôi:

```sh linenums="1"
kubectl rollout restart deployment helloweb
```

- Bây giờ có thể dùng `curl` mà ko cần option `--insecure` nữa:

```sh linenums="1"
curl -v https://www.$DOMAIN_NAME
...

* Server certificate:
*  subject: CN=www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net
*  start date: Sep  4 19:32:24 2024 GMT
*  expire date: Dec  3 19:32:23 2024 GMT
*  subjectAltName: host "www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net" matched cert's "www.cert-manager-aws-tutorial.richard-gcp.jetstacker.net"
*  issuer: C=US; O=Let's Encrypt; CN=R11
*  SSL certificate verify ok.
...
```

- Yeah that all! Chúng ta học cách:
  - Deploy `cert-manager` lên EKS, cấu hình `cert-manager` để issue Let's Encrypt signed 1 certificate sử dụng giao thức DNS-01 với Route53.
  - Chúng ta cũng học về IAM Role for service account (IRSA) và đã học về cách cấu hình `cert-manager` để authenticate AWS Route53 sử dụng k8s ServiceAccount Token.

## Clean Up

- Xoá thôi :D

```sh linenums="1"
eksctl delete cluster --name $CLUSTER
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query "HostedZones[0].Id" --output text)
aws route53 delete-hosted-zone --id ${HOSTED_ZONE_ID}
```

- Happy Devops!!! Xem thêm các link liên quan của GCP và Azure :D
