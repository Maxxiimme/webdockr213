
window.addEventListener('load', drawConstellation);
window.addEventListener('resize', drawConstellation);

function drawConstellation() {
    const svg = document.getElementById('constellation-svg');
    if (!svg) return;
    
    svg.innerHTML = '';

    const nodes = document.querySelectorAll('.node');
    if (nodes.length < 2) return;

    const connections = generateRandomConnections(nodes.length);

    const nodePoints = [];
    nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
      
        const parentRect = svg.getBoundingClientRect();
        
        nodePoints.push({
            x: rect.left + rect.width / 2 - parentRect.left,
            y: rect.top + rect.height / 2 - parentRect.top
        });
    });

  
    const svgNS = "http://www.w3.org/2000/svg";
    connections.forEach(pair => {
        const start = nodePoints[pair[0]];
        const end = nodePoints[pair[1]];

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", start.x);
        line.setAttribute("y1", start.y);
        line.setAttribute("x2", end.x);
        line.setAttribute("y2", end.y);
        
        svg.appendChild(line);
    });
}

function generateRandomConnections(numNodes) {
    const pairs = [];
    
    const existingConnections = new Set();

    const availableNodes = Array.from({length: numNodes}, (_, i) => i);
    shuffleArray(availableNodes); 
    for (let i = 0; i < availableNodes.length - 1; i++) {
        addConnection(availableNodes[i], availableNodes[i+1], pairs, existingConnections);
    }

    for (let i = 0; i < 3; i++) {
        const n1 = Math.floor(Math.random() * numNodes);
        let n2 = Math.floor(Math.random() * numNodes);
       
        while (n1 === n2) {
            n2 = Math.floor(Math.random() * numNodes);
        }
        addConnection(n1, n2, pairs, existingConnections);
    }

    return pairs;
}
function addConnection(id1, id2, pairsArr, setObj) {
    const key = [id1, id2].sort().join('-'); 
    if (!setObj.has(key)) {
        setObj.add(key);
        pairsArr.push([id1, id2]);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}