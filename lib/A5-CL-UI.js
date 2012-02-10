//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com
(function( a5, undefined ) {
/** @name a5.cl.ui 
 * @namespace UI interface controllers, windows, and views. 
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */
a5.SetNamespace('a5.cl.ui');

a5.SetNamespace('a5.cl.ui.core');

/** @name a5.cl.ui.events 
 * @namespace UI interface events
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */

/** @name a5.cl.ui.form
 * @namespace UI interface form elements
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */ 

/** @name a5.cl.ui.modals
 * @namespace UI interface modal views and controllers
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */ 

/** @name a5.cl.ui.themes
 * @namespace AirFrame CL first party UI themes
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLAddon')
	.Class('UI', function(self, im){
		var themeManager;
		
		self.UI = function(){
			self.superclass(this);
			
			this.configDefaults({
				themeURL:null
			});
			
			themeManager = this.create(a5.cl.ui.core.ThemeManager);
		}
		
		self.Override.initializePlugin = function(){
			var themeURL = self.pluginConfig().themeURL;
			if(themeURL)
				a5.cl.ui.core.ThemeManager.instance().loadTheme(themeURL);
		}
				
})



a5.Package('a5.cl.ui.core')
	.Static('UIUtils', function(UIUtils){
		UIUtils.drawTriangle = function(direction, color, width, height){
			var elem = document.createElement('div');
			elem.style.width = elem.style.height = '0';
			elem.style.borderStyle = 'solid';
			switch(direction){
				case 'up':
					elem.style.borderColor = 'transparent transparent ' + color;
					elem.style.borderWidth = '0 ' + (width / 2) + 'px ' + height + 'px';
					break;
				case 'down':
					elem.style.borderColor = color + ' transparent transparent transparent';
					elem.style.borderWidth = height + 'px ' + (width / 2) + 'px 0';
					break;
				case 'left':
					elem.style.borderColor = 'transparent ' + color + ' transparent transparent';
					elem.style.borderWidth = (height / 2) + 'px ' + width + 'px' + (height / 2) + 'px 0';
					break;
				case 'right':
					elem.style.borderColor = 'transparent transparent transparent ' + color;
					elem.style.borderWidth = (height / 2) + 'px 0 ' + (height / 2) + 'px ' + width + 'px';
					break;
			}
			return elem;
		}
		
		UIUtils.getGlobalPosition = function(elem, context){
			//if views were passed in, get the actual dom elements
			if(elem instanceof a5.cl.CLView)
				elem = elem._cl_viewElement;
			if(context instanceof a5.cl.CLView)
				context = context._cl_viewElement;
			else
				context = a5.cl.instance().application().view();
			
			var obj = elem,
				topVal = 0,
				leftVal = 0;
			do { //climb the DOM
				if(context && obj === context)
					break;
				topVal += obj.offsetTop - obj.scrollTop + obj.clientTop;
				leftVal += obj.offsetLeft - obj.scrollLeft + obj.clientLeft;
			} while (obj = obj.offsetParent);
			topVal -= elem.clientTop;
			leftVal -= elem.clientLeft;
			
			return {top:topVal, left:leftVal};
		}
		
		UIUtils.selectTextRange = function(start, end, field){
			if(field.createTextRange) {
				var newend = end - start,
					selRange = field.createTextRange();
				selRange.collapse(true);
				selRange.moveStart("character", start);
				selRange.moveEnd("character", newend);
				selRange.select();
			} else if( field.setSelectionRange ){
				field.setSelectionRange(start, end);
			}
			field.focus();
		}
});



a5.Package('a5.cl.ui.core')
	.Static('Keyboard', function(Keyboard){
		Keyboard.BACKSPACE = 8;
		Keyboard.TAB = 9;
		Keyboard.ENTER = 13;
		Keyboard.PAUSE = 19;
		Keyboard.ESCAPE = 27;
		Keyboard.SPACE = 32;
		Keyboard.PAGE_UP = 33;
		Keyboard.PAGE_DOWN = 34;
		Keyboard.END = 35;
		Keyboard.HOME = 36;
		Keyboard.LEFT_ARROW = 37;
		Keyboard.UP_ARROW = 38;
		Keyboard.RIGHT_ARROW = 39;
		Keyboard.DOWN_ARROW = 40;
		Keyboard.INSERT = 45;
		Keyboard.DELETE = 46;
		Keyboard.F1 = 112;
		Keyboard.F2 = 113;
		Keyboard.F3 = 114;
		Keyboard.F4 = 115;
		Keyboard.F5 = 116;
		Keyboard.F6 = 117;
		Keyboard.F7 = 118;
		Keyboard.F8 = 119;
		Keyboard.F9 = 120;
		Keyboard.F10 = 121;
		Keyboard.F11 = 122;
		Keyboard.F12 = 123;
		
		Keyboard.isVisibleCharacter = function(keyCode){
			if(typeof keyCode !== 'number')
				return false;
			else
				return keyCode === 32 || (keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 111) || (keyCode >= 186 && keyCode <= 222);
		}
});



a5.Package('a5.cl.ui.core')
	.Import('a5.cl.mvc.core.XMLUtils',
			'a5.cl.core.Utils',
			'a5.cl.core.viewDef.ViewDefParser')
	.Extends('a5.cl.CLBase')
	.Class('ThemeParser', 'singleton', function(self, im, ThemeParser){
		ThemeParser._cl_ns = 'http://corelayerjs.com/';
		ThemeParser._cl_nsPrefix = 'cl';
		
		ThemeParser.getQualifiedClassName = function(classRef){
			return classRef.namespace().replace(/\./g, '_');
		}
		
		ThemeParser.getElementsByTagName = function(xml, tagName){
			return im.XMLUtils.getElementsByTagNameNS(xml, tagName, ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
		}
		
		var theme = null,
			imports = null;
		
		self.ThemeParser = function(){
			self.superclass(this);
		}
		
		self.parseTheme = function(rawTheme){
			theme = im.XMLUtils.parseXML(rawTheme);
			imports = im.ViewDefParser.getImports(theme);
			return theme;
		}
		
		/**
		 * Compile the styles for the given class, considering variant, state, and client environment.  Styles are inherited from parent classes.
		 * 
		 * @param {function|Object} classRef	The class (or instance) to build the styles for.
		 * @param {Object} modifiers	An object containing values for variant, state, environment, platform, or orientation.
		 */
		self.buildStyles = function(classRef, modifiers){
			var compiled = {},
				styleChain = [],
				ancestor = typeof classRef === 'function' ? classRef : classRef.constructor,
				x, prop, thisStyle;
			while(ancestor.isA5ClassDef && ancestor.isA5ClassDef()){
				styleChain.push(getClassStyles(ancestor, modifiers));
				ancestor = typeof ancestor.superclass === 'function' ? ancestor.superclass().constructor : false;
			}
			for(x = styleChain.length - 1; x >= 0; x--){
				thisStyle = styleChain[x];
				for(prop in thisStyle){
					compiled[prop] = thisStyle[prop];
				}
			}
			return compiled;
		}
		
		var getClassStyles = function(classRef, modifiers){
			var styles = classRef._cl_themeStyles || parseStyles(classRef),
				defaults = classRef.themeDefaults || {},
				compiled = {},
				prop, x, y, thisStyle;
			//apply the hard-coded defaults
			applyStyles(defaults, compiled);
			if(modifiers.state && defaults._states_ && defaults._states_[modifiers.state])
				applyStyles(defaults._states_[modifiers.state], compiled);
			//if we've loaded a theme, apply that
			if (theme) {
				//apply the theme-specific defaults
				applyVariant(styles._default_, compiled, modifiers);
				//if a variant was specified, and the theme has a matching variant, apply the variant styles
				if (modifiers.variant && styles[modifiers.variant]) 
					applyVariant(styles[modifiers.variant], compiled, modifiers);
			}
			return compiled;
		}
		
		var parseStyles = function(classRef){
			standardizeDefaults(classRef);
			if(!theme) return {};
			var styles = {},
				className = classRef.className(),
				matchingNodes, x, y, thisNode, variantAttr, parsedNode;
			if (imports[classRef.className()] !== classRef) 
				className = ThemeParser.getQualifiedClassName(classRef);
			matchingNodes = ThemeParser.getElementsByTagName(theme, className);
			styles['_default_'] = [];
			for(x = 0, y = matchingNodes.length; x < y; x++){
				thisNode = matchingNodes[x];
				parsedNode = parseNode(thisNode);
				variantAttr = im.XMLUtils.getNamedItemNS(thisNode.attributes, 'Variant', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
				if(variantAttr) {
					if(!styles[variantAttr.value])
						styles[variantAttr.value] = [];
					styles[variantAttr.value].push(parsedNode);
				} else 
					styles._default_.push(parsedNode);
			}
			classRef._cl_themeStyles = styles;
			return styles;
		}
		
		var parseNode = function(styleNode){
			var obj = {}, 
				x, y, thisAttr, states, thisState, stateName,
				environmentAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Environment', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix),
				platformAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Platform', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix),
				orientationAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Orientation', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
			obj._environment_ = environmentAttr ? environmentAttr.value : '*';
			obj._platform_ = platformAttr ? platformAttr.value : '*';
			obj._orientation_ = orientationAttr ? orientationAttr.value : '*';
			for(x = 0, y = styleNode.attributes.length; x < y; x++){
				thisAttr = styleNode.attributes[x];
				if(im.XMLUtils.getPrefix(thisAttr) === null)
					obj[thisAttr.name] = im.ViewDefParser.processAttribute(thisAttr.value);
			}
			obj._states_ = {};
			states = im.ThemeParser.getElementsByTagName(styleNode, 'State');
			for(x = 0, y = states.length; x < y; x++){
				thisState = states[x];
				stateName = im.XMLUtils.getNamedItemNS(thisState.attributes, 'Name', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix).value;
				obj._states_[stateName] = parseNode(thisState);
			}
			return obj;
		}
		
		var applyVariant = function(variant, obj, modifiers){
			for(x = 0, y = variant.length; x < y; x++){
				thisStyle = variant[x];
				//apply this style if it matches the client environment/platform/orientation
				if (styleMatchesEnvironment(thisStyle, modifiers.environment, modifiers.platform, modifiers.orientation)) {
					applyStyles(thisStyle, obj);
					//if a state was specified, and this style has a matching state, apply that as well
					if(modifiers.state && thisStyle._states_[modifiers.state])
						applyStyles(thisStyle._states_[modifiers.state], obj);
				}
			}
		}
		
		var applyStyles = function(styles, obj){
			for(var prop in styles){
				if(!isInternal(prop))
					obj[prop] = styles[prop];
			}
			return obj;
		}
		
		var isInternal = function(prop){
			return /^_(environment|platform|orientation|states|default)_$/.test(prop);
		}
		
		var styleMatchesEnvironment = function(style, environment, platform, orientation){
			var envMatch = !environment || style._environment_ === '*' || im.Utils.arrayContains(style._environment_.split('|'), environment),
				platMatch = !platform || style._platform_ === '*' || im.Utils.arrayContains(style._platform_.split('|'), platform),
				orMatch = !orientation || style._orientation_ === '*' || im.Utils.arrayContains(style._orientation_.split('|'), orientation);
			return envMatch && platMatch && orMatch;
		}
		
		var standardizeDefaults = function(classRef){
			var defaults = classRef.themeDefaults || {},
				prop;
			for(prop in defaults){
				if(!isInternal(prop) && !im.Utils.isArray(defaults[prop]))
					defaults[prop] = [defaults[prop]];
			}
		}
});



a5.Package('a5.cl.ui.core')
	
	.Import('a5.cl.core.Utils')
	.Extends('a5.cl.CLBase')
	.Class('ThemeManager', 'singleton', function(self, im, ThemeManager){
		var currentTheme = null,
			themables = [],
			parser;
		
		self.ThemeManager = function(){
			self.superclass(this);
			parser = this.create(im.ThemeParser);
		}
		
		self.loadTheme = function(url){
			self.cl().include(a5.cl.core.Utils.makeAbsolutePath(url), eThemeLoaded);
		}
		
		var eThemeLoaded = function(data){
			currentTheme = parser.parseTheme(data);
			for(var x = 0, y = themables.length; x < y; x++){
				themables[x]._cl_applyTheme();
			}
		}
		
		self._cl_registerThemable = function(obj){
			if(im.Utils.arrayIndexOf(themables, obj) === -1)
				themables.push(obj);
		}
		
		self._cl_deregisterThemable = function(obj){
			var idx = themables.indexOf(obj);
			if(idx > -1)
				themables.splice(idx, 1);
		}
		
		self._cl_applyTheme = function(obj, variant, state){
			var styles = parser.buildStyles(obj.constructor, {
				variant: variant,
				state: state,
				environment: this.cl().clientEnvironment(),
				platform: this.cl().clientPlatform(),
				orientation: this.cl().clientOrientation()
			}), prop;
			for(prop in styles){
				if(typeof obj[prop] === 'function')
					obj[prop].apply(obj, styles[prop]);
				else if(obj.hasOwnProperty(prop))
					obj[prop] = styles[prop][0];
			}
		}
});



/**
 * @class 
 * @name a5.cl.ui.events.UIEvent
 */
a5.Package('a5.cl.ui.events')

	.Extends('a5.Event')
	.Static(function(UIEvent){
		
		/**
		 * @event
		 */
		UIEvent.CHANGE = 'UI_Change';
		
		/**
		 * @event
		 */
		UIEvent.CLOSE = 'UI_Close';
		
		/**
		 * @event
		 */
		UIEvent.SELECT = 'UI_Select';
		
		/**
		 * @event
		 */
		UIEvent.RESIZE_STARTED = 'UI_Resize_Started';
		
		/**
		 * @event
		 */
		UIEvent.RESIZE_STOPPED = 'UI_Resize_Stopped';
		
		/**
		 * @event
		 */
		UIEvent.RESIZED = 'UI_Resized';
		
		/**
		 * @event
		 */
		UIEvent.FOCUS = 'UI_Focus';
		
		/**
		 * @event
		 */
		UIEvent.BLUR = 'UI_Blur';

	})
	.Prototype('UIEvent', function(proto, im){
		
		proto.UIEvent = function($type, $nativeEvent, $bubbles){
			proto.superclass(this, [$type, $bubbles]);
			this._cl_nativeEvent = $nativeEvent;
			this._cl_preventDefault = false;
		}	
		
		proto.nativeEvent = function(){ 
			return this._cl_nativeEvent; 
		};
		
		proto.preventDefault = function(){
			this._cl_preventDefault = true;
		}
});


/**
 * @class 
 * @name a5.cl.ui.events.UIMouseEvent
 * @extends a5.cl.ui.events.UIEvent
 */
a5.Package('a5.cl.ui.events')

	.Extends('UIEvent')
	.Static(function(UIMouseEvent){
		
		/**
		 * 
		 */
		UIMouseEvent.CLICK = 'UI_Click';
		
		UIMouseEvent.DOUBLE_CLICK = 'UI_DoubleClick';
		
		/**
		 * 
		 */
		UIMouseEvent.RIGHT_CLICK = 'UI_RightClick';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_OVER = 'UI_MouseOver';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_OUT = 'UI_MouseOut';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_UP = 'UI_MouseUp';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_DOWN = 'UI_MouseDown';
	})
	.Prototype('UIMouseEvent', function(proto, im){
		
		proto.UIMouseEvent = function($type, $nativeEvent){
			proto.superclass(this, arguments);
		}
		
		/**
		 * @return Number
		 */
		proto.clientX = function(){
			if(this.nativeEvent)
				return this.nativeEvent().clientX;
		};
		
		/**
		 * @return Number
		 */
		proto.clientY = function(){
			if(this.nativeEvent)
				return this.nativeEvent().clientY;
		};
		
		/**
		 * @return Number
		 */
		proto.screenX = function(){
			if(this.nativeEvent)
				return this.nativeEvent().screenX;
		};
		
		/**
		 * @return Number
		 */
		proto.screenY = function(){
			if(this.nativeEvent)
				return this.nativeEvent().screenY;
		};	
});


a5.Package('a5.cl.ui.events')

	.Extends('UIEvent')
	.Static(function(UIListEvent){
		
		UIListEvent.ITEM_SELECTED = "UI_ListItemSelected";
		
		UIListEvent.ITEM_EXPANDED = "UI_ListItemExpanded";
		
		UIListEvent.ITEM_COLLAPSED = "UI_ListItemCollapsed";
	})
	.Prototype('UIListEvent', function(proto, im){
		
		proto.UIListEvent = function($type, $bubbles, $listItem){
			proto.superclass(this, [$type, null, $bubbles])
			this._cl_listItem = $listItem;
		}
		
		proto.listItem = function(){
			return this._cl_listItem;
		}
});


a5.Package('a5.cl.ui.events')
	.Import('a5.cl.ui.table.*')
	.Extends('UIEvent')
	.Static(function(UITableEvent){
		UITableEvent.SORT_ROWS = 'sortRows';
	})
	.Prototype('UITableEvent', function(proto, im){
		
		proto.UITableEvent = function(type, bubbles, headerCell, sortDirection){
			proto.superclass(this, [type, null, bubbles]);
			this._cl_headerCell = headerCell;
			this._cl_sortDirection = sortDirection;
		}
		
		proto.headerCell = function(){
			return this._cl_headerCell;
		}
		
		proto.sortDirection = function(){
			return this._cl_sortDirection;
		}
	});



a5.Package('a5.cl.ui.events')
	.Extends('UIEvent')
	.Static(function(UIKeyboardEvent){
		UIKeyboardEvent.KEY_UP = 'UI_KeyUp';
		UIKeyboardEvent.KEY_DOWN = 'UI_KeyDown';
		UIKeyboardEvent.KEY_PRESS = 'UI_KeyPress';
		UIKeyboardEvent.ENTER_KEY = 'UI_EnterKey';
	})
	.Prototype('UIKeyboardEvent', function(proto, im, UIKeyboardEvent){
		proto.UIKeyboardEvent = function(type, nativeEvent, bubbles){
			proto.superclass(this, arguments);
		}
		
		proto.keyCode = function(){
			return this.nativeEvent().keyCode;// || this.nativeEvent().which;
		}
		
		proto.keyCharacter = function(){
			var charCode = this.nativeEvent().charCode || this.keyCode();
			return charCode > 0 ? String.fromCharCode(charCode) : "";
		}
});
	



a5.Package('a5.cl.ui.interfaces')
	.Interface('ITabView', function(cls){
		cls.label = function(){};
		cls.activated = function(){};
		cls.deactivated = function(){};
		cls.staticWidth = function(){};
		cls.clickEnabled = function(){};
	});



a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.form.UIOptionGroup')
	.Mixin('UIGroupable', function(proto, im){
		
		this.Properties(function(){
			this._cl_optionGroup = null;
			this._cl_selected = false;
		})
		
		proto.UIGroupable = function(){
			im.rebuild();
		}
		
		proto.selected = function(value, suppressEvent){
			if(typeof value === 'boolean' && value !== this._cl_selected){
				this._cl_selected = value;
				if(suppressEvent !== true)
					this.dispatchEvent(im.UIEvent.CHANGE);
				return this;
			}
			return this._cl_selected;
		}
		
		proto.optionGroup = function(value){
			if((value instanceof im.UIOptionGroup || value === null) && value !== this._cl_optionGroup){
				if(this._cl_optionGroup)
					this._cl_optionGroup._cl_removeOption(this);
				this._cl_optionGroup = value;
				if(value) value._cl_addOption(this);
				return this;
			}
			return this._cl_optionGroup;
		}
		
		proto.groupName = function(value){
			if (typeof value === 'string' && value != "") {
				this.optionGroup(im.UIOptionGroup.getGroupByName(value));
				return this;
			}
			return this._cl_optionGroup ? this._cl_optionGroup.groupName() : null;
		}
	
});


/**
 * @class Mixin class for all UI controls.  Primarily adds mouse interaction.
 * @name a5.cl.ui.mixins.UIInteractable
 */
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIMouseEvent')
	.Mixin('UIInteractable', function(proto, im){
		
		this.MustExtend('a5.cl.CLView');
		
		this.Properties(function(){
			this._cl_enabled = true;
			this._cl_clickEnabled = false;
			this._cl_usePointer = false;
			this._cl_contextMenuWindow = null;
			this._cl_preventRightClick = false;
		})
		
		proto.UIInteractable = function(){
			
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 */
		proto.usePointer = function(value){
			if (typeof value === 'boolean') {
				this.cursor(value ? 'pointer' : '');
				return this;
			}
			return this._cl_usePointer;
		}
		
		proto.cursor = function(value){
			if(typeof value === 'string'){
				this._cl_cursor = value;
				this._cl_viewElement.style.cursor = value;
				return this;
			}
			return this._cl_viewElement.style.cursor;
		}
		
		/**
		 * 
		 * @param {Boolean} value
		 */
		proto.clickEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_clickEnabled = value;
				var self = this;
				this._cl_viewElement.onclick = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eClickHandler.call(self, e);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.ondblclick = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eDoubleClickHandler.call(self, e);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.onmousedown = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eMouseDownHandler.call(self, e || window.event);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.onmouseup = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eMouseUpHandler.call(self, e || window.event);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				return this;
			}
			return this._cl_clickEnabled;
		}
		
		proto.preventRightClick = function(value){
			if(typeof value === 'boolean'){
				this._cl_preventRightClick = value;
				return this;
			}
			return this._cl_preventRightClick;
		}
		
		proto.contextMenu = function(view){
			if(view instanceof a5.cl.CLView || view === null || view === false){
				if(!this._cl_contextMenuWindow)
					this._cl_contextMenuWindow = this.create(a5.cl.ui.modals.UIContextMenuWindow);
				this._cl_contextMenuWindow.menuView(view);
				if(view)
					this.addEventListener(im.UIMouseEvent.RIGHT_CLICK, proto._cl_showContextMenu, false, this);
				else
					this.removeEventListener(im.UIMouseEvent.RIGHT_CLICK, proto._cl_showContextMenu);
			}
			return this._cl_contextMenuWindow.menuView();
		}
		
		proto._cl_showContextMenu = function(e){
			e.preventDefault();
			this._cl_contextMenuWindow.open(e.nativeEvent());
		}
		
		proto._cl_eClickHandler = function(e){
			if(this.enabled()){
				var isRightClick = e.button === 2;
				if(!isRightClick){
					var evt = this.create(im.UIMouseEvent, [im.UIMouseEvent.CLICK, e]);
					evt.shouldRetain(true);
					this.dispatchEvent(evt);
					var preventDefault = evt._cl_preventDefault;
					evt.destroy();
					return preventDefault;
				}
				return this._cl_preventRightClick;
			}
		}
		
		proto._cl_eDoubleClickHandler = function(e){
			if(this.enabled()){
				var evt = this.create(im.UIMouseEvent, [im.UIMouseEvent.DOUBLE_CLICK, e]);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault;
			}
		}
		
		proto._cl_eMouseDownHandler = function(e){
			if(this.enabled()){
				var evt = this.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_DOWN, e]);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault;
			}
		}
		
		proto._cl_eMouseUpHandler = function(e){
			if (this.enabled()) {
				var isRightClick = e.button === 2,
					evt = this.create(im.UIMouseEvent, [isRightClick ? im.UIMouseEvent.RIGHT_CLICK : im.UIMouseEvent.MOUSE_UP, e]);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault || (isRightClick && this._cl_preventRightClick);
			}
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 * @type Boolean
		 * @return
		 */
		proto.enabled = function(value){
			//Override this to add custom enable/disable functionality
			if (typeof value === 'boolean') {
				this._cl_enabled = value;
				this.alpha(value ? 1:.5);
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.dealloc = function(){
			this._cl_viewElement.onclick = this._cl_viewElement.onmouseup = this._cl_viewElement.onmousedown = null;
		}
});



/**
 * @class Mixin class for themable components.  Adds the ability to apply a theme to the view.
 * @name a5.cl.ui.mixins.UIThemable
 */
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.core.ThemeManager')
	.Mixin('UIThemable', function(proto, im){
		
		this.MustExtend('a5.cl.CLView');
		
		this.Properties(function(){
			this._cl_themeVariant = null;
			this._cl_themeState = null;
		});
		
		proto.UIThemable = function(){
			im.ThemeManager.instance()._cl_registerThemable(this);
		}
		
		proto.mixinReady = function(){
			this._cl_applyTheme();
		}
		
		proto.themeVariant = function(value){
			if(value !== undefined){
				this._cl_themeVariant = value;
				this._cl_applyTheme();
				return this;
			}
			return this._cl_themeVariant;
		}
		
		proto.themeState = function(value){
			if(value !== undefined){
				this._cl_themeState = value;
				this._cl_applyTheme();
				return this;
			}
			return this._cl_themeState;
		}
		
		proto._cl_applyTheme = function(){
			im.ThemeManager.instance()._cl_applyTheme(this, this._cl_themeVariant, this._cl_themeState);
		}
		
		proto.dealloc = function(){
			im.ThemeManager.instance()._cl_deregisterThemable(this);
		}
});



a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIKeyboardEvent',
			'a5.cl.core.Utils')
	.Mixin('UIKeyboardEventDispatcher', function(proto, im){
		
		proto.MustExtend('a5.EventDispatcher');
		
		proto.Properties(function(){
			this._cl_keyEventTarget = null;
			this._cl_keyUpEvent = null;
			this._cl_keyDownEvent = null;
			this._cl_keyPressEvent = null;
			this._cl_enterKeyEvent = null;
		})
		
		proto.UIKeyboardEventDispatcher = function(){
			//create events that will be retained and reused
			this._cl_keyUpEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_UP]).shouldRetain(true);
			this._cl_keyDownEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_DOWN]).shouldRetain(true);
			this._cl_keyPressEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_PRESS]).shouldRetain(true);
			this._cl_enterKeyEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.ENTER_KEY]).shouldRetain(true);
			
			//create the event handlers
			var self = this;
			this._cl_eKeyUpNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyUpHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
			
			this._cl_eKeyDownNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyDownHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
			
			this._cl_eKeyPressNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyPressHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
		}
		
		proto.keyboardEventTarget = function(elem){
			if(elem !== undefined){
				if(this._cl_keyEventTarget)
					this._cl_removeKeyboardEventListeners();
				this._cl_keyEventTarget = elem;
				this._cl_addKeyboardEventListeners();
				return this;
			}
			return this._cl_keyEventElement;
		}
		
		proto._cl_addKeyboardEventListeners = function(){
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keyup', this._cl_eKeyUpNativeHandler);
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keydown', this._cl_eKeyDownNativeHandler);
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keypress', this._cl_eKeyPressNativeHandler);
		}
		
		proto._cl_removeKeyboardEventListeners = function(){
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keyup', this._cl_eKeyUpNativeHandler);
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keydown', this._cl_eKeyDownNativeHandler);
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keypress', this._cl_eKeyPressNativeHandler);
		}
		
		proto._cl_eKeyUpHandler = function(e){
			this._cl_keyUpEvent._cl_preventDefault = false;
			this._cl_keyUpEvent._cl_nativeEvent = e;
			this.dispatchEvent(this._cl_keyUpEvent);
			return this._cl_keyUpEvent._cl_preventDefault;
		}
		
		proto._cl_eKeyDownHandler = function(e){
			this._cl_keyDownEvent._cl_preventDefault = false;
			this._cl_keyDownEvent._cl_nativeEvent = e;
			this.dispatchEvent(this._cl_keyDownEvent);
			return this._cl_keyDownEvent._cl_preventDefault;
		}
		
		proto._cl_eKeyPressHandler = function(e){
			var preventPressDefault = false,
				preventEnterDefault = false;
			this._cl_keyPressEvent._cl_nativeEvent = this._cl_enterKeyEvent._cl_nativeEvent = e;
			this._cl_keyPressEvent._cl_preventDefault = this._cl_enterKeyEvent._cl_preventDefault = false;
			this.dispatchEvent(this._cl_keyPressEvent);
			if(this._cl_keyPressEvent.keyCode() === 13)
				this.dispatchEvent(this._cl_enterKeyEvent);
			return this._cl_keyPressEvent._cl_preventDefault || this._cl_enterKeyEvent._cl_preventDefault;
		}
		
		proto.dealloc = function(){
			this._cl_removeKeyboardEventListeners();
			this._cl_keyUpEvent.destroy();
			this._cl_keyDownEvent.destroy();
			this._cl_keyPressEvent.destroy();
			this._cl_enterKeyEvent.destroy();
		}
});



