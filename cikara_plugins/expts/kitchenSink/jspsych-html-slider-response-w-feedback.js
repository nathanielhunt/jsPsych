/**
 * jspsych-html-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 * modified by Nathan Hunt
 *
 * requires jquery, jquery ui
 */


jsPsych.plugins['html-slider-response-w-feedback'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-slider-response-w-feedback',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
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
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    trial.kill = function(){
      end_trial();
    };
    var button_listener_on = false;

    var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + '</div>';
    // html += '<div class="jspsych-html-slider-response-container" style="position:relative;">';
    html += '<div id="slider" style="position:relative;">'
    // html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-html-slider-response-response"></input>';
    html += '<div>'
    for(var j=0; j < trial.labels.length; j++){
      var width = 100/(trial.labels.length-1);
      var left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
      html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '<input type="text" id="slider-choice-label" readonly style="border:0; text-align:center; font-weight:bold; font-size:22px" placeholder="15">'
    html += '</div>';
    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add submit button
    html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;
    // $('#jspsych-html-slider-response-next').css({
    //   'color':'darkgrey',
    //   'background-color': 'lightgrey',
    // });
    $('#jspsych-html-slider-response-next').attr({
      'disabled': 'disabled'
    });

    // $prompt = $('#slider-choice')
    // $prompt.html('<input type="text" id="slider-choice-label" readonly style="border:0; text-align:center; font-weight:bold;">')

    $( function() {
      $( "#slider" ).slider({
        value:trial.start,
        min: trial.min,
        max: trial.max,
        step: trial.step,
        slide: function( event, ui ) {
          if (!button_listener_on){
            button_listen();
            button_listener_on = true;
            $('#jspsych-html-slider-response-next').removeAttr('disabled')
          }
          $( "#slider-choice-label" ).val( ui.value );
        }
      });
      $( "slider-choice-label" ).val( $( "#slider" ).slider( "value" ) );
    } );

    //
    // $slider = $('.jspsych-html-slider-response-container')
    // $slider.on('change', function(){
    //   $value = $('#jspsych-html-slider-response-response')[0].value
    //   $prompt.empty().append($value)
    // })



    var response = {
      rt: null,
      response: null
    };
    function button_listen(){
      display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {
        // measure response time
        var endTime = (new Date()).getTime();
        response.rt = endTime - startTime;
        response.response = $( "#slider" ).slider( "value" );

        if(trial.response_ends_trial){
          end_trial();
        } else {
          display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
        }

      });
    };

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
