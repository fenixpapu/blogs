---
authors:
  - PaPu
categories:
  - dev
date: 2020-07-13
draft: false
---

# [Generics Typescript](https://www.typescriptlang.org/docs/handbook/generics.html)

- Bài này nên được dịch cẩn thận hơn. Dòng này sẽ được xóa khi đã chỉnh sửa lại.

## Introduction

- Một phần chính của kỹ sư phần mềm là xây dựng các components không chỉ được định nghĩa rõ ràng và các APIs thích hợp mà còn tái sử dụng được. Components có khả năng làm việc với dự liệu ngày hôm nay cũng như dữ liệu tương lai sẽ đưa cho bạn khả năng linh hoạt để xây dựng hệ thống phần mềm lớn.

- Với C# và Java, một trong các tools chính tạo ra các component tái sử dụng được là `generic`, thứ có khả năng tạo ra các component có thể làm việc với các kiểu dữ liệu khác nhau hơn là chỉ một loại.
<!-- more -->

## Hello World of Generics

- Để bắt đầu, cùng làm generic "hello world": hàm nhận dạng ( identity function). The identity function là hàm sẽ trả về bất cứ gì được truyền vào. Hình dung tương tự như `echo` vậy :D

- Không có `generics`, chúng sẽ sẽ phải đưa cho identity function một kiểu cụ thể:

```typescript linenums="1"
function identity(arg: number): number {
  return arg;
}
```

- Hoặc chúng ta cũng có thể mô tả với một `any` type:

```typescript linenums="1"
function identity(arg: any): any {
  return arg;
}
```

- Khi sử dụng `any` sẽ là nguyên nhân của function sẽ chấp nhận bất kỳ kiểu dữ liệu nào của `arg`, điều này thực sự làm mất thông tin kiểu dữ liệu mà hàm sẽ trả về là gì ? Nếu chúng ta truyền vào một số, thông tin duy nhất chúng ta có là bất kỳ kiểu dữ nào cũng có thể trả về. (Tại sao ư ví dụ như dưới)

```typescript linenums="1"
function identity(arg: any): any {
  return arg.toString();
}
```

- Thay vì vậy, chúng ta cần một cách để lưu giữ lại kiểu của tham số rồi sau đó suy ra được kiểu dữ liệu sẽ trả về. Ở đây, chúng ta sẽ sử dụng một `kiểu dữ liệu của biến`, một kiểu đặc biệt của biến làm việc trên kiểu dữ liệu hơn là giá trị của chúng :D

```typescript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}
```

- Chúng ta thêm một kiểu biến `T` vào function identity. `T` cho phép chúng ta lưu giữ kiểu dữ liệu được người dùng truyền vào ( ví dụ `number`), do đó chúng ta có thể dùng thông tin này về sau. Ở đây, chúng ta dùng `T` một lần nữa như kiểu trả về. Để kiểm tra, chúng ta có thể thấy cùng kiểu dữ liệu cho tham số truyền vào và giá trị trả về. Điều này cho phép chúng ta truyền tải thông tin kiểu dữ liệu trong function.

- Phiên bản trên của hàm `identity` ( sử dụng `T`) là một `generic function`, nó có thể làm việc mới một phạm vi các kiểu dữ liệu. Không giống như `any`, nó cũng chính xác như cách bạn sử dụng type `number` trong ví dụ đầu tiên.

- Một khi chúng ta viết hàm generic `identity`, chúng ta có thể gọi nó theo một trong 2 cách. Cách thứ nhất là truyền tất cả các tham số, bao gồm kiểu của tham số vào function:

```typescript linenums="1"
let output = identity<string>("myString"); //type of output will be 'string'
```

- Ở đây chúng ta thiết lập giá trị rõ ràng `string` cho `T` như tham số để gọi hàm, sử dụng ký hiệu `<>` bao quanh tham số hơn là `()`.

- Cách thứ hai thì phổ biến hơn.

```typescript linenums="1"
let output = identity("myString"); // type of output will be 'string'
```

