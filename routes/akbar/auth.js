POST('auth', () => {
	var data = req('username', 'password'),
		rule = {
			'username' 	: ['required', 'exists:users'],
			'password'	: ['required']
		};

	validate(data, rule, () => {
		var user = User.where('username', data['username']).where('password', md5(data['password'])).first();
		if(!user){
			res({'status' : 'error', 'message' : 'Username or password does not match'}, 422);
		} else {
			res(jwt.encode(user.props()));
		}
	});
}, false);
