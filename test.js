
var spiralOrder = function(matrix) {
    let a = [0,0]
    let horEnd = matrix[0].length;
    let verEnd = matrix.length;
    let horStart = 0;
    let verStart = 0;
    let res = []
    while(true){
        for(let i = horStart ; i < horEnd; i++){
            a = [a[0], i];
            res[res.length] = matrix[a[0]][a[1]];
        }
        horEnd--;
        for(let i = verStart + 1; i < verEnd; i++){
            a = [i, a[1]];
            res[res.length] = matrix[a[0]][a[1]]
        }
        verEnd--;
        for(let i = horEnd  - 1; i >= horStart ; i--){
            a = [a[0], i];
            console.log(matrix[a[0]][a[1]]);
            res[res.length] = matrix[a[0]][a[1]]
        }
        horStart++;
        for(let i = verEnd - 1 ; i > verStart; i--){
            a = [i, a[1]];
            res[res.length] = matrix[a[0]][a[1]]
        }
        verStart++;
        if(horStart >= horEnd || verStart >= verEnd){
            return res;
        }
    }
};

console.log(spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]));