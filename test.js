const p = Promise.resolve('hee')

p.finally(() => console.log("finally")).then(() => console.log("then"))