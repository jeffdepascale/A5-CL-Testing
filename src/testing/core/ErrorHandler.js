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