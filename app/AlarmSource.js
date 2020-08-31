class AlarmSource extends LazyDB {
	_attr = () => {
		return {
			table 			: 'sqm_alarm_source',
			primaryColumn 	: 'node'
		}
	}
}

module.exports = new AlarmSource()._init();
