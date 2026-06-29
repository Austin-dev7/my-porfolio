
/* ================================================================
   AUSTINE DEV PORTFOLIO - JavaScript v3 (FINAL)
   3D Tilt Effect + Live Sorting Visualizer + All Features
   ================================================================ */

/* ----------------------------------------------------------------
   1. TYPING EFFECT
---------------------------------------------------------------- */

const sentenceToType = "console.log('Welcome to my portfolio!');";
const typedTextElement = document.getElementById("typedText");
let letterIndex = 0;

function typeNextLetter() {
    if (letterIndex < sentenceToType.length) {
        typedTextElement.textContent += sentenceToType.charAt(letterIndex);
        letterIndex++;
        setTimeout(typeNextLetter, 60);
    }
}

setTimeout(typeNextLetter, 1200);


/* ----------------------------------------------------------------
   2. SCROLL REVEAL ANIMATION
---------------------------------------------------------------- */

const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach(function (element) {
    const delaySteps = element.getAttribute("data-delay") || 0;
    element.style.setProperty("--delay", delaySteps);
});

const scrollObserver = new IntersectionObserver(
    function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal--visible");
                scrollObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15,
    }
);

revealElements.forEach(function (element) {
    scrollObserver.observe(element);
});


/* ----------------------------------------------------------------
   3. FOOTER YEAR
---------------------------------------------------------------- */

const yearElement = document.getElementById("year");
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* ----------------------------------------------------------------
   4. SMOOTH SCROLL FOR NAV LINKS
---------------------------------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});


/* ================================================================
   5. 3D TILT EFFECT FOR CARDS
   ================================================================ */

function initTiltEffect() {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', handleTiltMouseMove);
        card.addEventListener('mouseleave', handleTiltMouseLeave);
    });
}

