module.exports = class LazyRequest {

	#request 		=  null;
	#isMultipart 	= null;

    constructor(request){

		this.#request        = null;
        this.#isMultipart    = contains(header('content-type'), 'multipart/form-data');


        var body    = {},
            files   = {};

        if(this.#isMultipart){
            for(var file of request.files){
                var lazyRequestFile = require(bpath('system/modules/lazy-request-file'));
                files[file.fieldname] = new lazyRequestFile(file.originalname !== '' && file.size > 0 ? file : '');
            }
        }

        this.#request = Object.assign(request.body, request.query, files);        
    }

    file        = (paramKey) => {
        var val = undefined;

        if(this.#isMultipart){
        	each(this.#request, (key, value) => {
                if(paramKey === key && value.constructor.name === 'LazyRequestFile') val = value;
            });
        }

        return val;
    }

    all         = () => {
        var data = {};

        foreach(this.#request, (key, value) => {
            data[key] = value;
        });

        return data;
    }

    get         = (paramKey) => {
        var val     = this.#request;

        foreach(split(paramKey, '.'), (index, subkey) => {
            if(val){
                val = hasKey(val, subkey) ? val[subkey] : null;
            }
        });

        return val;
    }

    has         = (paramKey) => {
        var found = false;
        foreach(this.#request, (key, value) => {
            if(paramKey === key && value.constructor.name !== 'LazyRequestFile') found = true;
        });

        return found;
    }

    hasFile     = (paramKey) => {
        var found = false;
        if(this.#isMultipart){
            foreach(this.#request, (key, value) => {
                if(paramKey === key && value.constructor.name === 'LazyRequestFile') found = true;
            });
        }

        return found;
    }
};
