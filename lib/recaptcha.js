'use strict'
const forms = require('forms')

// reCAPTCHA field
module.exports = opt => {
	opt = Object.assign({
		widget: forms.widgets.hidden(),
		validators: [],
		cssClasses: {},
		recaptcha: true
	}, opt)
	if(!opt.cssClasses.field) opt.cssClasses.field = []
	opt.cssClasses.field.push('recaptchaCont')
	opt.validators.push(validate)
	return forms.fields.string(opt)
}
function validate(form, field, cb){
	const request = require('request')
	request.post('https://www.google.com/recaptcha/api/siteverify', {
		form: {
			secret: field.value.secret,
			response: field.value.response,
			remoteip: field.value.ip
		}
	}, (err, httpResponse, body) => {
		if(err) console.error(err)
		body = JSON.parse(body)
		// TODO trigger error/other functions
		if(body && body.success == false){
			cb('reCAPTCHA failed. Please try again.')
		}
		else{
			cb()
		}
	})
}
