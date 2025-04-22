export const printDocument = (element: HTMLElement) => {
  // Get all stylesheets and inline styles from the current document
  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`;
        } else {
          const rules = Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
          return `<style>${rules}</style>`;
        }
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Open a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    // Write the HTML content with all necessary styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Inquiry</title>
          ${stylesheets.join('\n')}
          <style>
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 20px;
                background: white;
                color: black;
              }
              .print-content {
                width: 100%;
                max-width: none;
              }
              .print-content .chakra-box {
                width: 100%;
                max-width: none;
                box-shadow: none;
                background: white;
              }
              .print-content .chakra-icon-button {
                display: none !important;
              }
              .print-content table {
                width: 100% !important;
                max-width: none !important;
                border-collapse: collapse !important;
                border: 1px solid #ddd !important;
              }
              .print-content table th,
              .print-content table td {
                border: 1px solid #ddd !important;
                padding: 8px !important;
                text-align: left !important;
              }
              .print-content table th {
                background-color: #f5f5f5 !important;
                font-weight: bold !important;
              }
              .print-content .chakra-stack {
                width: 100%;
                max-width: none;
              }
              .print-content pre {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
              }
              .print-content code {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
              }
              .print-content .react-syntax-highlighter {
                width: 100% !important;
                max-width: none !important;
                overflow-x: hidden !important;
              }
              .print-content .react-syntax-highlighter pre {
                width: 100% !important;
                max-width: none !important;
                overflow-x: hidden !important;
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
              }
            }
            @media screen {
              body {
                background: white;
                color: black;
                padding: 20px;
              }
              .print-content {
                width: 100%;
                max-width: none;
              }
              .print-content .chakra-box {
                width: 100%;
                max-width: none;
                background: white;
              }
              .print-content table {
                width: 100% !important;
                max-width: none !important;
                border-collapse: collapse !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for styles to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}; 