(function() {
	try {
		var variables = {
			screens : {
				preload : '#preload',
				preload_error : '#preload_error',
				form : '#form',
				success : '#success'
			},
			forms : {
				submit_form : '#submit_form'
			},
			default_values : {
				email : null
			},
			form_field : {
				email : '#email'
			},
			form_errors : {
				no_connection : '#no_connection',
				wrong_email : '#wrong_email'
			},
			buttons : {
				preload_error_resend : '#preload_error_resend',
				form_button : '#form_button',
				success_close : '#success_close'
			},
			currentScreen : '#preload'
		}

		var methods = {
			init : function () {

				methods.preload();
				methods.setHandlers();

			},
			preload : function () {

				// setTimeout(function() {

					var response = http.send(JSON.stringify({
					    method : "POST",
					    path : "remote/cto-get-email",
					    body : {}
					}));

					if (!response) {
						methods.changeToView(variables.screens.preload_error);
					} else {
						// logger.log("POST remote/cto-get-email response " + response);
						var jsonObject = JSON.parse(response);

						// jsonObject = {
						// 	body : {
						// 		email : 'priwlo@yra.ru',
						// 		result : 0
						// 	}
						// };

						if (jsonObject.body.email || jsonObject.body.result == 59) {
							variables.default_values.email = jsonObject.body.email;
							variables.default_values.email = variables.default_values.email || storage.get('vnc_help_email');

							methods.changeToView(variables.screens.form, function() {
								$(variables.form_field.email).val(variables.default_values.email);
							});

						} else if (jsonObject.body.result) {
							methods.changeToView(variables.screens.preload_error);
						}
					}


				// }, 500);
			},
			changeToView : function (view, cb) {
				setTimeout(function() {
					if (variables.currentScreen) {
						$(variables.currentScreen).removeClass('show');
					}
					variables.currentScreen = view;
					$(view).addClass('show');

					cb && cb();
				}, 500);
			},
			sendForm : function() {
				var formValue = $(variables.forms.submit_form).serializeArray()
				console.log(formValue);

				var email = formValue[0].value;

				console.log(email);

				if (!email || !email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/gi)) {

					initError('wrong_email');

				} else {

					$(variables.buttons.form_button).attr('disabled', true);

					// setTimeout(function () {

					var response = http.send(JSON.stringify({
					    method : "POST",
					    path : "remote/cto-help",
					    body: {
					    	email : email
					    }
					}));

					setTimeout(function() {
						$(variables.buttons.form_button).removeAttr('disabled');
					}, 500);

						// response = {
						// 	result : 59
						// }
						// jsonObject = { body : response };

						if (!response) {

							initError('no_connection');

						} else {

							var jsonObject = JSON.parse(response);
							//log.log("POST remote/cto-help response " + jsonObject);

							if (!jsonObject.body.result) {
								storage.set('vnc_help_email', email);
								methods.changeToView(variables.screens.success, function () {

									setTimeout(function() {
										navigation.pushNext();
									}, 5000);
								});

							} else {

								initError('no_connection');

							}
						}

					// }, 1500);
				}

				function initError(type) {
					$(variables.form_field.email).addClass('invalid');
					$(variables.form_errors[type]).addClass('show');
					$('form .base-text').removeClass('show');

					setTimeout(function () {
						$(variables.form_field.email).removeClass('invalid');
						$(variables.form_errors[type]).removeClass('show');
						$('form .base-text').addClass('show');

						$(variables.form_field.email).focus();
					}, 2000);
				}
			},
			setHandlers : function() {
				$(document).on('click', variables.buttons.preload_error_resend, function(event) {
					methods.changeToView(variables.screens.preload, function () {
						methods.preload();
					});
				});

				$(document).on('click', variables.buttons.success_close, function(event) {
					navigation.pushNext();
				});

				$(document).on('submit', variables.forms.submit_form, function(event) {
					event.preventDefault();
					methods.sendForm(event);
				});
			}
		}

		methods.init();

	} catch (err) {
		alert(err);
		//navigation.pushNext();
	}
	
})();
