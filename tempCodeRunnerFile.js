    const map = {};
    let i = 0;
    while(i < words.length){
        const map2 = {};
        const word = words[i]
        for(let j = 0; j < words[i].length; j++){
            if(!map2[word[j]] || i === 0){
                map2[word[j]] = 1;
            } else  {
                map2[word[j]]++;
            }
        }
        for(let key in map){
            if(map2[key]){
                map[key] = Math.abs(map[key] - (map[key] - map2[key]))
            }
        }
        i++;
    }
    const res = [];
    for(let key in map){
        for(let i = 0 ; i < map[key]; i++){
            res[res.length] = key;
        }
    }
    return res;