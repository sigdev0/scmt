module.exports.Storage = new class LazyStorage {

    delete      = (file) => {
        var parsedPath  = spath('upload_dir');
            file        = replace(file, 'files/', '');

        foreach(split(file, '/'), (i, each) => {
            parsedPath += '/' + each;
        });

        parsedPath = bpath(parsedPath);

        if(File.exists(parsedPath))  File.delete(parsedPath);

        return true;
    }

    // download    = (file) => {
    //     var parsedPath  = 'storage';
    //         file        = replace(file, 'files/', '');

    //     each(split(file, '/'), (i, each) => {
    //         parsedPath += '/' + each;
    //     });

    //     parsedPath = bpath(parsedPath);

    //     if (File.exists(parsedPath)) {
    //         return res().download(`D:/projects/personal/lazify/storage/photos/logo-rajawali.jpg`);
    //     } else {
    //         console.error(`Cannot download file [${file}]`);
    //     }
    // }

    remove      = (file) => {
        return this.delete(file);
    }

}
