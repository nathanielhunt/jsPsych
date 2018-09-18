/**
 * jspsych-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 * customized by Nathan Hunt
 * version 1.0, 18 September 2018
 **/

jsPsych.plugins["html-counter-backwards-compatible"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('html-counter-backwards-compatible', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'html-counter-backwards-compatible',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: [],
        array: true,
        no_function: false,
        description: ''
      },
      button_html: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '<button class="jspsych-btn">%choice%</button>',
        no_function: false,
        array: true,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      timing_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      timing_response: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1; // if -1, then show indefinitely
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // display stimulus
    if (!trial.is_html) {
      display_element.append($('<img>', {
        src: trial.stimulus,
        id: 'jspsych-html-counter-backwards-compatible-stimulus',
        class: 'block-center'
      }));
    } else {
      display_element.append($('<div>', {
        html: trial.stimulus,
        id: 'jspsych-html-counter-backwards-compatible-stimulus',
        class: 'block-center'
      }));
    }

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-counter-backwards-compatible plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.append('<div id="jspsych-html-counter-backwards-compatible-btngroup" class="center-content block-center"></div>')
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      $('#jspsych-html-counter-backwards-compatible-btngroup').append(
        $(str).attr('id', 'jspsych-html-counter-backwards-compatible-button-' + i).data('choice', i).addClass('jspsych-html-counter-backwards-compatible-button').on('click', function(e) {
          var choice = $('#' + this.id).data('choice');
          after_response(choice);
        })
      );
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    //styling
    var styling = $('<style type="text/css">');
    styling[0].innerHTML = "#overlay {" + //hacking in the styling that Zach set up for the single-question survey
        "position: fixed; /* Sit on top of the page content */" +
        "display: none;" +
        "width: 100%; /* Full width (cover the whole page) */" +
        "height: 100%; /* Full height (cover the whole page) */" +
        "top: 100px;" +
        "left: 0;" +
        "right: 0;" +
        "bottom: 0;" +
        "background-color: rgba(255,255,255,1); /* Black background with opacity */" +
        "z-index: 0; /* Specify a stack order in case you're using a different order for other elements */" +
        "cursor: default;" +
     "}" +
    "" +
     "#commbox {" +
         "color: rgba(255,255,255,0);" +
     "}" +
    "" +
     "#comments {" +
         "color: white;" +
         "display: none;" +
    "}"
    $('head').append(styling)

    var invis = $('<div id="commenting"/>');
    invis[0].innerHTML = '<div id="overlay">&nbsp;</div>' +
    '<div id="comments" style="height:200px; width:400px;">' +
    '  <span id="commtext"><strong>Comments:</strong></span>' +
    '  <textarea class="form-control" id="commbox" name="comments" placeholder="comments">' +
    '  </textarea>' +
    '</div>'

    $('#jspsych-content').append(invis);

    // store response
    var response = {
      rt: -1,
      button: -1
    };

    // start time
    var start_time = 0;

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      $("#jspsych-html-counter-backwards-compatible-stimulus").addClass('responded');

      // disable all the buttons after a response
      $('.jspsych-html-counter-backwards-compatible-button').off('click').attr('disabled', 'disabled');

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      if ($('#commbox')[0].value.length > 2){
        trial_data['hidden comments box']= $('#commbox')[0].value;
      }

      if(profile){
        for (var prop in profile) {
          if (profile.hasOwnProperty(prop)) {
            // console.log({[prop]: profile[prop]});
            // data_from_current_node.addToAll({[prop]: profile[prop]});
            trial_data[prop] = profile[prop];
          }
        }
      }



      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start timing
    start_time = Date.now();

    // hide image if timing is set
    if (trial.timing_stim > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        $('#jspsych-html-counter-backwards-compatible-stimulus').css('visibility', 'hidden');
      }, trial.timing_stim);
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