- Chúng ta ko thiết lập giá trị cho `<>`, trình biên dịch sẽ tự kiểm tra giá trị của `"myString"`, và gán nó cho `T`. Với cách trên giúp code ngắn và dễ đọc hơn, đôi khi bạn cần gán giá trị cho tham số trong các trường hợp phức tạp hơn.

## Working with Generic Type Variables

- Cùng nhìn lại hàm `identity` trước đó:

```typescript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}
```

- Sẽ ra sao nếu chúng ta muốn log độ dài của đối số `arg`. Nó sẽ na ná như vầy :

```typescript linenums="1"
function logginIdentity<T>(arg: T): T {
  console.log(arg.length); // Error: T doesn't have .length | Confirmed đã test :v
  return arg;
}
```

- Khi làm như vậy, trình biên dịch sẽ đưa ra lỗi đang sử dụng `.length` của `arg`, nhưng không đâu nói rằng `arg` có thành phần này ( this member). Nhớ rằng, chúng tôi trước đó nói rằng kiểu của biến có thể là bất kỳ kiểu nào, do vậy ai đó có thể sẽ sử dụng function này có thể truyền `number`, kiểu dữ liệu chẳng hề có `length`.

- Giả dụ chúng ta thực tế muốn function này làm việc với mảng các `T` hơn là `T`. Vì chúng ta làm việc với mảng nên `.length` sẽ sẵn có.

```typescript linenums="1"
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length); // Array has a .length, so no more error
  return arg;
}
```

- Bạn có thể đọc kiểu của `loggingIdentity` như: "generic function `logginIdentity` nhận vào một kiểu tham số `T`, và một đối số `arg` là một mảng các `T`, và trả về một mảng các `T`". Nếu chúng ta truyền vào một mảng các số, chúng ta nhận một mảng các số, ( T được bind vào `number`). Điều này cho phép chúng ta sử dụng generic type variable `T`như một phần các kiểu chúng ta đang làm việc hơn là tất cả các kiểu, điều này tạo ra sự uyển chuyển hơn.

- Chúng ta có thể viết lại ví dụ trên như dưới:

```typescript linenums="1"
function loggingIdentity<T>(arg: Array<T>): Array<T> {
  console.log(arg.length); // Array has a .length, so no more error
  return arg;
}
```

## Generic Types

- Phần trước chúng ta tạo generic function `identity`, làm việc với nhiều kiểu dữ liệu. Trong phần này, chúng ta sẽ khám phá các kiểu của chính các function và làm cách nào tạo ra generic interfaces.

- Type của `generic function` giống như type của `non-generic funciton`, với kiểu dữ liệu tham số ( type parameters) được kiệt kê đầu tiên, tương tự như cách khai báo hàm:

```typescript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
```

- Chúng ta cũng có thể sử dụng tên khác cho generic type của parameter trong type:

```typescript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}
let myIdentity: <U>(arg: U) => U = identity;
```

- Chúng ta cũng có thể viết generic type như một `a call signature of an object literal type:` (tại hạ chưa dịch được chỗ này sát nghĩa :v)

```typescript linenums="1"
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity = {<T>(arg: T): T} = identity;
```

- Điều này dẫn chúng ta tới cách viết `generic interface` đầu tiên. Cùng lấy object từ ví dụ trên và chuyển thành một `interface`:

```typescript linenums="1"
interface GenericIdentityFn {
  <T>(arg: T): T;
}
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;
```

- In một ví dụ tương tự, chúng ta sẽ muốn rời `generic parameter` thành một parameter của toàn bộ interface. Điều này cho phép chúng ta thấy biết được các kiểu (type)(E.g `Dictionary<string>` hơn là chỉ `Dictionary`). Điều này giúp type parameter trở nên thấy được với tất cả các thành viên của interface.

