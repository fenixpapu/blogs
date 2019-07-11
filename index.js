const callBack = text => {
  console.log('send data to client: ', text);
}

const getUserInfo = (ms, cb) => {
  setTimeout(() => cb('userInfo'), ms);
}

const report = cb => {
  getUserInfo(2000, cb);
  console.log('Do other thing');
};
report(callBack);