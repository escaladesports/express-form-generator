'use strict'
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = $ => {
	_.extend($.prototype, {
		wrapAll: function(wrapper){
			if(this.length < 1){
				return this
			}

			if(this.length < 2 && this.wrap){
				return this.wrap(wrapper)
			}

			var elems = this
			var section = $(wrapper)
			var marker = $('<div>')
			marker = marker.insertBefore(elems.first())
			elems.each(function(k, v){
				section.append($(v))
			})
			section.insertBefore(marker)
			marker.remove()
			return section
		}
	})
}
