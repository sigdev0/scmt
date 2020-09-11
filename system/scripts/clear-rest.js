const 	fs 	= require('fs'),
		Dir = require('../path');

/* Model Deletion */
console.log(`[-- Model Deletion --]`);
fs.readdirSync(`./${Dir.model_dir}`).forEach((eachFile) => {
	fs.unlinkSync(`./${Dir.model_dir}/${eachFile}`);
	console.log(`[x] ${eachFile}`);
});
console.log('')

/* API Deletion */
console.log(`[-- API Deletion --]`);
fs.readdirSync(`./${Dir.api_dir}`).forEach((eachFile) => {
	fs.unlinkSync(`./${Dir.api_dir}/${eachFile}`);
	console.log(`[x] ${eachFile}`);
});
console.log('')
