//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com(function(a,b){a.Package("a5.cl.testing").Extends("a5.cl.CLBase").Static(function(c){c.COMPLETE="a5_cl_testing_complete"}).Prototype("CLUnitTest","singleton",function(e,d,c){e.CLUnitTest=function(){e.superclass(this)};e.runTest=function(){};e.priority=function(){};e.watch=function(){};e.testComplete=function(){this.dispatchEvent(c.COMPLETE)};e.log=function(f){this.Testing().log(f)};e.warn=function(f){this.Testing().warn(f)};e.error=function(f){this.Testing().fail(f)};e.fail=function(f){this.Testing().fail(f)}});a.Package("a5.cl.testing").Extends("a5.cl.CLController").Class("ErrorHandler",function(f,c,e){var d;f.ErrorHandler=function(g){d=g;f.superclass(this)}});a.Package("a5.cl.testing").Interface("IResultService",function(c){c.sendResults=function(){}});a.Package("a5.cl.testing").Import().Extends("a5.cl.mvc.core.SystemWindow").Class("TestingConsole",function(o,k,n){var m,f,e,j,i,l={error:0,warn:0,log:0,fail:0},c=true;console;o.TestingConsole=function(p){m=p;o.superclass(this);o.relY(true).constrainChildren(true).minWidth(500);f=o.create(a.cl.ui.buttons.UIButton,["Start tests"]);f.alignX("center").y(20);j=o.create(a.cl.CLViewContainer);j.height(27);i=o.create(a.cl.CLViewContainer);i.border(1).hide();countsView=o.create(a.cl.ui.UITextField);countsView.nonBreaking(true).x(5).y(3);e=o.create(a.cl.ui.buttons.UIButton,["Minimize"]);e.addEventListener(a.cl.ui.events.UIMouseEvent.CLICK,g);e.alignX("right").x(-1).y(1);var q=o.create(a.cl.ui.UITextField,["A5 Testing Suite"]);q.alignX("center").y(100).fontSize(20).bold(true).width("auto").nonBreaking(true);console=o.create(a.cl.CLViewContainer);console.alignX("center").y(20).relY(true);console.scrollYEnabled(true).width("60%").height(200).border(1);f.addEventListener(a.cl.ui.events.UIMouseEvent.CLICK,h);j.addSubView(i);i.addSubView(countsView);j.addSubView(e);o.addSubView(j);o.addSubView(q);o.addSubView(f);o.addSubView(console);d()};o.renderError=function(p,r,q){console.log(p+": "+r)};o.showStatus=function(p,q){var r=o.create(a.cl.ui.UITextField,[(p.substr(0,1).toUpperCase()+p.substr(1))+": "+q]);r.border(1).bold(true).padding(2);switch(p){case"error":case"fail":r.backgroundColor("#FFB6C1");r.textColor("#FF0000");break;case"warn":r.backgroundColor("#FFFF00");break;case"log":break}d(p,1);console.addSubView(r)};var d=function(p,q){if(p&&q){l[p]+=q}countsView.text("<b>A5 Testing Suite</b>              Fails: "+l.fail+" | Errors: "+l.error+" | Warnings: "+l.warn+" | Logs: "+l.log)};var h=function(){m.startTests()};var g=function(){c=!c;if(c){e.label("Minimize");i.hide();o.height("100%")}else{e.label("Maximize");i.show();o.height(27)}}});a.Package("a5.cl.testing").Extends("a5.cl.CLAddon").Class("Testing",function(n,l,v){var e,r,o=[],q=[],t,m,i,c=false,g=false,s,u,p=false;n.Testing=function(){n.superclass(this);n.registerForProcess("logger");n.registerForProcess("launchInterceptor");this.configDefaults({runTests:false,resultCallback:null,logResult:true,showConsole:false,runThirdPartyTests:true,restrictEnvironments:null,resultService:null,launchAfterTest:false})};n.initializePlugin=function(){if(n.pluginConfig().resultService){var w=a.GetNamespace(n.pluginConfig().resultService);if(!w||w&&!w instanceof a.cl.CLAjax||!w.doesImplement("a5.cl.testing.IResultService")){n.throwError("resultService property on add-on Testing must implement a5.cl.testing.IResultService.");n.pluginConfig().resultService=null;return}}if(n.pluginConfig().showConsole===true){t=n.create(l.TestingConsole,[this]);n.create("a5.cl.testing.ErrorHandler",[t]);n.cl().MVC().addMapping({desc:500,controller:"a5.cl.testing.ErrorHandler",action:"_500"});n.cl().MVC().addMapping({desc:404,controller:"a5.cl.testing.ErrorHandler",action:"_404"});n.cl().MVC().application().addWindow(t)}if(n.pluginConfig().runTests===true){n.startTests()}};n.interceptLaunch=function(w){u=w;return true};n.log=function(w){q.push("Log: "+w);if(t){t.showStatus("log",w)}else{if(window.console!==b){console.log(w)}}};n.error=function(w){q.push("Error: "+w);if(t){t.showStatus("error",w)}else{if(window.console!==b){console.error(w)}}};n.fail=function(w){g=true;c=true;var x='Test "'+s.className()+'" failed, reason: "'+w+'"';q.push(x);if(t){t.showStatus("fail",x)}else{if(window.console!==b){console.error(w)}}j()};n.warn=function(w){q.push("Warning: "+w);if(t){t.showStatus("warn",w)}else{if(window.console!==b){console.warn(w)}}};n.startTests=function(){if(!p&&d()){p=true;i=new Date();if(n.pluginConfig().runThirdPartyTests===true){for(var z=0,y=a.cl.testing.CLUnitTest._extenderRef.length;z<y;z++){o.push(a.cl.testing.CLUnitTest._extenderRef[z])}}else{var w=a.GetNamespace(n.cl().applicationPackage())["tests"];for(var A in w){var x=w[A];if(x.doesExtend&&x.doesExtend("a5.cl.testing.CLUnitTest")){o.push(x)}}}r=o.length;e=0;q=[];if(r===0){n.error("No valid tests present in application.");h()}else{f()}}};var f=function(){if(e===r){h()}else{g=false;var w=a.cl.testing.CLUnitTest._extenderRef[e];s=n.create(w);s.addEventListener(l.CLUnitTest.COMPLETE,j);e++;m=new Date();s.runTest()}};var j=function(x){var w=new Date()-m;m=null;if(!g){n.log('Test "'+s.className()+'" completed successfully in '+w+" ms.")}s.removeEventListener(l.CLUnitTest.COMPLETE,j);s.destroy();f()};var d=function(){if(n.pluginConfig().restrictEnvironments===null){return true}else{var y=n.pluginConfig().restrictEnvironments.split("|");for(var x=0,w=y.length;x<w;x++){if(y[x]===n.cl().environment()){return true}}return false}};var h=function(){s=null;var w=new Date()-i;i=null;n.log("Test run completed"+(c?" with failures":"")+" in "+w+" ms.");if(n.pluginConfig().resultCallback&&typeof n.pluginConfig().resultCallback==="function"){n.pluginConfig().resultCallback(results)}if(n.pluginConfig().resultService){k()}if(n.pluginConfig().launchAfterTest===true){u()}};var k=function(){var w=n.create(n.pluginConfig().resultService);w.sendResults(q)}})})(a5);