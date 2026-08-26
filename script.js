/* =============================================================================
   Advanced fx-991MS Matrix Workspace — Client-Side Calculator Engine
   ---------------------------------------------------------------------------
   Every calculation mode (COMP, CMPLX, BASE-N, EQN, MATRIX, VECTOR) runs
   entirely in the browser using math.js. There is no backend/API call of
   any kind, so this file can be hosted on any static host (GitHub Pages,
   Netlify, Vercel, S3, etc.) with no server component required.
============================================================================= */

let currentExpression = "";
let selectedBaseNType = "DEC";
let previousBaseNType = "DEC";
let keyboardBuffer = "";

// ---------------------------------------------------------------------------
// BASIC SCREEN / KEY HANDLING
// ---------------------------------------------------------------------------
function pressKey(value) {
    let safeValue = value.toLowerCase();
    currentExpression += safeValue;
    document.getElementById("screenInput").innerText = currentExpression;
}

function clearScreen() {
    currentExpression = currentExpression.slice(0, -1);
    document.getElementById("screenInput").innerText = currentExpression || "";
    keyboardBuffer = "";
}

function resetCalculator() {
    currentExpression = "";
    keyboardBuffer = "";

    document.getElementById("screenInput").innerText = "";
    document.getElementById("screenResult").innerText = "0";

    setAiStatus("Client-Side Engine");
    switchMode();
}

function balanceParentheses(expr) {
    let openCount = (expr.match(/\(/g) || []).length;
    let closeCount = (expr.match(/\)/g) || []).length;
    while (openCount > closeCount) {
        expr += ")";
        closeCount++;
    }
    return expr;
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    if (currentTheme === "light") {
        document.body.removeAttribute("data-theme");
    } else {
        document.body.setAttribute("data-theme", "light");
    }
}

function setAiStatus(text) {
    const aiStatus = document.getElementById("aiStatus");
    if (aiStatus) aiStatus.innerText = text;
}

