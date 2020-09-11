require('./system/lazify');

GET('/', () => {
	view('index.twig');
});

serve(false);
