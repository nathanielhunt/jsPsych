/**
 * jspsych-table-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * based on jspsych-svo-response
 * requires jquery
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["svo-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'svo-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
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
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
      trial.display_element = display_element;
      trial.button_html = trial.choice_array
      var $display_element = $(display_element);
    // display_element = $(display_element);
    // display stimulus

    //display buttons
    var buttons = [];
    console.log(trial.choice_array);
    // if (Array.isArray(trial.button_html)) {
    //   if (trial.button_html.length == trial.choices.length) {
    //     buttons = trial.button_html;
    //   } else {
    //     console.error('Error in svo-response plugin. The length of the button_html array does not equal the length of the choices array');
    //   }
    // } else {
    //   for (var i = 0; i < trial.choices.length; i++) {
    //     buttons.push(trial.button_html);
    //   }
    // }

    appendT = function (stim) {
        var $toAppend = $('<div/>', {
          id: "jspsych-svo-response-stimulus"
        }).append(trial.stimulus);
        var $table =	$('<table class="svo_table"/>');
        var $header = $('<tr/>').append($('<th></th><th>You get</th><th>They get</th>').css({
          'padding': '40px 40px 20px 40px'
        }));
        // $buttondiv.append($table);
        // $buttondiv.append($header);
        $table.append($header);

        var labels = ['A', 'B'];
        for (var i = 0; i < stim.length; i++) {
            var $row = $('<tr></tr>').addClass('option').attr('id', labels[i]);
            $row.append($('<td></td>').append($('<strong></strong>', {text: labels[i]})));
            // var $item = $('<td></td>');
            // var $strong = $("<strong></strong");
            for (var j = 0; j < stim[i].length; j++) {
                var clss = 'jspsych-svo-response-button-' + i;
                $row.append($('<td/>', {
                  text: stim[i][j],
                  class: clss
                })).attr("data-choice", i+'-'+ j);
            }
            // $toAppend.append($strong.html($row.html($item.html(stim[i]))));
            $table.append($row);
        }
        var $buttondiv = $('<div/>', {
          id: "jspsych-svo-response-btngroup"
        });
        $buttondiv.width('100%')
            .css('text-align','center')
        // .append($strong)
            .css('color',this.color)
            .css('margin-left','auto')
            .css('margin-right','auto')
            .css('margin-bottom','0px')
            .css('margin-top','0px')
            // .css('height', this.lineHeight)
            // .css('line-height', this.lineHeight)
            .css('width', '100%')
            .css('font-size','xx-large');
        $buttondiv.append($table);
        $toAppend.append($buttondiv);
        return $toAppend;
    }
    var content = appendT(trial.button_html)

    //show prompt if there is one
    if (trial.prompt !== null) {
      content.append(trial.prompt);
    }
    // display_element.innerHTML = html;
    $(display_element).append(content)


    $('td').css({
      'padding': '40px'
    });

    var answer_css = {
      'border-style': 'solid',
      'border-width': '2px',
      'border-color':'rgb(255,255,255)'
    };
    $('.option').css(answer_css);
    $('.option').on('mouseover',function(){$(this).css({
        'background-color': 'rgba(0,0,175,0.5)',
        'border-color': 'rgba(0,0,175,0.5)',
        'border-style': 'none'
      });
      }).on('mouseout',function(){$(this).css({
        'background-color': 'rgba(255,255,255,255)',
        'border-color': 'rgba(255,255,255,255)',
        'border-style': 'solid'
      });
    });

    // start time
    var start_time = Date.now();
    $('#jspsych-loading-progress-bar-container').hide()

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      $('.option').one('click', function (event) {
        console.log('clicked!');
        // var choice = event.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        var choice = $(this).attr('data-choice');
        // console.log($(this))
        // console.log(choice);
        after_response(choice);
      });
    }

    // store response
    var response = {
      rt: null,
      button: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      $('.jspsych-svo-response-stimulus').addClass('responded')
      // display_element.querySelector('#jspsych-svo-response-stimulus').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-svo-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

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

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        $('#jspsych-svo-response-stimulus').css({'visibility': 'hidden'});
        // display_element.querySelector('#jspsych-svo-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }


}
  return plugin;
})();
