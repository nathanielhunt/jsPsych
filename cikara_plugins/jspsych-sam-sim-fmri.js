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


    //jsPsych.pluginAPI.registerPreload('similarity', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});
    //jsPsych.pluginAPI.registerPreload('similarity', 'peers', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

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
    };

    plugin.trial = function(display_element, trial) {
        var respNotLogged = true;
        startPulseListener()

        function ifelse(arg, arg_def) {
            return (typeof arg === 'undefined') ? arg_def : arg;
        }

        function custTimeout(func, time) {
            var t = new Date() - globalStartTime;
            time = ifelse(time, 0);
            if (time > 0) {
                var timer = jsPsych.pluginAPI.setTimeout(function() {
                    var t = new Date() - globalStartTime;
                    func();
                }, time);
                return timer;
            } else {
                func();
            }
        }

        function hideAll() {
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

        trial.itis_remaining = trial.postTimeout;

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
            'timestamp_start': new Date() - 0,
            'global_time_start': new Date() - globalStartTime,
            'TRs': trial.postTimeout,
            'missed': true
        };

        ///////////////////////////////////////////
        // Start countdown for next trial	 //
        ///////////////////////////////////////////
        if (trial.phase != 'PROMPT') {
            showPeers();
            // fmriTimeout(endTrial, trial.postTimeout);
        } else {
            startPromptKeyListener();
        }

        //No progressbar
        $('#' + trial.prefix + 'progressbar-container').hide();


        ////////////////////////
        // Trial Logic	      //
        ////////////////////////
        if (trial.phase.toUpperCase() == "FIXATION") { //If fixation, show fixation
            if (trial.writehtml) {
                writeHTML(); //If first trial, write fresh HTML structure
                $('#jspsych-fixation').show();
            }

            showFixation();
        } else { //Otherwise 
            if (trial.phase.toUpperCase() == "FEEDBACK") { 
                console.log('show feedback next');
                showFeedback(); //Show feedback
            } else {
                showBlankScreen(); //Or show blank screen, then continue
            }
        }

        function showPrompt() {
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
            $('#jspsych-choice_0').css({'border-style': 'solid', 'border-color': 'white'})
            $('#jspsych-choice_1').css({'border-style': 'solid', 'border-color': 'white'})
            //console.log('endTrial ');
            //Stop listening for keys and write final trial data
            stopKeyListener();

            trial_data['trial_duration'] = (new Date()) - startTime;
            trial_data['global_time_end'] = (new Date()) - globalStartTime;

            //console.log('ending trial');
            // if (typeof trial_data.rt == 'undefined') {
            // 	logResp({key: 0, rt: -1, missed: true})
            // }
            //console.log('++++++++++++++++++++++++++++++');
            //console.log('++++++++++++++++++++++++++++++');
            //console.log(trial_data);
            //console.log('++++++++++++++++++++++++++++++');
            //console.log('++++++++++++++++++++++++++++++');
            jsPsych.pluginAPI.cancelAllKeyboardResponses()
            jsPsych.finishTrial(trial_data);
        }

        function showBlankScreen() {
            //console.log('showBlankScreen');
            $('#jspsych-stim').css('visibility', 'hidden');

            if (trial.phase == "FIRST") {
                writeHTML(); //If first trial, write fresh HTML structure
            }

            if (trial.peer == 0) { //If "you" trial, add new row to history table
                $('#' + trial.prefix + 'history_table').append(
                    addHistoryRow()
                );
            }

            //Show stim and history sections, fixation is hidden
            $('#jspsych-stim').css('visibility', 'visible').show();
            $('#jspsych-history_table').css('visibility', 'visible').show();
            $('#jspsych-history').css('visibility', 'visible').show();

            showNextStim();
        }

        function createHistoryTable () {

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
                    }
                     ).addClass(trial.peer_label[j]))
                       )
                              );
                $tr_name.append($('<td>', {
                    //width: "25%"
                }).html(
                    $('<p>', {
                        text: trial.names[j],
                        class: 'history',
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
            var $tr = $('<tr>');
            for (var j = 0; j < trial.peers.length; j++) {
                $tr.append($('<td>'));
            }
            return $tr;
        }

        function createStimTable() {
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
            for(var i = 0; i < trial.stimuli.length; i++) {
                if (i == 0) {
                    var l = "LEFT";
                } else {
                    var l = "RIGHT";
                }
                var label = '';
                $('#jspsych-label_' + i).html($('<p>', {
                    text: l.toUpperCase(),
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

            if (trial.phase == "MYSTERY") {
                startKeyListener(); //Listen for keypress
                askMystery();
            } else if (trial.phase == "AB") {
                showPeer(); //Don't listen for keypress in AB display
            } else if (trial.phase == "PROMPT") {
                hideFixation();
                hidePeers();
                showPrompt(); 
                hideFixation();
                $('#jspsych-fixation').show().css({'visibility': 'visible'});
                $('#jspsych-stim').show().css({'visibility': 'visible'});
                //console.log('should be showing prompt');
            } else {
                startKeyListener(); //Listen for keypress
                askPref();
                writeStims();
            }

        }

        function hideFixation () {
            $('#jspsych-fixation').hide();
        }

        function showPeers () {
            $('#jspsych-prompt-tr').siblings().show();
            $('#jspsych-peer').show();
        }

        function onlyShowPeers(arg) {
            $('#jspsych-prompt-tr').siblings().show();
            $('#jspsych-peer').show();
        }


        function hidePeers () {
            $('#jspsych-prompt-tr').siblings().hide();
            $('#jspsych-peer').hide();
        }


        function askMystery() {
            hideAll();
            writePrompt();

            for(var i = 0; i < trial.stimuli.length; i++) {
                $('#jspsych-choice_' + i).html($('<img>', {
                    src: trial.stimDir + trial.mystery[trial.peer_label[[trial.peer1, trial.peer2][i]]],
                    class: 'stim mystery' ,
                }));
                $('#jspsych-sub-label_' + i).empty()
            }


            for(var i = 0; i < trial.stimuli.length; i++) {
                var label = '';
                if (i == 0) {
                    var l = "LEFT";
                } else {
                    var l = "RIGHT";
                }
                $('#jspsych-label_' + i).html($('<p>', {
                    text: l.toUpperCase(),
                    css: {
                        margin: '0px',
                        height: '25px',
                    }
                }));
            }
            var color1 = trial.peer_label[trial.peer1] == "B" ? trial.outgroup_color : trial.ingroup_color;
            var color2 = trial.peer_label[trial.peer2] == "B" ? trial.outgroup_color : trial.ingroup_color;

            $('#jspsych-peer').html(
                $('<div>', {id: 'jspsych-peer-pic'}).append(
                    $('<img>', {src: trial.peerDir + 'arrowL_gray.jpg', width: '25%'})
                ).append(
                    $('<div>', {css: {display: 'inline-block'}}).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer1] + trial.peerExt,
                            width: '100%',
                            class: "mystery" + trial.peer_label[trial.peer1],
                            css: {'border-color': color1},
                        })
                    ).append(
                        $('<p>').text(trial.names[trial.peer1])
                    )
                ).append(
                    $('<div>', {css: {display: 'inline-block'}}).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer2] + trial.peerExt,
                            width: '100%',
                            class: "mystery" + trial.peer_label[trial.peer2],
                            css: {'border-color': color2},
                        })
                    ).append(
                        $('<p>').text(trial.names[trial.peer2])
                    )
                ).append(
                    $('<img>', {src: trial.peerDir + 'arrowR_gray.jpg', width: '25%'})
                )

            ).append(
                $('<p>', {id: 'jspsych-peer-name'}).text(trial.names[trial.peer])
            );

            $('#jspsych-peer-pic>div').css( {
                'width': '20%'
            });
            $('#jspsych-peer-pic>div>img').css( {
                'width': '85%'
            });
            $('#jspsych-peer-pic>img').css( {
                'width': '20%'
            });

            $('#jspsych-stim').css('visibility', 'visible').show();
            $('#jspsych-history').css('visibility', 'visible').show();
            $('#jspsych-fixation').hide();

        }

        function writePrompt() {
            if (trial.phase == "MYSTERY") {
                var mysteryPeers = []
                mysteryPeers.push(trial.peer_compare.indexOf(1));
                mysteryPeers.push(
                    trial.peer_compare.slice(mysteryPeers[0] + 1).indexOf(1) + mysteryPeers[0] + 1
                );
                mysteryPeers.shuffle();

                trial.peer1 = mysteryPeers.pop();
                trial.peer2 = mysteryPeers.pop();
                trial.prompt = trial.prompt.replace(/\${peer1}/, trial.names[trial.peer1]);
                trial.prompt = trial.prompt.replace(/\${peer2}/, trial.names[trial.peer2]);

                var marg = 50;
            } else {
                trial.prompt = trial.prompt.replace(/\${peer}/, trial.names[trial.peer]);
                var marg = 20;
            }

            $('#jspsych-prompt').html(
                $('<p>', {
                    html: '<br><br><br>' + trial.prompt,
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
        }

        function askPref() {
            writePrompt();


            if (trial.names[trial.peer].toLowerCase() == "you") {
                $('#jspsych-peer').html(
                    $('<p>', {id: 'jspsych-you-slow'})
                );
            } else {
                $('#jspsych-peer').html(
                    $('<p>', {id: 'jspsych-peer-ACC'})
                ).append(
                    $('<div>', {id: 'jspsych-peer-pic'}).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer] + trial.peerExt,
                            class: 'peer',
                        })
                    )
                ).append(
                    $('<p>', {id: 'jspsych-peer-name'}).text(trial.names[trial.peer])
                );
            }

        }

        function showFeedback() {
            console.log('showing feedback now');
            var prev_trial = getLastTrial();
            hideAll();
            $('#jspsych-stim').css('visibility', 'visible').show();
            $('#jspsych-history').css('visibility', 'visible').show();

            var $histAppend = $($('#jspsych-history_table tr').slice(-1).children()[prev_trial.peerNum]);

            if (prev_trial.phase.toUpperCase() != "MYSTERY") {
                //console.log('NOT MYSTERY SHOWING FEEDBACK');
                var prev_you = jsPsych.data.get().filter({peerNum: '0'}).readOnly().values().pop();
                if (prev_trial.peerNum != 0) {
                    /*
                      $('#jspsych-peer').html(
                      $('<p>').text(trial.peers[trial.peer])
                      );
                      $('#jspsych-peer').append(
                      $('<img>', {src: trial.peer_pics[trial.peer]})
                      );
                    */


                    //console.log('------------------------------');
                    //console.log('------------------------------');
                    //console.log('showing feedback');
                    //console.log(prev_trial['missed']);
                    //console.log('------------------------------');
                    //console.log('------------------------------');
                    if (!prev_trial['missed']) {
                        if (prev_trial.ACC == 1) {
                            $('#jspsych-peer-ACC').text( "CORRECT").css({color: 'green'});
                        } else {
                            $('#jspsych-peer-ACC').text( "INCORRECT").css({color: 'red'});
                        }
                    } else {
                        console.log('missed prev trial');
                        if (!trial.practice) {
                            //console.log('trial is not practice!');
                            $('#jspsych-peer-ACC').text( "Too slow!").css({
                                color: 'red',
                                'font-size': '200%',
                                'font-weight': 'bold',
                            });
                            //console.log('appending');
                            //console.log(prev_trial.missed_img);
                        }
                    }

                    $histAppend.append(
                        $('<img>', {
                            src: prev_trial.peerChoice,
                            class: 'history'
                        })
                    );

                } else {
                    var you_choice = prev_you['missed'] ? trial.missed_img : prev_trial.respChoice;

                    if (!prev_you['missed']) {
                        if (prev_you.respKey == "2") {
                            var side = 'R';
                        } else {
                            var side = 'L';
                        }

                        $('#jspsych-peer').html(
                            $('<p>', {id: 'jspsych-peer-ACC'})
                        ).append(
                            $('<div>', {id: 'jspsych-peer-pic'}).html(
                                $('<img>', {
                                    src: trial.peerDir + 'arrow' + side + '_gray.jpg',
                                    class: 'peer',
                                })
                            )
                        );
                    }
                    //console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                    //console.log('you_choice');
                    //console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                    if(typeof you_choice == 'undefined') {
                        you_choice = trial.missing_img;
                    }
                    //console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                    //console.log('you_choice');
                    //console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');

                    $histAppend.append(
                        $('<img>', {
                            src: you_choice,
                            class: 'history',
                        }).addClass('self')
                    )

                    if (prev_trial['missed'] && trial.practice) {
                        $('#jspsych-you-slow').text( "Too slow!").css({
                            color: 'red',
                            'font-size': '200%',
                            'font-weight': 'bold',
                        });
                    }
                }

                prev_trial.practice = prev_trial.practice;
                prev_trial.feedbackPrompt = prev_trial.feedbackPrompt;
                if (!prev_trial.practice || prev_trial.feedbackPrompt == undefined || prev_trial.phase == "MYSTERY" ) {
                } else {
                    if (prev_trial.feedbackChoices == 'mouse' || prev_trial.feedbackChoices == 'click') {
                        appendContinue(mouse_listener, prev_trial.feedbackButtonLabel);
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

                    if (prev_trial.feedbackPrompt) {
                        $('#jspsych-prompt').html(prev_trial.feedbackPrompt);


                        if (prev_trial.feedbackChoices == 'mouse' || prev_trial.feedbackChoices == 'click') {
                            appendContinue(mouse_listener, trial.feedbackButtonLabel);
                        } else {
                            $('#jspsych-prompt').append(
                                $('<p>', {
                                    text: "Press the Spacebar to continue"
                                }));
                        }

                    }

                }


                if (prev_trial.peerNum != 0) {
                    if (prev_trial.peerSide == 'left') {
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
                }

            } else {
            }
        }

        function getLastTrial() {
            var prev_data = jsPsych.data.get().readOnly().values();
            var prev_trial = prev_data.pop();
            while (prev_trial.phase.toUpperCase() == 'FIXATION') {
                var prev_trial = prev_data.pop();
            }
            return prev_trial;
        }

        function fmriAdvance() {

        }

        function startPulseListener() {
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: function () {fmriTimeout(trial.itis_remaining);},
                valid_responses: ['='],
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

        function startKeyListener() {
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: logResp,
                valid_responses: ['1', '2'],
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
            console.log('startPromptKeyListener');
            // console.log("Starting prompt key listener");
            // console.log(trial.choices);
            // console.log(logResp);
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: logResp,
                valid_responses: trial.choices,
                rt_method: 'date',
                persist: false,
                allow_held_key: false
            });
        }

        function stopPulseListener() {
            // console.log('stopKeyListener');
            if(typeof pulse_listener != 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
            }
        }

        function stopKeyListener() {
            console.log('stopKeyListener');
            if(typeof keyboard_listener != 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
            }
        }

        function logResp(arg) {
            stopKeyListener();
            respNotLogged = false;

            var endTime		= (new Date()).getTime();
            var response_time	= endTime - startTime;
            if (['prompt', 'fixation'].indexOf(trial.phase) < 0) {
                //console.log('skipping some logging')
            }
            var respCharCode	= arg.key;
            var respKey		= String.fromCharCode(arg.key);

            //////////////////////////////////////////////////////
            // If P missed the response, randomly choose        //
            // one stimulus as the one they "chose"	        //
            //////////////////////////////////////////////////////
            console.log(arg.missed);
            var missed = ifelse(arg.missed, false);
            trial_data['missed'] = missed;

            //console.log('==============================');
            //console.log('==============================');
            if (!missed) {
                //console.log('did not miss')
                var respChoiceNum = trial.choices.indexOf(respKey.toLowerCase());
                $('#jspsych-choice_' + respChoiceNum).css({'border-style': 'solid', 'border-color': 'gray', 'border-width': '3px'})
            } else {
                //console.log('missed trial');
                var respChoiceNum = randint(0,1);
            }
            //console.log('==============================');
            //console.log('==============================');

            var respChoice	 = trial.stimDir + trial.stimuli[respChoiceNum];
            var unselectedChoice = trial.stimDir + trial.stimuli[(respChoiceNum + 1) % 2];

            var subjectChoice, subjectUnselected, peerChoice, ACC, lastSelfTrial, left, right, peerSide;


            console.log('logging resp?');
            console.log(trial);

            if (trial.peer == 0) {
                subjectChoice = respChoice;
            } else if (typeof trial.peer != 'undefined') {
                console.log('trial.peerNum');
                console.log(trial.peerNum);
                var selfTrials = jsPsych.data.get().filter({peerNum: 0}).readOnly().values();
                lastSelfTrial = selfTrials[selfTrials.length -1];

                if (typeof lastSelfTrial.respChoice != 'undefined') {
                    subjectChoice = lastSelfTrial.respChoice;
                    subjectUnselected = lastSelfTrial.unselectedChoice;
                } else {
                    if (randint(1,2) == 1) {
                        subjectChoice = trial.stimuli[0];
                        subjectUnselected = trial.stimuli[1];
                    } else {
                        subjectChoice = trial.stimuli[1];
                        subjectUnselected = trial.stimuli[0];
                    }
                }


                if (trial.peer_agree[trial.peer] == 1) {
                    peerChoice = subjectChoice;
                } else {
                    peerChoice = subjectUnselected;
                }

                left = trial.stimDir + trial.stimuli[0];
                right = trial.stimDir + trial.stimuli[1];
                if (peerChoice == left) {
                    peerSide = 'left';
                } else {
                    peerSide = 'right';
                }

                if (typeof respChoice != 'undefined' && trial.phase != "MYSTERY") {
                    if (respChoice == peerChoice) {
                        ACC = 1;
                    } else {
                        ACC = 0;
                    }
                } else if (trial.phase != "MYSTERY") {

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
                "subjectChoice"		: subjectChoice,
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

	      }

	      function jitter() {
	      }

	      function fmriTimeout(i) {
	          // console.log('fmriTimeout');
	          // console.log('itis remaining: ' + i);
	          if (i <= 1) {
                if (respNotLogged) {
		                logResp({missed: true});
                }
		            endTrial();
	          }
	          trial.itis_remaining = trial.itis_remaining - 1;
	      }


    };
    return plugin;
})();
