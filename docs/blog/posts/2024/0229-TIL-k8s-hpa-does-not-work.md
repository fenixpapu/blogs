---
authors:
  - PaPu
categories:
  - devops
date: 2024-02-29
draft: false
---

# TIL k8s hpa does not work

Mình có test `deployment.yaml`, `hpa.yaml` tất cả đều hoạt động như mong đợi. CPU hoặc RAM vượt ngưỡng tự scale pod.

Nhưng giờ check lại trên prod khi metrics vượt ngưỡng, hpa đã scale (ghi nhận và scale), nhưng pod bị tắt ngay sau đó (chỉ kịp nhìn thấy `pending deletion`)

<!-- more -->

HPA đã ghi nhận và set replicas từ 3 lên 4:

```linenums="1" hl_lines="3"
$kubectl get hpa -n prod
NAME                 REFERENCE                   TARGETS           MINPODS   MAXPODS   REPLICAS   AGE
hpa-fastapi          Deployment/fastapi-app      3%/50%, 57%/50%   3         5         4          173
```

Check describe hpa ko hề có log gì đặc biệt ( tất cả đều bình thường).

```linenums="1" title="kubectl describe hpa hpa-fastapi"
# skipped content
Events:
  Type    Reason             Age                  From                       Message
  ----    ------             ----                 ----                       -------
  Normal  SuccessfulRescale  2s (x2 over 3m33s)   horizontal-pod-autoscaler  New size: 4; reason: memory resource utilization (percentage of request) above target
```

Đã loại trừ các khả năng:

- HPA lỗi: (vẫn scale bình thường, ko có log event gì đặc biệt)
- Resource trên node ko bị thiếu: default 3 pod scale lên 5. Mình đã thử default 5 luôn vẫn chạy như bình thường
- Container ko có vấn đề các pod vẫn chạy và log từ app đã start như bình thường (cả pod đang chạy và pod scale từ hpa)

Google 1 hồi thì thấy comment: `HPA ko xoá pod` -> TADA: vậy còn thằng nào đang handle replicas nữa nhỉ. Nhớ ra còn có argoCD. Như trong [câu hỏi này trên reddit](https://www.reddit.com/r/GitOps/comments/13d1fac/argocd_and_replicas_hpa/). ArgoCD monitor deployment file và khi thấy có sự khác biệt giữa deployment với hiện tại argocd lập tức set lại về giá trị ban đầu: Tức HPA scale up ví dụ từ 3 lên 5, 2 pods mới đang được tạo nhưng ArgoCD lại set ngược lại về 3 nên 2 pod mới được tạo bị xoá luôn. Có 2 cách có thể xem xét như dưới đây:

- [Comment replicas](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/#leaving-room-for-imperativeness) và argoCD sẽ ko theo dõi nữa, để phần quản lý hết cho HPA.
- Vẫn cùng ý tưởng nhưng khác cách làm ( cần check lại mình chưa thử): [cấu hình argoCD ignore 1 phần cụ thể](https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/)

Sau khi comment bỏ replicas trong deployment file. Mọi thứ lại hoạt động như mong đợi.

**_ HAPPY WORKING!!! _**
