# AWS auto start stop RDS

- Bài toán: Công ty có các môi trường dev, stg, pre, prd. Trừ prd cần always up, ngoài ra các môi trường khác mình thấy ban đêm để thì phí tài nguyên, và xếp có yêu cầu giảm cost nên mình viết lambda để tự động tắt RDS trên các môi trường non-prod khi ngoài giờ hành chính.
- Lúc đầu viết bằng python mà sau sếp bảo đổi sang nodejs cho cùng stack với dev team. Bài này sẽ note lại cả 2 ngôn ngữ.

- Tại thời điểm viết thằng chủ thớt viết bài này cả python và nodejs nó ko tìm được cách để list các rds instance, nên script sẽ cho điền tên instance vào ( ko biết có dummy quá ko :v)
- Bài này take note lại để lần sau mình chỉ việc copy & paste cho nhanh.

## Python

```python linenums="1"
import boto3
from datetime import datetime


def startStop(event, context):

  REGION = 'ap-southeast-1'  // region will be apply
  TAG_KEY = 'auto-start-stop'
  TAG_VALUE = 'true'

  dbs_need_start_or_stop = []
  filter = [{
    'Name':'db-instance-id',
    'Values':['RDS-instance-name1', 'RDS-instance-name2', 'RDS-instance-name3']
  }]

  client = boto3.client('rds', region_name=REGION)
  dbs = client.describe_db_instances(Filters=filter)['DBInstances']

  for db in dbs:
    for tag in db['TagList']:
      if tag['Key'].lower() == TAG_KEY and tag['Value'].lower() == TAG_VALUE:
        dbs_need_start_or_stop.append(db['DBInstanceIdentifier'])
  print('List will start or stop: ', dbs_need_start_or_stop)

  now = datetime.utcnow()
  hour = now.strftime("%H")
  if(int(hour) < 12): #  start in the morning at 02:00 AM UTC
    for db in dbs_need_start_or_stop:
      client.start_db_instance(DBInstanceIdentifier=db)
  else: # stop in the evening at 14:00 PM UTC
    for db in dbs_need_start_or_stop:
      client.stop_db_instance(DBInstanceIdentifier=db)
```

- Script này làm gì?
  - Tại thời điểm lambda được trigger, script loop qua tất cả các rds instances `dbs_need_start_or_stop` và check trạng thái.
  - Tuỳ thuộc theo thời gian được kích hoạt script sẽ biết nên tắt (stop) hay mở (start).
    - Thời gian trigger trước 12:00 UTC cụ thể sẽ được trigger 02:00 AM UTC -> (9:00 AM GMT +7 sáng ra thì bật RDS) cty mình 9:00 AM mới vào làm.
    - Thời gian trigger sau 12:00 UTC cụ thể 14:00 PM UTC -> stop service.
    - Phần schedule sẽ có note ở phía dưới.

## Nodejs

```javascript linenums="1"
import AWS from "aws-sdk";
AWS.config.update({ region: "ap-southeast-1" });
const TAG_KEY = "auto-start-stop";
const TAG_VALUE = "true";
const rds = new AWS.RDS();

const lambdaHandler = async () => {
  const dbsNeedStartOrStop: any[] = [];
  const filter = [
    {
      Name: "db-instance-id",
      Values: [
        "RDS-instance-name-1",
        "RDS-instance-name-2",
        "RDS-instance-name-3",
      ],
    },
  ];
  const response = await rds.describeDBInstances({ Filters: filter }).promise();
  const dbs = response["DBInstances"];

  for (const dbIndex in dbs) {
    const tags = dbs[dbIndex]["TagList"];
    for (const tagIndex in tags) {
      if (
        tags[tagIndex]["Key"].toLowerCase() == TAG_KEY &&
        tags[tagIndex]["Value"].toLowerCase() == TAG_VALUE
      ) {
        dbsNeedStartOrStop.push(dbs[dbIndex]["DBInstanceIdentifier"]);
      }
    }
  }

  const now = new Date().getUTCHours();
  console.log(
    `List DBs will ${now < 12 ? "start" : "stop"}: `,
    dbsNeedStartOrStop
  );
  if (now < 12) {
    // start in the morning at 02:00 AM UTC
    for (const dbIndex in dbsNeedStartOrStop) {
      await rds
        .startDBInstance({ DBInstanceIdentifier: dbsNeedStartOrStop[dbIndex] })
        .promise()
        .then(
          () => {
            console.log(`${dbsNeedStartOrStop[dbIndex]} started.\n`);
          },
          (err) => {
            console.log(
              `Failed when start: ${dbsNeedStartOrStop[dbIndex]} \nWith error: ${err}.\n`
            );
          }
        );
    }
  } else {
    // stop in the evening at 14:00 PM UTC
    for (const dbIndex in dbsNeedStartOrStop) {
      await rds
        .stopDBInstance({ DBInstanceIdentifier: dbsNeedStartOrStop[dbIndex] })
        .promise()
        .then(
          () => {
            console.log(`${dbsNeedStartOrStop[dbIndex]} stopped.\n`);
          },
          (err) => {
            console.log(
              `Failed when stop: ${dbsNeedStartOrStop[dbIndex]} \nWith error: ${err}.\n`
            );
          }
        );
    }
  }
};

export const startStop = lambdaHandler;
```

- Nodejs làm tương tự python: lúc được trigger sẽ check các rds và tuỳ thuộc vào thời gian sẽ biết cần start hay stop.
- Một chút khác là nodejs cần có đoạn `await` nếu ko sẽ chưa kịp tắt RDS , cay thật! : `await rds.stopDBInstance()..`

## Schedule

- Nếu dùng terminal để gen lambda thì cả python và nodejs sẽ đều cấu hình schedule trong file `serverless.yml` và cấu hình thời gian như nhau đều (riêng phần functions):

```linenums="1"
functions:
  startStop:
    handler: handler.startStop
    environment:
      DEBUG: middlewares:*
    events:
      - schedule:
          rate: cron(00 02 ? * MON-FRI *)  # 09:00 AM GMT+7
      - schedule:
          rate: cron(00 14 ? * MON-FRI *)  # 09:00 PM GMT+7
```

- Cấu hình trên sẽ:
  - start RDS vào 09:00 AM GMT +7 ( hay 02:00 AM UTC) vào tất cả các ngày trong tuần (từ thứ 2 đến thứ 6).
  - stop RDS vào 09:00 PM GMT +7 ( hay 02:00 PM UTC) vào tất cả các ngày trong tuần ( thứ 2 --> thứ 6).

## Note

- Với schedule trên đồng nghĩa thứ 7 và CN RDS sẽ ko auto start. Nên nếu có OT nhớ bật bằng tay lại.
