const renderPdf = require("./render");

renderPdf("reports/test.pdf")
  .then(() => console.log("PDF saved to reports/test.pdf"))
  .catch(err => console.error(err));