#!/usr/bin/env node
var fs = require('fs');
var util = require('util');
/*color set**/
green_start = '\u001b[32m';
yel_start = '\u001b[33m';
end = '\u001b[0m';
/************/
var exec = require('child_process').exec,
    child;
var help = '\nwatchmon is a file monitoring program that restarts a node process whenever is sees a file change. \
\n\nUsage: \n\twatchmon [file] [options]\nOptions:\n\t-h, --help\tHelp screen\n\t-v, --version\tCurrent version\n\t-n, \
--no-stdout\tDon\'t read stdout\n\t-e, --exit\tExit the process when the app crashed\n\t-d, --delay t\tDelays restart for \
t seconds';
var version = '0.1.5';
var noStdout = exitcrash = false;
var seconds = 0;
var allowed_args = ['-h', '--help', '-v', '--version', '-n', '--no-stdout', '-e', '--exit', '-d', '--delay'];

var argv = process.argv; 
if (argv[0] === "node"){ //if you're running the file overseer.js
	argv = process.argv.slice(2);
}else{
	argv = process.argv.slice(1);
}

function inArray(value,array)
{
    var count=array.length;
    for(var i=0;i<count;i++)
    {
        if(array[i]===value){
        	return true;
        }
    }
    return false;
}

exit = function(message, error){
	util.puts(message);
	err = error || null;
	process.exit(err);
}

isEmpty = function(array){
	if(array.length == 0){
		return true;
	}else{
		return false;
	}
}

argCheck = function(arg){
	if(inArray(arg, argv) && inArray(arg, allowed_args)){
		return true;
	}else{
		return false;
	}
}
//options setup//
if(isEmpty(argv)){ //running with no arguments defaults to help message
	exit(help);
}else{
	if(argCheck("-h") || argCheck("--help")){
		exit(help);
	}
	else if(argCheck("-v") || argCheck("--version")){
		exit(version);
	}
	else if(argCheck("-n") || argCheck("--no-stdout")){
		noStdout = true;
	}
	else if(argCheck("-e") || argCheck("--exit")){
		exitcrash = true;
	}
	else if(argCheck("-d") || argCheck("--delay")){
		//get the following argument from the delay option
		position = argv.indexOf('-d') || argv.indexOf('--delay');
		seconds = argv[position+1]*1000;
	}
}
////////////////

start = function(file, curr, prev, noStdout){
	setTimeout(function(){
		child = exec('node ' + file,
			function (error, stdout, stderr) {
				if (error !== null) {
					util.error('exec error: ' + error);
				}
			}
		);
		if(noStdout === false){
			child.stdout.pipe(process.stdout);
		}

		child.on('exit', function(code, signal){
			if (signal === 'SIGUSR2') {
			  //start()
			} else if (code === 0) { 
		      util.puts(green_start+'watchmon clean exit'+end);
		    } else {
		      util.puts(yel_start+'watchmon app crash...'+end);
		      if(exitcrash === true){
		      	process.exit()
		      }
		    }
		});
	}, seconds);
}

file = argv[0] || undefined;
if (inArray(file, allowed_args)){ //if the file is an option, display help screen
	exit(help);
}

main = function(file){
	fs.exists(file, function(exists){
		fs.stat(file, function(err,stats){
		  if(err) return util.error(err);
		  time = stats.mtime;
		  util.puts('watchmon monitoring '+green_start+'['+file+']'+end);
		  util.puts('loaded on: '+green_start+ time +end);		
		});
		if(exists === true){
			start(file, null, null, noStdout)
			fs.watchFile(file, function(curr, prev) {
		  		util.puts('\nChange made to '+green_start+'[\''+file+'\']'+end+' on: ' +green_start+ prev.mtime +end);
		  		start(file, curr, prev, noStdout)
			});
		}else{
			util.error(yel_start+'File does not exist'+end);
		}
	});
};

process.on("SIGINT", function(){ //catches app when shutdown
	exit(yel_start+'watchmon shutting down...'+end);
});
process.on('uncaughtException', function (err) { //catches all uncaught exceptions
    util.error(yel_start+err+end);
});

if (require.main === module) {
    main(file);   
}