class Unit extends LazyDB {
    _attr = () => {
        return {
            table: 'units',
            primaryColumn: 'id'
        }
    }
}

module.exports = new Unit()._init();