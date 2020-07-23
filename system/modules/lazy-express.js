module.exports = new class LazyExpress {

	#express 		= require('express');
	#app 			= null;
	#server 		= null;
	#multer 		= null;
	#jwt 			= null;

	#request 		= null;
	#response 		= null;
	#next 			= null;

	#corsEnabled 	= false;
	#jwtEnabled 	= false;
	#httpsEnabled 	= false;

	#jwtExclusions	= [/files\/*/];
	#routeList		= [];
	#autoRouteList 	= [];

	constructor(){
		this.#app 		= this.#express();		
		this.#multer 	= require('multer')();		

		this.#app.use(this.#express.json());
		this.#app.use(this.#express.urlencoded({ extended: true }));
	}

	#initCORS 				= () => {
		if(config('server.cors'))  {
			var cors =  require('cors')({
				origins			: ['*'],
				allowHeaders	: ["Authorization"],
				exposeHeaders	: ["Authorization"]
			});;

			this.#app.use(cors);
			this.#corsEnabled = true;
		}
	}

	#initJWT 				= () => {
        if(config('jwt.hash') && config('jwt.expiration')) {
			this.#jwt = require('express-jwt')({
				secret : config('jwt.hash'),
				expire : config('jwt.expiration')
			}).unless({
				path : this.#jwtExclusions
			});

            this.#app.use(this.#jwt);
            this.#app.use((error, req, res, next)  => {
                if(error.status === 401) {
                    if (!empty(error.inner.name) && error.inner.name === 'TokenExpiredError') {
                        res.status(401).send({status : "ERROR", message : "Token expired..."});
                    } else {
                        res.status(401).send({status : "ERROR", message : "No authorization token was found..."});
                    }
                }
			});
			
			this.#jwtEnabled = true;
        }
	}

	#initProtocol 			= () => {
		var cert 	= config('server.certkey.cert'),
			key 	= config('server.certkey.key'),
			certkey = {};

		cert 		= File.exists(cert) ? File.read(cert) 	: null;
		key 		= File.exists(key) 	? File.read(key) 	: null;
		certkey 	= {cert : cert, key : key};

		if(cert != null && key != null && config('server.https')) {
			this.#httpsEnabled 	= true;
			this.#server 		= require('https').createServer(this.#app, certkey);
		} else {
			this.#server 		= require('http').createServer(this.#app);
		}
	}

	#assignREST 			= (method, url, action, withJWT = true) => {
		if(startsWith(url, '/')) url = cutl(url, 1);
		url = `/${url}`;

		console.log(`${upper(method)}\t : ${url}`);

		if(!withJWT) this.#jwtExclusions.push(url);
		
		this.#routeList.push({
			method 	: method, 
			url 	: url,
			action 	: (req, res, next) => {

				global.header 	= (key = '') => {
					return key ? req.headers[key] : req.headers;
				}
	
				global.req 		= global.request 	= (...key) => {
					var lazyRequest = require('./lazy-request'),
						data 		= {};
	
					// console.log(req);
					lazyRequest = new lazyRequest(req);
	
					if(key.length > 1){
						foreach(key, (i, value) => {
							data[value] = lazyRequest.get(value);
						});
	
						return data;
					} else if(key.length == 1){
						return lazyRequest.get(key[0]);
					}
	
					return lazyRequest;
				};
	
				global.res 		= global.response 	= (message, statusCode = 200) => {
					res.send(message).status(statusCode);
				};
	
				global.end 		= () => {
					res.end();
				};
	
				global.next 	= next;
	
				global.param 	= (...key) => {
					var param = {};
	
					if(key.length > 1){
						foreach(key, (i, each) => {
							param[each] = req.params[each] || '';
						});
			
						return param;
					} else if(key.length == 1){
						return req.params[key[0]];
					}
			
					return req.params;
				}
		
				action(req, res, next);
				end();
			},
		});
	}

	#autoRegisterRoutes 	= (dir) => {
		File.list(dir, (file, staticPath, dynamicPath) => {
			if(File.isFile(staticPath)){
				if(endsWith(file, 'js')) require(staticPath);
			} else {
				this.#autoRegisterRoutes(dynamicPath);
			}
		});
	}

	DELETE 					= (url, action, withJWT) => {
		this.#assignREST('delete', url, action, withJWT);
	};

	GET 					= (url, action, withJWT) => {
		this.#assignREST('get', url, action, withJWT);
	};

	POST 					= (url, action, withJWT) => {
		this.#assignREST('post', url, action, withJWT);
	};

	PUT 					= (url, action, withJWT) => {
		this.#assignREST('put', url, action, withJWT);
	};

	HEADER 					= (key = '') => {
		return key ? request.headers[key] : request.headers;
	};

	serve = (withJWT = true) => {
		/* Fake Files Routes */
		this.#app.get('/files/*', (req, res, next) => {
			var parsedPath = 'storage';
			foreach(split(req.params[0], '/'), (i, each) => {
				parsedPath += '/' + each;
			});

			parsedPath = bpath(parsedPath);

            if (File.exists(parsedPath)) {
                res.sendFile(parsedPath);
            } else {
                var body = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <title>Error</title>
                    </head>
                    <body>
                        <pre>Cannot GET /files/${req.params[0]}</pre>
                    </body>
                </html>`;

                res.status(404).send(body);
            }
		});

		/* Download Uploaded Files Routes */
		this.#app.get('/download/*', (req, res, next) => {
			var parsedPath = 'storage';
			foreach(split(req.params[0], '/'), (i, each) => {
				parsedPath += '/' + each;
			});

			parsedPath = bpath(parsedPath);

            if (File.exists(parsedPath)) {
                res.download(parsedPath);
            } else {
                var body = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <title>Error</title>
                    </head>
                    <body>
                        <pre>Cannot download /files/${req.params[0]}</pre>
                    </body>
                </html>`;

                res.status(404).send(body);
            }
		});

		/* Handle CORS, JWT and Protocol */
		this.#initCORS();
		this.#initProtocol();

		if(withJWT) this.#initJWT();

		/* Auto Register Routes */
		console.log(`-----------------------`);
		console.log(` >     Route List    < `);
		console.log(`-----------------------`);
		this.#autoRegisterRoutes('routes');
		console.log(``, ``);

		/* Assign Route */
		var middlewares = [this.#multer.any()];
		if(withJWT) middlewares.push(this.#jwt);

		foreach(this.#routeList, (i, each) => {
			this.#app[each.method](each.url, middlewares, each.action);
		})

		this.#server.listen(config('server.port'), () => {
			console.log(`-----------------------`);
			console.log(` >   SERVER STARTED   < `);
			console.log(`-----------------------`);
			console.log(`\`${config('server.name')} ${config('server.version')}\` running at port \`${config('server.port')}\``);
			console.log(``);
			console.log(`[${this.#httpsEnabled ? 'x' : ' '}] HTTPS enabled`);
			console.log(`[${this.#corsEnabled ? 'x' : ' '}] CORS enabled`);
			console.log(`[${this.#jwtEnabled ? 'x' :  ' '}] JWT enabled`);
			console.log(``);
		});
	}

};
