module.exports.File = new class LazyFile {

    #fs             = require('fs');
    #resolve        = require('path').resolve;

    #parse          = (fullPath) => {
        fullPath        = String(fullPath).replace(/\\/gi, '/');

        var fileName    = fullPath.split('/').pop(),
            basePath    = fullPath.replace(`/${fileName}`, '');

        return [basePath, fullPath];
    }

    constructor(){
    }

    append      = (rawPath, data) => {
        try {
            var [path, fullPath] = this.#parse(rawPath);

            this.mkdirs(path);
            this.#fs.appendFileSync(fullPath, data);
        } catch (error) {
            console.log(`ERROR [File.append] : ${String(error)}`);
            return false;
        }

        return true;
    }

    copy        = (rawOldPath, rawNewPath, overwrite) => {
        try {
            var [oldPath, oldFullPath]  = this.#parse(rawOldPath),
                [newPath, newFullPath]  = this.#parse(rawNewPath);

            if(overwrite && this.exists(newFullPath)) this.#fs.unlinkSync(newFullPath);
             
            this.#fs.copyFileSync(oldFullPath, newFullPath);
        } catch (error) {
            console.log(`ERROR [File.copy] : ${String(error)}`);
            return false;
        }

        return true;
    }

    delete      = (rawPath) => {
        try {
            var [path, fullPath] = this.#parse(rawPath);
            if(this.exists(fullPath)) {
                if(this.#fs.lstatSync(fullPath).isDirectory()){
                    this.#fs.rmdirSync(fullPath, {recursive : true});
                } else {
                    this.#fs.unlinkSync(fullPath);
                }
            }
        } catch (error) {
            console.log(`ERROR [File.delete] : ${String(error)}`);
            return false;
        }

        return true;
    }

    exists      = (rawPath) => {
        var [path, fullPath] = this.#parse(rawPath);

        return this.#fs.existsSync(fullPath);
    }

    isDir       = (path) => {
        return this.#fs.lstatSync(path).isDirectory();
    }

    isFile      = (path) => {
        return this.#fs.lstatSync(path).isFile();
    }

    list        = (directory, callback) => {
        var path = bpath(directory);

        if (File.exists(path)) this.#fs.readdirSync(path).forEach((eachFile) => {
            var file        = eachFile,
                staticPath  = path + '/' + file,
                dynamicPath = directory + '/' + file;

            callback(file, staticPath, dynamicPath);
        });
    }

    mkdirs      = (rawPath) => {
        var [path, fullPath] = this.#parse(rawPath);

        return this.#fs.mkdirSync(fullPath, {recursive : true});
    }

    move        = (rawOldPath, rawNewPath) => {
        return this.rename(rawOldPath, rawNewPath);
    }

    read        = (rawPath, encoding = 'utf-8') => {
        try {
            var [path, fullPath] = this.#parse(rawPath);

            return this.#fs.readFileSync(fullPath, encoding);
        } catch (error) {
            console.log(`ERROR [File.read] : ${String(error)}`);
            return false;
        }
    }

    rename      = (rawOldPath, rawNewPath) => {
        try {
            var [oldPath, oldFullPath] = this.#parse(rawOldPath),
                [newPath, newFullPath] = this.#parse(rawNewPath);
            
            this.mkdirs(newPath);
            this.#fs.renameSync(oldFullPath, newFullPath);

            return this.#fs.existsSync(newFullPath);
        } catch (error) {
            console.log(`ERROR [File.rename] : ${String(error)}`);
            return false;
        }
    }

    write       = (rawPath, data, encoding) => {
        try {
            
            var [path, fullPath] = this.#parse(rawPath);
            if(typeof encoding === 'undefined') encoding = 'utf-8';

            this.mkdirs(path);
            this.#fs.writeFileSync(fullPath, data, encoding);

            return this.#fs.existsSync(fullPath);
        } catch (error) {
            console.log(`ERROR [File.write] : ${String(error)}`);
            return false;
        }
    }

}
