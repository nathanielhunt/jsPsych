/*
 * Example plugin template
 */

jsPsych.plugins["wait"] = (function() {

    var plugin = {};

    plugin.info = {
	name: 'wait',
	description: '',
	parameters: {
	    time: {
		type: [jsPsych.plugins.parameterType.INTEGER],
		default: undefined,
		array: false,
		no_function: false,
		description: ''
	    },
	    img: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: undefined,
		array: false,
		no_function: false,
		description: ''
	    },
	}
    }


    plugin.trial = function(display_element, trial) {
	trial.time = trial.time || 2000;
	trial.img = trial.img || '';


	display_element.empty()
	    .append($('<img>', {
		src: trial.img,
	    }));

	jsPsych.pluginAPI.setTimeout(function () {
	    
	    var trial_data = {
		time: trial.time,
		img: trial.img,
	    };

	    $(display_element).html('');
	    jsPsych.finishTrial(trial_data);
	    jsPsych.pluginAPI.clearAllTimeouts();

	}, trial.time)

    };

    return plugin;
})();
