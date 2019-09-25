/**
 Objet: Algo Num project
 Date: 14 juin 2019
 Nathan Latino
 */

//DATA GLOBAL
let data = {
    timeoutResolve : null,
    generateSudoku : null,
    size: null,
    base: [],
    result: [],
    cnsData: [],
    time: null,
    canvas : null,
	ctx : null,
    sizeFont : null,
    resolveTimer : null,
    sizeGrid : {
        w: null,
        h: null
    },
    sizeSquare : {
        w: null,
        h: null
    },
    selectedRect: null,
    difficulty : null,
    creator : null
};

//SET DE SUDOKU
function setCustomSudoku(data){
    data.size = data;
    data.result = [];
    data.base = arrayClone(data);

    data.result = arrayClone(data.base);
}

//set a random sudoku
function randomSudoku(){
    data.base = arrayClone(generateRandom());
    data.result = arrayClone(data.base);
    redrawSudoku(data.result);
}

//generate a random sudoku resolvable
function generateRandom(){
    data.generateSudoku = true;
    let tabRand = [];
    do {

        tabRand = [];
        emptyTab(data.size, tabRand);
        let number = 1;

        while(number <= data.size){
            let i = Math.floor(Math.random()*data.size);
            let j = Math.floor(Math.random()*data.size);

            if(tabRand[i][j] === 0){
                tabRand[i][j] = number++;
            }
        }
    } while(!solver(tabRand, data.size));

    let totValue = data.size * data.size - (data.size * 1/data.difficulty * 6); //difficulté
    while(0 < totValue) {
        let i = Math.floor(Math.random()*data.size);
        let j = Math.floor(Math.random()*data.size);

        if(tabRand[i][j] !== 0){
            tabRand[i][j] = 0;
            totValue--;
        }
    }
    data.generateSudoku = false;
    return tabRand;
}

//set a sudoku from json file
function loadSudoku(file) {
    let tempSize = data.size;
    if (file) {

        let r = new FileReader();
        r.onload = function (e) {
            let contents = JSON.parse(e.target.result);
            tempSize = formatSudoku(contents['n'][0], contents['s']);
            redrawSudoku(data.base);
        };
        r.readAsText(file);
    } else {
        alert("Failed to load file");
    }
    return tempSize;
}

//format the json file in sudoku
function formatSudoku(n, s){
    emptyTab(n, data.base);
    let count = 0;
    for(let i=0; i< s.length; i++){
        if(i%n === 0 && i !== 0){
            count++;
        }
        data.base[i%n][count] = s[i];
    }
    data.size = n;
    resizeSudoku();
    data.result = arrayClone(data.base);
    console.log(n);
    document.getElementById('square').value = Math.sqrt(n);
    return n;
}

//SOLVE SUDOKU
function isInRow(row, number, tab){
    for (let i = 0; i < data.size; i++) {
        if (tab[row][i] === number) {
            return true;
        }
    }
    return false;
}

function isInCol(col, number, tab) {
    for (let i = 0; i < data.size; i++) {
        if (tab[i][col] === number) {
            return true;
        }
    }
    return false;
}

function isInBox(row, col, number, tab) {
    let carre = Math.sqrt(data.size);
    let r = row - row % carre;
    let c = col - col % carre; //change sqrt size

    for(let i = r; i < r + carre; i++){
        for (let j = c; j < c + carre; j++){
            if (tab[i][j] === number){
                return true;
            }
        }
    }
    return false;
}

function isOk(row, col, number, tab) {
    return !isInRow(row, number, tab) && !isInCol(col, number, tab) && !isInBox(row, col, number, tab);
}

//start fastsolver with a timer (timeout)
function solver(tab, size){
    data.timeoutResolve = new Date();
    return fastSolve(tab, size);
}

//fastSolve recursive
function fastSolve(tab, size){
    for (let row = 0; row < size; row++){
        for (let col = 0; col < size; col++){
            if (tab[row][col] === 0) {
                for (let number = 1; number <= size; number++){
                    if(isOk(row, col, number, tab)){
                        let d = new Date();
                        if((d.getSeconds() - data.timeoutResolve.getSeconds()) > 5 && data.generateSudoku === true){
                            return false;
                        }
                        tab[row][col] = number;
                        if (fastSolve(tab,size)) {
                            return true;
                        } else {
                            tab[row][col] = 0;
                        }

                    }
                }
                return false;
            }
        }
    }
    return true;
}

