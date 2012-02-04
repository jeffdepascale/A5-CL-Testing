
a5.Package('a5.cl.testing')

	.Extends('a5.cl.CLAddon')
	.Class('Testing', function(self, im, Testing){
		
		var testCount,
			totalTests,
			testRef = [],
			resultArray = [],
			consoleWindow,
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
				showConsole:false,
				runThirdPartyTests:true,
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
			if(self.pluginConfig().showConsole === true){
				consoleWindow = self.create(im.TestingConsole, [this]);
				self.create('a5.cl.testing.ErrorHandler', [consoleWindow]);
				self.cl().MVC().addMapping({desc:500, controller:'a5.cl.testing.ErrorHandler', action:'_500'});
				self.cl().MVC().addMapping({desc:404, controller:'a5.cl.testing.ErrorHandler', action:'_404'});
				self.cl().MVC().application().addWindow(consoleWindow);
			}
			if(self.pluginConfig().runTests === true)
				self.startTests();
		}
		
		self.interceptLaunch = function(callback){
			interceptCallback = callback;
			return true;
		}	
		
		self.log = function(value){
			resultArray.push('Log: ' + value);
			if(consoleWindow)
				consoleWindow.showStatus('log', value);
			else if(window.console !== undefined)
				console.log(value);
		}
		
		self.error = function(value){
			resultArray.push('Error: ' + value);
			if(consoleWindow)
				consoleWindow.showStatus('error', value);
			else if(window.console !== undefined)
				console.error(value);
		}
		self.fail = function(value){
			didFail = true;
			suiteFail = true;
			var str = 'Test "' + runningTest.className() + '" failed, reason: "' + value + '"';
			resultArray.push(str);
			if(consoleWindow)
				consoleWindow.showStatus('fail', str);
			else if(window.console !== undefined)
				console.error(value);
			eTestCompleteHandler();
		}
		
		self.warn = function(value){
			resultArray.push('Warning: ' + value);
			if(consoleWindow)
				consoleWindow.showStatus('warn', value);
			else if(window.console !== undefined)
				console.warn(value);
		}
		
		self.startTests = function(){			
			if (!didRun && validateEnvironment()) {
				didRun = true;
				fullTestStart = new Date();
				if (self.pluginConfig().runThirdPartyTests === true) {
					for(var i = 0, l =a5.cl.testing.CLUnitTest._extenderRef.length; i<l; i++)
						testRef.push(a5.cl.testing.CLUnitTest._extenderRef[i])
				} else {
					var nm = a5.GetNamespace(self.cl().applicationPackage())['tests'];
					for (var prop in nm) {
						var cls = nm[prop];
						if(cls.doesExtend && cls.doesExtend('a5.cl.testing.CLUnitTest'))
							testRef.push(cls);
					}
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
		}
		
		var triggerNextTest = function(){
			if (testCount === totalTests) {
				testComplete();
			} else {
				didFail = false;
				var testCls = a5.cl.testing.CLUnitTest._extenderRef[testCount];
				runningTest = self.create(testCls);
				runningTest.addEventListener(im.CLUnitTest.COMPLETE, eTestCompleteHandler);
				testCount++;
				lastTestStart = new Date();
				runningTest.runTest();
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