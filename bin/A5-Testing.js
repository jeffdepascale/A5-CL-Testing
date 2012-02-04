//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com
(function( a5, undefined ) {
a5.Package('a5.cl.testing')
	
	.Extends('a5.cl.CLBase')
	.Static(function(CLUnitTest){
		
		CLUnitTest.COMPLETE = 'a5_cl_testing_complete'
		
	})
	.Prototype('CLUnitTest', 'singleton', function(proto, im, CLUnitTest){
		
		proto.CLUnitTest = function(){
			proto.superclass(this);
		}
		
		proto.runTest = function(){
			
		}
		
		proto.priority = function(){
			
		}
		
		proto.watch = function(){
			
		}
		
		proto.testComplete = function(){
			this.dispatchEvent(CLUnitTest.COMPLETE);
		}
		
		proto.log = function(value){
			this.Testing().log(value);
		}
		
		proto.warn = function(value){
			this.Testing().warn(value);
		}
		
		proto.error = function(value){
			this.Testing().fail(value);
		}
		
		proto.fail = function(value){
			this.Testing().fail(value);
		}

});


a5.Package('a5.cl.testing')
	
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


a5.Package('a5.cl.testing')
	
	.Interface('IResultService', function(cls){
		
		cls.sendResults = function(){}
		
});


a5.Package('a5.cl.testing')
	
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


})(a5);