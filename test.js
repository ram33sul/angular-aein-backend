var hammingWeight = function(n) {
    let count = 0;
    n = n.toString(2);
    console.log(n);
    while(n){
        let rem = n % 10;
        n = Math.round(n/10);
    }
    return count;
};

let num = 11;

console.log(hammingWeight(num));