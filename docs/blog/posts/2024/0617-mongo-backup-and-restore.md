---

authors:

- PaPu
  categories:
- devops
  date: 2024-06-17
  draft: false

---

# mongo backup and restore

- Để backup và restore data trên mongodb chúng ta có nhiều cách, một trong số đó là tool sẵn có của mongo: `mongodump` và `mongorestore` hoặc `mongoexport` và `mongoimport`

- Có một chút khác nhau giữa 2 bọn này cần lưu ý.
<!-- more -->

## `mongodump` và `mongorestore` VS `mongoexport` và `mongoimport`

- Luôn luôn ưu tiên dùng: `mongodump` và `mongorestore`:
  - Hai thằng này nhanh hơn: khi import BSON(định dạng mongodump và mongorestore hỗ trợ) nhanh hơn JSON (định dạng mongoexport và mongoimport hỗ trợ)
  - Bảo toàn dữ liệu tốt hơn: vì ko cần chuyển từ BSON sang JSON và ngược lại
  - Tránh dùng `mongoexport` và `mongoimport` khi full backup (backup data của cả instance). Không đảm bảo thất cả các kiểu dữ liệu BSON, vì JSON chỉ có thể biểu thị một tập con của các loại được BSON hỗ trợ
- Cho full-backup nên dùng `mongodump` và `mongorestore`, một vài trường hợp `mongorestore` sẽ ko hoạt động ví dụ như thêm 1 phần dữ liệu vào collection kiểu timeseries, sẽ không được do 1 số rằng buộc -> lúc này có thể xem xét sử dụng `mongoexport` và `mongoimport`

- Tham số password trong các tool này (-p trong các command phía dưới) nên được đặt trong `single quote` : `'` . Nguyên nhân do có 1 số ký tự đặc biệt có thể có trong trường password ( và dùng double quote sẽ vẫn bị lỗi).
- `mongodump` và `mongoexport` có hỗ trợ -q (query) để lấy ra 1 phần dữ liệu ( thay vì toàn bộ collection), query cần để trong single quote , các option bên trong để double quote, `ObjectId` cần đổi về `$oid`. Ví dụ:

```
-q='{"m.suId": {"$oid": "6508c8e2d160580011f0ad26"}, "m.orgId": {"$oid": "64f9f85c6771cb0011fcc822"}, "m.type": "avgTemp"}'
```

## Backup

### mongodump:

- Command format:

```sh
mongodump --authenticationDatabase=<authen_database> -u=<user> -p='<password>' --host=<mongo_domain>:<mongo_port> -d=<database> -c=<collection> -q='<query>'
```

### mongoexport:

- Command format:

```sh
mongoexport --authenticationDatabase=<authen_database> -u=<user> -p='<password>' --host=<mongo_domain>:<mongo_port> -d=<database> -c=<collection> -q='<query>' --out=<collection.json>
```

## Restore

### mongorestore

- Command format:

```sh
mongorestore -u <user_name> --password <supper_secret_password> --authenticationDatabase admin --host <mongo_URI>:<mongo_port> -d <database> -c <collection> <path_to_bson_file>
```

### mongoimport

- Command format:

```sh
mongoimport -u <user_name> -p '<supper$ecret_pass>' --authenticationDatabase admin --host <db_uri>:<db_port> -d <database> -c <collection> <path_to_json_file>
```

- YEAH mấy lưu ý vậy thôi **_HAPPY WORKING_**
