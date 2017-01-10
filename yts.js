var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

var YTS = function(){
	this.baseUrl = "http://yts.ag/api/v2";

	this.getMovies = function(page = 1, year, limit = 20){
		if(isNaN(year)){
			return "${year} is not a number";
		}else{
			return request({
				uri: this.baseUrl + "/list_movies.json",
				qs: {
					page: page,
					year: year || new Date().getFullYear(),
					limit: limit
				},
				json: true
			});
		}
	};
	this.search = function(query){
		return request({
			uri: this.baseUrl + "/list_movies.json",
			qs: {
				query_term: query || ""
			},
			json: true
		});
	}
};

module.exports = {
	yts: new YTS()
}