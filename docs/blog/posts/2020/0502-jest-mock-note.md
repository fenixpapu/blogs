---
authors:
  - PaPu
categories:
  - dev
date: 2020-05-02
draft: false
---

# Jest Mock Note.

- Bài này note lại một câu trả lời trên [stackoverflow](https://stackoverflow.com/a/54807475/1406656) cách mock function, module, giải quyết vấn đề mình gặp phải dự án. (note lại sau tìm cho dễ)
<!-- more -->
- Below an example:

```js linenums="1" title="foo.js"
export const foo = true; // could be expression as well
```

```js linenums="1" title="subject.js"
import { foo } from "./foo";

export default () => foo;
```

```js linenums="1" title="subject.spec.js also know as(aka) subject.test.js"
import subject from "./subject";

jest.mock("./foo", () => ({
  get foo() {
    return true; // set some default value
  },
}));

describe("subject", () => {
  const mySpy = jest.spyOn(subject.default, "foo", "get");
  it("foo return true", () => {
    expect(subject.foo).toBe(true);
  });

  it("foo returns false", () => {
    mySpy.mockReturnValueOne(false);
    expect(subject.foo).toBe(true);
  });
});
```
