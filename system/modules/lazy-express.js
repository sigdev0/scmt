module.exports = new class LazyExpress {

	#express 					= require('express');
	#app 						= null;
	#server 					= null;
	#multer 					= null;
	#jwt 						= null;

	#request 					= null;
	#response 					= null;
	#next 						= null;

	#corsEnabled 				= false;
	#httpsEnabled 				= false;

	#jwtExclusions				= [/files\/*/];
	#routeList					= [];
	#routeLog					= [];
	#autoRouteList 				= [];

	/* Twing */
	#twingEnvironment 			= null;
	#twingLoaderFilesystem 		= null;
	#twingLoader 				= null;
	#twingEnv 					= null;

	/* Session */
	#session 					= require('store');

	/* Error Containers */
	#errors 					= [];

	constructor(){
		/* Express */
		this.#app 		= this.#express();	
		this.#multer 	= require('multer')();		

		/* Twing */
		if(File.exists(spath('view_dir'))){
			this.#twingEnvironment 			= require('twing').TwingEnvironment;
			this.#twingLoaderFilesystem 	= require('twing').TwingLoaderFilesystem;
			this.#twingLoader 				= new this.#twingLoaderFilesystem(spath('view_dir'));
			this.#twingEnv 					= new this.#twingEnvironment(this.#twingLoader);
		} else {
			this.#errors.push(`- '${spath('view_dir')}' assigned for view files cannot be found, view functionality is disabled`);
		}

		this.#app.use(this.#express.json());
		this.#app.use(this.#express.urlencoded({ extended: true }));

		this.#initPublicDir();
		this.#initSession();
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
        if(jwt.enabled() || this.#jwtExclusions.length > 0) {
			if(config('jwt.hash') && config('jwt.expiration')) {
				this.#jwt = require('express-jwt')({
					secret 		: config('jwt.hash'),
					expire 		: config('jwt.expiration'),
					algorithms 	: ['RS256']
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
			}
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

	#initPublicDir 			= () => {
		foreach(spath('public_dir'), (key, value) => {
			this.#app.use(`/${key}`, this.#express.static(bpath(value)));
		});
	}

	#initSession 			= () => {
		global.session = this.#session;
	}

	#initStorageRoutes		= () => {
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
	}

	#initStorageDownloader 	= () => {
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
	}

	#assignREST 			= (method, url, action, withJWT = jwt.enabled()) => {
		if(startsWith(url, '/')) url = cutl(url, 1);
		url = `/${url}`;

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
					if(!res.headersSent) res.status(statusCode).send(message);
				};
	
				global.end 		= (param = '', statusCode = 200) => {
					res.status(statusCode).end(param);
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

				global.redirect = (url) => {
					res.redirect(url);
				}
		
				action(req, res, next);
				end();
			},
			jwt 	: withJWT
		});
	}

	#assignRoutes 			= () => {
		if(count(this.#routeList) > 0){
			var middlewares = [this.#multer.any()];

			if(jwt.enabled()) middlewares.push(this.#jwt);
			foreach(this.#routeList, (i, each) => {
				this.#routeLog.push({
					method 	: upper(each.method),
					url 	: each.url,
					jwt		: each.jwt
				});
				this.#app[each.method](each.url, middlewares, each.action);
			})
		}
	}

	#assignView 			= () => {
		global.view 	= (view, data = {}) => {
			if(empty(this.#errors)){
				
				foreach(spath('public_dir'), (key, value) => {
					data[key] = key;
				});

				var rendered = null

				this.#twingEnv.render(view, data).then((output) => {
					rendered = output;
				});
				sync(() => rendered == null);

				end(rendered);
			} else {
				end(`ERROR : '${spath('view_dir')}' not found, make sure directory & view files exist`, '');
			}
		}
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

	serve 					= () => {

		/* Add Endpoint to Display Routes */
		var tempRoute = this.#routeLog;
		this.#assignREST('get', 'routes', function(req, res){
			var routes 	=`<table align='center' border='1' cellspacing='0' cellpadding='4'><thead><tr><th align='center' style='font-weight:bold'>Method</th><th>URL</th><th>JWT</th></tr></thead><tbody>`,
				last 	='%';

			foreach(tempRoute, (i, each) => {
				if((!contains(split(each.url, '/')[1], last) && !contains(last, split(each.url, '/')[1])) || last === '') routes += `<tr><td colspan='3' style='background:darkgrey;'></td></tr>`;

				var color 	= 'green', 
					_jwt 	= jwt.enabled();

				if((each.jwt !== _jwt && _jwt) || (each.jwt === _jwt && !_jwt)){
					color = 'orange';
				}

				routes += `<tr><td>${each.method}</td><td>${each.url}</td><td style="background:${color};"></td></tr>`;

				
				last = split(each.url, '/')[1];
			});

			routes += `</tbody></table>`;

			res.send(routes);

		}, false);


		/* Handle Storage Routes & Downloader */
		this.#initStorageRoutes();
		this.#initStorageDownloader();

		/* Handle CORS, JWT and Protocol */
		this.#initCORS();
		this.#initProtocol();
		this.#initJWT();

		/* Auto Register Routes & Assign Routes */
		this.#autoRegisterRoutes(spath('api_dir'));
		this.#assignRoutes();

		/* Assign View */
		this.#assignView();

		/* Server Listener */
		this.#server.listen(config('server.port'), () => {
			var last 		= '%';

			console.log(`-----------------------`);
			console.log(` >     ROUTE LIST    < `);
			console.log(`-----------------------`);
			foreach(this.#routeLog, (i, each) => {
				if((!contains(split(each.url, '/')[1], last) && !contains(last, split(each.url, '/')[1])) || last === '') console.log('');

				console.log(`${each.method}\t: ${each.url} ${jwt.enabled() === each.jwt ? '' : (jwt.enabled() ? '[no JWT]' : '[with JWT]')}`);
				
				last = split(each.url, '/')[1];
			});
			console.log('', '');

			// console.log(`-----------------------`);
			// console.log(` >   SERVER STARTED   <`);
			// console.log(`-----------------------`);
			var log 	= `   \`${config('server.name')} ${config('server.version')}\` running at port \`${config('server.port')}\``, 
				spacer	= (length) => {
					var spaces = '';
					for(var i = 0; i < length ; i++){
						spaces += ' ';
					}
					return spaces;
				};

			console.log(`...${spacer(log.length - 3)}...`);
			console.log(`..${spacer(log.length - 2)} ..`);
			console.log(`.${spacer(log.length - 1)}  .`);
			console.log(log);
			console.log(`   [${this.#corsEnabled ? 'x' : ' '}] with CORS`)
			console.log(`   [${jwt.enabled() ? 'x' : ' '}] with JWT (global)`)
			console.log(`   [${Telegram.enabled() ? 'x' : ' '}] with Telegram BOT`)
			console.log(`.${spacer(log.length - 1)}  .`);
			console.log(`..${spacer(log.length - 2)} ..`);
			console.log(`...${spacer(log.length - 3)}...`);
			// console.log(``);
			// console.log(`[${this.#httpsEnabled ? 'x' : ' '}] HTTPS enabled`);
			// console.log(`[${this.#corsEnabled ? 'x' : ' '}] CORS enabled`);
			// console.log(`[${jwt.enabled() ? 'x' :  ' '}] JWT enabled`);
			// console.log(``, ``);

			if(count(this.#errors) > 0){
				console.log(`----------------`);
				console.log(` >   ERRORS   < `)
				console.log(`----------------`);
				foreach(this.#errors, (i, each) => {
					console.log(each);
				});
			}

		});
	}

};
