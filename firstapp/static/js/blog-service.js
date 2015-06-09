var blogService = (function() {

    var baseURL = "/api";

    // The public API
    return {
        findById: function(id) {
            return $.ajax({
				contentType: 'json',
				url: baseURL + "/blog/" + id
			});
        },
        findByName: function(searchKey) {
            return $.ajax({
				contentType: 'json',
                url: baseURL + "/blogs/"
            });
        }
    };

}());