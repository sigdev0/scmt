/* List Users */
GET('users', () => {
	var result = User.instance();
		result.select(
			"id",
			"username",
			"password",
			"fullname",
			"email_address",
			"created_at",
			"updated_at"
		);

	var keyword = req("keyword"),
		limit 	= req("limit"),
		offset 	= req("offset");

	if (!empty(limit)) 		result.limit(limit);
	if (!empty(offset)) 	result.offset(offset);
	if (!empty(keyword))  	result.whereLike("username", keyword).orWhereLike("fullname", keyword);

	res(result.get());
});
