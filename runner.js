/* eslint linebreak-style: ['error', 'windows'] */
// GLOBALS
const n = 169;
const canvas = document.getElementById('mainCanvas');
let tetris;
let gen = 1;
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
      nextGeneration();
      // clearInterval(timerID);
    }
  }, 60 * 1000); // 60 * 1000 milsec every minute
}

/**
 * @description create a squarish tetris array with each tetris
 * element scaled and padded
 * as long as the canvas is of ratio 3x4 this will work
 * @param {*} brain;
 */
function createTetrisArray(bestParents) {
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
        if (bestParents) {
          tetris[y][x] = new Tetris(scale, xPad, yPad, pickone(bestParents));
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
  // let bestParent = tetris[0][0];
  // for (let y = 0; y < tetris.length; y++) {
  //   for (let x = 0; x < tetris[0].length; x++) {
  //     const curScore = tetris[y][x].score;
  //     bestParent = bestParent.score > curScore ? bestParent : tetris[y][x];
  //   }
  // }
  // dispose of old brains
  // for (let y = 0; y < tetris.length; y++) {
  //   for (let x = 0; x < tetris[0].length; x++) {
  //     tetris[y][x].dispose();
  //   }
  // }
  // recreate array with new brains
  const bestParents = fitness();
  createTetrisArray(bestParents);
  bestParents.forEach((tet) => tet.dispose());

  tetris.forEach((row) => row.forEach((tet) => tet.draw()));
  gen++;
  console.log('Generation ' + gen);
}

/**
 * @description make it so it only calcs fitness
 * @return {*}
 */
function fitness() {
  let bestParents = [];
  for (let y = 0; y < tetris.length; y++) {
    for (let x = 0; x < tetris[0].length; x++) {
      const curScore = tetris[y][x].score +
        (tetris[y][x].numShapesUsed * 100) +
        (tetris[y][x].numRowsCleared * 10000);
      tetris[y][x].fitness = curScore;
      bestParents.push(tetris[y][x]);
    }
  }
  bestParents.sort((a, b) => a.fitness < b.fitness ?
                    1: a.fitness > b.fitness ? -1 : 0);
  const numParents = Math.ceil(n *.02);
  const worstParents = bestParents.slice(numParents, bestParents.length);
  worstParents.forEach((tet) => tet.dispose());
  bestParents = bestParents.slice(0, numParents);


  bestParents.forEach((tet) => console.log(
      'fitness: ' + tet.fitness + ', score: ' + tet.score +
      ', num shapes: ' + tet.numShapesUsed + ', num rows:' +
      + tet.numRowsCleared));
  return bestParents; // return array of best parents top n *.05 best scorers
}

/**
 * create a pickone function
 * @description
 * @param {Array} bestParents
 * @return {*}
 */
function pickone(bestParents) {
  const oneIndex = Math.floor(Math.random() * bestParents.length);
  return bestParents[oneIndex].brain;
}

main();
