class LazyValidator {

    #data;
    #rules;
    #onError;
    #onSuccess;
    
    constructor(data = {}, rules = {}, onSuccess = () => {}, onError = (errors) => { typeof res !== 'undefined' && typeof res === 'function' ? res(errors, 422) : console.error(errors) }) {
        // this.alias      = {};
        this.#data      = data;
        this.#rules     = rules;
        this.#onError   = onError;
        this.#onSuccess = onSuccess;
    }

    #getValue           = (keys, isOptional) => {
        var invalidCount    = 0,
            value           = '';

        foreach(keys.split('.'), (i, key) => {
            value = i == 0 ? this.#data[key] : value[key];
        });

        if (Array.isArray(value)) {
            foreach(value, (i, each) => {
                invalidCount += typeof each === 'undefined' && !isOptional ? 1 : 0;
            });
        } else {
            invalidCount += typeof value === 'undefined' && !isOptional ? 1 : 0;
        }


        return invalidCount > 0 ? undefined : value;
    }
    
    #getValueMultiple       = (keys, isOptional) => {
        var invalidCount    = 0,
            isInvalid       = false,
            isSubkey        = keys.split('.').length > 1,
            value           = null,
            values          = [];

        if(isSubkey) {
            foreach(keys.split('.'), (i, each) => {
                if(i == 0) {
                    value = this.#data.props(each);
                } else {
                    foreach(value, (key, val) => {
                        value = val[each];

                        isInvalid        = typeof value === 'undefined' && !isOptional;
                        invalidCount    +=  isInvalid ? 1 : 0;

                        values.push(isInvalid ? undefined : value || null);
                    });
                }
            }); 
        } else {
            foreach(this.#data.props(), (i, row) => {
                value = row[keys];

                isInvalid        = typeof value === 'undefined' && !isOptional;
                invalidCount    +=  isInvalid ? 1 : 0;

                values.push(isInvalid ? undefined : value || null);
            });
        }
        
        return invalidCount > 0 ? undefined : values;
    }

    #validate           = (value, ruleKey, isRequired, isOptional) => {
        // value = value || '';
         
        var messages    = [],
            isFile      = value !== undefined && value.constructor.name === 'LazyRequestFile',
            isNumeric   = isFile ? false : !isNaN(parseInt(String(value))),
            isString    = isFile ? false : !isNumeric;

        /* Validation for REQUIRED and OPTIONAL */
        if((isRequired || !isOptional) && ((isString && value.length === 0) || (isFile && value.empty()))) {
            messages.push(`cannot be empty`);
        } else {
            for(var rule of this.#rules[ruleKey]) {
                rule = rule.trim();

                /* Validation for DATATYPE : ALPHA */
                if(rule === 'is:alpha' && !isOptional) {
                    var isAlpha = value.search(/^[\sa-z]+$/gi) >= 0;
                    if(!isAlpha) messages.push(`must contains only alpha characters`);
                }
    
                /* Validation for DATATYPE : ALPHADASH */
                if(rule === 'is:alphadash' && !isOptional) {
                    var isAlphaDash = value.search(/^[\s\_\-a-z]+$/gi) >= 0;
                    if(!isAlphaDash) messages.push(`must contains only alpha-dash characters`);
                }
        
                /* Validation for DATATYPE : ALPHANUMERIC */
                if(rule === 'is:alphanumeric' && !isOptional) {
                    var isAlphaNumeric = value.search(/^[a-z0-9]+$/gi) >= 0;
                    if(!isAlphaNumeric) messages.push(`must contains only alphanumeric characters`);        
                }
    
                /* Validation for DATATYPE : EMAIL */
                if(rule === 'is:email' && value.search('^[a-zA-Z_\\.]+@[a-zA-Z]+(\\.[a-zA-Z]+)+$') >= 0 && !isOptional) {
                    messages.push(`must be email`);
                }
    
                /* Validation for DATATYPE : FILE */
                if(rule === 'is:file' && !isFile && !isOptional) {
                    messages.push('must be a file');
                }
    
                /* Validation for DATATYPE : NUMERIC */
                if(rule === 'is:numeric' && !isNumeric && !isOptional) {
                    messages.push(`must be numeric`);
                }
    
                /* Validation for DATATYPE : STRING */
                if(rule === 'is:string' && typeof value !== 'string' && !isOptional) {
                    messages.push(`must be string`);
                }
    
                /* Validation for FILE ATTRIBUTE : MAX SIZE IN KB */
                if(rule.search('size-max-kb:') === 0 && isFile && !isOptional) {
                    var size = parseInt(rule.split(':')[1]);
                    if(value.sizeInKB > size) messages.push(`size must not exceed ${size}KB`);
                }
    
                /* Validation for FILE ATTRIBUTE : SIZE MAX IN MB */
                if(rule.search('size-max-mb:') === 0 && isFile && !isOptional) {
                    var size = parseInt(rule.split(':')[1]);
                    if(value.sizeInMB > size) messages.push(`size must not exceed ${size}MB`);
                }
    
                /* Validation for FILE ATTRIBUTE : SIZE MIN IN KB */
                if(rule.search('size-min-kb:') === 0 && isFile && !isOptional) {
                    var size = parseInt(rule.split(':')[1]);
                    if(value.sizeInKB < size) messages.push(`size must not smaller than ${size}KB`);
                }
    
                /* Validation for FILE ATTRIBUTE : SIZE MIN IN MB */
                if(rule.search('size-min-mb:') === 0 && isFile && !isOptional) {
                    var size = parseInt(rule.split(':')[1]);
                    if(value.sizeInMB < size) messages.push(`size must not smaller than ${size}MB`);
                }
    
                /* Validation for FILE ATTRIBUTE : EXTENSION */
                if(rule.search('ext:') === 0 && isFile && !isOptional) {
                    var allowedExtensions       = '',
                        extensions              = [],
                        isMatch                 = false,
                        isMultipleExtension     = false,
                        total                   = 0;

                    for(var each of rule.split(':')[1].split(',')){
                        each = `.${String(each).trim().replace('\.', '')}`;

                        extensions.push(each);
                        allowedExtensions += (allowedExtensions.length === 0 ? '' : ', ') + `\`${each}\``;
                        total++;

                        if(value.ext === each) isMatch = true;
                    }

                    isMultipleExtension     = total > 1;
                    allowedExtensions       = (isMultipleExtension ? 'one of ' : '') + allowedExtensions;

                    if(!isMatch) messages.push(`extension must be ${allowedExtensions}`);
                }
    
                /* Validation for FILE ATTRIBUTE : MIME */
                if(rule.search('mime:') === 0 && isFile && !isOptional) {
                    var allowedMimes    = '',
                        mimes           = [],
                        isMatch         = false,
                        isMultipleMime  = false,
                        total           = 0;

                    for(var each of rule.split(':')[1].split(',')){
                        each = String(each).trim();

                        mimes.push(each);
                        allowedMimes += (allowedMimes.length === 0 ? '' : ', ') + `\`${each}\``;
                        total++;

                        if(value.mime === each) isMatch = true;
                    }

                    isMultipleMime  = total > 1;
                    allowedMimes    = (isMultipleMime ? 'one of ' : '') + allowedMimes;

                    if(!isMatch) messages.push(`mime must be ${allowedMimes}`);
                }

                /* Validation for VALUE : CONFIRMED */
                if(rule.search('confirmed') === 0 && !isOptional) {
                    if(this.#data[ruleKey] !== this.#data[ruleKey + '_confirmation']){
                        messages.push(`confirmation is not equals`);
                    }
                }
    
                /* Validation for VALUE : MIN */
                if(rule.search('min:') === 0 && !isOptional) {
                    var min = parseInt(rule.split(':')[1].trim());
                    if((isString || (!isNumeric && !isFile)) && value.length < min) {
                        messages.push(`minimum length must be ${min}`)
                    } else if(isNumeric && value < min) {
                        messages.push(`minimum value must be ${min}`)
                    }
                }
        
                /* Validation for VALUE : MAX */
                if(rule.search('max:') === 0 && !isOptional) {
                    var max = parseInt(rule.split(':')[1].trim());
                    if((isString || (!isNumeric && !isFile)) && value.length > max) {
                        messages.push(`maximum length must be ${max}`)
                    } else if(isNumeric && value > max) {
                        messages.push(`maximum value must be ${max}`)
                    }
                }
    
                /* Validation for VALUE : IN */
                if(rule.search('in:') === 0 && !isOptional) {
                    var options = rule.split(':')[1].split(','),
                        found   = false;
                    
                    for(var option of options) {
                        if(value === option) {
                            found = true;
                        }
                    }
    
                    if(!found && !isOptional) messages.push(`must be between ${options}`);
                }
    
                /* Validation for VALUE : NOT_IN */
                if(rule.search('not_in:') === 0 && !isOptional) {
                    var options = rule.split(':')[1].split(','),
                        found   = false;
                    
                    for(var option of options) {
                        if(value === option) {
                            found = true;
                        }
                    }
    
                    if(found && !isOptional) messages.push(`must not be between ${options}`);
                }
    
                /* Validation for VALUE : REGEX */
                if(rule.search('regex:') === 0 && !isOptional) {
                    var pattern = rule.split(':')[1];
                    if(value.search(pattern, 'ig') && !isOptional) messages.push(`must have regex pattern of ${pattern}`);
                }
    
                /* Validation for VALUE : NOT_REGEX */
                if(rule.search('not_regex:') === 0 && !isOptional) {
                    var pattern = rule.split(':')[1];
                    if(!value.search(pattern, 'ig') && !isOptional) messages.push(`must not have regex pattern of ${pattern}`);
                }
    
                /* Validation for VALUE : UNIQUE */
                if(rule.search('unique') === 0 && !isOptional) {
                    
                    // if(config('db.active') !== '') {
                        var schema      = String(rule.split(':')[1]),
                            length      = schema.split(',').length,
                            
                            table       = String(schema.split(',')[0]),
                            column      = String(schema.split(',').length === 1 ? ruleKey : schema.split(',')[1]),
                            
                            eloquent    = db(table);
                        if(length <= 2) {
                            var body = eloquent.where(column, value).first();
    
                            if(body && !isOptional) messages.push(`already exists and used by other record`);
                        } else {
                            var columnName      = length === 3 ? eloquent.primary() : schema.split(',')[2],
                                exception       = String(schema.split(',')[length-1]),
                                body = eloquent.where(column, value).whereRaw(`\"${columnName}\" <> ?`, [exception]).first();

                            if(body && !isOptional) messages.push(`already exists and used by other record`);
                        }
                    // } else {
                    //     messages.push(`Your server configuration is not enabled for DB Action, UNIQUE rule needs Database Operation. Please set active connection in \`config/server.js\``)
                    // }
                }
    
                /* Validation for VALUE : EXISTS */
                if(rule.search('exists') === 0 && !isOptional) {
                    // if($config('db.active') !== '') {
                        var schema  = String(rule.split(':')[1]),
                            table   = String(schema.split(',')[0]),
                            column  = schema.split(',').length === 1 ? ruleKey : String(schema.split(',')[1]);

                        var eloquent    = db(table);
                        var body        = eloquent.where(column, value).first();
    
                        if(!body && !isOptional) messages.push(`value of \`${value}\` does not exist in system`);
                    // } else {
                    //     messages.push(`Your server configuration is not enabled for DB Action, EXISTS rule needs Database Operation. Please set active connection in \`config/server.js\``)
                    // }
                }    
    
                /* Validation for VALUE : NOT_EXISTS */
                if(rule.search('not_exists') === 0 && !isOptional) {
                    // if($config('db.active') !== '') {
                        var schema  = String(rule.split(':')[1]),
                            table   = String(schema.split(',')[0]),
                            column  = schema.split(',').length === 1 ? ruleKey : String(schema.split(',')[1]);
                        
                        var eloquent            = db(table);
                        var body    = eloquent.where(column, value).first();
    
                        if(!body && !isOptional) messages.push(`value of \`${value}\` already exist in system`);
                    // } else {
                    //     messages.push(`Your server configuration is not enabled for DB Action, NOT_EXISTS rule needs Database Operation. Please set active connection in \`config/server.js\``)
                    // }
                }   
        
            }
        }
    
        return messages;
    }

    validate            = () => {
        var messages    = [];

        foreach(this.#rules, (key, rule) => {
            var isArray         = key.endsWith('[]'),
                isMultiple      = key.endsWith('*'),
                isNormal        = !isArray && !isMultiple,
                isOptional      = String(rule).trim().search('optional') >= 0,
                isRequired      = String(rule).trim().search('required') >= 0,

                key             = key.replace("\*", "").replace('\[\]', ''),
                value           = isMultiple ? this.#getValueMultiple(key, isOptional) : this.#getValue(key, isOptional),
                values          = [];

            if (isNormal) {
                values.push(value);
            } else if(isArray || isMultiple) {
                values = value;
            }

            if((value === null || typeof value === 'undefined') && !isOptional) {
                /* Validation for REQUEST BODY */
                messages.push(`\`${key}\` does not exists in request`);

            } else {
                var index = 0;
                for(var value of values) {
                    if(value !== null){
                        for(var message of this.#validate(value.constructor.name === 'Number' ? value : (value || ''), key, isRequired, isOptional)) {
                            messages.push(`\`${key}\`${isNormal ? '' :  `(index ${index})`} ${message}`);
                        }
                    }
                    index++;
                }
            }
        });

        if (messages.length > 0) {
            this.#onError(messages);
        } else {
            this.#onSuccess();
        }

        return empty(messages) ? true : messages;
    }
}

module.exports.validate = (data, rule, onSuccess, onError) => {
    // if(data.constructor.name !== 'LazyData'){
    //     var originalKey = {};
    //     foreach(data, (key, value) => {
    //         originalKey[key] = key;
    //     });

    //     data = $data(originalKey, data);
    // }

    return new LazyValidator(data, rule, onSuccess, onError).validate();
};
