// // this refers global object
// function foo() {
//   console.log("Simple function call");
//   setTimeout(() => console.log('hello'), 2000);
//   console.log(this === `window`);
// }

// foo(); // prints true on the console


// #############################  callback vs async/await
const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout (() => resolve('SUN'), ms);
  });
};

const sayHello = (txt) => console.log(`Hello `, txt);

// const testCallBackFunction = (cb) => {
//   delay(5000)
//     .then(data => {
//       cb(data);
//     });
//   console.log(`Callback function do other things here!`);
// }

const testAsyncAwaitFunction = async (cb) => {
  const data = await delay(5000);
  cb(data);
  console.log(`Async/await do other thing here!`)
}
testAsyncAwaitFunction(sayHello);

