module.exports = {
	/* JWT */
    jwt 	: {
        "hash" 			: "0n41y7jHoUr1yyKooFrGIGD1yU1rfkl5chpw9MfNu5lN14cKOyGDzo7QzpQvXY9c",
		"expiration"    : "1h", //1h, 30m,
		"global"		: false
	},
	
	/* Server */
	server 	: {
		name 		: 'SCMT 2020',
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
	db 		: {
		active 		: true,
		client 		: 'postgres', 	//mysql, postgres
		logging 	: true,

		host 		: process.env.DB_HOST,
		port 		: process.env.DB_PORT,
		database 	: process.env.DB_NAME,
		schema		: process.env.DB_SCHEMA,
		username 	: process.env.DB_USERNAME,
		password 	: process.env.DB_PASSWORD,
	}
};