// ---------------------------------------------------------------------------
// DYNAMIC WORKSPACE / MODE SWITCHING (UI ONLY — UNCHANGED BEHAVIOR)
// ---------------------------------------------------------------------------
function switchMode() {
    const activeMode = document.getElementById("modeSelect").value;
    document.getElementById("screenModeIndicator").innerText = activeMode;

    const workspace = document.getElementById("dynamicWorkspace");
    const baseBtn = document.getElementById("baseBtn");
    const bracketRight = document.getElementById("bracketRight");

    workspace.innerHTML = "";
    if (baseBtn) baseBtn.style.display = "none";
    if (bracketRight) bracketRight.style.display = "block";

    if (activeMode === "EQN") {
        workspace.innerHTML = `
            <div><strong>Quadratic Formula Coeffs:</strong></div>
            <div class="coeff-grid" style="grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px;">
                <input type="number" id="coeffA" placeholder="a" value="1">
                <input type="number" id="coeffB" placeholder="b" value="-5">
                <input type="number" id="coeffC" placeholder="c" value="6">
            </div>`;
    }
    else if (activeMode === "MATRIX") {
        let htmlContent = `
            <div id="matrixControlPanel" style="display:flex; gap:8px; margin-bottom:12px;">
                <div style="flex:1;">
                    <strong style="margin-bottom:4px; display:block;">Dimension:</strong>
                    <select id="matrixSize" onchange="triggerGridRebuild()" style="width:100%; padding:6px; background:#161920; color:#fff; border:1px solid var(--calc-border); border-radius:8px; font-weight:600; outline:none; cursor:pointer;">
                        <option value="2">2 x 2 Grid</option>
                        <option value="3">3 x 3 Grid</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <strong style="margin-bottom:4px; display:block;">Operation:</strong>
                    <select id="matrixOp" onchange="triggerGridRebuild()" style="width:100%; padding:6px; background:#161920; color:#fff; border:1px solid var(--calc-border); border-radius:8px; font-weight:600; outline:none; cursor:pointer;">
                        <option value="MUL">A × B (Multiply)</option>
                        <option value="DET">DET (Determinant)</option>
                        <option value="INV">INV (Inverse)</option>
                        <option value="TRANSPOSE">TRANSPOSE (A only)</option>
                    </select>
                </div>
            </div>
            <div id="matrixGridsContainer"></div>
        `;

        workspace.innerHTML = htmlContent;

        window.triggerGridRebuild = function() {
            const currentSize = parseInt(document.getElementById("matrixSize").value, 10);
            const currentOp = document.getElementById("matrixOp").value;
            const container = document.getElementById("matrixGridsContainer");

            if (!container) return;

            let gridHtml = ``;

            gridHtml += `<div style="margin-bottom:6px; font-weight:bold; font-size:0.75rem; text-transform:uppercase; color:#8b949e;">Matrix A:</div>`;
            gridHtml += `<div class="matrix-grid" style="grid-template-columns: repeat(${currentSize}, 1fr); margin-bottom:14px; display:grid; gap:8px;">`;
            for (let i = 0; i < currentSize; i++) {
                for (let j = 0; j < currentSize; j++) {
                    let defaultValue = (i === j) ? 1 : 0;
                    gridHtml += `<input type="number" id="m_a${i}${j}" value="${defaultValue}" step="any" style="width:100%; text-align:center; padding:8px; border-radius:8px; background:#161920; color:#fff; border:1px solid var(--calc-border); font-weight:600; outline:none;">`;
                }
            }
            gridHtml += `</div>`;

            const displayStyle = (currentOp === "MUL") ? "block" : "none";
            gridHtml += `<div id="matrixBContainer" style="display: ${displayStyle};">`;
            gridHtml += `<div style="margin-bottom:6px; font-weight:bold; font-size:0.75rem; text-transform:uppercase; color:#8b949e;">Matrix B:</div>`;
            gridHtml += `<div class="matrix-grid" style="grid-template-columns: repeat(${currentSize}, 1fr); margin-bottom:4px; display:grid; gap:8px;">`;
            for (let i = 0; i < currentSize; i++) {
                for (let j = 0; j < currentSize; j++) {
                    let defaultValue = (i === j) ? 1 : 0;
                    gridHtml += `<input type="number" id="m_b${i}${j}" value="${defaultValue}" step="any" style="width:100%; text-align:center; padding:8px; border-radius:8px; background:#161920; color:#fff; border:1px solid var(--calc-border); font-weight:600; outline:none;">`;
                }
            }
            gridHtml += `</div></div>`;

            container.innerHTML = gridHtml;
        };

        triggerGridRebuild();
    }
    else if (activeMode === "VECTOR") {
        workspace.innerHTML = `
            <div><strong>Vectors (3D Layout):</strong></div>
            <div class="vector-grid" style="grid-template-columns: repeat(3, 1fr);">
                <input type="number" id="v_a1" value="1"> <input type="number" id="v_a2" value="2"> <input type="number" id="v_a3" value="3">
                <input type="number" id="v_b1" value="4"> <input type="number" id="v_b2" value="5"> <input type="number" id="v_b3" value="6">
            </div>
            <select id="vectorOp" style="color:#fff; background:#222; border-radius:4px; padding:4px; margin-top:5px;">
                <option value="DOT">Dot Product</option>
                <option value="CROSS">Cross Product</option>
            </select>`;
    }
    else if (activeMode === "BASE_N") {
        workspace.innerHTML = `
            <div><strong>Base-N Expression Entry:</strong></div>
            <input type="text" id="baseNInput" placeholder="Enter Base Value" style="width:100%; margin-top:5px; background:#222; color:#fff; border:1px solid #444; padding:4px; border-radius:4px;">`;

        if (baseBtn) baseBtn.style.display = "block";
        if (bracketRight) bracketRight.style.display = "none";
        setBaseN(selectedBaseNType);
    }
}

