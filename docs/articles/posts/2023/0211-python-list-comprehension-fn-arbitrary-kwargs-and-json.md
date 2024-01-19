---
authors:
  - PaPu
categories:
  - devops
  - python
  - dev
date: 2023-02-11
draft: false
---

# Python take notes about list comprehension, function arbitrary kwargs and json

- Năm năm trước (2017 - lúc đó network engineer) đọc python mình thấy có một số thứ vẫn còn hay bị quên. Những thứ này chỉ có ở python mà quên thì đôi khi đọc code thường hay lấn cấn. Nên giờ muốn học lại python viết luôn bài này note lại luôn cho nhớ :D

<!-- more -->

## List comprehension

- List comprehension thường là cú pháp ngắn hơn khi muốn tạo một list từ một list đã tồn tại.
- Cách thông thường nếu ko dùng `list comprehension`:

```python linenums="1"
fruits = ["apple", "banana", "cherry", "kiwi", "mango"]
newlist = []

for x in fruits:
  if "a" in x:
    newlist.append(x)

print(newlist)

```

- Nếu viết theo cách của `list comprehension` chúng ta đôi khi chỉ cần dùng một dòng code cho đoạn tạo list:

```python linenums="1"
fruits = ["apple", "banana", "cherry", "kiwi", "mango"]

newlist = [x for x in fruits if "a" in x]

print(newlist)
```

- Syntax của nó như này:

```linenums="1"
newlist = [expression for item in iterable if condition == True]
```

## Function kwargs

- `Parameter` là tên tham số khi định nghĩa function.
- `Argument` là giá trị truyền vào khi function được gọi.

```python linenums="1"
def sum(a, b): # a and b are parameter
  return a + b

sum(3,4) # 3, 4 are argument
```

### Arbitrary Arguments \*arg

- Khi không biết số lượng biến sẽ truyền vào ta dùng `*args`, function sẽ nhận vào một [tuple](https://www.w3schools.com/python/python_tuples.asp) và có thể truy cập arg như một array

```python linenums="1"
def my_function(*kids):
  print("The youngest child is " + kids[2])

my_function("Emil", "Tobias", "Linus")
```

### Keyword Arguments

- Truy cập theo cặp key - value

```python linenums="1"
def my_function(child3, child2, child1):
  print("The youngest child is " + child3)

my_function(child1 = "Emil", child2 = "Tobias", child3 = "Linus")
```

### Arbitrary Keyword Arguments, \*\*kwargs

- Khi không biết bao nhiêu cặp key-value sẽ được truyền vào ta dùng `**`. Function sẽ nhận vào một [dict](https://www.w3schools.com/python/python_dictionaries.asp)

```python linenums="1"
def my_function(**kid):
  print("His last name is " + kid["lname"])

my_function(fname = "Tobias", lname = "Refsnes")
```

## JSON

- Để xem chi tiết hơn về json trong python có thể xem [tại đây](https://www.w3schools.com/python/python_json.asp)
- Trong bài này mình chỉ note lại một số thứ cá nhân mình thấy hay dùng và đã từng phải search ( do không quen giữa json trong python và json trong javascript).
- Không giống như javascript muốn truy cập như kiểu key-value trong json thì cần parse sang dict với `json.loads`

```python linenums="1"
import json

# some JSON:
x =  '{ "name":"John", "age":30, "city":"New York"}'

# parse x:
y = json.loads(x)

# the result is a Python dictionary:
print(y["age"])
```

- Ngược lại muốn convert python object ( bao gồm cả: dict, list, tuple, string, int, float, True, False, None) thì cần dùng `json.dumps`

```python linenums="1"
import json

# a Python object (dict):
x = {
  "name": "John",
  "age": 30,
  "city": "New York"
}

# convert into JSON:
y = json.dumps(x)

# the result is a JSON string:
print(y)
```

- Chúng ta hoàn toàn có thể format và sort `json.dumps` với:

```python linenums="1"
json.dumps(x, indent=4, sort_keys=True)
```

- Bài này tới đây thôi đã.
- HAPPY CODING!!!
