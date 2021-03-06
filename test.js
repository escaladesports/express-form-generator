'use strict'
var cheerio = require('cheerio');
var _ = require('lodash');

function extendCheerio(){
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

console.log('...')

let $ = cheerio.load("<html><body><div><p><span>This <em>is <i>test</p><span>More <em>test");
extendCheerio($);
$('span').wrapAll('<section>');
var passed = ($.html() === '<html><body><div><p><section><span>This <em>is <i>test</i></em>'+
						'</span><span>More <em>test</em></span></section></p></div></body></html>');
console.log("passed: " + (passed ? "yes" : "no"));
