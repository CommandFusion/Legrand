/*	Legrand Sample Program
===============================================================================
AUTHOR:	Terence Lau	
CONTACT: terence@commandfusion.com			
VERSION: 
LAST MOD:	
MODULE JOIN RANGE: 
MODULE TEST SETUP: 
===============================================================================

Todo list:

Check :

Special Note:
Controller IP	: 192.168.1.35
Controller Port : 20000

Other modules used :
Button Interlock - https://github.com/CommandFusion/DemoUserInterfaces/tree/master/Interlock

Joins Numbering Notes:
Arm/Disarm   56
Burglar Mode 54 *9*1*2##

*/

	
//----------------------------------------------------------------------------------------------------------------
//Initialization of instance
//----------------------------------------------------------------------------------------------------------------

//For standalone system
var demo = {
	
	// ======================================================================
	// System Settings
	// Special Note : For Legrand controllers, required to open two connections at the SAME port and SAME IP address.
	//                One is for command which the connection will disconnect after the command sent and reply is received.
	//                Two is for maintaining constant connection for real-time status feedback and changes from other devices in the system.
	// ======================================================================
	legrandCmdSys: "LegrandCmd",					// System 1 Name - For commands only
	legrandFBSys: "LegrandFB",						// System 2 Name - For feedback only
	loopbackSys: "Loopback",						// Loopback System
	
	// ======================================================================
	// *** Assign and edit all Legrand OpenWebNet Addressing here **** 
	//	1) ID set via virtual or physical configuration is the same. 
	//	2) If the A and PL is single digit, the ID will be 2 digits irrespective configured physically or virtually. e.g. A = 1, PL = 1 ID = 11
	//	3) And if A and/or PL is double digit, then the ID will be 4 digits. e.g. A = 10, PL = 1, ID = 1001; A = 1, PL = 10, ID = 0110
	//	http://www.myopen-legrandgroup.com/community/international_my_open/international_65536/f/92/t/8279.aspx
	// ======================================================================
	
	// LIGHTING POINT
	lightL1: "11",		// on/off
	lightL2: "12",		// on/off
	lightL3: "13",		// on/off
	lightL4: "14",		// dimming
	
	// SCENARIO 
	scenarioController1: "91",
	
	// CURTAINS 
	curtain1: "50",
	
	// ======================================================================
	// WHO TABLE : Refer to protocol documents
	// ======================================================================
	scenarioWHO: 	0,
	lightingWHO: 	1,					
	automationWHO: 	2,					
	alarmWHO: 		5, 		//what = 1 activate, 2 deactivate
	auxWHO: 		9,
	
	// ======================================================================
	// Setup 
	// ======================================================================
	
	setup: function() {
		
		// Request current status of the related devices in the system during startup
		CF.runMacro("requestAllStatus");
				
		// Watch all incoming data through a single feedback item : Syntax CF.watch(CF.event, systemName, feedbackName, feedbackFunction)
		CF.watch(CF.FeedbackMatchedEvent, demo.legrandFBSys, "IncomingFB", demo.incomingData);			// for realtime feedback
		CF.watch(CF.FeedbackMatchedEvent, demo.loopbackSys, "SimulateFB", demo.simulationData);			// for simulation only.			
	},
	
	// =============================================================================================================================
	// Regex
	// =============================================================================================================================	
	
	actionRegex : /\*(\d+)\*(\d+)\*(\d+)\##/,
	//actionRegex : /(\*)(.*)(\*)(.*)(\*)(.*)(\#)(\#)/,
	
	// =============================================================================================================================
	// Incoming Data Parsing
	// =============================================================================================================================	
	
	// realtime FB
	incomingData: function (itemName, matchedString) {
		
		if (demo.actionRegex.test(matchedString)) {			// Test if it is action reply string.
			var matches = demo.actionRegex.exec(matchedString);	 // matches[1] = WHO, matches[2] = WHAT, matches[3] = WHERE		
			
			var fbWHO = parseInt(matches[1]);
			var fbWHAT = parseInt(matches[2]);
			var fbWHERE = parseInt(matches[3]);			
			
			switch(fbWHO)	// captured WHO value - type of system's area
				{
					
					case 0:  // reply for scenario
						CF.setJoin("d"+(4000+fbWHAT+fbWHERE), 1);
					break;
					case 1: // reply for lighting
						switch(fbWHAT)		// captured WHAT value - type of action
						{
							case 0:	
								CF.setJoin("d"+(2000+fbWHERE), 0); 				// feedback for light status
								CF.setJoin("d"+(5000+fbWHERE), 0); 				// lights on button status
								CF.setJoin("d"+(6000+fbWHERE), 1); 				// lights off button status
								CF.setJoin("a"+(2000+fbWHERE), 0); 
								CF.setJoin("s"+(2000+fbWHERE), "Lights Off");
								break;
							case 1:	
								// just toggle on/off status to the last value saved. The other feedback can shown the values.
								CF.setJoin("d"+(2000+fbWHERE), 1);				// feedback for light status
								CF.setJoin("d"+(5000+fbWHERE), 1); 				// lights on button status
								CF.setJoin("d"+(6000+fbWHERE), 0); 				// lights off button status
								CF.setJoin("s"+(2000+fbWHERE), "Lights On");
								break;
							case 2:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0); 
								CF.setJoin("s"+(2000+fbWHERE), "20%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.2});
								break;
							case 3:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.14*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "30%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.3});
								break;
							case 4:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.28*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "40%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.4});
								break;
							case 5:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.42*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "50%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.5});
								break;
							case 6:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.56*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "60%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.6});
								break;
							case 7:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.70*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "70%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.7});
								break;
							case 8:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.84*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "80%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.8});
								break;
							case 9:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 0.98*65535); 
								CF.setJoin("s"+(2000+fbWHERE), "90%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 0.9});
								break;
							case 10:	
								CF.setJoin("d"+(2000+fbWHERE), 1); 
								CF.setJoin("a"+(2000+fbWHERE), 65535); 
								CF.setJoin("s"+(2000+fbWHERE), "100%");
								CF.setProperties({join: "d"+(2000+fbWHERE), opacity: 1.0});
								break;
						}  
					break;
					case 2: // reply for automation
						switch(fbWHAT)		// captured WHAT value - type of action
						{
							case 0:	// stop	
								CF.setJoin("s"+(3000+fbWHERE), "Stop");
								CF.setJoin("d"+(3100+fbWHERE), 0);
								CF.setJoin("d"+(3200+fbWHERE), 1);
								CF.setJoin("d"+(3300+fbWHERE), 0);
								break;
							case 1:	// up
								CF.setJoin("s"+(3000+fbWHERE), "Curtains Close");								
								CF.setJoin("d"+(3000+fbWHERE), 0);
								CF.setJoin("d"+(3100+fbWHERE), 1);
								CF.setJoin("d"+(3200+fbWHERE), 0);
								CF.setJoin("d"+(3300+fbWHERE), 0);
								break;
							case 2:	// down
								CF.setJoin("s"+(3000+fbWHERE), "Curtains Open");								
								CF.setJoin("d"+(3000+fbWHERE), 1);
								CF.setJoin("d"+(3100+fbWHERE), 0);
								CF.setJoin("d"+(3200+fbWHERE), 0);
								CF.setJoin("d"+(3300+fbWHERE), 1);
								break;
						} 
					break;	
				}  
			demo.actionRegex.lastIndex = 0;					// Reset the regex to work correctly after each consecutive match.
		}	
	},
	
	// simulate FB
	simulationData: function (itemName, matchedString) {
		
		if (demo.actionRegex.test(matchedString)) {			// Test if it is action reply string.
			var matches = demo.actionRegex.exec(matchedString);	 // matches[1] = WHO, matches[2] = WHAT, matches[3] = WHERE		
			
			var fbWHO = parseInt(matches[1]);
			var fbWHAT = parseInt(matches[2]);
			var fbWHERE = parseInt(matches[3]);			
			
			switch(fbWHO)	// captured WHO value - type of system's area
				{
					
					case 0:  // reply for scenario
						CF.setJoin("d"+(14000+fbWHAT+fbWHERE), 1);
					break;
					case 1: // reply for lighting
						switch(fbWHAT)		// captured WHAT value - type of action
						{
							case 0:	
								CF.setJoin("d"+(12000+fbWHERE), 0); 				// feedback for light status
								CF.setJoin("d"+(15000+fbWHERE), 0); 				// lights on button status
								CF.setJoin("d"+(16000+fbWHERE), 1); 				// lights off button status
								CF.setJoin("a"+(12000+fbWHERE), 0); 
								CF.setJoin("s"+(12000+fbWHERE), "Lights Off");
								break;
							case 1:	
								// just toggle on/off status to the last value saved. The other feedback can shown the values.
								CF.setJoin("d"+(12000+fbWHERE), 1);				// feedback for light status
								CF.setJoin("d"+(15000+fbWHERE), 1); 				// lights on button status
								CF.setJoin("d"+(16000+fbWHERE), 0); 				// lights off button status
								CF.setJoin("s"+(12000+fbWHERE), "Lights On");
								break;
							case 2:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0); 
								CF.setJoin("s"+(12000+fbWHERE), "20%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.2});
								break;
							case 3:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.14*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "30%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.3});
								break;
							case 4:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.28*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "40%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.4});
								break;
							case 5:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.42*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "50%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.5});
								break;
							case 6:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.56*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "60%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.6});
								break;
							case 7:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.70*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "70%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.7});
								break;
							case 8:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.84*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "80%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.8});
								break;
							case 9:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 0.98*65535); 
								CF.setJoin("s"+(12000+fbWHERE), "90%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 0.9});
								break;
							case 10:	
								CF.setJoin("d"+(12000+fbWHERE), 1); 
								CF.setJoin("a"+(12000+fbWHERE), 65535); 
								CF.setJoin("s"+(12000+fbWHERE), "100%");
								CF.setProperties({join: "d"+(12000+fbWHERE), opacity: 1.0});
								break;
						}  
					break;
					case 2: // reply for automation
						switch(fbWHAT)		// captured WHAT value - type of action
						{
							case 0:	// stop	
								CF.setJoin("s"+(13000+fbWHERE), "Stop");
								CF.setJoin("d"+(13100+fbWHERE), 0);
								CF.setJoin("d"+(13200+fbWHERE), 1);
								CF.setJoin("d"+(13300+fbWHERE), 0);
								break;
							case 1:	// up
								CF.setJoin("s"+(13000+fbWHERE), "Curtains Close");								
								CF.setJoin("d"+(13000+fbWHERE), 0);
								CF.setJoin("d"+(13100+fbWHERE), 1);
								CF.setJoin("d"+(13200+fbWHERE), 0);
								CF.setJoin("d"+(13300+fbWHERE), 0);
								break;
							case 2:	// down
								CF.setJoin("s"+(13000+fbWHERE), "Curtains Open");								
								CF.setJoin("d"+(13000+fbWHERE), 1);
								CF.setJoin("d"+(13100+fbWHERE), 0);
								CF.setJoin("d"+(13200+fbWHERE), 0);
								CF.setJoin("d"+(13300+fbWHERE), 1);
								break;
						} 
					break;	
				}  
			demo.actionRegex.lastIndex = 0;					// Reset the regex to work correctly after each consecutive match.
		}	
	
	},
	
	
	
	
	
	// =============================================================================================================================
	// Commands 
	// =============================================================================================================================
	
	// WHO = 0 : Commands for scenario // -----------------------------------------------------------------------------------
	cmdScenario: 		function(number, id) { demo.action(demo.scenarioWHO, number, id); },		// General command for scenario.
	statusScenario:		function() { demo.status_req(demo.scenarioWHO, 0); },						// Request status of current scenario.
	
	cmdScenario1: 		function() { demo.action(demo.scenarioWHO, "1", demo.scenarioController1); },	// Scenario 1
	cmdScenario2: 		function() { demo.action(demo.scenarioWHO, "2", demo.scenarioController1); },	// Scenario 2
	cmdScenario3: 		function() { demo.action(demo.scenarioWHO, "3", demo.scenarioController1); },	// Scenario 3
	cmdScenario4: 		function() { demo.action(demo.scenarioWHO, "4", demo.scenarioController1); },	// Scenario 4
	
	simScenario1: function() { 																			// Simulation Scenario 1 : Master On
		demo.actionSim(1,1,11); 	// Light L1
		demo.actionSim(1,1,12); 	// Light L2
		demo.actionSim(1,1,13); 	// Light L3
		demo.actionSim(1,10,14); 	// Light L4
		demo.actionSim(2,2,50); 	// Curtains
	},	
	
	simScenario2: function() { 																			// Simulation Scenario 2 : Master Off
		demo.actionSim(1,0,11); 	// Light L1
		demo.actionSim(1,0,12); 	// Light L2
		demo.actionSim(1,0,13); 	// Light L3
		demo.actionSim(1,0,14); 	// Light L4
		demo.actionSim(2,1,50); 	// Curtains
	},
	
	simScenario3: function() { 																			// Simulation Scenario 3 : Home
		demo.actionSim(1,0,11); 	// Light L1
		demo.actionSim(1,1,12); 	// Light L2
		demo.actionSim(1,0,13); 	// Light L3
		demo.actionSim(1,6,14); 	// Light L4
		demo.actionSim(2,2,50); 	// Curtains
	},
	
	simScenario4: function() { 																			// Simulation Scenario 3 : Away
		demo.actionSim(1,1,11); 	// Light L1
		demo.actionSim(1,0,12); 	// Light L2
		demo.actionSim(1,1,13); 	// Light L3
		demo.actionSim(1,0,14); 	// Light L4
		demo.actionSim(2,1,50); 	// Curtains
	},
	
	simStartupStatus: function() { 																			// Simulation Scenario 1 : Master On
		demo.actionSim(1,0,11); 	// Light L1
		demo.actionSim(1,0,12); 	// Light L2
		demo.actionSim(1,0,13); 	// Light L3
		demo.actionSim(1,0,14); 	// Light L4
		demo.actionSim(2,0,50); 	// Curtains
	},
	
	// WHO = 1 : Commands for lighting // -----------------------------------------------------------------------------------
	cmdAllLightsOff: 	function() { demo.action(demo.lightingWHO, 0, 0); },					// All Lighting off.
	cmdAllLightsOn: 	function() { demo.action(demo.lightingWHO, 1, 0); },					// All Lighting on.
	cmdLightOff: 		function(id) { demo.action(demo.lightingWHO, 0, id); },				// Lighting fully off.
	cmdLightOn:  		function(id) { demo.action(demo.lightingWHO, 1, id); },				// Lighting toggle back on. Level is based on previous setting.
	cmdLight20pc:  		function(id) { demo.action(demo.lightingWHO, 2, id); },				// Lighting on 20%.
	cmdLight30pc:  		function(id) { demo.action(demo.lightingWHO, 3, id); },				// Lighting on 30%.
	cmdLight40pc:  		function(id) { demo.action(demo.lightingWHO, 4, id); },				// Lighting on 40%.
	cmdLight50pc:  		function(id) { demo.action(demo.lightingWHO, 5, id); },				// Lighting on 50%.
	cmdLight60pc:  		function(id) { demo.action(demo.lightingWHO, 6, id); },				// Lighting on 60%.
	cmdLight70pc:  		function(id) { demo.action(demo.lightingWHO, 7, id); },				// Lighting on 70%.
	cmdLight80pc:  		function(id) { demo.action(demo.lightingWHO, 8, id); },				// Lighting on 80%.
	cmdLight90pc:  		function(id) { demo.action(demo.lightingWHO, 9, id); },				// Lighting on 90%.
	cmdLight100pc:  	function(id) { demo.action(demo.lightingWHO, 10, id); },				// Lighting on 100%.
	sliderLight: 		function(level,id) { demo.action(demo.lightingWHO, level, id); },		// dimming for lighting levels by using slider
	statusAllLighting:	function() { demo.status_req(demo.lightingWHO, 0); },					// Request status of all lighting points.
	
	sliderLightSim:		function(level,id) { demo.actionSim(demo.lightingWHO, level, id); },		// dimming for lighting levels by using slider
	
	// WHO = 2 : Commands for automation // -----------------------------------------------------------------------------------
	cmdAutomationStop:		function(id) { demo.action(demo.automationWHO, 0, id); },			// General command for Automation Stop.
	cmdAutomationUp:		function(id) { demo.action(demo.automationWHO, 2, id); },			// General command for Automation Up.
	cmdAutomationDown:		function(id) { demo.action(demo.automationWHO, 1, id); },			// General command for Automation Down.
	statusAllAutomation:	function() { demo.status_req(demo.automationWHO, 0); },			// Request status of all automation points.
	
	cmdCurtain1Stop:	function() { demo.action(demo.automationWHO, 0, demo.curtain1); },		//
	cmdCurtain1Open:	function() { demo.action(demo.automationWHO, 2, demo.curtain1); },		//
	cmdCurtain1Close:	function() { demo.action(demo.automationWHO, 1, demo.curtain1); },		//
	
	// WHO = 9 : Commands for aux // -----------------------------------------------------------------------------------
	cmdAux1On:			function() { demo.action(demo.auxWHO, 1, 1); },			//
	cmdAux1Off:			function() { demo.action(demo.auxWHO, 0, 1); },			// 	
	cmdAux2On:			function() { demo.action(demo.auxWHO, 1, 2); },			//
	cmdAux2Off:			function() { demo.action(demo.auxWHO, 0, 2); },			// 	
	cmdAux3On:			function() { demo.action(demo.auxWHO, 1, 3); },			//
	cmdAux3Off:			function() { demo.action(demo.auxWHO, 0, 3); },			// 	
	cmdAux4On:			function() { demo.action(demo.auxWHO, 1, 4); },			//
	cmdAux4Off:			function() { demo.action(demo.auxWHO, 0, 4); },			// 	
	cmdAux5On:			function() { demo.action(demo.auxWHO, 1, 5); },			//
	cmdAux5Off:			function() { demo.action(demo.auxWHO, 0, 5); },			// 	
	cmdAux6On:			function() { demo.action(demo.auxWHO, 1, 6); },			//
	cmdAux6Off:			function() { demo.action(demo.auxWHO, 0, 6); },			// 	
	
	// General command syntax // -----------------------------------------------------------------------------------
	// Format the command string to send to system : CF.send(systemName, string [, outputFormat])
	ack: 				function(){ CF.send("LegrandCmd", "*#*1##"); },
	nack: 				function(){ CF.send("LegrandCmd", "*#*0##"); },
	action: 			function(WHO, WHAT, WHERE){ CF.send("LegrandCmd", "*"+WHO+"*"+WHAT+"*"+WHERE+"##"); },
	actionSim: 			function(WHO, WHAT, WHERE){ CF.send("Loopback", "*"+WHO+"*"+WHAT+"*"+WHERE+"##"); },
	status_req: 		function(WHO, WHERE){ CF.send("LegrandCmd", "*#"+WHO+"*"+WHERE+"##"); },
	dimension_req: 		function(WHO, WHERE, DIMENSION){ CF.send("LegrandCmd", "*#"+WHO+"*"+WHERE+"*"+DIMENSION+"##"); },
	dimension_write: 	function(WHO, WHERE, DIMENSION, VALn){ CF.send("LegrandCmd", "*#"+WHO+"*"+WHERE+"*"+DIMENSION+"*"+VALn+"##"); },		// where VALn = VAL1*VAL2*VAL3...VALn
	
	// =============================================================================================================================
	// Debugging & Error Logging : Only allow logging calls when CF is in debug mode - better performance in release mode this way
	// =============================================================================================================================
	log: function(msg) {
			if (CF.debug) {
				CF.log(msg);
			}
		}
};

CF.modules.push(
	{
		name:"Legrand Demo Program", 	// the name of the module (mostly for display purposes)
		setup:demo.setup,				// the setup function to call
		object: demo,       			// the object to which the setup function belongs
		version: "Demo v0.01"       	// An optional module version number that is displayed in the Remote Debugger
	}
);
