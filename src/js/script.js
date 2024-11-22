document.addEventListener('DOMContentLoaded', () =>{
    const body = document.querySelector('body');
    body.addEventListener('click', listener);
})

let sudokuInicial = [], contador = 0;

const tamañoPoblacion = 100, maxGeneraciones = 5000;
function listener(event) {
    
    if(event.target && event.target.id == 'generar') generar();
    if(event.target && event.target.id == 'buscar_solucion') buscar_solucion();
    if (event.target && event.target.id == 'solucion') solucionar();
    if(event.target && event.target.id == 'clear') location.reload();
    
}

function generar() {
    llenar_tablero();
    closeModal('solucion');
    closeModal('scream');
}

function buscar_solucion() {
    alert("oh no\nAun no funciona esta opcion));");
    //closeModal('scream');
}


function closeModal(clase) {
    return new Promise((resolve) => {
        console.log(clase);
        let modal = document.querySelector('.'+clase);
        modal.classList.toggle('load');

        setTimeout(() => {
            resolve();  
        }, 1);  
    });
}


function llenar_tablero(){
    let nT = tb_BD.length;
    tablero = tb_BD[Math.floor( Math.random() * nT)];
    console.log(tablero);
    sudokuInicial = tablero;
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero.length; j++) {
            if(tablero[i][j] != 0){
                let casilla = document.getElementById(`casilla_${i}${(j+1)}`);
                casilla.value = tablero[i][j];
            }
        }   
    }

}

async function solucionar(){
    
    await closeModal('screamloader');

    const resuelto = new Promise((resolve, reject) => {
        let estado = algoritmoGenetico(sudokuInicial);

        if(estado) resolve("Se encontro solucion en una generacion!!");
        else reject("No se encontro solucion en el numero de generaciones permitido");
    });
    
    resuelto.then((mensaje) => {
        console.log(mensaje);
        alert(mensaje);
    }).catch((error)=>{
        console.log(error);
        alert(error)
    }).finally(()=>{
        closeModal('screamloader');
        closeModal('clear');
        closeModal('solucion');
    })
}

function generarIndividuo(sudokuInicial) {
    let individuo = _.cloneDeep(sudokuInicial);
    for (let fila = 0; fila < 9; fila++) {
        let numerosFaltantes = _.shuffle(obtenerNumerosFaltantes(sudokuInicial, fila));
        for (let columna = 0; columna < 9; columna++) {
        if (sudokuInicial[fila][columna] === 0) {
            individuo[fila][columna] = numerosFaltantes.pop();
        }
        }
    }
    return individuo;
}

function obtenerNumerosFaltantes(sudoku, fila) {
    const numeros = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let num of sudoku[fila]) {
        numeros.delete(num);
    }
    return Array.from(numeros);
}

function calcularFitness(individuo) {
    let fitness = 0;

    for (let fila = 0; fila < 9; fila++) {
        const filaSet = new Set(individuo[fila]);
        fitness += filaSet.size;
    }

    for (let columna = 0; columna < 9; columna++) {
        const columnaSet = new Set();
        for (let fila = 0; fila < 9; fila++) {
            columnaSet.add(individuo[fila][columna]);
        }
        fitness += columnaSet.size;
    }

    return fitness;
}

function seleccionPorRuleta(poblacion) {
    const totalFitness = poblacion.reduce((sum, individuo) => sum + calcularFitness(individuo), 0);
    let seleccion = Math.random() * totalFitness;
    let suma = 0;

    for (let individuo of poblacion) {
        suma += calcularFitness(individuo);
        if (suma >= seleccion) {
            return individuo;
        }
    }
}   


function seleccionPorTorneo(poblacion) {
    const torneo = _.sampleSize(poblacion, 3);
    torneo.sort((a, b) => calcularFitness(b) - calcularFitness(a));
    return torneo[0];
}

