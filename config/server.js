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
 * | mailer_host		| somemailhost		|
 * | mailer_port		| somemailport		|
 * | mailer_username	| somemailusername	|
 * | mailer_password	| somemailpassword	|
 * '----------------'-----------------------'
 */

module.exports = {
	/* JWT */
    jwt 		: {
		enabled		: false,
		source		: "database", //config, database (using database section below)
        hash 		: "",
		expiration  : "", //1h, 30m,
	},

	/* Telegram BOT */
	telegram 	: {
		enabled 	: false,
		source 		: "database", //config, database (using database section below)
		token 		: "",
		token_field	: "", //for testing purpose (default is `telegram_token`), 
					  //fill with different field so there will no conflicting instance of Telegram Bot
	},

	/* Mailer */
	mailer 		: {
		enabled 	: false,
		source 		: "database",  //config, database (using database section below)
		host 		: "",
		port 		: "",
		username 	: "",
		password 	: ""
	},
	
	/* Server */
	server 		: {
		name 		: 'SCMT Api - Procurement',
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
