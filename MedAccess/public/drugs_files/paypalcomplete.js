

var _paypalCompleteJS = function() {

	this.state = {};
	this.hostedFields = null;

	var self = this;
	var utils = new PaymentUtils();
	var wrapper = $$('.paypalcomplete-payment-wrapper')[0];
	var currency = utils.getCurrency() || wrapper.getAttribute('data-currency');

	this.initialization = function() {
		this.paypalUtils.getDataFields.call(this);
		this.paymentMethodsEventHandlers();
		// Observe click event for payment products to clear error.
		utils.productClickObserver();
		// Observe change event for payment products.
		utils.observeProducts(function(product) {
			if (utils.hasProductsSet()){
				if ($$('[render-paypal-type="paypal-smart-buttons"]')[0]) {
					$$('.form-submit-button').forEach(function(button) {
						button.hidden = true;
						button.style.display = 'none';
					});
				}
			} else {
				$$('.form-submit-button').forEach(function(button) {
					button.hidden = false;
					button.style.display = 'block';
				});
			}
		});

		utils.observePaymentMethods(function() {
			var paypalDummy = self.paypalUtils.getElements('validateElement')[0];
			JotForm.corrected(paypalDummy);
		});

		// This is a temporary solution. I will update in jotform.js after being sure it works properly in everywhere.
		Event.observe(window, 'load', function() {
			if (utils.paymentType() === 'donation') {
				var donationField = utils.getDonationField();
				if (donationField) {
					JotForm.paymentTotal = donationField.value || 0;
				}
			} else if (Object.keys(JotForm.prices).length >= 1) {
				JotForm.countTotal(JotForm.prices);
			}

			self.payLaterFuncs.changeMessageAmount();
		});

		this.createToken(function(token) {
			var script = this.loadScript(token);
			console.info("-> Script loading...");

			script.onload = function() {
				this.paypalButtonsFuncs.render.call(this);
				this.hostedFieldsFuncs.render.call(this);
				this.payLaterFuncs.changeMessageAmount.call(this);

				this.observeSubmit();
				console.info('-> Script loaded');
			}.bind(this);

			script.onerror = function() {
				var errorMessage = 'PayPal Script couldn\'t load as expected, please reload your page';
				if (!self.state.merchantId) {
					errorMessage = 'There is an error in PayPal connection. Please contact the form owner.';
				}
				self.paypalUtils.showError(errorMessage, false);
			}
		}.bind(this));
	};

	this.createToken = function(callback) {
		JotForm._xdr(
			JotForm.getAPIEndpoint() + '/payment/paypal/createToken', 'post',
			JotForm.serialize({
				environment: self.state.sandboxMode === 'enabled' ? 'sandbox' : 'production',
				gateway: 'paypalcomplete'
			}),
			function(response) {
				var token = response.content.client_token;
				callback(token);
			},
			function (error) {
				self.paypalUtils.showError('PayPal Script not reloaded, please reload your page', false);
				console.error("Error occurred", error);
			}
		);
	};

	this.loadScript = function(token) {
		var script = document.createElement('script'), baseUrl = "https://www.paypal.com/sdk/js?";

		var url = baseUrl + 'client-id=' + this.state.clientID + '&merchant-id=' + this.state.merchantId + '&currency=' + currency + '&commit=true';

		// If need in future, use below code.
		// if (utils.paymentType() === 'subscription') {
		// 	url += '&vault=true';
		// }

		if (self.state.renderSPB === 'true' && self.state.renderCardFields !== 'true') {
			if (self.state.renderPayLater) {
				url += '&components=buttons,messages&disable-funding=card';
			} else {
				url += '&components=buttons&disable-funding=card';
			}
		} else if (self.state.renderSPB === 'false' && self.state.renderCardFields === 'true') {
			url += '&components=hosted-fields';
		} else if (self.state.renderSPB === 'true' && self.state.renderCardFields === 'true') {
			// Note for Developers: Don't add disable-funding=card in this condition. Its prevented to load hosted-fields.
			if (self.state.renderPayLater) {
				url += '&components=buttons,messages,hosted-fields';
			} else {
				url += '&components=buttons,hosted-fields';
			}
		}

		if (self.state.isAuthOnly === 'Yes') {
			url += '&intent=authorize';
		}

 		// url += '&buyer-country=US'

		script.src = url;
		script.setAttribute('data-partner-attribution-id', 'JotForm_P4P');
		script.setAttribute('data-client-token', token);
		script.setAttribute('data-enable-3ds', '');
		// script.setAttribute('data-namespace', "paypalSDK");

		document.body.appendChild(script);

		return script;
	};

	this.generateOrder = function() {
		return new Promise(function(resolve, reject) {
			var data = this.paypalUtils.getOrdersData.call(this);

			JotForm._xdr(
				JotForm.getAPIEndpoint() + '/payment/paypal/createOrder', 'post',
				JotForm.serialize({
					environment: this.state.sandboxMode === 'enabled' ? 'sandbox' : 'production',
					gateway: 'paypalcomplete',
					formId: utils.getForm().id,
					paymentMethod: this.state.paymentMethod === 'paypalSPB' ? 'PayPal Buttons' : 'Card Fields',
					data: JSON.stringify(data)
				}),
				function(response) {
					this.orderID = response.content.id;
					resolve(response.content.id);
				}.bind(this),
				function (error) {
					console.error("Error occurred", error);
					this.paypalUtils.showError(error, true);
					reject({ success: false, message: error });
				}.bind(this)
			);
		}.bind(this));
	};

	this.createSubscription = function() {
		return new Promise(function(resolve, reject) {
			var subscriptionData = this.paypalUtils.getSubscriptionProductData();
			console.log("..", subscriptionData);

			JotForm._xdr(
				JotForm.getAPIEndpoint() + '/payment/paypal/createSubscription', 'post',
				JotForm.serialize({
					environment: this.state.sandboxMode === 'enabled' ? 'sandbox' : 'live',
					gateway: 'paypalcomplete',
					data: JSON.stringify(subscriptionData)
				}),
				function(response) {
					console.log('RESPONSE:', response);
					// this.orderID = response.content.id;
					// resolve(response.content.id);
				}.bind(this),
				function (error) {
					console.error("Error occurred", error);
					this.paypalUtils.showError(error, true);
					reject({ success: false, message: error });
				}.bind(this)
			);
		}.bind(this));
	},

	this.paymentMethodsEventHandlers = function() {
		var toggleClickHandler = function(event) {
			$$('.paypal-toggle-content')[0].setAttribute('render-paypal-type', event.target.getAttribute('data-id'));
			var conditionalValidations = ['cc_firstName', 'cc_lastName'];
			var isPaymentFieldRequired = window.FORM_MODE == 'cardform' ?
				utils.getPaymentField().select('.jfRequiredStar').length > 0 :
				utils.getPaymentField().classList.contains('jf-required');

			if (event.target.id === 'paypal-smart-buttons-input' && utils.hasProductsSet()) {
				$$('.form-submit-button').forEach(function(button) {
					try {
						var paymentElement = utils.getPaymentElements("1");
						if(isPaymentFieldRequired) {
							paymentElement && Object.entries(paymentElement).forEach(function(element) {
								if (conditionalValidations.indexOf(element[0]) > -1) {
									if(element[1] && element[1].classList.contains('validate[required]')) {
											element[1].classList.remove('validate[required]');
									}
								}
							});
						}
					} catch (e) {
						console.log('Conditional PayPal Complete Validations');
						console.log(e);
					}

					button.hidden = true;
					button.style.display = 'none';
				});
			} else {
				$$('.form-submit-button').forEach(function(button) {
					try {
						var paymentElement = utils.getPaymentElements("1");
						if(isPaymentFieldRequired) {
							paymentElement && Object.entries(paymentElement).forEach(function(element) {
								if (conditionalValidations.indexOf(element[0]) > -1) {
									if(element[1] && !element[1].classList.contains('validate[required]')) {
											element[1].classList.add('validate[required]');
									}
								}
							});
						}
					} catch (e) {
						console.log('Conditional PayPal Complete Validations');
						console.log(e);
					}

					button.hidden = false;
					button.style.display = 'inline-block';
				});
			}

			var payLaterMessageArea = $$('.paypal-toggle-content .paypal-paylater-messages')[0];

			if (event.target.id === 'paypal-smart-buttons-input'){
				if (payLaterMessageArea) { payLaterMessageArea.style.display = 'block'; }
			} else {
				if (payLaterMessageArea) { payLaterMessageArea.style.display = 'none'; }
			}
		}

		$$('.paypal-toggle-buttons input').forEach(function(dom) {
			dom.addEventListener('change', toggleClickHandler);
		});

		window.onload = function() {
			if (self.state.renderSPB === 'true' && self.state.renderCardFields === 'true') {
				// We don't need anything to that here.
			} else if (self.state.renderSPB === 'true' && self.state.renderCardFields === 'false') {
				$$('.paypal-toggle-content')[0].setAttribute('render-paypal-type', 'paypal-smart-buttons');
				$$('.paypal-toggle-buttons')[0].style.display = 'none';
			} else if (self.state.renderSPB === 'false' && self.state.renderCardFields === 'true') {
				$$('.paypal-toggle-content')[0].setAttribute('render-paypal-type', 'paypal-card-fields');
				$$('.paypal-toggle-buttons')[0].style.display = 'none';
			}
		}
	}

	this.observeSubmit = function() {
		if (this.state.paymentMethod !== "paypalSPB") {
			var paymentElements = this.paypalUtils.getElements('JotElements');
			utils.observeFormSubmitAction(
				paymentElements,
				this.paypalUtils.hasCreditCardSet.bind(this),
				this.paypalUtils.getElements('validateElement')[0],
				function(answer) {
					if (!answer) { return; }
					self.state.paymentMethod = 'card-fields';

					self.generateOrder().then(function(orderID) {
						var postData = { contingencies: ['3D_SECURE'] };
						var jotElements = this.paypalUtils.getElements('JotElements');
		
						postData.cardholderName = jotElements[0].value + " " + jotElements[1].value;
						if (wrapper.getAttribute('data-billing-address') && this.paypalUtils.checkBillingAddress(true)) {
							postData.billingAddress = {
								streetAddress: this.billingFields.billing_address.address_line_1,
								extendedAddress: this.billingFields.billing_address.address_line_2,
								region: this.billingFields.billing_address.admin_area_1,
								locality: this.billingFields.billing_address.admin_area_2,
								postalCode: this.billingFields.billing_address.postal_code,
								countryCodeAlpha2: this.billingFields.billing_address.country_code,
							};
						}

						if (orderID) {
							this.hostedFields.submit(postData).then(function(payload) {
								console.log("Payload:", payload);
		
								var authFails = ['SKIPPED_BY_BUYER', 'FAILURE', 'ERROR'];
								if (authFails.indexOf(payload.authenticationReason) > -1) {
									JotForm.saveLogToPaymentEvents('PAYPALCOMMERCESCA', '3DS_FAILED', JSON.stringify(payload));
									self.paypalUtils.showError('3D Authentication hasn\'t confirmed.', true);
									return;
								}
		
								if ( payload.liabilityShifted === undefined || payload.liabilityShifted ||(
										payload.authenticationStatus === 'NO' &&
										['BYPASSED, ATTEMPTED, UNAVAILABLE, CARD_INELIGIBLE'].indexOf(payload.authenticationReason) > -1 )
								) {
									JotForm.saveLogToPaymentEvents('PAYPALCOMMERCESCA', '3DS_SUCCESS', JSON.stringify(payload));
									self.resubmitForm(payload.orderId);
								}
							}).catch(function(error) {
								self.paypalUtils.showError('Please check your credit card information and try again.', true);
								return;
							});
						}
					}.bind(self));
				}
			);
		}
	};

	this.resubmitForm = function(orderID) {
		var form = utils.getForm();
		utils.addElementToForm({ element: 'input', type: 'hidden', name: 'orderID', value: orderID });
		utils.addElementToForm({ // This one is for saving to DB
			element: 'input',
			type: 'hidden',
			name: 'payment-method',
			value: self.state.paymentMethod === 'card-fields' ? 'Card Fields' : 'PayPal Buttons'
		});
		
		var paymentMethodInput = $$('input[data-component="payment_method"]')[0];
		if (paymentMethodInput) {
			paymentMethodInput.value = 'Paid by ' + (self.state.paymentMethod === 'card-fields' ? 'Card Fields' : 'PayPal Buttons')
		}
		form.submit();
	}

	this.hostedFieldsFuncs = {
		getOrder: function() {
			return new Promise(function(resolve, reject) {
				self.state.paymentMethod = 'card-fields';
				resolve(this.orderID);
			}.bind(this));
		},

		getFieldStyles: function() {
			var fieldStyles = {
				'input': {
					'font-size': window.FORM_MODE == 'cardform' ? '18px' : '14px',
					'font-family': window.FORM_MODE == 'cardform' ? 'Roboto' : 'system-ui',
					'color': 'black'
				}
			};

			return fieldStyles;
		},

		render: function() {
			// Note for CreateOrder function: If we directly pass the promise function and if API returns error, the card fields will be stucked.
			var hfFuncs = this.hostedFieldsFuncs;
			if (!window.paypal.HostedFields) return;

			window.paypal.HostedFields.render({
				createOrder: hfFuncs.getOrder.bind(this),
				styles: hfFuncs.getFieldStyles(),
				fields: {
					number: {
							selector: '.cc_numberMount',
							placeholder: '**** **** **** ****',
					},
					cvv: {
							selector: '.cc_ccvMount',
							placeholder: 'CVV',
					},
					expirationDate: {
							selector: '.cc_cardExpiryMount',
							placeholder: 'MM/YY',
					}
				}
			}).then(function(hostedFields) {
				console.log("Hosted:", hostedFields);
				self.hostedFields = hostedFields;
			});
		}
	};

	this.paypalButtonsFuncs = {
		createSPBOrder: function(data, actions) {	
			self.state.paymentMethod = 'paypalSPB';
			utils.submitButtonHandler('setOldText');
			var createOrder = self.generateOrder.bind(this);
			var paymentElements = this.paypalUtils.getElements('JotElements');

			return new Promise(function(resolve, reject) {
				var isPaymentReady = utils.checkPaymentValidation(self.paypalUtils.hasCreditCardSet.bind(this));

				// Remove Hidden Validations on paypal checkout
				if(isPaymentReady) {
					var paypalToggleButtons = $$('.paypal-toggle-buttons') && $$('.paypal-toggle-buttons')[0];
					var isOnlySmartPaymentFieldDisplayed =
						$$('#paypal-commerce-platform-container [render-paypal-type="paypal-smart-buttons"]') &&
						$$('#paypal-commerce-platform-container [render-paypal-type="paypal-smart-buttons"]')[0]
							.classList.contains('single-payment-method')
					var isToggleRendered = paypalToggleButtons && paypalToggleButtons.getAttribute('hidden') !== null;

					if(isToggleRendered && isOnlySmartPaymentFieldDisplayed) {
						if($$('.cc_firstName').length > -1) $$('.cc_firstName')[0].classList.remove('validate[required]');
						if($$('.cc_lastName').length > -1) $$('.cc_lastName')[0].classList.remove('validate[required]');
					}
				}

				if (!isPaymentReady) {
					self.paypalUtils.showError('Please select a product to purchase.');
					reject('Please select a product to purchase.');
					return;
				}

				var isValidated = utils.checkFormValidation(paymentElements, self.paypalUtils.hasCreditCardSet.bind(this));
				if (!isValidated) {
					reject('Error Occurred on the Form');
					return;
				}

				createOrder().then(function(orderID) {
					resolve(orderID);
				}).catch(function(err) {
					self.paypalUtils.showError(err);
					reject(err);
				});
			});
		},

		approvePayment: function(authData, actions) {
			return actions.order.get().then(function(data) {
				console.log("DATA:", data);

				var firstName = $$('.cc_firstName')[0];
				var lastName = $$('.cc_lastName')[0];
				
				if (firstName) firstName.value =  data.payer.name.given_name;
				if (lastName) lastName.value =  data.payer.name.surname;

				if ((data.intent === "CAPTURE" && data.status === 'APPROVED')) { // && data.status === "APPROVED"
					var paypalDummy = this.paypalUtils.getElements('validateElement')[0];
					utils.correctErrors([paypalDummy]);

					this.orderID = data.id;
					utils.enableRequiredField();
					this.resubmitForm(this.orderID);
				} else if (data.intent === 'AUTHORIZE' && data.status === 'APPROVED') {
					var paypalDummy = this.paypalUtils.getElements('validateElement')[0];
					utils.correctErrors([paypalDummy]);
					this.orderID = data.id;
					this.resubmitForm(this.orderID);
				}
			}.bind(this));
		},

		cancelPayment: function(data) {
			console.log("OnCancel:::", data);
		},

		errorHandler: function() {
			return function (err) {
				var error = String(err);
				console.log("ERROR on PSB: ", error);
				try {
					var parsedError = JSON.parse(error.match(/{[^]*}/)[0]);
					this.paypalUtils.showError(parsedError.error_description || parsedError.details[0].issue ||  'Payment error occurred. Please check console.');
				} catch (catcherr){
					this.paypalUtils.showError(catcherr ? catcherr : 'Payment error occurred. Please check console.');
				}
			}
		},

		render: function() {
			if (!window.paypal.Buttons) return false;

			var buttonSettings = {
				onApprove: this.paypalButtonsFuncs.approvePayment.bind(this),
				onCancel: this.paypalButtonsFuncs.cancelPayment.bind(this),
				onError: this.paypalButtonsFuncs.errorHandler.bind(this),
				style: {
					color: 'gold',
					label: 'checkout',
					layout: 'vertical',
					shape: 'rect',
					height: 45
				},
			}

			var styleSizes = { small: 30, medium: 48, large: 55, responsive: 48 };

			if (JotForm.paymentProperties) {
				buttonSettings.style.color = JotForm.paymentProperties.styleColor;
				buttonSettings.style.label = JotForm.paymentProperties.styleLabel;
				buttonSettings.style.layout = JotForm.paymentProperties.styleLayout;
				buttonSettings.style.shape = JotForm.paymentProperties.styleShape;
				buttonSettings.style.height = styleSizes[JotForm.paymentProperties.styleSize] || 48;
			}

			if (utils.paymentType() === 'subscription') {
				buttonSettings.createSubscription = this.createSubscription.bind(this);
			} else {
				buttonSettings.createOrder = this.paypalButtonsFuncs.createSPBOrder.bind(this);
			}

			window.paypal.Buttons(buttonSettings).render('#paypal-button-container');
		},
	};

	this.payLaterFuncs = {
		changeMessageAmount: function() {
			var paypalMessageArea = document.querySelector('.paypal-paylater-messages .message-area');

			if (paypalMessageArea) {
				paypalMessageArea.setAttribute('data-pp-amount', utils.getPrice('total'));
			}
		},
		render: function() {
			// If we need to analyze the PayPal messages, use this function.

			paypal.Messages({
				amount: utils.getPrice('total'),
				onRender: () => {
          console.log("Callback called on render");
          // such as send a "render event" to your own analytics platform.
        },
        onClick: () => {
          console.log("Callback called on click");
          // such as send a "click event" to your own analytics platform.
        },
        onApply: () => {
          console.log("Callback called on apply");
          // such as send an "apply event" to your own analytics platform.
        },
      }).render(".message-area");
		}
	};

	this.paypalUtils = {
		getDataFields: function() {
			this.state = {
				merchantId: wrapper ? wrapper.getAttribute('data-merchantid') : false,
				sandboxMode: wrapper ? wrapper.getAttribute('data-sandbox') : false,
				isAuthOnly: wrapper ? wrapper.getAttribute('data-auth-only') : false,
				renderSPB: wrapper ? wrapper.getAttribute('data-show-spb') : false,
				renderCardFields: wrapper ? wrapper.getAttribute('data-show-card-fields') : false,
				renderPayLater: JotForm.paymentProperties && JotForm.paymentProperties.payLaterEnabled === 'Yes' && utils.paymentType() === 'product'
			}

			// Don't fear. These keys are public
			if (this.state.sandboxMode === 'enabled') {
				this.state.clientID = "AbO4nZJsmfTgf8GbpnV-AY4382evohAYeDcuwqoAvvrKDDN_qOYa3K5biPFub70U40iPcpl0wtwkkMp2";
			} else {
				this.state.clientID = "Afo1LVZtoaCSq5HI_naZpUMjB2C0_OiB6nNHlGaNe7jwBTunPXnbodmCr4ZTtpL3WT-4RkNG6DQFvX03";
			}
		},

		getProductsDetailed: function() {
			if (!JotForm.pricingInformations) return null

			var items = [];

			if (JotForm.pricingInformations.items && JotForm.pricingInformations.items.length >= 1) {
				JotForm.pricingInformations.items.forEach(function(item) {
					var properties = {};

					Object.keys(item).forEach(function(property){
						if (property == "tax" && item['tax'] === 0) {
							// properties[property] = 0;
						} else if (property === "name") {
							properties[property]  = (typeof item[property] === 'undefined' || (typeof item[property] !== 'undefined' && item[property] === '')) ?
								'Product' : item[property].substr(0, 124);
						} else if (property == "unit_amount") {
							properties[property] = {
								value: item[property],
								currency_code: currency
							}
						} else {
							properties[property] = item[property];
						}
					});

					items.push(properties);
				});
			}

			return items;
		},

		getElements: function(type) {
			if (type === "validateElement") {
				return [$('paypal_complete_dummy')];
			} else if (type === "JotElements") {
				return [
					$$('.cc_firstName')[0],
					$$('.cc_lastName')[0],
					$('paypal_complete_dummy')
				];
			} else if (type === "paypalElements") {
				return [
					$$('.cc_numberMount')[0],
					$$('.cc_ccvMount')[0],
					$$('.cc_cardExpiryMount')[0]
				]
			} else if (type === "all") {
				return [
					$$('.cc_firstName')[0],
					$$('.cc_lastName')[0],
					$('paypal_complete_dummy'),
					$$('.cc_numberMount')[0],
					$$('.cc_ccvMount')[0],
					$$('.cc_cardExpiryMount')[0]
				]
			}
		},

		hasCreditCardSet: function() {
			if (self.state.paymentMethod === 'paypalSPB') {
				return true;
			}

			var tempErrors = [ JotForm.texts.ccInvalidNumber, JotForm.texts.ccInvalidCVC, JotForm.texts.ccInvalidExpireDate ];
			var tempFields = [ "number", "cvv", "expirationDate" ];
			var fields = self.hostedFields._state.fields;

			var errors = [];

			tempFields.forEach(function(field, index) {
				if (fields[field].isValid === false) {
					errors.push(tempErrors[index]);
				}
			});

			return errors.length > 0 ? false : true;
		},

		getAskBillingFields: function() {
			var email_field = wrapper.getAttribute('data-email-field');
			var billing_address = wrapper.getAttribute('data-billing-address');

			var billingFields = {
				email_field: email_field && utils.getBillingFieldsValue('email', email_field, "string"),
				billing_address: billing_address && utils.getBillingFieldsValue('address', billing_address, "string")
			};

			this.paypalUtils.mapBillingFields(billingFields);
		},

		mapBillingFields: function(billingFields) {
			if (billingFields.billing_address) {
				billingFields.billing_address = {
					address_line_1: billingFields.billing_address.line1,
					address_line_2: billingFields.billing_address.line2,
					admin_area_1: billingFields.billing_address.state,
					admin_area_2: billingFields.billing_address.city,
					postal_code: billingFields.billing_address.postal_code,
					country_code: billingFields.billing_address.address_country,
				}
			}
			self.billingFields = billingFields;
		},

		checkBillingAddress: function(checkOnlyCardFields) {
			if (checkOnlyCardFields && self.billingFields.billing_address.country_code) {
				return true;
			}

			if (
				self.billingFields.billing_address.address_line_1 &&
				self.billingFields.billing_address.country_code
			) {
				return true;
			}

			return false;
		},

		getOrdersData: function() {
			this.paypalUtils.getAskBillingFields.call(this);

			var originLocation =  window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
			var jotElements = this.paypalUtils.getElements('JotElements');
			var data = {
				intent: self.state.isAuthOnly === 'Yes' ? 'AUTHORIZE' : 'CAPTURE',
				purchase_units: [
					{
						amount: {
							currency_code: currency,
							value: utils.getPrice('total'),
							breakdown: {
								item_total: {
									value: utils.getPrice('item_total'),
									currency_code: currency,
								},
								tax_total: {
									value: utils.getPrice('tax_total'),
									currency_code: currency,
								},
								shipping: {
									value: utils.getPrice('shipping'),
									currency_code: currency,
								},
								discount: {
									value: utils.getPrice('discount'),
									currency_code: currency
								}
							}
						},
						payee: {
							merchant_id: this.state.merchantId
						},
						description: "Payment form: " + (originLocation + window.location.pathname).substring(0, 126), // The paypal limitted with 127 character.
						items: this.paypalUtils.getProductsDetailed()
					}
				],
			};

			if (self.state.paymentMethod !== 'paypalSPB'){
				data.payer = {
					name: {
						given_name: jotElements[0].value,
						surname: jotElements[1].value
					}
				};

				if (wrapper.getAttribute('data-billing-address') && self.paypalUtils.checkBillingAddress(false)) {
					data.payer.address = self.billingFields.billing_address;
				}
			}

			return data;
		},

		getSubscriptionProductData: function() {
			var data = {};
			if (JotForm.pricingInformations.items && JotForm.pricingInformations.items.length === 1) {
				data = {
					name: JotForm.pricingInformations.items[0].name,
					description: JotForm.pricingInformations.items[0].productDescription,
					type: 'SERVICE'
					// imageUrl: '',
				}
			}

			return data;
		},

		getSubscriptionPlanData: function() {
			var data = {};

			data = {
				product_id: '',
				name: '',
				description: '',
				status: 'ACTIVE',
				billing_cycles: [
					{
						frequency: {
							interval_unit: "MONTH",
							interval_count: 1
						},
						tenure_type: "REGULAR",
						sequence: 1,
						total_cycles: 0,
						pricing_scheme: {
							fixed_price: {
								value: "100",
								currency_code: "USD"
							}
						}
					}
				],
				payment_preferences: {
					auto_bill_outstanding: true,
					setup_fee: {
						value: "10",
						currency_code: "USD"
					},
					setup_fee_failure_action: "CONTINUE",
					payment_failure_threshold: 3
				},
				taxes: {
					percentage: "10",
					inclusive: false
				}
			}
		},

		getSubscriptionData: function() {
			var data = {};

			data = {
				plan_id: "P-5ML4271244454362WXNWU5NQ",
				start_time: "2018-11-01T00:00:00Z",
				quantity: "20", // The quantity of the product in the subscription.
				shipping_amount: {
					"currency_code": "USD",
					"value": "10.00"
				},
				subscriber: {
					name: {
						given_name: "John",
						surname: "Doe"
					},
					email_address: "customer@example.com",
					shipping_address: {
						name: {
							full_name: "John Doe"
						},
						address: {
							address_line_1: "2211 N First Street",
							address_line_2: "Building 17",
							admin_area_2: "San Jose",
							admin_area_1: "CA",
							postal_code: "95131",
							country_code: "US"
						}
					}
				},
				application_context: {
					brand_name: "walmart",
					locale: "en-US",
					shipping_preference: "SET_PROVIDED_ADDRESS",
					user_action: "SUBSCRIBE_NOW",
					payment_method: {
						payer_selected: "PAYPAL",
						payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
					},
					return_url: "https://example.com/returnUrl",
					cancel_url: "https://example.com/cancelUrl"
				}
			}
		},

		submitAndPay: function(){
			$$('.form-submit-button').each(function (button) {
				button.innerText = 'Submit and Pay';
			});
		},

		showError: function(message, restoreButton) {
			var input = this.getElements('validateElement')[0];
			JotForm.errored(input, message);

			if (restoreButton) {
				utils.submitButtonHandler('restore');
			}
		},
	};
};