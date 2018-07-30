/*
 * Example plugin template
 */

jsPsych.plugins["consent"] = (function() {

    var plugin = {};

    plugin.info = {
	name: 'consent',
	description: '',
	parameters: {
	    consent: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: false,
		no_function: false,
		description: ''
	    },
	    path: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: false,
		no_function: false,
		description: ''
	    },
	}
    }


    plugin.trial = function(display_element, trial) {
	display_element = $(display_element);

	// set default values for parameters
	if (typeof trial.minutes != "undefined") {
	    if (trial.minutes <= 5) {
		trial.consent = 'INL_behavioral_consent_5min_online.html';
	    } else if (trial.minutes <= 20) {
		trial.consent = 'INL_behavioral_consent_20min_online.html';
	    } else if (trial.minutes <= 30) {
		trial.consent = 'INL_behavioral_consent_30min_online.html';
	    } else if (trial.minutes <= 45) {
		trial.consent = 'INL_behavioral_consent_45min_online.html';
	    } else if (trial.minutes <= 60) {
		trial.consent = 'INL_behavioral_consent_60min_online.html';
	    } else {
		trial.consent = 'INL_behavioral_consent_20min_online.html';
	    }
	} else {
	    trial.consent = trial.consent || 'INL_behavioral_consent_20min_online.html';
	}

	trial.path = trial.path || '/scripts/latest/consent/';

	// allow variables as functions
	// this allows any trial variable to be specified as a function
	// that will be evaluated when the trial runs. this allows users
	// to dynamically adjust the contents of a trial as a result
	// of other trials, among other uses. you can leave this out,
	// but in general it should be included
	//trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

	$(display_element).load(trial.path + '/' + trial.consent, add_nav)

	function left_justify() {
	    $(display_element).children().css({'text-align': 'left'});
	    $('.WordSection1').css('text-align','left')
	}

	function add_nav() {
	    left_justify();
	    
	    var nav_html = "<div class='jspsych-instructions-nav'>";
	    nav_html += "<button id='jspsych-instructions-next' class='jspsych-btn'>Next &gt;</button></div>"

	    display_element.append(nav_html);

	    $('#jspsych-instructions-next').on('click', function() {
		if (trial.no_questions || validate()) {
		    $('#jspsych-instructions-next').off('click');
		    $(display_element).html('');
		    jsPsych.finishTrial(trial_data);
		} else {
		    warn();
		}
	    });

	}

	function validate() {
	    function wrap(text) {
		var $p = $('<p>', {text: text, css: {
		    color: 'red',
		}});
		return $p;
	    }
	    var resps = [];
	    $('div#warnings').remove();
	    trial.warnings = $('<div>', {id: 'warnings'});
	    var age = $('input[name="age"]:checked').val() == "yes";
	    var understood = $('input[name="understood"]:checked').val() == "yes";
	    var willing = $('input[name="willing"]:checked').val() == "yes";
	    if (!age) {
		var text = "You must be over 18 to participate";
		trial.warnings.append(wrap(text));
	    }

	    if (!understood) {
		var text = "If you would like any clarifications about our HIT, please message us via Mechanical Turk";
		trial.warnings.append(wrap(text));
	    }

	    if (!willing) {
		var text = "If you do not agree to these terms, please return the HIT";
		trial.warnings.append(wrap(text));
	    }

	    return age && understood && willing;
	}

	function warn() {
	    $('div.jspsych-instructions-nav').prepend(trial.warnings);
	}

	// data saving
	var trial_data = {
	    consent: trial.consent
	};

    };

    return plugin;
})();