function handleTiltMouseMove(e) {
    const card = this;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    // Apply 3D transform
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.02)`;
    
    // Add dynamic glow based on mouse position
    const glowIntensity = Math.abs(rotateX) + Math.abs(rotateY);
    const glowElement = card.querySelector('.skills-card_glow, .project-card_glow, .contact-card_glow, .hero_image-glow, .about_image-glow');
    if (glowElement) {
        glowElement.style.opacity = Math.min(glowIntensity / 20, 0.6);
    }
}

function handleTiltMouseLeave(e) {
    const card = this;
    
    // Reset transform with smooth transition
    card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    
    // Reset glow
    const glowElement = card.querySelector('.skills-card_glow, .project-card_glow, .contact-card_glow, .hero_image-glow, .about_image-glow');
    if (glowElement) {
        glowElement.style.opacity = '0';
    }
    
    // Remove transition after reset to allow smooth mouse tracking
    setTimeout(() => {
        card.style.transition = '';
    }, 500);
}

// Initialize tilt effect when DOM is ready
document.addEventListener('DOMContentLoaded', initTiltEffect);


/* ================================================================
   6. LIVE SORTING VISUALIZER
   ================================================================ */

const sortingBars = document.getElementById('sortingBars');
const algoSelect = document.getElementById('algoSelect');
const sizeSlider = document.getElementById('sizeSlider');
const speedSlider = document.getElementById('speedSlider');
const sizeValue = document.getElementById('sizeValue');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');
const timeEl = document.getElementById('time');

let array = [];
let isSorting = false;
let isPaused = false;
let abortSort = false;
let comparisons = 0;
let swaps = 0;
let startTime = 0;
let delay = 50;

// Update slider values
sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value;
    if (!isSorting) generateArray();
});

speedSlider.addEventListener('input', () => {
    delay = 201 - speedSlider.value;
    speedValue.textContent = delay + 'ms';
});

// Generate random array
function generateArray() {
    const size = parseInt(sizeSlider.value);
    array = [];
    sortingBars.innerHTML = '';
    
    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 100) + 5;
        array.push(value);
        
        const bar = document.createElement('div');
        bar.classList.add('sorting-bar');
        bar.style.height = value + '%';
        sortingBars.appendChild(bar);
    }
    
    resetStats();
}

// Reset stats
function resetStats() {
    comparisons = 0;
    swaps = 0;
    comparisonsEl.textContent = '0';
    swapsEl.textContent = '0';
    timeEl.textContent = '0.00s';
}

// Update stats display
function updateStats() {
    comparisonsEl.textContent = comparisons;
    swapsEl.textContent = swaps;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    timeEl.textContent = elapsed + 's';
}

// Sleep function for animation delay
function sleep() {
    return new Promise(resolve => {
        const check = () => {
            if (abortSort) {
                resolve();
                return;
            }
            if (isPaused) {
                setTimeout(check, 50);
            } else {
                setTimeout(resolve, delay);
            }
        };
        check();
    });
}

// Visual helpers
async function highlightBars(indices, className) {
    const bars = document.querySelectorAll('.sorting-bar');
    indices.forEach(i => {
        if (bars[i]) bars[i].classList.add(className);
    });
    await sleep();
    indices.forEach(i => {
        if (bars[i]) bars[i].classList.remove(className);
    });
}

async function swapBars(i, j) {
    const bars = document.querySelectorAll('.sorting-bar');
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    
    bars[i].style.height = array[i] + '%';
    bars[j].style.height = array[j] + '%';
    
    swaps++;
    updateStats();
    await sleep();
}

// Mark as sorted
function markSorted(i) {
    const bars = document.querySelectorAll('.sorting-bar');
    if (bars[i]) bars[i].classList.add('sorted');
}

// ==================== BUBBLE SORT ====================
async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (abortSort) return;
            
            await highlightBars([j, j + 1], 'compare');
            comparisons++;
            updateStats();
            
            if (array[j] > array[j + 1]) {
                await highlightBars([j, j + 1], 'swap');
                await swapBars(j, j + 1);
            }
        }
        markSorted(n - i - 1);
    }
    markSorted(0);
}

// ==================== SELECTION SORT ====================
async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < n; j++) {
            if (abortSort) return;
            
            await highlightBars([minIdx, j], 'compare');
            comparisons++;
            updateStats();
            
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            await highlightBars([i, minIdx], 'swap');
            await swapBars(i, minIdx);
        }
        markSorted(i);
    }
    markSorted(n - 1);
}

// ==================== INSERTION SORT ====================
async function insertionSort() {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        
        await highlightBars([i], 'compare');
        
        while (j >= 0 && array[j] > key) {
            if (abortSort) return;
            
            await highlightBars([j, j + 1], 'swap');
            array[j + 1] = array[j];
            
            const bars = document.querySelectorAll('.sorting-bar');
            bars[j + 1].style.height = array[j + 1] + '%';
            
            comparisons++;
            swaps++;
            updateStats();
            await sleep();
            
            j--;
        }
        array[j + 1] = key;
        const bars = document.querySelectorAll('.sorting-bar');
        bars[j + 1].style.height = key + '%';
        
        for (let k = 0; k <= i; k++) {
            markSorted(k);
        }
    }
}

// Main sort function
async function startSort() {
    if (isSorting) return;
    isSorting = true;
    abortSort = false;
    isPaused = false;
    startTime = Date.now();
    
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    
    const algorithm = algoSelect.value;
    
    // Remove sorted class from all bars
    document.querySelectorAll('.sorting-bar').forEach(bar => {
        bar.classList.remove('sorted');
    });
    
    try {
        switch (algorithm) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
        }
    } catch (e) {
        console.log('Sorting stopped');
    }
    
    isSorting = false;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
}

// Event listeners
startBtn.addEventListener('click', startSort);

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
});

resetBtn.addEventListener('click', () => {
    abortSort = true;
    isSorting = false;
    isPaused = false;
    pauseBtn.textContent = '⏸ Pause';
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    generateArray();
});

// Initialize
speedValue.textContent = '50ms';
generateArray();


/* ================================================================
   7. NAVBAR SCROLL EFFECT
   ================================================================ */

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});













































// /* Typing Effect */

// const sentenceToType = "console.log('Welcome to my portfolio!');";
// const typedTextElement = document.getElementById("typedText");
// let letterIndex = 0;

// function typeNextLetter() {
//     if (letterIndex < sentenceToType.length) {
//         typedTextElement.textContent += sentenceToType.charAt(letterIndex);
//         letterIndex++;
//         setTimeout(typeNextLetter, 60);
//     }
// }

// setTimeout(typeNextLetter, 1200);

// /* Scroll Reveal Animation */

// const revealElements = document.querySelectorAll(".reveal");

// revealElements.forEach(function (element) {
//     const delaySteps = element.getAttribute("data-delay") || 0;
//     element.style.setProperty("--delay", delaySteps);
// });

// const scrollObserver = new IntersectionObserver(
//     function (entries) {
//         entries.forEach(function (entry) {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add("reveal--visible");
//                 scrollObserver.unobserve(entry.target);
//             }
//         });
//     },
//     {
//         threshold: 0.15,
//     }
// );

// revealElements.forEach(function (element) {
//     scrollObserver.observe(element);
// });

// /* Footer Year */

// const yearElement = document.getElementById("year");
// if (yearElement) {
//     yearElement.textContent = new Date().getFullYear();
// }

// /* Smooth Scroll for Nav Links */

// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         const target = document.querySelector(this.getAttribute('href'));
//         if (target) {
//             const offsetTop = target.offsetTop - 80;
//             window.scrollTo({
//                 top: offsetTop,
//                 behavior: 'smooth'
//             });
//         }
//     });
// });