function cruce(individuo1, individuo2) {
    const hijo1 = _.cloneDeep(individuo1);
    const hijo2 = _.cloneDeep(individuo2);
    
    const puntoDeCruce = Math.floor(Math.random() * 9);

    for (let i = 0; i < puntoDeCruce; i++) {
        [hijo1[i], hijo2[i]] = [hijo2[i], hijo1[i]];
    }

    return [hijo1, hijo2];
}

function cruceDeDosPuntos(individuo1, individuo2) {
    const hijo1 = _.cloneDeep(individuo1);
    const hijo2 = _.cloneDeep(individuo2);

    let puntoDeCruce1 = Math.floor(Math.random() * 9);
    let puntoDeCruce2 = Math.floor(Math.random() * 9); 

    if (puntoDeCruce1 > puntoDeCruce2) {
        [puntoDeCruce1, puntoDeCruce2] = [puntoDeCruce2, puntoDeCruce1];
    }

    for (let i = puntoDeCruce1; i < puntoDeCruce2; i++) {
        [hijo1[i], hijo2[i]] = [hijo2[i], hijo1[i]];
    }

    return [hijo1, hijo2];
}

function mutacionCombinada(individuo) {
    if (Math.random() < 0.5) {
        return mutacion(individuo);
    } else {
        return mutacionPorInversion(individuo);
    }
}


function mutacion(individuo) {
    const fila = Math.floor(Math.random() * 9);
    const col1 = Math.floor(Math.random() * 9);
    const col2 = Math.floor(Math.random() * 9);
    if (col1 !== col2 && sudokuInicial[fila][col1] === 0 && sudokuInicial[fila][col2] === 0) {
        [individuo[fila][col1], individuo[fila][col2]] = [individuo[fila][col2], individuo[fila][col1]];
    }
    return individuo;
}

function algoritmoGenetico(sudokuInicial) {
    let poblacion = [];

    for (let i = 0; i < tamañoPoblacion; i++) {
        poblacion.push(generarIndividuo(sudokuInicial));
    }

    let mejorIndividuo = poblacion[0];
    let mejorFitness = calcularFitness(mejorIndividuo);

    for (let generacion = 0; generacion < maxGeneraciones; generacion++) {

        poblacion.sort((a, b) => calcularFitness(b) - calcularFitness(a));

        if (calcularFitness(poblacion[0]) > mejorFitness) {
        mejorIndividuo = _.cloneDeep(poblacion[0]);
        mejorFitness = calcularFitness(mejorIndividuo);
    }

    

    if (mejorFitness === 162) {
        console.log("¡Solución encontrada en la generación", generacion, "!");
        tablero = mejorIndividuo;
        cambio(tablero);
        imprimirSudoku(mejorIndividuo);
        return true;
    }

    const nuevaPoblacion = [];
    while (nuevaPoblacion.length < tamañoPoblacion) {
        const padre1 = seleccionPorTorneo(poblacion);
        const padre2 = seleccionPorTorneo(poblacion);

        let [hijo1, hijo2] = cruce(padre1, padre2);

        hijo1 = mutacion(hijo1);
        hijo2 = mutacion(hijo2);

        nuevaPoblacion.push(hijo1, hijo2);
    }

    poblacion = nuevaPoblacion;

    console.log(contador++);
}

    console.log("No se encontró solución en el número de generaciones permitido.");
    imprimirSudoku(mejorIndividuo);
    tablero = mejorIndividuo;
    cambio(tablero);
    return false;
}

function imprimirSudoku(sudoku) {
    sudoku.forEach(fila => {
        console.log(fila.join(' '));
    });
}

function cambio(tablero){
    return new Promise((resolve) => {
        setTimeout(() => {
            for (let i = 0; i < tablero.length; i++) {
                for (let j = 0; j < tablero.length; j++) {
                    if(tablero[i][j] != 0){
                        let casilla = document.getElementById(`casilla_${i}${(j+1)}`);
                        casilla.value = tablero[i][j];
                    }
                }   
            }
        }, 500);
    })
}



