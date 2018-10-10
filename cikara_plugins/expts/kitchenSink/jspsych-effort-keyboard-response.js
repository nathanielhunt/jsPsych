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
    var data = JSON.parse(jsPsych.data.get().readOnly().last().json())[0];
    if (Number(data['key_press']) == 83){
      var n_bars = 100;
      timer_start_time = 30000;
      trial.choices = [83]
      var n_score = trial.hard_score;
      var s_choice = 's'
    } else {
      var n_bars = 30;
      timer_start_time = 7000;
      trial.choices = [76]
      var n_score = 100;
      var s_choice = 'l'
    }

    var p_reward = Math.random();
    if (p_reward < 0.5){
      var reward = true;
    } else {
      var reward = false;
    };
    var n_keypresses = 0;
    var new_html = '<div id="jspsych-effort-keyboard-response-stimulus">'+trial.stimulus+'</div>';
    console.log('started plugin');
    // add prompt
    var timer_start_time;
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }
    // draw
    display_element.innerHTML = new_html;
    $('#jspsych-effort-keyboard-response-stimulus').append(`<div><p>Press ${s_choice} until bar is full</p></div>`)

    function get_bar_coords() {
      var bars = [];
      for (var i = 0; i < n_bars; i++) {
        if (bars.length > 0) {
          var last = bars[bars.length-1];
        } else {
          var last = 0;
          // bars.push(last)
        };
        var new_num = Number(last+(bar_height*1.333333333333));
        bars.push(new_num);
      };
      bars2 = [];
      bars.forEach(function(elem){bars2.push(elem)});
      return bars2;
    }

    var window_height = $('.jspsych-content-wrapper')[0].clientHeight;
    var meter_height = window_height * .60;
    var team_div_height_offset = $('.team_div').height() // + $('.team_div').offset()['top']
    $('.effort-meter').css({
      'height': `${meter_height}px`,
      'margin-top': `${team_div_height_offset}px`
    })
    $('#jspsych-content').append('<div class="countdown-timer">0:00</div>')

    var effor_char = trial.choices[0]
    var offset_height = $('.effort-meter')[0].offsetHeight;
    var bar_height = Number(Number(offset_height/(n_bars)*0.75).toPrecision(3));
    var coords = get_bar_coords();
    var distance_from_top = $('.effort-meter').offset()['top'];
    var $meter = $('.effort-bar');
    var bar_score = 0;

    function bar_listener(){
      $(document).on('keyup',function(e){
        if(e.which == effor_char){
          if (coords.length > 0){
            ++bar_score;
            var y_coord = coords.pop()+(distance_from_top-bar_height);
            var $bar = $(`<div class="effort-bar" id="bar_${n_keypresses}" />`)
            ++n_keypresses;
            $bar.css({
              'height': `${bar_height}px`,
              'top': y_coord
            })
            $('.effort-meter').append($bar)
          } else {
            $(document).off('keyup');
            end_trial();
          }
        };
      });
    };

    function timer(){
      var $timer = $('.countdown-timer');
      $timer.css({'color':'red'});
      var time = timer_start_time;
      trial.trial_duration = timer_start_time;
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
      var timer_interval = setInterval(function(){
        if (time >= 0){
          var tenths_of_seconds = time / 10;
          var time_string = tenths_of_seconds.toString()
          if (time_string.length >= 3) {
            if (n_bars==100){
              if (time_string.length > 3){
                var first_digit = time_string[0] + time_string[1]
              } else {
                var first_digit = "0" + time_string[0]
              }
            } else {
              var first_digit = time_string[0]
            }
            var fractionals = time_string[time_string.length-2] + time_string[time_string.length-1]
            $timer[0].innerText = `${first_digit}:${fractionals}`
            time = time - 10;
          } else if (time_string.length == 2) {
            if (n_bars==100){
                var first_digit = "00";
              } else {
                var first_digit = 0;
              }
            var fractionals = time_string[time_string.length-2] + time_string[time_string.length-1]
            $timer[0].innerText = `${first_digit}:${fractionals}`
            time = time - 10;
          } else {
            if (n_bars==100){
                var first_digit = "00";
              } else {
                var first_digit = 0;
              }
            var fractionals = "0" + time_string[time_string.length-1]
            $timer[0].innerText = `${first_digit}:${fractionals}`
            time = time - 10;
          }
        } else {
          $timer[0].innerText = `0:00`
        }
      },10)
    };

    // function timer(){
    //   var $timer = $('.countdown-timer');
    //   $timer.css({'color':'red'});
    //   var time = timer_start_time;
    //   trial.trial_duration = timer_start_time;
    //   jsPsych.pluginAPI.setTimeout(function() {
    //     end_trial();
    //   }, trial.trial_duration);
    //     var timer_interval = setInterval(function(){
    //       if (time >= 0){
    //         var time_string = time.toString()
    //         if (time_string.length > 3) {
    //           var first_digit = time_string[0]
    //           var last_two_digits = time_string[1] + time_string[2]
    //           $timer[0].innerText = `${first_digit}:${last_two_digits}`
    //           time = time - 10;
    //         } else {
    //           var first_digit = 0;
    //           var last_two_digits = time_string[0] + time_string[1]
    //           $timer[0].innerText = `${first_digit}:${last_two_digits}`
    //           time = time - 10;
    //         }
    //       } else {
    //         $timer[0].innerText = `0:00`
    //       }
    //     },10)
    // };

    $(document).ready(function(){
      timer();
      $(document).one('keyup',function(){bar_listener()});
    });

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {
      // clearInterval(timer_interval);
      // kill any remaining setTimeout handlers
      if (n_bars % bar_score == 0){
        var task_completed = true;
      }else{
        var task_completed = false;
      }

      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "times_key_pressed": bar_score,
        "total_possible_score": n_bars,
        "effort_difficulty": trial.difficulty,
        "task_completed": task_completed,
        "score": n_score,
        "rewarded_or_not": reward,
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

  };

  return plugin;
})();