/**
 * @class Base class for UI controls that extend CLViewContainer.
 * @name a5.cl.ui.UIControl
 * @extends a5.cl.CLViewContainer
 */
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLViewContainer')
	.Mix('a5.cl.ui.mixins.UIInteractable',
		 'a5.cl.ui.mixins.UIThemable')
	.Prototype('UIControl', function(proto, im){
		
		proto.UIControl = function(){
			proto.superclass(this);
			this.usePointer(false);
		}
		
});


/**
 * @class Base class for UI controls that extend CLHTMLView.
 * @name a5.cl.ui.UIHTMLControl
 * @extends a5.cl.CLHTMLView
 */
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLHTMLView')
	.Mix('a5.cl.ui.mixins.UIInteractable',
		 'a5.cl.ui.mixins.UIThemable')
	.Prototype('UIHTMLControl', function(proto, im){
		
		proto.UIHTMLControl = function(){
			proto.superclass(this);
			this.usePointer(false)
				.clickHandlingEnabled(false);
		}
		
});


a5.Package('a5.cl.ui')
	.Import('a5.cl.CLController')
	.Extends('CLController')
	.Prototype('UIController', function(proto, im){
		
		proto.UIController = function(defaultView){
			proto.superclass(this, [defaultView || this.create(a5.cl.ui.UIControl)]);
		}
});



a5.Package('a5.cl.ui')
	
	.Extends('UIHTMLControl')
	.Static(function(UICanvas){
		
		UICanvas._cl_canvasAvailable = !!document.createElement('canvas').getContext;
		
		UICanvas.canvasAvailable = function(){
			return UICanvas._cl_canvasAvailable;
		}
		
		UICanvas.supportsText = function(){
			return typeof document.createElement('canvas').getContext('2d').context.fillText == 'function';
		}		
	})
	.Prototype('UICanvas', function(proto, im, UICanvas){
		
		proto.UICanvas = function(){
			proto.superclass(this);
			this._cl_overflowHeight = 0;
			this._cl_overflowWidth = 0;
			this._cl_canvasElement = null;
			this._cl_context = null;
		}
		
		proto.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			if (UICanvas.canvasAvailable) {
				this._cl_canvasElement = document.createElement('canvas');
				this.appendChild(this._cl_canvasElement);
				this._cl_context = this._cl_canvasElement.getContext('2d');
			} else {
				this.redirect(500, 'Cannot draw UICanvas element, canvas is unavailable in this browser.');
			}
		}
		
		proto.overflowHeight = function(value){ return this._cl_propGetSet('_cl_overflowHeight', value); }
		
		proto.overflowWidth = function(value){ return this._cl_propGetSet('_cl_overflowWidth', value); }
		
		proto.clear = function(){
			this._cl_canvasElement.width = this._cl_canvasElement.width;
		}
		
		proto.context = function(type){
			if (type && type !== '2d') {
				try {
					return this._cl_canvasElement.getContext(type);
				} catch(e){
					return null;
				}
			} else {
				return this._cl_context;
			}
		}
		
		proto._cl_redraw = function(){
			proto.superclass()._cl_redraw.apply(this, arguments);
			this._cl_canvasElement.width = this.width('client') + this._cl_overflowWidth;
			this._cl_canvasElement.height = this.height('client') + this._cl_overflowHeight;
		}	
});

a5.Package('a5.cl.ui')
	.Static('UIScaleMode', function(UIScaleMode){
		UIScaleMode.CLIP = 'clip';
		UIScaleMode.MAINTAIN = 'maintain';
		UIScaleMode.FILL = 'fill';
		UIScaleMode.STRETCH = 'stretch';
});

/**
 * @class 
 * @name a5.cl.ui.UIImage
 * @extends a5.cl.ui.UIHTMLControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.*',
			'a5.cl.core.Utils')
	.Extends('UIHTMLControl')
	.Prototype('UIImage', function(proto, im, UIImage){
		
		this.Properties(function(){
			this._cl_isBG = false;
			this._cl_imgElement = null;
			this._cl_src = null;
			this._cl_imgHeight = 0;
			this._cl_imgWidth = 0;
			this._cl_nativeWidth = 0;
			this._cl_nativeHeight = 0;
			this._cl_scaleMode = im.UIScaleMode.CLIP;
			this._cl_imageAlignX = 'left';
			this._cl_imageAlignY = 'top';
			this._cl_imgLoaded = false;
			this._cl_pendingImgSize = false;
			this._cl_pendingFirstDraw = false;		
			this.skipViewDefReset = ['src'];
		})
		
		proto.UIImage = function(src, isBG){
			proto.superclass(this);
			if (isBG !== undefined) {
				this._cl_isBG = isBG;
			} else {
				this.width('auto').height('auto');
				this._cl_imgElement = new Image();
			}
			if(src !== undefined)
				this.src(src);
		}
		
		proto._cl_applySrc = function(){
			var self = this,
				onLoad = function(){
					self._cl_nativeWidth = self._cl_imgElement.naturalWidth || self._cl_imgElement.width;
					self._cl_nativeHeight = self._cl_imgElement.naturalHeight || self._cl_imgElement.height;
					self._cl_imgLoaded = true;
					self._cl_pendingFirstDraw = true;
					self._cl_updateImgSize();
					self._cl_imgElement.onload = self._cl_imgElement.onerror = null;
					self.drawHTML(self._cl_imgElement);
					self.redraw();
				},
				onError = function(e){
					//self.redirect(500, "UIImage Error: Error loading image at url " + self._cl_src);
					self._cl_imgElement.onload = self._cl_imgElement.onerror = null;
				};
			this._cl_imgLoaded = false;
			if (!this._cl_isBG) {
				this._cl_imgElement.style.visibility = 'hidden';
				this._cl_imgElement.style.position = 'relative';
				this._cl_imgElement.onload = onLoad;
				this._cl_imgElement.onerror = onError;
				this._cl_imgElement.src = im.Utils.makeAbsolutePath(this._cl_src);
			} else {
				//console.log("url('" + this._cl_src + "')");
				this._cl_css('backgroundImage', "url('" + this._cl_src + "')");
			}
		}
		
		proto._cl_updateImgSize = function(){
			if(!this._cl_imgLoaded) return;
			var imgWidth = 0, imgHeight = 0,
				thisWidth = this.width(),
				thisHeight = this.height();
			switch(this._cl_scaleMode){
				case im.UIScaleMode.CLIP:
					imgWidth = this._cl_nativeWidth;
					imgHeight = this._cl_nativeHeight;
					break;
				case im.UIScaleMode.STRETCH:
					this._cl_imgElement.style.width = this._cl_imgElement.style.height = '100%';
					break;
				case im.UIScaleMode.MAINTAIN:
				case im.UIScaleMode.FILL:
					//if the width or height is zero, wait until next redraw
					if(thisWidth <= 0 || thisHeight <= 0){
						this._cl_pendingImgSize = true;
						return;
					}	
					var viewAspect = thisWidth / thisHeight,
						nativeAspect = this._cl_nativeWidth / this._cl_nativeHeight;
					if(isNaN(nativeAspect) || nativeAspect === Infinity)
						nativeAspect = 1;
					if(this.height('value') === 'auto' || (this._cl_scaleMode === im.UIScaleMode.FILL && viewAspect > nativeAspect && !this._cl_width.auto) || (this._cl_scaleMode === im.UIScaleMode.MAINTAIN && viewAspect < nativeAspect && !this._cl_width.auto)){
						imgWidth = thisWidth;
						imgHeight = this._cl_nativeHeight / this._cl_nativeWidth * thisWidth;
					} else {
						imgHeight = thisHeight;
						imgWidth = nativeAspect * thisHeight;
					}
					break;
			}
			if(imgWidth > 0 && imgHeight > 0){
				this._cl_imgElement.style.width = imgWidth + 'px';
				this._cl_imgElement.style.height = imgHeight + 'px';
				
				switch(this._cl_imageAlignX){
					case 'left':
						this._cl_imgElement.style.left = 0;
						break;
					case 'center':
						this._cl_imgElement.style.left = (thisWidth / 2 - imgWidth / 2) + 'px';
						break;
					case 'right':
						this._cl_imgElement.style.right = 0;
						break;
				}
				
				switch(this._cl_imageAlignY){
					case 'top':
						this._cl_imgElement.style.top = 0;
						break;
					case 'middle':
						this._cl_imgElement.style.top = (thisHeight / 2 - imgHeight / 2) + 'px';
						break;
					case 'bottom':
						this._cl_imgElement.style.bottom = 0;
						break;
				}
			}
			this._cl_pendingImgSize = false;
			//this.redraw();
		}
		
		/**
		 * 
		 * @param {String} url
		 */
		proto.src = function(src){
			if(typeof src === 'string'){
				var didChange = src !== this._cl_src;
				this._cl_src = src;
				if(didChange)
					this._cl_applySrc();
				return this;
			}
			return this._cl_src;
		}
		
		proto.tileMode = function(value){ 
			if (typeof value === 'string') {
				this._cl_css('backgroundRepeat', value);
				return this;
			}
			//return this._cl_getCSS('background-repeat');
		}
		
		proto.scaleMode = function(value){
			if(typeof value === 'string'){
				this._cl_scaleMode = value;
				this._cl_updateImgSize();
				return this;
			}
			return this._cl_scaleMode;
		}
		
		proto.imageAlignX = function(value){
			if(typeof value === 'string'){
				if(this._cl_imageAlignX !== value){
					this._cl_imageAlignX = value;
					this._cl_updateImgSize();
				}
				return this;
			}
			return this._cl_imageAlignX;
		}
		
		proto.imageAlignY = function(value){
			if(typeof value === 'string'){
				if(this._cl_imageAlignY !== value){
					this._cl_imageAlignY = value;
					this._cl_updateImgSize();
				}
				return this;
			}
			return this._cl_imageAlignY;
		}
		
		proto.nativeWidth = function(){
			return this._cl_nativeWidth;
		}
		
		proto.nativeHeight = function(){
			return this._cl_nativeHeight;
		}
		
		proto.Override.alignX = function(value){
			var returnVal = proto.superclass().alignX.apply(this, arguments);
			if(typeof value === 'string')
				this.css('textAlign', value);
			return returnVal;
		}
		
		proto.Override.width = function(value){
			var returnVal = proto.superclass().width.call(this, value);
			if((typeof value === 'number' || typeof value === 'string') && value !== 'client' && value !== 'inner' && value !== 'value' && value !== 'scroll' && value !== 'content')
				this._cl_updateImgSize();
			else if(!this._cl_isBG && value === 'scroll' || value === 'content')
				return this._cl_imgElement.scrollWidth;
				//return this._cl_width.auto ? this._cl_nativeWidth : this._cl_imgElement.scrollWidth;
			return returnVal; 
		}
		
		proto.Override.height = function(value){
			var returnVal = proto.superclass().height.call(this, value);
			if((typeof value === 'number' || typeof value === 'string') && value !== 'client' && value !== 'inner' && value !== 'value' && value !== 'scroll' && value !== 'content')
				this._cl_updateImgSize();
			else if(!this._cl_isBG && value === 'scroll' || value === 'content')
				return this._cl_imgElement.scrollHeight;
				//return this._cl_height.auto ? this._cl_nativeHeight : this._cl_imgElement.scrollHeight;
			return returnVal;
		}
		
		proto.Override._cl_redraw = function(){
			var initialRenderComplete = this._cl_initialRenderComplete,
				returnVal = proto.superclass()._cl_redraw.apply(this, arguments),
				dynamicScale = (this._cl_scaleMode === im.UIScaleMode.FILL || this._cl_scaleMode === im.UIScaleMode.MAINTAIN), 
				relativeSize = (this._cl_width.percent !== false || this._cl_height.percent !== false || this._cl_width.relative !== false || this._cl_height.relative !== false);
			if(this._cl_pendingImgSize || !initialRenderComplete || (returnVal.shouldRedraw && dynamicScale && relativeSize))
				this._cl_updateImgSize();
			if(this._cl_pendingFirstDraw)
				this._cl_imgElement.style.visibility = 'visible';
			return returnVal;
		}
		
		proto.dealloc = function(){
			this._cl_destroyElement(this._cl_imgElement);
			this._cl_imgElement = null;
		}
});



/**
 * @class 
 * @name a5.cl.ui.UITextField
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIHTMLControl')
	.Prototype('UITextField', function(proto, im){
		
		proto.UITextField = function(text){
			proto.superclass(this);
			this._cl_text = "";
			this._cl_nonBreaking = false;
			this._cl_textColor = '#000';
			this._cl_textAlign = 'left';
			this._cl_textDecoration = 'none';
			this._cl_fontSize = '14px';
			this._cl_fontWeight = 'normal';
			this._cl_fontStyle = 'normal';
			this._cl_fontFamily = null;
			this._cl_formElement = null;
			this._cl_element = this.htmlWrapper();
			this.height('auto');
			this.fontFamily('Arial');
			if(typeof text === 'string')
				this.text(text);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this._cl_element.style.minHeight = '1em';
		}
		
		/**
		 * 
		 * @param {String} value
		 */
		proto.text = function(value){
			if(value !== undefined && value !== null){
				this._cl_text = String(value);
				this._cl_setText();
				return this;
			}
			return this._cl_text;
		}
		
		proto.nonBreaking = function(value){
			if(typeof value === 'boolean'){
				this._cl_nonBreaking = value;
				this._cl_setText();
				return this;
			}
			return this._cl_nonBreaking;
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.form.UIFormElement} input
		 */
		proto.isLabelFor = function(input){
			//make sure an input was passed
			if(input instanceof a5.cl.ui.form.UIFormElement){
				var inputID = null;
				inputID = input.element().id;
				this._cl_formElement = input;
				//make sure that we have a valid ID to use
				if(typeof inputID === 'string' && inputID.length > 0){
					if(this._cl_element.tagName.toUpperCase() === "LABEL"){
						//if the element is already a label, just update the 'for' param
						this._cl_element.setAttribute('for', inputID);
					} else {
						//otherwise, create a new <label> element, and copy the appropriate properties from the current element
						var label = document.createElement('label');
						label.setAttribute('for', inputID);
						label.style.cursor = 'inherit';
						label.className = this._cl_element.className;
						label.innerHTML = this._cl_element.innerHTML;
						this._cl_element.innerHTML = "";
						//add the new element
						this.appendChild(label);
						//update the element reference
						this._cl_element = label;
						label = null;
					}
				}
			}
		}
		
		proto.textColor = function(value){
			if(typeof value === 'string'){
				this._cl_textColor = this._cl_element.style.color = value;
				return this;
			}
			return this._cl_textColor;
		}
		
		proto.textAlign = function(value){
			if(typeof value === 'string'){
				this._cl_textAlign = this._cl_element.style.textAlign = value;
				return this;
			}
			return this._cl_textAlign;
		}
		
		proto.textDecoration = function(value){
			if(typeof value === 'string'){
				this._cl_textDecoration = this._cl_element.style.textDecoration = value;
				return this;
			}
			return this._cl_textDecoration;
		}
		
		proto.fontSize = function(value){
			if(typeof value === 'number')
				value = value + 'px';
			if(typeof value === 'string'){
				this._cl_fontSize = value;
				this.css('fontSize', value);
				return this;
			}
			return this._cl_fontSize;
		}
		
		proto.fontWeight = function(value){
			if(typeof value === 'string'){
				this._cl_fontWeight = value;
				this.css('fontWeight', value);
				return this;
			}
			return this._cl_fontWeight;
		}
		
		proto.fontStyle = function(value){
			if(typeof value === 'string'){
				this._cl_fontStyle = value;
				this.css('fontStyle', value);
				return this;
			}
			return this._cl_fontStyle;
		}
		
		proto.fontFamily = function(value){
			if(typeof value === 'string'){
				this._cl_fontFamily = value;
				this.css('fontFamily', value);
				return this;
			}
			return this._cl_fontFamily;
		}
		
		proto.bold = function(value){
			if(typeof value === 'boolean'){
				this.fontWeight(value ? 'bold' : 'normal');
				return this;
			}
			return this.fontWeight() === 'bold';
		}
		
		proto.italic = function(value){
			if(typeof value === 'boolean'){
				this.fontStyle(value ? 'italic' : 'normal');
				return this;
			}
			return this.fontStyle() === 'italic';
		}
		
		proto.underline = function(value){
			if(typeof value === 'boolean'){
				this.textDecoration(value ? 'underline' : 'none');
				return this;
			}
			return this.textDecoration() === 'underline';
		}
		
		/**
		 * 
		 */
		proto.element = function(){ return this._cl_element; }
		
		proto._cl_setText = function(){
			var value;
			if(this._cl_nonBreaking)
				value = this._cl_text.replace(/(\s)/gm, function(x){ return new Array(x.length + 1).join('&nbsp;') });
			else
				value = this._cl_text;
			this._cl_replaceNodeValue(this._cl_element, value);
		}
		
		proto.Override._cl_redraw = function(){
			var firstRender = !this._cl_initialRenderComplete,
				returnVal = proto.superclass()._cl_redraw.apply(this, arguments);
			if (firstRender && this._cl_text !== '' && (this._cl_width.auto || this._cl_height.auto))
				this._cl_setText(this._cl_text);
			return returnVal;
		}
		
		proto.dealloc = function(){
			if(this._cl_element !== this.htmlWrapper())
				this._cl_destroyElement(this._cl_element);
			this._cl_element = null;
		}	
});


a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*')
	.Extends('UITextField')
	.Prototype('UILink', function(proto, im){
		
		proto.UILink = function(){
			proto.superclass(this);
			this.clickEnabled(true).usePointer(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this.addEventListener(im.UIMouseEvent.MOUSE_OVER, this.onRollOver, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_OUT, this.onRollOut, false, this);
			
			var self = this;
			this._cl_viewElement.onmouseover = function(e){
				if(self._cl_enabled)
					self.dispatchEvent(self.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OVER, e || window.event]));
			}
			this._cl_viewElement.onmouseout = function(e){
				if(self._cl_enabled)
					self.dispatchEvent(self.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OUT, e || window.event]));
			}
		}
		
		proto.onRollOver = function(){
			this.underline(true);
		}
		
		proto.onRollOut = function(){
			this.underline(false);
		}
	});



/**
 * @class 
 * @name a5.cl.ui.UIFrameView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.*',
			'a5.cl.CLEvent')
	.Extends('UIHTMLControl')
	.Static(function(UIFrameView){
		
		UIFrameView.ALLOW_SAME_ORIGIN = "allow-same-origin";
		
		UIFrameView.ALLOW_FORMS = "allow-forms";
		
		UIFrameView.ALLOW_SCRIPTS = "allow-scripts";
	})
	.Prototype('UIFrameView', function(proto, im){
		
		proto.UIFrameView = function(){
			proto.superclass(this);
			this._cl_iframe = document.createElement('iframe');
			this._cl_iframe.frameBorder = 0;
			this._cl_iframe.style.width = this._cl_iframe.style.height = '100%';
			this._cl_url = null;
			this._cl_iframeDoc = null;
			
			this.superclass().appendChild.call(this, this._cl_iframe);
			this.cl().addEventListener(im.CLEvent.GLOBAL_UPDATE_TIMER_TICK, this._cl_checkFrameDOM, false, this);	
		}
		
		proto.iframe = function(){
			return this._cl_iframe;
		}
		
		proto._cl_checkFrameDOM = function(){
			if(this._cl_iframe.contentDocument)
		    	this._cl_iframeDoc = this._cl_iframe.contentDocument;
			else if(this._cl_iframe.contentWindow)
				this._cl_iframeDoc = this._cl_iframe.contentWindow.document;
			else if(this._cl_iframe.document)
				this._cl_iframeDoc = this._cl_iframe.document;
			if (this._cl_iframeDoc) {
				this.cl().removeEventListener(im.CLEvent.GLOBAL_UPDATE_TIMER_TICK, this._cl_checkFrameDOM);
				this.dispatchEvent('READY');
			}		
				
		}
		
		/**
		 * 
		 * @param {String} url
		 */
		proto.url = function(url){
			this._cl_iframe.src = url;
		}
		
		proto.Override.drawHTML = function(value){
			if(typeof value !== 'string'){
				var elem = document.createElement('div');
				elem.appendChild(value);
				value = elem.innerHTML;
				elem = null;
			}
			this._cl_iframeDoc.write(value);
		}
		
		proto.sandboxSettings = function(){
			args = Array.prototype.slice.call(arguments);
			if(args.length){
				var str = '';
				for (var i = 0, l = args.length; i < l; i++) {
					str += args[i];
					if(i<l-1)
						str += ' ';
				}
				this._cl_iframe.setAttribute('sandbox', str);
			} else {
				this._cl_iframe.removeAttribute('sandbox');
			}
				
		}
		
		proto.eval = function(str){
			this._cl_iframe.contentWindow.focus();
			if(this._cl_iframe.contentWindow.execScript)
				return this._cl_iframe.contentWindow.execScript(str);
			else 
				return this._cl_iframe.contentWindow.eval(str);
		}
		
		/**
		 * 
		 * @param {Boolean} value
		 */
		proto.scrolling = function(value){
			this._cl_iframe.scrolling = value ? 'auto':'no'; 
		}
		
		proto.dealloc = function(){
			this._cl_destroyElement(this._cl_iframe);
			this._cl_iframeDoc = null;
			this._cl_iframe = null;
		}
		
});


