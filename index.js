// Get wordle word list from wordle.txt
let wordleList = []
fetch('./src/wordle.txt')
    .then(response => response.text())
    .then(raw => {
        wordleList = raw.toUpperCase().split('\n')
    })
    .catch(error => {
        console.error('Failed to read file:', error)
    })

/**
 * Use constants to avoid unclear numbers in the code.
 */
const guessStatus = {
    UNGUESSED: 0,
    WRONG_POSITION: 1,
    CORRECT_POSITION: 2,
    UNUESED: 3,
}

const singleWordLength = 5
const guessChances = 6


class modal {
    /**
     * `elemWinodow`, in this case don't have values
     * until `window.onload`.
     * @param {HTMLElement} elemWindow 
     */
    constructor(modalWindow) {
        this.elemWindow = modalWindow
    }

    show(content) {
        this.elemWindow.innerHTML = content
        this.elemWindow.style.display = 'block'

        setTimeout(() => {
            this.elemWindow.classList.add('show')
        }, 200)
    }

    hide() {
        this.elemWindow.classList.remove('show')

        setTimeout(() => {
            this.elemWindow.style.display = 'none'
        }, 100)
    }

    showForAWhile(content) {
        this.show(content)

        setTimeout(() => this.hide(), 800)
    }
}

let mainModal = new modal()
let infoModal = new modal()


window.onload = () => {
    mainModal.elemWindow = document.getElementsByClassName('modal')[0]
    infoModal.elemWindow = document.getElementsByClassName('modal')[1]

    game.keyBtns = Array.from(document.getElementsByClassName('key'))

    let startBtn = document.getElementById('start')
    startBtn.addEventListener('click', () => {
        game.start()
    })
}


