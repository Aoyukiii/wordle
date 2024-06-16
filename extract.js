const fs = require('fs')

fs.readFile('./src/words.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error('Failed to read file:', err)
        return
    }

    const wordlist = data.split('\n')

    const wordlelist = wordlist.filter(word => {
        if (word.length !== 5) {
            return false
        }
        // return /^[a-z]{5}/.test(word)
        return /^[a-zA-Z]{5}/.test(word) && !/^[A-Z]{5}/.test(word)
    })

    console.log(wordlelist)
    
    fs.writeFile('./src/wordle.txt', wordlelist.join('\n'), 'utf8', (err) => {
        if (err) {
          console.error('Failed to write file:', err);
          return;
        }
      
        console.log('Successful.');
      });
})