---
authors:
  - PaPu
categories:
  - devops
date: 2021-11-17
draft: false
---

# Cluster Autoscaler

- Tài liệu chính thức của AWS ở [đây](https://docs.aws.amazon.com/eks/latest/userguide/cluster-autoscaler.html)

- Mình cần implement CA cho project của dự án, nên dịch luôn bài này cho hiểu. :)

---

- K8s CA tự động thay đổi số nodes trong cluster của bạn khi các pod fail hoặc được tạo lại trên một node khác. [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) thường được cài đặt như một [Deployment](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/cloudprovider/aws/examples) trong cluster của bạn. Nó sử dụng [Leader Election](https://en.wikipedia.org/wiki/Leader_election) để đảm bảo tính HA ( khả dụng cao - high availability), nhưng việc mở rộng chỉ được thực hiện bởi một bản sao tại một thời điểm.
- Trước khi deploy một CA, hãy chắc chắn rằng bạn quen thuộc với các khái niệm của K8s tương ứng với các tính năng của AWS. Những thuật ngữ sau được sử dụng xuyên suốt bài này:

  - `K8s Cluster Autoscaler`: Một thành phần chính (core component) của K8s Control Plane đưa ra quyết định lập lịch và mở rộng quy mô. Thêm thông tin về [Control Plane](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md)

  - `AWS Cloud provider implemention`: Một extension của K8s CA, thực hiện các quyết định của K8s CA bằng cách giao tiếp với các sản phẩm và dịch vụ của AWS ví dụ như EC2. Chi tiết xem tại đây: [CA on AWS](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)

  - `Node groups` - Một khái niệm trong k8s cho một nhóm các nodes trong cluster. Nodes group không phải là một tài nguyên thực sự của k8s, nhưng chúng được tìm thấy dưới dạng trừu tượng trong CA, Cluster API, và các thành phần khác. Các node trong cùng một node group có thể chia sẻ một vài thuộc tính chung như `labels` và `taints`. Tuy vậy chúng vẫn có thể khác AZ hay instance type.

  - `Amazon EC2 Auto Scaling Groups`: Một tính năng của AWS được sử dụng bởi CA. ASG phù hợp với rất nhiều trường hợp. Amazon EC2 ASG được cấu hình để chạy instance tự động join k8s cluster. Chúng cũng được `labels` và `taint` cho các tài nguyên Node tương ứng trong k8s API.

- Tham khảo, [`Managed node groups`](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html) được quản lý sử dụng Amazon EC2 ASG, và tương thích với CA.

- Topic này mô tả làm thế nào bạn có thể deploy CA trong Amazon EKS cluster của bạn, và cấu hình CA để Amazon EC2 ASG.

## Prerequisites

- Trước khi deploy CA, bạn phải đáp ứng được những điều kiện tiên quyết sau:

  - Một Amazon EKS cluster ( hẳn nhiên rồi).

  - Một IAM OIDC provider cho cluster của bạn. Để xem bạn đã có hay cần tạo mới: [Create an IAM OIDC provider for your cluster](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)

  - Node groups với ASG tags. CA yêu cầu những tags sau trên ASG để chúng được tự động tìm thấy ( auto discovered):

    - Nếu bạn sử dụng `eksctl` để tạo các node groups, những tags này được thêm tự động.
    - Nếu bạn không sử dụng `eksctl`, bạn phải thêm các tags này thủ công:

      | Key                                      | Value   |
      | ---------------------------------------- | ------- |
      | k8s.io/cluster-autoscaler/<cluster-name> | `owned` |
      | k8s.io/cluster-autoscaler/enabled        | TRUE    |

## Create an IAM policy and role

- Tạo một IAM cấp quyền ( permission) cho CA. Thay thế tất cả `<example-values>` ( cả <>) với giá trị của bạn trong suốt quá trình.

### Create an IAM policy

- Lưu nội dung dưới đây vào file tên: `cluster-autoscaler-policy.json`. Nếu các node groups đang tồn tại của bạn được tạo với `eksctl` và bạn sử dụng tùy chọn: `--asg-access`, thì policy đã tồn tại và bạn có thể đi tới bước tiếp theo.

```linenums="1"
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Action": [
                  "autoscaling:DescribeAutoScalingGroups",
                  "autoscaling:DescribeAutoScalingInstances",
                  "autoscaling:DescribeLaunchConfigurations",
                  "autoscaling:DescribeTags",
                  "autoscaling:SetDesiredCapacity",
                  "autoscaling:TerminateInstanceInAutoScalingGroup",
                  "ec2:DescribeLaunchTemplateVersions"
              ],
              "Resource": "*",
              "Effect": "Allow"
          }
      ]
  }
```

- Tạo policy với lệnh dưới. Có thể đổi `policy-name`

```linenums="1"
  aws iam create-policy --policy-name AmazonEKSClusterAutoscalerPolicy --policy-document file://cluster-autoscaler-policy.json
```

- Lưu lại ARN để dùng cho các bước sau.

### Create IAM role and attach IAM policy to it

- Ở đây sử dụng `eksctl` để sử dụng `AWS Management console` check link gốc.

- Chạy lệnh dưới đây nếu bạn đã tạo EKS cluster với `eksctl`. Nếu bạn tạo node groups sử dụng tùy chọn: `--asg-access` , thay thế `<AmazonEKSClusterAutoscalerPolicy>` với tên IAM policy mà `eksctl` tạo cho bạn. Tên policy có thể theo mẫu như sau: `eksctl-<cluster-name>-nodegroup-ng-<xxxxxxxx>-PolicyAutoScaling`:

```linenums="1"
  eksctl create iamserviceaccount \
    --cluster=<my-cluster> \
    --namespace=kube-system \
    --name=cluster-autoscaler \
    --attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/<AmazonEKSClusterAutoscalerPolicy> \
    --override-existing-serviceaccounts \
    --approve
```

- AWS khuyến nghị, nếu bạn tạo groups sử dụng tùy chọn: `--asg-access` bạn detach IAM policy `eskctl` đã tạo và attach vào [Amazon EKS node IAM role](https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html) mà `eksctl` đã tạo cho bạn. Bạn tách policy khỏi node IAM role để các function của CA được hoạt động bình thường. Tách các policy không đưa cho các pods khác trên các node quyền trong policy. Chi tiết xem tại: [Removing IAM identity permission](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-attach-detach.html#remove-policies-console)

- Quá trình chạy thật bị lỗi: `failed to create service account kube-system/cluster-autoscaler: checking whether namespace "kube-system" exists: Unauthorized` nên đã phải làm bước này trên console.

## Deploy Cluster Autoscaler

- Các bước tiếp theo sẽ deploy CA. AWS khuyên bạn nên review: [Deployment considerations](https://docs.aws.amazon.com/eks/latest/userguide/cluster-autoscaler.html#ca-deployment-considerations) - hoặc scroll xuống dưới - và tối ưu CA trước khi deploy trên production.

- **_ TO DEPLOY THE CLUSTER AUTOSCALER_**

1. Tải CA YAML file:

```linenums="1"
  curl -o cluster-autoscaler-autodiscover.yaml https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

2. Đổi `<YOUR CLUSTER NAME>` trong file download về với cluster của bạn.

3. Apply YAML file vào cluster của bạn:

```linenums="1"
  kubectl apply -f cluster-autoscaler-autodiscover.yaml
```

4. Annotate `cluster-autoscaler` service account với ARN của IAM role bạn tạo trước đó. Thay thế `<example values>` với giá trị của bạn:

```linenums="1"
  kubectl annotate serviceaccount cluster-autoscaler -n kube-system eks.amazonaws.com/role-arn=arn:aws:iam::926755034425:role/AmazonEKSClusterAutoscalerRole
```

5. Patch (vá) deployment để thêm `cluster-autoscaler.kubernetes.io/safe-to-evict` annotation và CA pods với lệnh sau:

```linenums="1"
  kubectl patch deployment cluster-autoscaler -n kube-system -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict": "false"}}}}}'
```

6. Edit CA deployment với lệnh:

```linenums="1"
  kubectl -n kube-system edit deployment.apps/cluster-autoscaler
```

- Edit `cluster-autoscaler` container command, thay thế `<YOUR CLUSTER NAME> (including <>)` với tên cluster của bạn và thêm các option sau:

  - `--balance-similar-node-groups`
  - `--skip-nodes-with-system-pods=false`

```linenums="1"
spec:
    containers:
    - command:
      - ./cluster-autoscaler
      - --v=4
      - --stderrthreshold=info
      - --cloud-provider=aws
      - --skip-nodes-with-local-storage=false
      - --expander=least-waste
      - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<YOUR CLUSTER NAME>
      - --balance-similar-node-groups
      - --skip-nodes-with-system-pods=false
```

- Save và `close` file để `apply` thay đổi.

7. Mở [CA releases](https://github.com/kubernetes/autoscaler/releases) để kiểm tra version của CA phù hợp với major và minor version cluster của bạn.

8. Set CA image tag với version trong bước trên theo lệnh dưới. Thay thế `1.21.n` với giá trị của bạn:

```linenums="1"
  kubectl set image deployment cluster-autoscaler -n kube-system cluster-autoscaler=k8s.gcr.io/autoscaling/cluster-autoscaler:v<1.21.n>
```

## View your Cluster Autoscaler logs

- Sau khi bạn deploy CA, bạn có thể xem logs và xác nhận rằng nó đang monitor tải cluster của bạn.

- Xem logs với lệnh như dưới:

```linenums="1"
  kubectl -n kube-system logs -f deployment.apps/cluster-autoscaler
```

- Output nhìn như dưới:

```linenums="1"
  I0926 23:15:55.165842       1 static_autoscaler.go:138] Starting main loop
  I0926 23:15:55.166279       1 utils.go:595] No pod using affinity / antiaffinity found in cluster, disabling affinity predicate for this loop
  I0926 23:15:55.166293       1 static_autoscaler.go:294] Filtering out schedulables
  I0926 23:15:55.166330       1 static_autoscaler.go:311] No schedulable pods
  I0926 23:15:55.166338       1 static_autoscaler.go:319] No unschedulable pods
  I0926 23:15:55.166345       1 static_autoscaler.go:366] Calculating unneeded nodes
  I0926 23:15:55.166357       1 utils.go:552] Skipping ip-192-168-3-111.<region-code>.compute.internal - node group min size reached
  I0926 23:15:55.166365       1 utils.go:552] Skipping ip-192-168-71-83.<region-code>.compute.internal - node group min size reached
  I0926 23:15:55.166373       1 utils.go:552] Skipping ip-192-168-60-191.<region-code>.compute.internal - node group min size reached
  I0926 23:15:55.166435       1 static_autoscaler.go:393] Scale down status: unneededOnly=false lastScaleUpTime=2019-09-26 21:42:40.908059094 ...
  I0926 23:15:55.166458       1 static_autoscaler.go:403] Starting scale down
  I0926 23:15:55.166488       1 scale_down.go:706] No candidates for scale down
