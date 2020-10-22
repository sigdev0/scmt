process.env.NTBA_FIX_319 = 1;
module.exports.Telegram = new class LazyTelegram {
	#TelegramBot 	= require('node-telegram-bot-api');
	#enabled 		= false;
	#token 			= '';
	#bot 			= null;

	constructor(){
		this.#enabled 	= config('telegram.enabled');
		this.#token 	= config('telegram.token');

		if(config('telegram.source') === 'database'){
			this.#enabled 	= db('config').where('name', 'telegram_enabled').first();
			this.#token 	= db('config').where('name', config('telegram.token_field')).first();

			if(this.#enabled) 	this.#enabled = this.#enabled.props('value') === 'true';
			if(this.#token) 	this.#token = this.#token.props('value');
		}

		if(this.#enabled) this.#bot = new this.#TelegramBot(this.#token, {polling: true})
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
			this.#bot.sendMessage(recipientId, message);
		} else {
			console.log(`Telegram BOT is disabled, please enable it and make sure no other instance of Telegram BOT with same token is running`);
		}
	}
}
