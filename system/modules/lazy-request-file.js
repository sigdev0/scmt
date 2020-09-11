module.exports = class LazyRequestFile {

    #buffer     = null;
    #fs         = require('fs');
    #fileType   = require('detect-file-type');
    #isEmpty    = false;
    #uploadPath = '';

    constructor(uploadedFile){
        if(uploadedFile === ''){
            this.#isEmpty = true;
        } else {
            var info = {};
            this.#fileType.fromBuffer(uploadedFile.buffer, (err, result) => {
                info = result;
            });

            this.name       = uploadedFile.originalname.replace(new RegExp(`.${uploadedFile.originalname.split('.').pop()}$`, 'ig'), '');
            this.nameExt    = uploadedFile.originalname;
            this.ext        = info.ext;
            this.mime       = info.mime;
            this.sizeInKB   = parseInt(Math.round(uploadedFile.size / 1024));
            this.sizeInMB   = parseInt(Math.round(uploadedFile.size / 1024 / 1024));
            this.sizeInGB   = parseInt(Math.round(uploadedFile.size / 1024 / 1024 / 1024));

            this.#buffer    = uploadedFile.buffer;
        }
    }

    getContent  = () => {
        return this.#buffer.toString();
    }

    empty     	= () => {
        return empty(this.getContent());
    }
    
    store       = (directory, fileName) => {
        if(this.#isEmpty){
            return [false, '-The request file is empty-'];
        } else {
            try {
                var fileExt     = `.${this.ext.replace('.', '')}`;
                    fileName    = String(fileName || `${this.name}`).replace(/\s+/gi, '');

                var available           = false,
                    fullPath            = bpath(`${spath('upload_dir')}/${directory}`),
                    index               = 1,
                    uploadedFileName    = fileName + fileExt;

                File.mkdirs(fullPath);

                do {
                    if(this.#fs.existsSync(`${fullPath}/${uploadedFileName}`)){
                        uploadedFileName = `${fileName}-${index++}${fileExt}`;
                    } else {
                        available = true;
                    }
                } while(!available);

                this.#uploadPath = `${fullPath}/${uploadedFileName}`;
                this.#fs.writeFileSync(this.#uploadPath, this.#buffer);

                return `files/${directory ? directory + '/' : ''}${uploadedFileName}`;
            } catch (error) {
                console.error(`Error in [File.store] / [File.save] : ${s(error)}`);
                return false;
            }
        }
    }

    undo        = () => {
        if (!$.isEmpty(this.#uploadPath)) {
            return File.delete(this.#uploadPath);
        }

        return true;
    }

    save      	= (fileName, fileExt) => {
        return this.store(fileName, fileExt);
    }

}
