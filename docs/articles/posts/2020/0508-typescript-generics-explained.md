---
authors:
  - PaPu
categories:
  - dev
date: 2020-05-08
draft: false
---

# [Typescript Generics Explained](https://medium.com/@rossbulat/typescript-generics-explained-15c6493b510f)

- Đây là bài dịch với mục đích tìm hiểu và thực hành về typescript. Link bài gốc trên tiêu đề :)

## Generics: the ability to abstract types

- Triển khai `generics` trong Typescript cho phép chúng ta khả năng truyền một loạt các kiểu vào một `component`, thêm một lớp mở rộng và tái sử dụng code. `Generics` có thể được áp dụng trong `functions`, `interfaces` và `classes` trong Typescript.

- Bài này sẽ giải thích `generics` là gì và tại sao chúng có thể được sử dụng cho các mục này,

### The Hello world of Generics

- Để demo ý tưởng của `generics` một cách đơn giản, cùng xem hàm ví dụ sau, `identity()`, hàm này nhận một tham số và trả về tham số đã nhận:

```javascript linenums="1"
function identity(arg: number): number {
  return arg;
}
```

- Mục đích của hàm `identity` đơn giản là trả về đối số chúng ta truyền vào. Vấn đề đây là chúng ta gán kiểu dữ liệu `number` cho cả `đối số` và giá trị `trả về`, function sau đó chỉ có thể sử dụng với kiểu dữ liệu `number` này - function có vẻ không được expand lắm - hoặc nó chính là điều chúng ta mong muốn.

- Thực sự thì chúng ta có thể chuyển `number` thành `any`, nhưng trong process chúng ta đang mất đi khả năng định nghĩa kiểu dữ liệu nên được trả về, và giảm tải cho trình biên dịch.

- Điều chúng ta thực sự muốn là `identity()` hoạt động với bất kỳ kiểu dữ liệu nào và sử dụng `generics` có thể giải quyết bài toán này. Bên dưới là cùng một function, lần này `kiểu dữ liệu của biến (type variable)` được thêm vào:

```javascript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}
```

- Sau tên hàm chúng ta thêm kiểu dữ liệu của biến `T`, trong đóng mở ngoặc nhọn `< >`. `T` đang giữ chỗ cho kiểu dữ liệu chúng ta muốn truyền vào `indetity`, và nó được gán cho kiểu dữ liệu của `arg`: thay vì `number`, `T` bây giờ đóng vai trò như một type.

- **Note**: Kiểu dữ liệu của các biến được tham chiếu như `type parameters` và `generic parameters`. Bài này sử dụng thuật ngữ type variables, tương ứng với documentation của Typescript official.

- `T` viết tắt của Type, và cũng thường được sử dụng như kiểu dữ liệu của biến đầu tiên khi định nghĩa generics. Nhưng trong thực tế `T` có thể được thay thế với bất kỳ tên hợp lệ nào. Không chỉ vậy, chúng ta không bị giới hạn với chỉ một kiểu biến - chúng ta có thể mang bao nhiêu kiểu chúng ta muốn định nghĩa. Thử với `U` và `T` mở rộng hàm của chúng ta:

```javascript linenums="1"
function identities<T, U>(arg1: T, arg2: U): T {
  return arg1;
}
```

- Giờ chúng ta có một `identities()` hỗ trợ hai kiểu dữ liệu, thêm một kiểu `U` type. Nhưng vẫn trả về type `T`. Hàm của chúng ta giờ đủ thông minh để truyền vào 2 kiểu dữ liệu trả về một kiểu dữ liệu của `arg1`.

- Nhưng nếu chúng ta muốn trả về một object với cả hai loại? Có nhiều cách để làm việc này. Có thể làm với `tuple`, như này:

```javascript linenums="1"
function identities<T, U>(arg1: T, arg2: U): [T, U] {
  return [arg1, arg2];
}
```

- Hàm `identities` của chúng ta giờ trả về một `tuple` bao gồm một tham số `T` và một tham số `U`. Tuy nhiên, rất có thể trong mã của bạn sẽ muốn cung cấp một `interfaces` thay thế cho `tuple` (bộ dữ liệu), để code bạn trở nên dễ đọc hơn.

### Generic Interfaces

- Việc này mang chúng ta tới `generic interfaces`; cùng tạo một generic `Identites` interface để sử dụng với `identities()`:

```javascript linenums="1"
interface Identities<V, W> {
  id1: V;
  id2: W;
}
```

