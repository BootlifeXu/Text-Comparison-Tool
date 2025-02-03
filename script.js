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

        // Add dragover styling
        ['dragenter', 'dragover'].forEach(event => {
            uploadZone.addEventListener(event, () => {
                uploadZone.classList.add('dragover');
            });
        });

        // Remove dragover styling
        ['dragleave', 'drop'].forEach(event => {
            uploadZone.addEventListener(event, () => {
                uploadZone.classList.remove('dragover');
            });
        });

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

        function processFile(file) {
            if (!file) return;
            uploadStatus.textContent = `Uploading: ${file.name}`;
            if (file.type.startsWith('image')) {
                extractTextFromImage(file);
            } else if (file.type === 'text/plain') {
                extractTextFromTextFile(file);
            } else {
                showError("Unsupported file type. Please upload an image or text file.");
            }
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        // Extract text from image using Tesseract.js
        function extractTextFromImage(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const image = reader.result;
                imagePreview.src = image;
                imagePreview.style.display = 'block';

                progressContainer.style.display = 'block';

                Tesseract.recognize(image, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            updateProgress(m.progress); // Use the defined function
                        }
                    }
                }).then(({ data: { text } }) => {
                    extractedText = text;
                    document.getElementById('extractedText').textContent = extractedText;
                    progressContainer.style.display = 'none';
                    uploadStatus.textContent = `File Uploaded: ${file.name}`;
                }).catch(err => showError("Error extracting text from the image."));
            };
            reader.readAsDataURL(file);
        }

        // Extract text from text file
        function extractTextFromTextFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                extractedText = reader.result;
                document.getElementById('extractedText').textContent = extractedText;
            };
            reader.readAsText(file);
        }

        function copyText() {
            if (extractedText) {
                navigator.clipboard.writeText(extractedText).then(() => {
                    alert("Text copied to clipboard!");
                }).catch(err => {
                    alert("Failed to copy text. Please allow clipboard permissions.");
                });
            }
        }

        // Compare texts function
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

        // Update progress function
        function updateProgress(progress) {
            const progressPercentage = Math.round(progress * 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressStatus.textContent = `${progressPercentage}% Recognizing text...`;
        }
