// // this refers global object
// function foo() {
//   console.log("Simple function call");
//   setTimeout(() => console.log('hello'), 2000);
//   console.log(this === `window`);
// }

// foo(); // prints true on the console


// #############################  callback vs async/await
// const delay = (ms) => {
//   return new Promise((resolve, reject) => {
//     setTimeout (() => resolve('SUN'), ms);
//   });
// };

// const sayHello = (txt) => console.log(`Hello `, txt);

// const testCallBackFunction = (cb) => {
//   delay(5000)
//     .then(data => {
//       cb(data);
//     });
//   console.log(`Callback function do other things here!`);
// }

// const testAsyncAwaitFunction = async (cb) => {
//   const data = await delay(5000);
//   cb(data);
//   console.log(`Async/await do other thing here!`)
// }
// testAsyncAwaitFunction(sayHello);




// #### generator function you don't know

// let x = 1;
// function* foo() {
//   x++;
//   yield; //pause
//   console.log('x: ', x);
// }

// function bar() {
//   x++;
// }

// var it = foo();
// //start `foo()` here!
// it.next();
// console.log(x);
// bar();
// console.log(x);
// it.next();


// function* foo(x) {
//   var y = x * (yield "Hello"); // <-- yield a value;
//   return y;
// }

// var it = foo();

// var res = it.next();    // first `next()` don't pass anything
// console.log(res.value);  // Hello

// res = it.next(7);  //pass waiting `yield`
// console.log(res.value);


// let a = 1;
// let b = 2;

// function* foo() {
//   a++;
//   yield;
//   b = b * a;
//   a = (yield b) + 3;
// }
// function* bar() {
//   b--;
//   yield;
//   a = (yield 8) + b;
//   b = a * (yield 2);
// }

// function step(gen) {
//   var it = gen();
//   var last;
//   return function () {
//     // whatever is `yield`ed out, just send it right back in the next time!
//     last = it.next(last).value;
//   };
// }
// a = 1;
// b = 2;
// var s1 = step(foo);
// var s2 = step(bar);

// s1();
// s1();
// s1();

// s2();
// s2();
// s2();
// s2();
// console.log(a, b);

// ############################# this
// function f1() {
//   return this;
// }

// console.log(f1() === global);

// function f2() {
//   'use strict';
//   return this;
// }

// console.log(f2() === undefined); // true

const myFirstPromise = (data) => {
  return new Promise((resolve, reject) => {
    console.log('Data receive in myFirstPromise: ', data);
    return resolve('1111');
  });
}

const mySecondPromise = (data) => {
  return new Promise((resolve, reject) => {
    console.log('Data received in mySecondPromise: ', data);
    return resolve('2222');
  });
}

const myThirdPromise = (data) => {
  return new Promise((res, reject) => {
    console.log('Data received in myThirdPromise: ', data);
    return res('3333');
  });
}

// myFirstPromise('started')
//   .then(firstData => mySecondPromise(firstData))
//   .then(secondData => myThirdPromise(secondData))
//   .then(thirdData => console.log(`return from myThirdPromise: ${thirdData}`))
//   .catch(err => {
//     console.log('handled err');
//   });

Promise.race([myFirstPromise(), mySecondPromise(), myThirdPromise()])
  .then(data => {
    console.log(data);
  })
  .catch(err => cosole.log('err haneld'));