/**
 * @class 
 * @name a5.cl.ui.UIResizable
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*',
			'a5.cl.core.Utils')
	.Extends('UIControl')
	.Prototype('UIResizable', function(proto, im){
		
		
		proto.UIResizable = function(coordinates){
			this._cl_contentView = this.create(a5.cl.ui.UIControl);
			this._cl_handles = {};
			if(typeof coordinates == 'string'){
				this._cl_coordinates = [];
				var splitCoords = coordinates.split(',');
				for(var x = 0, y = splitCoords.length; x < y; x++){
					var thisCoord = splitCoords[x];
					if(this._cl_validateDirection(thisCoord))
						this._cl_coordinates.push(thisCoord);
				}
			} else {
				this._cl_coordinates = ['e', 'se', 's'];
			}
			this._cl_handleSize = 5;
			this._cl_resizing = false;
			this._cl_cachedWidth = 0;
			this._cl_cachedHeight = 0;
			this._cl_cachedY = 0;
			this._cl_cachedX = 0;
			this._cl_cachedMouseX = 0;
			this._cl_cachedMouseY = 0;
			this._cl_viewIsReady = false;
			this._cl_resizeEventsEnabled = false;
			
			proto.superclass(this);
			
			this.minWidth(50);
			this.minHeight(50);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this._cl_viewIsReady = true;
			//add the content view
			a5.cl.CLViewContainer.prototype.addSubViewAtIndex.call(this, this._cl_contentView, 0);
			//make sure scrollX/scrollY are applied to the contentView and NOT the main view
			if(this.scrollXEnabled())
				this._cl_contentView.scrollXEnabled(true);
			if(this.scrollYEnabled())
				this._cl_contentView.scrollYEnabled(true);
			proto.superclass().scrollXEnabled.call(this, false);
			proto.superclass().scrollYEnabled.call(this, false);
			
			//create the handles
			this.setCoordinates(this._cl_coordinates);
		}
		
		proto.Override.childrenReady = function(){
			proto.superclass().childrenReady.apply(this, arguments);
			//move any sub-views added by the viewdef into the contentView
			for(var x = 0; x<this.subViewCount(); x++){
				var thisView = this.subViewAtIndex(x);
				var shouldMove = thisView !== this._cl_contentView;
				if(shouldMove){
					for(var prop in this._cl_handles){
						if(this._cl_handles[prop] === thisView){
							shouldMove = false;
							break;
						}
					}
				}
				if(shouldMove)
					this._cl_contentView.addSubView(thisView);
			}
			//this._cl_locked(true);
		}
		
		/**
		 * Set the directions in which this object should be resizable.
		 * 
		 * @param {Array|String} coords An array of coordinate strings, or a comma-delimited list. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.setCoordinates = this.Attributes(
			["a5.Contract", {coords:'array'}, {coords:'string'}], 
			function(args){
				if(args && this._cl_viewIsReady){
					var coords = args.coords;
					if(args.overloadID === 1)
						coords = args.coords.split(',');
					this._cl_coordinates = coords;
					if (this._cl_viewIsReady) {
						var allCoords = ['n', 's', 'e', 'w', 'ne', 'se', 'sw', 'nw'];
						for (var x = 0, y = allCoords.length; x < y; x++) {
							var thisCoord = allCoords[x];
							if (im.Utils.arrayIndexOf(coords, thisCoord) === -1) 
								this.disableCoordinate(thisCoord);
							else this.enableCoordinate(thisCoord);
						}
					}
				}
			})
		
		/**
		 * Enable resizing for the specified direction.
		 * 
		 * @param {String} coord The direction in which to enable resizing. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.enableCoordinate = function(coord){
			if(this._cl_validateDirection(coord) && !this._cl_handles[coord]){
				this._cl_createHandle(coord);
			}
		}
		
		/**
		 * Disable resizing for the specified direction
		 * 
		 * @param {String} coord The direction in which to disable resizing. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.disableCoordinate = function(coord){
			if(this._cl_validateDirection(coord) && this._cl_handles[coord]){
				this.removeSubView(this._cl_handles[coord]);
				delete this._cl_handles[coord];
			}
		}
		
		proto.getHandle = function(coord){
			return this._cl_handles[coord];
		}
		
		proto._cl_createHandle = function(direction){
			//create a new button to act as the handle
			var handle = this.create(a5.cl.ui.UIControl).clickEnabled(true);
			handle.handleDirection = direction;
			this._cl_handles[direction] = handle;
			a5.cl.CLViewContainer.prototype.addSubView.call(this, handle);
			//give it the appropriate cursor
			handle.cursor(direction + '-resize');
			//set the size and position based on the direction
			handle.width(direction.match(/e|w/) !== null ? this._cl_handleSize : '100%');//((0 - this._cl_handleSize * 2) + ''));
			handle.height(direction.match(/n|s/) !== null ? this._cl_handleSize : '100%');//((0 - this._cl_handleSize * 2) + ''));
			//handle.x(direction.match(/e|w/) !== null ? (0) : this._cl_handleSize);
			//handle.y(direction.match(/n|s/) !== null ? (0) : this._cl_handleSize);
			handle.x(0).y(0);
			handle.alignX(direction.indexOf('e') !== -1 ? 'right' : 'left');
			handle.alignY(direction.indexOf('s') !== -1 ? 'bottom' : 'top');
			
			//add event listeners
			var self = this;
			var mouseDown = function(e){
				self._cl_resizing = true;
				self._cl_cachedWidth = self.width();
				self._cl_cachedHeight = self.height();
				self._cl_cachedX = self.x();
				self._cl_cachedY = self.y();
				self._cl_cachedMouseX = e.screenX();
				self._cl_cachedMouseY = e.screenY();
				
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.RESIZE_STARTED]));
				im.Utils.addEventListener(window, 'mousemove', mouseMove, false);
				im.Utils.addEventListener(window, 'mouseup', mouseUp, false);
				e.preventDefault();
			};
			
			var mouseUp = function(e){
				self._cl_resizing = false;
				im.Utils.removeEventListener(window, 'mousemove', mouseMove, false);
				im.Utils.removeEventListener(window, 'mouseup', mouseUp, false);
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.RESIZE_STOPPED]));
			}
			
			var mouseMove = function(e){
				if(!e) e = window.event;
				if(handle.handleDirection.match(/e|w/) !== null)
					self.width(self._cl_cachedWidth + (e.screenX - self._cl_cachedMouseX) * (handle.handleDirection.indexOf('w') !== -1 ? -1 : 1));
				if(handle.handleDirection.match(/n|s/) !== null)
					self.height(self._cl_cachedHeight + (e.screenY - self._cl_cachedMouseY) * (handle.handleDirection.indexOf('n') !== -1 ? -1 : 1));
				if(handle.handleDirection.indexOf('n') !== -1)
					self.y(self._cl_cachedY - (self._cl_cachedMouseY - e.screenY));
				if(handle.handleDirection.indexOf('w') !== -1)
					self.x(self._cl_cachedX - (self._cl_cachedMouseX - e.screenX));
				
				self.resized.call(self);
				if(self._cl_resizeEventsEnabled)
					self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.RESIZED]));
				return false;
			}
			
			handle.addEventListener(im.UIMouseEvent.MOUSE_DOWN, mouseDown);
		}
		
		/**
		 * Called each time the view is resized by dragging the mouse.
		 */
		proto.resized = function(){};
		
		proto._cl_validateDirection = function(dir){
			switch(dir){
				//TODO: make redraw more stable before enabling NW coordinates
				case 'n':
				case 'ne':
				case 'sw':
				case 'w':
				case 'nw':
				case 'e':
				case 'se':
				case 's':
					return true;
				default:
					return false;
			}
		}
		
		proto.resizeEventsEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizeEventsEnabled = value;
				return this;
			}
			return this._cl_resizeEventsEnabled;
		}
		
		proto.Override.enabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_enabled = value;
				for(var prop in this._cl_handles){
					this._cl_handles[prop].enabled(value);
				}
			}
			return this._cl_enabled;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.Override.scrollXEnabled = function(value){
			if(this._cl_contentView)
				return this._cl_contentView.scrollXEnabled(value);
			else
				return proto.superclass().scrollXEnabled.call(this, value);
		}
		
		proto.Override.scrollYEnabled = function(value){
			if(this._cl_contentView)
				return this._cl_contentView.scrollYEnabled(value);
			else
				return proto.superclass().scrollYEnabled.call(this, value);
		}
		
		
		proto.Override.addSubView = function(){
			this._cl_contentView.addSubView.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewAtIndex = function(){
			this._cl_contentView.addSubViewAtIndex.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewBelow = function(){
			this._cl_contentView.addSubViewBelow.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewAbove = function(){
			this._cl_contentView.addSubViewAbove.apply(this._cl_contentView, arguments);
		}
});


/**
 * @class 
 * @name a5.cl.ui.UIAccordionView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIControl')
	.Static(function(UIAccordionView){
		UIAccordionView.HORIZONTAL = 0;
		UIAccordionView.VERTICAL = 1;
	})
	.Prototype('UIAccordionView', function(proto, im){
		proto.UIAccordionView = function(){
			proto.superclass(this);
			this._cl_direction = 1;
			this.relY(true);
			this._cl_handleSize = null;
			this._cl_singleSelection = false;
			this._cl_fillView = false;
			this._cl_panels = null;
			this._cl_expandedPanels = [];
			this._cl_expandDuration = 0;
			this._cl_collapseDuration = 0;
			
			var self = this;
			this.addEventListener(a5.cl.ui.events.UIEvent.SELECT, function(e){
				var targetPanel = e.target();
				if(targetPanel.isExpanded() && !self._cl_fillView)
					self.collapsePanel(targetPanel);
				else
					self.expandPanel(targetPanel);
			});
		}

		proto.Override.childrenReady = function(){
			this.build();
		}
		
		/**
		 * Builds (or re-builds) the accordion view.
		 */
		proto.build = function(){
			this._cl_panels = [];
			for(var x = 0, y = this.subViewCount(); x < y; x++){
				var thisView = this.subViewAtIndex(x);
				if(thisView._cl_initialized && thisView instanceof a5.cl.ui.UIAccordionPanel){
					thisView._cl_accordion = this;
					//add this view to the array of panels
					this._cl_panels.push(thisView);
				}
			}
			//expand the panels that were expanded before building
			this._cl_updatePanels();
		}
		
		proto._cl_updatePanels = function(){
			var x, y, thisPanel, prevPanel, size, shouldExpand, didExpand, didCollapse, targetSize, duration;
			for(x = 0, y = this._cl_panels.length; x < y; x++){
				thisPanel = this._cl_panels[x];
				prevPanel = x > 0 ? this._cl_panels[x - 1] : null
				//adjust for horizontal vs vertical
				size = this._cl_direction === im.UIAccordionView.HORIZONTAL ? a5.cl.CLViewContainer.prototype.width : a5.cl.CLViewContainer.prototype.height;
				//determine if this panel should be expanded or collapsed
				shouldExpand = a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, x) > -1 || !thisPanel.collapsible();
				didExpand = shouldExpand && !thisPanel.isExpanded();
				didCollapse = !shouldExpand && thisPanel.isExpanded();
				//size this panel accordingly
				if(this._cl_handleSize !== null)
					thisPanel.collapsedSize(this._cl_handleSize);
				targetSize = shouldExpand							//if this panel should be expanded... 
					? (this._cl_fillView							//and if we should be filling the view...
						? ((0 - this._cl_handleSize * (y - 1)) + '')//then calculate the size to fill the view
						: thisPanel.expandedSize())					//if not filling, set to the expandedSize
					: thisPanel.collapsedSize();					//else collapse to just the handle
				duration = (didExpand && this._cl_expandDuration > 0) ? this._cl_expandDuration : (didCollapse && this._cl_collapseDuration > 0 ? this._cl_collapseDuration : false);
				if(duration)
					thisPanel.animate(duration, {
						height: targetSize,
						redrawOnProgress: true
					});
				else
					size.call(thisPanel, targetSize);
				//alert the panel of its new state
				thisPanel._cl_expanded = shouldExpand;
				if(didExpand)
					thisPanel.expanded.call(thisPanel);
				else if(didCollapse)
					thisPanel.collapsed.call(thisPanel);
			}
		}
		
		/**
		 * Append a UIAccordionPanel.
		 * @param {a5.cl.ui.UIAccordionPanel} panel The panel to add.
		 */
		proto.addPanel = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel'}], 
		function(args){
			if(args){
				this.addSubView(args.panel);
				this.build();
			}
		})
		
		proto.addPanelAtIndex = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel', index:'number'}], 
		function(args){
			if(args){
				this.addSubViewAtIndex(args.panel, index);
				this.build();
			}
		})
		
		proto.removePanel = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel'}], 
		function(args){
			if(args){
				this.removeSubView(args.panel);
			}
		})
		
		proto.removePanelAtIndex = function(index){
			this.removeViewAtIndex(index);
		}
		
		proto.removeAllPanels = function(){
			this.removeAllSubViews();
		}
		
		/**
		 * 
		 * @param {Object} panel
		 */
		proto.expandPanel = function(panel){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				if(thisPanel === panel){
					this.expandPanelAtIndex(x);
				}
			}
		}
		
		/**
		 * 
		 * @param {Object} panel
		 */
		proto.collapsePanel = function(panel){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				if(thisPanel === panel){
					this.collapsePanelAtIndex(x);
				}
			}
		}
		
		/**
		 * 
		 * @param {Object} index
		 */
		proto.expandPanelAtIndex = function(index){
			if(this._cl_singleSelection){
				this._cl_expandedPanels = [index];
				this._cl_updatePanels();
				return this.getPanelAtIndex(index);
			} else if (a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, index) === -1) {
				this._cl_expandedPanels.push(index);
				this._cl_updatePanels();
				return this.getPanelAtIndex(index);
			}
			return null;
		}
		
		/**
		 * 
		 * @param {Object} index
		 */
		proto.collapsePanelAtIndex = function(index){
			var indexSquared = a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, index);
			if (indexSquared > -1){
				var collapsedPanel = this._cl_expandedPanels.splice(indexSquared, 1)[0];
				this._cl_updatePanels();
				return collapsedPanel;
			}
			return null;
		}
		
		/**
		 * Expands all of the panels in this accordion view.
		 */
		proto.expandAllPanels = function(){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.expandPanelAtIndex(x);
			}
		}
		
		/**
		 * Collapses all of the panels in this accordion view.
		 */
		proto.collapseAllPanels = function(){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.collapsePanelAtIndex(x);
			}
		}
		
		/**
		 * 
		 */
		proto.totalPanels = function(){
			return this._cl_panels.length;
		}
		
		proto.getPanelAtIndex = function(index){
			return this._cl_panels[index];
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.direction = function(value){
			if (value === im.UIAccordionView.HORIZONTAL || value === im.UIAccordionView.VERTICAL){
				this._cl_direction = value;
				this.relX(value === im.UIAccordionView.HORIZONTAL);
				this.relY(value === im.UIAccordionView.VERTICAL);
				this.build();
				return this;
			}
			return this._cl_direction;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.handleSize = function(value){
			if (typeof value === 'number') {
				this._cl_handleSize = value;
				this.build();
				return this;
			}
			return this._cl_handleSize;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.singleSelection = function(value){
			if (typeof value === 'boolean') {
		if(!this._cl_fillView) //only allow single selection to be modified if fillView is false (otherwise it must be true)
			this._cl_singleSelection = value;
				return this;
			}
			return this._cl_singleSelection;
		}

		/**
		 * 
		 * @param {Object} value
		 */
		proto.fillView = function(value){
			if (typeof value === 'boolean') {
				this._cl_fillView = value;
				if(value) this._cl_singleSelection = true;
				return this;
			}
			return this._cl_fillView;
		}
		
		proto.expandDuration = function(value){
			if(typeof value === 'number'){
				this._cl_expandDuration = value;
				return this;
			}
			return this._cl_expandDuration;
		}
		
		proto.collapseDuration = function(value){
			if(typeof value === 'number'){
				this._cl_collapseDuration = value;
				return this;
			}
			return this._cl_collapseDuration;
		}
		
		proto.Override.removeSubView = function(){
			proto.superclass().removeSubView.apply(this, arguments);
			this.build();
		}
	});



/**
 * @class 
 * @name a5.cl.ui.UIAccordionView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*')
	.Extends('UIControl')
	.Prototype('UIAccordionPanel', function(proto, im){
		
		proto.UIAccordionPanel = function(){
			proto.superclass(this);
			this._cl_expanded = true;
			this._cl_expandedSize = 100;
			this._cl_collapsedSize = 30;
			this._cl_accordion = null;
			this._cl_collapsible = true;
			this.initHandle();
		}
		
		proto.initHandle = function(){
			var self = this;
			this.clickEnabled(true);
			this.addEventListener(im.UIMouseEvent.CLICK, function(e){
				self.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.SELECT]));
			});
		}
		
		proto.expanded = function(){
			
		}
		
		proto.collapsed = function(){
			
		}
		
		proto.isExpanded = function(){
			return this._cl_expanded;
		}
		
		proto.collapsible = function(value){
			if(typeof value === 'boolean'){
				this._cl_collapsible = value;
				return this;
			}
			return this._cl_collapsible;
		}
		
		proto.accordionView = function(){
			return this._cl_accordion;
		}
		
		proto.expandedSize = function(value){
			if (typeof value === 'number' || typeof value === 'string') {
				this._cl_expandedSize = value;
				return this;
			}
			return this._cl_expandedSize;
		}
		
		proto.collapsedSize = function(value){
			if (typeof value === 'number' || typeof value === 'string') {
				this._cl_collapsedSize = value;
				return this;
			}
			return this._cl_collapsedSize;
		}
		
		proto.location = function(){
			if(this._cl_accordion)
				return (this._cl_accordion.direction() === im.UIAccordionPanel.HORIZONTAL ? this.x() : this.y());
			else
				return 0;
		}
		
		
		proto.Override.width = function(value){
			if(typeof value !== 'number' || !this._cl_accordion || this._cl_accordion.direction() == a5.cl.ui.UIAccordionView.VERTICAL)
				return proto.superclass().width.call(this, value);
			else
				this._cl_expandedSize = value;
		}
		
		proto.Override.height = function(value){
			if(typeof value !== 'number' || !this._cl_accordion || this._cl_accordion.direction() == a5.cl.ui.UIAccordionView.HORIZONTAL)
				return proto.superclass().height.call(this, value);
			else
				this._cl_expandedSize = value;
		}
});


/**
 * @class A view that can only be added to UIContainer.  It will fill up any empty space not occupied by a non-UIFlexSpace view.  If multiple UIFlexSpaces are added to a UIControl, the remaining space will be divided evenly among them.
 * @name a5.cl.ui.UIFlexSpace
 * @description If the UIContainer is relX, the width of this view will be adjusted to fill any remaining space.  Likewise for height if the UIContainer is relY.  Whichever dimension is not relative will always be 100%.
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIControl')
	.Prototype('UIFlexSpace', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.ui.UIFlexSpace#
	 	 * @function
		 */
		
		proto.UIFlexSpace = function(){
			proto.superclass(this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			proto.superclass().width.call(this, '100%');
			proto.superclass().height.call(this, '100%');
		}
		
		proto.Override.addedToParent = function(parentView){
			if(parentView instanceof a5.cl.ui.UIContainer)
				proto.superclass().addedToParent.apply(this, arguments);
			else
				this.redirect(500, 'Error: UIFlexSpace can only be added to a UIContainer view.');
		}
		
		/**
		 * The width of a UIFlexSpace cannot be set.  If its UIContainer is relX, the width will be calculated on the fly, otherwise it will always be 100%.
		 * @name width 
		 */
		proto.Override.width = function(value){
			if(value === undefined || value === 'scroll' || value === 'inner' || value === 'client' || value === 'value')
				return proto.superclass().width.apply(this, arguments);
			else
				return this;
		}
		
		/**
		 * The height of a UIFlexSpace cannot be set.  If its UIContainer is relY, the height will be calculated on the fly, otherwise it will always be 100%.
		 * @name height 
		 */
		proto.Override.height = function(value){
			if(value === undefined || value === 'scroll' || value === 'inner' || value === 'client' || value === 'value')
				return proto.superclass().height.apply(this, arguments);
			else
				return this;
		}
	});


/**
 * @class Container for UIControls.  Allows for flexible spaces.  Either relX or relY must be true, so setting one will automatically toggle the other.
 * @name a5.cl.ui.UIContainer
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.CLViewContainer')
	.Extends('UIControl')
	.Prototype('UIContainer', function(proto, im){
		
		proto.UIContainer = function(){
			proto.superclass(this);
			this.relX(true);
			this.constrainChildren(false);
		}
		
		proto.Override.constrainChildren = function(){}
		
		proto.Override.relX = function(value){
			if(typeof value === 'boolean')
				proto.superclass().relY.call(this, !value);
			return proto.superclass().relX.call(this, value);
		}
		
		proto.Override.relY = function(value){
			if(typeof value === 'boolean')
				proto.superclass().relX.call(this, !value);
			return proto.superclass().relY.call(this, value);
		}
		
		proto.Override._cl_redraw = function(force, suppressRender){
			var returnVals = proto.superclass()._cl_redraw.call(this, force, true);
			if(returnVals.shouldRedraw){
				//if there are any UFlexSpaces, adjust their size
				var flexSpaces = [],
					relDimension = this._cl_relX ? 'width' : 'height',
					freeSpace = this['_cl_' + relDimension].inner,
					flexSize, x, y;
				//determine the amount of free space
				for(x = 0, y = this.subViewCount(); x < y; x++){
					var thisView = this.subViewAtIndex(x);
					if (thisView instanceof im.UIFlexSpace)
						flexSpaces.push(thisView)
					else
						freeSpace -= thisView['_cl_' + relDimension].offset;
					freeSpace -= thisView[this._cl_relX ? 'x' : 'y']();
				}
				if(flexSpaces.length > 0) {
					//set the sizes of the flex spaces
					flexSize = freeSpace > 0 ? (freeSpace / flexSpaces.length) : 0;
					for (x = 0, y = flexSpaces.length; x < y; x++) {
						im.CLViewContainer.prototype[relDimension].call(flexSpaces[x], flexSize);
						im.CLViewContainer.prototype[relDimension === 'width' ? 'height' : 'width'].call(flexSpaces[x], '100%');
					}
					//redraw again
					proto.superclass()._cl_redraw.call(this, true, suppressRender);
				} else if(suppressRender !== true) {
					this._cl_render();
				}
			}
			return returnVals;
		}
	});


a5.Package('a5.cl.ui')
	.Import('a5.cl.*', 
			'a5.cl.ui.interfaces.ITabView')
	.Extends('UIControl')
	.Implements('ITabView')
	.Prototype('UIDefaultTabView', function(proto, im){
		
		proto.UIDefaultTabView = function(){
			proto.superclass(this);
			this._cl_staticWidth = false;
			this._cl_backgroundView = this.create(im.CLView);
			this._cl_backgroundView.border(1, 'solid', '#c8c6c4').backgroundColor('#e6e4e3');
			this._cl_labelView = this.create(im.UITextField);
			this._cl_labelView.alignY('middle');
			this._cl_labelView.textAlign('center');
			
			this.usePointer(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_backgroundView);
			this.addSubView(this._cl_labelView);
		}
		
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_labelView.text(value);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.activated = function(){
			this._cl_backgroundView.alpha(1);
		}
		
		proto.deactivated = function(){
			this._cl_backgroundView.alpha(0.5);
		}
		
		proto.staticWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_staticWidth = value;
				return this;
			}
			return this._cl_staticWidth;
		}
		
		proto.Override.clickEnabled = function(){
			proto.superclass().clickEnabled.apply(this, arguments);
		}
		
	});



/**
 * @class 
 * @name a5.cl.ui.UISplitViewController
 * @extends a5.cl.ui.UIController
 */
