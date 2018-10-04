/**
 * jspsych-bird-fixation-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 * modified by Nathan Hunt
 * requires: jQuery
 *
 **/


jsPsych.plugins["bird-fixation-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('bird-fixation-response', 'stimulus', 'image');

  plugin.info = {
    name: 'bird-fixation-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
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
    //
    // needed variables:
      // * -number of trial this is-
      // * number of correct
      // *
    var go_or_no_go = 'bird_incorrect'
    var pig;
    var pig_timeout;
    var pig_appeared;

    var delay = Number($('#pig').attr('delay'));
    var n_trial = Number($('#pig').attr('n'))+1;
    $('#pig').attr('n',n_trial);

    if (typeof(trial.stimulus) != 'string'){
      pig = trial.stimulus[1];
      trial.stimulus = trial.stimulus[0]
    };

    var new_html = '<img src="'+trial.stimulus+'" id="jspsych-bird-fixation-response-stimulus"></img>';

    // add prompt
    if (trial.prompt !== null){
      new_html += trial.prompt;
    }
    JSON.parse(jsPsych.data.get().readOnly().last().json())[0].team
    // draw
    display_element.innerHTML = new_html;
    var $msg_holder = $('<div class=team_div/>')
    var $header = $('<h2 id="exhortation">Earn points for your team!</h2>');
    var $team_or_avatar = $('<div id="gen_icon" style="height: 95px"/>');
    $msg_holder.append($header).append($team_or_avatar);
    $('.jspsych-content').append($msg_holder)

    $('#gen_icon').html(gen_icon);
    $('#exhortation').html(gen_exhortation);
    $('#jspsych-bird-fixation-response-stimulus').css({
      'max-height': '400px'
    });

    if (n_trial > 10){
      // console.log('checking go_or_no_go');
      var acc_score = get_bird_go_or_no_go();
      if (acc_score < 0.5){
        delay = Math.max(50, delay-50);
        $('#pig').attr('delay',delay)
        console.log(`Delay set to ${delay}ms`);
      } else {
        delay = Math.min(delay+50,950);
        $('#pig').attr('delay',delay)
        console.log(`Delay set to ${delay}ms`);
      }
    };

    if (pig){
      var pig_appeared = false;
      console.log('pig!');
      // console.log(pig);
      var $pig = $(`<div id="pig_div"><img src="${pig}" id="pig"/></div>`)
      pig_timeout = setTimeout(function(){
        $('.jspsych-content').append($pig);
        pig_appeared = true;
      },delay);
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {
      clearTimeout(pig_timeout);
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();
      // if (not pig){
      //   // figure out trials where bird appeared and there was no response
      // }

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "bird_or_pig": go_or_no_go,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
      if (pig) {
        if (pig_appeared){
          go_or_no_go = 'pig_correct'
        } else {
          go_or_no_go = 'pig_incorrect'
        }
      } else {
        go_or_no_go = 'bird_correct'
      }

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-bird-fixation-response-stimulus').className += ' responded';

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
        display_element.querySelector('#jspsych-bird-fixation-response-stimulus').style.visibility = 'hidden';
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
