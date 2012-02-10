
a5.Package('a5.cl.testing')
	
	.Extends('a5.cl.CLBase')
	.Static(function(CLUnitTest){
		
		CLUnitTest.COMPLETE = 'a5_cl_testing_complete';
		
		CLUnitTest._cl_testRef = null;
		
		CLUnitTest.testingRef = function(){
			return CLUnitTest._cl_testRef || a5.cl.testing.Testing();
		}
		
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
			CLUnitTest.testingRef().log(value);
		}
		
		proto.warn = function(value){
			CLUnitTest.testingRef().warn(value);
		}
		
		proto.error = function(value){
			CLUnitTest.testingRef().fail(value);
		}
		
		proto.fail = function(value){
			CLUnitTest.testingRef().fail(value);
		}

});