a5.Package('a5.cl.ui.controllers')

	.Import('a5.cl.ui.*')
	
	.Extends('UIController')
	.Prototype('UISplitViewController', function(proto, im){
		
		proto.UISplitViewController = function(){
			this._cl_menuView;
			this._cl_contentView;
			this._cl_menuView = this.create(im.UIResizable);
			this._cl_contentView = this.create(a5.cl.CLViewContainer);
			this._cl_menuView.width(300).minWidth(150).maxWidth(500).border(1);
			this._cl_contentView.border(1);
			proto.superclass(this, arguments);
		}
		
		proto.Override.viewReady = function(){
			this.view().relX(true);
			this.view().constrainChildren(true);
			this.view().addSubView(this._cl_menuView);
			this.view().addSubView(this._cl_contentView);
			
			var self = this;
			
			//check for a menuView or contentView added via ViewDef
			var menuView = this.view().getChildView('menuView'),
				contentView = this.view().getChildView('contentView');
			//if either was found, move them into the proper parent view
			if(menuView)
				this._cl_menuView.addSubView(menuView);
			if(contentView)
				this._cl_contentView.addSubView(contentView);
			//remove all other extraneous child views
			var viewsToRemove = [];
			for(var x = 0, y = this.view().subViewCount(); x < y; x++){
				var thisView = this.view().subViewAtIndex(x);
				if(thisView !== this._cl_contentView && thisView !== this._cl_menuView)
					viewsToRemove.push(thisView);
			}
			for(x = 0, y = viewsToRemove.length; x < y; x++){
				this.view().removeSubView(viewsToRemove[x]);
			}
			viewsToRemove = null;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.menuView = function(){
			return this._cl_menuView;
		}
});



/**
 * @class 
 * @name a5.cl.ui.UITabViewController
 * @extends a5.cl.ui.UIController
 */
a5.Package('a5.cl.ui.controllers')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.UIMouseEvent',
			'a5.cl.*')
	.Extends('UIController')
	.Static(function(UITabViewController){
		UITabViewController.customViewDefNodes = ['Tab'];
	})
	.Prototype('UITabViewController', function(proto, im){
		
		this.Properties(function(){
			this._cl_tabBarView = null;
			this._cl_tabBarBG = null;
			this._cl_tabBarWrapper = null;
			this._cl_contentView = null;
			this._cl_tabs = [];
			this._cl_tabViewClass = im.UIDefaultTabView;
			this._cl_activeTab = -1;
			this._cl_tabBarLocation = 'top';
			this._cl_pendingTabs = 0;
		})
		
		proto.UITabViewController = function(){
			this._cl_tabBarView = this.create(im.CLViewContainer);
			this._cl_tabBarBG = this.create(im.CLViewContainer);
			this._cl_tabBarWrapper = this.create(im.CLViewContainer);
			this._cl_contentView = this.create(a5.cl.ui.UIFlexSpace);
			
			this._cl_tabBarWrapper.height(25);
			this._cl_tabBarView.relX(true);
			this._cl_contentView.height('-25');
			proto.superclass(this, [this.create(a5.cl.ui.UIContainer)]);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.view().relY(true);
			this._cl_tabBarWrapper.addSubView(this._cl_tabBarBG);
			this._cl_tabBarWrapper.addSubView(this._cl_tabBarView);
			this.view().addSubView(this._cl_tabBarWrapper);
			this.view().addSubView(this._cl_contentView);
			/*
			var self = this;
			this.view().childrenReady = function(initial){
				//Check for views that were added by a view definition, and create tabs for them
				var viewsToMove = [];
				for(var x = 0, y = this.subViewCount(); x < y; x++){
					var thisView = this.subViewAtIndex(x);
					if (thisView !== self._cl_tabBarWrapper && thisView !== self._cl_contentView) {
						viewsToMove.push(thisView);
					}
				}
				for(var x = 0, y = viewsToMove.length; x < y; x++){
					self.addTab(viewsToMove[x]);
				}
				
				self.tabsReady(initial);
			}
			
			//override removeSubView on contentView to allow the ViewDefParser to manipulate the tabs
			this._cl_contentView.removeSubView = function(view){
				self.removeTab(view);
			}
			*/
		}
		
		proto.Override._cl_viewReady = function(){
			//TODO: This may not be the most reliable way to listen for the tabs to be added.  This should be extensively tested.
			if(this._cl_viewReadyPending)
				proto.superclass()._cl_viewReady.call(this);
			else if(this._cl_pendingTabs <= 0 && this._cl_view._cl_pendingChildren <= 0)
				this.tabsReady();
		}
		
		proto.tabsReady = function(){
			
		}
		
		proto._cl_eTabClickHandler = function(e){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.tabView === e.target())
					return this.activateTabAtIndex(x);
			}
		}
		
		/**
		 * Appends a tab.
		 * 
		 * @param {a5.cl.CLView} contentView The view to display when this tab is activated.
		 * @param {String} [tabLabel] The label for this tab. Defaults to the 'tabLabel' property on the contentView, or the string "Tab #", where # is the current number of tabs.
		 * @param {a5.cl.ui.interfaces.ITabView} [tabView] A view instance to use as the tab. (must implement ITabView). Defaults to a new instance of of this.tabViewClass().
		 */
		proto.addTab = function(contentView, tabLabel, tabView){
			this.addTabAtIndex(contentView, this.tabCount(), tabLabel, tabView);
		}
		
		/**
		 * Appends a tab at the specified index.
		 * 
		 * @param {a5.cl.CLView} contentView contentView The view to display when this tab is activated.
		 * @param {Number} index The index at which to place this tab.
		 * @param {String} [tabLabel] The label for this tab. Defaults to the 'tabLabel' property on the contentView, or the string "Tab #", where # is the current number of tabs.
		 * @param {a5.cl.ui.interfaces.ITabView} [tabView] A view instance to use as the tab. (must implement ITabView). Defaults to a new instance of of this.tabViewClass().
		 */
		proto.addTabAtIndex = this.Attributes(
		["a5.Contract", { contentView:'a5.cl.CLView', index:'number', tabLabel:'string=""', tabView:'a5.cl.ui.interfaces.ITabView=null'}], 
		function(args){	
			if(args){
				//create or get the tab
				var newTab = args.tabView || this.create(this._cl_tabViewClass);
				//keep a reference to the views
				this._cl_tabs.splice(args.index, 0, {
					tabView: newTab,
					contentView: args.contentView
				});
				//set up the tab
				newTab.label(args.tabLabel || (typeof args.contentView.tabLabel === 'string' ? args.contentView.tabLabel : ('Tab ' + this._cl_tabs.length)));
				if (newTab.staticWidth()) {
					newTab.width(newTab.staticWidth());
				} else {
					//divide the tabs evenly across the width of the tabBarView
					for(var x = 0, y = this._cl_tabs.length; x < y; x++){
						var thisTab = this._cl_tabs[x].tabView;
						thisTab.width((100 / this._cl_tabs.length) + '%');
					}
				}
				newTab.deactivated();
				newTab.clickEnabled(true);
				newTab.usePointer(true);
				newTab.addEventListener(im.UIMouseEvent.CLICK, this._cl_eTabClickHandler, false, this);
				this._cl_tabBarView.addSubViewAtIndex(newTab, args.index);
				//add the content view
				args.contentView.visible(false);
				this._cl_contentView.addSubViewAtIndex(args.contentView, args.index);
				//if no tab is active, activate this one
				if(this._cl_activeTab === -1)
					this.activateTabAtIndex(0);
			}
		})
		
		/**
		 * Removes the tab with the specified view as its content.
		 * 
		 * @param {a5.cl.CLView} contentView The content view of the tab to remove.
		 */
		proto.removeTab = function(contentView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.contentView === contentView)
					return this.removeTabAtIndex(x);
			}
			return null;
		}
		
		/**
		 * Removes the tab at the specified index
		 * 
		 * @param {Number} index The index of the tab to remove.
		 * @param {Boolean} destroy Whether the views should be destroyed once they're removed. Defaults to true.
		 * @return {Object} Returns an object with a tabView property, and a contentView property.
		 */
		proto.removeTabAtIndex = function(index, destroy){
			if(this._cl_activeTab === index)
				this._cl_activeTab = -1;
			var dyingTab = this._cl_tabs.splice(index, 1)[0];
			dyingTab.tabView.removeEventListener(im.UIMouseEvent.CLICK, this._cl_eTabClickHandler);
			this._cl_contentView.removeSubView(dyingTab.contentView, destroy !== false);
			this._cl_tabBarView.removeSubView(dyingTab.tabView, destroy !== false);
			return destroy === false ? dyingTab : null;
		}
		
		/**
		 * Activate the tab with the specified content view.
		 * 
		 * @param {a5.cl.CLView} contentView The content view of the tab to activate.
		 * @return {a5.cl.CLView} Returns the contentView of the tab that is active after executing this method. If this doesn't match the view that was passed in, then no corresponding tab was found for that view.
		 */
		proto.activateTab = function(contentView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.contentView === contentView)
					return this.activateTabAtIndex(x);
			}
		}
		
		/**
		 * Activate the tab at the specified index.
		 * 
		 * @param {Number} index The index of the tab to activate.
		 * @return {a5.cl.CLView} Returns the contentView of the tab that was selected, or null if an invalid index was specified.
		 */
		proto.activateTabAtIndex = function(index){
			if(index < 0 || index >= this._cl_tabs.length) return null;
			
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				var isActive = x === index;
				thisTab.contentView.visible(isActive);
				thisTab.contentView.suspendRedraws(!isActive);
				if (isActive) {
					thisTab.tabView.activated();
					this._cl_activeTab = x;
				} else {
					thisTab.tabView.deactivated();
				}
			}
			this.view().redraw();
			return this._cl_tabs[this._cl_activeTab].contentView;
		}
		
		/**
		 * Gets a reference to the tab at the specified index.
		 * 
		 * @param {Number} index The index of the tab to retrieve.
		 * @param {Boolean=false} [getTabView] If true, the tabView and the contentView are returned.  Otherwise, just the contentView is returned.
		 * @return {a5.cl.CLView|Object} If getTabView is true, an object with contentView and tabView properties is returned, otherwise the contentView instance is returned.
		 */
		proto.getTabAtIndex = function(index, getTabView){
			if(index < 0 || index >= this._cl_tabs.length) return null;
			return getTabView === true ? this._cl_tabs[index].tabView : this._cl_tabs[index].contentView;
		}
		
		proto.getTabByLabel = function(label, getTabView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.tabView.label() === label)
					return getTabView === true ? thisTab.tabView : thisTab.contentView;
			}
			return null;
		}
		
		/**
		 * The location of the tab bar.  Acceptable values are 'top' and 'bottom'. The default is 'top'.
		 * 
		 * @param {String} [value] Where to place the tab bar ('top' or 'bottom').
		 * @return {String|a5.cl.ui.controllers.UITabViewController} Returns the current value of tabBarLocation if no value is specified.  Otherwise, returns this instance to allow chaining.
		 */
		proto.tabBarLocation = function(value){
			if(typeof value === 'string'){
				if((value === 'top' || value === 'bottom') && value !== this._cl_tabBarLocation){
					if(value === 'bottom')
						this._cl_tabBarWrapper.toTop();
					else
						this._cl_tabBarWrapper.toBottom();
				}
				return this;
			}
			return this._cl_tabBarLocation;
		}
		
		/**
		 * The height of the tab bar.
		 * 
		 * @param {Number|String} [value] The value to set the height of the tab bar to.
		 */
		proto.tabBarHeight = function(value){
			if(typeof value === 'number' || typeof value === 'string'){
				this._cl_tabBarWrapper.height(value);
				return this;
			}
			return this._cl_tabBarWrapper.height();
		}
		
		/**
		 * Returns the contentView of the currently active tab, or null if no tab is currently active.
		 */
		proto.activeContentView = function(){
			return this._cl_activeTab >= 0 ? this._cl_tabs[this._cl_activeTab].contentView : null;
		}
		
		/**
		 * Returns the total number of tabs.
		 */
		proto.tabCount = function(){
			return this._cl_tabs.length;
		}
		
		/**
		 * Returns the view which holds the content views.
		 */
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		/**
		 * Returns the view which holds the tab views.
		 */
		proto.tabBar = function(){
			return this._cl_tabBarWrapper;
		}
		
		proto.tabBarBG = function(){
			return this._cl_tabBarBG;
		}
		
		/**
		 * The class to use when creating new tab views.  This class must implement ITabView.  The default is UIDefaultTabView.
		 * @param {function} [value] The class to use when creating new tab views.
		 */
		proto.tabViewClass = function(value){
			if(typeof value === 'function'){
				this._cl_tabViewClass = value;
				return this;
			}
			return this._cl_tabViewClass;
		}
		
		/**
		 * Shortcut to this.contentView().scrollXEnabled().
		 */
		proto.scrollXEnabled = function(){
			this._cl_contentView.scrollXEnabled.apply(this._cl_contentView, arguments);
		}
		
		/**
		 * Shortcut to this.contentView().scrollYEnabled().
		 */
		proto.scrollYEnabled = function(){
			this._cl_contentView.scrollYEnabled.apply(this._cl_contentView, arguments);
		}
		
		/**
		 * @private
		 */
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			if(nodeName === 'Tab'){
				var children = a5.cl.mvc.core.XMLUtils.children(node.node);
				if(children.length > 0) {
					var builder = this.create(a5.cl.core.viewDef.ViewBuilder, [this, children[0], defaults, imports, rootView]),
						targetIndex = this.tabCount();
					this._cl_pendingTabs++;
					builder.build(function(view){
						this.addTabAtIndex(view, targetIndex, node.label);
						this._cl_pendingTabs--;
						this._cl_viewReady();
					}, null, this);
				}
			} else
				proto.superclass().processCustomViewDefNode.apply(this, arguments);
		}
});



a5.Package('a5.cl.ui.form')
	.Static('UIValidationStates', function(UIValidationStates){
		
		UIValidationStates.TOO_LONG = "Value exceeds the maximum length.";
		UIValidationStates.TOO_SHORT = "Value does not meet the minimum length requirement.";
		UIValidationStates.PATTERN_MISMATCH = "Value does not match the specified pattern.";
		UIValidationStates.REQUIRED = "This field is required.";
});



a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.mixins.UIGroupable',
			'a5.cl.core.Utils')
	.Extends('a5.EventDispatcher')
	.Prototype('UIOptionGroup', function(proto, im, UIOptionGroup){
		
		UIOptionGroup._ui_instanceRef = [];
		
		UIOptionGroup._ui_addRef = function(inst){
			UIOptionGroup._ui_instanceRef.push(inst);
		}
		
		UIOptionGroup._ui_removeRef = function(inst){
			for(var i = 0, i = UIOptionGroup._ui_instanceRef.length; i<l; i++){
				if(UIOptionGroup._ui_instanceRef[i] === inst){
					UIOptionGroup._ui_instanceRef.splice(i, 1);
					return;
				}
			}
		}
		
		UIOptionGroup.getGroupByName = function(groupName){
			for(var x = 0, y = UIOptionGroup._ui_instanceRef.length; x < y; x++){
				var thisRef = UIOptionGroup._ui_instanceRef[x];
				if(thisRef.groupName() === groupName)
					return thisRef;
			}
			return a5.Create(UIOptionGroup, [groupName]);
		}
		
		this.Properties(function(){
			this._cl_groupName = null;
			this._cl_name = null;
			this._cl_options = [];
			this._cl_selectedOption = null;
			this._cl_required = false;
			this._cl_allowMultiple = false;
		});
		
		proto.UIOptionGroup = function($groupName){
			proto.superclass(this);
			UIOptionGroup._ui_addRef(this);
			this._cl_groupName = $groupName || this.instanceUID();
		}
		
		proto.allowMultiple = function(value){
			if(typeof value === 'boolean'){
				this._cl_allowMultiple = value;
				if(value)
					this._cl_selectedOption = this._cl_selectedOption ? [this._cl_selectedOption] : [];
				else
					this._cl_selectedOption = this._cl_selectedOption.length > 0 ? this._cl_selectedOption[0] : null;
				return this;
			}
			return this._cl_allowMultiple;
		}
		
		proto.groupName = function(){
			return this._cl_groupName;
		}
		
		proto.addOption = function(option){
			var wasAdded = this._cl_addOption(option);
			if(wasAdded)
				option.optionGroup(this);
		}
		
		proto._cl_addOption = function(option){
			if(!this.hasOption(option)){
				this._cl_options.push(option);
				option.addEventListener(im.UIEvent.CHANGE, this._cl_eOptionChangedHandler, false, this);
				if(option.selected())
					this._cl_selectOption(option);
				return true;
			}
			return false;
		}
		
		proto.removeOption = function(option){
			var wasRemoved = this._cl_removeOption(option);
			if(wasRemoved)
				option.optionGroup(null);
		}
		
		proto._cl_removeOption = function(option){
			var optionIndex = a5.cl.core.Utils.arrayIndexOf(this._cl_options, option);
			if (optionIndex > -1) {
				var removed = this._cl_options.splice(optionIndex, 1);
				removed[0].removeEventListener(im.UIEvent.CHANGE, this._cl_eOptionChangedHandler);
				return true;
			}
			return false;
		}
		
		proto.hasOption = function(option){
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				if(this._cl_options[x] === option)
					return true;
			}
			return false;
		}
		
		proto.selectedOption = function(value){
			if(value !== undefined){
				if(this.hasOption(value) || value === null || value === false)
					this._cl_selectOption(value);
				return this;
			}
			return this._cl_selectedOption;
		}
		
		proto.optionAtIndex = function(index){
			if(typeof index === 'number')
				return this._cl_options[index];
			return null;
		}
		
		proto.optionCount = function(){
			return this._cl_options.length;
		}
		
		proto.name = function(value){
			if(typeof value === 'string'){
				this._cl_name = value;
				return this;
			}
			return this._cl_name || this._cl_groupName;
		}
		
		proto.value = function(){
			var selOpt = this.selectedOption();
			if(this._cl_allowMultiple){
				var values = [],
					x, y, thisOption, thisValue;
				for(x = 0, y = selOpt.length; x < y; x++){
					thisOption = selOpt[x];
					thisValue = thisOption.value();
					values.push(thisValue === undefined || thisValue === null ? thisOption.name() : thisValue);
				}
				return values;
			}
			return selOpt ? (selOpt.value() || selOpt.name()) : null;
		}
		
		proto.required = function(value){
			if(typeof value === 'boolean'){
				this._cl_required = value;
				return this;
			}
			return this._cl_required;
		}
		
		proto._cl_eOptionChangedHandler = function(e){
			var target = e.target();
			if (target.doesMix(im.UIGroupable)) {
				if(target.selected())
					target.optionGroup()._cl_selectOption(target);
				else if(this._cl_allowMultiple)
					target.optionGroup()._cl_deselectOption(target);
			}
		}
		
		proto._cl_selectOption = function(option){
			if (this._cl_allowMultiple) {
				if (!im.Utils.arrayContains(this._cl_selectedOption, option)) {
					this._cl_selectedOption.push(option);
					this.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.CHANGE]));
				}
			} else {
				var prevSelection = this._cl_selectedOption;
				this._cl_selectedOption = null;
				for (var x = 0, y = this._cl_options.length; x < y; x++) {
					var thisOption = this._cl_options[x], selected = thisOption === option
					if (selected) 
						this._cl_selectedOption = thisOption;
					thisOption.selected(selected);
				}
				if (this._cl_selectedOption !== prevSelection) 
					this.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.CHANGE]));
			}
		}
		
		proto._cl_deselectOption = function(option){
			if(this._cl_allowMultiple){
				var idx = im.Utils.arrayIndexOf(this._cl_selectedOption, option);
				if(idx >= 0){
					this._cl_selectedOption.splice(idx, 1);
					this.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.CHANGE]));
				}
			}
		}
		
		proto.dealloc = function(){
			UIOptionGroup._ui_removeRef(this);
		}
		
});


/**
 * @class Base class for all form elements.
 * @name a5.cl.ui.form.UIFormElement
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.UIHTMLControl',
			'a5.cl.ui.UITextField',
			'a5.cl.core.Utils',
			'a5.cl.ui.events.UIEvent')
	.Extends('a5.cl.ui.UIControl')
	.Prototype('UIFormElement', 'abstract', function(proto, im, UIFormElement){
		
		UIFormElement.customViewDefNodes = ['Label', 'Input'];
			
		this.Properties(function(){
			this._cl_element = null;
			this._cl_inputView = this.create(im.UIHTMLControl).height('auto').width('100%').clickHandlingEnabled(false);
			this._cl_labelView = this.create(im.UITextField);
			this._cl_labelViewAdded = false;
			this._cl_required = false;
			this._cl_validation = null;
			this._cl_validateOnChange = false;
			this._cl_validateOnBlur = false;
			this._cl_value = null;
			this._cl_form = null;
			this._cl_changeEvent = this.create(im.UIEvent, [im.UIEvent.CHANGE]).shouldRetain(true);
			this._cl_validationStates = [];
			this._cl_errorColor = null;
			this._cl_defaultColor = null;
		});
		
		proto.UIFormElement = function(){
			proto.superclass(this);
			
			this.addSubView(this._cl_inputView);
			this.addEventListener(im.UIEvent.CHANGE, this._cl_eChangeEventHandler, false, this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this._cl_labelView.isLabelFor(this);
		}
		
		proto.name = function(value){
			if(typeof value === 'string'){
				this._cl_name = value;
				return this;
			}
			return this._cl_name || this.id().replace(/[^a-z0-9_]/gi, '');
		}
		
		proto.value = function(value){
			if(value !== undefined){
				this._cl_value = value;
				return this;
			}
			return this._cl_value;
		}
		
		proto.reset = function(){
			this.value("");
			this.validityChanged(true);
		}
		
		proto.form = function(){
			return this._cl_form;
		}
		
		/**
		 * Gets or sets the validation method, or RegExp to use when validating this field.
		 * @name validation
		 * @param value {String|RegExp|Function} The validation method, or RegExp which determines if the field has valid data.
		 */
		proto.validation = function(value){
			if(typeof value === 'string')
				value = new RegExp(value);
			if(value instanceof RegExp || typeof value === 'function'){
				this._cl_validation = value;
				return this;
			}
			return this._cl_validation;
		}
		
		proto.validateOnChange = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnChange = value;
				return this;
			}
			return this._cl_validateOnChange;
		}
		
		proto.validateOnBlur = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnBlur = value;
				return this;
			}
			return this._cl_validateOnBlur;
		}
		
		proto.required = function(value){
			if(typeof value === 'boolean'){
				this._cl_required = value;
				return this;
			}
			return this._cl_required;
		}
		
		proto.validate = function(){
			this._cl_validationStates = [];
			var isValid = this._cl_validate();
			if(this.required() && !this._cl_validateRequired())
				isValid = false;
			this.validityChanged(isValid);
			return isValid;
		}
		
		proto._cl_validate = function(){
			var isValid = true;
			if(this._cl_validation instanceof RegExp)
				isValid = this._cl_validation.test(this.value());
			else if(typeof this._cl_validation === 'function')
				isValid = this._cl_validation.call(this, this.value());
			if(!isValid)
				this.addValidationState(im.UIValidationStates.PATTERN_MISMATCH);
			return isValid;
		}
		
		proto._cl_validateRequired = function(){
			return true;
		}
		
		proto.validityChanged = function(isValid){
			if(this._cl_labelView)
				this._cl_labelView.textColor(isValid ? '#000' : '#f00');
		}
		
		proto.validationStates = function(){
			return this._cl_validationStates.slice(0);
		}
		
		proto.addValidationState = function(state){
			this._cl_validationStates.push(state);
		}
		
		proto._cl_eChangeEventHandler = function(e){
			if(this._cl_validateOnChange)
				this.validate();
		}
		
		proto._cl_addFocusEvents = function(elem){
			var self = this;
			im.Utils.addEventListener(elem, 'focus', function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.FOCUS, e]));
			});
			im.Utils.addEventListener(elem, 'blur', function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.BLUR, e]));
				if(self._cl_validateOnBlur)
					self.validate();
			});
		}
		
		/**
		 * Sets the label for this form element.  Can either be a string, in which case a new UITextField is created and placed within this form element.  Or a UITextField, in which case the isLabelFor() method will be called, passing this form element.
		 * 
		 * @param {a5.cl.ui.UITextField|String} value Either a string to be shown as the label, or a UITextField element that should act as the label for this form element.
		 * @param {Boolean} [labelAfterInput=false] If true, the label will be added after the input, so it will appear to the right or below the input when relX or relY is set to true.  By default, the label will be added before the input.
		 * @return {String} The text value of the UITextField acting as the label for this form element.  Or null if none was specified.
		 */
		proto.label = function(value, labelAfterInput, nonBreaking){
			if (typeof value !== 'undefined') {
				if (typeof value === 'string') {
					//if a string was passed, and the label hasn't been added, do so now
					if (!this._cl_labelViewAdded) {
						if (labelAfterInput === true) 
							this.addSubView(this._cl_labelView);
						else
							this.addSubViewBelow(this._cl_labelView, this._cl_inputView);
					}
					//update the text
					this._cl_labelView.nonBreaking(nonBreaking !== false).text(value);
				} else if (value instanceof im.UITextField) {
					//if a UITextField was passed, make it a label for this item
					this._cl_labelView = value
						.isLabelFor(this)
						.nonBreaking(nonBreaking !== false);
				}
				this._cl_labelViewAdded = true;
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.text() : '';
		}
		
		/**
		 * @return {a5.cl.CLViewContainer} The CLViewContainer which contains the actual form element.  The form element is nested within this view so that a label can be grouped with it.
		 */
		proto.inputView = function(){ return this._cl_inputView; }
		
		/**
		 * @return {a5.cl.ui.UITextField} The UIInputField which is acting as the label for this form element (if there is one).
		 */
		proto.labelView = function(){ return this._cl_labelView; }
		
		proto.element = function(){
			return this._cl_element;
		}
		
		
		
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.inputViewWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_inputView.width(value);
				return this;
			}
			return this._cl_inputView.width();
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.inputViewHeight = function(value){
			if(typeof value !== 'undefined'){
				this._cl_inputView.height(value);
				return this;
			}
			return this._cl_inputView.height();
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.labelViewWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_labelViewWidth = value;
				if(this._cl_labelView)
					this._cl_labelView.width(value);
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.width() : this._cl_labelViewWidth;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.labelViewHeight = function(value){
			if(typeof value !== 'undefined'){
				this._cl_labelViewHeight = value;
				if(this._cl_labelView)
					this._cl_labelView.height(value);
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.height() : this._cl_labelViewHeight;
		}
		
		proto.labelTextColor = function(value){
			return this._cl_labelView.textColor(value);
		}
		
		proto.labelTextAlign = function(value){
			return this._cl_labelView.textAlign(value);
		}
		
		proto.labelTextDecoration = function(value){
			return this._cl_labelView.textDecoration(value);
		}
		
		proto.labelFontSize = function(value){
			return this._cl_labelView.fontSize(value);
		}
		
		proto.labelFontWeight = function(value){
			return this._cl_labelView.fontWeight(value);
		}
		
		proto.labelFontStyle = function(value){
			return this._cl_labelView.fontStyle(value);
		}
		
		proto.labelBold = function(value){
			return this._cl_labelView.bold(value);
		}
		
		proto.labelItalic = function(value){
			return this._cl_labelView.italic(value);
		}
		
		proto.labelUnderline = function(value){
			return this._cl_labelView.underline(value);
		}
		
		
		proto.focus = function(){
			this.element().focus();
		}
		
		proto.blur = function(){
			this.element().blur();
		}
		
		/*proto.width = function(value){
			var returnVal = proto.superclass().width.call(this, value);
			if(value === 'scroll' || value === 'content'){
				var inputWidth = this._cl_inputView.width(this._cl_inputView._cl_width.auto ? 'scroll' : undefined) + this._cl_inputView.x(true),
					labelWidth = this._cl_labelView ? (this._cl_labelView.width(this._cl_labelView._cl_width.auto ? 'scroll' : undefined) + this._cl_labelView.x(true)) : 0;
				return Math.max(inputWidth, labelWidth) + this._cl_calculatedOffset.width + this._cl_calculatedClientOffset.width;
			}
			return returnVal;
		}
		
		proto.height = function(value){
			var returnVal = proto.superclass().height.call(this, value);
			if(value === 'scroll' || value === 'content'){
				var inputHeight = this._cl_inputView.height(this._cl_inputView._cl_height.auto ? 'scroll' : undefined) + this._cl_inputView.y(true),
					labelHeight = this._cl_labelView ? (this._cl_labelView.height(this._cl_labelView._cl_height.auto ? 'scroll' : undefined) + this._cl_labelView.y(true)) : 0;
				return Math.max(inputHeight, labelHeight) + this._cl_calculatedOffset.height + this._cl_calculatedClientOffset.height;
			}
			return returnVal;
		}*/
		
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			proto.superclass().processCustomViewDefNode.apply(this, arguments);
			switch(nodeName){
				case 'Label':
				case 'Input':
					var builder = this.create(a5.cl.core.viewDef.ViewBuilder, [this._cl_controller, node.node, defaults, imports, rootView]);
					builder.build(null, null, null, nodeName === 'Label' ? this._cl_labelView : this._cl_inputView);
					break;
			}
		}
		
		proto.dealloc = function(){
			this._cl_changeEvent.cancel();
			this._cl_changeEvent.destroy();
		}
	
});


