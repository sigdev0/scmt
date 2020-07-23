/* Details Location Type */
GET('location-type/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:location_types,id']
        };

    validate(data, rules, () => {
        var locationType = LocationType.find(data.id);

        if (locationType) {
            res(locationType);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* List Location Types */
GET('location-types', () => {
    var result = LocationType.instance();
        result.select(
            "id",
            "description",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");
            
    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("description", keyword);

    res(result.get());
});

/* Insert Location Type */
POST('location-type/insert', () => {
    var data    = req().all(),
        rules   = {
            description     : ['required'],
        };

    validate(data, rules, () => {
		data.id 		= LocationType.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);

        var locationType = LocationType.insert(data);
        if (locationType) {
            res(locationType);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Update Location Type */
PUT('location-type/update', () => {
    var data    = req("id", "description"),
        rules   = {
            id              : ['required', 'exists:location_types,id'],
            description     : ['required']
        };

    validate(data, rules, () => {
        var locationType               = LocationType.find(data.id);
            locationType.description   = data.description;
            locationType.updated_at    = now(true);

        var success = locationType.update();
        if (success) {
            res("Location Type successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Delete Location Type */
DELETE('location-type/delete/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:location_types,id']
        };

    validate(data, rules, () => {
        var success = LocationType.delete({ 'id': data.id });

        if (success) {
            res("Location Type successfully deleted");
        } else {
            res('Cannot delete Location Type as it is being used by another records', 500);
        }
    })
});
