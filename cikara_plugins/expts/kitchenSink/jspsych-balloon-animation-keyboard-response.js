/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["balloon-animation-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'balloon-animation-keyboard-response',
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

    var new_html = '<div id="jspsych-balloon-animation-keyboard-response-stimulus">'+trial.stimulus+'</div>';

    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

/// customized code

    // draw
    display_element.innerHTML = new_html;
    console.log(trial)
    // randomizing animation parameters
    var oval_ratio = 0.8;
    var h = trial.initial_h
    var w = h * oval_ratio;
    var duration = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    $('#data').removeClass('popped')

    // function to "pop" balloon
    var pop = function(){
      $('.center-div').empty();
      var popped = $('<img src="./img/popped.png"></img>');
      $('.center-div').append(popped);
      $('#data').addClass('popped')
    };

    // jQuery animating the balloon
    $('#data').attr({height: h, width: w, duration: duration})
    $('.oval').animate({height: h, width: w}, speed=duration, easing='linear', callback=pop); // try easing='linear'?

//// end of customized code

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
      get_pop = function() {
        if ($('#data')[0].className.includes('popped')) {
          var pop = true
        } else {
          var pop = false
        }
        return pop
      }
      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        'height': h,
        'width': w,
        'popped': get_pop(),
        'duration': duration,
        'score': Math.round(200 * (response.rt / duration))
      };
      console.log(trial_data.popped)
      // clear the display
      display_element.innerHTML = '';



      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-balloon-animation-keyboard-response-stimulus').className += ' responded';

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
        display_element.querySelector('#jspsych-balloon-animation-keyboard-response-stimulus').style.visibility = 'hidden';
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