function setBaseN(baseType) {
    previousBaseNType = selectedBaseNType;
    selectedBaseNType = baseType.toUpperCase();

    const subIndicator = document.getElementById("screenBaseIndicator");
    if (subIndicator) subIndicator.innerText = selectedBaseNType;

    const buttons = { 'DEC': 'decBtn', 'HEX': 'hexBtn', 'BIN': 'binBtn', 'OCT': 'octBtn' };
    Object.keys(buttons).forEach(key => {
        const btnElement = document.getElementById(buttons[key]);
        if (btnElement) {
            if (key === selectedBaseNType) {
                btnElement.style.border = "1px solid #00ff00";
                btnElement.style.background = "#333";
            } else {
                btnElement.style.border = "none";
                btnElement.style.background = "";
            }
        }
    });

    const inputField = document.getElementById("baseNInput");
    if (currentExpression || (inputField && inputField.value)) {
        triggerCalculation(true);
    }
}

// ---------------------------------------------------------------------------
// MATH ENGINE (formerly server-side, now 100% client-side via math.js)
// ---------------------------------------------------------------------------
function roundClean(num, decimals = 10) {
    if (typeof num !== "number" || !isFinite(num)) return String(num);
    const rounded = parseFloat(num.toFixed(decimals));
    return rounded.toString();
}

function toPlainNumber(value) {
    if (typeof value === "number") return value;
    if (value && typeof value.toNumber === "function") return value.toNumber();
    if (typeof value === "boolean") return value ? 1 : 0;
    return Number(value);
}

function isComplexValue(value) {
    return value && typeof value === "object" && "re" in value && "im" in value;
}

function formatComplexResult(value, decimals = 5) {
    let re, im;
    if (isComplexValue(value)) {
        re = value.re;
        im = value.im;
    } else {
        re = toPlainNumber(value);
        im = 0;
    }

    if (Math.abs(im) < 1e-9) return roundClean(re, decimals);
    if (Math.abs(re) < 1e-9) return `${roundClean(im, decimals)}i`;

    const sign = im >= 0 ? "+" : "-";
    return `${roundClean(re, decimals)} ${sign} ${roundClean(Math.abs(im), decimals)}i`;
}

function formatNumericResult(value) {
    if (isComplexValue(value)) {
        if (Math.abs(value.im) < 1e-9) return roundClean(value.re, 10);
        return formatComplexResult(value, 5);
    }
    if (Array.isArray(value) || (value && value.isMatrix)) {
        return math.format(value);
    }
    return roundClean(toPlainNumber(value), 10);
}

// Normalizes calculator display syntax (π, log/ln, ^, degree trig) into
// math.js-compatible expression syntax.
function preprocessExpression(rawExpr, useDegrees) {
    let expr = rawExpr.replace(/\s+/g, "");

    // π -> pi, with explicit multiplication where needed (e.g. "2π" -> "2*pi")
    expr = expr.replace(/(\d)π/g, "$1*pi");
    expr = expr.replace(/π(\d)/g, "pi*$1");
    expr = expr.replace(/π/g, "pi");

    // Distinguish calculator "log(" (base-10) from "ln(" (natural log).
    // math.js: log(x) = natural log, log10(x) = base-10 log.
    expr = expr.replace(/ln\(/g, "\u0000LN\u0000(");
    expr = expr.replace(/log\(/g, "log10(");
    expr = expr.replace(/\u0000LN\u0000\(/g, "log(");

    if (useDegrees) {
        expr = expr.replace(/sin\(([^)]+)\)/g, "sin($1 deg)");
        expr = expr.replace(/cos\(([^)]+)\)/g, "cos($1 deg)");
        expr = expr.replace(/tan\(([^)]+)\)/g, "tan($1 deg)");
    }

    return expr;
}

function computeComp(rawExpression) {
    const expr = preprocessExpression(balanceParentheses(rawExpression), true);
    const value = math.evaluate(expr);
    return formatNumericResult(value);
}

function computeCmplx(rawExpression) {
    const expr = preprocessExpression(balanceParentheses(rawExpression), false);
    const value = math.evaluate(expr);
    return formatComplexResult(value, 5);
}

