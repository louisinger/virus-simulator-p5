let w
let columns
let rows
let board
let blankBoard

var BOARD_WIDTH = 400
var BOARD_HEIGHT = 400
var NUMBER_OF_INFECTED = 10
var NUMBER_OF_HEALED = 0
var NUMBER_OF_NON_INFECTED = 30
var INFECTION_RATE = 0.2
var DEAD_RATE = 0.152
var INFECTION_DURATION = 14

let COLOR_NON_INFECTED
let COLOR_INFECTED 
let COLOR_HEALED 

let infected = []
let nonInfected = []
let healed = []
let numberOfDead = 0

let time = 0
let gui

let btnCreate
let text1

function addWallToMousePosition () {
  if (mouseX && mouseY) {
    mouseCol = floor(mouseX / w)
    mouseRow = floor(mouseY / w)
    const tileExist = board[mouseCol] ? board[mouseCol][mouseRow] != null ? true : false : false
    if (tileExist) board[mouseCol][mouseRow] = 1
  }
}

/**
 * @param {Number!} col column number.
 * @param {Number!} row row number.
 */
function existsOnBoard (col, row) {
  if (col > columns || col < 0) return false
  if (row > rows || row < 0) return false
  if (!board) return false
  if (board[col] == null) return false
  if (board[col][row] == null) return false
  return true
}

function isOccuped (c, r) {
  const people = [...infected, ...nonInfected, ...healed]
  const found = people.find(({ col, row }) => col === c && row == r)
  if (found != null) return true
  else false 
}

/**
 * Return the adjacents tiles coords of a tile given as parameter.
 * @param {Number!} col column number.
 * @param {Number!} row row number.
 */
function getAdjacentsCoords (col, row) {
  return [
    { col: col + 1, row },
    { col, row: row + 1 },
    { col: col - 1, row },
    { col, row: row - 1 },
    { col: col - 1, row: row - 1 },
    { col: col + 1, row: row - 1 },
    { col: col + 1, row: row + 1 },
    { col: col - 1, row: row + 1 },
  ].filter(({ col, row }) => existsOnBoard(col, row))
}

/**
 * Function generating the initial people on the board.
 */
function generatePeople () {
  // generate the non infected people
  for (i = 0; i < NUMBER_OF_NON_INFECTED; i++) {
    const col = floor(random(0, columns))
    const row = floor(random(0, rows))
    nonInfected.push({ col, row })
  }

  // generate the infected people
  for (i = 0; i < NUMBER_OF_INFECTED; i++) {
    const col = floor(random(0, columns))
    const row = floor(random(0, rows))
    infected.push({ col, row, infected_since: time })
  }
}

function updateBoardsWithPeoplePositions () {
  board.forEach((col, indexCol) => {
    col.forEach((tile, indexRow) => {
      if (tile === 2 || tile === 3 || tile === 4) {
        board[indexCol][indexRow] = 0
      }
    })
  })

  nonInfected.forEach(({ col, row }) => {
    board[col][row] = 2
  })

  infected.forEach(({ col, row }) => {
    board[col][row] = 3
  })

  healed.forEach(({ col, row }) => {
    board[col][row] = 4
  })
}

function reset () {
  clear()
  time = 0
   // create the canvas
  cnv = createCanvas(BOARD_WIDTH + 100, BOARD_HEIGHT)
  // setup the size of the tile
  w = 20
  // Calculate columns and rows
  columns = floor((width - 100) / w)
  rows = floor(height / w)
  // Wacky way to make a 2D array is JS
  board = Array(columns)
  for (let i = 0; i < columns; i++) {
    board[i] = Array(rows).fill(0)
  }

  btnCreate.position(width - 80, 10)

  
  infected = []
  nonInfected = []
  healed = []
  numberOfDead = 0
  generatePeople()
  updateBoardsWithPeoplePositions()
}