- Tôi sử dụng `V` và `W` như kiểu dữ liệu của biến để demo cho bất kỳ chữ cái nào (hoặc kết hợp hợp lệ của các chữ cái), ko quan trọng bạn gọi chúng.

- Chúng ta có thể áp dụng interface này như giá trị trả về cho `identities()`, sửa đổi giá trị trả về để tuân thủ. Dùng `console.log` để in ra tham số và kiểu dữ liệu của chúng để làm rõ:

```javascript linenums="1"
function identities<T, U>(arg1: T, arg2: U): Identities<T, U> {
  console.log(arg1 + ": ", +typeof arg1);
  console.log(arg2 + ": ", +typeof arg2);

  let identities: Identities<T, U> = {
    id1: arg1,
    id2: arg2,
  };
  return identities;
}
```

- Những gì chúng ta đang làm với `identities()` là truyền vào kiểu `T` và `U` và interface `Identities`, cho phép chúng ta định nghĩa kiểu trả về liên quan tới kiểu dữ liệu truyền vào.

- **Note**: Nếu bạn biên dịch code Typescript của bạn và nhìn vào các generics, bạn sẽ không tìm thấy bất kỳ gì. Generics không được hỗ trợ bởi Javascript, bạn sẽ không thấy chúng trong bộ chuyển mã của bạn.

### Generic Classes

- Chúng ta có thể tạo ra một `class` generic trong `properties` và `methods` của class. Một generic class đảm baỏ rằng các kiểu dữ liệu cụ thể được sử dụng nhất quán trong toàn bộ class. Ví dụ, bạn có thể nhận ra quy ước sau trong các dự án React Typescript:

```javascript linenums="1"
type Pros = {
  className?: string
  ...
};

type State = {
  Submitted?: bool
  ...
};

class MyComponent extends React.Component<Props, State> {
  ...
}
```

- Chúng ta đang sử dụng `generics` ở đây với React components để đảm bảo props và state là nhất quán.

- Cú pháp generic của class tương tự như những gì chúng ta đã làm từ đầu tới giờ. Xem class dưới đây có thể quản lý nhiều kiểu của profile một lập trình viên:

```javascript linenums="1"
class Programmer<T> {
  private languageName: string;
  private languageInfo: T;

  constructor(lang: string) {
    this.languageName = lang;
  }
  ...
}

let programmer1 = new Programmer<Language.Typescript>("Typescript");
let programmer2 = new Programmer<Language.Rust>("Rust");

```

- Với class `Programmer`, `T` là kiểu dữ liệu cho ngôn ngữ lập trình, cho phép chúng ta gán các loại ngôn ngữ khác nhau. Mỗi ngôn ngữ chắc chắn có `metadata` khác nhau, và do đó cần kiểu khác nhau.

### A note on type argument inference

- Trong ví dụ trên chúng ta sử dụng ngoặc nhọn với các ngôn ngữ cụ thể, khi khởi tạo một `Programmer` mới, với cú pháp như sau:

```javascript linenums="1"
let myObj = new className() < Type > "args";
```

- Để khởi tạo class, trình biên dịch không thể đoán loại ngôn ngữ sẽ gán cho lập trình viên, bắt buộc cần truyền vào. Tuy nhiên, với function, trình biên dịch có thể đoán kiểu dữ liệu chúng ta muốn - đây cách các lập trình viên sử dụng.

- Làm rõ điều này, cùng tham chiếu tới `identities()` một lần nữa. Gọi hàm như này sẽ gán `string` và `number` cho kiểu `T` và `U`:

```javascript linenums="1"
let result = identities<stirng, number>("argument 1", 1000);
```

- Tuy nhiên, kiểu hay được dùng là để trình biên dịch tự chọn kiểu, làm code bạn nhìn sạch sẽ hơn. Chúng ta có thể bỏ sót ngoặc nhọn và viết lại hàm như dưới:

```javascript linenums="1"
let result = identities("argument 1", 1000);
```

- Trình biên dịch đủ thông minh để chọn kiểu của các tham số , và gán vào `T`, `U` không cần lập trình viên định nghĩa chúng.

- **Caveat**: Nếu chúng ta có một kiểu dữ liệu trả về mà không có tham số nào có kiểu như vậy. Trình biên dịch sẽ cần chúng ta chỉ rõ kiểu trả về.

### When to use generics

- Generics cho chúng ta cách gán kiểu an toàn cho các dữ liệu của các mục, nhưng không nên sử dụng như vậy trừ khi cách này có ý nghĩa, khi đơn giản hóa, tối ưu hóa code khi nhiều type đang được sử dụng.

