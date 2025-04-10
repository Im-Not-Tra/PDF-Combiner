document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const fileInput = document.getElementById("file-upload")
    const selectFilesBtn = document.getElementById("select-files-btn")
    const emptyStateBtn = document.getElementById("empty-state-btn")
    const filesContainer = document.getElementById("files-container")
    const emptyState = document.getElementById("empty-state")
    const fileCountEl = document.getElementById("file-count")
    const totalSizeEl = document.getElementById("total-size")
    const fileListEl = document.getElementById("file-list")
    const outputFilenameInput = document.getElementById("output-filename")
    const combineBtn = document.getElementById("combine-btn")
    const downloadBtn = document.getElementById("download-btn")
    const progressContainer = document.getElementById("progress-container")
    const progressBar = document.getElementById("progress-bar")
    const progressPercentage = document.getElementById("progress-percentage")
    const progressLabel = document.getElementById("progress-label")
    const successMessage = document.getElementById("success-message")
  
    // State
    let files = []
    let combinedPdfUrl = null
    let convertedPdfs = [] // Array to store converted PDF files
  
    // Import necessary libraries (jsDelivr CDN)
    const script1 = document.createElement("script")
    script1.src = "https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"
    document.head.appendChild(script1)
  
    const script2 = document.createElement("script")
    script2.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.4.0/dist/pdf-lib.min.js"
    document.head.appendChild(script2)
  
    const script3 = document.createElement("script")
    script3.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
    document.head.appendChild(script3)
  
    let mammoth
    let PDFLib
    let XLSX
  
    script1.onload = () => {
      mammoth = window.mammoth
    }
  
    script2.onload = () => {
      PDFLib = window.PDFLib
    }
  
    script3.onload = () => {
      XLSX = window.XLSX
    }
  
    // Event listeners
    selectFilesBtn.addEventListener("click", () => fileInput.click())
    emptyStateBtn.addEventListener("click", () => fileInput.click())
  
    // Drag and drop functionality
    const dropArea = emptyState
    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    })
  
    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    ;["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false)
    })
    ;["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false)
    })
  
    function highlight() {
      dropArea.style.borderColor = "rgba(123, 97, 255, 0.5)"
      dropArea.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
    }
  
    function unhighlight() {
      dropArea.style.borderColor = "var(--glass-border)"
      dropArea.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
    }
  
    dropArea.addEventListener("drop", handleDrop, false)
  
    function handleDrop(e) {
      const dt = e.dataTransfer
      const newFiles = Array.from(dt.files).filter((file) => {
        const fileType = file.type
        return (
          fileType === "application/pdf" ||
          fileType.includes("word") ||
          fileType.includes("excel") ||
          fileType.includes("spreadsheet") ||
          fileType.includes("powerpoint") ||
          fileType.includes("presentation") ||
          fileType.includes("image/")
        )
      })
  
      if (newFiles.length > 0) {
        files = [...files, ...newFiles]
        updateFileList()
      }
    }
  
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).filter((file) => {
          const fileType = file.type
          return (
            fileType === "application/pdf" ||
            fileType.includes("word") ||
            fileType.includes("excel") ||
            fileType.includes("spreadsheet") ||
            fileType.includes("powerpoint") ||
            fileType.includes("presentation") ||
            fileType.includes("image/")
          )
        })
  
        files = [...files, ...newFiles]
        updateFileList()
  
        // Reset file input
        fileInput.value = ""
      }
    })
  
    combineBtn.addEventListener("click", processAndCombineFiles)
    downloadBtn.addEventListener("click", downloadCombinedPdf)
  
    // Functions
    function formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }
  
    function getFileIcon(file) {
      const fileType = file.type
      const iconPath = ""
      let iconText = ""
  
      if (fileType === "application/pdf") {
        iconText = "PDF"
      } else if (fileType.includes("word")) {
        iconText = "DOC"
      } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
        iconText = "XLS"
      } else if (fileType.includes("powerpoint") || fileType.includes("presentation")) {
        iconText = "PPT"
      } else if (fileType.includes("image/")) {
        iconText = "IMG"
      } else {
        iconText = "FILE"
      }
  
      const fileIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      fileIcon.setAttribute("class", "icon")
      fileIcon.setAttribute("viewBox", "0 0 24 24")
      fileIcon.setAttribute("fill", "none")
      fileIcon.setAttribute("stroke", "currentColor")
      fileIcon.setAttribute("stroke-width", "2")
      fileIcon.setAttribute("stroke-linecap", "round")
      fileIcon.setAttribute("stroke-linejoin", "round")
  
      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path1.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")
  
      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path2.setAttribute("d", "M14 2v6h6")
  
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", "12")
      text.setAttribute("y", "16")
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("font-size", "6")
      text.setAttribute("fill", "currentColor")
      text.textContent = iconText
  
      fileIcon.appendChild(path1)
      fileIcon.appendChild(path2)
      fileIcon.appendChild(text)
  
      return fileIcon
    }
  
    function updateFileList() {
      if (files.length > 0) {
        filesContainer.style.display = "block"
        emptyState.style.display = "none"
        fileCountEl.textContent = files.length
        fileListEl.innerHTML = ""
  
        // Calculate total size
        const totalSize = files.reduce((acc, file) => acc + file.size, 0)
        totalSizeEl.textContent = formatFileSize(totalSize)
  
        files.forEach((file, index) => {
          const fileItem = document.createElement("div")
          fileItem.className = "file-item"
  
          const fileInfo = document.createElement("div")
          fileInfo.className = "file-info"
  
          // File icon container
          const fileIconContainer = document.createElement("div")
          fileIconContainer.className = "file-icon"
  
          // Get appropriate file icon
          const fileIcon = getFileIcon(file)
          fileIconContainer.appendChild(fileIcon)
  
          // File details
          const fileDetails = document.createElement("div")
  
          const fileName = document.createElement("div")
          fileName.className = "file-name"
          fileName.textContent = file.name
  
          const fileSize = document.createElement("div")
          fileSize.className = "file-size"
          fileSize.textContent = formatFileSize(file.size)
  
          // Add conversion indicator for non-PDF files
          if (file.type !== "application/pdf") {
            const conversionIndicator = document.createElement("div")
            conversionIndicator.className = "conversion-indicator"
            conversionIndicator.innerHTML = `<span class="conversion-badge">Will convert to PDF</span>`
            fileDetails.appendChild(conversionIndicator)
          }
  
          fileDetails.appendChild(fileName)
          fileDetails.appendChild(fileSize)
  
          fileInfo.appendChild(fileIconContainer)
          fileInfo.appendChild(fileDetails)
  
          // Remove button
          const removeBtn = document.createElement("button")
          removeBtn.className = "btn btn-icon"
          removeBtn.title = "Remove file"
          removeBtn.onclick = () => removeFile(index)
  
          const removeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          removeIcon.setAttribute("class", "icon")
          removeIcon.setAttribute("viewBox", "0 0 24 24")
          removeIcon.setAttribute("fill", "none")
          removeIcon.setAttribute("stroke", "currentColor")
          removeIcon.setAttribute("stroke-width", "2")
          removeIcon.setAttribute("stroke-linecap", "round")
          removeIcon.setAttribute("stroke-linejoin", "round")
  
          const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
          line1.setAttribute("x1", "18")
          line1.setAttribute("y1", "6")
          line1.setAttribute("x2", "6")
          line1.setAttribute("y2", "18")
  
          const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
          line2.setAttribute("x1", "6")
          line2.setAttribute("y1", "6")
          line2.setAttribute("x2", "18")
          line2.setAttribute("y2", "18")
  
          removeIcon.appendChild(line1)
          removeIcon.appendChild(line2)
          removeBtn.appendChild(removeIcon)
  
          fileItem.appendChild(fileInfo)
          fileItem.appendChild(removeBtn)
          fileListEl.appendChild(fileItem)
        })
  
        combineBtn.disabled = false
      } else {
        filesContainer.style.display = "none"
        emptyState.style.display = "flex"
        combineBtn.disabled = true
        downloadBtn.style.display = "none"
        successMessage.style.display = "none"
  
        // Clear any existing combined PDF
        if (combinedPdfUrl) {
          URL.revokeObjectURL(combinedPdfUrl)
          combinedPdfUrl = null
        }
      }
    }
  
    function removeFile(index) {
      files = files.filter((_, i) => i !== index)
      updateFileList()
    }
  
    function updateProgress(percent, label) {
      progressBar.style.width = `${percent}%`
      progressPercentage.textContent = `${percent}%`
      if (label) {
        progressLabel.textContent = label
      }
    }
  
    async function processAndCombineFiles() {
      if (files.length === 0) return
  
      // Show loading state
      combineBtn.disabled = true
      downloadBtn.style.display = "none"
      successMessage.style.display = "none"
      progressContainer.style.display = "block"
      updateProgress(0, "កំពុងរៀបចំឯកសារ...")
  
      // Clear any existing combined PDF and converted PDFs
      if (combinedPdfUrl) {
        URL.revokeObjectURL(combinedPdfUrl)
        combinedPdfUrl = null
      }
      convertedPdfs = []
  
      try {
        // First, convert all non-PDF files to PDF
        const totalFiles = files.length
        let processedFiles = 0
  
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
  
          if (file.type === "application/pdf") {
            // If it's already a PDF, just add it to the converted PDFs array
            const fileArrayBuffer = await file.arrayBuffer()
            convertedPdfs.push(fileArrayBuffer)
          } else {
            // Update progress with conversion message
            updateProgress(Math.round((processedFiles / totalFiles) * 50), `កំពុងបំលែង ${file.name} ទៅជា PDF...`)
  
            // Convert the file to PDF based on its type
            let pdfBytes
  
            if (file.type.includes("word")) {
              pdfBytes = await convertWordToPdf(file)
            } else if (file.type.includes("excel") || file.type.includes("spreadsheet")) {
              pdfBytes = await convertExcelToPdf(file)
            } else if (file.type.includes("powerpoint") || file.type.includes("presentation")) {
              pdfBytes = await convertPowerPointToPdf(file)
            } else if (file.type.includes("image/")) {
              pdfBytes = await convertImageToPdf(file)
            }
  
            if (pdfBytes) {
              convertedPdfs.push(pdfBytes)
            }
          }
  
          processedFiles++
          updateProgress(Math.round((processedFiles / totalFiles) * 50))
        }
  
        // Now combine all the PDFs
        updateProgress(50, "កំពុងចងឯកសាររួមបញ្ជូលគ្នា...")
        await combinePdfs()
      } catch (error) {
        console.error("Error processing files:", error)
        alert("Error processing files. Please try again.")
        combineBtn.disabled = false
        progressContainer.style.display = "none"
      }
    }
  
    async function convertWordToPdf(file) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = result.value
  
        // Create a PDF from the HTML content
        const { PDFDocument, rgb } = PDFLib
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([612, 792]) // US Letter size
  
        // Simple HTML to PDF conversion (basic implementation)
        // For a real app, you'd want a more sophisticated HTML-to-PDF conversion
        const { width, height } = page.getSize()
        page.drawText(file.name.replace(/\.[^/.]+$/, ""), {
          x: 50,
          y: height - 50,
          size: 16,
          color: rgb(0, 0, 0),
        })
  
        // Very basic text extraction and placement
        const plainText = html.replace(/<[^>]*>/g, " ").trim()
        const lines = splitTextIntoLines(plainText, 80) // ~80 chars per line
  
        lines.forEach((line, index) => {
          page.drawText(line, {
            x: 50,
            y: height - 100 - index * 20,
            size: 10,
            color: rgb(0, 0, 0),
          })
        })
  
        return await pdfDoc.save()
      } catch (error) {
        console.error("Error converting Word to PDF:", error)
        throw error
      }
    }
  
    function splitTextIntoLines(text, maxCharsPerLine) {
      const words = text.split(" ")
      const lines = []
      let currentLine = ""
  
      words.forEach((word) => {
        if ((currentLine + " " + word).length <= maxCharsPerLine) {
          currentLine += (currentLine ? " " : "") + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      })
  
      if (currentLine) {
        lines.push(currentLine)
      }
  
      return lines
    }
  
    async function convertExcelToPdf(file) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
  
        // Create a PDF document
        const { PDFDocument, rgb } = PDFLib
        const pdfDoc = await PDFDocument.create()
  
        // Process each worksheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
          if (jsonData.length > 0) {
            const page = pdfDoc.addPage([612, 792]) // US Letter size
            const { width, height } = page.getSize()
  
            // Draw sheet name as title
            page.drawText(sheetName, {
              x: 50,
              y: height - 50,
              size: 16,
              color: rgb(0, 0, 0),
            })
  
            // Draw table data
            const cellWidth = 100
            const cellHeight = 20
            const startX = 50
            const startY = height - 100
  
            jsonData.forEach((row, rowIndex) => {
              if (Array.isArray(row)) {
                row.forEach((cell, colIndex) => {
                  if (cell !== undefined && cell !== null) {
                    page.drawText(String(cell), {
                      x: startX + colIndex * cellWidth,
                      y: startY - rowIndex * cellHeight,
                      size: 10,
                      color: rgb(0, 0, 0),
                    })
                  }
                })
              }
            })
          }
        }
  
        return await pdfDoc.save()
      } catch (error) {
        console.error("Error converting Excel to PDF:", error)
        throw error
      }
    }
  
    async function convertPowerPointToPdf(file) {
      try {
        // For PowerPoint, we'll create a simple PDF with the filename
        // In a real app, you'd want to use a more sophisticated conversion
        const { PDFDocument, rgb } = PDFLib
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([612, 792]) // US Letter size
  
        const { width, height } = page.getSize()
        page.drawText(`PowerPoint: ${file.name}`, {
          x: 50,
          y: height - 50,
          size: 16,
          color: rgb(0, 0, 0),
        })
  
        page.drawText("PowerPoint conversion is limited in browser environment.", {
          x: 50,
          y: height - 100,
          size: 12,
          color: rgb(0, 0, 0),
        })
  
        return await pdfDoc.save()
      } catch (error) {
        console.error("Error converting PowerPoint to PDF:", error)
        throw error
      }
    }
  
    async function convertImageToPdf(file) {
      try {
        // Create a new PDF document
        const { PDFDocument, rgb } = PDFLib
        const pdfDoc = await PDFDocument.create()
  
        // Create an image element to get dimensions
        const img = new Image()
        img.crossOrigin = "anonymous"
  
        // Convert the file to a data URL
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
  
        // Load the image and get dimensions
        await new Promise((resolve) => {
          img.onload = resolve
          img.src = dataUrl
        })
  
        // Create a canvas to draw the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
  
        // Set canvas dimensions to match image (with max dimensions)
        const maxWidth = 612 - 100 // US Letter width - margins
        const maxHeight = 792 - 100 // US Letter height - margins
  
        let width = img.width
        let height = img.height
  
        // Scale down if image is too large
        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = height * ratio
        }
  
        if (height > maxHeight) {
          const ratio = maxHeight / height
          height = maxHeight
          width = width * ratio
        }
  
        canvas.width = width
        canvas.height = height
  
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height)
  
        // Get image data as PNG
        const pngData = canvas.toDataURL("image/png").split(",")[1]
  
        // Embed the image in the PDF
        const pngImage = await pdfDoc.embedPng(Uint8Array.from(atob(pngData), (c) => c.charCodeAt(0)))
  
        // Add a page to the PDF
        const page = pdfDoc.addPage([612, 792]) // US Letter size
        const { width: pageWidth, height: pageHeight } = page.getSize()
  
        // Calculate position to center the image
        const x = (pageWidth - width) / 2
        const y = (pageHeight - height) / 2
  
        // Draw the image on the page
        page.drawImage(pngImage, {
          x,
          y,
          width,
          height,
        })
  
        return await pdfDoc.save()
      } catch (error) {
        console.error("Error converting Image to PDF:", error)
        throw error
      }
    }
  
    async function combinePdfs() {
      if (convertedPdfs.length === 0) return
  
      try {
        // Create a new PDF document
        const { PDFDocument } = PDFLib
        const mergedPdf = await PDFDocument.create()
  
        // Process each PDF file
        for (let i = 0; i < convertedPdfs.length; i++) {
          const pdfBytes = convertedPdfs[i]
          const pdfDoc = await PDFDocument.load(pdfBytes)
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
  
          // Add each page to the new document
          pages.forEach((page) => {
            mergedPdf.addPage(page)
          })
  
          // Update progress
          const progress = Math.round(50 + ((i + 1) / convertedPdfs.length) * 50)
          updateProgress(progress)
        }
  
        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save()
  
        // Create a blob URL for the combined PDF
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" })
        combinedPdfUrl = URL.createObjectURL(blob)
  
        // Show success message and download button
        successMessage.style.display = "flex"
        downloadBtn.style.display = "inline-flex"
      } catch (error) {
        console.error("Error combining PDFs:", error)
        alert("Error combining PDFs. Please try again.")
      } finally {
        // Reset button state
        combineBtn.disabled = false
        progressContainer.style.display = "none"
      }
    }
  
    function downloadCombinedPdf() {
      if (!combinedPdfUrl) return
  
      const filename = outputFilenameInput.value.trim() || "combined-document"
  
      const a = document.createElement("a")
      a.href = combinedPdfUrl
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  })
  
