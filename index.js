require('./system/lazify');

GET('/', () => {
	console.log('test');
	redirect('/routes');
});

serve(false);
