---
authors:
  - PaPu
categories:
  - dev
date: 2019-09-21
draft: false
---

# Understanding react component life cycle

## Introduction

- React cung cấp các developers rất nhiều các `method` hoặc `hooks` được thực thi trong suốt `life-cycle` của một component, các phương thức này sẽ cập nhật UI cũng như state của ứng dụng. Hiểu cách các life-cycle này hoạt động sẽ giúp chúng ta làm việc với React một cách nhẹ nhàng hơn.

- React liên tục cập nhật và `không dùng - deprecated` một vài life-cycle đã giới thiệu trước đó. Nhưng trong bài này vẫn liệt kê. ( có thể do code cũ của dữ án đã dùng - việc hiểu chúng cũng có lợi).
<!-- more -->

## Life-cycle

### constructor

- Nếu không dùng tới `state` và không truyền phương thức, chúng ta không cần gọi hàm này cho component.

- Trong `constructor` chúng ta nên gọi `super(props)` trước bất kỳ câu lệnh nào. Nếu không `this.props` sẽ `undifined`, điều này có thể tạo ra bugs.

- **DO**

  - Khởi tạo giá trị initial state (nếu bạn dùng local state). Đây cũng là nơi duy nhất gán `this.state`. Tại các vị trí còn lại hãy sử dụng `this.setState`.

- **DON'T**

  - Không thực hiện bất kỳ `side effects` nào tại đây (AJAX calls etc.).

### componentWillMount - deprecated

- `componentWillMount` không khác nhiều lắm so với `constructor` - nó cũng được gọi chỉ 1 lần khi component được mount. Do vậy nó được coi `deprecated`. Hàm này còn được sử dụng tới version 17.

- `setState` được gọi trong function này sẽ không `trigger` component `re-render`.

- **DO**

  - Cập nhật `state` bằng `this.setState`.
  - Có thể sử dụng side-effects ( AJAX call ở đây) **chỉ với trường hợp server-side-rendering**

- **DON'T**

  - Không tạo ra side-effects ( call AJAX ) nếu phía client.

### componentWillReceiveProps(nextProps)

- Function này sẽ được gọi mỗi khi props có sự thay đổi( không phân biệt giá trị của props có thay đổi hay không).

- Nhớ rằng function này được gọi với tất cả props do đó developer cần check xem có thực sự thay đổi hay không ví dụ:

```javascript linenums="1"
  componentWillReceiveProps(nextProps) {
    if(nextProps.myProp !== this.props.myProps) {
      // nextProps.myProp has a different value than our current prop
      // so we can perform some calculations based on the new value
    }
  }
```

- **DO**

  - Đồng bộ state với props

- **DON'T**

  - Thực hiện call API ở đây.

### shouldComponentUpdate(nextProps, nextState, nextContext)

- Theo mặc định các class component sẽ tự render lại mỗi khi prop, state, hoặc context của chúng bị thay đổi. Nếu thực hiện thường xuyên việc này sẽ ảnh hưởng tới hiệu năng.

- `shouldComponentUpdate` sử dụng một trong props, state hoặc context để xác định component có nên render lại hay không dựa vào giá trị return của function này.

- Bạn có thể nên xem xét sử dụng: `PureComponent` hơn `shouldComponentUpdate` nếu muốn tăng hiệu năng của việc render.

- **DO**

  - Sử dụng tăng hiệu năng ( hạn chế việc render liên tục).

- **DON'T**

  - call API ( side effect).
  - sử dụng `this.setState` việc này có thể tạo nên lặp vô tận.

### componentWillUpdate (nextProps, nextState) - deprecated

- Nếu `shouldComponentUpdate` không được sử dụng, hoặc nó xác định componnent nên update, các function life-cycle khác sẽ được gọi. `componentWillUpdate` thường được sử dụng đồng bộ giữa `state` và `props` khi một phần `state` của bạn dựa trên `props`.

- Với trường hợp `shouldComponentUpdate` được sử dụng, function này có thể sử dụng thay cho `componentWillReceiveProps` và chỉ được gọi khi component thực sự re-render.

- Tương tự như tất cả các hàm `componentWill*`, hàm này có thể bị gọi nhiều lần trước khi `render` vì vậy **không** nên thực hiện side-effect trong đây.

- **DO**

  - Đồng bộ state và props

- **DON'T**

  - call API ( cause side effect).

### componentDidUpdate (prevProps, prevState, prevContext)

- Hàm này được gọi ngay sau khi việc cập nhật xảy ra. Nó không được gọi cho lần đầu tiên render.

- Hàm này được gọi **một lần** trong mỗi lần `re-render`, đây chính nơi thực hiện các lời gọi API ( hoặc side effects).

- Hàm này nhận vào ba tham số (prevProps, prevState, prevContext) cho phép chúng ta tự kiểm tra các giá trị bị thay đổi và chỉ thực hiện một số cập nhật nhất định tùy ý:

```javascript linenums="1"
componentDidUpdate(prevProps) {
  if(prevProps.myProps !== this.props.myProp) {
    // this.props.myProp has a different value
    // we can perform any operations that would
    // need the new value and/or cause side-effects
    // like AJAX calls with the new value - this.props.myProp
  }
}
```

- `componentDidUpdate()` sẽ không được gọi nếu `shouldComponentUpdate()` return false

- **DO**

  - Thực hiện gọi API hoặc các side-effects

- **DON'T**

  - Gọi `this.setState` nó sẽ làm componnent re-render lại.

### componentDidMount

- Hàm này được gọi chỉ một lần trong suốt life-cycle của component.
- Do nó chỉ được gọi duy nhất một lần nên đây là nơi hoàn hảo để thực hiện call API, hay side-effects.

- **DO**

  - call API, side effects.

- **DON'T**

  - gọi `this.setState` nó làm component re-render.

### componentWillUnmount

- Hàm này được gọi ngay trước khi component được gỡ và hủy khỏi DOM. Giúp dọn dẹp ( ví dụ clear setTimout, setInterval), close / remove các sockets khi không còn sử dụng nữa.

- **DO**

  - xóa các timers và listeners được tạo trong life-cycle của component.

- **DON'T**

  - gọi `this.setState` nó sẽ khởi tạo mới một listenner hoặc timers.

### Component cycles

- Có rất nhiều lý do để các component có thể re-render, với mỗi các lý do đó , các function khác nhau có thể được gọi, cho phép chúng ta cập nhật một phần của Component.
