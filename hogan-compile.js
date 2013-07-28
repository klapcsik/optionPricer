var fs = require('fs'),
    hogan = require('hogan.js');

var templateDir = 'app/templates/',
    template,
    templateKey,
    result = 'var appTemplates = {};';

fs.readdirSync(templateDir).forEach(function(templateFile) {

    template = fs.readFileSync(templateDir + templateFile, 'utf8');
    templateKey = templateFile.substr(0, templateFile.lastIndexOf('.'));

    result += 'appTemplates["'+templateKey+'"] = ';
    result += 'new Hogan.Template(' + hogan.compile(template, {asString: true}) + ');';

});

fs.writeFile('app/build/templates/compiled.js', result, 'utf8');