let game = {

    keyBtns: [],
    cursorRow: 0,
    cursorCol: 0,
    keyBtnStatus: new Array(26).fill(guessStatus.UNGUESSED),
    wordToGuess: '',

    // --------------------
    // Main logic

    start() {
        mainModal.hide()
        this.clearStyles()
        this.addInputListener()

        this.cursorRow = 0
        this.cursorCol = 0
        this.keyBtnStatus.fill(guessStatus.UNGUESSED)

        const randomNumber = getRandomInt(0, wordleList.length)
        this.wordToGuess = wordleList[randomNumber]

        console.log('Word to guess:', this.wordToGuess)
    },

    win() {
        let content = `
                <p><strong>YOU WIN!</strong></p>
                <button id="start">RESTART</button>
        `
        this.end(content)
    },

    lose() {
        let content = `
                <p><strong>YOU LOSE!</strong></p>
                <p>The correct word is "${this.wordToGuess}".</p>
                <button id="start">RESTART</button>
        `
        this.end(content)
    },

    end(content) {
        this.removeInputListener()
        mainModal.show(content)

        const startBtn = mainModal.elemWindow.querySelector('#start')
        startBtn.addEventListener('click', () => {
            this.start()
        })
    },

    // --------------------
    // Input logic

    keyPressed(id) {
        if (id === 'Enter') {
            this.enterEvent()
            return
        }

        if (id === 'Backspace') {
            this.backspaceEvent()
            return
        }

        if (this.notValidCharInput(id)) return

        this.inputLetterEvent(id)
    },

    notValidCharInput(id) {
        return id.length !== 1 || !id.match(/[a-zA-Z]/) || this.cursorCol === 5
    },

    getWordFromInput() {
        const currentTiles = this.getCurrentTiles()
        let wordFromInput = ''
        for (let i = 0; i < singleWordLength; i++) {
            wordFromInput += currentTiles[i].innerHTML
        }
        return wordFromInput
    },

    getCurrentTiles() {
        const currentRow = document.getElementsByClassName('board-row')[this.cursorRow]
        return currentRow.getElementsByClassName('board-tile')
    },

    enterEvent() {
        if (this.cursorCol < singleWordLength) {
            infoModal.showForAWhile('Not a complete word!')
            return
        }

        const wordFromInput = this.getWordFromInput()
        let compareResult = this.wordValidate(wordFromInput)
        if (!compareResult) {
            infoModal.showForAWhile('Not in the word list!')
            return
        }

        this.changeColor(wordFromInput, compareResult)

        this.cursorRow++
        this.cursorCol = 0
        if (this.wordToGuess === wordFromInput) {
            this.win()
        }
        else if (this.cursorRow === guessChances) {
            this.lose()
        }
    },

    backspaceEvent() {

        if (this.cursorCol === 0) return

        this.cursorCol--
        setChar(this.cursorRow, this.cursorCol, ' ')
    },

    inputLetterEvent(id) {
        if (this.cursorCol >= singleWordLength) return
        setChar(this.cursorRow, this.cursorCol, id.toUpperCase())
        this.cursorCol++
    },

    // --------------------
    // Validate logic

    wordValidate(wordFromInput) {
        if (wordleList.find(word => word === wordFromInput) === undefined) {
            return false
        }
        else {
            return this.compare(wordFromInput)
        }
    },

    compare(wordToCompare) {
        let result = Array(singleWordLength).fill(guessStatus.UNUESED)

        // Two loops to traverse `wordToGuess` and `wordToCompare`
        for (let i = 0; i < singleWordLength; i++) {
            for (let j = 0; j < singleWordLength; j++) {
                if (wordToCompare[i] === this.wordToGuess[j]) {
                    if (i === j) {
                        result[i] = guessStatus.CORRECT_POSITION
                        break
                    }
                    else {
                        result[i] = guessStatus.WRONG_POSITION
                    }
                }
            }
        }
        return result
    },

    // --------------------
    // Style logic

    changeColor(wordFromInput, compareResult) {
        for (let i = 0; i < singleWordLength; i++) {
            // Change board colors
            const tile = this.getCurrentTiles()[i]
            tile.classList.add('status-' + compareResult[i])

            // Change key button colors
            let index = charToIndex(wordFromInput[i])
            if (game.keyBtnStatus[index] < compareResult[i]) {
                game.keyBtnStatus[index] = compareResult[i]
            }

            let keyBtn = game.keyBtns.find(keyBtn => keyBtn.id === wordFromInput[i])
            keyBtn.classList.add('status-' + game.keyBtnStatus[index])
        }
    },

    clearStyles() {
        const allBoardTiles = document.getElementsByClassName('board-tile')
        for (let i = 0; i < allBoardTiles.length; i++) {
            allBoardTiles[i].innerHTML = ''
            allBoardTiles[i].classList.remove('status-1')
            allBoardTiles[i].classList.remove('status-2')
            allBoardTiles[i].classList.remove('status-3')
        }

        for (let i = 0; i < this.keyBtns.length; i++) {
            this.keyBtns[i].classList.remove('status-1')
            this.keyBtns[i].classList.remove('status-2')
            this.keyBtns[i].classList.remove('status-3')
        }
    },

    // --------------------
    // Callbacks

    screenInput(event) {
        if (event.target && event.target.tagName === 'BUTTON') {
            game.keyPressed(event.target.id)
        }
    },

    keyboardInput(event) {
        game.keyPressed(event.key)
    },

    // --------------------
    // Listeners

    addInputListener() {
        const screenKeyboard = document.getElementsByClassName('keyboard')[0]
        screenKeyboard.addEventListener('click', this.screenInput)

        window.addEventListener('keydown', this.keyboardInput)
    },

    removeInputListener() {
        const screenKeyboard = document.getElementsByClassName('keyboard')[0]
        screenKeyboard.removeEventListener('click', this.screenInput)

        window.removeEventListener('keydown', this.keyboardInput)
    },
}


function charToIndex(ch) {
    return ch.charCodeAt(0) - 'A'.charCodeAt(0)
}

function setChar(x, y, ch) {
    if (x < 0 || x >= guessChances) return
    if (y < 0) return
    if (y >= singleWordLength && ch != '') return

    let row = document.getElementsByClassName('board-row')[x]
    let tile = row.getElementsByClassName('board-tile')[y]

    tile.innerHTML = ch
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}