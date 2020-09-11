
const 	Path = require('../modules/lazy-path'),
		File = require('../modules/lazy-file').File,
		
		modelName 		= process.argv[2],
		tableName		= process.argv[3],
		primaryColumn 	= process.argv[4],
		
		directory 		= './app';



File.mkdirs(directory);

File.write(`${directory}/${modelName}.js`, `class ${modelName} extends LazyDB {
	_attr = () => {
		return {
			table 			: '${tableName}',
			primaryColumn 	: '${primaryColumn}'
		}
	}
}

module.exports = new ${modelName}()._init();`);