// SOLVE BY STEP
function solveByStep(row, col, back) {
    if (data.base[row][col] !== 0) {
        let tCol = col;
        if(back){
            let tRow = row - 1;
            if(tRow < 0){
                tRow = data.size-1;
                tCol -= 1;
                if(tCol < 0){
                    return false;
                }
            }
            return solveByStep(tRow, tCol, true);
        } else {
            let tRow = row + 1;
            if(tRow === data.size){
                tRow = 0;
                tCol += 1;
                if(tCol === data.size){
                    return false;
                }
            }
            return solveByStep(tRow, tCol, false)
        }
    } else {
        if(back){
            for (let i = data.result[row][col]; i <= data.size; i++){
                if(isOk(row,col,i, data.result)){
                    data.result[row][col] = i;
                    return true;
                }
            }

            data.result[row][col] = 0;
            let tCol = col;
            let tRow = row - 1;
            if(tRow < 0) {
                tRow = data.size - 1;
                tCol -= 1;
                console.log(tCol);
                if (tCol < 0) {
                    return false;
                }
            }
            return solveByStep(tRow, tCol, true);
        } else {
            for (let i = data.result[row][col]; i <= data.size; i++) {
                if (isOk(row, col, i, data.result)) {
                    data.result[row][col] = i;
                    return true;
                }
            }

            data.result[row][col] = 0;
            let tCol = col;
            let tRow = row - 1;
            if(tRow < 0) {
                tRow = data.size - 1;
                tCol -= 1;
                console.log(tCol);
                if (tCol < 0) {
                    return false;
                }
            }
            return solveByStep(tRow, tCol, true);
        }
    }
}

//loop with the solve by step function
function solveTime(time) {
    data.resolveTimer = setInterval(function(){
        let value = firstEmptyValue();
        if(value.row !== null && value.col !== null){
            if(!solveByStep(value.row, value.col, false)){
                clearInterval(data.resolveTimer);
            }
            redrawSudoku(data.result);
        } else {
            console.log("fin du traitement");
            clearInterval(data.resolveTimer);
        } }, time);
}

//DRAW
function redrawValue(value, cx, cy) {
    let pos = {
        x: cx * (data.sizeSquare.w + 2) + 2,
        y: cy * (data.sizeSquare.h + 2) + 2
    };

    data.ctx.textAlign = 'center';
    data.ctx.fillStyle = 'green';
    data.ctx.textBaseLine = 'middle';
    data.ctx.fillRect(pos.x, pos.y, data.sizeSquare.w, data.sizeSquare.h);

    data.ctx.font = data.sizeFont + 'px Arial';
    data.ctx.fillStyle = 'black';

    let temp = "";
    if(value !== 0){
        temp = value;
    }
    data.ctx.fillText(temp, pos.x + data.sizeSquare.w / 2, pos.y + data.sizeFont);

}

//draw all the grid
function redrawSudoku(tab) {

    data.ctx.fillStyle = 'black';
    data.ctx.fillRect(0, 0, data.canvas.width, data.canvas.height);

    let vLine = 0;
    let hLine = 0;
    for (let i = 0; i < data.size; i++) {
        data.cnsData[i] = [];
        if(i % Math.sqrt(data.size) === 0){
            vLine+=2;
        }
        for (let j = 0; j < data.size; j++) {

            if(j % Math.sqrt(data.size) === 0){
                hLine+=2;
            }
            let pos = {
                x: j * (data.sizeSquare.w + 2) + 2 + hLine,
                y: i * (data.sizeSquare.h + 2) + 2 + vLine
            };


            data.ctx.textAlign = 'center';
            data.ctx.fillStyle = 'white';
            data.ctx.textBaseLine = 'middle';

            let sizeH = 0;
            let sizeV = 0;

            data.ctx.fillRect(pos.x + sizeH, pos.y + sizeV, data.sizeSquare.w, data.sizeSquare.h);


            data.ctx.font = data.sizeFont + 'px Arial';
            let temp = "";
            if(tab[j][i] !== 0){
                temp = tab[j][i];
            }

            if(data.base[j][i] !== 0){
                data.ctx.fillStyle = 'blue';

            } else {
                data.ctx.fillStyle = 'black';
            }
            data.ctx.fillText(temp, pos.x + data.sizeSquare.w / 2, pos.y + data.sizeSquare.h / 2 + data.sizeFont/2);
            data.cnsData[i][j] = {x: pos.x + sizeH, y: pos.y + sizeV, w:data.sizeSquare.w, h:data.sizeSquare.h, i:i, j:j};
        }
        hLine = 0;
    }

    drawSelected();
}

//draw the selected cell
function drawSelected(){
    if(data.selectedRect !== null){
        data.ctx.textAlign = 'center';
        data.ctx.fillStyle = 'yellow';
        data.ctx.textBaseLine = 'middle';
        data.ctx.fillRect(data.selectedRect.x, data.selectedRect.y, data.selectedRect.w, data.selectedRect.h);
        data.ctx.fillStyle = 'black';
        if(data.result[data.selectedRect.j][data.selectedRect.i] !== 0){
            data.ctx.fillText(data.result[data.selectedRect.j][data.selectedRect.i], data.selectedRect.x + data.sizeSquare.w / 2, data.selectedRect.y + data.sizeSquare.h / 2 + data.sizeFont/2);
        }
    }
}

