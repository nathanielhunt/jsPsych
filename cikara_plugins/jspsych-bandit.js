var $table;
var $td;
var $tr;

jsPsych.plugins["bandit"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('bandit', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});
    jsPsych.pluginAPI.registerPreload('bandit', 'neutral_stim', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});
    jsPsych.pluginAPI.registerPreload('bandit', 'feedback_array', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});
    jsPsych.pluginAPI.registerPreload('bandit', 'rewards', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

    plugin.info = {
        name: 'bandit',
        description: '',
        parameters: {
            stimuli: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            neutral_stim: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: false,
                no_function: false,
                description: ''
            },
            feedback_array: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            rewards: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
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
                default: undefined,
                array: true,
                no_function: false,
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
                array: true,
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
            }
        }
    };


    plugin.trial = function(display_element, trial) {
        console.log(trial);

        $(display_element).css('visibility', 'hidden');
        var startTime, keyboard_listener, keyboard_listener2, practice_keyboard_listener;

        // set default values for parameters
        trial.payouts             = typeof trial.schedule            == "undefined" ? 'default value'                   : trial.schedule;
        trial.prompt              = typeof trial.prompt              == "undefined" ? 'Please choose a shape            :' : trial.prompt;
        trial.neutral_stim        = typeof trial.neutral_stim        == "undefined" ? 'img/none_selected.jpg'           : trial.neutral_stim;
        trial.nrow                = typeof trial.nrow                == "undefined" ? 1                                 : trial.nrow;
        trial.ncol                = typeof trial.ncol                == "undefined" ? trial.stimuli.length / trial.nrow : trial.ncol;
        trial.rewards             = typeof trial.rewards             == "undefined" ? ['img/gems.jpg', 'img/bomb.jpg']  : trial.rewards;
        trial.no_reward           = typeof trial.no_reward           == "undefined" ? 'img/none.jpg'                    : trial.no_reward;
        trial.practice            = trial.practice                   == "undefined" ? false                             :  trial.practice;
        trial.cond                = typeof trial.cond                == "undefined" ? 'both'                            : trial.cond;
        trial.trial_counter       = typeof trial.trial_counter       == "undefined" ? 0                                 : trial.trial_counter;
        trial.trial_timer       	= typeof trial.trial_timer         == "undefined" ? 0                                 : trial.trial_timer;
        trial.delay_before_reward	= typeof trial.delay_before_reward == "undefined" ? 500                               : trial.delay_before_reward;
        trial.respond_within      = typeof trial.respond_within      == "undefined" ? 500                               : trial.respond_within;
        trial.delay_after_reward	= typeof trial.delay_after_reward  == "undefined" ? 1000                              : trial.delay_after_reward;
        trial.timing_post_trial		= typeof trial.timing_post_trial   == "undefined" ? 250                               : trial.timing_post_trial;
        trial.gain_over_pain      = typeof trial.gain_over_pain      == "undefined" ? [0.5, 0.5, 0.5, 0.5]              : trial.gain_over_pain;
        trial.feedback_array      = trial.feedback_array			|| ['img/chose_green.jpg','img/chose_yellow.jpg','img/chose_blue.jpg','img/chose_red.jpg',];
        trial.feedback_slow       = trial.feedback_slow			  || 'img/X.jpg';

        // allow variables as functions
        // this allows any trial variable to be specified as a function
        // that will be evaluated when the trial runs. this allows users
        // to dynamically adjust the contents of a trial as a result
        // of other trials, among other uses. you can leave this out,
        // but in general it should be included
        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        console.log("After assignments");
        console.log(trial);

        writeHTML();
        showBlankScreen();

        if (trial.trial_timer > 0) {
            var st = new Date();
            console.log('STARTING TIMER');
            jsPsych.pluginAPI.setTimeout(function () {
                console.log('ENDING TIMER');
                console.log(new Date() - st);
                trial.delay_before_reward = 0;
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
                logResp({
                    key: 88,
                    rt: trial.trial_timer
                });
            }, trial.trial_timer);
        }

        function showBlankScreen() {
            $(display_element).css('visibility', 'hidden');

            showNextStim();
        }

        function testWin(i) {
            var rand = Math.random();
            if (rand < trial.winPr[i]) {
                return 1;
            } else {
                return 0;
            }
        }

        function testLose(i) {
            var rand = Math.random();
            if (rand < trial.losePr[i]) {
                return 1;
            } else {
                return 0;
            }
        }

        function writeHTML( ) {
            var $prompt = $('<h4>', {html: trial.prompt});
            display_element.html($prompt);

            $table = $('<table>', {html: "<tbody></tbody>"});
            var n = 0;
            for(var i = 0; i < trial.nrow; i++) {
                $tr = $('<tr>', {"class": "stim_row"});
                for(var j = 0; j < trial.ncol; j++) {
                    $td = $('<td>', {
                        "class": "bandit stim",
                        "id"   : "bandit_stim",
                    });
                    var $img = $('<img>', {
                        src: trial.stimuli[n],
                    });
                    $td.append($($img));
                    $tr.append($($td));
                }
                $table.append($($tr));

            }
            display_element.append($table);

            var $payout = $('<table>', {
                id: 'payout',
                css: {
                    'text-align': 'center',
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                },
            });

            var $gem = $('<td>', {
                id: 'gem',
                css: {
                    'text-align': 'center',
                },
            });

            var $bomb = $('<td>', {
                id: 'bomb',
                css: {
                    'text-align': 'center',
                },
            });

            var $tr = $('<tr>');
            $tr.append($gem);
            $tr.append($bomb);
            $payout.append($tr);

            display_element.append($payout);
        }

        function showNextStim() {
            $(display_element).css('visibility', 'visible');
            startKeyListener();
        }

        function startKeyListener() {
            startTime = (new Date()).getTime();
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: logResp,
                valid_responses: trial.choices,
                rt_method: 'date',
                persist: true,
                allow_held_key: false
            });

            /*
              keyboard_listener2 = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: jsPsych.finishTrial,
              valid_responses: [' '],
              rt_method: 'date',
              persist: true,
              allow_held_key: false
              });
            */
        }

        function stopKeyListener() {
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
        }

        function logResp(arg) {
            stopKeyListener();
            jsPsych.pluginAPI.clearAllTimeouts();
            //$(display_element).css('visibility', 'hidden');

            // var endTime			= (new Date()).getTime();
            // var response_time		= endTime - startTime;
            var respCharCode		= arg.key;
            var respKey			= String.fromCharCode(arg.key);
            var respChoiceNum		= trial.choices.indexOf(respKey.toLowerCase());
            var respChoice		= trial.stimuli[respChoiceNum];

            if (trial.cond == 'gain') {
                trial.losePr = 0;
            } else if (trial.cond == 'pain') {
                trial.winPr = 0;
            } else if (trial.cond == 'either') {
                var rand = Math.random();
                if (rand < trial.gain_over_pain[respChoiceNum]) {
                    trial.losePr = 0;
                } else {
                    trial.winPr = 0;
                }
            }


            if (trial.winPr != 0) {
                var won	= testWin(respChoiceNum);
            } else {
                var won = 0;
            }
            if (trial.losePr != 0) {
                var lost = testLose(respChoiceNum);
            } else {
                var lost = 0;
            }

            var Prs = {};
            for(var i = 0; i < trial.choices.length; i++) {
                Prs['WinPr_' + i] = trial.winPr[i];
                Prs['LosePr_' + i] = trial.losePr[i];
                if (trial.cond == "either") {
                    Prs['GainOverPainPr_' + i] = trial.gain_over_pain[i];
                }
            }
            console.log('gems' + won);
            console.log('bombs' + lost);

            var trial_data = {
                "rt"		: arg.rt,
                "respCharCode"	: respCharCode,
                "respKey"	: respKey,
                "respChoiceNum"	: respChoiceNum,
                "respChoice"	: respChoice,
                "gems"		: won,
                "bombs"		: lost,
                "no_reward"	: won + lost == 0 ? 1 : 0,
                "GemPrChosen"	: trial.winPr[respChoiceNum],
                "BombPrChosen"	: trial.losePr[respChoiceNum],
		            "practice"	: trial.practice,
		            "trial_counter"	: trial.trial_counter,
		            "trial_label"	: trial.trial_label,
	          };
	          $.extend(trial_data, Prs);

	          showFeedback(trial_data);
	      }

	      function showFeedback(trial_data) {
	          console.log('show feedback');
	          // end trial
	          //$('.bandit.stim').css({opacity: 0.5});

	          //Show which cave chosen
	          $('#bandit_stim>img').attr('src',trial.feedback_array[trial_data.respChoiceNum]);

	          //After delay_before_reward, show reward then start next timer
	          //After delay_after_reward, show neutral cave picture
	          setTimeout(function() {
		            show_reward_feedback(trial_data);
		            endTrial(trial_data);
	          }, trial.delay_before_reward);

	          //$chosen.css({'border-style': "line", border: '1px solid black'});
	      }

	      function show_reward_feedback(trial_data) {
	          console.log('show reward');
	          $('#payout #gem').append($('<img>', {class: 'reward', src: trial.no_reward}));
	          $('#payout #bomb').append($('<img>', {class: 'reward', src: trial.no_reward}));

            if (trial_data.respKey == "X") {
		            $('#payout #gem img').attr('src', trial.feedback_slow);
            }

	          if (trial_data.gems) {
		            $('#payout #gem img').attr('src', trial.rewards[0]);
	          }
	          if (trial_data.bombs) {
		            $('#payout #bomb img').attr('src', trial.rewards[1]);
	          }

	          console.log('showing reward');
	          console.log(trial_data.gems);
	          console.log(trial_data.bombs);
	          console.log(trial_data.bombs + trial_data.gems == 0 ? 1 : 0);
	          console.log(trial_data.no_reward);
	          // if (trial_data.no_reward) {
	          // 	console.log('no reward');
	          // 	$('#payout').append($('<img>', {class: 'reward', src: trial.no_reward}))
	          // }

	      }

	      function endTrial(trial_data) {
	          console.log('ending trial');
	          console.log(trial.delay_after_reward);
	          setTimeout(function () {
		            if (trial.neutral_stim != undefined) {
		                $('#bandit_stim>img').attr('src',trial.neutral_stim);
		                $(display_element).css('visibility', 'visible');
		            } else {
		                $(display_element).css('visibility', 'hidden');
		            }
		            $('#payout').remove();
		            //$(display_element).css('visibility', 'hidden');
		            jsPsych.finishTrial(trial_data);
	          }, trial.delay_after_reward);
	      }

    };

    return plugin;
})();
