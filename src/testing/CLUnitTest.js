
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