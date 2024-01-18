# Lambda function reboot ec2

- Mình được asgin một task dùng lambda function để reboot ec2 vào mỗi thứ 2 đầu tuần. Có chút lăn tăn khi bắt đầu task này:
  - Trước đó có dùng nodejs viết lambda function rồi nhưng đợt rồi làm python nên lần này muốn dùng python thay vì nodejs.
  - Đã dùng nodejs nhưng là để call sang api khác làm schedule job chứ reboot ec2 thì chưa biết làm ntn (cwl)
- Éc lòng vòng 1 lúc task được asign cho cu em ( do mình phải làm task khác). Và bạn này có viết rồi nên mình học luôn. 
- Đoạn script như dưới:

  ```python
  import json
  import logging
  import datetime
  import boto3

  ##########
  # To reboot ec2 every Monday
  ##########

  ec2 = boto3.client('ec2')
  logging.basicConfig()
  logger = logging.getLogger('logger')
  logger.setLevel(logging.DEBUG)

  def reboot_ec2(instances):
      logger.info("Execute reboot instance '{0}'.".format(instances))
      try:
          response = ec2.reboot_instances(InstanceIds=instances)
          logger.debug(response)
          meta = response["ResponseMetadata"]
          logger.info("Reboot '{0}' with RequestId '{1}' and status {2}.".format(instances, meta["RequestId"],
                                                                                    meta["HTTPStatusCode"]))
      except Exception as error:
          logger.error(error)

  def get_valid_instances(instance_names, action):
      instances = []
      response = ec2.describe_instances(Filters=[
          {
              "Name": "tag:Name",
              "Values": instance_names
          }
      ])
      for reservation in response["Reservations"]:
          for instance in reservation.get("Instances"):
              status = instance.get("State", None).get("Name")
              if action == "reboot" and status == "running":
                  instances.append(instance["InstanceId"])

      logger.debug("ec2 '{0}' is going to be '{1}'.".format(instances, action))
      return instances


  def lambda_handler(event, context):
      instance_names = event.get("instanceNames", None)
      if instance_names is None:
          logger.error("Missing instanceNames.")
          exit(1)

      action = event.get("action", None)
      if action is None:
          logger.error("Missing action.")
          exit(1)

      instances = get_valid_instances(instance_names, action)
      
      if not instances:
          logger.warn("No instances to take action")
          exit(1)
      
      if "reboot" == action.lower():
          reboot_ec2(instances)
  ```

- Việc đầu tiên dễ nhận thấy là ồ script này dùng [Boto3](https://github.com/boto/boto3) để thao tác với EC2 - Boto3 is maintained and published by Amazon Web Services. Vậy là giải quyết được thắc mắc của mình: để thao tác với các tài nguyên của AWS có thể dùng qua SDK Boto3 này rồi - ngon luôn.

- Lần lượt đi qua các function:
  - `reboot_ec2`: log ra các instance IDs và reboot các EC2 từ Instance IDs của chúng, log ra nếu thành công hay lỗi.
  - `get_valid_instances`: lọc ra các ec2 đang chạy ( nếu ko phải running thì bỏ qua), và hành động yêu cầu phải đúng là `reboot` thì mới làm. Việc lọc dựa theo tên của ec2. Oh từ đã sao lại kiểm tra trạng thái ec2 theo tên mà ko phải ID, nhỡ người dùng nhập nhầm tên thì sao ?, ID chẳng phải chính xác hơn không ?. Mình hỏi cu em viết script này, câu trả lời khá thuyết phục. Mục đích dùng `tag:Name` cho mục đích khi chúng ta muốn reboot 1 lúc nhiều EC2 như ASG (Auto scaling group) chẳng hạn, khi đó phải dùng `tag:Name` vì chúng ta ko có instance ID cố định.
  - Function cuối cùng là: `lambda_handler`: Đây là tên function mặc định mà lambda sẽ gọi khi chạy. Chúng ta có thể thay đổi function name mặc định này ( tự google nhé).

- Cuối cùng là chúng ta có thê dùng `eventbridge` cũng của AWS để lập lịch cho việc chạy hàng tuần. Nếu bạn chưa rõ về crontab thì có thể test thử thêm [ở đây](https://crontab.guru/). Event schedule trên AWS mình setup như này: `cron(00 22 ? * SUN *)`. Và tham số truyền vào (input) thì có dạng như này(bạn có thể parse json để view cho dễ): `{"action": "reboot", "instanceNames": ["my_server_1", "my_server_2"]}`

- Cuối cùng lambda phải có quyền thì mới reboot ec2 được nhé. Ví dụ trong function này mình assign role có 2 permission: `AmazonEC2FullAccess` và `AWSLambdaFullAccess`.

- Role trên có trusted relationship như dưới:
  ```
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  ```
- Bạn có thể tạo thử ec2 nhỏ nhỏ để test :D

- Happy working! :D