function computeBaseN(rawExpression, baseLabel) {
    const baseMap = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };
    const radix = baseMap[baseLabel.toUpperCase()] || 10;

    let expr = rawExpression.toUpperCase().replace(/\s+/g, "");

    let pattern;
    if (radix === 16) pattern = /[0-9A-F]+/g;
    else if (radix === 10) pattern = /[0-9]+/g;
    else if (radix === 8) pattern = /[0-7]+/g;
    else pattern = /[01]+/g;

    const decimalExpr = expr.replace(pattern, (match) => parseInt(match, radix).toString(10));
    const result = math.evaluate(decimalExpr);
    const num = toPlainNumber(result);

    return Number.isInteger(num) ? num.toString() : num.toString();
}

function computeEqn(a, b, c) {
    if (a === 0) return "Math ERROR (a cannot be 0)";

    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
        const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return `x1=${roundClean(r1, 4)}, x2=${roundClean(r2, 4)}`;
    }

    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
    return `x1=${roundClean(realPart, 4)}+${roundClean(imagPart, 4)}i, x2=${roundClean(realPart, 4)}-${roundClean(imagPart, 4)}i`;
}

function roundMatrixArray(arr, decimals) {
    return arr.map((row) =>
        Array.isArray(row)
            ? row.map((v) => parseFloat(Number(v).toFixed(decimals)))
            : parseFloat(Number(row).toFixed(decimals))
    );
}

function computeMatrix(matrixA, matrixB, operation) {
    operation = (operation || "").toUpperCase();
    const A = math.matrix(matrixA);

    if (operation === "DET") {
        return roundClean(math.det(A), 5);
    }
    if (operation === "INV") {
        if (Math.abs(math.det(A)) < 1e-12) return "Math ERROR (Singular Matrix)";
        const inv = math.inv(A);
        return JSON.stringify(roundMatrixArray(inv.toArray(), 5));
    }
    if (operation === "MUL" || operation === "MULTIPLY") {
        if (!matrixB || matrixB.length === 0) return "SYN ERROR: Missing Matrix B";
        const B = math.matrix(matrixB);
        const result = math.multiply(A, B);
        return JSON.stringify(roundMatrixArray(result.toArray(), 5));
    }
    if (operation === "TRANSPOSE") {
        return JSON.stringify(math.transpose(A).toArray());
    }
    return "Unknown Matrix Action";
}

function computeVector(vectorA, vectorB, operation) {
    operation = (operation || "").toUpperCase();
    if (operation === "DOT") {
        return roundClean(math.dot(vectorA, vectorB), 5);
    }
    if (operation === "CROSS") {
        const result = math.cross(vectorA, vectorB);
        return JSON.stringify(Array.isArray(result) ? result : result.toArray());
    }
    return "Unknown Vector Action";
}

