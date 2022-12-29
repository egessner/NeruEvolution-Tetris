/* eslint linebreak-style: ['error', 'windows'] */
// GLOBALS
const n = 16;
const canvas = document.getElementById('mainCanvas');
let tetris;
const context = canvas.getContext('2d');
/**
 * @description init everything and begin each tetris instance
 */
function main() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (tetris) {
    tetris.forEach((row) => row.forEach((tet) => tet.killTetris()));
  }
  createTetrisArray();
  tetris.forEach((row) => row.forEach((tet) => tet.draw()));

  const button = document.getElementById('restartButton');
  button.addEventListener('click', main);

  // spin until all Tetris objects are done
  // https://stackoverflow.com/questions/13304471/javascript-get-code-to-run-every-minute
  const timerID = setInterval(function() {
    let numGO = 0;
    for (let y = 0; y < tetris.length; y++) {
      for (let x = 0; x < tetris[0].length; x++) {
        numGO+= tetris[y][x].gameOver;
      }
    }
    if (n == numGO) {
      console.log('all done');
      nextGeneration();
      // clearInterval(timerID);
    }
  }, 1 * 1000); // 60 * 1000 milsec every minute
}

/**
 * @description create a squarish tetris array with each tetris
 * element scaled and padded
 * as long as the canvas is of ratio 3x4 this will work
 * @param {*} brain;
 */
function createTetrisArray(brain) {
  tetris = [];
  // determine size of square tetris array
  let i;
  for (i = n; ; i++) {
    const sqr = Math.sqrt(i);
    if (Number.isInteger(sqr)) {
      i = sqr;
      break;
    }
  }
  // determine scale
  const scale = canvas.width / (15 * i);

  // create array
  for (let j = 0; j < i; j++) {
    tetris[j] = new Array(i).fill(0);
  }

  // fill array with tetris
  for (let y = 0; y < tetris.length; y++) {
    const yPad = (canvas.height / i) * y;
    for (let x = 0; x < tetris[0].length; x++) {
      const xPad = (canvas.width / i) * x;
      if ((y*i) + x <= n - 1) {
        if (brain) {
          tetris[y][x] = new Tetris(scale, xPad, yPad, brain);
          tetris[y][x].mutate();
        } else {
          tetris[y][x] = new Tetris(scale, xPad, yPad);
        }
      }
    }
  }
  // remove non tetris elements from array
  tetris = tetris.map((row) => row.filter((tet) => tet != 0));
}

/**
 * @description
 */
function nextGeneration() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // pick the one with the best score - implicit fitness function
  let bestParent = tetris[0][0];
  for (let y = 0; y < tetris.length; y++) {
    for (let x = 0; x < tetris[0].length; x++) {
      const curScore = tetris[y][x].score;
      bestParent = bestParent.score > curScore ? bestParent : tetris[y][x];
    }
  }
  // dispose of old brains
  // for (let y = 0; y < tetris.length; y++) {
  //   for (let x = 0; x < tetris[0].length; x++) {
  //     tetris[y][x].dispose();
  //   }
  // }
  // recreate array with new brains
  createTetrisArray(bestParent.brain);
  tetris.forEach((row) => row.forEach((tet) => tet.draw()));
}

main();
