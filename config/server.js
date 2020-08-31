module.exports = {
	/* JWT */
    "jwt" 	: {
        "hash" 			: "0n41y7jHoUr1yyKooFrGIGD1yU1rfkl5chpw9MfNu5lN14cKOyGDzo7QzpQvXY9c",
        "expiration"    : "1h", //1h, 30m
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
		port 		: '5432',
		logging 	: false,

		/* Public SCMT */
		host 		: '180.250.19.79',
		database 	: 'scmt',
		schema		: 'dev',	//postgres only
		username 	: 'postgres',
		password 	: 'sigma123',

		/* Local SCMT */
		// host 		: '127.0.0.1',
		// database 	: 'scmt',
		// schema		: 'dev',	//postgres only
		// username 	: 'postgres',
		// password 	: 'postgres',
	}
};
