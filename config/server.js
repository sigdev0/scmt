/**
 * If source is set to "database", it will read the configuration in 
 * table 		: config
 * column		: name
 * identifier 	: according to section (see table example below)
 * 
 * So the table must be like:
 * .----------------------------------------.
 * | Config 								|
 * .----------------------------------------.
 * | name (unique)		| value 			|
 * |--------------------|-------------------.
 * | jwt_hash			| somerandomstring	|
 * | jwt_expiration		| 1h				|
 * | jwt_enabled		| true				|
 * | telegram_enabled	| true				|
 * | telegram_token		| sometelegramtoken	|
 * '----------------'-----------------------'
 */

module.exports = {
	/* JWT */
    jwt 		: {
		enabled		: false,
        hash 		: "0n41y7jHoUr1yyKooFrGIGD1yU1rfkl5chpw9MfNu5lN14cKOyGDzo7QzpQvXY9c",
		expiration  : "1h", //1h, 30m,
		source		: "config", //config, database (using database section below)
	},

	/* Telegram BOT */
	telegram 	: {
		enabled 	: false,
		token 		: "",
		source 		: "config", //config, database (using database section below)
		token_field	: 'telegram_token', //for testing purpose (default is `telegram_token`), 
					  //fill with different field so there will no conflicting instance of Telegram Bot
	},
	
	/* Server */
	server 		: {
		name 		: 'Lazify',
		version		: '1.0',
		cors 		: true,
		https 		: false,
		certkey 	: {
			cert 	: 'd:/openssl/certificate.crt',
			key 	: 'd:/openssl/key.key'
		},
		port 		: 8080
	},

	/* Database */
	db 			: {
		active 		: true,
		client 		: 'postgres', 	//mysql, postgres
		logging 	: false,
		
		/* Use this when uploading to Openshift */
		// host 		: process.env.DB_HOST,
		// port 		: process.env.DB_PORT,
		// database 	: process.env.DB_NAME,
		// schema		: process.env.DB_SCHEMA,
		// username 	: process.env.DB_USERNAME,
		// password 	: process.env.DB_PASSWORD,
		
		/* Use this when developing in local environment */
		host 		: '10.62.165.59',
		port 		: '5432',
		database 	: 'postgres',
		schema		: 'dev',	//postgres only
		username 	: 'postgres',
		password 	: 'postgres',
	}
};