function setup() {
  gui = createGui('Parameters')
  sliderRange(0, windowHeight - 200, 1)
  gui.addGlobals('BOARD_HEIGHT')
  sliderRange(0, windowWidth - 200, 1)
  gui.addGlobals('BOARD_WIDTH')
  sliderRange(0, 500, 1)
  gui.addGlobals('NUMBER_OF_INFECTED', 'NUMBER_OF_NON_INFECTED', 'NUMBER_OF_HEALED')
  sliderRange(0, 1, 0.01)
  gui.addGlobals('INFECTION_RATE', 'DEAD_RATE')
  sliderRange(0, 50, 1)
  gui.addGlobals('INFECTION_DURATION')

  COLOR_INFECTED = color(200, 0, 0)
  COLOR_HEALED = color(0, 200, 0)
  COLOR_NON_INFECTED = color(0, 0, 200)
  
  btnCreate = createButton('reset')
  btnCreate.mousePressed(reset)

  reset()
}

function draw() {
  clear()
  // draw the board
  board.forEach((column, indexCol) => {
    column.forEach((tile, indexRow) => {
      stroke(100)
      switch (tile) {
        case 0:
          fill(255)
          break
        case 1:
          fill(0)
          break
        case 2:
          fill(COLOR_NON_INFECTED)
          break
        case 3:
          fill(COLOR_INFECTED)
          break
        case 4:
          fill(COLOR_HEALED)
          break
      }
      rect(indexCol * w, indexRow * w, w-1, w-1)
    })
  })

  noStroke()
  textSize(14)

  fill(0)
  text(`Turn: ${time}`, width - 90, 10)
  text(`Dead: ${numberOfDead}`, width - 90, 25)

  textSize(32)

  noStroke()

  fill(COLOR_NON_INFECTED)
  text(nonInfected.length, width - 90, 80)
  fill(COLOR_INFECTED)
  text(infected.length, width - 90, 110)
  fill(COLOR_HEALED)
  text(healed.length, width - 90, 140)

  if (keyIsDown(87)) {
    mouseCol = floor(mouseX / w)
    mouseRow = floor(mouseY / w)
    if (existsOnBoard(mouseCol, mouseRow)) {
      fill(160, 200)
      rect(mouseCol * w, mouseRow * w, w-1, w-1)
    }
    if (mouseIsPressed) {
      addWallToMousePosition()
    }
  }
}

function nextTurn () {
  time += 1
  heal()
  move()
  updateBoardsWithPeoplePositions()
  infect()
  updateBoardsWithPeoplePositions()
}

function keyPressed() {
  if (keyCode === 32) {
    nextTurn()
  }
}


function heal () {
  infected.forEach(({ col, row, infected_since }, index) => {
    if (time - infected_since > INFECTION_DURATION) {
      infected.splice(index, 1)
      if (random() < DEAD_RATE) {
        // dead
        numberOfDead += 1
      } else {
        // healed
        healed.push({ col, row })
      }
    }
  })
}

function infect () {
  infected.forEach(({ col, row }, index) => {
    const positionsNonInfectedAdjacent = getAdjacentsCoords(col, row).filter(({col, row}) => board[col][row] === 2)
    const target = positionsNonInfectedAdjacent[floor(random(0, positionsNonInfectedAdjacent.length))]
    if (target && random() < INFECTION_RATE ) {
      const indexTarget = nonInfected.findIndex(obj => obj.col == target.col && obj.row == target.row)
      nonInfected.splice(indexTarget, 1)
      infected.push({col: target.col, row: target.row, infected_since: time })
    }
  })
}

function move () {
  infected.forEach(({ col, row }, index) => {
    const availableTiles = getAdjacentsCoords(col, row).filter((coords) => board[coords.col][coords.row] === 0).filter(({ col, row }) => !isOccuped(col, row))
    const tile = availableTiles[floor(random(0, availableTiles.length))]
    if (tile) {
      infected[index].col = tile.col
      infected[index].row = tile.row
    }
  })

  nonInfected.forEach(({ col, row }, index) => {
    const availableTiles = getAdjacentsCoords(col, row).filter((coords) => board[coords.col][coords.row] === 0).filter(({ col, row }) => !isOccuped(col, row))
    const tile = availableTiles[floor(random(0, availableTiles.length))]
    if (tile) {
      nonInfected[index].col = tile.col
      nonInfected[index].row = tile.row
    }
  })

  healed.forEach(({ col, row }, index) => {
    const availableTiles = getAdjacentsCoords(col, row).filter((coords) => board[coords.col][coords.row] === 0).filter(({ col, row }) => !isOccuped(col, row))
    const tile = availableTiles[floor(random(0, availableTiles.length))]
    if (tile) {
      healed[index].col = tile.col
      healed[index].row = tile.row
    }
  })
}