/**
 * @class 
 * @name a5.cl.ui.form.UIInputField
 * @extends a5.cl.ui.form.UIFormElement
 */
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.events.*',
			'a5.cl.core.Utils',
			'a5.cl.ui.core.Keyboard',
			'a5.cl.ui.core.UIUtils',
			'a5.cl.ui.modals.UIInputHistoryList')
	.Extends('UIFormElement')
	.Mix('a5.cl.ui.mixins.UIKeyboardEventDispatcher')
	.Prototype('UIInputField', function(proto, im){
		
		this.Properties(function(){
			this._cl_element = null;
			this._cl_multiline = false;
			this._cl_defaultValue = '';
			this._cl_textColor = '#000';
			this._cl_defaultTextColor = '#666';
			this._cl_password = false;
			this._cl_imitateLabel = false;
			this._cl_historyEnabled = false;
			this._cl_dataStore = null;
			this._cl_history = null;
			this._cl_userEnteredValue = "";
			this._cl_historyInsertedValue = "";
			this._cl_minLength = 0;
			this._cl_maxLength = Infinity;
			this._cl_textAlign = 'left';
		})
		
		proto.UIInputField = function(text){
			proto.superclass(this);
			this.multiline(false, true); //creates the input element
			
			this._cl_dataStore = this.create(a5.cl.ui.form.InputFieldDataStore);
			
			this.inputView().border(1, 'solid', '#C8C6C4').backgroundColor('#fff');
			this.height('auto').relX(true);
			if(typeof text === 'string') this.value(text);
			
			this.addEventListener(im.UIEvent.FOCUS, this._cl_eFocusHandler, false, this);
			this.addEventListener(im.UIEvent.BLUR, this._cl_eBlurHandler, false, this);
			this.cl().addEventListener(a5.cl.CLEvent.APPLICATION_WILL_CLOSE, this._cl_persistHistory, false, this);
			
			this.addEventListener(im.UIKeyboardEvent.KEY_UP, this._cl_eKeyUpHandler, false, this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			//add the input element to the html view
			this.inputView().htmlWrapper().appendChild(this._cl_element);
			var self = this;
			this._cl_element.onchange = function(){
				self.dispatchEvent(self._cl_changeEvent);
			}
		}
		
		proto.Override.id = function(value){
			if (typeof value === 'string')
				this._cl_dataStore.keyPrefix(value);
			return proto.superclass().id.call(this, value);
		}
		
		proto.Override._cl_validate = function(){
			var isValid = true,
				superIsValid = proto.superclass()._cl_validate.call(this),
				value = this.value();
			if (value.length < this._cl_minLength) {
				isValid = false;
				this.addValidationState(im.UIValidationStates.TOO_SHORT);
			} else if (value.length > this._cl_maxLength) {
				isValid = false;
				this.addValidationState(im.UIValidationStates.TOO_LONG);
			}
			return isValid && superIsValid;
		}
		
		proto.Override._cl_validateRequired = function(){
			if(this.value().length === 0 || /^\s$/.test(this.value())){
				this.addValidationState(im.UIValidationStates.REQUIRED);
				return false;
			}
			return true;
		}
		
		proto.minLength = function(value){
			if(typeof value === 'number'){
				this._cl_minLength = value;
				return this;
			}
			return this._cl_minLength;
		}
		
		proto.maxLength = function(value){
			if(typeof value === 'number'){
				this._cl_maxLength = value;
				return this;
			}
			return this._cl_maxLength;
		}
		
		/**
		 * 
		 * @param {String} [value]
		 */
		proto.Override.value = function(value){
			if(value !== undefined){
				value = value + ''; //force to a string
				this._cl_element.value = value;
				this._cl_element.setAttribute('value', value);
				if(this._cl_imitateLabel)
					this.label(value);
				if(value == '' && this._cl_defaultValue)
					this._cl_eBlurHandler();
				return this;
			}
			return this._cl_element.value;
		}
		
		/**
		 * 
		 * @param {String} value
		 */
		proto.defaultValue = function(value){
			if(typeof value === 'string'){
				this._cl_defaultValue = value;
				this._cl_eBlurHandler();
				return this;
			}
			return this._cl_defaultValue;
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 */
		proto.multiline = function(value, force){
			if(typeof value === 'boolean' && (value !== this._cl_multiline || force === true)){
				this._cl_multiline = value;
				var previousValue = this._cl_element ? this._cl_element.value : '';
				this.inputView().clearHTML();
				if(value){
					this._cl_element = document.createElement('textarea');
					this._cl_element.style.resize = 'none';
					this.inputView().height('100%');
				} else {
					this.inputView().clearHTML();
					this._cl_element = document.createElement('input');
					this._cl_element.type = this._cl_password ? 'password' : 'text';
					this.inputView().height(22);
				}
				this._cl_element.id = this.instanceUID() + '_field';
				this._cl_element.style.width = this._cl_element.style.height = '100%';
				this._cl_element.style.padding = this._cl_element.style.margin = '0px';
				this._cl_element.style.border = 'none';
				this._cl_element.style.backgroundColor = 'transparent';
				this._cl_element.style.minHeight = '1em';
				this._cl_element.style.textAlign = this._cl_textAlign;
				this._cl_addFocusEvents(this._cl_element);
				this.keyboardEventTarget(this._cl_element);
				this.inputView().appendChild(this._cl_element);
				this._cl_element.value = previousValue;
				return this;
			}
			return this._cl_multiline;
		}
		
		proto.Override.enabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_enabled = value;
				this._cl_element.readOnly = !value;
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.historyEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_historyEnabled = value;
				this._cl_history = this.getHistory();
				if (value)
					this._cl_element.setAttribute('autocomplete', 'off');
				else
					this._cl_element.removeAttribute('autocomplete');
				return this;
			}
			return this._cl_historyEnabled;
		}
		
		proto.storeValue = function(){
			var value = this.value();
			if(value != '' && this._cl_historyEnabled){
				var idx = im.Utils.arrayIndexOf(this._cl_history, value);
				if(idx > -1)
					this._cl_history.splice(idx, 1);
				this._cl_history.unshift(value);
			}
		}
		
		proto.getHistory = function(filtered){
			if(this._cl_history === null)
				this._cl_history = this._cl_dataStore.getValue('history') || [];
			return filtered === true ? this._cl_filterHistory() : this._cl_history;
		}
		
		proto.clearHistory = function(){
			return this._cl_dataStore.clearValue('history');
		}
		
		proto.imitateLabel = function(value){
			if(typeof value === 'boolean'){
				if(value !== this._cl_imitateLabel){
					if(value){
						this.relX(false).relY(false);
						this.label(this.value());
						this._cl_inputView.visible(false);
						this._cl_labelView.clickEnabled(true)
							.cursor('text')
							.addEventListener(im.UIMouseEvent.CLICK, this._cl_eLabelClickHandler, false, this);
						var self = this
						this.addEventListener(im.UIKeyboardEvent.ENTER_KEY, this._cl_eBlurHandler, false, this)
					} else {
						this._cl_inputView.visible(true);
						if (this._cl_labelView) {
							this._cl_labelView.visible(true)
								.clickEnabled(false)
								.usePointer(false);
							this._cl_labelView.removeEventListener(im.UIMouseEvent.CLICK, this._cl_eLabelClickHandler);
						}
					}
					this._cl_imitateLabel = value;
				}
				return this;
			}
			return this._cl_imitateLabel;
		}
		
		proto.Override.element = function(){
			return this._cl_element;
		}
		
		proto.textColor = function(value){
			if(typeof value !== 'undefined'){
				this._cl_textColor = value;
				if(this._cl_defaultValue)
					this._cl_element.onblur();
				else
					this._cl_element.style.color = value; 
				return this;
			}
			return this._cl_textColor;
		}
		
		proto.textAlign = function(value){
			if(typeof value === 'string'){
				this._cl_textAlign = value;
				this._cl_element.style.textAlign = value;
				return this;
			}
			return this._cl_textAlign;
		}
		
		proto.password = function(value){
			if(typeof value === 'boolean'){
				if(value !== this._cl_password){
					this._cl_password = value;
					this.multiline(this._cl_multiline, true);
				}
				return this;
			}
		}
		
		proto.defaultTextColor = function(value){
			if(typeof value !== 'undefined'){
				this._cl_defaultTextColor = value;
				if(this._cl_defaultValue && this.value() === this._cl_defaultValue)
					this._cl_element.style.color = value; 
				return this;
			}
			return this._cl_defaultTextColor;
		}
		
		proto._cl_eFocusHandler = function(e){
			if (this._cl_defaultValue && this.value() === this._cl_defaultValue) {
				this._cl_element.value = '';
				this._cl_element.style.color = this._cl_textColor;
			}
			if(this._cl_imitateLabel)
				this._cl_eLabelClickHandler();
		}
		
		proto._cl_eBlurHandler = function(e){
			if (this._cl_defaultValue && this.value() === this._cl_defaultValue) {
				this._cl_element.value = '';
				this._cl_element.style.color = this._cl_textColor;
			} else if(this._cl_imitateLabel){
				this.label(this.value());
				this._cl_inputView.visible(false);
				this._cl_labelView.visible(true);
			} else if(this._cl_historyEnabled && im.UIInputHistoryList.isOpen()){
				im.UIInputHistoryList.close();
			}
		}
		
		proto._cl_eLabelClickHandler = function(e){
			this._cl_labelView.visible(false);
			this._cl_inputView.visible(true);
			this.value(this.label());
			this.focus();
		}
		
		proto._cl_eKeyUpHandler = function(e){
			if(im.Keyboard.isVisibleCharacter(e.keyCode()) || e.keyCode() === im.Keyboard.BACKSPACE || e.keyCode() === im.Keyboard.DELETE)
				this.dispatchEvent(this._cl_changeEvent);
			if(this._cl_historyEnabled && this._cl_history.length > 0){
				switch(e.keyCode()){
					case im.Keyboard.DOWN_ARROW:
						if(im.UIInputHistoryList.isOpen())
							im.UIInputHistoryList.nextItem();
						else
							this._cl_openHistoryList();
						break;
					case im.Keyboard.UP_ARROW:
						if(im.UIInputHistoryList.isOpen())
							im.UIInputHistoryList.previousItem();
						break;
					case im.Keyboard.ESCAPE:
						this.value(this._cl_userEnteredValue);
					case im.Keyboard.BACKSPACE:
					case im.Keyboard.DELETE:
						this._cl_userEnteredValue = this.value();
					case im.Keyboard.ENTER:
					case im.Keyboard.TAB:
					case im.Keyboard.RIGHT_ARROW:
						im.UIInputHistoryList.close();
						break;
					default:
						if(im.Keyboard.isVisibleCharacter(e.keyCode())){
							this._cl_userEnteredValue = this.value();
							//if(this._cl_userEnteredValue.substr(this._cl_userEnteredValue.length - this._cl_historyInsertedValue.length) === this._cl_historyInsertedValue)
							//	this._cl_userEnteredValue = this._cl_userEnteredValue.substr(0, this._cl_userEnteredValue.length - this._cl_historyInsertedValue.length);
							if(im.UIInputHistoryList.isOpen())
								im.UIInputHistoryList.update(this.getHistory(true));
							else
								this._cl_openHistoryList();
						}
				}
			}
		}
		
		proto._cl_openHistoryList = function(){
			im.UIInputHistoryList.instance().addEventListener(im.UIEvent.CHANGE, this._cl_eHistoryListChangeHandler, false, this);
			im.UIInputHistoryList.instance().addEventListener(im.UIEvent.CLOSE, this._cl_eHistoryListCloseHandler, false, this);
			im.UIInputHistoryList.open(this);
			var self = this;
			setTimeout(function(){
				var value = self.value();
				im.UIUtils.selectTextRange(value.length, value.length, self._cl_element);
			}, 0);
		}
		
		proto._cl_filterHistory = function(){
			var inputHistory = this.getHistory(),
				value = this.value(),
				filtered = [];
			for(var x = 0, y = inputHistory.length; x < y; x++){
				var thisItem = inputHistory[x];
				if(thisItem.substr(0, value.length) === value)
					filtered.push(thisItem)
			}
			return filtered;
		}
		
		proto._cl_eHistoryListChangeHandler = function(e){
			if(e.target() !== im.UIInputHistoryList.instance())
				return;
			
			var selectedOption = im.UIInputHistoryList.selectedItem();
			this.value(selectedOption);
			
			//this._cl_historyInsertedValue = selectedOption.substr(this._cl_userEnteredValue.length);
			
			// THIS IS A WORKAROUND FOR IE.  IT WON'T SELECT THE TEXT UNLESS WE BREAK OUT INTO ANOTHER THREAD
			var self = this;
			setTimeout(function(){
				//im.UIUtils.selectTextRange(self._cl_userEnteredValue.length, selectedOption.length, self._cl_element);
				im.UIUtils.selectTextRange(selectedOption.length, selectedOption.length, self._cl_element);
			}, 0);
		}
		
		proto._cl_eHistoryListCloseHandler = function(e){
			im.UIInputHistoryList.instance().removeEventListener(im.UIEvent.CHANGE, this._cl_eHistoryListChangeHandler);
			im.UIInputHistoryList.instance().removeEventListener(im.UIEvent.CLOSE, this._cl_eHistoryListCloseHandler);
		}
		
		proto._cl_persistHistory = function(){
			this._cl_dataStore.storeValue('history', this._cl_history);
		}
		
		proto.dealloc = function(){
			this.cl().removeEventListener(a5.cl.CLEvent.APPLICATION_WILL_CLOSE, this._cl_persistHistory);
			if(this._cl_historyEnabled)
				this._cl_persistHistory();
			this._cl_destroyElement(this._cl_element);
			this._cl_element = null;
			this._cl_dataStore.destroy();
		}
	});
	
a5.Package('a5.cl.ui.form').Mix('a5.cl.mixins.DataStore').Class('InputFieldDataStore', function(self){
	self.InputFieldDataStore = function(){}
});


