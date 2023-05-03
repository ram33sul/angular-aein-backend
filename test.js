const input = [2,7,11,4,-2];

const output = [20,15,11,18,24];

let sum = 0;
for(let val of input){
    sum += val
}

const res = [];
for(let val of input){
    res[res.length] = sum - val;
}

console.log(res);