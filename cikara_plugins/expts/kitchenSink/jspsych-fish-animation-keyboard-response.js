/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["fish-animation-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'fish-animation-keyboard-response',
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
    var start_time = Date.now();
    var new_html = '<div id="jspsych-fish-animation-keyboard-response-stimulus">'+trial.stimulus+'</div>';

    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

/// customized code

    // disabling some JSPsych CSS to center our and H2s
    $('.jspsych-content').css({
        'margin': '0px',
        'line-height': '1.4em'
      })
    $('.jspsych-content-wrapper').css({
      'width': 'auto'
    })

    var response = {
      rt: null,
      key: null
    };

    // define function to know what the subject predicted
    function get_prediction(){
      var data = JSON.parse(jsPsych.data.get().readOnly().last().json())[0]
      // console.log(data['response'])
      return Number(data['response'])
    }

    display_element.innerHTML = new_html;

    // boilerplate to fill out team icons and headers
    $('#gen_icon').html(gen_icon);
    $('#exhortation').html(gen_exhortation);

    $('.jspsych-display-element').addClass('sea'); // sets background to blue

    // creating the large div for subjects to fish in and adding the div to hold the net image
    var message_dimensions = $('#message').offset()
    var area_height = $(document).height() - (message_dimensions['top'] + $('#message').height())
    var $net = $('<div class="net"/>').html('<div><img src="./img/Fishing/net.png"/></div>');
    var $fishing_area = $('.fishing_area')
      .css({
        'min-height': '1px',
        'height': area_height * .82,
        'width': $(document).width() * .95,
        'cursor': 'pointer',
        'position': 'relative'
      })
      .append($net)
    var moving = trial.moving;
    // creates the listener to move net around with the cursor
    if (moving == 1){
      $fishing_area.mousemove(function(e){
          $net.position({
            my: "center",
            of: e,
            collision: "fit",
            within: $fishing_area
          });
      })
    }else{
      $net.css({
        'margin-left': "25%",
        'margin-right': "25%",
      })
    }
    // on click, spawn the fish
    $fishing_area.one('click', function(){
      $(this).unbind('mousemove');
      $(this).css({'cursor': 'auto'});
      spawn()
    });

    function spawn() {
      // get coordinates of net
      var coords = $net.offset();
      coords['bottom'] = coords['top'] + 338; // defines coordinates based on size of net image
      coords['right'] = coords['left'] + 423;

      // establish that there are 30 fish, and get how many of them are passed in to be red
      var fish_count = 30;
      var reds = trial.reds;
      var yellows = fish_count - reds;

      // functions to randomize coordinates
      function randint(min, max) {
        return Math.random() * (max - min) + min;
      };

      function get_random_coords (coords, fish_count){ // passing in fish_count in case I want to add logic to keep fish more or less separated
        var random_coords = {
          'top': String(Math.round(randint(coords['top'] + 10, coords['bottom'] - 40))) + 'px',
          'left': String(Math.round(randint(coords['left'] + 10, coords['right'] - 30))) + 'px'
        };
        return(random_coords);
      };
      // generating the fish
      function generate_fish(color, $fishes){
        if (color == 'red') {
          var rando = get_random_coords(coords, fish_count);
          var $fish = $('<div class="fish redfish"/>').html('<img src="./img/Fishing/redfish.png"/>')
            .css({'top': rando['top'], 'left': rando['left']}).hide();
        } else {
          var rando = get_random_coords(coords, fish_count);
          var $fish = $('<div class="fish yellowfish"/>').html('<img src="./img/Fishing/yellowfish.png"/>')
            .css({'top': rando['top'], 'left': rando['left']}).hide();
        }
        $fishes.append($fish);
      }

      // creating the fish divs and container div
      var $fishes = $('<div class="fishes"/>');
      for (var i = 0; i < reds; i++) {
        generate_fish('red', $fishes)
      }
      for (var i = 0; i < yellows; i++) {
        generate_fish('yellow', $fishes)
      }
      $('.jspsych-content-wrapper').append($fishes);
      console.log($('.fish').length)
      // animating fish jumping
      $('.fish').delay(100).show('slide', {'direction': 'down'})
        .animate({'top': "-=20"}, 400)
        .delay(80)
        .animate({'top': "+=20"}, 400)
        // .delay(500)
        .hide('slide', {'direction': 'down'}).delay(100).eq(0).promise().done(function(){
          setTimeout(
            function(){
              after_response()
            }, 400
          )
        });
    }

    // display results

//// end of customized code

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
        "key_press": response.key,
        "n_red_fish": trial.reds,
        "prediction": get_prediction()
      };

      // clear the display
      $('.jspych-content-wrapper').innerHTML = '';

      // remove custom CSS
      $('.jspsych-content').css({
          'margin': 'inherit',
          'line-height': 'inherit'
        })
      $('.jspsych-content-wrapper').css({
        'width': 'inherit'
      })


      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function() {
      var end_time = Date.now();
      response.rt = end_time - start_time - 2280; // substracts animation time from RT
      $('.fishes').remove();
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      document.querySelector('#jspsych-fish-animation-keyboard-response-stimulus').className += ' responded';
      // $('.jspsych-display-element').removeClass('sea');
      // only record the first response
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
        display_element.querySelector('#jspsych-fish-animation-keyboard-response-stimulus').style.visibility = 'hidden';
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
