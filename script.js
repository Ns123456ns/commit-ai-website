// ===== Price Data (loaded from prices.json or fallback) =====
let priceData = null;

// Claude model pricing (fallback if prices.json fails to load)
const CLAUDE_PRICING = {
    'opus-4.5': { input: 5, output: 25 },
    'opus-4.1': { input: 15, output: 75 },
    'sonnet-4.5': { input: 3, output: 15 },
    'sonnet-4': { input: 3, output: 15 },
    'haiku-4.5': { input: 1, output: 5 },
    'haiku-3.5': { input: 0.80, output: 4 }
};

// ===== Tab Navigation =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initCalculators();
    loadPriceData();
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });

            // Recalculate the active tab's calculator
            calculateAll();
        });
    });
}

// ===== Cost Calculators =====
function initCalculators() {
    // RAG Calculator
    const ragInputs = ['rag-storage', 'rag-puts', 'rag-gets'];
    ragInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateRAG);
        }
    });

    // Vision Calculator
    const visionInputs = ['vision-images', 'vision-video'];
    visionInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateVision);
        }
    });

    // OCR Calculator
    const ocrInputs = ['ocr-basic', 'ocr-forms', 'ocr-expense'];
    ocrInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateOCR);
        }
    });

    // Voice Calculator (Nova Sonic)
    const voiceInputs = ['voice-input-mins', 'voice-output-mins'];
    voiceInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateVoice);
        }
    });

    // Storage Calculator
    const storageInputs = ['storage-s3', 'storage-dynamo', 'storage-writes', 'storage-reads'];
    storageInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateStorage);
        }
    });

    // LLM Calculator
    const llmInputs = ['llm-model', 'llm-input-tokens', 'llm-output-tokens'];
    llmInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateLLM);
            input.addEventListener('change', calculateLLM);
        }
    });

    // Initial calculations
    calculateAll();
}

function calculateAll() {
    calculateRAG();
    calculateVision();
    calculateOCR();
    calculateVoice();
    calculateStorage();
    calculateLLM();
}

