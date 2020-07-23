// const Unit = require("../../app/Unit");

/* Details Unit */
GET('unit/:id', () => {
    var data = param(),
        rules = {
            id: ['required', 'exists:units,id']
        };

    validate(data, rules, () => {
        var unit = Unit.find(data.id);

        if (unit) {
            res(unit);
        } else {
            res('Unit not found', 404);
        }
    })
});

GET('unit', () => {
    var result = Unit.instance();
    result.select(
        "id",
        "description",
        "unit",
        "created_at",
        "updated_at"
    );

    var keyword = req("keyword"),
        limit = req("limit"),
        offset = req("offset");

    if (!empty(limit)) result.limit(limit);
    if (!empty(offset)) result.offset(offset);
    if (!empty(keyword)) result.whereLike("unit", keyword);

    res(result.get());
});

POST('unit/insert', () => {
    var data = req("description", "unit"),
        rules = {
            id: ['required'],
            unit: ['required'],
            description: ['required'],
        };
    validate(data, rules, () => {
        data.id = Unit.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);
        var unit = Unit.insert(data);
        if (unit) {
            res(unit);
        } else {
            res('Internal server error', 500)
        }
    })
});

PUT('unit/update', () => {
    var data = req("id", "description", "unit"),
        rules = {
            id: ["required|exists:units,id"],
            description: ['required'],
            unit: ['required']
        };

    validate(data, rules, () => {
        var unit = Unit.find(data.id);
        unit.description = data.description;
        unit.unit = data.unit;
        unit.updated_at = now(true);

        var success = unit.update();
        if (success) {
            res("Unit successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

DELETE('unit/delete/:id', () => {
    var data = param(),
        rules = {
            id: ['required', 'exists:units,id']
        };

    validate(data, rules, () => {
        var success = Unit.delete({ id: data.id });

        if (success) {
            res("Item Unit succesfully deleted");
        } else {
            res('Item Unit cannot be deleted as it is being used by another record', 500);
        }
    })
});
