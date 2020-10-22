require('./system/lazify');

// const 	TelegramBot = require('node-telegram-bot-api'),
// 		token		= `1372864247:AAG0p4jAxDNQ3WWxNs0cuCv-oLujWcRTPUk`,
// 		bot 		= new TelegramBot(token, {polling: true});

// bot.on('message', (message) => {
// 	var telegramCode 	= message.text,
// 		firstName 		= message.from.first_name,
// 		lastName 		= message.from.last_name,
// 		telegramId 		= message.from.id;

// 	if(startsWith(telegramCode, 'act:')){
// 		var otp 			= random(6),
// 			user 			= User.where('telegram_code', split(telegramCode, ':')[1]).first();

// 		if(!user){
// 			bot.sendMessage(telegramId, 'Kode aktifasi tidak terdeteksi');
// 		} else {
// 			user.update({telegram_id : telegramId, telegram_otp : otp});
// 			// User.update({telegram_id, telegramId}, {id : user.props('id')});


// 			bot.sendMessage(telegramId, `Selamat ${firstName} ${lastName}, OTP Telegram anda telah aktif ^^`);
// 			bot.sendMessage(telegramId, `Berikut adalah OTP anda : ` + otp);
// 		}
// 	}		

// })

GET('/', () => {
	redirect('/routes');
});

// POST('auth', () => {
// 	var data = req('username', 'password'),
// 		rule = {
// 			username : ['required', 'exists:users'],
// 			password : ['required']
// 		};
	
// 	validate(data, rule, () => {
// 		var user = User.where('username', data.username).where('password', sha1(data.password)).first();
		
// 		if(!user){
// 			res(['Wrong password'], 422);
// 		} else {
// 			var result = {
// 				username 	: data.username,
// 				token 		: jwt.encode(user.props())
// 			};

// 			var telegram_code = user.id + random(5);
// 			if(!user.telegram_id){
// 				result.telegram_link = `http://t.me/scmt2020_bot`;
// 				result.telegram_code = 'act:' + telegram_code;

// 				User.update({telegram_code : telegram_code, telegram_date : now()}, {id : user.id});
// 			} else {
// 				var otp = random(6);
// 				User.update({telegram_otp : otp}, {id : user.id});

// 				bot.sendMessage(user.telegram_id, `Hai, ${user.username}. Berikut adalah kode OTP kamu: ${otp}`);
// 			}

// 			res(result);
// 		}

// 		// res(user);
// 	});
// });

// POST('check-otp', () => {
// 	var data = req('username', 'otp'),
// 		rule = {
// 			username 	: ['required', 'exists:users'],
// 			otp 		: ['required']
// 		};
	
// 	validate(data, rule, () => {
// 		var user = User.where({username : data.username, telegram_otp : data.otp}).first();

// 		if(user){
// 			res(['OTP Valid']);
// 		} else {
// 			res(['OTP tidak sesuai'], 422);
// 		}
// 	});
// });

serve(false);
