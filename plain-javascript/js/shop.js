(function() {
	function Shop( element ) {
		this.element = document.querySelector( element );
		this.init();
	}
	
	Shop.prototype = {
	  init: function() {
		// Properties
		
			this.cartPrefix = "winery-"; // Prefix string to be prepended to the cart's name in the session storage
			this.cartName = this.cartPrefix + "cart"; // Cart name in the session storage
			this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key in the session storage
			this.total = this.cartPrefix + "total"; // Total key in the session storage
			this.storage = sessionStorage; // shortcut to the sessionStorage object
			
			this.formAddToCart = document.querySelectorAll( "form.add-to-cart" ); // Forms for adding items to the cart
			this.formCart = document.querySelector( "#shopping-cart" ); // Shopping cart form
			this.checkoutCart = document.querySelector( "#checkout-cart" ); // Checkout form cart
			this.checkoutOrderForm = document.querySelector( "#checkout-order-form" ); // Checkout user details form
			this.shipping = document.querySelector( "#sshipping" ); // Element that displays the shipping rates
			this.subTotal = document.querySelector( "#stotal" ); // Element that displays the subtotal charges
			this.shoppingCartActions = document.querySelector( "#shopping-cart-actions" ); // Cart actions links
			this.updateCartBtn = document.querySelector( "#update-cart" ); // Update cart button
			this.emptyCartBtn = document.querySelector( "#empty-cart" ); // Empty cart button
			this.userDetails = document.querySelector( "#user-details-content" ); // Element that displays the user information
			this.paypalForm = document.querySelector( "#paypal-form" ); // PayPal form
			
			this.currency = "&euro;"; // HTML entity of the currency to be displayed in the layout
			this.currencyString = "€"; // Currency symbol as textual string
			this.paypalCurrency = "EUR"; // PayPal's currency code
			this.paypalBusinessEmail = "yourbusiness@email.com"; // Your Business PayPal's account email address
			this.paypalURL = "https://www.sandbox.paypal.com/cgi-bin/webscr"; // The URL of the PayPal's form
			
			// Object containing patterns for form validation
			this.requiredFields = {
				expression: {
					value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}$/
				},
				
				str: {
					value: ""
				}
				
			};
			
			// Method invocation
			
			this.createCart();
			this.handleAddToCartForm();
			this.handleCheckoutOrderForm();
			this.emptyCart();
			this.updateCart();
			this.displayCart();
			this.displayUserDetails();
			this.populatePayPalForm();
		},
		
		// Public methods
		
		// Creates the cart keys in the session storage
		
		createCart: function() {
			if( this.storage.getItem( this.cartName ) == null ) {
			
				var cart = {};
				cart.items = [];
			
				this.storage.setItem( this.cartName, this._toJSONString( cart ) );
				this.storage.setItem( this.shippingRates, "0" );
				this.storage.setItem( this.total, "0" );
			}
		},
		// Appends the required hidden values to the PayPal's form before submitting
		
		populatePayPalForm: function() {
			var self = this;
			if( self.paypalForm !== null ) {
				var form = self.paypalForm;
				var cart = self._toJSONObject( self.storage.getItem( self.cartName ) );
				var shipping = self.storage.getItem( self.shippingRates );
				var numShipping = self._convertString( shipping );
				var cartItems = cart.items; 
				var singShipping = Math.floor( numShipping / cartItems.length );
				var btn = document.querySelector( "#paypal-btn" );
				var wrapper = document.createElement( "div" );
				var html = "";
				wrapper.id = "hidden-fields";
				
				form.insertBefore( wrapper, btn );
				
				
				form.setAttribute( "action", self.paypalURL );
				document.querySelector( "input[name='business']" ).value = self.paypalBusinessEmail;
				document.querySelector( "input[name='currency_code']" ).value = self.paypalCurrency;
				
				
				for( var i = 0; i < cartItems.length; ++i ) {
					var cartItem = cartItems[i];
					var n = i + 1;
					var name = cartItem.product;
					var price = cartItem.price;
					var qty = cartItem.qty;
					
					html += "<input type='hidden' name='quantity_" + n + "' value='" + qty + "'/>";
					html += "<input type='hidden' name='item_name_" + n + "' value='" + name + "'/>";
					html += "<input type='hidden' name='item_number_" + n + "' value='SKU " + name + "'/>";
					html += "<input type='hidden' name='amount_" + n + "' value='" + self._formatNumber( price, 2 ) + "'/>";
					html += "<input type='hidden' name='shipping_" + n + "' value='" + self._formatNumber( singShipping, 2 ) + "'/>";
					
					
				}
				
				document.getElementById( "hidden-fields" ).innerHTML = html;
				
				
				
			}
		},
		// Displays the user's information
		
		displayUserDetails: function() {
			if( this.userDetails !== null ) {
				if( this.storage.getItem( "shipping-name" ) == null ) {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var zip = this.storage.getItem( "billing-zip" );
					var country = this.storage.getItem( "billing-country" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing and Shipping</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + zip + "</li>";
						html += "<li>" + country + "</li>";
						html += "</ul></div>";
						
					this.userDetails.innerHTML = html;
				} else {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var zip = this.storage.getItem( "billing-zip" );
					var country = this.storage.getItem( "billing-country" );
					
					var sName = this.storage.getItem( "shipping-name" );
					var sEmail = this.storage.getItem( "shipping-email" );
					var sCity = this.storage.getItem( "shipping-city" );
					var sAddress = this.storage.getItem( "shipping-address" );
					var sZip = this.storage.getItem( "shipping-zip" );
					var sCountry = this.storage.getItem( "shipping-country" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + zip + "</li>";
						html += "<li>" + country + "</li>";
						html += "</ul></div>";
						
						html += "<div class='detail right'>";
						html += "<h2>Shipping</h2>";
						html += "<ul>";
						html += "<li>" + sName + "</li>";
						html += "<li>" + sEmail + "</li>";
						html += "<li>" + sCity + "</li>";
						html += "<li>" + sAddress + "</li>";
						html += "<li>" + sZip + "</li>";
						html += "<li>" + sCountry + "</li>";
						html += "</ul></div>";
						
					this.userDetails.innerHTML = html;	
				
				}
			}
		},
		// Displays the shopping cart
		
		displayCart: function() {
			if( this.formCart !== null ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var tableCart = document.querySelector( ".shopping-cart" );
				var tableCartBody = tableCart.getElementsByTagName( "tbody" )[0];
				var origHTML = tableCartBody.innerHTML;
				var html = "";
				
				
				for( var i = 0; i < items.length; ++i ) {
					var item = items[i];
					var product = item.product;
					var price = this.currency + " " + item.price;
					var qty = item.qty;
					html += "<tr><td class='pname'>" + product + "</td>" + "<td class='pqty'><input type='text' value='" + qty + "' class='qty'/></td>" + "<td class='pprice'>" + price + "</td></tr>";
					
					
				}
				tableCartBody.innerHTML = origHTML + html;
				
				var total = this.storage.getItem( this.total );
				this.subTotal.innerHTML = this.currency + " " + total;
			} else if( this.checkoutCart !== null ) {
				var checkoutCart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var cartItems = checkoutCart.items;
				var cartBody = this.checkoutCart.getElementsByTagName( "tbody" )[0];
				var oHTML = cartBody.innerHTML;
				var htm = "";
				
				for( var j = 0; j < cartItems.length; ++j ) {
					var cartItem = cartItems[j];
					var cartProduct = cartItem.product;
					var cartPrice = this.currency + " " + cartItem.price;
					var cartQty = cartItem.qty;
					htm += "<tr><td class='pname'>" + cartProduct + "</td>" + "<td class='pqty'>" + cartQty + "</td>" + "<td class='pprice'>" + cartPrice + "</td></tr>";
					
					
				}
				
				cartBody.innerHTML = oHTML + htm;
				
				var cartTotal = this.storage.getItem( this.total );
				var cartShipping = this.storage.getItem( this.shippingRates );
				var subTot = this._convertString( cartTotal ) + this._convertString( cartShipping );
				
				this.subTotal.innerHTML = this.currency + " " + this._convertNumber( subTot );
				this.shipping.innerHTML = this.currency + " " + cartShipping;
			
			}
		},
		// Empties the cart by calling the _emptyCart() method
		// @see $.Shop._emptyCart()
		
		emptyCart: function() {
			var self = this;
			if( self.emptyCartBtn !== null ) {
				self.emptyCartBtn.addEventListener( "click", function() {
					self._emptyCart();
				}, false );
			}
		},
		// Updates the cart
		
		updateCart: function() {
			var self = this;
		  if( self.updateCartBtn !== null ) {
			self.updateCartBtn.addEventListener( "click", function() {
				var rows = document.querySelectorAll( "tbody tr" );
				var cart = self.storage.getItem( self.cartName );
				var shippingRates = self.storage.getItem( self.shippingRates );
				var total = self.storage.getItem( self.total );
				
				var updatedTotal = 0;
				var totalQty = 0;
				var updatedCart = {};
				updatedCart.items = [];
				
				for( var i = 0; i < rows.length; ++i ) {
					var row = rows[i];
					var pname = row.getElementsByClassName( "pname" )[0].firstChild.nodeValue;
					var pqty = self._convertString( row.getElementsByClassName( "qty" )[0].value );
					var pprice = self._convertString( self._extractPrice( row.getElementsByClassName( "pprice" )[0] ) );
					
					var cartObj = {
						product: pname,
						price: pprice,
						qty: pqty
					};
					
					updatedCart.items.push( cartObj );
					
					var subTotal = pqty * pprice;
					updatedTotal += subTotal;
					totalQty += pqty;
				}
				
				self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
				self.storage.setItem( self.shippingRates, self._convertNumber( self._calculateShipping( totalQty ) ) );
				self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
				
			}, false);
		  }
		},
		// Adds items to the shopping cart
		
		handleAddToCartForm: function() {
			var self = this;
			if( self.formAddToCart.length > 0 ) {
			for( var i = 0; i < self.formAddToCart.length; ++i ) {
				var form = self.formAddToCart[i];
				var product = form.parentNode;
				var price = self._convertString( product.getAttribute( "data-price" ) );
				var name =  product.getAttribute( "data-name" );
				self._addToFormCart( form, name, price );
				
			}
			
			}
		},
		// Handles the checkout form by adding a validation routine and saving user's info into the session storage
		
		handleCheckoutOrderForm: function() {
			var self = this;
			if( self.checkoutOrderForm !== null ) {
				var sameAsBilling = document.querySelector( "#same-as-billing" );
				sameAsBilling.addEventListener( "change", function() {
					var check = this;
					if( check.checked ) {
						document.querySelector( "#fieldset-shipping" ).style.display = "none";
						document.querySelector( "#fieldset-shipping" ).className = "hidden";
					} else {
						document.querySelector( "#fieldset-shipping" ).style.display = "block";
						document.querySelector( "#fieldset-shipping" ).className = "visible";
					}
				}, false);
				
				self.checkoutOrderForm.addEventListener( "submit", function( e ) {
					
					var form = this;
					var valid = self._validateForm( form );
					
					if( !valid ) {
						e.preventDefault();
					} else {
						self._saveFormData( form );
					}
				}, false);
			}
		},
		// Private methods
		
		
		// Empties the session storage
		
		_emptyCart: function() {
			this.storage.clear();
		},
		
		/* Format a number by decimal places
		 * @param num Number the number to be formatted
		 * @param places Number the decimal places
		 * @returns n Number the formatted number
		 */
		 
		 
		
		_formatNumber: function( num, places ) {
			var n = num.toFixed( places );
			return n;
		},
		
		/* Extract the numeric portion from a string
		 * @param element Object the element that contains the relevant string
		 * @returns price String the numeric string
		 */
		
		
		_extractPrice: function( element ) {
			var self = this;
			var text = element.firstChild.nodeValue;
			var price = text.replace( self.currencyString, "" ).replace( " ", "" );
			return price;
		},
		/* Converts a numeric string into a number
		 * @param numStr String the numeric string to be converted
		 * @returns num Number the number
		 */
		
		_convertString: function( numStr ) {
			var num;
			if( /^[-+]?[0-9]+\.[0-9]+$/.test( numStr ) ) {
				num = parseFloat( numStr );
			} else if( /^\d+$/.test( numStr ) ) {
				num = parseInt( numStr, 10 );
			} else {
				num = Number( numStr );
			}
			
			if( !isNaN( num ) ) {
				return num;
			} else {
				console.warn( numStr + " cannot be converted into a number" );
				return false;
			}
		},
		
		/* Converts a number to a string
		 * @param n Number the number to be converted
		 * @returns str String the string returned
		 */
		
		_convertNumber: function( n ) {
			var str = n.toString();
			return str;
		},
		
		/* Converts a JSON string to a JavaScript object
		 * @param str String the JSON string
		 * @returns obj Object the JavaScript object
		 */
		
		_toJSONObject: function( str ) {
			var obj = JSON.parse( str );
			return obj;
		},
		
		/* Converts a JavaScript object to a JSON string
		 * @param obj Object the JavaScript object
		 * @returns str String the JSON string
		 */
		
		
		_toJSONString: function( obj ) {
			var str = JSON.stringify( obj );
			return str;
		},
		
		
		/* Add an object to the cart as a JSON string
		 * @param values Object the object to be added to the cart
		 * @returns void
		 */
		
		
		_addToCart: function( values ) {
			var cart = this.storage.getItem( this.cartName );
			
			var cartObject = this._toJSONObject( cart );
			var cartCopy = cartObject;
			var items = cartCopy.items;
			items.push( values );
			
			this.storage.setItem( this.cartName, this._toJSONString( cartCopy ) );
		},
		
		/* Custom shipping rates calculation based on the total quantity of items in the cart
		 * @param qty Number the total quantity of items
		 * @returns shipping Number the shipping rates
		 */
		
		_calculateShipping: function( qty ) {
			var shipping = 0;
			if( qty >= 6 ) {
				shipping = 10;
			}
			if( qty >= 12 && qty <= 30 ) {
				shipping = 20;	
			}
			
			if( qty >= 30 && qty <= 60 ) {
				shipping = 30;	
			}
			
			if( qty > 60 ) {
				shipping = 0;
			}
			
			return shipping;
		
		},
		/* Validates the checkout form
		 * @param form Object the element of the checkout form
		 * @returns valid Boolean true for success, false for failure
		 */
		 
		 
		
		_validateForm: function( form ) {
			var self = this;
			var fields = self.requiredFields;
			var fieldSet = document.querySelectorAll( "fieldset" );
			var valid = true;
			
			self._removeElements( ".message" );
			
		  
			
		  for( var i = 0; i < fieldSet.length; ++i ) {
		  	var field = fieldSet[i];
		  	if( self._isVisible( field ) ) {
		  	var fieldID = field.id;
			var fieldElements = document.querySelector( "#" + fieldID ).querySelectorAll( "input,select" );
			
			for( var j = 0; j < fieldElements.length; ++j ) {
				var input = fieldElements[j];
				var parent = input.parentNode;
				var type = input.getAttribute( "data-type" );
				var msg = input.getAttribute( "data-message" );
				
				if( type == "string" ) {
					if( input.value == fields.str.value ) {
					
					    var message = document.createElement( "span" );
					    message.className = "message";
					    message.innerHTML = msg;
					    
						parent.insertBefore( message, input );
						
						valid = false;
					}
				} else {
					if( !fields.expression.value.test( input.value ) ) {
						
						var message = document.createElement( "span" );
					    message.className = "message";
					    message.innerHTML = msg;
					    
						parent.insertBefore( message, input );
						
						valid = false;
					}
				}
				
			}
			
			}
		  }
			
			return valid;
		
		},
		
		/* Save the data entered by the user in the ckeckout form
		 * @param form Object the element of the checkout form
		 * @returns void
		 */
		
		
		_saveFormData: function( form ) {
			var self = this;
			var fieldSet = form.querySelectorAll( "fieldset" );
			
			for( var i = 0; i < fieldSet.length; ++i ) {
				var field = fieldSet[i];
				if( self._isVisible( field ) ) {
				if( field.id == "fieldset-billing" ) {
					var name = document.querySelector( "#name" ).value;
					var email = document.querySelector( "#email" ).value;
					var city = document.querySelector( "#city" ).value;
					var address = document.querySelector( "#address" ).value;
					var zip = document.querySelector( "#zip" ).value;
					var country = document.querySelector( "#country" ).value;
					
					self.storage.setItem( "billing-name", name );
					self.storage.setItem( "billing-email", email );
					self.storage.setItem( "billing-city", city );
					self.storage.setItem( "billing-address", address );
					self.storage.setItem( "billing-zip", zip );
					self.storage.setItem( "billing-country", country );
				} else {
					var sName = document.querySelector( "#sname" ).value;
					var sEmail = document.querySelector( "#semail" ).value;
					var sCity = document.querySelector( "#scity" ).value;
					var sAddress = document.querySelector( "#saddress" ).value;
					var sZip = document.querySelector( "#szip" ).value;
					var sCountry = document.querySelector( "#scountry" ).value;
					
					self.storage.setItem( "shipping-name", sName );
					self.storage.setItem( "shipping-email", sEmail );
					self.storage.setItem( "shipping-city", sCity );
					self.storage.setItem( "shipping-address", sAddress );
					self.storage.setItem( "shipping-zip", sZip );
					self.storage.setItem( "shipping-country", sCountry );
				
				}
			  }
			}
		},
		
		/* Check whether an element is visible
		 * @param element Object the element to test
		 * @returns Boolean true if visible, false if not
		 */
		 
		_isVisible: function( element ) {
			var display = element.className;
			if( display == "hidden" ) {
				return false;
			} else {
				return true;
			}
		},
		
		/* Removes a given set of elements 
		 * @param elements String the elements to be removed
		 * @returns void
		 */
		 
		_removeElements: function( elements ) {
			var elems = document.querySelectorAll( elements );
			for( var i = 0; i < elems.length; ++i ) {
				var elem = elems[i];
				var parent = elem.parentNode;
				parent.removeChild( elem );
			}
		},
		
		/* Add an action to forms
		 * @param form Object the add to cart form
		 * @param name String the product's name
		 * @param price String the product's price
		 * @returns void
		 */
		 
		_addToFormCart: function( form, name, price ) {
			var self = this;
			form.addEventListener( "submit", function() {
					var qty = self._convertString( form.getElementsByClassName( "qty" )[0].value );
					var subTotal = qty * price;
					var total = self._convertString( self.storage.getItem( self.total ) );
					var sTotal = total + subTotal;
					self.storage.setItem( self.total, sTotal );
					self._addToCart({
						product: name,
						price: price,
						qty: qty
					});
					var shipping = self._convertString( self.storage.getItem( self.shippingRates ) );
					var shippingRates = self._calculateShipping( qty );
					var totalShipping = shipping + shippingRates;
					
					self.storage.setItem( self.shippingRates, totalShipping );
			}, false);
		
		}
	};
	
	document.addEventListener( "DOMContentLoaded", function() {
		var shop = new Shop( "#site" );
	});
	
	window.shop = new Shop( "#site" );

})();