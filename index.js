require('./system/lazify');

GET('show-name', () => {
	res('Your name is : ' + req('name'));
});

GET('test', () => {
	var data = [];
	foreach(AlarmSource.limit(10).get(), (i, each) => {
		data.push(each.props());
	});

	res(data);
	// console.log(query('select * from public.sql_alarm_source limit 10'));
});

serve(false);
