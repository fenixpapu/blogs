# React-Redux Connect Explained

- About a year after Redux came out, Dan Abramov wrote a gist entitled [connect.js explained](https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e)

- Trong quá trình tìm hiểu: React, Redux, React-Redux, Redux-Saga có rất nhiều chỗ mình còn chưa hiểu tại sao. Và code dưới đây giải thích 1 trong các phần đó: `connect` trong Redux.

```javascript
  // connect() là một function, `injects` những thứ Redux liên quan props vào trong component của bạn.
// Bạn có thể  `injects` dữ liệu và callbacks nhưng thay đổi giữ liệu này bằng cách dispatching actions

function connect(mapStateToProps, mapDispatchToProps) {
  //  Function cho phép chúng ta `inject` component vào bước cuối cùng vì vậy mọi người có thể dùng nó như một vật trang trí(không hiểu ý tác giả lắm :v)
  // Thông thường thì chúng ta không cần bận tâm về nó
  return function (WrappedComponent) {
    // Return một component
    return class extends React.Component {
      render() {
        return (
          // cái này Render component của bạn
          <WrappedComponent
            {/** với props của component */}
            {...this.props}
            {/** và thêm props được tính từ Redux store */}
            {...mapStateToProps(store.getState(), this.props)}
            {...mapDispatchToProps(store.dispatch, this.props)}
          />
        )
      }

      componentDidMount() {
        // connect sẽ subscribe đến store để ko bị thiếu việc updates
        this.unsubscribe = store.subscribe(this.handleChange.bind(this))
      }

      componentWillUnmout() {
        // và unsubscribe sau đó
        this.unsubscribe()
      }

      handleChange() {
        // và bất cứ khi nào store state thay đổi. it sẽ render lại.
        this.forceUpdate()
      }
    }
  }
}

// Đây không phải là code implement thực tế nhưng theo ý tưởng như này.
// Bỏ qua câu hỏi: "Chúng ta lấy store từ đâu" (answer: <Provider> đưa nó vào trong React context) 
// và bỏ qua về tối ưu hiệu năng ( connect() trong thực tế đảm bảm không render lại một cách vô ích)

// Mục đích của connect() là bạn không cần phải suy nghĩ về subscribing tới `store` hoặc tự tối ưu hóa,
// và thay vì đó bạn chỉ định cách lấy props dựa trên state của Redux store.


const ConnectedCounter = connect(
  // Đưa vào Redux state, trả lại props
  state => ({
    value: state.counter,
  }),
  // Đưa vào Redux dispatch, trả lại callback props
  dispatch => ({
    onIncrement() {
      dispatch({ type: 'INCREMENT' })
    }
  })
)(Counter);

```
