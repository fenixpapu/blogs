---
authors:
  - PaPu
categories:
  - python
  - dev
date: 2021-05-07
draft: false
---

# [Ý nghĩa dấu gạch dưới trong python](https://dbader.org/blog/meaning-of-underscores-in-python)

- Có nhiều ý nghĩa và các quy ước về single(`_`) và double underscores (`__` - `dunder`) trong python. Cách chúng hoạt
  động như thế nào và cách chúng tác dộng lên `classes` trong Python như thế nào.
- Trong Python: `_` và `__` có ý nghĩa trong tên biến và phương thức, một vài ý nghĩa đến từ quy ước và ý định như gợi ý cho lập trình viên - và một số thì thực sự được thực thi bởi trình thông dịch.
- Nếu bạn tự hỏi "Ý nghĩa của single và double underscores trong biến và phương thức của python"? Tôi sẽ cố
  gắng trả lời câu hỏi trong các phần dưới đây.

  <!-- more -->

- Trong bài này chúng ta sẽ thảo luận về 5 kiểu mẫu underscore và quy ước đặt tên và cách chúng tác
  động lên chương trình Python của bạn:

  - Single leading underscore(dấu `_` ở trước): `_var`
  - Single trailing underscore( dấu `_` ở cuối): `var_`
  - Double leading underscore(dấu `__` ở trước): `__var`
  - Double leading and trailing underscore (dấu `__` ở trước và sau): `__var__`
  - Single underscore(một mình): `_`

- Phần cuối cũng sẽ có cheatsheet tóm tắt 5 kiểu khác nhau trên. (Quan điểm người dịch - là tôi : hiểu rồi thì thôi cần mẹ gì
  cheat sheet cái này ngắn)

## Single leading underscore: `_var`

- Khi tên biến(variable) hay phương thức(method) có chứa 1 dấu gạch dưới `_` phía trước nó chỉ mang ý nghĩa
  duy nhất về mặt quy ước. Tức gọi ý cho các lập trình viên - và nó có nghĩa cộng đồng Python đồng ý nó nên
  mang ý nghĩa đó, nhưng nó không hề tác động đến cách thức chương trình của bạn hoạt động.
