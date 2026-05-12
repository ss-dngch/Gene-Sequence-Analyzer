/* ── Animated helix canvas ── */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, t = 0;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

function drawHelix() {

    ctx.clearRect(0, 0, W, H);

    const cols = Math.ceil(W / 240);

    for (let c = 0; c < cols; c++) {

        const cx = c * 240 + 120;
        const amp = 48;
        const freq = 0.022;

        for (let y = -20; y < H + 20; y += 2) {

            const phase = y * freq + t + c * 1.4;

            const x1 = cx + Math.sin(phase) * amp;
            const x2 = cx + Math.sin(phase + Math.PI) * amp;

            const alpha =
                (Math.sin(phase) * 0.5 + 0.5) * 0.45 + 0.05;

            const alpha2 =
                (Math.sin(phase + Math.PI) * 0.5 + 0.5) * 0.45 + 0.05;

            ctx.fillStyle = `rgba(0,210,180,${alpha})`;
            ctx.fillRect(x1, y, 2, 2);

            ctx.fillStyle = `rgba(0,184,255,${alpha2})`;
            ctx.fillRect(x2, y, 2, 2);

            if (y % 28 < 2) {

                const grad = ctx.createLinearGradient(
                    x1,
                    y,
                    x2,
                    y
                );

                grad.addColorStop(
                    0,
                    `rgba(0,210,180,${alpha * 0.6})`
                );

                grad.addColorStop(
                    1,
                    `rgba(0,184,255,${alpha2 * 0.6})`
                );

                ctx.strokeStyle = grad;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            }
        }
    }

    t += 0.012;

    requestAnimationFrame(drawHelix);
}

drawHelix();

/* ── Drag and drop ── */

const dropZone = document.getElementById('drop-zone');
const fastaInput = document.getElementById('fasta-input');
const fileDisplay = document.getElementById('file-name-display');

fastaInput.addEventListener('change', e => {

    const f = e.target.files[0];

    if (f) {
        fileDisplay.textContent = '📄 ' + f.name;
        readFile(f);
    }
});

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {

    e.preventDefault();

    dropZone.classList.remove('drag-over');

    const f = e.dataTransfer.files[0];

    if (f) {
        fileDisplay.textContent = '📄 ' + f.name;
        readFile(f);
    }
});

function readFile(file) {

    const reader = new FileReader();

    reader.onload = e => {
        document.getElementById('seq-input').value =
            e.target.result;
    };

    reader.readAsText(file);
}

/* ── Backend-connected analysis pipeline ── */

async function runAnalysis() {

    const raw =
        document.getElementById('seq-input').value.trim();

    if (!raw) {
        shakeBtn();
        return;
    }

    const steps = [
        'Sending sequence to Flask backend…',
        'Running BioPython pipeline…',
        'Calculating sequence statistics…',
        'Scanning for ORFs…',
        'Generating results…'
    ];

    const pw =
        document.getElementById('progress-wrap');

    const bar =
        document.getElementById('progress-bar');

    const stepLabel =
        document.getElementById('progress-step');

    const pctLabel =
        document.getElementById('progress-pct');

    const btn =
        document.getElementById('analyze-btn');

    btn.disabled = true;
    btn.style.opacity = '0.7';

    pw.classList.add('active');

    document
        .getElementById('results-panel')
        .classList.remove('active');

    document
        .getElementById('details-grid')
        .classList.remove('active');

    let i = 0;

    const interval = setInterval(() => {

        i++;

        const pct =
            Math.round((i / steps.length) * 100);

        bar.style.width = pct + '%';

        pctLabel.textContent = pct + '%';

        if (steps[i - 1]) {
            stepLabel.textContent = steps[i - 1];
        }

        if (i >= steps.length) {
            clearInterval(interval);
        }

    }, 250);

    try {

        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sequence: raw
            })
        });

        const data = await response.json();

        clearInterval(interval);

        pw.classList.remove('active');

        bar.style.width = '0%';

        pctLabel.textContent = '0%';

        btn.disabled = false;
        btn.style.opacity = '1';

        if (!data.success) {
            alert(data.error);
            return;
        }

        showBackendResults(data);

    } catch (error) {

        clearInterval(interval);

        pw.classList.remove('active');

        bar.style.width = '0%';

        pctLabel.textContent = '0%';

        btn.disabled = false;
        btn.style.opacity = '1';

        alert('Something went wrong while analyzing the sequence.');

        console.error(error);
    }
}

