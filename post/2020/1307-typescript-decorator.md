# Decorator

- [Draft] Bài này không hoàn chỉnh đừng phí thời gian của bạn.
- Take note cho decorator trong TS.

## Introduction

- Để ts hỗ trợ `decorator` bạn cần cho phép `experimentalDecorators` trong terminal hoặc trong file cấu hình `tsconfig.josn`
- Command line:

```sh
tsc --target ES5 --experimentalDecorators`
```

- `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```

## Decorators

### Decorator Factories

### Decorator Composition

- Nhiều `decorators` có thể áp dụng cho một khai báo như trong ví dụ đưới đây:

  - Single line:

  ```sh
  @f @g x
  ```

  - On multiple lines:

  ```sh
  @f
  @g
  x
  ```

- Các bước sau được thực thi khi đánh giá nhiều `decorators` trên một khai báo trong Typescript:

  1. Các biểu thức cho mỗi `decorator` được đánh giá từ trên xuống ( top-to-bottom).

  2. Kết quả đươc gọi như function từ dưới lên trên (bottom-to-top).

- Xem ví dụ:

```sh
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}
```

- Output sẽ giống ntn:

```sh
f(): evaluated
g(): evaluated
g(): called
f(): called
```

### Decorator Evaluation

- Thứ tự cách các `decorators` áp dụng lên các `declarations` ( khai báo khác nhau) bên trong class:
  1. Parameter Decorators, theo sau bởi Method, Accessor hoặc Property Decorators được áp dụng cho mỗi thể hiện ( instance member).
  2. Parameter Decorators, theo sau bởi Method, Accessor hoặc Property Decorators được áp dụng cho mỗi static member.
  3. Parameter Decorators được áp dụng cho mỗi constructor.
  4. Class Decorators are applied for the class.

### Class Decorators

- Được khai báo ngay trước khai báo của class. Class decorator được áp dụng cho `constructor` của class.

- Biểu thức `class decorator` sẽ được gọi như một hàm tại thời gian thực thi ( run time), với `constructor` của class được decorate là tham số duy nhất.

- NẾU `class decorator` TRẢ VỀ GÍA TRỊ, NÓ SẼ THAY THẾ `class declaration` VỚI HÀM CONSTRUCTOR ĐÃ ĐƯỢC CUNG CẤP.

  ```NOTE
    Nếu bạn chọn trả về một constructor mới, bạn phải tự mình xử lý prototype gốc. Logic được áp dụng cho các decorators lúc chạy sẽ KHÔNG làm việc này cho bạn.
  ```

- Example cho `class decorator`:

  ```typescript
  @sealed
  class Greeter {
    greeting: string;
    constructor(message: string) {
      this.greeting = message;
    }
    greet() {
      return "Hello, " + this.greeting;
    }
  }

  function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
  }
  ```

- Here we go, đây sẽ là ví dụ mà `class decorators` trả về một giá trị, sẽ thay thế constructor cũ của class ( ghi đè)

  ```typescript
  function classDecorator<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    return class extends constructor {
      newProperty = "new property";
      hello = "override";
    };
  }

  @classDecorator
  class Greeter {
    property = "property";
    hello: string;
    constructor(m: string) {
      this.hello = m;
    }
  }

  console.log(new Greeter("world"));
  ```

### Method Decorators

- `Method Decorators` được khai báo ngay trước `method declaration`. ( các decorators của method được khai báo ngay trước lời khai báo method). Decorator được áp dụng cho `Property Décriptor` của method.

- Biểu thức `Method Decorator` sẽ được gọi như một function tại thời gian thực thi, với 3 tham số:

  - Function của class với static member hoặc prototype của class với một instance member.

  - Name của member.

  - The Property Descriptor cho member.

  NOTE: Property Descriptor sẽ là undefined nếu script target nhỏ hơn ES5.

- Ví dụ `method decorators`:

```typescript
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

- Decorator trông sẽ ntn:

```typescript
function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
  };
}
```

### Accessor Decorators

- Decorate cho `get` và `set` của class

- `Accessor Decorator` - decorator cho Accessor được khai báo ngay trước khai báo của `Accessor`.

- Accessor decorator được áp dụng cho `Property Descriptor`.

- Nếu `Accessor Decorator` trả về giá trị, nó sẽ được sử dụng như `Property Descriptor`.

NOTE: Đừng quên giá trị trả về sẽ bị bỏ qua nếu script target nhỏ hơn ES5.

- Ví dụ `accessor decorator`:

```typescript
class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() {
    return this._x;
  }

  @configurable(false)
  get y() {
    return this._y;
  }
}

function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}
```

### Property Decorators

- A `Property Decorator` được khai báo trước một khai báo property. Biểu thức cho property decorator sẽ được gọi như một hàm tại thời gian thực thi với hai tham số sau:

  1. Hoặc constructor function của class hoặc prototype của class

  2. Tên của member.

  NOTE: Một `Property Descriptor` không được cung cấp như một tham số của `property decorator` do cách `property decorators được khởi tạo trong Typescript.

- Chúng ta có thể sử dụng thông tin để lưu lại metadata về property, như ví dụ dưới dây:

```typescript
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
```

### Parameter Decorators

- `Parameter Decorator` được khai báo trước khai báo của parameter. `Parameter Decorator` được áp dụng cho cả constructor hoặc method của class.

- `Parameter Decorator` sẽ được thực thi như một hàm khi thực thi, với các tham số sau:

  1. Hàm khởi tạo của class với static member hoặc prototype của class với một instance member.

  2. Name of the member.

  3. Thứ tự của parameter trong danh sách tham số (parameter) của function.

- Giá trị trả về của `parameter decorator` bị bỏ qua.

- Ví dụ:

```typescript
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  @validate
  greet(@required name: string) {
    return "Hello " + name + ", " + this.greeting;
  }
}
```

- Định nghĩa các decorators như dưới:

```typescript
import "reflect-metadata";

const requiredMetadataKey = Symbol("required");

function required(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingRequiredParameters: number[] =
    Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(
    requiredMetadataKey,
    existingRequiredParameters,
    target,
    propertyKey
  );
}

function validate(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>
) {
  let method = descriptor.value;
  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(
      requiredMetadataKey,
      target,
      propertyName
    );
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (
          parameterIndex >= arguments.length ||
          arguments[parameterIndex] === undefined
        ) {
          throw new Error("Missing required argument.");
        }
      }
    }

    return method.apply(this, arguments);
  };
}
```

### Metadata

- Một vài ví dụ sử dụng thư viện `reflect-metadata` đây không phải là thư viện chuẩn của ECMAScript (JavaScript).
