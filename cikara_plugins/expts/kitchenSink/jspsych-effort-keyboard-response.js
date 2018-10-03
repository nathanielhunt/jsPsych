/**
 * jspsych-effort-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["effort-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'effort-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },

    }
  }

  plugin.trial = function(display_element, trial) {
    var n_keypresses = 0;
    var new_html = '<div id="jspsych-effort-keyboard-response-stimulus">'+trial.stimulus+'</div>';
    console.log('started plugin');
    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    var window_height = $('.jspsych-content-wrapper')[0].clientHeight;
    var meter_height = window_height * .60;
    $('.effort-meter').css({'height': `${meter_height}px`})

    // TODO add countdown timer to screen
    // TODO add the bar appender to listener

    function get_bar_coords() {
      var bars = [];
      for (var i = 0; i < n_bars; i++) {
        if (bars.length > 0) {
          var last = bars[bars.length-1];
        } else {
          var last = 0;
        };
        var new_num = Number(Number(last+bar_height).toPrecision(3));
        bars.push(new_num);
      };
      return bars;
    }

    if (trial.difficulty == 'hard'){
      var n_bars = 100;
    } else {
      var n_bars = 30;
    }

    var bar_height = Number(Number(meter_height/(n_bars)*0.75).toPrecision(3));
    var coords = get_bar_coords();

    // var $meter = $('.effort-bar');
    $(document).keypress(function(e){
      if(e.which == 32){
        var y_coord = coords.pop()-bar_height;
        console.log(y_coord);
        var $bar = $(`<div class="effort-bar" id="bar_${n_keypresses}" />`)
        ++n_keypresses;
        $bar.css({
          'height': `${bar_height}px`,
          'bottom': y_coord
        })

        $('.effort-meter').append($bar)

      };
    });

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-effort-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-effort-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
