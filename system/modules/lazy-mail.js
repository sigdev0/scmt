module.exports.Mail = new class LazyMail {

	#nodemailer 	= null;
	#transporter	= null;

	#enabled 		= null;

	constructor(){
		this.#enabled = config('mailer.enabled');

		var source = config('mailer.source');
		if(this.#enabled){
			this.#nodemailer = require('nodemailer');

			if(source === 'config'){
				this.#transporter = this.#nodemailer.createTransport({
					host: config('mailer.host'),
					port: config('mailer.port'),
					auth: {
						user: config('mailer.username'),
						pass: config('mailer.password')
					}
				});
			} else {
				this.#transporter = this.#nodemailer.createTransport({
					host: db('config').where('name', 'mail_host').first().props('value'),
					port: db('config').where('name', 'mail_port').first().props('value'),
					auth: {
						user: db('config').where('name', 'mail_username').first().props('value'),
						pass: db('config').where('name', 'mail_password').first().props('value')
					}
				});
			}
		}
	}

	enabled = () => {
		return this.#enabled;
	}

	send(to, subject, body, from = 'scmt-2020@telkom.co.id'){
		if(this.#enabled){
			var response = null;

			this.#transporter.sendMail({
				from 	: from,
				to 		: to,
				subject	: subject,
				html 	: body
			})
		} else {
			console.log('::WARNING:: Mail configuration is disabled, please set the configuration and enable it first');
		}
	}

}
