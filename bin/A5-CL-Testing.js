//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com
(function( a5, undefined ) {
a5.Package('a5.cl')
	
	.Extends('a5.cl.CLBase')
	.Static(function(CLUnitTest){
		
		CLUnitTest.COMPLETE = 'a5_cl_testing_complete';
		
		CLUnitTest._cl_testRef = null;
		
		CLUnitTest.testingRef = function(){
			return CLUnitTest._cl_testRef || a5.cl.testing.Testing();
		}
		
	})
	.Prototype('CLUnitTest', 'singleton', function(proto, im, CLUnitTest){
		
		this.Properties(function(){
			this._cl_async = false;
		})
		
		proto.CLUnitTest = function(){
			proto.superclass(this);
		}
		
		proto.asyncTest = function(){
			this._cl_async = true;
		}
		
		proto.runTest = function(){
			if(this.runTest === proto.runTest)
				this.error('runTest method not implemented on CLUnitTest class ' + this.namespace());
		}
		
		proto.Override.assert = function(check, response){
			proto.superclass().assert.call(this, check, this.className() + " Assertion Failure: " + response)
		}
		
		proto.testComplete = function(){
			if(this._cl_async == true)
				this.dispatchEvent(CLUnitTest.COMPLETE);
		}
		
		proto.Override.log = function(value){
			CLUnitTest.testingRef().log(value);
		}
		
		proto.Override.warn = function(value){
			CLUnitTest.testingRef().warn(value);
		}
		
		proto.error = function(value){
			CLUnitTest.testingRef().fail(value);
		}
		
		proto.fail = function(value){
			CLUnitTest.testingRef().fail(value);
		}

});

if(a5.GetNamespace('a5.cl.mvc', null, true)){
	a5.Package('a5.cl.testing.core')
		
		.Extends('a5.cl.CLController')
		.Class('ErrorHandler', function(self, im, ErrorHandler){
			
			var console;
		
			self.ErrorHandler = function($console){
				console = $console;
				self.superclass(this);
			}
			
			/*
			self._500 = function(msg, info){
				console.renderError(500, msg, info);
			}
			
			self._400 = function(msg, info){
				console.renderError(404, msg, info);
			}
			*/
	});
}


a5.Package('a5.cl.testing')
	
	.Interface('IResultService', function(cls){
		
		cls.sendResults = function(){}
		
});


if(a5.GetNamespace('a5.cl.mvc', null, true)){
	a5.Package('a5.cl.testing.core')
		
		.Import()
		.Extends('a5.cl.mvc.core.SystemWindow')
		.Class('TestingConsole', function(self, im, TestingConsole){
			
			var testing,
				runBtn,
				toggleBtn,
				header,
				infoBar,
				counts = {error:0, warn:0, log:0, fail:0},
				fullDisplay = true;
				console;
		
			self.TestingConsole = function($testing){
				testing = $testing;
				self.superclass(this);
				self.relY(true).constrainChildren(true).minWidth(500);
				runBtn = self.create(a5.cl.ui.buttons.UIButton, ['Start tests']);
				runBtn.alignX('center').y(20);
				header = self.create(a5.cl.CLViewContainer);
				header.height(27);
				infoBar = self.create(a5.cl.CLViewContainer);
				infoBar.border(1).hide();
				countsView = self.create(a5.cl.ui.UITextField);
				countsView.nonBreaking(true).x(5).y(3);
				toggleBtn = self.create(a5.cl.ui.buttons.UIButton, ['Minimize']);
				toggleBtn.addEventListener(a5.cl.ui.events.UIMouseEvent.CLICK, eToggleDisplayHandler);
				toggleBtn.alignX('right').x(-1).y(1);
				var title = self.create(a5.cl.ui.UITextField, ['A5 Testing Suite']);
				title.alignX('center').y(100).fontSize(20).bold(true).width('auto').nonBreaking(true);
				console = self.create(a5.cl.CLViewContainer);
				console.alignX('center').y(20).relY(true);
				console.scrollYEnabled(true).width('60%').height(200).border(1);
				runBtn.addEventListener(a5.cl.ui.events.UIMouseEvent.CLICK, eRunTestsHandler);
				header.addSubView(infoBar);
				infoBar.addSubView(countsView);
				header.addSubView(toggleBtn);
				self.addSubView(header);
				self.addSubView(title);
				self.addSubView(runBtn);
				self.addSubView(console);
				updateCounts();
			}
			
			self.renderError = function(type, msg, info){
				console.log(type + ': ' + msg);
			}
			
			self.showStatus = function(type, value){
				var tf = self.create(a5.cl.ui.UITextField, [(type.substr(0, 1).toUpperCase() + type.substr(1)) + ': ' + value]);
				tf.border(1).bold(true).padding(2);
				switch(type){
					case 'error':
					case 'fail':
						tf.backgroundColor('#FFB6C1');
						tf.textColor('#FF0000');
						break;
					case 'warn':
						tf.backgroundColor('#FFFF00');
						break;
					case 'log':
						
						break;
				}
				updateCounts(type, 1);
				console.addSubView(tf);
			}
			
			var updateCounts = function(type, value){
				if(type && value)
					counts[type] += value;
				countsView.text('<b>A5 Testing Suite</b>              Fails: ' + counts.fail + ' | Errors: ' + counts.error + ' | Warnings: ' + counts.warn + ' | Logs: ' + counts.log);
			}
			
			var eRunTestsHandler = function(){
				testing.startTests();
			}
			
			var eToggleDisplayHandler = function(){
				fullDisplay = !fullDisplay;
				if(fullDisplay){
					toggleBtn.label('Minimize');
					infoBar.hide();
					self.height('100%');	
				} else {
					toggleBtn.label('Maximize');
					infoBar.show();
					self.height(27)
				}
			}
	
	});
}


a5.Package('a5.cl.testing.core')

	.Extends('a5.cl.CLBase')
	.Class('TestFrame', function(cls, im){
		
		var testRef,
			iframe,
			doc;
		
		cls.TestFrame = function($testRef, url){
			cls.superclass(this);
			testRef = $testRef;
			iframe = document.createElement('iframe');
			iframe.frameBorder = 0;
			iframe.style.width = iframe.style.height = '0px';
			iframe.src = url;
			this.cl().addEventListener(a5.cl.CLEvent.GLOBAL_UPDATE_TIMER_TICK, checkFrameDOM, false, this);
			document.body.appendChild(iframe);
		}	
		
		cls.getA5 = function(){
			return frameEval('a5');
		}
		
		cls.context = function(){
			return iframe.contentWindow.window;
		}
		
		var frameEval = function(str){
			iframe.contentWindow.focus();
			return iframe.contentWindow.eval(str);
		}
		
		var checkFrameDOM = function(){
			var isReady = false;
			try{
				if(frameEval('"a5" in window') && frameEval('a5.cl') !== undefined)
					isReady = true;
			} catch(e){}
			if(isReady){
				this.cl().removeEventListener(a5.cl.CLEvent.GLOBAL_UPDATE_TIMER_TICK, checkFrameDOM);
				this.dispatchEvent('READY');
			}	
				
		}
		
})


a5.Package('a5.cl.testing')
	
	.Import('a5.cl.CLUnitTest')	
	.Extends('a5.cl.CLAddon')
	.Class('Testing', function(self, im, Testing){
		
		var testCount,
			totalTests,
			testRef = [],
			resultArray = [],
			consoleWindow,
			testFrame,
			lastTestStart,
			fullTestStart,
			suiteFail = false,
			didFail = false,
			runningTest,
			interceptCallback,
			didRun = false;
			
		self.Testing = function(){
			self.superclass(this);
			self.registerForProcess('logger');
			self.registerForProcess('launchInterceptor');
			this.configDefaults({
				runTests:false,
				resultCallback:null,
				logResult:true,
				iframeURL:null,
				showConsole:false,
				runThirdPartyTests:false,
				restrictEnvironments:null,
				resultService:null,
				launchAfterTest:false
			})
		}
		
		self.initializePlugin = function(){
			if (self.pluginConfig().resultService) {
				var svc = a5.GetNamespace(self.pluginConfig().resultService);
				if (!svc || svc && !svc instanceof a5.cl.CLAjax || !svc.doesImplement('a5.cl.testing.IResultService')) {
					self.throwError('resultService property on add-on Testing must implement a5.cl.testing.IResultService.');
					self.pluginConfig().resultService = null;
					return;
				}
			}
			if(self.pluginConfig().iframeURL){
				testFrame = self.create(a5.cl.testing.core.TestFrame, [this, self.pluginConfig().iframeURL]);
				testFrame.addEventListener('READY', function(){
					prepComplete();
				})
			} else {
				if(a5.GetNamespace(a5.cl.ui) && self.pluginConfig().showConsole === true){
					consoleWindow = self.create(a5.cl.testing.core.TestingConsole, [this]);
					self.create('a5.cl.testing.ErrorHandler', [consoleWindow]);
					self.cl().MVC().addMapping({desc:500, controller:'a5.cl.testing.ErrorHandler', action:'_500'});
					self.cl().MVC().addMapping({desc:404, controller:'a5.cl.testing.ErrorHandler', action:'_404'});
					self.cl().MVC().application().addWindow(consoleWindow);
				}
				prepComplete();
			}
		}
		
		var prepComplete = function(){
			if(self.pluginConfig().runTests === true)
				self.startTests();
		}
		
		self.interceptLaunch = function(callback){
			interceptCallback = callback;
			return true;
		}	
		
		self.log = function(value){
			showStatus('log', value);
		}
		
		self.error = function(value){
			showStatus('error', value);
		}
		self.fail = function(value){
			didFail = true;
			suiteFail = true;
			showStatus('fail', value);
			eTestCompleteHandler();
		}
		
		self.warn = function(value){
			showStatus('warn', value);
		}
		
		self.startTests = function(){	
			if (!didRun && validateEnvironment()) {
				didRun = true;
				fullTestStart = new Date();
				var appReady = 	function(){
					var a5ctx = a5;
					if (testFrame) {
						a5ctx = testFrame.context().a5;
						a5ctx.cl.CLUnitTest._cl_testRef = self;
					}
					var app = testFrame ? a5ctx.cl.instance().applicationPackage() : self.cl().applicationPackage(),
						pkg = app['tests'];
					
					
					for(var i = 0, l =a5ctx.cl.CLUnitTest._extenderRef.length; i<l; i++){
						var clsRef = a5ctx.cl.CLUnitTest._extenderRef[i];
						if(clsRef.classPackage(true) === pkg)
							testRef.push(clsRef);
						else if (self.pluginConfig().runThirdPartyTests === true)
							testRef.push(clsRef);
					}		

					totalTests = testRef.length;
					testCount = 0;
					resultArray = [];
					if (totalTests === 0) {
						self.error('No valid tests present in application.');
						testComplete();
					} else {
						triggerNextTest();
					}
				}

				var checkLoadStatus = function(app){
					state = app.launchState();
					if (app.launchState() > a5.cl.CLLaunchState.PLUGINS_LOADED) {
						appReady();
					} else {
						app.addOneTimeEventListener(testFrame.context().a5.cl.CLEvent.PLUGINS_LOADED, function(){
							appReady();
						})
					}
				}


				if (testFrame) {
					var app = testFrame.context().a5.cl.instance();
					if (app) {
						checkLoadStatus(app);
					} else {
						testFrame.context().a5.cl.CreateCallback(function(app){
							checkLoadStatus(app);
						})
					} 
				} else {
					appReady();
				}
				
			}
		}
		
		var showStatus = function(type, value){
			resultArray.push(type + ': ' + value);
			if(consoleWindow)
				consoleWindow.showStatus(type, value);
			else if(window.console !== undefined)
				console.log(value);
			if (!a5.GetNamespace(a5.cl.mvc)) {
				var elem = document.createElement('div');
				elem.innerHTML = type + ': ' + value;
				if(type === 'error' || type === 'fail')
					elem.style.color = 'red';
				document.body.appendChild(elem);
				elem = null;
			}
		}
		
		var triggerNextTest = function(){
			if (testCount === totalTests) {
				testComplete();
			} else {
				didFail = false;
				var testCls = testRef[testCount],
					ctx = testFrame ? testFrame.context().a5.cl.instance() : self,
					async;
				runningTest = ctx.create(testCls.namespace());
				async = runningTest._cl_async;
				if(async === true)
					runningTest.addEventListener(im.CLUnitTest.COMPLETE, eTestCompleteHandler);
				testCount++;
				lastTestStart = new Date();
				try {
					runningTest.runTest();
				} catch(e){
					runningTest.error(e);
				}
				if(!async)
					eTestCompleteHandler();
			}
		}
		
		var eTestCompleteHandler = function(e){
			var time = new Date() - lastTestStart;
			lastTestStart = null;
			if(!didFail)
				self.log('Test "' + runningTest.className() + '" completed successfully in ' + time + ' ms.');
			runningTest.removeEventListener(im.CLUnitTest.COMPLETE, eTestCompleteHandler);
			runningTest.destroy();
			triggerNextTest();
		}
		
		var validateEnvironment = function(){
			if(self.pluginConfig().restrictEnvironments === null){
				return true;
			} else {
				var envs = self.pluginConfig().restrictEnvironments.split('|');
				for(var i = 0, l = envs.length; i<l; i++)
					if(envs[i] === self.cl().environment())
						return true;
				return false;
			}
		}
		
		var testComplete = function(){
			runningTest = null;
			var totalTime = new Date() - fullTestStart;
			fullTestStart = null;
			self.log('Test run completed' + (suiteFail ? ' with failures':'') + ' in ' + totalTime + ' ms.');
			if (self.pluginConfig().resultCallback && typeof self.pluginConfig().resultCallback === 'function') 
				self.pluginConfig().resultCallback(results);
			if (self.pluginConfig().resultService) 
				sendResultsViaService();
			if(self.pluginConfig().launchAfterTest === true)
				interceptCallback();
		}
		
		var sendResultsViaService = function(){
			var svc = self.create(self.pluginConfig().resultService);
			svc.sendResults(resultArray);
		}
});


})(a5);