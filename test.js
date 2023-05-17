var duplicateZeros = function(arr) {
    for(let i = 0; i < arr.length; i++){
        if(arr[i] === 0 && ){
            console.log(arr);
            for(let j = arr.length - 1; j > i; j--){
                arr[j] = arr[j-1]
            }
            arr[i+1] = 0;
            i++;
        }
    }
    return arr;
};

console.log(duplicateZeros([1,0,2,3,0,4,5,0]));