// ===== RAG Calculator =====
function calculateRAG() {
    const storage = parseFloat(document.getElementById('rag-storage')?.value) || 0;
    const puts = parseFloat(document.getElementById('rag-puts')?.value) || 0;
    const gets = parseFloat(document.getElementById('rag-gets')?.value) || 0;

    // Pricing
    const storageCost = storage * 0.023; // $0.023 per GB/month
    const putsCost = puts * 0.005; // $0.005 per 1,000 requests
    const getsCost = gets * 0.0004; // $0.0004 per 1,000 requests

    const total = storageCost + putsCost + getsCost;

    const resultEl = document.getElementById('rag-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== Vision Calculator =====
function calculateVision() {
    const images = parseFloat(document.getElementById('vision-images')?.value) || 0;
    const video = parseFloat(document.getElementById('vision-video')?.value) || 0;

    // Rekognition Pricing
    const imageCost = images * 1.00; // $1.00 per 1,000 images
    const videoCost = video * 0.10; // $0.10 per minute

    const total = imageCost + videoCost;

    const resultEl = document.getElementById('vision-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== OCR Calculator =====
function calculateOCR() {
    const basicPages = parseFloat(document.getElementById('ocr-basic')?.value) || 0;
    const formsPages = parseFloat(document.getElementById('ocr-forms')?.value) || 0;
    const expensePages = parseFloat(document.getElementById('ocr-expense')?.value) || 0;

    // Free tier: 1,000 pages/month for DetectDocumentText
    const billableBasic = Math.max(0, basicPages - 1000);
    
    // Textract Pricing
    const basicCost = billableBasic * 0.0015; // $0.0015 per page
    const formsCost = formsPages * 0.015; // $0.015 per page
    const expenseCost = expensePages * 0.01; // $0.01 per page

    const total = basicCost + formsCost + expenseCost;

    const resultEl = document.getElementById('ocr-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== Voice Calculator (Nova Sonic) =====
function calculateVoice() {
    const inputMins = parseFloat(document.getElementById('voice-input-mins')?.value) || 0;
    const outputMins = parseFloat(document.getElementById('voice-output-mins')?.value) || 0;

    // Convert minutes to seconds
    const inputSeconds = inputMins * 60;
    const outputSeconds = outputMins * 60;

    // Nova Sonic Pricing
    const inputCost = inputSeconds * 0.0008; // $0.0008 per second input
    const outputCost = outputSeconds * 0.0032; // $0.0032 per second output

    const total = inputCost + outputCost;

    const resultEl = document.getElementById('voice-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== Storage Calculator =====
function calculateStorage() {
    const s3 = parseFloat(document.getElementById('storage-s3')?.value) || 0;
    const dynamo = parseFloat(document.getElementById('storage-dynamo')?.value) || 0;
    const writes = parseFloat(document.getElementById('storage-writes')?.value) || 0;
    const reads = parseFloat(document.getElementById('storage-reads')?.value) || 0;

    // Pricing
    const s3Cost = s3 * 0.023; // $0.023 per GB/month
    const dynamoStorageCost = dynamo * 0.25; // $0.25 per GB/month
    const writesCost = writes * 1.25; // $1.25 per million requests
    const readsCost = reads * 0.25; // $0.25 per million requests

    const total = s3Cost + dynamoStorageCost + writesCost + readsCost;

    const resultEl = document.getElementById('storage-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== LLM Calculator =====
function calculateLLM() {
    const modelSelect = document.getElementById('llm-model');
    const inputTokens = parseFloat(document.getElementById('llm-input-tokens')?.value) || 0;
    const outputTokens = parseFloat(document.getElementById('llm-output-tokens')?.value) || 0;
    
    if (!modelSelect) return;
    
    const modelKey = modelSelect.value;
    const pricing = CLAUDE_PRICING[modelKey] || { input: 3, output: 15 };
    
    // Calculate cost (tokens are in millions, pricing is per million)
    const inputCost = inputTokens * pricing.input;
    const outputCost = outputTokens * pricing.output;
    const total = inputCost + outputCost;

    const resultEl = document.getElementById('llm-total');
    if (resultEl) {
        resultEl.textContent = formatCurrency(total);
        animateValue(resultEl);
    }
}

// ===== Load Price Data from JSON =====
async function loadPriceData() {
    try {
        const response = await fetch('prices.json');
        if (response.ok) {
            priceData = await response.json();
            
            // Update last updated timestamp
            const lastUpdatedEl = document.getElementById('last-updated');
            if (lastUpdatedEl && priceData.last_updated) {
                const date = new Date(priceData.last_updated);
                lastUpdatedEl.textContent = `Last updated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            }
            
            console.log('✅ Loaded pricing data from prices.json');
            
            // Update pricing from loaded data
            if (priceData.llm_models?.anthropic?.models) {
                updateClaudePricing(priceData.llm_models.anthropic.models);
            }
        }
    } catch (error) {
        console.log('ℹ️ Using fallback pricing data');
    }
}

function updateClaudePricing(models) {
    // Update CLAUDE_PRICING with loaded data
    if (models['claude-opus-4.5']) {
        CLAUDE_PRICING['opus-4.5'] = {
            input: models['claude-opus-4.5'].input,
            output: models['claude-opus-4.5'].output
        };
    }
    if (models['claude-opus-4.1']) {
        CLAUDE_PRICING['opus-4.1'] = {
            input: models['claude-opus-4.1'].input,
            output: models['claude-opus-4.1'].output
        };
    }
    if (models['claude-sonnet-4.5']) {
        CLAUDE_PRICING['sonnet-4.5'] = {
            input: models['claude-sonnet-4.5'].input,
            output: models['claude-sonnet-4.5'].output
        };
    }
    if (models['claude-sonnet-4']) {
        CLAUDE_PRICING['sonnet-4'] = {
            input: models['claude-sonnet-4'].input,
            output: models['claude-sonnet-4'].output
        };
    }
    if (models['claude-haiku-4.5']) {
        CLAUDE_PRICING['haiku-4.5'] = {
            input: models['claude-haiku-4.5'].input,
            output: models['claude-haiku-4.5'].output
        };
    }
    if (models['claude-haiku-3.5']) {
        CLAUDE_PRICING['haiku-3.5'] = {
            input: models['claude-haiku-3.5'].input,
            output: models['claude-haiku-3.5'].output
        };
    }
    
    // Recalculate with new pricing
    calculateLLM();
}

// ===== Utility Functions =====
function formatCurrency(value) {
    if (value >= 1000) {
        return '$' + value.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }
    return '$' + value.toFixed(2);
}

function animateValue(element) {
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.15s ease';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    // Only handle if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
    }

    const tabs = document.querySelectorAll('.tab');
    const activeTab = document.querySelector('.tab.active');
    const currentIndex = Array.from(tabs).indexOf(activeTab);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].click();
        tabs[nextIndex].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].click();
        tabs[prevIndex].focus();
    }
});

// ===== Smooth Scroll for Internal Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Add visual feedback on card hover =====
document.querySelectorAll('.recommendation-card, .alt-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// ===== Console welcome message =====
console.log('%c🚀 Commit AI Engineering Onboarding', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cAWS Service Recommendations Guide', 'font-size: 14px; color: #9999aa;');
