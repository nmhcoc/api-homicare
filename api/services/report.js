let XlsxTemplate = require('xlsx-template');
const fs = require('fs');
let path = require('path');
let report = {};
report.genExcelData = (templateFile, input) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(common.getTemplateFolder(), templateFile), function (err, data) {

            // Create a template
            var template = new XlsxTemplate(data);

            // Replacements take place on first sheet
            var sheetNumber = 1;

            // Perform substitution
            template.substitute(sheetNumber, input);

            // Get binary data
            var data = template.generate();
            resolve(data);
        });
    })

}
module.exports = report;