```

## Deployment Considerations

- Xem xét các cân nhắc phía dưới sau để tối ưu CA deployment của bạn.

### Scaling consideration

- CA có thể cấu hình với bất kỳ tính năng thêm nào cho node của bạn. Những tính năng này như thêm Amazon EBS volumes attach vào nodes. EC2 instance type of node, hay GPU accelerators.

- `Scope node groups` tới nhiều hơn một AZ:

  - AWS khuyến khích chúng ta cấu hình nhiều node groups, mỗi node groups trên một AZ, và enable tính năng `--balance-similar-node-groups`. Nếu bạn chỉ cấu hình một node group, cấu hình node group này có thể mở rộng trên nhiều AZ.

- Tối ưu các node group của bạn: CA đưa ra giả định về cách bạn đang sử dụng các node groups. Bao gồm cả instance type mà bạn đang sử dụng group. Để phù hợp với những giả định này, cấu hình node group của bạn dựa trên những giả định và cân nhắc sau:

  - Mỗi node trong node group phải có các thuộc tính lập lịch giống hệt nhau. Bao gồm labels, taints, và các tài nguyên:

    - Với `MixedInstancePolicies`, instance type phải có thông số kỹ thuật CPU, memory, GPU tương thích.
    - Instance type đầu tiên được mô phỏng trong lập lịch ( thực sự ko hiểu câu này :)) )
    - Nếu chính sách của bạn có add thêm resource. Resource đó có thể bị lãng phí sau khi được scale out.
    - Nếu chính sách của bạn là thêm instance type với ít tài nguyên hơn, pod có thể lỗi khi được lập lịch khi chạy trên instance này.

  - Cấu hình số lượng node group nhỏ hơn nhu cầu node group. Vì điều ngược lại có thể ảnh hưởng tiêu cực tới khả năng mở rộng.

  - Sử dụng tính năng của AWS EC2 khi cả hai nhà cung cấp (?) hỗ trợ chúng ( ví dụ: sử dụng Region, `MixedInstancePolicy`)

  - Nếu có thể AWS khuyến khích người dùng xem [Managed node groups](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html). Managed node group có những tính năng quản lý mạnh mẽ. Bao gồm cả các tính năng cho CA như tự động Amazon EC2 ASG( auto scaling group) discovery và graceful node termination.

- Sử dụng EBS như persistent storage:

  - Lưu trữ dữ liệu là rất quan trọng với các ứng dụng stateful, ví dụ như database và cache phân tán ( distrubuted cache). Với Amazon EBS, bạn có thể xây dựng ứng dụng stateful trên k8s. Nhưng bạn bị giới hạn chỉ build chúng trong một AZ. Chi tiết có thể xem tại: [How do I use persistent storage in Amazon EKS](https://aws.amazon.com/premiumsupport/knowledge-center/eks-persistent-storage/). Để có giải pháp tốt hơn, xem xét xây dựng ứng dụng stateful chia nhỏ giữa các AZ bằng cách sử dụng các EBS riêng biệt cho từng AZ. Làm như vậy ứng dụng của bạn sẽ có tính sẵn sàng cao. Hơn nữa, CA có thể cân bằng mở rộng giữa các EC2 ASG. Để làm được như vậy hãy đảm bảo các điều sau được đáp ứng:

    - Cân bằng giữa các node groups được enable bởi cấu hình: `balance-similar-node-groups=true`.
    - Các node group của bạn được cấu hình giống hệt nhau. (ngoài việc phân bố giữa các AZ, và sử dụng các EBS khác nhau).

- Co-scheduling

  - Các job training học máy phân tán ( Machine learning distributed) hưởng lợi đáng kể từ độ trễ nhỏ của các node cấu hình cùng một AZ. Những khối lượng công việc này được tải lên các pod trong cùng một khu vực. Bạn có thể làm được điều này bằng cách cấu hình `pod affinity` cho tất cả các pod có cùng lập lịch hoặc các node affinity sử dụng `topologyKey: topology.kubernetes.io/zone`. Sử dụng cấu hình này CA mở rộng theo chiều ngang trên một Zone cụ thể để đáp ứng yêu cầu. Chỉ định nhiều ASG với một AZ cụ thể, để đảm bảo chuyển đổi dự phòng `failover` cho toàn bộ khối lượng công việc được lập lịch đồng thời. Đảm bảo các điều kiện sau được đáp ứng:

    - Cân bằng node group được enable bởi cấu hình: `balance-similar-node-groups=true`

    - [Node affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity), [pod preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/), hoặc cả hai, được sử dụng khi cluster bao gồm Regional và Zonal node groups:
      - Sử dụng `node affinity` để áp đặt hoặc khuyến khích regional pods và tránh Zonal node groups.
      - Đừng lập lịch Zonal pod vào một Regional node group. Làm vậy có thể dẫn tới mất cân bằng sức chứa cho các Regional pods của bạn.
      - Cấu hình `pod preemption` nếu zonal workloads có thể chấp nhận gián đoạn và phân bổ lại. Làm vậy thực thi quyền ưu tiên và lên lịch lại tại một khu vực ít tranh chấp hơn, cho các Regional pod của bạn.

- Accelerators and GPUs

  - Một vài cluster có các phần cứng cụ thể ví dụ như GPU. Khi mở rộng (theo chiều ngang - scale out ( not scale up)) cần thời gian để cung cấp tài nguyên cho cluster. Trong suốt khoảng thời gian đó CA mô phỏng như node có `accelerator` - (ko biết dịch sao cho sát nghĩa :) ). Tuy nhiên, cho tới khi `accelerator` sẵn sàng và cập nhật tài nguyên sẵn có của node, thì các pods không thể được lên lịch trên node. Điều này có thể là nguyên nhân của [repeated unnecessary scale out](https://github.com/kubernetes/kubernetes/issues/54959)

  - Các node với `accelerators` và mức sử dụng CPU, memory cao không được xem xét để scale down ngay cả khi `accelerators` không được sử dụng. Ngược lại điều này lại có thể là nguyên nhân của chi phí không cần thiết. Để tránh những chi phí này, CA có thể áp dụng những rule đặc biệt xem xét scale down node, nếu chúng có những `accelerators` không được sử dụng.

  - Để đảm bảo những hành vi đúng trong các trường hợp này, cấu hình `kubelet` trên `accelerator nodes` của bạn gán nhãn node trước node join vào cluster. CA sử dụng nhãn lựa chọn này để tối ưu hóa `accelerator`. Đảm bảo các điều kiện sau thỏa mãn:

    - `kubelet` cho GPU nodes được cấu hình với `--node-labels k8s.amazonaws.com/accelerator=$ACCELERATOR_TYPE`
    - Các node với `accelerators` tuân thủ các quy tắc lập lịch thống nhất.

- Scaling from Zero

  -
