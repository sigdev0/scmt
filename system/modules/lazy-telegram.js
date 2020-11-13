process.env.NTBA_FIX_319 = 1;
module.exports.Telegram = new class LazyTelegram {
	#telegramBot 	= null;
	#enabled 		= false;
	#token 			= '';
	#bot 			= null;

	constructor(){
		this.#enabled 	= config('telegram.enabled');

		if(this.#enabled){

			if(config('telegram.source') === 'config'){
				this.#token = config('telegram.token');
			} else {
				this.#token = db('config').where('name', config('telegram.token_field')).first().props('value');
			}

			this.#telegramBot 	= require('node-telegram-bot-api');
			this.#bot 			= new this.#telegramBot(this.#token, {polling: true})
		}
	}

	debug		= () => {
		console.log(`Telegram BOT Enabled : ${this.#enabled}`);
		console.log(`Telegram BOT Token : ${this.#token}`);
	}

	enabled 	= () => {
		return this.#enabled;
	}

	onMessage 	= (callback) => {
		if(this.#enabled) {
			this.#bot.on('message', callback);
		} else {
			console.log(`Telegram BOT is disabled, please enable it and make sure no other instance of Telegram BOT with same token is running`);
		}
	}

	sendMessage	= (recipientId, message) => {
		if(this.#enabled) {
			this.#bot.sendMessage(recipientId, message, {parse_mode : 'markdown'});
		} else {
			console.log(`Telegram BOT is disabled, please enable it and make sure no other instance of Telegram BOT with same token is running`);
		}
	}
}
