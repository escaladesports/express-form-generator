'use strict'
// TODO test on a standard form

// TODO ability to change recaptcha property
// TODO Readme
// TODO Async modify function
// TODO Client side validation

const forms = require('forms')

// Constructor
const Form = function(form, options){
	// Options
	if(typeof options === 'object'){
		for(let i in options){
			this[i] = options[i]
		}
	}

	// Detect reCAPTCHA credentials
	if(this.recaptcha === true){
		this.recaptcha = {
			key: process.env.RECAPTCHA_KEY,
			secret: process.env.RECAPTCHA_SECRET
		}
	}

	// Routing and rendering
	if(!this.postRoute && this.route) this.postRoute = this.route
	if(!this.postRender && this.render) this.postRender = this.render

	// Create form
	this.form = forms.create(form)
	return this
}
Form.fields = forms.fields
Form.fields.recaptcha = require('./recaptcha')
Form.validators = forms.validators
Form.widgets = forms.widgets



// Constructor defaults and methods
Form.prototype = {
	local: 'form',
	action: '',
	method: 'post',
	submit: 'Submit',
	requiredAttribute: true,
	html5: [
		'date',
		'number'
	],
	formWrapper: true,
	recaptcha: true,
	// Append to form's toHTML()
	toHTML: function(form){
		const $this = this

		const cheerio = require('cheerio')
		let html = form ? form.toHTMLOld() : this.form.toHTML()
		if(this.submit){
			html = `${html}<input type="submit" value="${this.submit}" />`
		}
		if(this.formWrapper){
			html = `<form action="${this.action}" method="${this.method}">${html}</form>`
		}
		const $ = cheerio.load(html)
		if(this.recaptcha){
			const recaptchCont = $('.recaptchaCont')
			if(recaptchCont){
				recaptchCont.append(`<div class="g-recaptcha" data-sitekey="${this.recaptcha.key}"></div>`)
			}
		}

		// Find elements
		function loop(obj, name){
			for(let i in obj){
				const field = obj[i]
				if(field.fields){
					loop(field.fields, field.name)
				}
				else{
					const el = $(name ? `[name="${name}[${field.name}]"]` : `[name="${field.name}"]`)
					if(Array.isArray($this.html5) && $this.html5.indexOf(field.type) !== -1){
						el.attr('type', field.type)
					}
					if($this.requiredAttribute && field.required){
						if(field.attrs){
							field.attrs.required = true
						}
						else{
							field.attrs = { required: true }
						}
						el.attr('required', true)
					}
				}
			}
		}
		loop(this.form.fields)

		if(this.modify){
			this.modify($)
		}
		return $.html()
	},
	// Express routing
	router: function(){
		const express = require('express')
		const router = express.Router()
		if(this.route){
			router.get(this.route, (req, res, next) => {
				res.locals[this.local] = this.toHTML()
				next()
			})
		}
		if(this.render){
			router.get(this.route, (req, res) => {
				res.render(this.render)
			})
		}

		if(this.postRoute){

			router.post(this.postRoute, (req, res, next) => {

				// Get reCAPTCHA variables
				// TODO: loop through form elements to figure out which property name is recaptcha
				if('recaptcha' in req.body){
					req.body.recaptcha = {
						secret: this.recaptcha.secret,
						response: req.body['g-recaptcha-response'],
						remoteip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
					}
				}

				const handler = {}
				createCallback(this, handler, 'success', req, res, next)
				createCallback(this, handler, 'error', req, res, next)
				createCallback(this, handler, 'empty', req, res, next)
				createCallback(this, handler, 'other', req, res, next)
				this.form.handle(req, handler)
			})
		}
		if(this.postRender){
			router.post(this.postRoute, (req, res) => {
				res.render(this.render)
			})
		}
		return router
	}
}

// Creates handler callbacks
function createCallback($this, handler, type, req, res, next){

	handler[type] = form => {
		form.toHTMLOld = form.toHTML
		form.toHTML = $this.toHTML.bind($this, form)
		// If routing form
		if($this.postRender){
			res.locals[$this.local] = form.toHTML()
		}
		// If user submitted function exists
		if($this[type]){
			$this[type](form, req, res, next)
		}
		else{
			next()
		}
	}
}

module.exports = Form