- Dấu `_` trước biến và phương thức để gợi ý cho lập trình viên khác biết biến hay phương thức này nên được
  dùng nội bộ. Quy ước này được định nghĩa trên [PEP8](https://pep8.org/#descriptive-naming-styles).

- Quy ước sử dụng nội bộ này không được thực thi bởi Python. Python không phân biệt rõ ràng giữa `private` và
  `public` như Java.
- Cùng xem ví dụ dưới đây:

```python linenums="1"
class Test:
    def __init__(self):
        self.foo = 11
        self._bar = 23
```

- Điều gì sẽ xảy ra nếu bạn khởi tạo object từ class Test và truy xuất tới `foo` và `_bar` được định nghĩa trong
  hàm khởi tạo `__init__` cùng thử nhé:

```python linenums="1"
>>> t = Test() >>> t.foo
11 >>> t.\_bar
23
```

- Bạn có thể thấy 1 dấu gạch dưới trong `_bar` không ngăn chúng ta vươn tới class và truy cập giá trị của biến này.
- Do 1 dấu gạch dưới của Python chỉ đơn thuần là một thỏa thuận - ít nhất là trong tên biến và phương thức.

- `Tuy nhiên dấu "_" lại có tác động tới tên import từ modules.` Tưởng tượng bạn có một module `my_module.py` như dưới đây:

```python linenums="1" title="my_module.py"
def external_func():
    return 23

def _internal_func():
    return 42
```

- Giờ nếu bạn sử dụng `wildcard import` để import tất cả các function từ module, Python sẽ không
  import function với tên có một dấu "\_" đằng trước ( trừ khi module đó định nghĩa một `__all__list` nó sẽ ghi đè hành vi này)

```python linenums="1"
>>> from my_module import *
>>> external_func()
23
>>> _internal_func()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name '_internal_func' is not defined
```

- Nhân tiện thì import \* thì nên được tránh vì nó khiến không rõ ràng những tên nào có trong namespace.
  Tốt hơn hết thì nên sử dụng cách import thông thường để được rõ ràng.
- Không giống như wildcard import, import kiểu thông thường không bị ảnh hưởng bởi dấu gạch dưới đằng trước tên:

```python linenums="1"
>>> import my_module
>>> my_module.external_func()
23
>>> my_module._internal_func()
42
```

- Ok! việc này có chút gây nhầm lẫn. Nhưng nếu bạn theo PEP8 khuyến nghị không dùng wildcard import, thì tất cả những gì bạn cần nhớ là:

```text linenums="1"
"_" - gạch dưới là một quy ước đặt tên trong Python chỉ ra một tên nên được sử dụng nội bộ. Việc này thường không
được thực thi bởi trình thông dịch Python và có tác dụng như một gợi ý cho lập trình viên.
```

## Single Trailing Underscore: `var_`

- Đôi khi cái tên phù hợp nhất cho một biến đã được sử dụng cho một từ khóa. Như `class` hay `def` không thể được sử dụng
  như tên biến trong Python. Trong trường hợp này bạn có thể thêm dấu "\_" ở cuối để tránh bị xung đột tên.

```python linenums="1"
>>> def make_object(name, class):
File "<stdin>", line 1
  def make_object(name, class):
                        ^
SyntaxError: invalid syntax
>>> def make_object(name, class_):
...     pass
...
```

- Tóm lại, một dấu gạch dưới phía sau (postfix) được sử dụng bởi quy ước nhằm tránh xung đột từ khóa của Python.
  Khuyến nghị này được giải thích trong [PEP8](https://pep8.org/#descriptive-naming-styles).

## Double Leading Underscore: `__var`

- Các cách đặt tên chúng ta đi qua ở trên chỉ đến từ các thỏa thuận. Với các thuộc tính ( attribute) trong class của Python (variables và methods) bắt đầu bằng hai dấu gạch dưới `__` sẽ có một chút khác biệt.

- Hai dấu gạch dưới phía trước sẽ là nguyên nhân trình thông dịch Python viết lại tên thuộc tính để tránh xung đột tên với các lớp con (subclasses).

- Đây cũng được gọi là `name mangling` - trình thông dịch thay đổi tên của biến theo cách làm cho nó khó hơn để bị xung đột khi class được mở rộng về sau.

- Tôi biết việc này nghe có vẻ trừu tượng. Đoạn mã nhỏ dưới đây sẽ làm rõ điều trên hơn:

```python linenums="1"
>>> class Test:
...     def __init__(self):
...             self.foo = 11
...             self._bar = 23
...             self.__baz = 23
```

- Giờ cùng xem thuộc tính của đối tượng sử dụng built-in `dir()` function:

```python linenums="1"
>>> t = Test()
>>> dir(t)
['_Test__baz', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_bar', 'foo']
```

- Lệnh này show cho chúng ta một danh sách các thuộc tính của object. Nhìn vào danh sách và tìm kiếm các tên biến của chúng ta: `foo`, `_bar`, và `__baz` - Chắc bạn sẽ chú ý tới một số thay đổi thú vị:

  - `self.foo` không thay đổi trong danh sách thuộc tính.

  - `self._bar` có vẻ cũng tương tự. Hiển thị trong danh sách class như `_bar`. Như đã nói ở trên một dấu `_` ở trước chỉ là quy ước trong trường hợp này. Một gợi ý cho lập trình viên.

  - Tuy nhiên, Whoop! `self.__baz`, có vẻ bị thay đổi. Khi bạn tìm `__baz` trong danh sách bạn sẽ không thấy biến nào có tên như vậy cả.

- Vậy điều gì đã xảy đến với `__baz`?

- Nhìn kỹ hơn bạn sẽ thấy một thuộc tính có tên `_Test__baz` trong object. Đây là một `name mangling - nói dối tên` mà trình biên dịch Python đã áp dụng. Nó làm vậy để bảo vệ biến khỏi bị ghi đè trong các lớp con.

- Cùng tạo một lớp khác mở rộng class Test và cố tình ghi đè các thuộc tính đã tồn tại được thêm trong hàm khởi tạo:

```python linenums="1"
>>> class ExtendedTest(Test):
...     def __init__(self):
...             super().__init__()
...             self.foo = 'overridden'
...             self._bar = 'overridden'
...             self.__baz = 'overridden'
```

- Giờ thì bạn nghĩ sao về giá trị của `foo`, `_bar`, và `__baz` sẽ có trong object của ExtendedTest. Thử kiểm tra xem:

```python linenums="1"
>>> t2 = ExtendedTest()
>>> t2.foo
'overridden'
>>> t2._bar
'overridden'
>>> t2.__baz
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'ExtendedTest' object has no attribute '__baz'
```

- Chờ đã, sao chúng ta lại nhận được lỗi `AttributeError` khi chúng ta cố gắng kiểm tra giá trị của `t2.__baz`? Nói dối tên(`name mangling`) đã chống lại một lần nữa! Nó làm cho obj này thậm chí còn không có thuộc tính `__baz`:

```python linenums="1"
>>> dir(t2)
['_ExtendedTest__baz', '_Test__baz', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_bar', 'foo']
```

- Như bạn thấy, `__baz` đã chuyển thành `_ExtendedTest__baz` để ngăn chặn một sự sửa đổi ngẫu nhiên:

```python linenums="1"
>>> t2._ExtendedTest__baz
'overridden'
```

- Nhưng biến `_Test__baz` vẫn ở đó ( không mất đi đâu cả mà lo):

```python linenums="1"
>>> t2._Test__baz
23
```

- Cách tên nói dối dunders là trong suốt với lập trình viên. Lấy ví dụ sẽ xác minh điều này:

```python linenums="1"
>>> class ManglingTest:
...     def __init__(self):
...             self.__mangled = "Hello"
...     def get_mangled(self):
...             return self.__mangled
...
>>> ManglingTest().get_mangled()
'Hello'
>>> ManglingTest().__mangled
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'ManglingTest' object has no attribute '__mangled'
>>>
```

- Liệu nói dối tên có áp dụng cho tên của phương thức ? Chắc chắn là có - nói dối tên (`name mangling`) tác động tới tất cả các tên (names) bắt đầu với hai dấu gạch dưới ("dunders") trong context của class:

```python linenums="1"
>>> class MangledMethod:
...     def __method(self):
...             return 42
...     def call_it(self):
...             return self.__method()
...
>>> MangledMethod().__method()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'MangledMethod' object has no attribute '__method'
>>> MangledMethod().call_it()
42
```

- Một thú vị khác, ví dụ hành vi của `name mangling`:

```python linenums="1"
>>> _MangledGlobal__mangled = 23
>>> class MangledGlobal:
...     def test(self):
...             return __mangled
...
>>> MangledGlobal().test()
23
```

- Ví dụ trên tôi khai báo biến toàn cục tên : `_MangledGlobal__mangled`. Sau đó tôi truy cập vào context của class có tên `MangledGlobal`. Vì `name mangling`mà tôi có thể tham chiếu tới biến toàn cục `_MangledGlobal__mangled` bên trong phương thức `test()` trên class.

- Trình biên dịch của Python tự động mở rộng tên (name) **mangled thành `\_MangledGlobal**mangled` do nó bắt đầu với "dunders". Việc này chứng tỏ rằng việc xáo trộn tên (`name mangling`) không chỉ rằng buộc các thuộc tính của class. Nó áp dụng cho bất kỳ tên nào với `dunders` được sử dụng trong một class.

- **Giờ mới có nhiều thứ để note lại đây^**

- Thành thật mà nói tôi không viết những thứ này trong đầu tôi ra. Nó đã làm tôi phải research và chỉnh sửa để có thể viết ra. Tôi đã sử dụng Python hàng vài năm trời nhưng những quy tắc và các case đặc biệt như thế này không thường xuyên xuất hiện trong tâm trí tôi.

- Nhiều khi điều quan trọng nhất với một lập trình viên là nhận dạng mẫu (`pattern recognition`) và biết nơi để tra cứu. Nếu bạn thấy hơi choáng ngợp vì điều này đừng lo lắng. Dành thời gian và chơi với các ví dụ trong bài.

- Khắc sâu các khái niệm này, bạn sẽ nhớ các ý tưởng chung của name mangling và một số hành vi mà tôi đã cho bạn thấy. Nếu bạn gặp chúng đâu đó ngoài tự nhiên (`"in the wild"`), bạn sẽ biết phải tìm kiếm chúng ở đâu.

## Double Leading and Trailing Underscores: `__var__`

- Có lẽ là điều đáng ngạc nhiên khi, `name mangling` sẽ không áp dụng nếu một tên _bắt đầu và kết thúc_ với dunders. Các biến được bao quanh bởi một dunders trước và sau sẽ không bị ảnh hưởng bởi trình thông dịch Python:

```python linenums="1"

class PrefixPostfixTest:
  def __init__(self):
    self.__bam__ = 42

PrefixPostfixTest().__bam__
42
```

- Tuy nhiên các biến, tên (name) có dunders cả trước và sau được dành cho mục đích đặc biệt trong ngôn ngữ. Quy tắc này bao gồm những thứ như `__init__` cho khởi tạo đối tượng , hay `__call__` trong tạo một lời gọi object.

- Những dấu dunders này thường được tham chiếu như những phương thức ma thuật (magic methods) - nhưng nhiều người trong cộng đồng Python, bao gồm cả tôi ( tác giả) và cả tôi ( thằng đang dịch bài này), không thích nó.

- Tốt nhất bạn nên tránh xa cách đặt tên mà bắt đầu và kết thúc với dunders trong chương trình của mình để tránh xung đột với thay đổi trong tương lại của ngôn ngữ Python.

## Single Underscore: `_`

- Theo quy ước, một dấu `_` đứng một mình đôi khi được sử dụng như một tên chỉ ra rằng biến này là tạm thời hoặc không quan trọng ( hoặc không được dùng).

- Ví dụ, trong vòng lặp chúng ta không cần truy cập đến biến đếm và chúng ta có thể sử dụng `_` để chỉ ra rằng đây là biến tạm thời:

```python linenums="1"
for _ in range(32):
  print("Hello, world")
```

- Chúng ta cũng có thể dùng `_` khi giải nén biểu thức khi muốn bỏ qua một giá trị. Một lần nữa, việc này chỉ là theo quy ước và không có sự đặc biệt nào trong trình thông dịch Python. `_` chỉ là một tên biến hợp lệ đôi khi được sử dụng cho mục đích này (biến `_` không được quan tâm hay ko sử dụng ).

- Như code dưới đây tôi sẽ giải nén tuple car thành các biến riêng biệt. Nhưng tôi chỉ quan tâm đến giá trị `color` và `mileage`. Tuy nhiên, để giải nén biểu thức thành công tôi cần gán tất cả các giá trị bên tuple vào các biến. Và `_` có giá trị như biến giữ chỗ:

```python linenums="1"
>>> car = ('red', 'auto', 12, 3812.4)
>>> color, _, _, mileage = car
>>>
>>> color
'red'
>>> mileage
3812.4
>>> _
12
>>> _
12
```

- Bên cạnh việc sử dụng như một biến tạm, `_` là một biến đặc biệt mà hầu hết Python REPLs đại diện cho kết quả của biểu thức cuối cùng được đánh giá bởi trình thông dịch.

- Việc này thật thuận tiện nếu bạn đang làm việc với một trình thông dịch và muốn truy cập vào kết quả cuối cùng của lần tính toán trước đó. Hoặc nếu bạn đang xây dựng các đối tượng và muốn tương tác với chúng mà không cần gán tên cho chúng trước:

```python linenums="1"
>>> 20 + 3
23
>>> _
23
>>> print(_)
23
>>> list()
[]
>>> _.append(1)
>>> _.append(2)
>>> _.append(3)
>>> _
[1, 2, 3]
>>>
```

## HAPPY CODING WITH PYTHON