/* ── Display backend results ── */

function showBackendResults(data) {

    const seq = data.sequence;
    const stats = data.stats;
    const orfs = data.orfs;

    /* ── Top stat bar ── */

    document.getElementById('cnt-bases').textContent =
        stats.length.toLocaleString();

    document.getElementById('cnt-gc').textContent =
        stats.GC_content + '%';

    document.getElementById('cnt-orfs').textContent =
        orfs.length;

    document.getElementById('cnt-mut').textContent =
        '—';

    /* ── Main metrics ── */

    document.getElementById('res-len').textContent =
        stats.length.toLocaleString() + ' bp';

    document.getElementById('res-gc').textContent =
        stats.GC_content + '%';

    document.getElementById('res-orf').textContent =
        orfs.length;

    document.getElementById('res-at').textContent =
        stats.AT_content + '%';

    /* ── Summary section ── */

    document.getElementById('sum-id').textContent =
        data.sequence_id;

    document.getElementById('sum-length').textContent =
        stats.length.toLocaleString() + ' bp';

    document.getElementById('sum-gc').textContent =
        stats.GC_content + '%';

    document.getElementById('sum-at').textContent =
        stats.AT_content + '%';

    /* ── Sequence outputs ── */

    document.getElementById('reverse-output').textContent =
        data.reverse_complement;

    document.getElementById('rna-output').textContent =
        data.rna;

    document.getElementById('protein-output').textContent =
        data.protein;

    /* ── ORF badge ── */

    document.getElementById('orf-badge').textContent =
        orfs.length + ' ORFs';

    /* ── ORF table ── */

    const tableBody =
        document.getElementById('orf-table-body');

    tableBody.innerHTML = '';

    if (orfs.length > 0) {

        orfs.forEach((orf, index) => {

            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${orf.start}</td>
                    <td>${orf.end}</td>
                    <td>${orf.length}</td>
                    <td>${orf.sequence}</td>
                </tr>
            `;
        });

    } else {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No ORFs detected in this sequence.
                </td>
            </tr>
        `;
    }

    /* ── Colorized sequence preview ── */

    const preview = seq.slice(0, 300);

    const colorMap = {
        A: 'base-A',
        T: 'base-T',
        G: 'base-G',
        C: 'base-C',
        N: 'base-gap'
    };

    const html = preview
        .split('')
        .map((b, i) => {

            const cls =
                colorMap[b] || 'base-gap';

            const space =
                (i + 1) % 10 === 0 ? ' ' : '';

            return `<span class="${cls}">${b}</span>${space}`;

        })
        .join('') +

        (
            seq.length > 300
                ? `<span class="base-gap"> …[+${(seq.length - 300).toLocaleString()} bases]</span>`
                : ''
        );

    document.getElementById('seq-display').innerHTML =
        html;

    /* ── Reveal sections ── */

    document
        .getElementById('results-panel')
        .classList.add('active');

    document
        .getElementById('details-grid')
        .classList.add('active');

    document
        .getElementById('results-panel')
        .scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
}

/* ── Copy helper ── */

function copyText(elementId) {

    const text =
        document.getElementById(elementId).textContent;

    navigator.clipboard.writeText(text);
}

/* ── Shake animation ── */

function shakeBtn() {

    const btn =
        document.getElementById('analyze-btn');

    btn.style.animation = 'none';

    btn.style.transform = 'translateX(-6px)';

    setTimeout(() => {
        btn.style.transform = 'translateX(6px)';
    }, 80);

    setTimeout(() => {
        btn.style.transform = 'translateX(-4px)';
    }, 160);

    setTimeout(() => {
        btn.style.transform = '';
    }, 240);
}