a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.*')
	.Extends('UIFormElement')
	.Mix('a5.cl.ui.mixins.UIGroupable')
	.Prototype('UIOptionButton', function(proto, im){
		proto.UIOptionButton = function(type){
			proto.superclass(this);
			this._cl_value = null;
			this._cl_input = this._cl_createInput((type === 'radio') ? 'radio' : 'checkbox');
			this.height('auto')
				.inputViewWidth(25)
				.labelViewWidth('auto')
				.relX(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this._cl_inputView.htmlWrapper().appendChild(this._cl_input);
		}
		
		proto.type = function(value){
			if ((value === 'radio' || value === 'checkbox') && value !== this._cl_input.type) {
				try {
					this._cl_inputView.htmlWrapper().removeChild(this._cl_input);
				} catch(e){
					//do nothing
				}
				this._cl_input = this._cl_createInput(value);
				this._cl_inputView.htmlWrapper().appendChild(this._cl_input);
			}
			return this._cl_input.type;
		}
		
		proto.selected = function(value, suppressEvent){
			if (typeof value === 'boolean') {
				this._cl_input.checked = value;
			}
			return this.mixins().selected.call(this, value, suppressEvent === true);
		}
		
		proto.Override.label = function(value, labelAfterInput, nonBreaking){
			labelAfterInput = labelAfterInput !== false; //default to true
			return im.UIOptionButton.superclass().label.call(this, value, labelAfterInput, nonBreaking);
		}
		
		proto.Override.element = function(){
			return this._cl_input;
		}
		
		proto.Override.required = function(value){
			if(this._cl_optionGroup)
				return this._cl_optionGroup.required(value);
			else
				return proto.superclass().required.call(this, value); 
		}
		
		proto.Override.reset = function(){
			this.selected(false);
			this.validityChanged(true);
		}
		
		proto.Override._cl_validateRequired = function(){
			var isValid = true;
			if((this._cl_optionGroup && !this._cl_optionGroup.selectedOption()) || (!this._cl_optionGroup && !this.selected())){
				isValid = false;
				this.addValidationState(im.UIValidationStates.REQUIRED);
			}
			return isValid;
		}
		
		proto._cl_createInput = function(type, checked){
			var input = document.createElement('input');
			input.id = this.instanceUID() + '_input';
			input.type = type;
			input.name = this.instanceUID();
			input.checked = checked === true;
			var self = this;
			input.onchange = function(){
				self.selected(this.checked);
			}
			//If this is IE < 9, use this nice little hack to make onchange fire immediately
			if (this.cl()._core().envManager().clientPlatform() === 'IE' && this.cl()._core().envManager().browserVersion() < 9) {
				var inputOnClick = function(){
					this.blur();
					this.focus();
				}
				
				input.onclick = inputOnClick;
			}
			return input;
		}
		
		proto.dealloc = function(){
			if(this.optionGroup())
				this.optionGroup().removeOption(this);
			this._cl_destroyElement(this._cl_input);
			this._cl_input = null;
		}
	});



/**
 * @class A selection menu.
 * @name a5.cl.ui.form.UISelect
 * @extends a5.cl.ui.form.UIFormElement
 */
a5.Package('a5.cl.ui.form')
	.Extends('UIFormElement')
	.Prototype('UISelect', function(proto, im, UISelect){
		
		UISelect.customViewDefNodes = ['Option', 'Group'];
	
		proto.UISelect = function(options){
			proto.superclass(this);
			
			this._cl_select = null;
			this._cl_selectMultiple = false;
			this._cl_selectSize = null;
			this._cl_options = [];
			this._cl_minValidIndex = 0;
			
			this.height('auto');
			this.inputView().width(200).height('auto').border(1, 'solid', '#C8C6C4').backgroundColor('#fff');
			
			//if options were passed in a5.Create, add them now.
			if(options instanceof Array)
				this._cl_addOptionsFromData(options);
		}
		
		proto.Override.viewReady = function(){
			//force a redraw of the select
			this._cl_redrawSelect();
			im.UISelect.superclass().viewReady.call(this);
		}
		
		/** @private */
		proto._cl_redrawSelect = function(){
			//remove the existing select, if necessary
			var selectedIndex = -1;
			if (this._cl_select) {
				selectedIndex = this._cl_select.selectedIndex;
				this._cl_select.onchange = null;
				this.inputView().clearHTML();
			}
			//create a new select element
			var sel = document.createElement('select');
			sel.id = this.instanceUID() + '_select';
			sel.style.width = '100%';
			sel.style.border = 'none';
			sel.style.backgroundColor = 'transparent';
			sel.multiple = this._cl_selectMultiple;
			this._cl_addFocusEvents(sel);
			if(typeof this._cl_selectSize === 'number') sel.size = this._cl_selectSize;
			//add the options to the select
			for(var x = 0, xl = this._cl_options.length; x < xl; x++){
				var item = this._cl_options[x];
				var opt;
				if(item.isGroup){
					//if this item is a group, create an optgroup
					opt = document.createElement('optgroup');
					opt.label = item.label;
					//and then loop through all of the options within the group
					for(var y = 0, yl = item.options.length; y < yl; y++){
						var grpItem = item.options[y];
						var grpOpt = document.createElement('option');
						grpOpt.innerHTML = grpItem.label;
						grpOpt.value = grpItem.value + '';
						opt.appendChild(grpOpt);
					}
				} else {
					//otherwise just create an option
					opt = document.createElement('option');
					opt.innerHTML = item.label;
					opt.value = item.value + '';
				}
				//add the item to the select
				sel.appendChild(opt);
				opt = null;
			}
			//add the select to the html view
			this.inputView().htmlWrapper().appendChild(sel);
			sel.selectedIndex = selectedIndex;
			var self = this;
			sel.onchange = function(e){
				self.dispatchEvent(self.create(a5.cl.ui.events.UIEvent, [a5.cl.ui.events.UIEvent.CHANGE, e || window.event]));
			};
			this._cl_select = sel;
			sel = null;
		}
		
		proto._cl_findGroup = function(group){
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				var item = this._cl_options[x];
				if(item.isGroup && item.label === group)
					return item;
			}
			return undefined;
		}
		
		// Manipulation Methods
		
		/**
		 * Adds multiple options from an array of objects.  The format is as follow:
		 * <br /><code>
		 * [
		 *   {isGroup:true, label:'Group 1', options:[
		 *     {label:'Option 1', value:1},
		 *     {label:'Option 2', value:2},
		 *     {label:'Option 3', value:3}
		 *   ]}
		 * ]
		 * </code>
		 * 
		 * @param {Object[]} options The options and/or groups to be added.
		 */
		proto.addOptionsFromData = function(options){
			//call the internal method
			this._cl_addOptionsFromData(options);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addOptionsFromData = function(options){
			if(options instanceof Array){
				for(var x = 0, y = options.length; x < y; x++){
					var opt = options[x];
					if(opt.isGroup !== undefined && opt.isGroup === true)
						this._cl_addGroup(opt.label, -1, opt.options);
					else
						this.addOption(opt.label, opt.value);
				}
			}
		}
		
		/**
		 * Adds an option to the UISelect, optionally within a group.
		 * 
		 * @param {String} label	The text to be displayed by the option.
		 * @param {Object} value	The value of the option.  Can be any type.
		 * @param {String} [group]	The label of the group that this option should be added to.
		 */
		proto.addOption = function(label, value, group){
			//call the internal method
			this._cl_addOptionAtIndex(label, value, -1, group);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/**
		 * Adds an option to the UISelect at a specified index, optionally within a group.
		 * 
		 * @param {String} label	The text to be displayed by the option.
		 * @param {Object} value	The value of the option.  Can be any type.
		 * @param {Number} index	The index at which this option should be inserted (relative to the group, if one is specified).
		 * @param {String} [group]	The label of the group that this option should be added to.
		 */
		proto.addOptionAtIndex = function(label, value, index, group){
			//call the internal method
			this._cl_addOptionAtIndex(label, value, index, group);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addOptionAtIndex = function(label, value, index, group){
			if(typeof group === 'string' && typeof index === 'number'){
				//if a group was specified, add the option to that group
				var grp = this._cl_findGroup(group);
				//if a group with that label wasn't found, create one now
				if (grp === undefined) {
					this.addGroup(group);
					grp = this._cl_options[this._cl_options.length - 1];
				}
				//validate the index
				if(index < 0 || index > grp.options.length) index = grp.options.length;
				//add the option to the group
				grp.options.splice(index, 0, {label:label, value:value});
			} else {
				//validate the index
				if(index < 0 || index > this._cl_options.length) index = this._cl_options.length;
				//add it to the array at the specified index
				this._cl_options.splice(index, 0, {label:label, value:value});
			}
		}
		
		/**
		 * Removes all options from the UISelect that have the specified label and value.
		 * 
		 * @param	{String} label	The label of the option to be removed.
		 * @param	{Object} value	The value of the option to be removed.
		 * @return	{Number} The number of options that were removed.
		 */
		proto.removeOption = function(label, value){
			var removed = 0;
			var toBeRemoved = [];
			//loop through each option
			for(var x = 0, xl = this._cl_options.length; x < xl; x++){
				var item = this._cl_options[x];
				if(item.isGroup){
					//if it's a group, loop through each option in the group
					var grpToBeRemoved = [];
					for(var y = 0, yl = item.options.length; y < yl; y++){
						var grpItem = item.options[y];
						//if this item matches the label and value passed, mark it for deletion 
						if(grpItem.label === label && grpItem.value === value)
							grpToBeRemoved.push(y);
					}
					//remove all of the items that were flagged
					for(var z = 0, zl = grpToBeRemoved.length; z < zl; z++){
						item.options.splice(z, 1);
						removed++;
					}
				} else {
					//if this item matches the label and value passed, mark it for deletion
					if(item.label === label && item.value === value)
						toBeRemoved.push(x);
				}
			}
			for(var x = 0, xl = toBeRemoved.length; x < xl; x++){
				this._cl_options.splice(x, 1);
				removed++;
			}
			//redraw the select
			this._cl_redrawSelect();
			//return the array of options that were removed;
			return removed;
		}
		
		/**
		 * Removes an option from the UISelect at the specified index, optionally within a specified group.
		 * 
		 * @param  {Number} index	The index of the option that should be removed.
		 * @param  {String} [group]	The label of the group that this option should be added to.
		 * @return {Object} The option that was removed.
		 */
		proto.removeOptionAtIndex = function(index, group){
			if(typeof group === 'string'){
				//if a group was specified, remove the specified option from the group
				var grp = this._cl_findGroup(group);
				if (grp === undefined) {
					return null;
				} else {
					var removed = grp.options.splice(index, 1)[0];
					this._cl_redrawSelect();
					return removed;
				}
			} else {
				//traverse the options until we hit the specified index
				var i = -1;
				for(var x = 0, xl = this._cl_options.length; x < xl; x++){
					var item = this._cl_options[x];
					if(item.isGroup){
						//if it's a group, loop through each option in the group
						for(var y = 0, yl = item.options.length; y < yl; y++){
							var grpItem = item.options[y];
							i++;
							if(i === index)
								var removed = item.options.splice(y, 1)[0];
								this._cl_redrawSelect();
								return removed;
						}
					} else {
						i++;
						if(i === index){
							var removed = this._cl_options.options.splice(x, 1)[0];
							this._cl_redrawSelect();
							return removed;
						}
					}
				}
			}
		}
		
		/**
		 * Removes all of the options.
		 */
		proto.removeAll = function(){
			this._cl_options = [];
			this._cl_redrawSelect();
		}
		
		/**
		 * Adds a group to the UISelect.  If an array of options are passed, those options will be added to the group.
		 * 
		 * @param {String}	 label		The text to be displayed for this group.
		 * @param {Number}	 [index]	The global index at which to add this group.
		 * @param {Object[]} [options]	An array of options to be placed within this group.
		 */
		proto.addGroup = function(label, index, options){
			//call teh internal method
			this._cl_addGroup(label, index, options);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addGroup = function(label, index, options){
			if(typeof label === 'string'){
				//validate the index
				if(typeof index !== 'number') index = -1;
				if(index < 0 || index > this._cl_options.length) index = this._cl_options.length;
				//create the group
				var grp = {isGroup:true, label:label, options:[]};
				//add options to the group if necessary
				if(options instanceof Array){
					for(var x = 0, y = options.length; x < y; x++){
						var opt = options[x];
						grp.options.push({label:opt.label, value:opt.value});
					}
				}
				//add the group to the array
				this._cl_options.splice(index, 0, grp);
			}
		}
		
		/**
		 * Removes a group from the UISelect.  By default, the options within that group will also be removed. Pass false as a second param to keep the options.
		 * 
		 * @param  {String}		group					The label of the group to be removed
		 * @param  {Boolean}	[removeOptions=true]	If false, the options within the specified group will not be removed from the select.
		 * @return {Object[]}	Returns an array of options that were in the removed group. 
		 */
		proto.removeGroup = function(group, removeOptions){
			var grp;
			var index;
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				var item = this._cl_options[x];
				if (item.isGroup && item.label === group) {
					grp = item;
					index = x;
					break;
				}
			}
			if(typeof index === 'number'){
				this._cl_options.splice(index, 1);
				if(removeOptions === false){
					for(var x = 0, y = grp.options.length; x < y; x++){
						this._cl_options.splice(index + x, 0, grp.options[x]);
					}
				}
			}
			this._cl_redrawSelect();
			return grp.options;
		}
		
		
		// Informational Methods
		
		/**
		 * Gets or sets the option that is currently selected, or null if none is selected.
		 * 
		 * @param value {Object} An object with 'value' and/or 'label' properties corresponding to the option that should be selected.
		 * @return {Object}	The currently selected option.
		 */
		proto.selectedOption = function(value){
			var setting = (typeof value === 'object' && (value.hasOwnProperty('value') || value.hasOwnProperty('label')));
			var checkLabel = setting && value.hasOwnProperty('label');
			var checkValue = setting && value.hasOwnProperty('value');
				
			var selectedIndex = this._cl_select.selectedIndex;
			if(selectedIndex < 0 && !setting) return null;
			
			var i = -1;
			for (var x = 0, xl = this._cl_options.length; x < xl; x++) {
				var item = this._cl_options[x];
				if (item.isGroup) {
					for (var y = 0, yl = item.options.length; y < yl; y++) {
						i++;
						var grpItem = item.options[y];
						if (setting) {
							var labelMatch = checkLabel ? (grpItem.label === value.label) : true;
							var valueMatch = checkValue ? (grpItem.value === value.value) : true;
							if(labelMatch && valueMatch){
								this._cl_select.selectedIndex = i;
								return this;
							}
						} else if (i === selectedIndex) {
							return grpItem;
						}
					}
				} else {
					i++
					if (setting) {
						var labelMatch = checkLabel ? (item.label === value.label) : true;
						var valueMatch = checkValue ? (item.value === value.value) : true;
						if(labelMatch && valueMatch){
							this._cl_select.selectedIndex = i;
							return this;
						}
					} else if (i === selectedIndex) {
						return item;
					}
				}
			}
			return null;
		}
		
		proto.Override.value = function(){
			var selectedOpt = this.selectedOption();
			return selectedOpt ? (selectedOpt.value || selectedOpt.label) : null ;
		}
		
		proto.Override._cl_validateRequired = function(){
			if(this._cl_select.selectedIndex < this._cl_minValidIndex){
				this.addValidationState(im.UIValidationStates.REQUIRED);
				return false;
			}
			return true;
		}
		
		/**
		 * Select the option at the specified index.
		 * 
		 * @param {Number} index The index of the option to select.
		 */
		proto.selectOptionAtIndex = function(index){
			var opt = this.getOptionAtIndex(index);
			if(opt)
				this.selectedOption(opt);
		}
		
		/**
		 * Returns the option at the specified index, or an array of options if a group is at the specified index.  Pass a group label to search within that specified group.
		 * 
		 * @param {Number} index The index of the option to retrieve.
		 * @return {Object|Object[]} The option at the specified index.
		 */
		proto.getOptionAtIndex = function(index, group){
			if(typeof group === 'string'){
				//if a group was specified, just return the index within that group
				var grp = this._cl_findGroup(group);
				if (grp === undefined)
					return null;
				else
					return grp.options[index];
			} else {
				//traverse the options until we hit the specified index
				var i = -1;
				for(var x = 0, xl = this._cl_options.length; x < xl; x++){
					var item = this._cl_options[x];
					if(item.isGroup){
						//if it's a group, loop through each option in the group
						for(var y = 0, yl = item.options.length; y < yl; y++){
							var grpItem = item.options[y];
							i++;
							if(i === index)
								return grpItem;
						}
					} else {
						i++;
						if(i === index)
							return item;
					}
				}
			}
		}
		
		/**
		 * Returns an array of options that are within the specified group. 
		 * 
		 * @param {String} group The label of the group to retrieve.
		 * @return {Object[]} An array of options that are in the specified group.
		 */
		proto.getGroup = function(group){
			var grp = this._cl_findGroup(group);
			if(grp)
				return grp.options;
			else
				return null;
		}
		
		proto.Override.reset = function(){
			this.selectOptionAtIndex(0);
			this.validityChanged(true);
		}
		
		/**
		 * Whether the UISelect should allow multiple selections.  Defaults to false.
		 * 
		 * @param {Boolean} [value] Whether the UISelect should allow multiple selections.
		 * @return {Boolean} Whether the UISelect allows multiple selections.
		 */
		proto.allowMultiple = function(value){
			if (typeof value === 'boolean') {
				if(this._cl_select) this._cl_select.multiple = value;
				this._cl_selectMultiple = value;
			}
			return this._cl_select.multiple;
		}
		
		/**
		 * 
		 * @param {Number} value The maximum number of options to display at one time.
		 */
		proto.size = function(value){
			if(typeof value === 'boolean'){
				if(this._cl_select) this._cl_select.size = value;
				this._cl_selectSize = value;
			}
			return this._cl_selectSize;
		}
		
		proto.minValidIndex = function(value){
			if(typeof value === 'number'){
				this._cl_minValidIndex = value;
				return this;
			}
			return this._cl_minValidIndex;
		}
		
		proto.Override.enabled = function(value){
			if (typeof value === 'boolean') {
				if(this._cl_select) this._cl_select.disabled = value;
				this._cl_enabled = value;
			}
			return this._cl_enabled;
		}
		
		proto.Override.element = function(){
			return this._cl_select;
		}
		
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			proto.superclass().processCustomViewDefNode.apply(this, arguments);
			switch(nodeName){
				case 'Option':
					this.addOption(node.label, node.value, node.group);
					break;
				case 'Group':
					this.addGroup(node.label);
					break;
			}
		}
		
		proto.dealloc = function(){
			this._cl_select.onchange = null;
			this._cl_destroyElement(this._cl_select);
			this._cl_select = null;
		}

});


a5.Package('a5.cl.ui.form')
	.Extends('UIFormElement')
	.Prototype('UIFileInput', function(proto, im, UIFileInput){
		
		proto.UIFileInput = function(){
			proto.superclass(this);
			
			this._cl_element = document.createElement('input');
			this._cl_element.type = 'file';
			this._cl_element.id = this.instanceUID() + '_field';
			this._cl_element.style.width = '100%';
			
			this.width('100%').height('auto');
		}
		
		proto.Override.viewReady = function(){
			this._cl_inputView.appendChild(this._cl_element);
		}
		
		proto.Override.value = function(){
			return this._cl_element.files ? this._cl_element.files[0] : this._cl_element.value;
		}
});



a5.Package('a5.cl.ui.form')
	.Import('a5.cl.core.Utils',
			'a5.cl.CLEvent')
	.Extends('a5.cl.CLViewContainer')
	.Prototype('UIForm', function(proto, im, UIForm){
	
		this.Properties(function(){
			this._cl_elements = [];
			this._cl_action = null;
			this._cl_method = 'POST';
			this._cl_validateOnSubmit = true;
		});
		
		proto.UIForm = function(){
			this._cl_viewElementType = 'form';
			proto.superclass(this);
			
			this.addEventListener(im.CLEvent.ADDED_TO_PARENT, this._cl_eChildViewHandler, false, this);
			this.addEventListener(im.CLEvent.REMOVED_FROM_PARENT, this._cl_eChildViewHandler, false, this);
		}
		
		proto.validate = function(){
			var invalid = [],
				x, y, thisElem;
			for(x = 0, y = this._cl_elements.length; x < y; x++){
				thisElem = this._cl_elements[x];
				if (!thisElem.validate()) {
					if(thisElem instanceof im.UIOptionButton && thisElem.optionGroup())
						thisElem = thisElem.optionGroup();
					if(im.Utils.arrayIndexOf(invalid, thisElem) === -1)
						invalid.push(thisElem);
				}
			}
			return invalid.length === 0 ? true : invalid;
		}
		
		proto.getData = function(){
			var data = {},
				x, y, thisElem, optGroup;
			for(x = 0, y = this._cl_elements.length; x < y; x++){
				thisElem = this._cl_elements[x];
				if(thisElem instanceof im.UIOptionButton){
					optGroup = thisElem.optionGroup();
					if(optGroup)
						thisElem = optGroup;
					else {
						data[thisElem.name()] = thisElem.selected();
						continue;
					}
				}
				data[thisElem.name()] = thisElem.value();
			}
			return data;
		}
		
		proto.submit = function(onSuccess, onError){
			var validity = this._cl_validateOnSubmit ? this.validate() : true,
				data = this.getData(),
				supportsFormData = "FormData" in window;
			if(validity !== true) return validity;
			if(typeof this._cl_action === 'function'){
				this._cl_action.call(this, data);
			} else if(typeof this._cl_action === 'string'){
				a5.cl.core.RequestManager.instance().makeRequest({
					url: this._cl_action,
					method: this._cl_method,
					formData: supportsFormData,
					data: data,
					isJson: !supportsFormData,
					success: typeof onSuccess === 'function' ? onSuccess : null,
					error: typeof onError === 'function' ? onError : null
				});
			}
			return true;
		}
		
		proto.reset = function(){
			for(var x = 0, y = this._cl_elements.length; x < y; x++)
				this._cl_elements[x].reset();
		}
		
		proto.elements = function(){
			return this._cl_elements.slice(0);
		}
		
		proto.validateOnSubmit = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnSubmit = value;
				return this;
			}
			return this._cl_validateOnSubmit;
		}
		
		/**
		 * Gets or sets the action associated with this form.
		 * If a URL is specified, the submit() method will send the form's data to that URL.
		 * If a function is specified, the submit() method will pass the form's data to that function. 
		 * @name action
		 * @param {String|Function} value The URL to send the forms' data to, or the function to call when submit() is triggered.
		 */
		proto.action = function(value){
			if(typeof value === 'string' || typeof value === 'function'){
				this._cl_action = value;
				return this;
			}
			return this._cl_action;
		}
		
		/**
		 * Gets or sets the method by which to send data on submit when a URL is specified for action. (GET or POST)
		 * @name method
		 * @param {String} value
		 */
		proto.method = function(value){
			if(typeof value === 'string'){
				this._cl_method = value.toUpperCase();
				return this;
			}
			return this._cl_method;
		}
		
		proto._cl_eChildViewHandler = function(e){
			var view = e.target(), 
				index = -1;
			if(view instanceof UIForm && view !== this){
				this.throwError("UIForms cannot be nested within other UIForms.  Consider a different view structure.");
				return;
			}
			if(view instanceof im.UIFormElement) {
				switch (e.type()) {
					case im.CLEvent.ADDED_TO_PARENT:
						view._cl_form = this;
						this._cl_elements.push(view);
						break;
					case im.CLEvent.REMOVED_FROM_PARENT:
						index = im.Utils.arrayIndexOf(this._cl_elements, view);
						if (index > -1) {
							this._cl_elements.splice(index, 1);
							view._cl_form = null;
						}
						break;
				}
			} else if(view instanceof a5.cl.CLViewContainer && e.type() === im.CLEvent.ADDED_TO_PARENT){
				//if the child added is a container, check its children
				for(var x = 0, y = view.subViewCount(); x < y; x++){
					view.subViewAtIndex(x).dispatchEvent(this.create(im.CLEvent, [im.CLEvent.ADDED_TO_PARENT]));
				}
			}
		}
});



/**
 * @class 
 * @name a5.cl.ui.buttons.UIButton
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.buttons')
	.Import('a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.UITextField',
			'a5.cl.ui.form.UIOptionGroup')
	.Extends('a5.cl.ui.UIControl')
	.Mix('a5.cl.ui.mixins.UIGroupable')
	.Prototype('UIButton', function(proto, im, UIButton){
		
		UIButton.themeDefaults = {
			//width:100,
			//height:25,
			padding:{left:5, right:5},
			backgroundColor:['#FFF', '#CCC'],
			border:[1, 'solid', '#AAA', 5],
			_states_:{
				over:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#AAA', 5]
				},
				down:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#AAA', 5]
				},
				selected:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#666', 5]
				}
			}
		};
		
		proto.UIButton = function(label){
			proto.superclass(this);
			this._cl_labelView = this.create(im.UITextField);
			this._cl_data = null;
			this._cl_state = 'up';
			
			this._cl_labelView.width('100%')
				.textAlign('center')
				.alignY('middle')
				.nonBreaking(true);
			this.usePointer(true);
			this.clickEnabled(true);
			this.width(100).height(25);
			
			if(typeof label === 'string')
				this.label(label);
				
			this.themeState('up');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_labelView);
			
			var self = this;
			this.addEventListener(im.UIMouseEvent.CLICK, this._cl_onMouseClick, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_DOWN, this._cl_onMouseDown, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_UP, this._cl_onMouseUp, false, this);
			
			this._cl_viewElement.onmouseover = function(e){
				self._cl_onMouseOver.call(self, e || window.event);
				return false;
			}
			this._cl_viewElement.onmouseout = function(e){
				self._cl_onMouseOut.call(self, e || window.event);
				return false;
			}
		}
		
		proto._cl_onMouseClick = function(e){
			if(this.optionGroup() instanceof im.UIOptionGroup)
				this.selected(true);
		}
		
		proto._cl_onMouseOver = function(e){
			if (this._cl_enabled){
				this._cl_state = 'over';
				//update the colors
				if(!this._cl_selected)
					this.themeState('over')
				//dispatch the event
				var evt = this.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OVER, e]);
				this.dispatchEvent(evt);
			}
		}
		
		proto._cl_onMouseOut = function(e){
			//update the bg color with the up color(s)
			if (this._cl_enabled) {
				this._cl_state = 'up';
				//update the colors
				if(!this._cl_selected)
					this.themeState('up');
				//dispatch the event
				var evt = this.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OUT, e]);
				this.dispatchEvent(evt);
			}
		}
		
		proto._cl_onMouseUp = function(e){
			//update the bg color with the up color(s)
			if (this._cl_enabled) {
				this._cl_state = 'up';
				//update the colors
				if(!this._cl_selected)
					this.themeState('up');
			}
		}
		
		proto._cl_onMouseDown = function(e){
			if (this._cl_enabled) {
				this._cl_state = 'down';
				//update the colors
				if(!this._cl_selected)
					this.themeState('down');
			}
		}
		
		proto.selected = function(value){
			var returnVal = this.mixins().selected.call(this, value);
			if (typeof value === 'boolean') {
				this.themeState(value ? 'selected' : this._cl_state);
				return this;
			}
			return returnVal;
		}
		
		proto.Override.enabled = function(value){
			proto.superclass().enabled.call(this, value);
			if(typeof value === 'boolean'){
				this.themeState(value ? this._cl_state : 'disabled');
				this._cl_viewElement.style.cursor = value ? this._cl_cursor : 'default';
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.element = function(){
			return this._cl_viewElement;
		}
		
		/**
		 * 
		 * @param {String} str
		 */
		proto.label = function(str){
			if(typeof str === 'string'){
				this._cl_labelView.text(str);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.labelView = function(){
			return this._cl_labelView;
		}
		
		proto.data = function(value){
			if(typeof value !== 'undefined'){
				this._cl_data = value;
				return this;
			}
			return this._cl_data;
		}
		
		proto.textAlign = function(value){
			return this._cl_labelView.textAlign(value);
		}
		
		proto.fontSize = function(value){
			return this._cl_labelView.fontSize(value);
		}
		
		proto.fontWeight = function(value){
			return this._cl_labelView.fontWeight(value);
		}
		
		proto.dealloc = function(){
			this._cl_viewElement.onmouseover = this._cl_viewElement.onmouseout = null;
		}	
});


a5.Package('a5.cl.ui.modals')
	.Extends('a5.cl.CLWindow')
	.Prototype('UIModal', function(proto, im){
		
		this.Properties(function(){
			this._cl_destroyOnClose = true;
		})
			
		proto.UIModal = function(){
			proto.superclass(this);
			this._cl_windowLevel = a5.cl.CLWindowLevel.MODAL;
		}
		
		proto.open = function(){
			this.cl().application().addWindow(this);
		}
		
		proto.Override.show = function(){
			this.open();
		}
		
		proto.close = function(){
			if(this.isOpen())
				this.cl().application().removeWindow(this, this._cl_destroyOnClose);
		}
		
		proto.Override.hide = function(){
			this.close();
		}
		
		proto.isOpen = function(){
			return this.cl().application().containsWindow(this);
		}
		
		proto.destroyOnClose = function(value){
			if(typeof value === 'boolean'){
				this._cl_destroyOnClose = value;
				return this;
			}
			return this._cl_destroyOnClose;			
		}
	})


/**
 * @class Presents the user with a modal lightbox style display overlay of content.
 * @name a5.cl.ui.UILightBox
 * @extends a5.cl.CLWindow
 */
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.*',
			'a5.cl.*',
			'a5.cl.ui.events.UIMouseEvent')
	.Extends('UIModal')
	.Static(function(UILightBox, im){
		
		UILightBox.show = function(_inst){
			return UILightBox.open(_inst);
		}
		
		UILightBox.open = function(_inst){
			var inst = _inst instanceof UILightBox ? _inst : UILightBox.instance(true);
			inst.open();
			return inst;
		}
		
		UILightBox.close = function(_inst){
			var inst = _inst instanceof UILightBox ? _inst : UILightBox.instance(true);
			inst.close();
		}	
	})
	.Prototype('UILightBox', function(proto, im){
		
		this.Properties(function(){
			this._cl_bgView = null;
			this._cl_contentView = null;
			this._cl_userCanClose = true;
		})
		
		proto.UILightBox = function(){
			proto.superclass(this);
			
			this._cl_bgView = this.create(im.UIControl)
				.clickEnabled(true).backgroundColor('#000').alpha(.5);
			this._cl_contentView = this.create(im.CLViewContainer)
				.height('auto').width('auto').alignX('center').alignY('middle').backgroundColor('#fff');
		}
		
		proto.Override.draw = function(){
			proto.superclass().draw.apply(this, arguments);
			proto.superclass().backgroundColor.call(this, 'transparent');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.constrainChildren(true);
			this._cl_bgView.addEventListener(im.UIMouseEvent.CLICK, this._cl_eBGClickedHandler, false, this);
			this.addSubView(this._cl_bgView);
			this.addSubView(this._cl_contentView);
			this._cl_locked(true);
		}
		
		proto.userCanClose = function(value){
			if(typeof value === 'boolean'){
				this._cl_userCanClose = value;
				return this;
			}
			return this._cl_userCanClose;			
		}
		
		proto.setWidth = function(value){
			this._cl_contentView.width(value);
			return this;
		}
		
		proto.setHeight = function(value){
			this._cl_contentView.height(value);
			return this;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.contentWidth = function(){ 
			if (arguments.length) {
				this._cl_contentView.width.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.width();
			}
		}
		
		proto.contentHeight = function(){ 
			if (arguments.length) {
				this._cl_contentView.height.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.height();
			}
		}
		
		proto.Override.backgroundColor = function(){ 
			if (arguments.length) {
				this._cl_bgView.backgroundColor.apply(this._cl_bgView, arguments);
				return this;
			} else {
				return this._cl_bgView.backgroundColor();
			} 
		}	
		
		proto.Override.alpha = function(){ 
			if (arguments.length) {
				this._cl_bgView.alpha.apply(this._cl_bgView, arguments);
				return this;
			} else {
				return this._cl_bgView.alpha();
			}
		}
		
		proto.Override.border = function(){ 
			if (arguments.length) {
				this._cl_contentView.border.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.border();
			}
		}
		
		proto._cl_eBGClickedHandler = function(e){
			if (this._cl_userCanClose) {
				e.cancel();
				this.close();
			}
		}
});




a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.UIControl',
			'a5.cl.core.Utils')
	.Extends('a5.cl.CLWindow')
	.Prototype('UIContextMenuWindow', function(proto, im){
		
		proto.UIContextMenuWindow = function(){
			proto.superclass(this, arguments);
			this._cl_windowLevel = a5.cl.CLWindowLevel.CONTEXT;
			this._cl_menuView = null;
			
			var self = this;
			this._cl_globalClickHandler = function(){
				self.close();
			}
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this.backgroundColor('transparent');
		}
		
		proto.menuView = function(view){
			if(view instanceof a5.cl.CLView){
				this._cl_removeMenuView();
				this.addSubView(view);
				this._cl_menuView = view;
				return this;
			} else if(view === null || view === false){
				this._cl_removeMenuView();
				return this;
			}
			return this._cl_menuView;
		}
		
		proto.open = function(mouseEvent){
			var rootView = this.cl().application().view();
			if(this._cl_menuView && mouseEvent.clientX && mouseEvent.clientY){
				var outerX = mouseEvent.clientX + this._cl_menuView.width(),
					outerY = mouseEvent.clientY + this._cl_menuView.height();
				this._cl_menuView.x(outerX > rootView.width() ? (rootView.width() - this._cl_menuView.width() - 3) : mouseEvent.clientX);
				this._cl_menuView.y(outerY > rootView.height() ? (rootView.height() - this._cl_menuView.height() - 3) : mouseEvent.clientY);
			}
			rootView.addWindow(this);
			im.Utils.addEventListener(window, 'click', this._cl_globalClickHandler);
		}
		
		proto.close = function(){
			this.cl().application().removeWindow(this, false);
			im.Utils.removeEventListener(window, 'click', this._cl_globalClickHandler);
		}
		
		proto._cl_removeMenuView = function(){
			if (this._cl_menuView)
				this.removeSubView(this._cl_menuView, false);
			this._cl_menuView = null;
		}
		
		proto._cl_eBGClickHandler = function(e){
			this.close();
		}
});



