// this refers global object
function foo() {
  console.log("Simple function call");
  console.log(this === window);
}

foo(); // prints true on the console