//resize grid
function resizeSudoku() {
    clearInterval(data.resolveTimer);
    data.sizeSquare.w = (data.sizeGrid.w - data.size - Math.sqrt(data.size)*7) / data.size;
    data.sizeSquare.h = (data.sizeGrid.w - data.size - Math.sqrt(data.size)*7) / data.size;
    data.cnsData = [];
    data.selectedRect = null;
}
//HELPERS
function arrayClone( arr ) {
    let i, copy;
    if (Array.isArray(arr)) {
        copy = arr.slice(0);
        for (i = 0; i < copy.length; i++) {
            copy[i] = arrayClone(copy[i]);
        }
        return copy;
    } else if (typeof arr === 'object') {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }
}

function emptyTab(size, tab) {
    for(let i = 0; i < size; i++){
        tab[i] = [];
        for(let j = 0; j < size; j++){
            tab[i][j] = 0;
        }
    }
}

function firstEmptyValue(){
    let index = {
        row : null,
        col : null
    };

    for (let col = 0; col < data.size; col++) {
        for (let row = 0; row < data.size; row++) {
            if (data.result[row][col] === 0) {
                index = {row, col};
                return index;
            }
        }
    }
    return index;
}

function collides(rect, x, y) {
    let cx = x - data.canvas.offsetLeft;
    let cy = y - data.canvas.offsetTop;

    return (
        cx > rect.x &&
        cx < (rect.x + rect.w) &&
        cy > (rect.y ) &&
        cy < (rect.y + rect.h)
    );
}

//LOAD START
window.onload = function() {
    data.canvas = document.getElementById('sudoku');
    data.ctx = data.canvas.getContext('2d');
    data.size = 9;
    data.creator = false;
    data.difficulty = 5;
    data.sizeFont = 20 * 16 / data.size;
    data.sizeGrid.w = data.canvas.width;
    data.sizeGrid.h = data.canvas.height;
	data.sizeSquare.w = data.sizeGrid.w / data.size - 3;
	data.sizeSquare.h = data.sizeGrid.h / data.size - 3;


    emptyTab(9, data.result);
    emptyTab(9, data.base);
    redrawSudoku(data.result);

    data.canvas.addEventListener('click', function(e) {

        data.cnsData.forEach(function(element){
            element.forEach(function(value){
                if(collides(value, e.x, e.y)){
                    data.selectedRect = value;
                }
            });

        });
    redrawSudoku(data.result);

    }, false);

    //INPUT
    document.addEventListener('keydown', function(e) {
        let key = e.key;
        let eventKey = e.code;
        let found = null;

        if(data.selectedRect !== null){
            if(eventKey.includes("Numpad") || eventKey.includes("Digit")) {
                let value = parseInt(key) || 0;
                let calc = data.result[data.selectedRect.j][ data.selectedRect.i]*10 + value;
                if( calc <= data.size && calc >= 0){
                    if(data.creator){
                        data.base[data.selectedRect.j][ data.selectedRect.i] = calc;
                        data.result[data.selectedRect.j][ data.selectedRect.i] = calc;
                    }else {
                        if (data.base[data.selectedRect.j][data.selectedRect.i] === 0) {
                            data.result[data.selectedRect.j][data.selectedRect.i] = calc;
                        }
                    }
                } else {
                    if(value <= data.size){
                        if(data.creator) {
                            data.base[data.selectedRect.j][data.selectedRect.i] = value;
                            data.result[data.selectedRect.j][ data.selectedRect.i] = value;
                        } else {
                            if(data.base[data.selectedRect.j][data.selectedRect.i] === 0){
                                data.result[data.selectedRect.j][ data.selectedRect.i] = value;
                            }
                        }
                    }
                }
            }
            if(eventKey.includes("Delete")) {
                if(data.creator) {
                    data.base[data.selectedRect.j][data.selectedRect.i] = 0;
                    data.result[data.selectedRect.j][ data.selectedRect.i] = 0;
                } else {
                    if(data.base[data.selectedRect.j][data.selectedRect.i] === 0){
                        data.result[data.selectedRect.j][ data.selectedRect.i] = 0;
                    }
                }
            }
            if(eventKey.includes("ArrowLeft")){
                data.cnsData.forEach(function(element){
                    element.forEach(function(value){
                        if(data.selectedRect.j - 1 === value.j && data.selectedRect.i === value.i){
                            found = value;
                        }
                    });
                });
            }
            if(eventKey.includes("ArrowRight")){
                data.cnsData.forEach(function(element){
                    element.forEach(function(value){
                        if(data.selectedRect.j + 1 === value.j && data.selectedRect.i === value.i){
                            found = value;
                        }
                    });
                });
            }
            if(eventKey.includes("ArrowUp")){
                data.cnsData.forEach(function(element){
                    element.forEach(function(value){
                        if(data.selectedRect.i - 1 === value.i && data.selectedRect.j === value.j){
                            found = value;
                        }
                    });
                });
            }
            if(eventKey.includes("ArrowDown")){
                data.cnsData.forEach(function(element){
                    element.forEach(function(value){
                        if(data.selectedRect.i + 1 === value.i && data.selectedRect.j === value.j){
                            found = value;
                        }
                    });
                });
            }
            if(found != null){
                data.selectedRect = found;
            }

            redrawSudoku(data.result);
        }
    });

};


