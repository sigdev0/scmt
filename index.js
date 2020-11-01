require('./system/lazify');

GET('/', () => {
	redirect('/routes');
});

serve(false);
