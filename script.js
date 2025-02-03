// Global variable to store extracted text
let extractedText = "";

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');
const uploadStatus = document.getElementById('uploadStatus');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners for drag and drop
uploadZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    uploadZone.addEventListener(event, preventDefault);
    document.body.addEventListener(event, preventDefault);
});

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle file drop and selection
uploadZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
    const file = e.dataTransfer.files[0];
    processFile(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    processFile(file);
}

// Error handling
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Main file processing function
async function processFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'text/plain') {
        showError('Please upload an image or text file');
        return;
    }

    progressContainer.style.display = 'block';
    updateProgress(0);
    uploadStatus.textContent = 'Processing file...';
    imagePreview.style.display = 'none';
    document.getElementById('extractedText').textContent = 'Processing...';

    try {
        if (file.type.startsWith('image/')) {
            // Handle image files
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // Configure Tesseract (OCR processing here)
            const result = await Tesseract.recognize(file, 'eng');
            extractedText = result.data.text;
        } else {
            // Handle text files
            const reader = new FileReader();
            extractedText = await new Promise((resolve) => {
                reader.onload = e => resolve(e.target.result);
                reader.readAsText(file);
            });
        }

        document.getElementById('extractedText').textContent = extractedText;
        uploadStatus.textContent = 'Text extracted successfully';
    } catch (error) {
        showError('Error processing file: ' + error.message);
        uploadStatus.textContent = 'Error processing file';
    } finally {
        progressContainer.style.display = 'none';
    }
}

function compareTexts() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput || !extractedText) return;

    const comparisonResults = document.getElementById('comparisonResults');
    comparisonResults.innerHTML = '';

    const userWords = userInput.split(' ');
    const extractedWords = extractedText.split(' ');

    userWords.forEach((word, index) => {
        const span = document.createElement('span');
        if (extractedWords[index] === word) {
            span.classList.add('word-comparison', 'match');
        } else {
            span.classList.add('word-comparison', 'mismatch');
        }
        span.textContent = word;
        comparisonResults.appendChild(span);
    });
}
