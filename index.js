require('./system/lazify');

GET('show-name', () => {
	res('Your name is : ' + req('name'));
});

serve(false);
