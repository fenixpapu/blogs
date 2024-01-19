# python fastapi sse

## Before start

- Với nodejs chúng ta có `sse` để gửi noti. Nhưng muốn improve python nên mình tìm cách gửi noti bằng python.

- Google sẽ ra một số cách với flask api hoặc dùng phần mềm bên thứ 3. Nhưng mình muốn dùng với `fast-api` và là lib như sse của nodejs.

- Search 1 hồi thì thấy có: `sse-starlette` thấy có mỗi mấy start trên github hơi nghi nghi :D nhưng thôi cứ thử.

- Cần phân biệt: [starlette](https://github.com/encode/starlette) và [sse-starlette](https://github.com/sysid/sse-starlette) nhé, trong bài này đang dùng `see-starlette`

- Bài này chỉ ví dụ về cách tạo thôi còn chi tiết cách dùng (chia channel để push noti) cần phải nghiên cứu thêm.

## Source code

- Thêm các gói phụ thuộc trong: `requirements.txt` với nội dung:

```python linenums="1"
sse-starlette==1.6.5
fastapi==0.103.2
uvicorn==0.23.2
```

- Tạo virtual env:

```python linenums="1"
python3 -m venv venv

# activate venv
source venv/bin/activate
```

- Cài đặt các gói phụ thuộc:

```python linenums="1"
pip3 install -r requirements.txt
```

- Add source code trong file: `main.py`

```python linenums="1"
import asyncio
from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse

MESSAGE_STREAM_DELAY = 5  # second
app = FastAPI()


@app.get('/')
async def message_stream(request: Request):

    def new_messages():
        return True

    async def event_generator():

        while True:
            # If client was closed the connection
            if await request.is_disconnected():
                break

            # Checks for new messages and return them to client if any
            if new_messages():
                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "data": "message_content"
                }

            await asyncio.sleep(MESSAGE_STREAM_DELAY)

    return EventSourceResponse(event_generator())
```

## Test

- Done giờ thì start server rồi test thôi:

```linenums="1"
uvicorn main:app --reload
```

- Sau đó thử truy cập local port 8000 với curl nó sẽ ntn:

```linenums="1"
$ curl localhost:8000
id: message_id
event: new_message
data: message_content

id: message_id
event: new_message
data: message_content

id: message_id
event: new_message
data: message_content

: ping - 2023-10-18 02:52:59.560547

id: message_id
event: new_message
data: message_content
```

- TADA như vậy là xong cứ 5s message sẽ được push 1 lần và nếu để ý bạn thấy: `ping - 2023-10-18 02:52:59.560547` cứ 15s được gửi 1 lần để giữ kết nối. (ko bị disconnect bởi các cơ chế timeout)

- Chi tiết hơn về việc bao lâu gửi ping và cách noti theo channel cần được tìm hiểu thêm khi sử dụng thực tế.

### HAPPY CODING!!! :D
