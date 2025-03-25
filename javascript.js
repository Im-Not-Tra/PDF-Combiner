document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const fileInput = document.getElementById('file-upload');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const emptyStateBtn = document.getElementById('empty-state-btn');
    const filesContainer = document.getElementById('files-container');
    const emptyState = document.getElementById('empty-state');
    const fileCountEl = document.getElementById('file-count');
    const totalSizeEl = document.getElementById('total-size');
    const fileListEl = document.getElementById('file-list');
    const outputFilenameInput = document.getElementById('output-filename');
    const combineBtn = document.getElementById('combine-btn');
    const downloadBtn = document.getElementById('download-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const successMessage = document.getElementById('success-message');

    // State
    let files = [];
    let combinedPdfUrl = null;

    // Event listeners
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    emptyStateBtn.addEventListener('click', () => fileInput.click());

    // Drag and drop functionality
    const dropArea = emptyState;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.style.borderColor = 'rgba(123, 97, 255, 0.5)';
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }

    function unhighlight() {
        dropArea.style.borderColor = 'var(--glass-border)';
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const newFiles = Array.from(dt.files).filter(
            file => file.type === "application/pdf"
        );

        if (newFiles.length > 0) {
            files = [...files, ...newFiles];
            updateFileList();
        }
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).filter(
                file => file.type === "application/pdf"
            );

            files = [...files, ...newFiles];
            updateFileList();

            // Reset file input
            fileInput.value = '';
        }
    });

    combineBtn.addEventListener('click', combinePdfs);
    downloadBtn.addEventListener('click', downloadCombinedPdf);

    // Functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateFileList() {
        if (files.length > 0) {
            filesContainer.style.display = 'block';
            emptyState.style.display = 'none';
            fileCountEl.textContent = files.length;
            fileListEl.innerHTML = '';

            // Calculate total size
            const totalSize = files.reduce((acc, file) => acc + file.size, 0);
            totalSizeEl.textContent = formatFileSize(totalSize);

            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';

                const fileInfo = document.createElement('div');
                fileInfo.className = 'file-info';

                // File icon container
                const fileIconContainer = document.createElement('div');
                fileIconContainer.className = 'file-icon';

                // File icon
                const fileIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                fileIcon.setAttribute('class', 'icon');
                fileIcon.setAttribute('viewBox', '0 0 24 24');
                fileIcon.setAttribute('fill', 'none');
                fileIcon.setAttribute('stroke', 'currentColor');
                fileIcon.setAttribute('stroke-width', '2');
                fileIcon.setAttribute('stroke-linecap', 'round');
                fileIcon.setAttribute('stroke-linejoin', 'round');

                const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path1.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');

                const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path2.setAttribute('d', 'M14 2v6h6');

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '12');
                text.setAttribute('y', '16');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '6');
                text.setAttribute('fill', 'currentColor');
                text.setAttribute('x', '12');
                text.setAttribute('y', '16');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '6');
                text.setAttribute('fill', 'currentColor');
                text.textContent = 'PDF';

                fileIcon.appendChild(path1);
                fileIcon.appendChild(path2);
                fileIcon.appendChild(text);
                fileIconContainer.appendChild(fileIcon);

                // File details
                const fileDetails = document.createElement('div');

                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = file.name;

                const fileSize = document.createElement('div');
                fileSize.className = 'file-size';
                fileSize.textContent = formatFileSize(file.size);

                fileDetails.appendChild(fileName);
                fileDetails.appendChild(fileSize);

                fileInfo.appendChild(fileIconContainer);
                fileInfo.appendChild(fileDetails);

                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn btn-icon';
                removeBtn.title = 'Remove file';
                removeBtn.onclick = () => removeFile(index);

                const removeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                removeIcon.setAttribute('class', 'icon');
                removeIcon.setAttribute('viewBox', '0 0 24 24');
                removeIcon.setAttribute('fill', 'none');
                removeIcon.setAttribute('stroke', 'currentColor');
                removeIcon.setAttribute('stroke-width', '2');
                removeIcon.setAttribute('stroke-linecap', 'round');
                removeIcon.setAttribute('stroke-linejoin', 'round');

                const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line1.setAttribute('x1', '18');
                line1.setAttribute('y1', '6');
                line1.setAttribute('x2', '6');
                line1.setAttribute('y2', '18');

                const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line2.setAttribute('x1', '6');
                line2.setAttribute('y1', '6');
                line2.setAttribute('x2', '18');
                line2.setAttribute('y2', '18');

                removeIcon.appendChild(line1);
                removeIcon.appendChild(line2);
                removeBtn.appendChild(removeIcon);

                fileItem.appendChild(fileInfo);
                fileItem.appendChild(removeBtn);
                fileListEl.appendChild(fileItem);
            });

            combineBtn.disabled = false;
        } else {
            filesContainer.style.display = 'none';
            emptyState.style.display = 'flex';
            combineBtn.disabled = true;
            downloadBtn.style.display = 'none';
            successMessage.style.display = 'none';

            // Clear any existing combined PDF
            if (combinedPdfUrl) {
                URL.revokeObjectURL(combinedPdfUrl);
                combinedPdfUrl = null;
            }
        }
    }

    function removeFile(index) {
        files = files.filter((_, i) => i !== index);
        updateFileList();
    }

    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressPercentage.textContent = `${percent}%`;
    }

    async function combinePdfs() {
        if (files.length === 0) return;

        // Show loading state
        combineBtn.disabled = true;
        downloadBtn.style.display = 'none';
        successMessage.style.display = 'none';
        progressContainer.style.display = 'block';
        updateProgress(0);

        // Clear any existing combined PDF
        if (combinedPdfUrl) {
            URL.revokeObjectURL(combinedPdfUrl);
            combinedPdfUrl = null;
        }

        try {
            // Create a new PDF document
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            // Process each PDF file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileArrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

                // Add each page to the new document
                pages.forEach(page => {
                    mergedPdf.addPage(page);
                });

                // Update progress
                const progress = Math.round(((i + 1) / files.length) * 100);
                updateProgress(progress);
            }

            // Save the merged PDF
            const mergedPdfBytes = await mergedPdf.save();

            // Create a blob URL for the combined PDF
            const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
            combinedPdfUrl = URL.createObjectURL(blob);

            // Show success message and download button
            successMessage.style.display = 'flex';
            downloadBtn.style.display = 'inline-flex';
        } catch (error) {
            console.error("Error combining PDFs:", error);
            alert("Error combining PDFs. Please try again.");
        } finally {
            // Reset button state
            combineBtn.disabled = false;
            progressContainer.style.display = 'none';
        }
    }

    function downloadCombinedPdf() {
        if (!combinedPdfUrl) return;

        const filename = outputFilenameInput.value.trim() || 'combined-document';

        const a = document.createElement("a");
        a.href = combinedPdfUrl;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});