a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.buttons.UIButton',
			'a5.cl.ui.core.UIUtils')
	.Extends('a5.cl.CLWindow')
	.Static(function(UIInputHistoryList){
		UIInputHistoryList.open = function(input){
			return UIInputHistoryList.instance(true).open(input);
		}
		
		UIInputHistoryList.close = function(){
			return UIInputHistoryList.instance(true).close();
		}
		
		UIInputHistoryList.update = function(historyArray){
			return UIInputHistoryList.instance(true).update(historyArray);
		}
		
		UIInputHistoryList.nextItem = function(){
			return UIInputHistoryList.instance(true).nextItem();
		}
		
		UIInputHistoryList.previousItem = function(){
			return UIInputHistoryList.instance(true).previousItem();
		}
		
		UIInputHistoryList.selectedItem = function(){
			return UIInputHistoryList.instance(true).selectedItem();
		}
		
		UIInputHistoryList.isOpen = function(){
			return UIInputHistoryList.instance(true).isOpen();
		}
	})
	.Class('UIInputHistoryList', 'singleton', function(self, im){
		var optionGroup = this.create(a5.cl.ui.form.UIOptionGroup, ['inputHistoryList']),
			historyArray = [],
			input = null,
			isOpen = false,
			buttonCache = {},
			maxItems = 5;
		
		self.UIInputHistoryList = function(){
			self.superclass(this);
			this._cl_windowLevel = a5.cl.CLWindowLevel.CONTEXT;
			
			optionGroup.addEventListener(im.UIEvent.CHANGE, function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.CHANGE]));
			});
		}
		
		self.viewReady = function(){
			self.superclass().viewReady.apply(this, arguments);
			
			this.relY(true)
				.border(1)
				.backgroundColor('transparent')
				.height('auto');
		}
		
		self.open = function(_input){
			input = _input;
			//populate the list
			this.update(input.getHistory(true));
			
			if(!isOpen && historyArray.length > 0){
				//add the window to the view stack
				var rootView = this.cl().application().view(),
					globalPosition = im.UIUtils.getGlobalPosition(input.inputView(), rootView);
				this.x(globalPosition.left)
						.y(globalPosition.top + input.height())
						.width(input.inputView().width());
				rootView.addWindow(this);
				isOpen = true;
			}
		}
		
		self.close = function(){
			if (isOpen) {
				this.cl().application().removeWindow(this, false);
				isOpen = false;
				this.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.CLOSE]));
			}
		}
		
		self.update = function(_history){
			historyArray = _history
			if (historyArray.length > 0) {
				this.removeAllSubViews(false);
				for (var x = 0, y = historyArray.length; x < y; x++) {
					this.addSubView(getListButton(historyArray[x]).data(x).selected(/*x === 0*/false));
				}
				//this.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.CHANGE]));
				optionGroup.selectedOption(null);
			} else {
				this.close();
			}
		}
		
		self.nextItem = function(){
			var curIndex = optionGroup.selectedOption() ? optionGroup.selectedOption().data() : -1;
			if(curIndex < historyArray.length - 1)
				buttonCache[historyArray[curIndex + 1]].selected(true);
		}
		
		self.previousItem = function(){
			var curIndex = optionGroup.selectedOption() ? optionGroup.selectedOption().data() : 0;
			//if on first one, close
			if (curIndex === 0) 
				this.close();
			else
				buttonCache[historyArray[curIndex - 1]].selected(true);
		}
		
		self.maximumVisibleItems = function(value){
			if(typeof value === 'number'){
				maxItems = value;
				return this;
			}
			return maxItems;
		}
		
		self.selectedItem = function(){
			return optionGroup.selectedOption().label();
		}
		
		self.isOpen = function(){
			return isOpen;
		}
		
		var getListButton = function(label){
			//if there's already a button with that label, return it from teh cache
			if(buttonCache[label])
				return buttonCache[label];
			//otherwise, create a new one
			var button = self.create(im.UIButton, [label]);
			button.width('100%').height(25)
				.upBorder({top:0, right:0, left:0, bottom:1}).overBorder({bottom:1}).downBorder({bottom:1}).selectedBorder({bottom:1})
				.upColor('#fff').overColor('#aaa').downColor('#aaa').selectedColor('#aaa')
				.optionGroup(optionGroup)
				.labelView()
					.width('100%')
					.alignX('left');
			//button.addEventListener(im.UIMouseEvent.MOUSE_OVER, eButtonHandler);
			button.addEventListener(im.UIMouseEvent.MOUSE_DOWN, eButtonHandler);
			buttonCache[label] = button;
			return button;
		}
		
		var eButtonHandler = function(e){
			e.target().selected(true);
		}
		
		self.dealloc = function(){
			this.removeAllSubViews(false);
			for(var prop in buttonCache){
				buttonCache[prop].destroy();
				delete buttonCache[prop];
			}
		}

});



/**
 * @class Presents the user with a modal text dialogue.
 * @name cl.mvc.ui.modals.UIAlert
 * @extends cl.mvc.ui.modals.UIModal
 */
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.buttons.UIButton',
			'a5.cl.ui.UITextField',
			'a5.cl.ui.UIContainer',
			'a5.cl.ui.UIFlexSpace')
	.Extends('UILightBox')
	.Prototype('UIAlert', function(proto, im, UIAlert){
		
		UIAlert.open = function(message, onContinue, onCancel){
			var inst = a5.Create(UIAlert);
			inst.open(message, onContinue, onCancel);
			return inst;
		}
		
		this.Properties(function(){
			this._cl_onContinue = null;
			this._cl_onCancel = null;
			this._cl_message = '';
			this._cl_callbackScope = null;
			
			this._cl_messageField = null;
			this._cl_continueButton = null;
			this._cl_cancelButton = null;
			this._cl_buttonHolder = null;
			this._cl_flexSpace = null;
		});
		
		proto.UIAlert = function(){
			proto.superclass(this);
			
			this.userCanClose(false)
				.border(1, 'solid', '#666', 5)
				.alpha(.25)
				.contentView()
					.relY(true)
					.padding(10)
					.height('auto')
					.width('100%').maxWidth(300);
			
			this._cl_messageField = this.create(im.UITextField).width('100%').height('auto').textAlign('center');
			this._cl_continueButton = this.create(im.UIButton).label("OK");
			this._cl_cancelButton = this.create(im.UIButton).label("Cancel");
			this._cl_buttonHolder = this.create(im.UIContainer).relX(true).width('100%').height('auto').y(15);
			this._cl_flexSpace = this.create(im.UIFlexSpace);
			
			this._cl_continueButton.addEventListener(im.UIMouseEvent.CLICK, this._cl_eContinueButtonHandler, false, this);
			this._cl_cancelButton.addEventListener(im.UIMouseEvent.CLICK, this._cl_eCancelButtonHandler, false, this);
		}
		
		proto.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this._cl_contentView.addSubView(this._cl_messageField);
			this._cl_buttonHolder.addSubView(this._cl_flexSpace);
			this._cl_buttonHolder.addSubView(this._cl_cancelButton);
			this._cl_buttonHolder.addSubView(this.create(im.UIFlexSpace));
			this._cl_buttonHolder.addSubView(this._cl_continueButton);
			this._cl_buttonHolder.addSubView(this.create(im.UIFlexSpace));
			this._cl_contentView.addSubView(this._cl_buttonHolder);
		}
		
		proto.Override.open = function(message, onContinue, onCancel){
			proto.superclass().open.call(this);
			
			if(typeof message === 'string')
				this._cl_messageField.text(message);
			if(onContinue !== undefined)
				this._cl_onContinue = onContinue;
			if(onCancel !== undefined)
				this._cl_onCancel = onCancel;
			if(this._cl_onCancel === true || typeof this._cl_onCancel === 'function'){
				if(!this._cl_buttonHolder.containsSubView(this._cl_cancelButton))
					this._cl_buttonHolder.addSubViewAtIndex(this._cl_cancelButton, 0);
				if(!this._cl_buttonHolder.containsSubView(this._cl_flexSpace))
					this._cl_buttonHolder.addSubViewAtIndex(this._cl_flexSpace, 0);
			} else {
				if(this._cl_buttonHolder.containsSubView(this._cl_flexSpace))
					this._cl_buttonHolder.removeSubView(this._cl_flexSpace);
				if(this._cl_buttonHolder.containsSubView(this._cl_cancelButton))
					this._cl_buttonHolder.removeSubView(this._cl_cancelButton);
			}
		}
		
		proto.message = function(value){
			if(value !== undefined){
				this._cl_message = value;
				return this;
			}
			return this._cl_message;
		}
		
		proto.onContinue = function(value){
			if(value !== undefined){
				this._cl_onContinue = value;
				return this;
			}
			return this._cl_onContinue;
		}
		
		proto.onCancel = function(value){
			if(value !== undefined){
				this._cl_onCancel = value;
				return this;
			}
			return this._cl_onCancel;
		}
		
		proto.continueLabel = function(value){
			if(value !== undefined){
				this._cl_continueButton.label(value);
				return this;
			}
			return this._cl_continueButton.label();
		}
		
		proto.cancelLabel = function(value){
			if(value !== undefined){
				this._cl_cancelButton.label(value);
				return this;
			}
			return this._cl_cancelButton.label();
		}
		
		proto.callbackScope = function(value){
			if(value !== undefined){
				this._cl_callbackScope = value;
				return this;
			}
			return this._cl_callbackScope;
		}
		
		proto.messageField = function(){
			return this._cl_messageField;
		}
		
		proto.continueButton = function(){
			return this._cl_continueButton;
		}
		
		proto.cancelButton = function(){
			return this._cl_cancelButton;
		}
		
		proto._cl_eContinueButtonHandler = function(e){
			this.close();
			if(typeof this._cl_onContinue === 'function')
				this._cl_onContinue.call(this._cl_callbackScope);
		}
		
		proto._cl_eCancelButtonHandler = function(e){
			this.close();
			if(typeof this._cl_onCancel === 'function')
				this._cl_onCancel.call(this._cl_callbackScope);
		}
});



a5.Package('a5.cl.ui.list')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*',
			'a5.cl.ui.core.UIUtils',
			'a5.cl.*')
	.Extends('a5.cl.ui.UIAccordionPanel')
	.Prototype('UIListItem', function(proto, im){
		
		proto.UIListItem = function(label, data){
			this._cl_data = null;
			this._cl_subList = null;
			this._cl_expandable = false;
			this._cl_expandedSize = 40;
			this._cl_collapsedSize = 40;
			this._cl_pendingSubList = null;
			proto.superclass(this);
		}
				
		proto.Override.initHandle = function(){
			//create the clickable handle
			this._cl_handle = this.create(im.UIControl)
				.clickEnabled(true)
				.usePointer(true)
				.backgroundColor('#FFF', '#CCC')
				.border(1, 'solid', '#AAA')
				.width('100%')
				.height(this._cl_collapsedSize);
			this.addSubView(this._cl_handle);
			
			var self = this;
			this._cl_handle.addEventListener(im.UIMouseEvent.CLICK, function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.SELECT]));
			});
			
			//add the label to the handle
			this._cl_labelView = this.create(im.UITextField).x(15).width('-15').alignY('middle').nonBreaking(true);
			this._cl_handle.addSubView(this._cl_labelView);
			
			//add the twisty arrow for expandable sections
			this._cl_arrow = this.create(im.CLHTMLView).width(6).height(6).x(5).alignY('middle');
			this._cl_handle.addSubView(this._cl_arrow);
		}
		
		proto.Override.childrenReady = function(){
			for(var x = 0, y = this.subViewCount(); x < y; x++){
				var thisView = this.subViewAtIndex(x);
				if (thisView instanceof a5.cl.ui.list.UIListView && !this.subList()) {
					if(this._cl_accordion)
						this.subList(thisView);
					else
						this._cl_pendingSubList = thisView;
				}
			}
		}
		
		proto.Override.addedToParent = function(parent){
			if(!this._cl_accordion && parent instanceof a5.cl.ui.list.UIListView)
				this._cl_accordion = parent;
			if (this._cl_pendingSubList) {
				this.subList(this._cl_pendingSubList);
				this._cl_pendingSubList = null;
			}
		}
		
		proto.Override.expanded = function(){
			this._cl_updateArrow();
			if(this._cl_accordion && this._cl_accordion._cl_isSubList)
				this._cl_accordion._cl_parentList._cl_updatePanels();
		}
		
		proto.Override.collapsed = function(){
			this._cl_updateArrow();
			if(this._cl_accordion && this._cl_accordion._cl_isSubList)
				this._cl_accordion._cl_parentList._cl_updatePanels();
		}
		
		proto.Override.collapsible = function(value){
			var returnVal = proto.superclass().collapsible.call(this, value);
			if(typeof value === 'boolean'){
				this._cl_handle.clickEnabled(value).usePointer(value);
			}
			return returnVal;
		}
		
		proto.data = function(value){
			if (typeof value !== 'undefined') {
				this._cl_data = value;
				return this;
			}
			return this._cl_data;
		}
		
		proto.subList = function(value){
			if(value instanceof a5.cl.ui.list.UIListView){
				this._cl_subList = value;
				this.addSubView(value);
				value._cl_isSubList = true;
				value._cl_parentList = this._cl_accordion;
				value.y(this._cl_collapsedSize)
					.x(this._cl_accordion._cl_subListIndent)
					.subListIndent(this._cl_accordion._cl_subListIndent);
				value.width((0 - value.x()) + '');
				value.handleSize(this._cl_collapsedSize);
				this._cl_expandedSize = null; //flag the expandedSize so it's calculated on the fly
				this.collapsible(!!this._cl_accordion._cl_collapsibleSubLists);
			} else if(value === null || value === false){
				this.removeSubView(this._cl_subList);
				this._cl_expandedSize = this._cl_collapsedSize;
				this._cl_subList = null;
			}
			this._cl_updateArrow();
			return this._cl_subList;
		}
		
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_labelView.text(value);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.expandable = function(){
			return (this._cl_subList instanceof a5.cl.ui.list.UIListView);
		}
		
		proto.Override.expandedSize = function(value){
			if(typeof value !== 'undefined' || this._cl_expandedSize !== null)
				return proto.superclass().expandedSize.call(this, value);
			else
				return (this._cl_collapsedSize + this._cl_subList.currentHeight());
		}
		
		proto.Override.collapsedSize = function(value){
			if(typeof value === 'undefined' && this._cl_collapsedSize === null)
				return this.expandedSize();
			var returnVal = proto.superclass().collapsedSize.call(this, value);
			if(value){
				this._cl_handle.height(this._cl_collapsedSize);
				if (this._cl_subList) {
					this._cl_subList.y(this._cl_collapsedSize);
					this._cl_subList.handleSize(this._cl_collapsedSize);
				} else this._cl_expandedSize = this._cl_collapsedSize;
			}
			return returnVal;
		}
		
		proto.handle = function(){
			return this._cl_handle;
		}
		
		proto.labelView = function(){
			return this._cl_labelView;
		}
		
		proto._cl_updateArrow = function(){
			this._cl_arrow.clearHTML();
			if(this.expandable() && this.collapsible()){
				var direction = this._cl_expanded ? 'down' : 'right';
				var triangle = im.UIUtils.drawTriangle(direction, '#666', 6, 6);
				this._cl_arrow.appendChild(triangle);
			}
		}
		
		proto.dealloc = function(){
			if(this._cl_subList)
				this._cl_subList._cl_isSubList = false;
			this._cl_destroyElement(this._cl_arrow);
			this._cl_subList = this._cl_arrow = null;
		}	
});


/**
 * @class 
 * @name a5.cl.ui.list.UIListView
 * @extends a5.cl.ui.UIAccordionView
 */
a5.Package('a5.cl.ui.list')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*')
	.Extends('UIAccordionView')
	.Prototype('UIListView', function(proto, im){
		
		proto.UIListView = function(){
			proto.superclass(this);
			this.direction(im.UIAccordionView.VERTICAL); //TODO: possibly make this an option
			this.fillView(false);
			this.singleSelection(false);
			this._cl_subListIndent = 15;
			this._cl_isSubList = false;
			this._cl_parentList = null;
			this._cl_collapsibleSubLists = true; 
			
			var self = this;
			this.addEventListener(im.UIEvent.SELECT, function(e){
				var targetItem = e.target();
				if(targetItem.subList() instanceof im.UIListView)
					self.dispatchEvent(self.create(im.UIListEvent, [targetItem.isExpanded() ? im.UIListEvent.ITEM_EXPANDED : im.UIListEvent.ITEM_COLLAPSED, true, targetItem]));
				else
					self.dispatchEvent(self.create(im.UIListEvent, [im.UIListEvent.ITEM_SELECTED, true, targetItem]));
				if(self._cl_isSubList)
					e.cancel();
			});
		}
		
		proto.Override.childrenReady = function(){
			this._cl_locked(true);
			proto.superclass().childrenReady.call(this);
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				thisPanel._cl_accordion = this;
				if(thisPanel._cl_subList)
					thisPanel._cl_subList._cl_parentList = this;
			}
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 */
		proto.addItem = function(listItem){
			this.addItemAtIndex(listItem, this.subViewCount());
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 * @param {Number} index
		 */
		proto.addItemAtIndex = function(listItem, index){
			if(listItem instanceof im.UIListItem){
				this._cl_locked(false);
				this.addPanel(listItem);
				this._cl_locked(true);
			}
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 */
		proto.removeItem = function(listItem){
			if(listItem instanceof im.UIListItem){
				this._cl_locked(false);
				this.removeSubView(listItem);
				this._cl_locked(true);
			}
		}
		
		/**
		 * 
		 * @param {Number} index
		 */
		proto.removeItemAtIndex = function(index){
			this.removeItem(this.subViewAtIndex(index));
		}
		
		/**
		 * 
		 */
		proto.removeAllItems = function(){
			this._cl_locked(false);
			this.removeAllSubViews();
			this._cl_locked(true);
		}
		
		proto.currentHeight = function(){
			var h = 0;
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				h += thisPanel.isExpanded() ? thisPanel.expandedSize() : thisPanel.collapsedSize();
			}
			if(this._cl_isSubList)
				this.height(h);
			return h;
		}
		
		/**
		 * How much to indent sub-lists.
		 * @param {Number} value
		 */
		proto.subListIndent = function(value){
			if(typeof value === 'number'){
				this._cl_subListIndent = value;
				return this;
			}
			return this._cl_subListIndent;
		}
		
		/**
		 * Whether or not sub-lists can be collapsed.  If false, the parent list item will not show the twirldown arrow, and will be locked in the expanded position.
		 * @param {Boolean} value
		 */
		proto.collapsibleSubLists = function(value){
			if(typeof value === 'boolean'){
				this._cl_collapsibleSubLists = value;
				return this;
			}
			return this._cl_collapsibleSubLists;
		}
		
		proto.Override.expandAllPanels = function(recursive){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.expandPanelAtIndex(x, recursive);
			}
		}
		
		proto.Override.expandPanelAtIndex = function(index, recursive){
			var expandedPanel = proto.superclass().expandPanelAtIndex.call(this, index);
			if(recursive === true && expandedPanel && expandedPanel.subList())
				expandedPanel.subList().expandAllPanels(true);
		}
		
		proto.Override.collapseAllPanels = function(recursive){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.collapsePanelAtIndex(x, recursive);
			}
		}
		
		proto.Override.collapsePanelAtIndex = function(index, recursive){
			var collapsedPanel = proto.superclass().collapsePanelAtIndex.call(this, index);
			if(recursive === true && collapsedPanel && collapsedPanel.subList())
				collapsedPanel.subList().collapseAllPanels(true);
		}
		
		proto.dealloc = function(){
			
		}
});


/**
 * @class Represents a column within a UITableView. Note that UITableColumn is not a view, and will not be rendered.  It is used for accessing the properties of a column.
 * @name a5.cl.ui.table.UITableColumn
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	
	.Prototype('UITableColumn', function(proto){
		
		proto.UITableColumn = function(){
			this._cl_resizable = true;
			this._cl_width = 'auto';
			this._cl_minWidth = 0;
		}
		
		proto.resizable = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizable = value;
				return this;
			}
			return this._cl_resizable;
		}
		
		proto.width = function(value){
			if(typeof value === 'number' || typeof value === 'string'){
				this._cl_width = value;
				return this;
			}
			return this._cl_width;
		}
	});



/**
 * @class A view representing a single cell within a table.
 * @name a5.cl.ui.table.UITableCell
 * @extends a5.cl.CLViewContainer
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.*',
			'a5.cl.ui.*')
	.Extends('UIControl')
	.Prototype('UITableCell', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'td';
			this._cl_defaultDisplayStyle = '';
			this._cl_contentWrapper = this.create(im.CLViewContainer);
		})
		
		proto.UITableCell = function(){
			proto.superclass(this);
			this._cl_rowIndex = -1;
			this._cl_columnIndex = -1;
			
			//TODO: add spanning
			this._cl_rowSpan = 1;
			this._cl_colSpan = 1;
			
			this._cl_viewElement.style.padding = '0';
			this._cl_contentWrapper.width('100%').height('auto');
			this._cl_contentWrapper._cl_defaultDisplayStyle = '';
			this._cl_viewElement.style.position = this._cl_contentWrapper._cl_viewElement.style.position = 'relative';
			this.addSubView(this._cl_contentWrapper);
			this._cl_childViewTarget = this._cl_contentWrapper;
		}
		
		proto.rowIndex = function(){
			return this._cl_rowIndex;
		}
		
		proto.columnIndex = function(){
			return this._cl_columnIndex;
		}
		
		proto.sortValue = function(){
			return 0; //default cell cannot be sorted.  Override this to enable sorting.
		}
		
		proto.Override._cl_render = function(){
			//proto.superclass()._cl_render.call(this);
		}
		
		proto.Override.padding = function(value){
			if (value !== undefined) {
				this._cl_contentWrapper.padding(value);
				return this;
			}
			return proto.superclass().padding.call(this, value);
		}
	});


/**
 * @class Acts as a cell within a UITableHeader.
 * @name a5.cl.ui.table.UITableHeaderCell
 * @extends a5.cl.ui.UIResizable
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*')
	.Extends('a5.cl.ui.table.UITableCell')
	.Static(function(UITableHeaderCell){
		UITableHeaderCell.ASCENDING = 'asc';
		UITableHeaderCell.DESCENDING = 'desc';
		
		UITableHeaderCell.sortAlpha = function(a, b){
			if(a === null || typeof a === 'undefined') a = "";
			if(b === null || typeof b === 'undefined') b = "";
			a = a + '';
			b = b + '';
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		};
		
		UITableHeaderCell.sortAlphaCaseInsensitive = function(a, b){
			if(a === null || typeof a === 'undefined') a = "";
			if(b === null || typeof b === 'undefined') b = "";
			a = (a + '').toLowerCase();
			b = (b + '').toLowerCase();
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		};
		
		UITableHeaderCell.sortNumeric = function(a, b){
			var returnVal = a - b;
			return (isNaN(returnVal) ? -1 : returnVal);
		}
	})
	.Prototype('UITableHeaderCell', function(proto, im, UITableHeaderCell){
		
		proto.UITableHeaderCell = function(label){
			this._cl_viewElementType = 'th';
			proto.superclass(this);
			this._cl_resizable = true;
			this._cl_sortable = false;
			this._cl_sortFunction = UITableHeaderCell.sortAlpha;
			this._cl_sortDirection = UITableHeaderCell.ASCENDING;
			this._cl_textField = this.create(im.UITextField);
			this._cl_sortArrow = this.create(a5.cl.CLHTMLView).width(8).height(8).alignX('right').alignY('middle').visible(false);
			this._cl_column = null;
			this._cl_columnIndex = 0;
			
			this.backgroundColor('#ddd').minWidth(5).minHeight(0).padding(3);
			
			this._cl_textField.width('100%').height('auto').alignY('middle').textAlign('center');
			this._cl_textField.addEventListener('CONTENT_UPDATED', function(e){
				this.redraw();
			}, false, this);
			if(typeof label === 'string')
				this._cl_textField.text(label);
				
			this.addSubView(this._cl_textField);
			this.addSubView(this._cl_sortArrow);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			//this.setCoordinates(['e']);
			
			this.addEventListener(im.UIMouseEvent.CLICK, function(e){
				//If we're already sorting on this column, flip the sort direction
				if(this._cl_sortArrow.visible())
					this._cl_sortDirection = (this._cl_sortDirection === UITableHeaderCell.ASCENDING ? UITableHeaderCell.DESCENDING : UITableHeaderCell.ASCENDING);
				this.dispatchEvent(this.create(im.UITableEvent, [im.UITableEvent.SORT_ROWS, false, this, this._cl_sortDirection]));
			}, false, this);
		}
		
		proto._cl_showSortArrow = function(direction){
			var arrowElement = a5.cl.ui.core.UIUtils.drawTriangle(direction === UITableHeaderCell.ASCENDING ? 'up' : 'down', '#aaa', 8, 8);
			this._cl_sortArrow.clearHTML().appendChild(arrowElement);
			this._cl_sortArrow.visible(true);
			this._cl_textField.width('-5');
		}
		
		proto._cl_hideSortArrow = function(){
			this._cl_sortArrow.visible(false);
			this._cl_textField.width('100%');
		}
		
		/**
		 * Gets or sets the column associated with this header cell.
		 * 
		 * @param {a5.cl.ui.table.UITablecolumn} value The column associated with this header cell.
		 */
		proto.column = function(value){
			if(value instanceof im.UITableColumn){
				this._cl_column = value;
				return this;
			}
			return this._cl_column;
		}
		
		/**
		 * Get or set the text label for this header cell.
		 * 
		 * @param {String} value The text label for this header cell.
		 */
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_textField.text(value);
				return this;
			}
			return this._cl_textField.text();
		}
		
		/**
		 * Get or set the function used for sorting.
		 * <br />This function follows the same rules as sort functions for Array.sort(), but should always sort in ascending order.
		 * <br />The function takes two parameters, representing two items.
		 * If the first item should come before the second, return a number >= 1.
		 * If the first item should come after the second, return a number <= -1.
		 * If the order of these items is irrelevant, return 0.
		 * 
		 * @param {Function} value The function used for sorting
		 */
		proto.sortFunction = function(value){
			if(typeof value === 'function'){
				this._cl_sortFunction = value;
				return this;
			}
			return this._cl_sortFunction;
		}
		
		/**
		 * Get or set the direction in which this column is being sorted.
		 * <br /> Possible values are a5.cl.ui.table.UITableHeaderCell.ASCENDING and a5.cl.ui.table.UITableHeaderCell.DESCENDING.
		 * 
		 * @param {string} value The direction to sort in.  Possible values are a5.cl.ui.table.UITableHeaderCell.ASCENDING and a5.cl.ui.table.UITableHeaderCell.DESCENDING.
		 */
		proto.sortDirection = function(value){
			if(value === UITableHeaderCell.ASCENDING || value === UITableHeaderCell.DESCENDING){
				this._cl_sortDirection = value;
				return this;
			}
			return this._cl_sortDirection;
		}
		
		/**
		 * Get or set whether this header cell is user-resizable.
		 * 
		 * @param {Boolean} value If true, the user can resize the column associated with this header.
		 */
		proto.resizable = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizable = value;
				//proto.superclass().enabled.call(this, value);
				return this;
			}
			return this._cl_resizable;
		}
		
		/**
		 * Get or set whether this header cell allows sorting.
		 * 
		 * @param {Boolean} value If true, the user can sort the table rows by clicking on this cell.
		 */
		proto.sortable = function(value){
			if(typeof value === 'boolean'){
				this._cl_sortable = value;
				this.usePointer(value).clickEnabled(value);
				return this;
			}
			return this._cl_sortable;
		}
		
		/**
		 * Retrieves the index of the column for which this cell is a header.
		 */
		proto.Override.columnIndex = function(){
			return this._cl_columnIndex;
		}
		
		proto.Override._cl_render = function(){
			
		}
		
		proto.Override.backgroundColor = function(value){
			return this._cl_contentWrapper.backgroundColor(value);
		}
		
		proto.dealloc = function(){
			this._cl_sortFunction = this._cl_textField = null;
		}
	});



