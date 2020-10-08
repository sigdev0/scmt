
const 	Path 			= require('../modules/lazy-path'),
		File 			= require('../modules/lazy-file').File,
		Str 			= require('../modules/lazy-string'),
		Dir 			= require('../path'),
		Voca 			= require('voca'),
		
		modelName 		= process.argv[2],
		tableName		= process.argv[3],
		primaryColumn 	= process.argv[4];

/* Model Creation */
File.mkdirs(`./${Dir.model_dir}`);
File.write(`./${Dir.model_dir}/${modelName}.js`, `class ${modelName} extends LazyDB {
	_attr = () => {
		return {
			table 			: '${tableName}',
			primaryColumn 	: '${primaryColumn}'
		}
	}
}

module.exports = new ${modelName}()._init();`);
console.log(`Model '${modelName}' generated...`);

/* API Creation */
var routeName = Voca.slugify(modelName);

File.mkdirs(`./${Dir.api_dir}`)
File.write(`./${Dir.api_dir}/${routeName}.js`, `/* ${modelName} Details */
GET('${routeName}/:id'          , () => {
	var data = param(),
		rule = {
			id : ['required']
		};

    validate(data, rule, () => {
        var instance = ${modelName}.find(data.id);

        res(instance);
    });
});

/* ${modelName} List */
GET('${routeName}' 			, () => {
	var searchFields 	= [],
		instance 		= ${modelName}.instance(),
		
		limit 			= req('limit'),
		offset  		= req('offset'),
		keyword 		= req('keyword');

    if(!empty(limit))  		instance.limit(limit);
	if(!empty(offset))  	instance.offset(offset);
	if(!empty(keyword)){
		foreach(searchFields, (i, each) => {
			if (i === 0){
				instance.whereLike(each, keyword);
			} else {
				instance.orWhereLike(each, keyword);
			}
		});
	}

	var result = instance.get();

    res(result);
});

/* ${modelName} Insert */
POST('${routeName}/insert' 		, () => {
	var data 	= req(),
		rule 	= {
			
		};

    validate(data, rule, () => {
		data.id 		= ${modelName}.max('id') + 1;
		data.created_at = now(true);
		data.updated_at = now(true);
		
		var instance = ${modelName}.insert(data);

        if(instance){
            res(instance);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* ${modelName} Update */
PUT('${routeName}/update' 		, () => {
	var data = req(),
		rule = {

		};

    validate(data, rule, () => {
		var condition = {id : data.id};
			
		data.updated_at = now(true);
		delete data.id;

		var instance = ${modelName}.update(data, condition);
			
        if(instance){
            res(instance);
        } else {
			res('Internal server error occured', 500);
        }
    });
});

/* ${modelName} Delete */
DELETE('${routeName}/delete/:id', () => {
	var data = param(),
		rule = {
			id : ['required']
		};

    validate(data, rule, () => {
		var instance 	= ${modelName}.delete(data);

		if(instance){
			res(\`ID '\${data.id}' successfully deleted\`);
		} else {
			res('Internal server error occured', 500);
		}
    });
});`);

console.log(`Route '${routeName}' generated...`);
