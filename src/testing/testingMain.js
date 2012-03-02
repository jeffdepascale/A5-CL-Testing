
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
		
		self.Override.initializePlugin = function(){
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
		
		self.Override.log = function(value){
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
		
		self.Override.warn = function(value){
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