/**
 * @class A table view, similar to an HTML table.
 * @name a5.cl.ui.table.UITableView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.CLView',
			'a5.cl.ui.*',
			'a5.cl.ui.events.UITableEvent')
	.Extends('UIControl')
	
	.Prototype('UITableView', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'table';
			this._cl_defaultDisplayStyle = '';
		})
		
		proto.UITableView = function(){
			proto.superclass(this);
			this._cl_rows = [];
			this._cl_cols = [];
			this._cl_header = null;
			this._cl_resizable = true;
			this._cl_defaultSortColumn = -1;
			this._cl_defaultSortDirection = im.UITableHeaderCell.ASCENDING;
			this._cl_defaultSortFunction = im.UITableHeaderCell.sortAlphaCaseInsensitive;
			this._cl_cellDividerColor = '#000';
			this._cl_cellDividerWidth = 1;
			
			this.border(1);
			this._cl_viewElement.style.borderCollapse = "collapse";
			
			this.width('100%').height('auto');//.relY(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			//listen for sort events
			this.addEventListener(im.UITableEvent.SORT_ROWS, this._cl_eSortHandler, true, this);
		}
		
		proto.Override.childrenReady = function(){
			proto.superclass().childrenReady.apply(this, arguments);
			//TODO: look for rows that were added by the ViewDef, and add them properly
			
		}
		
		proto._cl_eSortHandler = function(e){
			this.suspendRedraws(true);
			var rows = this._cl_rows.slice(this._cl_header ? 1 : 0);
			var columnIndex = e.headerCell().columnIndex();
			var sortFunction = e.headerCell().sortFunction();
			var sortDirection = e.sortDirection();
			if(this._cl_header){
				for(var x = 0, y = this._cl_header.cellCount(); x < y; x++){
					var thisCell = this._cl_header.getCellAtIndex(x);
					if(x === columnIndex)
						thisCell._cl_showSortArrow(sortDirection);
					else
						thisCell._cl_hideSortArrow();
				}
			}
			this._cl_sortRowArray(rows, sortFunction, columnIndex, sortDirection);
			this.removeAllRows(false, false);
			for(var x = 0, y = rows.length; x < y; x++){
				this.addRowAtIndex(rows[x], this._cl_rows.length);
			}
			this._cl_defaultSortColumn = columnIndex;
			this._cl_defaultSortFunction = sortFunction;
			this._cl_defaultSortDirection = sortDirection;
			this.suspendRedraws(false);
		}
		
		proto._cl_sortRowArray = function(rows, sortFunction, columnIndex, sortDirection){
			rows.sort(function(a, b){
				return sortFunction.call(
					null,
					a.getCellAtIndex(columnIndex).sortValue(),
					b.getCellAtIndex(columnIndex).sortValue()
				);
			});
			if(sortDirection === a5.cl.ui.table.UITableHeaderCell.DESCENDING)
				rows.reverse();
		}
		
		proto.Override._cl_redraw = function(force, suppressRender){
			var redrawVals = proto.superclass()._cl_redraw.call(this, true, false);
			im.CLView._cl_updateWH(this, this._cl_viewElement.offsetWidth, 'width', this.x(true), this._cl_minWidth, this._cl_maxWidth, this._cl_width);
			im.CLView._cl_updateWH(this, this._cl_viewElement.offsetHeight, 'height', this.y(true), this._cl_minHeight, this._cl_maxHeight, this._cl_height);
			
			/*if(redrawVals.shouldRedraw){
				var autoHeights = false;
				for(var x = 0, xl = this._cl_rows.length; x < xl; x++){
					var thisRow = this._cl_rows[x];
					if(thisRow._cl_autoHeight){
						autoHeights = true;
						var maxRowHeight = 0;
						for(var y = 0, yl = thisRow.cellCount(); y < yl; y++){
							var cellHeight = thisRow.getCellAtIndex(y).height('scroll');
							if(cellHeight > maxRowHeight)
								maxRowHeight = cellHeight;
						}
						thisRow._cl_height.auto = thisRow._cl_height.percent = thisRow._cl_height.relative = false;
						thisRow._cl_height.value = maxRowHeight;
					}
				}
				if(autoHeights){
					for (var i = 0, l = this.subViewCount(); i < l; i++) 
						this.subViewAtIndex(i)._cl_redraw(true, true);
					proto.superclass()._cl_redraw.call(this, force, true);
				}
				
				if(suppressRender !== true) 
					this._cl_render();
			}*/
		}
		
		proto._cl_updateColumnWidths = function(){
			var defaultWidth = 100 / this._cl_cols.length + '%',
				thisCell, thisColummn, thisRow, x, xl, y, yl;
			for(x = 0, xl = this._cl_rows.length; x < xl; x++){
				thisRow = this._cl_rows[x];
				for(y = 0, yl = thisRow.cellCount(); y < yl; y++){
					thisCell = thisRow.getCellAtIndex(y);
					thisColummn = this._cl_cols[y];
					thisCell.width(defaultWidth);
					thisCell.border({top:x > 0 ? this._cl_cellDividerWidth : 0, left:y > 0 ? this._cl_cellDividerWidth : 0, right:0, bottom:0}, 'solid', this._cl_cellDividerColor);
				}
			}
		}
		
		/**
		 * Add a UITableHeader row to the table.  If a header has already been added, the existing header will be replaced with the new one.
		 * 
		 * @param {a5.cl.ui.table.UITableHeader} header The header row to add to the table.
		 */
		proto.addHeader = function(header){
			this.addRowAtIndex(header, 0);
		}
		
		/**
		 * Removes the header row from the table
		 * 
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 * @return {a5.cl.ui.table.UITableHeader} Returns the header that was removed.
		 */
		proto.removeHeader = function(shouldDestroy){
			this.removeRow(this._cl_header, shouldDestroy);
		}
		
		/**
		 * Retrieves the UITableHeader for this table.
		 * 
		 * @return {a5.cl.ui.table.UITableHeader} The current header for this table.
		 */
		proto.getHeader = function(){
			return this._cl_header;
		}
				
		/**
		 * Add a UITableRow to this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 */
		proto.addRow = function(row){
			var index = this._cl_rows.length,
				rows, x, y;
			//if there's a default sort column, determine where to add the new row
			if(this._cl_defaultSortColumn >= 0 && (this._cl_defaultSortColumn < this._cl_cols.length || this._cl_defaultSortColumn < row.cellCount())){
				rows = this._cl_rows.slice(this._cl_header ? 1 : 0);
				rows.push(row);
				this._cl_sortRowArray(rows, this._cl_defaultSortFunction, this._cl_defaultSortColumn, this._cl_defaultSortDirection);
				for(x = 0, y = rows.length; x < y; x++){
					if(rows[x] === row){
						index = x;
						break;
					}
				}
			}
			this.addRowAtIndex(row, index);
		}
		
		/**
		 * Add a UITableRow to this table, at the specified index.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 * @param {Number} index The index at which to add to the row.
		 */
		proto.addRowAtIndex = this.Attributes(
		["a5.Contract", {row:'a5.cl.ui.table.UITableRow', index:'number'}], 
		function(args){
			if(!args) return;
			var row = args.row,
				index = args.index;
			//add the row
			if(row instanceof a5.cl.ui.table.UITableHeader){
				var isHeader = true;
				index = 0;
			} else if(this._cl_header){
				index++;
			}
			this._cl_rows.splice(index, 0, row);
			this.addSubViewAtIndex(row, index);
			if(isHeader){
				if(this._cl_header)
					this.removeHeader();
				this._cl_header = row;
				for(var x = 0, y = row.cellCount(); x < y; x++){
					var thisCell = row.getCellAtIndex(x);
					if(thisCell.column())
						this._cl_cols.splice(x, 1, thisCell.column());
					else if(this._cl_cols[x])
						thisCell.column(this._cl_cols[x]);
					if(!this._cl_resizable)
						thisCell.resizable(false);
				}
			}
			//add any columns that are needed
			for(var x = this._cl_cols.length, y = row.cellCount(); x < y; x ++){
				var newCol = a5.Create(a5.cl.ui.table.UITableColumn);
				this.addColumn(newCol);
			}
			this._cl_updateColumnWidths();
		})
		
		/**
		 * Remove a row from this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRow = function(row, shouldDestroy){
			for(var x = 0, y = this._cl_rows.length; x < y; x++){
				var thisRow = this._cl_rows[x];
				if(thisRow === row)
					return this.removeRowAtIndex(x, shouldDestroy);
			}
		}
		
		/**
		 * Remove a row from this table, at the specified index.
		 * 
		 * @param {Number} index The index of the row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRowAtIndex = function(index, shouldDestroy){
			if(index < 0 || index >= this._cl_rows.length) return;
			
			this._cl_rows.splice(index, 1);
			this.removeViewAtIndex(index, shouldDestroy !== false);
		}
		
		/**
		 * Removes all of the rows from the table.  By default, the headers are not removed.  To remove the headers, set the removeHeaders parameter to true.
		 * 
		 * @param {Boolean} [removeHeaders=false] If set to true, the headers are removed as well.  Defaults to false.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeAllRows = function(removeHeaders, shouldDestroy){
			for(var x = this._cl_rows.length - 1, y = this._cl_header ? 1 : 0; x >= y; x--){
				this.removeRowAtIndex(x, shouldDestroy);
			}
			if(removeHeaders === true && this._cl_header){
				this.removeHeader(shouldDestroy);
			}
		}
		
		/**
		 * Add a column to this table. Note that this is purely informational, and does not actually add any cells.
		 * 
		 * @param {a5.cl.ui.table.UITableColumn} column The column to add.
		 */
		proto.addColumn = this.Attributes(
		["a5.Contract", {column:'a5.cl.ui.table.UITableColumn'}], 
		function(args){
			if (args) {
				if(this._cl_header && this._cl_header.getCellAtIndex(this._cl_cols.length))
					this._cl_header.getCellAtIndex(this._cl_cols.length).column(args.column);
				this._cl_cols.push(args.column);
			}
		})
		
		/**
		 * Remove a column from this table. This will remove the cells associated with the specified column.
		 * 
		 * @param {a5.cl.ui.table.UITableColumn} column The column to remove.
		 */
		proto.removeColumn = function(column){
			
		}
		
		/**
		 * Remove a column from this table, at the specified index. This will remove the cells associated with the specified column.
		 * 
		 * @param {Number} index The index of the column to remove.
		 */
		proto.removeColumnAtIndex = function(index){
			
		}
		
		
		/**
		 * Retrieve the row at the specified index.
		 * 
		 * @param {Number} index The index of the row to retrieve.
		 * @return {a5.cl.ui.table.UITableRow} The row that was retrieved.
		 */
		proto.getRowAtIndex = function(index){
			return this._cl_rows[index];
		}
		
		/**
		 * Retrieve the column at the specified index.
		 * 
		 * @param {Number} index The index of the column to retrieve.
		 * @return {a5.cl.ui.table.UITableColumn} The column that was retrieved.
		 */
		proto.getColumnAtIndex = function(index){
			return this._cl_cols[index];
		}
		
		/**
		 * Get the total number of rows in the table.
		 * 
		 * @return {Number} The total number of rows in the table.
		 */
		proto.rowCount = function(){
			return this._cl_rows.length;
		}
		
		/**
		 * Get the total number of columns in the table.
		 * 
		 * @return {Number} The total number of columns in the table.
		 */
		proto.columnCount = function(){
			return this._cl_cols.length;
		}
		
		/**
		 * Disables column resizing for all columns.
		 */
		proto.disableResize = function(){
			this._cl_resizable = false;
			if(this._cl_header){
				for(var x = 0, y = this._cl_header.cellCount(); x < y; x++){
					this._cl_header.getCellAtIndex(x).resizable(false);
				}
			}
			return this;
		}
		
		/**
		 * Allows columns to be resizable.  Note that this does not explicitly set resizable to true for any of the columns.
		 */
		proto.enableResize = function(){
			this._cl_resizable = true;
			return this;
		}
		
		/**
		 * Get or Set the default column index to sort on. Defaults to -1, which is no default sorting.
		 * 
		 * @param {Number} value The index of the column to sort on by default.
		 */
		proto.defaultSortColumn = function(value){
			if(typeof value === 'number'){
				this._cl_defaultSortColumn = Math.floor(value);
				return this;
			}
			return this._cl_defaultSortColumn;
		}
		
		/**
		 * Get or Set the default sort direction.  Defaults to ascending.
		 * 
		 * @param {Number} value The direction to sort by default.
		 */
		proto.defaultSortDirection = function(value){
			if(value === a5.cl.ui.table.UITableHeaderCell.ASCENDING || value === a5.cl.ui.table.UITableHeaderCell.DESCENDING){
				this._cl_defaultSortDirection = value;
				return this;
			}
			return this._cl_defaultSortDirection;
		}
		
		/**
		 * Get or Set the default sort function. Defaults to a case-insensitive alphabetical sort.
		 * 
		 * @param {Number} value The sort function to use.
		 */
		proto.defaultSortFunction = function(value){
			if(typeof value === 'function'){
				this._cl_defaultSortFunction = value;
				return this;
			}
			return this._cl_defaultSortFunction;
		}
	});



a5.Package('a5.cl.ui.table')
	.Extends('a5.cl.ui.UIHTMLControl')
	.Prototype('UIHtmlTable', function(proto, im){
		
		proto.UIHtmlTable = function(){
			proto.superclass(this);
			this._cl_rows = [];
			this._cl_cols = [];
			this._cl_header = null;
			this._cl_cellDividerColor = '#000';
			this._cl_cellDividerWidth = 1;
			this._cl_table = document.createElement('table');
			this._cl_table.setAttribute('border', '1');
			this._cl_table.style.borderCollapse = "collapse";
			
			this.width('auto').height('auto');//.border(1, 'solid', '#000');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this.appendChild(this._cl_table);
		}
		
		/**
		 * Add a UITableHeader row to the table.  If a header has already been added, the existing header will be replaced with the new one.
		 * 
		 * @param {a5.cl.ui.table.UITableHeader} header The header row to add to the table.
		 */
		proto.addHeader = function(header){
			this.addRowAtIndex(header, 0);
		}
		
		/**
		 * Removes the header row from the table
		 * 
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 * @return {a5.cl.ui.table.UITableHeader} Returns the header that was removed.
		 */
		proto.removeHeader = function(shouldDestroy){
			this.removeRow(this._cl_header, shouldDestroy);
		}
		
		/**
		 * Retrieves the UITableHeader for this table.
		 * 
		 * @return {a5.cl.ui.table.UITableHeader} The current header for this table.
		 */
		proto.getHeader = function(){
			return this._cl_header;
		}
				
		/**
		 * Add a UITableRow to this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 */
		proto.addRow = function(row){
			this.addRowAtIndex(row, this._cl_rows.length);
		}
		
		/**
		 * Add a UITableRow to this table, at the specified index.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 * @param {Number} index The index at which to add to the row.
		 */
		proto.addRowAtIndex = this.Attributes(
		["a5.Contract", {row:'a5.cl.ui.table.UITableRow', index:'number'}], 
		function(args){
			if(!args) return;
			//add the row
			if(args.row instanceof a5.cl.ui.table.UITableHeader){
				var isHeader = true;
				args.index = 0;
			} else if(this._cl_header){
				args.index++;
			}
			var rowElement = args.row.toHTML();
			if(args.index < this._cl_rows.length)
				this._cl_table.insertBefore(rowElement, this._cl_rows[args.index]);
			else
				this._cl_table.appendChild(rowElement);
			this._cl_rows.splice(args.index, 0, rowElement);
			
			this._cl_replaceNodeValue(this._cl_viewElement, this._cl_table);
		})
		
		/**
		 * Remove a row from this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRow = function(row){
			for(var x = 0, y = this._cl_rows.length; x < y; x++){
				var thisRow = this._cl_rows[x];
				if(thisRow === row)
					return this.removeRowAtIndex(x);
			}
		}
		
		/**
		 * Remove a row from this table, at the specified index.
		 * 
		 * @param {Number} index The index of the row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRowAtIndex = function(index){
			if(index < 0 || index >= this._cl_rows.length) return;
			
			var removedRow = this._cl_rows.splice(index, 1)[0];
			this._cl_table.removeChild(removedRow);
		}
		
		/**
		 * Removes all of the rows from the table.  By default, the headers are not removed.  To remove the headers, set the removeHeaders parameter to true.
		 * 
		 * @param {Boolean} [removeHeaders=false] If set to true, the headers are removed as well.  Defaults to false.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeAllRows = function(removeHeaders){
			for(var x = this._cl_rows.length - 1, y = this._cl_header ? 1 : 0; x >= y; x--){
				this.removeRowAtIndex(x);
			}
			if(removeHeaders === true && this._cl_header){
				this.removeHeader();
			}
		}
		
		/**
		 * Retrieve the row at the specified index.
		 * 
		 * @param {Number} index The index of the row to retrieve.
		 * @return {a5.cl.ui.table.UITableRow} The row that was retrieved.
		 */
		proto.getRowAtIndex = function(index){
			return this._cl_rows[index];
		}
		
		/**
		 * Get the total number of rows in the table.
		 * 
		 * @return {Number} The total number of rows in the table.
		 */
		proto.rowCount = function(){
			return this._cl_rows.length;
		}
});



/**
 * @class Represents a row of cells within a UITableView.
 * @name a5.cl.ui.table.UITableRow
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UIControl')
	
	.Prototype('UITableRow', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'tr';
			this._cl_defaultDisplayStyle = '';
		})
		
		proto.UITableRow = function(){
			proto.superclass(this);
			this._cl_cells = [];
			this.height('auto').relX(true);
			this._cl_autoHeight = true;
			
			this._cl_viewElement.style.position = 'relative';
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
		}
		
		proto.toHTML = function(){
			var tr = document.createElement('tr');
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var td = document.createElement('td'),
					thisCell = this._cl_cells[x];
				if(thisCell instanceof a5.cl.ui.table.UITextCell)
					td.innerHTML = thisCell.text();
				tr.appendChild(td);
			}
			return tr;
		}
		
		proto.staticHeight = function(value){
			if(typeof value !== 'undefined')
				this._cl_autoHeight = value === 'auto';
			return proto.superclass().height.call(this, value);
		}
		
		/**
		 * Add a cell to the end of this row.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to add.
		 */
		proto.addCell = function(cell){
			this.addCellAtIndex(cell, this._cl_cells.length);
		}
		
		/**
		 * Add a cell to this row, at the specified index.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to add.
		 * @param {Number} index The index at which to add the cell.
		 */
		proto.addCellAtIndex = this.Attributes(
		["a5.Contract", {cell:'a5.cl.ui.table.UITableCell', index:'number'}], 
		function(args){
			if(args){
				this._cl_cells.splice(args.index, 0, args.cell);
				this.addSubViewAtIndex(args.cell, args.index);
			}
		})
		
		/**
		 * Remove a cell from this row.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to remove.
		 * @return {a5.cl.ui.table.UITableCell} Returns the cell that was removed.
		 */
		proto.removeCell = function(cell){
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var thisCell = this._cl_cells[x];
				if(thisCell === cell)
					return this.removeCellAtIndex(x);
			}
			return null;
		}
		
		/**
		 * Remove the cell at the specified index.
		 * 
		 * @param {Number} index The index of the cell to be removed.
		 * @return {a5.cl.ui.table.UITableCell} Returns the cell that was removed.
		 */
		proto.removeCellAtIndex = function(index){
			this.removeSubView(this._cl_cells[index]);
			return this._cl_cells.splice(index, 1)[0];
		}
		
		/**
		 * Retrieve the cell at the specified index.
		 * 
		 * @param {Number} index The index of the cell to retrieve.
		 */
		proto.getCellAtIndex = function(index){
			if(index < 0 || index >= this._cl_cells.length) return;
			return this._cl_cells[index];
		}
		
		/**
		 * Returns the total number of cells that are in this row.
		 */
		proto.cellCount = function(){
			return this._cl_cells.length;
		}
		
		proto.Override.addedToParent = function(parentView){
			proto.superclass().addedToParent.apply(this, arguments);
			if(!(parentView instanceof im.UITableView))
				throw 'Error: instances of UITableRow must not be added to a parent view other than an instance of UITableView.';
		}
		
		proto.Override._cl_render = function(){
			//proto.superclass()._cl_render.call(this);
			this._cl_currentViewElementProps = this._cl_pendingViewElementProps;
			this._cl_pendingViewElementProps = {};
			this.viewRedrawn();
		}
	});


/**
 * @class The header row within a UITableView.  This is like a UITableRow, but can only contain UITableHeaderCells.
 * @name a5.cl.ui.table.UITableHeader
 * @extends a5.cl.ui.table.UITableRow
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UITableRow')
	
	.Prototype('UITableHeader', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'thead';
		})
		
		proto.UITableHeader = function(){
			proto.superclass(this);
		}
		
		proto.Override.toHTML = function(){
			var thead = document.createElement('thead');
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var th = document.createElement('th'),
					thisCell = this._cl_cells[x];
				th.innerHTML = thisCell.label();
				th.style.backgroundColor = "#ddd";
				thead.appendChild(th);
			}
			return thead;
		}
		
		/**
		 * Add a header cell to the end of this header row.
		 * 
		 * @param {a5.cl.ui.list.UITableHeaderCell} cell The header cell to add.
		 */
		proto.Override.addCell = function(cell){
			this.addCellAtIndex(cell, this._cl_cells.length);
		}
		
		/**
		 * Add a header cell to this header row, at the specified index.
		 * 
		 * @param {a5.cl.ui.list.UITableHeaderCell} cell The header cell to add.
		 * @param {Number} index The index at which to add the header cell.
		 */
		proto.Override.addCellAtIndex = this.Attributes(
		["a5.Contract", {cell:'a5.cl.ui.table.UITableHeaderCell', index:'number'}], 
		function(args){
			if(args){
				this._cl_cells.splice(args.index, 0, args.cell);
				this.addSubViewAtIndex(args.cell, args.index);
				args.cell._cl_columnIndex = args.index;
			}
		})
	});


a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UITableCell')
	
	.Prototype('UITextCell', function(proto, im){
		
		proto.UITextCell = function(text){
			proto.superclass(this);
			this._cl_textField = this.create(im.UITextField)
				.width('100%').height('auto').alignY('middle');
			this._cl_textField.addEventListener('CONTENT_UPDATED', function(e){
				this.redraw();
			}, false, this);
			if(typeof text === 'string')
				this._cl_textField.text(text);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_textField);
		}
		
		proto.text = function(value){
			if (value !== undefined) {
				this._cl_textField.text(value + '');
				return this;
			}
			return this._cl_textField.text();
		}
		
		proto.Override.sortValue = function(){
			return this.text();
		}
		
		proto.textField = function(){
			return this._cl_textField;
		}
		
		proto.dealloc = function(){
			this._cl_textField = null;
		}
	});



})(a5);