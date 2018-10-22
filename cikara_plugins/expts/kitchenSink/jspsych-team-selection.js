/**
 * jspsych-team-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 * documentation: docs.jspsych.org
 *
 * customized by Nathan Hunt
 *
 * requires jQuery
 *
 **/

jsPsych.plugins["team-selection"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'team-response',
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

    // store response
    var response = {
      rt: null,
      button: null
    };

    var team = trial.team;
    var condition = trial.condition;
    console.log(trial.team);
    var $team_container = $('<div id="team_container"/>');
    var all_teams = trial.all_teams;
    var team_data = {}
    for (var i = 0; i < all_teams.length; i++) {
      var cur_team = all_teams[i];
      team_data[cur_team.toLocaleLowerCase()] = {
        name: cur_team,
        img: `img/Teams/${cur_team}.png`
      }
    };
    if (team == 'individual'){
      var $p1 = $('<p class="team_p">We let participants choose one out of eight avatars<br> that they can use for the rest of this session.</p>')
      var avatars = trial.all_avatars;
      var $avatar_table = $('<table class="team_table"/>');
      var $row = $('<tr/>');
      for (var i = 0; i < avatars.length; i++) {
        var $td = $('<td/>');
        var $av = $('<div class="avatar"/>').text(avatars[i]).css({
          'font-size': '52px'
        });
        $row.append($td.append($av));
      }
      $avatar_table.append($row);
      var $p2 = $('<p class="team_p">Please choose one of the avatars above</p>');
      $team_container.append($p1).append($avatar_table).append($p2);
    } else { // for assigned teams
      jsPsych.data.addProperties({
        team: team,
        team_icon: team_data[team]['img']
      });
      var $p1 = $('<p class="team_p">We assign participants to one of two team (Eagles or Rattlers) based on their responses to the previous questions.</p>');
      var team_imgs = [];
      for (var t in team_data) {
        if (team_data.hasOwnProperty(t)) {
            team_imgs.push(team_data[t].img);
          }
      }
      var $team_table = $('<table class="team_table"/>');
      var $row = $('<tr/>');
      for (var i = 0; i < team_imgs.length; i++) {
        var $td = $('<td/>');
        var $div = $('<div/>')
        var $team = $(`<img src="${team_imgs[i]}"/>`).css({
          'width': '180px',
          'height': 'auto',
        });
        $row.append($td.append($div.append($team)));
      }
      $team_table.append($row);
      var $p2 = $('<p class="team_p">Please wait while we assign you a team.</p>');
      $team_container.append($p1).append($team_table).append($p2);
      setTimeout(
        function(){
          var current_team = team_data[team];
          console.log(current_team);
          console.log(condition);
          if (condition[0] == "team/w-o-bonus") {
            results(`You were assigned to the ${current_team['name']} team and you will represent the ${current_team['name']} for the rest of the session. Your team will get bonused based on your performance across tasks! <p>THIS IS the third condition.</p>`, current_team['img'])
          } else {
            results(`You were assigned to the ${current_team['name']} team and you will represent the ${current_team['name']} for the rest of the session. Your team will get bonused based on your performance across tasks!`, current_team['img'])
          }
        }, 2000
      )
    }

    $('#jspsych-content').html($team_container);

    // start time
    var start_time = Date.now();

    $('.avatar').one('click', function(){
      console.log('clicked');
      // $('#icon').html(`<div><img src="${$(this).text()}" style="height: 95px"></div>`).hide()
      console.log($(this).text());
      var choice = $(this).text();
      jsPsych.data.addProperties({
        avatar: choice
      });
      results('You chose the following avatar and will be using this avatar for the rest of the session. You will get bonused based on your performance across tasks!', choice);
    });

    function results(p_string,choice){
      $team_container.empty();
      var $new_p = $('<p class="team_p"/>').html(p_string);
      if (choice.length > 2){
        $new_p.append($(`<div><img src="${choice}"></div>`).css('margin-top','50px'));
        $('#icon').append(`<div><img src="${choice}" style="height: 95px"></div>`).hide()
      } else {
        $new_p.append($('<p/>').text(choice).css({'font-size': '52px'}));
        $('#icon').append(`<div><p style="font-size:72px">${choice}</p></div>`).hide()
      }
      $team_container.append($new_p);

      var $button = $('<button>Continue</button>')
      $team_container.append($button.hide());
      $button.delay(1000).show('fade');
      $button.one('click', function(){
        after_response(choice)
      });
    }

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // document.querySelector('.jspsych-content').className += ' responded';

      end_trial();
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
        "all_avatars": trial.all_avatars,
        "all_teams": trial.all_teams
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-team-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