- Các trường hợp không nên sử dụng fenerics, bạn sẽ thường tìm thấy bộ các `use case` trong codebase ở đây và phần lặp lại của code. Nhưng thường có hai tiêu chí khi chúng ta cần quyết định khi nào nên sử dụng generics:

  - Khi function, interface, hoặc class sẽ làm việc với nhiều kiểu dữ liệu.
  - Khi function, interface, hoặc class sử dụng kiểu dữ liệu này ở nhiều nơi.

- Cũng có thể component ban đầu không cần sử dụng generics. Nhưng khi project phình ra, component cũng mở rộng. Khi đó phù hợp với tiêu chí này.

- Chúng ta sẽ khám phá nhiều case hơn khi cả hai tiêu chí đạt được ở phần dưới bài này. Cùng khám phá một vài tính năng của generic trước khi khám phá các use case.

## Generic Constraints

- Đôi khi chúng ta muốn giới hạn số lượng kiểu dữ liệu với mỗi biến - và như tên của nó gợi liên tưởng - đây chính là thứ generics constraints làm. Chúng ta có thể sử dụng contrainst trong một vài cách như dưới:

### Using constraints to ensure type properties exist

- Đôi khi một kiểu generic sẽ yêu cầu một số thuộc tính tồn tại trên loại đó. Không chỉ vậy, trình biên dịch sẽ không phân biệt được thuộc tính cụ thể tồn tại, trừ khi chúng ta xác định rõ ràng để định nghĩa chúng.

- Ví dụ điển hình là khi là việc với string hoặc array khi thuộc tính `.length` là khả dụng. Lấy `identity()` làm ví dụ, và cố gắng in ra `length` của các tham số.

```javascript linenums="1"
// This will cause an error
function identity<T>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

- Trong trường hợp này compiler sẽ không biết rằng `T` cần có thuộc tính `.length`, đặc biệt bất kỳ loại nào có thể được gán cho `T`. Cái chúng ta cần là `extend` kiểu dữ liệu biến vào một `interface`. Nhìn như này:

```javascript linenums="1"
interface Length {
  length: number;
}

function identity<T extends Length>(arg: T): T {
  //length property can now be called
  console.log(arg.length);
  return arg;
}
```

- `T` bị hạn chế đang sử dụng `extends` theo sau bởi type chúng ta muốn mở rộng, bên trong ngoặc nhọn. Chúng ta đang nói với compiler răng chúng ta có thể hỗ trợ bất kỳ kiểu nào có trong `Length`.

- Giờ `compiler` sẽ cho phép chúng ta khi chúng ta gọi function với một kiểu không hỗ trợ `.length`. Không chỉ vậy, `.length` giờ được ghi nhận và có thể sử dụng.

- **Note**: Chúng ta cũng có thể mở rộng multiple type bằng cách ngăn cách bởi dấu `,`. E.g `<T extends Length, Type2, Type3>`.

### Explicitly supporting arrays

- Có giải pháp khác cho thuộc tính `.length` nếu chúng ta hỗ trợ kiểu mảng. Chúng ta có thể định nghĩa kiểu dữ liệu là một mảng, như dưới:

```javascript linenums="1"
// length is now recognised by declaring T as a type of array

function identity<T>(arg: T[]): T[] {
  console.log(arg.length);
  return arg;
}

//or
function identity<T>(arg: Array<T>): Array<T> {
  console.log(arg.length);
  return arg;
}
```

- Cả hai cách trên đều sẽ hoạt động, theo đó chúng ta cho phép compiler biết rằng `arg` và giá trị trả về của function sẽ là kiểu array.

### Using constraints to check an object key exists

- Trường hợp sử dụng tuyệt vời cho constraints là xác nhận key tồn tại trong object bằng cách sử dụng cú pháp `extends keyof`. Xem ví dụ dưới kiểm tra một key có tồn tại trong ojbect được chúng ta truyền vào hàm không ?

```javascript linenums="1"
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

- Tham số thứ nhất là object chúng ta sẽ lấy giá trị từ nó, tham số thứ hai là key của object này.Giá trị trả về mô tả mối quan hệ này với `T[K]`, dù hàm này hoạt động với mà không có kiểu trả về được xác định.

- Điều generics của chúng ta đang làm là đảm bảo `key` của object là tồn tại và không có lỗi trong thời gian thực thi xảy ra. Giải pháp kiểu an toàn (`type-safe`) này từ việc gọi gì đó như: `let value = obj[key]`.

