'use strict'
const cheerio = require('./lib/extend-cheerio')
let $ = cheerio.load('<form><div></div><div></div><div></div></form>')

$('form div:nth-of-type(1), form div:nth-of-type(2)').wrapAll('<p></p>')
const html = $.html()
console.log(html)
