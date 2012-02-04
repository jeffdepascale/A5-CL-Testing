
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