- Từ giờ `getProperty` đơn giản để dùng, như trong ví dụ dưới để lấy một thuộc tính từ một đối tượng `typescript_info`:

```javascript linenums="1"
// the property we will get will be of type Difficulty

enum Difficulty {
  Easy,
  Intermediate,
  Hard
}

// defining the object we will get a property from

let typescript_info = {
  name: "typescript",
  supperset_of: "javascript",
  difficulty: Difficulty.Intermediate,
}

// calling getProperty to retrieve a value from typescript_info
let supperset_of: Difficulty =
  getProperty(typescript_info, 'difficulty');
```

- Ví dụ này cũng có thêm một `enum` để định nghĩa kiểu của thuộc tính `difficulty` mà chúng ta sẽ nhận được với `getProperty`.

## More Generic Use Cases

- Tiếp theo, chúng ta khám phá làm sao `generics` có thể sử dụng trong các trường hợp thực tế không thể thiếu.

### API services

- API services là trường hợp điển hình cho việc sử dụng `generics`, cho phép bạn bọc trình xử lý API của mình trong một `class`, và được gán đúng kiểu khi chúng được lấy từ các endpoint khác nhau.

- Lấy `getRecord()` làm ví dụ - class không nhận thức kiểu của record chúng ta sẽ nhận được từ service API của chúng ta, cũng không nhận thức được kiểu dữ liệu chúng ta đang truy vấn. Khắc phục vấn đề này, chúng ta dùng generics cho `getRecord()` như phần giữ chỗ cho giá trị trả về và kiểu giữ liệu truy vấn:

```javascript linenums="1"
class APIService extends API {
  public getRecord <T, U> (endpoint: string, params: T[]): U {}
  public getRecords<T, U> (endpoint: string, params: T[]): U[] {}
}
```

- Method generic của chúng ta giờ có thể chấp nhận bất kỳ kiểu nào của `params`, sẽ dùng để query API endpoint. `U` là giá trị trả về

### Manipulating arrays

- Generics cho phép chúng ta điều khiển kiểu các array. Chúng ta có thể muốn thêm hoặc xóa item từ dữ liệu nhân viên, như ví dụ dưới đây, sử dụng một biến chung cho lớp bộ phận (`Department`) và method `add`:

```javascript linenums="1"
class Department<T> {
  //different types of employees
  private employees: Array<T> = new Array<T>();

  public add (employee: T): void {
    this.employees.push(employee);
  }
}
```

- Class trên cho phép chúng ta quản lý các nhân viên bằng `department` - bộ phận, cho phép mỗi bộ phận và các nhân viên bên trong được định nghĩa bởi một kiểu cụ thể.

- Hoặc có lẽ bạn yêu cầu một hàm tiện ích chúng hơn để chuyển đổi một mảng thành một string được phân cách bởi các dấu phẩy.

```javascript linenums="1"
function arrayAsString<T>(names: T[]): string {
  return names.join(", ");
}
```

### Extending with classes

- Chúng ta đã thấy `generic constrains` được sử dụng với React để hạn chế `props` và `state`, nhưng chúng cũng có thể được sử dụng để đảm bảo thuộc tính của class là đúng định dạng. Lấy ví dụ như dưới đây, đảm bảo first và last name của một `Programmer` là được định nghĩa khi hàm yêu cầu chúng:

```javascript linenums="1"
class Programmer {
  //automatic constructor parameter assignment
  constructor (public fname: sttring, public lname: string) {

  }
}

function logProgrammer<T extends Programmer>(prog: T): void {
  console.log(`${prog.fname} ${prog.lname}`);
}

const programmer = new Programmer("Ross", "Bulat");
logProgrammer(programmer); // > Ross Bulat
```

**Note:** Constructor ở đây sử dụng tự động gán tham số cho constructor (`automatic constructor parameter assignment`), một tính năng của Typescript là gán trực tiếp thuộc tính của class từ đố số constructor.

- Thiết lập này thêm độ tin cậy và tính toàn vẹn cho các đối tượng của bạn. Nếu đối tượng `Programmer` của bạn được request với một API, và bạn yêu cầu các trường cụ thể, generic constraints sẽ đảm bảo tất cả sẽ có mặt tại thời điểm biên dịch.

## In Summary

- Để biết thêm thông tin về `generics`, tài liệu offical Typescript sẽ được cập nhật nhất [tại đây](https://www.typescriptlang.org/docs/handbook/generics.html) để tham chiếu cũng như các thông tin mở rộng hơn về các `use cases`.