```typescript linenums="1"
interface GenericIdentityFn<T> {
  (arg: T): T;
}
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

- Lưu ý rằng ví dụ của chúng ta mỗi bước thay đổi một chút. Thay vì mô tả một generic function, chúng ta giờ đây có một chữ ký non-generic function, cái là một phần của generic type. Khi chúng ta sử dụng `GenericIdentityFn`, chúng ta giờ đây cũng cần chỉ rõ kiểu của đối số (type argument) (ở đây là: `number`).

## Generic Classes

- Generic class có cùng dạng với generic interface. Generic class có một danh sách generic type parameter trong `<>` theo sao tên của classs

```typescript linenums="1"
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) {retur x + y;};
```

- Class `GenericNumber` không có gì giới hạn sử dụng kiểu `number`. Chúng ta hoàn toàn có thể sử dụng `strinng` hoặc một đối tượng phức tạp.

```typescript linenums="1"
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

## Generic Contrainsts

- Trong các ví dụ trước, bạn đôi khi muốn viết generic function làm việc với một bộ các kiểu (set of types) nơi bạn có hiểu biết về khả năng các kiểu này có thể ( capabilities). Trong ví dụ `loggingIdentity` chúng ta đã muốn truy xuất tới `.length` của `arg`, nhưng trình biên dịch không cho phép ( ko phải mọi kiểu dữ liệu đều có `.length`), vì vậy nó đã đưa ra cảnh báo.

```typescript linenums="1"
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length); // Error: T does not have .length
  return arg;
}
```

- Thay vì làm việc với bất kỳ (`any`) và tất cả các kiểu, chúng ta muốn rằng buộc (contrain) hàm này làm việc với
  `any` và tất cả các kiểu ( ngu học thế nhở: nhưng nguyên văn là `with any and all types`) mà có thuộc tính `.length`. Miễn là type có thuộc tính `.length`, chúng ta sẽ cho phép. Để làm vậy, chúng ta phải liệt kê yêu cầu của chúng ta như rằng buộc với `T`.

- Để làm vậy, chúng ta tạo một interface mô tả các constraint của chúng ta. Ví dụ dưới đây, chúng ta sẽ tạo một interface chỉ có 1 property `.length` và dùng interface này cùng từ khóa `extends` để mo tả ràng buộc của chúng ta:

```typescript linenums="1"
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}
```

- Generic function giờ đã được rằng buộc (constrained), nó sẽ không còn làm việc với `any` hoặc tất cả các type nữa:

```typescript linenums="1"
loggingIdentity(3); // Error, number does not have a .length property
```

- Thay vì thế chúng ta sẽ truyền vào các giá trị có type với tất cả thuộc tính được yêu cầu:

```typescript linenums="1"
loggingIdentity({ length: 10, value: 3 });
```

### Using type parameters in generic constraints

- Bạn có thế khai báo type parameter, cái được rằng buộc bởi một type parameter khác. Ví dụ dưới đây, chúng ta muốn lấy thuộc tính của một object với tên được truyền vào. Chúng ta muốn đảm bảo rằng không có tình huống vô tình nào lấy thuộc tính không tồn tại trong obj, do vậy chúng ta sẽ đặt một rằng buộc giữa hai kiểu giữ liệu truyền vào.

```typescript linenums="1"
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };
getProperty(x, "a"); // okay
getProperty(x, "m"); // error: Argument of type 'm' is not assignable to 'a' | 'b' | 'c' | 'd'
```

### Using Class Types in Generics

- Khi khởi tạo các `factories` trong Typescript (nguyên văn factories không biết dịch nào cho sát nghĩa với tiêu đề ) bằng cách dùng generics, cần thiết tham chiếu các kiểu của class với các hàm khởi tạo của chúng:

```typescript linenums="1"
function create<T>(c: { new (): T }): T {
  return new c();
}
```

- Một ví dụ nâng cao hơn là sử dụng thuộc tính prototype để suy luận và rằng buộc mối quan hệ giữa constructor và instance của class.

```typescript linenums="1"
class BeeKeeper {
  hasMask: boolean;
}

class ZooKeeper {
  nametag: string;
}

class Animal {
  numLegs: number;
}

class Bee extends Animal {
  keeper: BeeKeeper;
}

class Lion extends Animal {
  keeper: ZooKeeper;
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag; // typechecks!
createInstance(Bee).keeper.hasMask; // typechecks!
```
