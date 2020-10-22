module.exports.rest = new class LazyRest {

    #requestPromise;

    constructor(){
        this.#requestPromise = require('request-promise');
    }

    #request = (type, url, body = {}, headers = {}) => {        
        var options     = {
				body                    : body,
				headers                 : headers,
				json                    : true,
				method                  : type,
				resolveWithFullResponse : true,
				uri                     : url,
        	},
            parsed      = null,
            wait        = true;
    
        // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        this.#requestPromise(options).then((response) => {
            wait    = false;
            parsed  = {
                body : response.body,
                code : response.statusCode
            };
        }).catch((error) => {
            wait    = false;
            parsed  = {
                // statusCode  : error.statusCode,
                code    : error.statusCode,
                body    : error.error,
            };
        });
    
        sync(() => wait);
    
        return parsed;
    }

    get     = (url, body, header) => { return this.#request('GET'    , url, body, header); }
    post    = (url, body, header) => { return this.#request('POST'   , url, body, header); }
    put     = (url, body, header) => { return this.#request('PUT'    , url, body, header); }
    delete  = (url, body, header) => { return this.#request('DELETE' , url, body, header); }
}
