/**
 * jspsych-match-task
 * a jspsych plugin for drag & drop matching
 *
 * Zach Ingbretsen
 *
 */


jsPsych.plugins['match-task'] = (function() {

    var plugin = {};

    plugin.info = {
	name: 'match-task',
	description: '',
	parameters: {
	    prompt: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: '',
		no_function: false,
		description: ''
	    },
	    labels: {
		type: [jsPsych.plugins.parameterType.STRING],
		array: true,
		default: undefined,
		no_function: false,
		description: ''
	    },
	    matches: {
		type: [jsPsych.plugins.parameterType.STRING],
		array: true,
		default: undefined,
		no_function: false,
		description: ''
	    },
	    correct_order: {
		type: [jsPsych.plugins.parameterType.STRING],
		array: true,
		default: undefined,
		no_function: false,
		description: ''
	    },
	    force_correct: {
		type: [jsPsych.plugins.parameterType.BOOL],
		array: false,
		default: undefined,
		no_function: false,
		description: ''
	    },
	}
    }

    plugin.trial = function(display_element, trial) {

	console.log("HAI");
	trial.prompt = typeof trial.prompt == 'undefined' ? "" : trial.prompt;
	trial.labels = typeof trial.labels == 'undefined' ? "text" : trial.labels;
	trial.matches = typeof trial.matches == 'undefined' ? "text" : trial.matches;
	trial.correct = typeof trial.correct == 'undefined' ? "text" : trial.correct;
	trial.force_correct = typeof trial.force_correct == 'undefined' ? "text" : trial.force_correct;
	trial.attempts = 0;
	
	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

	var start_time = new Date();
	
	// show prompt text
	display_element.empty().append($('<div>', {
	    "id": 'jspsych-prompt',
	    "class": 'jspsych-prompt',
	    'html': trial.prompt,
	    css: {}
	}));

	// Warning message area
	display_element.append($('<div>', {
	    id: 'warning',
	    css: {color: 'red'}
	}));

	var $table = $('<table>');
	var $tr = $('<tr>');
	var $td_left = $('<td>');
	var $td_right = $('<td>');
	var $labels = $('<ul>', {
	    class: 'sortable',
	    id: 'labels'
	});

	var $matches = $('<ul>', {
	    class: 'sortable',
	    id: 'matches'
	});

	$td_left.append($labels);
	$tr.append($td_left);

	$td_right.append($matches);
	$tr.append($td_right);

	$table.append($tr);

	var labels = [];
	var matches = [];
	
	for (var label in trial.matches) {
	    if (trial.matches.hasOwnProperty(label)) {
		var match = trial.matches[label];

		labels.push(label);
		matches.push(match);

	    }
	}

	matches.shuffle();

	for(var i = 0; i < labels.length; i++) {
	    var label = labels[i];
	    var match = matches[i];

	    var $label = $('<li>', {
		class: 'ui-state-default',
		html: label});

	    $labels.append($label);


	    var $match = $('<li>', {
		class: 'ui-state-default',
		html: match});

	    $matches.append($match);
	}

	// for (var i = 0; i < trial.labels.length; i++) {
	// }

	// for (var i = 0; i < trial.matches.length; i++) {
	//     var $match = $('<li>', {
	// 	class: 'ui-state-default',
	// 	html: trial.matches[i]});
	    
	//     $matches.append($match);
	// }

	display_element.append($table);

	// add submit button
	display_element.append($('<button>', {
	    'id': 'jspsych-survey-text-next',
	    'class': 'jspsych-btn jspsych-survey-text',
	    'text': 'Submit Answers',
	    'click': function () {
		console.log('x');
		validate();
	    }
	}));

	$( "#matches" ).sortable();
	$( "#matches" ).disableSelection();
	$( "#labels" ).sortable('options', 'disabled', true);
	$( "#labels" ).disableSelection();

	function validate( ) {
	    trial.attempts += 1;
	    var trial_data = {};
	    var $warning = $('#warning');

	    var labels = [];
	    $("#labels li").each(function(index) {
		labels.push($(this).text());
	    });

	    var resps = [];
	    $("#matches li").each(function(index) {
		resps.push($(this).text());
	    });

	    var incorrect = [];
	    var incorrect_words = [];
	    for(var i = 0; i < labels.length; i++) {
		if (trial.matches[labels[i]] != resps[i]) {
		    console.log('mistake');
		    incorrect.push(i);
		    incorrect_words.push(labels[i]);
		}
	    }

	    trial_data['attempts'] = trial.attempts;
	    var prev_incorrects = trial.prev_incorrects;
	    var curr_incorrects = incorrect_words.join(';');
	    trial_data['incorrects'] = typeof prev_incorrects == 'undefined' ? curr_incorrects : prev_incorrects + '|' + curr_incorrects;
	    trial.prev_incorrects = trial_data['incorrects'];
	    console.log(trial.prev_incorrects);

	    if (incorrect.length == 0) {
		console.log("it's a match!");
		trial_data['ACC'] = 1;
		trial_data['rt'] = new Date() - start_time;
		finishTrial(trial_data);
	    } else {
		console.log('noooope');
		if (trial.force_correct) {
		    console.log('must be correct');
		    mark_incorrect(incorrect);
		} else {
		    trial_data['ACC'] = 0;
		    trial_data['rt'] = new Date() - start_time;
		    finishTrial(trial_data);
		}
	    }

	}

	function mark_incorrect(incorrect) {
	    $('#matches li').css({
		color: 'black',
	    }).on('mousedown', function () {
		$(this).css('color', 'black');
	    });
	    
	    for(var i = 0; i < incorrect.length; i++) {
		$($('#matches li')[incorrect[i]]).css({
		    color: 'red',
		});
	    }

	
	}

	function finishTrial(resp) {
	    // measure response time
	    var endTime = (new Date()).getTime();
	    var response_time = endTime - startTime;

	    // save data
	    var trialdata = {
	    };

	    $.extend(trialdata, resp);

	    display_element.html('');

	    jsPsych.finishTrial(trialdata);
	}

	$("#jspsych-survey-text-next").click(validate);

	var startTime = (new Date()).getTime();
    };

    return plugin;
})();
