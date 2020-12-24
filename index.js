require('./system/lazify');

GET('/', () => {
	redirect('/routes');
});

serve(false);

//test webhook new gitlab
