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
				if(frameEval('a5.cl') !== undefined)
					isReady = true;
			} catch(e){}
			if(isReady){
				this.cl().removeEventListener(a5.cl.CLEvent.GLOBAL_UPDATE_TIMER_TICK, checkFrameDOM);
				this.dispatchEvent('READY');
			}	
				
		}
		
})