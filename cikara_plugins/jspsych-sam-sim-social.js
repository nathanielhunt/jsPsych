var resp, mouse_listener_instructs, keyboard_listener;
var sf;
/**
 * jspsych-sam-sim.js
 * Josh de Leeuw
 * Zach Ingbretsen
 *
 * Latent grouping trial design
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins.similarity = (function() {

    var resp, mouse_listener_instructs, trial_data;
    var plugin = {};

    plugin.info = {
        name: 'similarity',
        description: '',
        parameters: {
            stimuli: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            peers: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            names: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            choices: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: undefined,
                array: true,
                no_function: false,
                description: ''
            },
            fMRI: {
                type: [jsPsych.plugins.parameterType.BOOL],
                default: false,
                no_function: false,
                description: ''
            },
            is_html: {
                type: [jsPsych.plugins.parameterType.BOOL],
                default: false,
                no_function: false,
                description: ''
            },
            labels: {
                type: [jsPsych.plugins.parameterType.STRING],
                array: true,
                default: ['Not at all similar', 'Identical'],
                no_function: false,
                description: ''
            },
            intervals: {
                type: [jsPsych.plugins.parameterType.INT],
                default: 100,
                no_function: false,
                description: ''
            },
            show_ticks: {
                type: [jsPsych.plugins.parameterType.BOOL],
                default: false,
                no_function: false,
                description: ''
            },
            show_response: {
                type: [jsPsych.plugins.parameterType.SELECT],
                options: ['FIRST_STIMULUS', 'SECOND_STIMULUS','POST_STIMULUS'],
                default: 'FIRST_STIMULUS',
                no_function: false,
                description: ''
            },
            timing_post_trial: {
                type: [jsPsych.plugins.parameterType.INT],
                default: 0,
                no_function: false,
                description: ''
            },
            timing_image_gap: {
                type: [jsPsych.plugins.parameterType.INT],
                default: 1000,
                no_function: false,
                description: ''
            },
            testing: {
                type: [jsPsych.plugins.parameterType.BOOL],
                default: '',
                no_function: false,
                description: ''
            },
            prompt: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: '',
                no_function: false,
                description: ''
            },
            phase: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: '',
                no_function: false,
                description: ''
            }
        }
    }

    plugin.trial = function(display_element, trial) {

        function ifelse(arg, arg_def) {
            //console.log('ifelse');
            return (typeof arg === 'undefined') ? arg_def : arg;
        }

        function custTimeout(func, time) {
            //console.log('custTimeout');
            // //console.log(func);
            var t = new Date() - globalStartTime;
            time = ifelse(time, 0);
            if (time > 0) {
                var timer = jsPsych.pluginAPI.setTimeout(function() {
                    //console.log("Triggered timer");
                    //console.log(func);
                    var t = new Date() - globalStartTime;
                    func();
                }, time);
                return timer;
            } else {
                //console.log('No timer');
                //console.log(func);
                func();
            }
        }

        function hideAll() {
            //console.log('hideAll');
            $('#jspsych-stim').css('visibility', 'hidden').hide();
            $('#jspsych-history').css('visibility', 'hidden').hide();
            $('#jspsych-fixation').css('visibility', 'hidden').hide();
            //$('#jspsych-prompt-tr').hide().siblings().hide();
        }

        trial.phase = ifelse(trial.phase, 'normal');

        if (typeof globalStartTime == 'undefined') {
            var globalStartTime = 0;
        }

        hideAll();

        ///////////////////////////////////////
        // Trials other than fixation	     //
        ///////////////////////////////////////
        if (trial.phase.toUpperCase() != "FIXATION") {

            // default parameters
            trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
            trial.intervals = trial.intervals || 100;
            trial.show_ticks = ifelse(trial.show_ticks, false);

            trial.show_response = trial.show_response || "SECOND_STIMULUS";
            trial.mystery = trial.mystery || {"A": 'mysterymovie_gray.jpg', "B": 'mysterymovie_gray.jpg' };

            trial.timing_post_trial = (typeof trial.timing_post_trial === 'undefined') ? 1000: trial.timing_post_trial ; // default 1000ms
            trial.timing_image_gap = trial.timing_image_gap || 1000; // default 1000ms

            trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
            trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
            trial.testing = (typeof trial.testing === 'undefined') ? false : trial.testing;
            trial.practice = (typeof trial.practice === 'undefined') ? false : trial.practice;
            trial.names = (typeof trial.names === 'undefined') ? trial.peers : trial.names;

            trial.center_percent = trial.center_percent || 75 ;
            trial.fMRI = trial.fMRI || false ;
            trial.peer_dict = trial.peer_dict || {};
            trial.peerDir = trial.peerDir || 'img/agents/';
            trial.peerExt = (typeof trial.peerExt === 'undefined') ? '.jpg' : trial.peerExt ;
            trial.stimDir = (typeof trial.stimDir === 'undefined') ? 'img/movies/': trial.stimDir;
            trial.stimTableWidth = trial.stimTableWidth || '600px';
            trial.prefix = trial.prefix || 'jspsych-';
            trial.mysteryCorrect = trial.mysteryCorrect || 'B';
            trial.peerCPercent = trial.peerCPercent || '';
            trial.showPeer1 = trial.showPeer1 || 'A';
            trial.showPeer2 = trial.showPeer2 || 'B';

            trial.respDelay = trial.respDelay || 0;

            trial.yes_no_labels = (typeof trial.yes_no_labels === 'undefined') ? true : trial.yes_no_labels;

            trial.prompt = trial.prompt.replace(/\${peer}/, trial.names[trial.peer]);

            trial.timeoutBeforeMystery = ifelse(trial.timeoutBeforeMystery, 2000);
            trial.timeoutBeforePrompt = ifelse(trial.timeoutBeforePrompt, 2000);
            trial.timeoutBeforeResponse = ifelse(trial.timeoutBeforeResponse, 2000);
            trial.timeoutBeforeStim = ifelse(trial.timeoutBeforeStim, 2000);
            trial.timeoutAfterFeedback = ifelse(trial.timeoutAfterFeedback, 2000);
            trial.timeoutAfterFeedbackMystery = ifelse(trial.timeoutAfterFeedbackMystery, 2000);
            trial.timeoutAfterStim = ifelse(trial.timeoutAfterStim, 2000);

            trial.ingroup_color = ifelse(trial.ingroup_color, 'black');
            trial.outgroup_color = ifelse(trial.outgroup_color, 'black');

            trial.missed_img = ifelse(trial.missed_img, 'img/missed.jpg');
            trial.width = ifelse(trial.width, '1000px');
        }

        // if any trial variables are functions
        // this evaluates the function and replaces
        // it with the output of the function

        //trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        $('html').css({
            width: trial.width,
            'margin-left': 'auto',
            'margin-right': 'auto',
        });
        $('body').css({
            width: trial.width,
            'margin-left': 'auto',
            'margin-right': 'auto',
        });
        $(document).width(trial.width);
        display_element = $(display_element);
        display_element.width(trial.width);
        $('.jspsych-content-wrapper').width(trial.width);


        var keyboard_listener, practice_keyboard_listener, keyboard_listener2;
        var startTime = (new Date()).getTime();

        var trial_data = {
            'phase': trial.phase,
            'timestamp_start': new Date(),
            'global_time_start': new Date() - globalStartTime,
        };

        ///////////////////////////////////////////
        // Start countdown for next trial	 //
        ///////////////////////////////////////////
        if (trial.phase != 'PROMPT') {
            showPeers();
            // custTimeout(endTrial, trial.postTimeout);
        } else {
            startPromptKeyListener();
        }

        //No progressbar
        $('#' + trial.prefix + 'progressbar-container').hide();


        ////////////////////////
        // Trial Logic	      //
        ////////////////////////
        if (trial.phase == "FIRST") {
            writeHTML();
        }
        if (trial.phase.toUpperCase() == "FIXATION") { //If fixation, show fixation
            if (trial.writehtml) {
                writeHTML(); //If first trial, write fresh HTML structure
                $('#jspsych-fixation').show();
            }

            showFixation();
        } else { //Otherwise
            if (trial.phase.toUpperCase() == "FEEDBACK") {
                showFeedback(trial_data); //Show feedback
            } else {
                showBlankScreen(); //Or show blank screen, then continue
                if (trial.practice) {
                    $('#' + trial.prefix + 'progressbar-container').hide();
                    trial.timing_post_trial = 0;
                } else {
                    $('#' + trial.prefix + 'progressbar-container').show();
                }

            }
        }

        function showPrompt() {
            //console.log('showPrompt');
            hideAll();

            writePrompt();

            // var peer_img = trial.peer_dict[trial.showPeer].img;
            // var peer_name = trial.peer_dict[trial.showPeer].name;

            // var $img = $('<img>', {
            // 	'src': trial.peerDir + peer_img,
            // 	'id': 'AB_img',
            // });
            // var $name = $('<p>', {
            // 	'text': peer_name,
            // 	'id': 'AB_label',
            // });

            $('#jspsych-fixation').css('visibility', 'visible').show();
            $('#fixtext')
                .empty()
                .css({
                    'visibility':'visible',
                    //'position': 'absolute',
                    //'top': '170px',
                    //'left':($(document).width() - 150) / 2 + 'px',
                })
                .show();

            $('#jspsych-prompt-tr').siblings().hide();

            //var timer = custTimeout(nextfunc, timeout); //timeout);
            $('#jspsych-fixation').hide().css({'visibility': 'hidden'});
            $('#jspsych-stim').show().css({'visibility': 'visible'});
        }


        function endTrial () {
            //console.log('endTrial ');
            $('#jspsych-choice_0').css({'border-style': 'solid', 'border-color': 'white'})
            $('#jspsych-choice_1').css({'border-style': 'solid', 'border-color': 'white'})
            //console.log('endTrial ');
            //Stop listening for keys and write final trial data
            stopKeyListener();

            trial_data['trial_duration'] = (new Date()) - startTime;
            trial_data['global_time_end'] = (new Date()) - globalStartTime;

            if (typeof trial_data.rt == 'undefined') {
                logResp({key: 0, rt: -1, missed: true})
            }
            jsPsych.finishTrial(trial_data);
        }

        function showBlankScreen() {
            //console.log('showBlankScreen');
            window.scrollTo(0, 0);
            $('#jspsych-stim').css('visibility', 'hidden');
            $('#jspsych-choice_0').css({'border-style': 'solid', 'border-color': 'white'});
            $('#jspsych-choice_1').css({'border-style': 'solid', 'border-color': 'white'});

            if (trial.phase == "FIRST" || trial.writehtml) {
                writeHTML(); //If first trial, write fresh HTML structure
            }

            //console.log('trial.peer');
            //console.log(trial.peer);
            if (trial.peer == 0) { //If first trial in row, add new row to history table
                $('#' + trial.prefix + 'history_table').append(
                    addHistoryRow()
                );
            }

            //Show stim and history sections, fixation is hidden
            $('#jspsych-stim').css('visibility', 'visible').show();
            $('#jspsych-history_table').css('visibility', 'visible').show();
            $('#jspsych-history').css('visibility', 'visible').show();

            custTimeout(showNextStim, trial.timeoutBeforeStim);
        }

        function createHistoryTable () {
            //console.log('createHistoryTable ');

            var $div = $('<div>', {
                id: trial.prefix + 'history',
                css: {width: '600px'}
            });

            var $table = $('<table>', {
                id: trial.prefix + 'history_table',
                css: {
                }
            });

            var $tr_pic = $('<tr>');
            var $tr_name = $('<tr>');

            for (var j = 0; j < trial.peers.length; j++) {
                var peer_label = trial.peer_label[j];
                console.log(trial.peer_dict);
                var border_color = trial.peer_dict[peer_label]['border_color'] ? trial.peer_dict[peer_label]['border_color'] : 'white';
                var border_width = trial.peer_dict[peer_label]['border_width'] ? trial.peer_dict[peer_label]['border_width'] : '4px';
                $tr_pic.append($('<td>', {
                    //width: "25%"
                }).html($('<div>', {
                    css: {
                        //width: '25%'
                    }
                }).append(
                    $('<img>', {
                        src: trial.peerDir + trial.peers[j] + trial.peerExt,
                        class: 'history',
                        css: {'border-style': 'solid', 'border-color':
                              trial.peer_dict[peer_label]['border_color'],
                              'border-width': border_width,
                              'border-color': border_color},
                    }
                     ).addClass(trial.peer_label[j])))
                              );
                $tr_name.append($('<td>', {
                    //width: "25%"
                }).html(
                    $('<p>', {
                        text: trial.names[j],
                        class: 'history',
                        css: {
	                              'margin-left': 'auto',
	                              'margin-right': 'auto'
                        }
                    }
                     ).addClass(trial.peer_label[j])
                )
                               );
            }

            $table.append($tr_pic);
            $table.append($tr_name);
            $div.append($table);
            return $div;
        }

        function addHistoryRow() {
            console.log('addHistoryRow');
            var $tr = $('<tr>');
            for (var j = 0; j < trial.peers.length; j++) {
                $tr.append($('<td>'));
            }
            return $tr;
        }

        function createStimTable() {
            console.log('createStimTable');
            var $div = $('<div>', {
                id: trial.prefix + 'stim',
                css: {
                    width: trial.stimTableWidth,
                }
            });

            var $table = $('<table>', {
                'id': trial.prefix + 'stim_table',
            })

            var $prompt = $('<tr>', {id: 'jspsych-prompt-tr'}).append($('<td>', {
                html: '<h5 id="jspsych-prompt">',
                width: trial.stimTableWidth,
                colspan: 2
            }));

            var $tr = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-choice_' + i,
                    css: {'border-style': 'solid', 'border-color': 'white', 'border-width': '3px'},
                });
                $tr.append($td);
            }

            var $tr_label = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-label_' + i,
                    "class": "jspsych-label",
                });
                $tr_label.append($td);
            }

            var $tr_sub_label = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-sub-label_' + i,
                    "class": "jspsych-sub-label",
                });
                $tr_sub_label.append($td);
            }


            $table.append($prompt);
            $table.append($tr_label);
            $table.append($tr);
            $table.append($tr_sub_label);
            $div.append($table);
            return $div;
        }

        function createFixation() {
            //console.log('createFixation');
            var $div = $('<div>', {
                id: 'jspsych-fixation',
                css: {
                    // width: trial.stimTableWidth,
                    //width: '0px',
                    display: 'none',
                    'text-align': 'center',
                }
            });

            // var $table = $('<table>', {
            // 	'id': trial.prefix + 'fixation_table',
            // })

            // var $prompt = $('<tr>').append($('<td>', {
            // 	html: '<h5 id="jspsych-fix-prompt">',
            // 	width: trial.stimTableWidth,
            // 	colspan: 2,
            // 	text: ''
            // }));

            // var $tr = $('<tr>');
            // var $td = $('<td>');

            var $fix = $('<h1>', {
                id: 'fixtext', text: '+',
                css: {
                    'text-align': 'center',
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                    'width': '100%',
                    'top': '300px',
                }
            });

            // $td.append($fix);
            // $tr.append($td);

            // $table.append($prompt);
            // $table.append($tr);
            // $div.append($table);

            $div.append($fix);
            return $div;
        }
        trial.createFixation = createFixation;

        function writeHTML() {
            //console.log('writeHTML');
            $(display_element).empty();

            var $historyTable = createHistoryTable();
            var $stimTable = createStimTable();
            var $fixation = createFixation();

            var $leftPanel = $('<div>', {
                id: 'jspsych-left-panel',
                css:{
                    width: '600px',
                    height: '800px',
                    float: 'left',
                },
            }).append(
                $('<div>', {
                    html: $stimTable,
                    css: {
                        //position: 'relative',
                        //width: '200px',
                        //top: '0px',
                        //left: '0px'

                    }
                })
            ).append(
                $('<div>', {
                    id: 'fix-div',
                    html: $fixation,
                    css: {
                        //width: "10%"
                        // position: 'relative',
                        // width: '300px',
                        // top: '0px',
                        //left: trial.stimTableWidth,
                        'margin-left': 'auto',
                        'margin-right': 'auto',
                        'text-align': 'center',
                        'width': '100%',
                    }
                })
            );


            var $displayTable = $('<div>').append($leftPanel) .append($('<div>', {
                html: $historyTable,
                css: {
                    //width: "10%"
                    float: 'right',
                    position: 'relative',
                    width: '300px',
                    top: '0px',
                    //left: trial.stimTableWidth,
                    'margin-left': '30px',
                    visibility: 'hidden',
                }
            })
                                                                     );

            display_element.append($displayTable);
            display_element.prepend($('<div>', {
                id: 'header',
                css: {
                    //height: '50px',
                    //'background-color': 'blue',
                }
            }));

            $stimTable.hide().append($('<div>', {id: "jspsych-peer"}));
        }

        function writeStims() {
            //console.log('writeStims');
            for(var i = 0; i < trial.stimuli.length; i++) {
                var label = '';
                $('#jspsych-label_' + i).html($('<p>', {
                    text: trial.choices[i].toUpperCase(),
                    css: {
                        margin: '0px',
                        height: '25px',
                    }
                }));
                if (trial.stim_label != undefined) {
                    $('#jspsych-label_' + i).append(
                        $('<p>', {
                            text: trial.stim_label[i].toUpperCase(),
                            css: {
                                margin: '0px',
                                height: '25px',
                                color: 'gray',
                            }
                        })		    );
                }

                $('#jspsych-choice_' + i).html($('<img>', {
                    src: trial.stimDir + trial.stimuli[i],
                    class: 'stim',
                }));

                if (trial.yes_no_labels == true) {
                    if (trial.stimuli[i].indexOf('xes') >= 0) {
                        var lab = "NO";
                    } else if (trial.stimuli[i].indexOf('oes') >= 0) {
                        var lab = "YES";
                    } else {
                        var lab = "";
                    }
                    $('#jspsych-sub-label_' + i).empty().append(
                        $('<p>', {
                            text: lab,
                            css: {
                                margin: '0px',
                                height: '25px',
                                color: 'gray',
                            }
                        })		    );
                }
            }
            $('#jspsych-stim').css('visibility', 'visible');
        }

        function showPeer() {
            //console.log('showPeer');
            hideAll();

            // writePrompt();

            var peer_img = trial.peer_dict[trial.showPeer].img;
            var peer_name = trial.peer_dict[trial.showPeer].name;

            var $img = $('<img>', {
                'src': trial.peerDir + peer_img,
                'id': 'AB_img',
            });
            var $name = $('<p>', {
                'text': peer_name,
                'id': 'AB_label',
            });

            $('#jspsych-fixation').css('visibility', 'visible').show();
            $('#fixtext')
                .empty()
                .append($img)
                .append($name)
                .css({
                    'visibility':'visible',
                    //'position': 'absolute',
                    //'top': '170px',
                    //'left':($(document).width() - 150) / 2 + 'px',
                })
                .show();

            //var timer = custTimeout(nextfunc, timeout); //timeout);
            //showFixation();
        }

        function showFixation() {
            //console.log('showFixation');
            hideAll();

            $('#fixtext').empty().text('+').css({
                'font-size': 'xx-large',
                'text-align': 'center',
                'margin-left': 'auto',
                'margin-right': 'auto',
                'visibility': 'visible',
                //'position': 'absolute',
                //'left':($(document).width() ) / 2 + 'px',
            })
                .show();

            $('#jspsych-fixation').css('visibility', 'visible').show();

        }

        function showNextStim() {
            //console.log('showNextStim');
            //console.log(trial);

            if (trial.phase == "MYSTERY") {
                //console.log('mystery');
                custTimeout(askMystery,trial.timeoutBeforeMystery);
                custTimeout(startKeyListener, trial.timeoutBeforeResponse +
                            trial.timeoutBeforeMystery);
            } else if (trial.phase == "AB") {
                //console.log('AB');
                showPeer(); //Don't listen for keypress in AB display
            } else if (trial.phase == "PROMPT") {
                //console.log('PROMPT');
                hideFixation();
                hidePeers();
                showPrompt();
                hideFixation();
                $('#jspsych-fixation').show().css({'visibility': 'visible'});
                $('#jspsych-stim').show().css({'visibility': 'visible'});
                //console.log('should be showing prompt');
            } else {
                //console.log('else');
                custTimeout(askPref, trial.timeoutBeforePrompt);
                custTimeout(writeStims, trial.timeoutBeforeStim);
                var max_t = Math.max(trial.timeoutBeforePrompt,trial.timeoutBeforeStim);
                // custTimeout(startKeyListener, trial.timeoutBeforeResponse + max_t);
                // custTimeout(askPref, 0);
                // custTimeout(writeStims, 0);
                // var max_t = Math.max(trial.timeoutBeforePrompt,trial.timeoutBeforeStim);
                // custTimeout(startKeyListener, 0);
            }

            if (trial.practice == true) {
                window.scrollTo(0, 0);
                var mouse_listener_instructs = function(e) {
                    window.scrollTo(0, 0);
                    function setTrialInstructs() {
                        //console.log('setTrialInstructs');
                        if (typeof trial.instructsAfterClick != 'undefined') {
                            var newPrompt = trial.instructsAfterClick.replace(
                                    /\${peer}/, trial.names[trial.peer]
                            );
                            $('#jspsych-prompt').html(newPrompt);
                        }
                    }
                    $('#feedbackContinue').unbind('click', mouse_listener_instructs);
                    $('#continueBlock').remove();
                    setTrialInstructs();
                    startKeyListener();
                };

                stopKeyListener();
                appendContinue(mouse_listener_instructs, trial.trialButtonLabel);
            } else if (trial.phase.toUpperCase() != 'MYSTERY'){
                custTimeout(startKeyListener, trial.timeoutBeforeResponse + max_t);
            }
        }

        function hideFixation () {
            //console.log('hideFixation ');
            $('#jspsych-fixation').hide();
        }

        function showPeers () {
            //console.log('showPeers ');
            $('#jspsych-prompt-tr').siblings().show();
            $('#jspsych-peer').show();
        }

        function onlyShowPeers(arg) {
            //console.log('onlyShowPeers');
            $('#jspsych-prompt-tr').siblings().show();
            $('#jspsych-peer').show();
        }


        function hidePeers () {
            //console.log('hidePeers ');
            $('#jspsych-prompt-tr').siblings().hide();
            $('#jspsych-peer').hide();
        }

        function askMystery() {
            //console.log('askMystery');
            hideAll();
            $('#jspsych-peer').hide();

            writePrompt();

            for(var i = 0; i < trial.stimuli.length; i++) {
                var p = i == 0 ? trial.peer1 : trial.peer2;
                $('#jspsych-choice_' + i).html($('<img>', {
                    // src: trial.stimDir + trial.mystery[trial.peer_label[[trial.peer1, trial.peer2][i]]],
                    src: trial.peerDir + trial.peer_dict[p]['img'],
                    class: 'stim mystery' ,
                }));
                $('#jspsych-sub-label_' + i).empty() .append(
                    $('<p>').text(trial.peer_dict[p]['name'])
                )
            }


            for(var i = 0; i < trial.stimuli.length; i++) {
                var label = '';
                $('#jspsych-label_' + i).html($('<p>', {
                    text: trial.choices[i].toUpperCase(),
                    css: {
                        margin: '0px',
                        height: '25px',
                    }
                }));
            }
            var color1 = trial.peer_label[trial.peer1] == "B" ? trial.outgroup_color : trial.ingroup_color;
            var color2 = trial.peer_label[trial.peer2] == "B" ? trial.outgroup_color : trial.ingroup_color;

            // $('#jspsych-peer').html(
            // 	$('<div>', {id: 'jspsych-peer-pic'}).append(
            // 	    $('<img>', {src: trial.peerDir + 'arrowL_gray.jpg', width: '25%'})
            // 	).append(
            // 	    $('<div>', {css: {display: 'inline-block'}}).append(
            // 		$('<img>', {
            // 		    src: trial.peerDir + trial.peer_dict[trial.peer1]['img'] + trial.peerExt,
            // 		    width: '100%',
            // 		    class: "mystery" + trial.peer1,
            // 		    css: {'border-color': color1},
            // 		})
            // 	    )		).append(
            // 	    $('<div>', {css: {display: 'inline-block'}}).append(
            // 		$('<img>', {
            // 		    src: trial.peerDir + trial.peer_dict[trial.peer2]['img'] + trial.peerExt,
            // 		    width: '100%',
            // 		    class: "mystery" + trial.peer2,
            // 		    css: {'border-color': color2},
            // 		})
            // 	    ).append(
            // 		$('<p>').text(trial.peer_dict[trial.peer2]['name'])
            // 	    )
            // 	).append(
            // 	    $('<img>', {src: trial.peerDir + 'arrowR_gray.jpg', width: '25%'})
            // 	)

            // ).append(
            // 	$('<p>', {id: 'jspsych-peer-name'}).text(trial.names[trial.peer])
            // );

            // $('#jspsych-peer-pic>div').css( {
            // 	'width': '20%'
            // });
            // $('#jspsych-peer-pic>div>img').css( {
            // 	'width': '85%'
            // });
            // $('#jspsych-peer-pic>img').css( {
            // 	'width': '20%'
            // });

            $('#jspsych-stim').css('visibility', 'visible').show();
            $('#jspsych-history').css('visibility', 'visible').show();
            $('#jspsych-fixation').hide();

        }

        function writePrompt() {
            //console.log('writePrompt');
            if (trial.phase == "MYSTERY") {
                var mysteryPeers = ['A', 'B']
                mysteryPeers.shuffle();

                trial.peer1 = mysteryPeers.pop();
                trial.peer2 = mysteryPeers.pop();
                trial.prompt = trial.prompt.replace(/\${peer1}/, trial.peer_dict[trial.peer1]['name']);
                trial.prompt = trial.prompt.replace(/\${peer2}/, trial.peer_dict[trial.peer2]['name']);

                var marg = 50;
            } else {
                trial.prompt = trial.prompt.replace(/\${peer}/, trial.names[trial.peer]);
                var marg = 20;
            }

            if (trial.practice) {
                window.scrollTo(0, 0);
                $('#jspsych-prompt').html(
                    $('<p>', {
                        html: trial.prompt,
                        css: {
                        }
                    })
                ).addClass('practice');
            } else {

                if (trial.phase == "MYSTERY") {
                    var marg = 50;
                } else {
                    var marg = 20;
                }
                $('#jspsych-prompt').html(
                    $('<p>', {
                        html: trial.prompt,
                        css: {
                            height: '0px',
                            'margin-bottom': marg + 'px',
                            'margin-top': '0px',
                        }
                    })
                );
            }

            $('#jspsych-prompt').html(
                $('<p>', {
                    html: trial.prompt,
                    css: {
                        height: '0px',
                        'margin-bottom': marg + 'px',
                        'margin-top': '0px',
                    }
                })
            ).show();

            $('#jspsych-stim').css({'visibility': 'visible'}).show();
        }

        function appendContinue(listener, text) {
            //console.log('appendContinue');
            if ($('#continueBlock').length == 0) {
                var $div = $('<div>', {
                    id: 'continueBlock',
                });
                var $p = $('<p>', {
                    html: text,
                });

                var $butt = $('<input>')
                    .attr('type', 'button')
                    .attr('value', 'Continue')
                    .attr('id', 'feedbackContinue')
                    .on('click', listener);

                $div.append($p).append($butt);
                $('#jspsych-prompt').append($div);
            } else {
                //console.log("Already have a button");
            }
        }

        function askPref() {
            writePrompt();

            if (trial.names[trial.peer].toLowerCase() == "you") {
                $('#jspsych-peer').html(
                    $('<p>', {id: 'jspsych-you-slow'})
                );
            } else {
                var peer_label = trial.peer_label[trial.peer];
                var border_color = trial.peer_dict[peer_label]['border_color'] ? trial.peer_dict[peer_label]['border_color'] : 'white';
                var border_width = trial.peer_dict[peer_label]['border_width'] ? trial.peer_dict[peer_label]['border_width'] : '8px';
                var peer_group = trial.peer_dict[peer_label]['group'] ? trial.peer_dict[peer_label]['group'] : '';

                trial['current_border_color'] = border_color;
                trial['current_peer_group'] = peer_group;

                $('#jspsych-peer').html(
                    $('<p>', {id: 'jspsych-peer-ACC'})
                ).append(
                    $('<div>', {id: 'jspsych-peer-pic'}).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer] + trial.peerExt,
                            class: 'peer',
                            css: {'border-style': 'solid', 'border-color':
                                  border_color, 'border-width': border_width},
                        })
		                )
		            ).append(
		                $('<p>', {id: 'jspsych-peer-name'}).text(trial.names[trial.peer])
		            );
	          }

	      }

	      function showFeedback(trial_data) {
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
	          var mouse_listener = function(e) {
	              window.scrollTo(0, 0);
		            $('#feedbackContinue').unbind('click', mouse_listener);
		            jsPsych.finishTrial(trial_data);
	          };

	          var $histAppend = $($('#jspsych-history_table tr').slice(-1).children()[trial.peer]);


	          if (trial.phase != "MYSTERY") {

		            $histAppend.append(
		                $('<img>', {
			                  src: trial_data.peerChoice,
			                  class: 'history',
		                })
		            );

		            if (trial_data.ACC == 1) {
		                $('#jspsych-peer-ACC').text( "CORRECT").css({color: 'green'});
		            } else {
		                $('#jspsych-peer-ACC').text( "INCORRECT").css({color: 'red'});
		            }

		            if (!trial.practice || trial.feedbackPrompt == undefined || trial.phase == "MYSTERY" ) {
		                custTimeout(function () {
			                  $('#jspsych-choice_0').css({'border-style': 'solid', 'border-color': 'white'})
			                  $('#jspsych-choice_1').css({'border-style': 'solid', 'border-color': 'white'})
			                  //console.log('finishTrial ');
			                  //Stop listening for keys and write final trial data
			                  stopKeyListener();

			                  trial_data['trial_duration'] = (new Date()) - startTime;
			                  trial_data['global_time_end'] = (new Date()) - globalStartTime;
			                  jsPsych.finishTrial(trial_data);
		                }, trial.timeoutAfterFeedback);
		            } else {
	                  window.scrollTo(0, 0);
		                if (trial.feedbackChoices == 'mouse' || trial.feedbackChoices == 'click') {
			                  // appendContinue(mouse_listener, trial.feedbackButtonLabel);
		                } else {
			                  practice_keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
			                      callback_function: function () {
				                        jsPsych.pluginAPI.cancelKeyboardResponse(
				                            practice_keyboard_listener);
				                        jsPsych.finishTrial(trial_data);
			                      },
			                      valid_responses: [' '],
			                      rt_method: 'date',
			                      persist: true,
			                      allow_held_key: false
			                  });
		                }

		                if (trial.feedbackPrompt) {
			                  $('#jspsych-prompt').html(trial.feedbackPrompt);


			                  if (trial.feedbackChoices == 'mouse' || trial.feedbackChoices == 'click') {
			                      //console.log('appending mouse');
			                      appendContinue(mouse_listener, trial.feedbackButtonLabel);
			                  } else {
			                      $('#jspsych-prompt').append(
				                        $('<p>', {
				                            text: "Press the Spacebar to continue"
				                        }));
			                  }

		                }

		            }


		            // if (trial_data.peerNum != 0) {
		            if (trial_data.peerSide == 'left') {
		                $('#jspsych-peer-pic').prepend(
			                  $('<img>', {
			                      src: trial.peerDir + 'arrowL_gray.jpg',
			                      class: 'peer',
			                  })
		                );
		            } else {
		                $('#jspsych-peer-pic').append(
			                  $('<img>', {
			                      src: trial.peerDir + 'arrowR_gray.jpg',
			                      class: 'peer',
			                  })
		                );
		            }
		            // }

	          } else {
                console.log('mystery');
                if (trial_data.respKey == "E") {
			              $('#jspsych-choice_0').css({'border-style': 'solid', 'border-color': 'gray'});
                } else if (trial_data.respKey == "I") {
                    $('#jspsych-choice_1').css({'border-style': 'solid', 'border-color': 'gray'});
                }
		            custTimeout(function () {
			              stopKeyListener();
		                jsPsych.finishTrial(trial_data);
		            }, trial.timeoutAfterFeedbackMystery);
	          }
	      }

	      function fmriAdvance() {
	          //console.log('fmriAdvance');

	      }

	      function startKeyListener() {
	          window.scrollTo(0, 0);
	          //console.log('startKeyListener');
	          startTime = (new Date()).getTime();
	          keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
		            callback_function: logResp,
		            valid_responses: trial.choices,
		            rt_method: 'date',
		            persist: true,
		            allow_held_key: false
	          });
	          // keyboard_listener2 = jsPsych.pluginAPI.getKeyboardResponse({
	          // 	callback_function: fmriAdvance,
	          // 	valid_responses: ['p'],
	          // 	rt_method: 'date',
	          // 	persist: true,
	          // 	allow_held_key: false
	          // });
	      }


	      function startPromptKeyListener() {
	          //console.log('startPromptKeyListener');
	          // //console.log("Starting prompt key listener");
	          // //console.log(trial.choices);
	          // //console.log(logResp);
	          keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
		            callback_function: endTrial,
		            valid_responses: trial.choices,
		            rt_method: 'date',
		            persist: false,
		            allow_held_key: false
	          });
	      }

	      function stopKeyListener() {
	          //console.log('stopKeyListener');
	          if(typeof keyboard_listener != 'undefined') {
		            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
	          }
	      }

	      function logResp(arg) {
	          //console.log('logResp');
	          stopKeyListener();
	          jsPsych.pluginAPI.clearAllTimeouts();

	          var endTime		= (new Date()).getTime();
	          var response_time	= endTime - startTime;
	          var respCharCode	= arg.key;
	          var respKey		= String.fromCharCode(arg.key);

	          //////////////////////////////////////////////////////
	          // If P missed the response, randomly choose        //
	          // one stimulus as the one they "chose"	        //
	          //////////////////////////////////////////////////////
	          var missed = ifelse(arg.missed, false);
	          trial_data['missed'] = missed;

	          var respChoiceNum = trial.choices.indexOf(respKey.toLowerCase());
	          $('#jspsych-choice_' + respChoiceNum).css({'border-style': 'solid', 'border-color': 'white', 'border-width': '3px'})

	          var respChoice	 = trial.stimDir + trial.stimuli[respChoiceNum];
	          var unselectedChoice = trial.stimDir + trial.stimuli[(respChoiceNum + 1) % 2];

	          var ACC, peerSide;

	          // number of the peer
	          var p = trial.peer;

	          // whether the peer agrees
	          var a = trial.peer_agree[p];
            if (a == 1) {
                var peerChoice = trial.stimuli[0][0] == 'o' ? trial.stimuli[0] : trial.stimuli[1];
            } else {
                var peerChoice = trial.stimuli[0][0] == 'o' ? trial.stimuli[1] : trial.stimuli[0];
            }

	          // var peerChoice = trial.stimuli[a]

	          var left = trial.stimDir + trial.stimuli[0];
	          var right = trial.stimDir + trial.stimuli[1];
	          if (peerChoice == left) {
		            peerSide = 'left';
	          } else {
		            peerSide = 'right';
	          }

	          if (typeof respChoice != 'undefined' && trial.phase != "MYSTERY") {
		            //console.log(respChoice);
		            //console.log(peerChoice);
		            if (respChoice == peerChoice) {
		                ACC = 1;
		            } else {
		                ACC = 0;
		            }
	          }

	          var correctChoice	= trial.peer_agree[trial.peer] == 1 ?
		            trial.stimuli[respChoiceNum] :
		            trial.stimuli[(respChoiceNum + 1) % 2];

	          var peerName	= trial.names[trial.peer];
	          var peerImg 	= trial.peers[trial.peer];
	          var mysteryPeers = [trial.peer1, trial.peer2];

	          $.extend(trial_data, {
		            "rt"			: arg.rt,
		            "respCharCode"		: respCharCode,
		            "respKey"		: respKey,
		            "respChoiceNum"		: respChoiceNum,
		            "respChoice"		: respChoice,
		            "unselectedChoice"	: unselectedChoice,
		            "peerChoice"		: peerChoice,
		            "stimuli"		: JSON.stringify(trial.stimuli),
		            "peerNum"		: trial.peer,
		            "peerName"		: peerName,
		            "peerImg"		: peerImg,
		            "peerSide"		: peerSide,
		            "ACC"			: ACC,
		            "MysteryPeer1"		: trial.peer1,
		            "MysteryPeer2"		: trial.peer2,
		            "phase"			: trial.phase,
		            "peerCPercent"		: trial.peerCPercent,
                "peerBorderColor": trial.current_border_color,
                "peerGroup": trial.current_peer_group
	          });
	          if (trial.phase == "MYSTERY") {
		            trial_data['mysteryRespKey'] = respKey;
		            // Chosen mystery peer
		            trial_data['mysteryPeerChosenImg'] = trial.peers[mysteryPeers[respChoiceNum]];
		            trial_data['mysteryPeerChosenName'] = trial.names[mysteryPeers[respChoiceNum]];
		            trial_data['mysteryLabelChosen'] = trial.peer_label[mysteryPeers[respChoiceNum]];
		            // Unchosen mystery peer
		            trial_data['mysteryPeerUnchosenImg'] = trial.peers[mysteryPeers[(respChoiceNum + 1) % 2]];
		            trial_data['mysteryPeerUnchosenName'] = trial.names[mysteryPeers[(respChoiceNum + 1) % 2]];
		            trial_data['mysteryLabelUnchosen'] = trial.peer_label[mysteryPeers[(respChoiceNum + 1) % 2]];

		            if (trial_data['mysteryLabelChosen'] == trial.mysteryCorrect) {
		                trial_data['ACC'] = 1;
		            } else {
		                trial_data['ACC'] = 0;
		            }
	          }

	          trial.trial_data = trial_data;
	          for(var i = 0; i < trial.peers.length; i++) {
		            trial_data["PeerImg" + i] = trial.peers[i];
		            trial_data["PeerName" + i] = trial.names[i];
		            trial_data["PeerAgreement" + i] = trial.peer_agree[i];
		            trial_data["PeerCompare" + i] = trial.peer_compare[i];
		            trial_data["PeerLabel" + i] = trial.peer_label[i];
	          }

	          custTimeout(function () {showFeedback(trial_data);}, trial.timeoutBeforeFeedback);
	      }

	      function jitter() {
	      }

    };
    return plugin;
})();
