// ========== GLOBALS ==========
let processes = [];
let quantum = 2;

// ========== INPUT HANDLER ==========
function generateProcesses() {
    const input = document.getElementById('arrayInput').value;
    processes = input.split('|').map(str => {
        const [pid, arrival, burst, priority] = str.trim().split(',');
        return {
            pid: pid.trim(),
            arrival: parseInt(arrival),
            burst: parseInt(burst),
            priority: priority ? parseInt(priority) : 0,
            remaining: parseInt(burst),
            start: null,
            finish: null
        };
    }).filter(p => !isNaN(p.arrival) && !isNaN(p.burst));
}

// ========== GANTT DRAWER ==========
function drawGanttChart(schedule) {
    const container = document.getElementById('arrayContainer');
    container.innerHTML = '';
    schedule.forEach(proc => {
        const block = document.createElement('div');
        block.className = 'element';
        block.innerText = `${proc.pid}\n[${proc.start}-${proc.finish}]`;
        block.style.width = `${(proc.finish - proc.start) * 40}px`;
        container.appendChild(block);
    });
}

// ========== FCFS ==========
async function fcfsScheduling(delay) {
    generateProcesses();
    processes.sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const schedule = [];
    for (let proc of processes) {
        proc.start = Math.max(time, proc.arrival);
        proc.finish = proc.start + proc.burst;
        time = proc.finish;
        schedule.push({ ...proc });
        drawGanttChart(schedule);
        await sleep(delay);
    }
    showDetails('fcfs');
}

// ========== SJF NON-PREEMPTIVE ==========
async function sjfNonPreemptive(delay) {
    generateProcesses();
    let time = 0;
    const schedule = [];
    const queue = [];
    let done = 0;

    while (done < processes.length) {
        queue.push(...processes.filter(p => p.arrival <= time && !p.done));
        queue.sort((a, b) => a.burst - b.burst);

        if (queue.length === 0) {
            time++;
            continue;
        }

        const current = queue.shift();
        current.start = time;
        current.finish = time + current.burst;
        current.done = true;
        time = current.finish;
        schedule.push({ ...current });
        drawGanttChart(schedule);
        await sleep(delay);
    }
    showDetails('sjf');
}

// ========== PRIORITY SCHEDULING ==========
async function priorityScheduling(delay) {
    generateProcesses();
    let time = 0;
    const schedule = [];
    const queue = [];
    let done = 0;

    while (done < processes.length) {
        queue.push(...processes.filter(p => p.arrival <= time && !p.done));
        queue.sort((a, b) => a.priority - b.priority);

        if (queue.length === 0) {
            time++;
            continue;
        }

        const current = queue.shift();
        current.start = time;
        current.finish = time + current.burst;
        current.done = true;
        time = current.finish;
        schedule.push({ ...current });
        drawGanttChart(schedule);
        await sleep(delay);
    }
    showDetails('priority');
}

// ========== ROUND ROBIN ==========
async function roundRobinScheduling(delay) {
    generateProcesses();
    quantum = parseInt(document.getElementById('quantumInput').value);
    const schedule = [];
    let time = 0;
    const readyQueue = [];
    const arrived = [...processes];

    while (arrived.length > 0 || readyQueue.length > 0) {
        arrived.sort((a, b) => a.arrival - b.arrival);
        while (arrived.length > 0 && arrived[0].arrival <= time) {
            readyQueue.push(arrived.shift());
        }

        if (readyQueue.length === 0) {
            time++;
            continue;
        }

        const current = readyQueue.shift();
        const execTime = Math.min(current.remaining, quantum);
        const start = time;
        const finish = start + execTime;
        current.remaining -= execTime;
        time = finish;

        schedule.push({ pid: current.pid, start, finish });

        if (current.remaining > 0) {
            current.arrival = time;
            arrived.push(current);
        }

        drawGanttChart(schedule);
        await sleep(delay);
    }
    showDetails('rr');
}

// ========== HELPER ==========
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showDetails(type) {
    displayAlgorithmCode(type);
    displayAlgorithmExplanation(type);
}

async function startScheduling() {
    const algorithm = document.getElementById('sortAlgorithm').value;
    const speed = parseInt(document.getElementById('speed').value);

    if (algorithm === 'fcfs') {
        await fcfsScheduling(speed);
    } else if (algorithm === 'sjf') {
        await sjfNonPreemptive(speed);
    } else if (algorithm === 'priority') {
        await priorityScheduling(speed);
    } else if (algorithm === 'rr') {
        await roundRobinScheduling(speed);
    }
}

// ========== DISPLAY CODE & EXPLANATION (PLACEHOLDER) ==========
function displayAlgorithmCode(type) {
    const codeContainer = document.getElementById('codeContainer');
    codeContainer.innerText = `Code for ${type.toUpperCase()} scheduling goes here.`;
}

function displayAlgorithmExplanation(type) {
    const explanationContainer = document.getElementById('explanationContainer');
    explanationContainer.innerText = `Explanation for ${type.toUpperCase()} scheduling.`;
}
