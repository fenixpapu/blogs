# Jenkins for dummies

- Nhân tiện có ticket liên quan jenkins nên mình lưu lại một số ghi chú trong quá trình tìm hiểu để sau cần thì lục lại cũng nhanh hơn.

## Jenkins on docker

- Devops cũng như dev ngoài môi trường `dev`, `qa`, `pre`, `prod`, có một môi trường local vẫn luôn là tiện nhất. Hoặc trong trường hợp Jenkins dùng chung giữa `qa` và `prod` thì nếu được, test local là tốt nhất.

- Chạy jenkins local với lệnh (đổi image tag bạn cần):

```linenums="1"
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:2.414.1-lts-jdk11
```

- Sau khi container run bạn sẽ có một jenkins local. Để check password của container có thể dùng lệnh dưới ( mặc định sẽ là `admin/admin`):

```linenums="1"
docker exec -it <container_id> cat /var/jenkins_home/secrets/initialAdminPassword
```

- Sau khi jenkins up có một số đường link trong jenkins chúng ta vừa dựng có thể hữu ích trong quá trình viết pipeline (thay localhost với domain tương ứng nếu bạn mapping jenkins với domain)
  - Doc api: http://localhost:8080/api
  - Check pipeline syntax với: http://localhost:8080/pipeline-syntax/
  - Từ pipeline syntax trên chúng ta có thể check cả [global variables references](http://localhost:8080/pipeline-syntax/globals) hay [steps reference](http://localhost:8080/pipeline-syntax/html)

## Some useful links

- Nếu có thời gian nên đọc quan [using jenkins](https://www.jenkins.io/doc/book/using/)

  - Hoặc [best practice](https://www.jenkins.io/doc/book/using/best-practices/)

- Để viết jenkins pipelines nên tham khảo: [pipeline](https://www.jenkins.io/doc/book/pipeline/):
  - Doc cung cấp cái nhìn tổng qua ( dễ hiểu) về pipeline, các cách viết: Declarative và scripted pipeline
  - Sự khác nhau giữa freestyle và pipeline trong jenkins (ví dụ như cùng đang chạy giữa trừng mà bị ngắt thì pipeline sau đó có thể tiếp tục lại nhưng freestyle thì không).
  - Một số thứ mình ko test được ( cũng ko có thời gian check tại sao :D) ví dụ như chạy pipeline với agent là docker (như này là docker trong docker)
- Ngoài ra admin, devops nên tham khảo qua link:
  - [managing jenkins](https://www.jenkins.io/doc/book/managing/)
  - Hoặc backup/restore jenkins [system administration](https://www.jenkins.io/doc/book/system-administration/)
- Có thể tham khảo [pipeline syntax reference](https://www.jenkins.io/doc/book/pipeline/syntax/)

- _CHẮC CHẮN NÊN THAM KHẢO LINK [PIPELINE STEPS REFERENCE](https://www.jenkins.io/doc/pipeline/steps/)_ : vì chúng ta thường ko viết pipeline thuần mà thường cần tích hợp với các plugin.
  - Ví dụ muốn dùng jenkins pipeline với jira plugin để trigger workflow action của Jira check trong doc: [Jira: Progress issues by workflow action](https://www.jenkins.io/doc/pipeline/steps/jira/#stepclass-jiraissueupdatebuilder-jira-progress-issues-by-workflow-action)
  - Code ví dụ cho đoạn trên sẽ ntn (đoạn này cần biết chút về jira workflow ^^):

```linenums="1"
step([
    $class: "JiraIssueUpdateBuilder",
    jqlSearch: "project=PROJECT_NAME AND status='Ready for QA Release' AND component=iOS",
    workflowActionName: "Deployed to QA",
    comment: "Move any iOS issues that are marked as 'Ready for QA Release' to 'Ready For QA'."
])
```

- Link [github](https://jenkinsci.github.io/jira-steps-plugin/steps/version/jira_new_version/) này có các code ví dụ dễ hiểu hơn, nhưng có vẻ chưa đầy đủ lắm( tham khảo được).
- Share variables trong Jenkins có thể tham khảo link [youtube](https://www.youtube.com/watch?v=41uUsWQjKRw), có 2 phần cho declarative và scripted.

## My opinion

- Quan điểm cá nhân mình (dùng github action và gitlab ci) mình thấy jenkins tiện nhưng hơi tù hay do nó quá rộng nên ko đồng bộ ? ( ngày nào đó thấy sai thì sẽ quay lại đây sửa lại nhận xét này ^^).

- Ví dụ với [plugin jira](https://plugins.jenkins.io/jira/) nếu dùng freestyle ( trong giao diện web) của Jenkins ở phần `Post-build Actions` mình có thể dùng `Jira: Move issues matching JQL to the specified version` để assign tất cả issues match với JQL vào một release version nhất định. Nhưng tìm muốn lòi mắt với cách code pipeline để làm mà ko thấy :( (Doc PIPELINE STEPS REFERENCE trên cũng ko có).

- Anyway: HAPPY WORKING :D