// ---------------------------------------------------------------------------
// CALCULATION DISPATCH (was a fetch() to a Flask API — now purely local)
// ---------------------------------------------------------------------------
function triggerCalculation(isConversion = false) {
    const mode = document.getElementById("modeSelect").value;

    document.getElementById("screenResult").innerText = "CALC...";
    setAiStatus("Computing...");

    try {
        let finalOutput;

        if (mode === "COMP") {
            if (!currentExpression) return;
            finalOutput = computeComp(currentExpression);
        }
        else if (mode === "CMPLX") {
            if (!currentExpression) return;
            finalOutput = computeCmplx(currentExpression);
        }
        else if (mode === "BASE_N") {
            const inputField = document.getElementById("baseNInput");
            const baseExpression = (inputField && inputField.value) ? inputField.value : currentExpression;
            if (!baseExpression) return;

            const baseForCalc = isConversion ? previousBaseNType : selectedBaseNType;
            finalOutput = computeBaseN(baseExpression, baseForCalc);

            if (isConversion) {
                const decimalInt = parseInt(finalOutput, 10);
                if (selectedBaseNType === "HEX") finalOutput = decimalInt.toString(16).toUpperCase();
                else if (selectedBaseNType === "BIN") finalOutput = decimalInt.toString(2);
                else if (selectedBaseNType === "OCT") finalOutput = decimalInt.toString(8);
                else finalOutput = decimalInt.toString(10);
            }
        }
        else if (mode === "EQN") {
            const rawA = document.getElementById("coeffA").value.toString().trim();
            const rawB = document.getElementById("coeffB").value.toString().trim();
            const rawC = document.getElementById("coeffC").value.toString().trim();
            const a = parseFloat(rawA) || 0;
            const b = parseFloat(rawB) || 0;
            const c = parseFloat(rawC) || 0;
            finalOutput = computeEqn(a, b, c);
        }
        else if (mode === "MATRIX") {
            const size = parseInt(document.getElementById("matrixSize").value, 10);
            const op = document.getElementById("matrixOp").value;

            let matrixA = [];
            let matrixB = [];
            for (let i = 0; i < size; i++) {
                let rowA = [];
                let rowB = [];
                for (let j = 0; j < size; j++) {
                    const elementA = document.getElementById(`m_a${i}${j}`);
                    rowA.push(elementA ? (parseFloat(elementA.value) || 0) : 0);

                    const elementB = document.getElementById(`m_b${i}${j}`);
                    rowB.push(elementB ? (parseFloat(elementB.value) || 0) : 0);
                }
                matrixA.push(rowA);
                matrixB.push(rowB);
            }

            finalOutput = computeMatrix(matrixA, matrixB, op);
        }
        else if (mode === "VECTOR") {
            const vectorA = [
                parseFloat(document.getElementById("v_a1").value) || 0,
                parseFloat(document.getElementById("v_a2").value) || 0,
                parseFloat(document.getElementById("v_a3").value) || 0
            ];
            const vectorB = [
                parseFloat(document.getElementById("v_b1").value) || 0,
                parseFloat(document.getElementById("v_b2").value) || 0,
                parseFloat(document.getElementById("v_b3").value) || 0
            ];
            const operation = document.getElementById("vectorOp").value;
            finalOutput = computeVector(vectorA, vectorB, operation);
        }
        else {
            document.getElementById("screenResult").innerText = "MODE ERROR";
            setAiStatus("Client-Side Engine");
            return;
        }

        if (typeof finalOutput === "object") {
            finalOutput = JSON.stringify(finalOutput);
        }

        document.getElementById("screenResult").innerText = finalOutput;
        setAiStatus("Client-Side Engine");

        if (mode === "COMP" || mode === "CMPLX" || mode === "BASE_N") {
            document.getElementById("screenInput").innerText = "";
            currentExpression = finalOutput.toString();
            const inputField = document.getElementById("baseNInput");
            if (inputField && mode === "BASE_N") {
                inputField.value = finalOutput.toString();
            }
        }
    } catch (err) {
        document.getElementById("screenResult").innerText = "SYN ERROR";
        setAiStatus("Client-Side Engine");
        console.error(err);
    }
}

// ---------------------------------------------------------------------------
// KEYBOARD & PASTE SUPPORT (UNCHANGED)
// ---------------------------------------------------------------------------
document.addEventListener('keydown', function(event) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

    const key = event.key;
    const mode = document.getElementById("modeSelect").value;

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'v') {
        return;
    }

    if (key.toLowerCase() === 'i') {
        event.preventDefault();
        pressKey('i');
        return;
    }

    if (mode === "BASE_N" && /[a-fA-F]/.test(key) && key.length === 1) {
        event.preventDefault();
        pressKey(key);
    }
    else if (/[0-9]/.test(key) || ['+', '-', '*', '/', '.', ')', '(', '^'].includes(key)) {
        event.preventDefault();
        keyboardBuffer = "";
        pressKey(key);
    }
    else if (/[a-zA-Z]/.test(key) && key.length === 1) {
        event.preventDefault();
        keyboardBuffer += key.toLowerCase();
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        triggerCalculation();
    } else if (key === 'Backspace') {
        event.preventDefault();
        clearScreen();
    } else if (key === 'Escape') {
        event.preventDefault();
        resetCalculator();
    }
});

document.addEventListener('paste', function(event) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

    event.preventDefault();

    let pastedData = (event.clipboardData || window.clipboardData).getData('text');

    if (pastedData) {
        let cleanPaste = pastedData.replace(/\s+/g, '').toLowerCase();
        currentExpression += cleanPaste;
        document.getElementById("screenInput").innerText = currentExpression;
    }
});

window.onload = switchMode;
