---
authors:
  - PaPu
categories:
  - devops
  - python
date: 2023-04-18
draft: true
---

# Upgrading PostgreSQL's enum type with Sqlalchemy using Alembic migration

- Bạn có thể xem bài gốc của tác giả [tại đây](https://makimo.pl/blog/upgrading-postgresqls-enum-type-with-sqlalchemy-using-alembic-migration/)

- Để đọc bài này nên biết một chút về sqlalchemy , alembic và fastapi.

<!-- more -->

## Mở đầu

- Mình dùng [fastapi](https://fastapi.tiangolo.com/) làm backend cho một project. Sqlalchemy làm ORM cho postgres và `alembic` để quản lý các version (upgrade, downgrade mỗi khi cần thay đổi cấu trúc dữ liệu).

- Ví dụ trong một table có cột `status` mình muốn kiểu dữ liệu là enum với 2 giá trị: `STARTED` và `ACCEPTED`. Tuy nhiên sau đó mình muốn thêm giá trị mới như: `CANCELLED` chẳng hạn.

- Thông thường việc bạn thêm cột vào model của sqlalchemy khi chạy alembic sẽ tự nhận diện được và thêm mới column. Nhưng với enum type thì không. Và bài này note lại các thêm giá trị cho kiểu enum trong postgres bằng alembic.

- Điều kiện bạn đã biết qua cách dùng sqlalchemy và alembic ( nếu chưa thì xem qua đã nhé). Có thể mình sẽ note lại một bài về fastapi, sqlalchemy và alembic sau :D

## Basic model
