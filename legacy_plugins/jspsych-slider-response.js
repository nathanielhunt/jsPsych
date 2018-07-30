/**
 * jspsych-slider
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 * Zach Ingbretsen
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['slider'] = (function() {

    var plugin = {};

    plugin.info = {
        name: 'slider',
        description: '',
        parameters: {
            questions: {
                type: [jsPsych.plugins.parameterType.STRING],
                array: true,
                default: undefined,
                no_function: false,
                description: ''
            },
            labels: {
                type: [jsPsych.plugins.parameterType.STRING],
                array: true,
                default: undefined,
                no_function: false,
                description: ''
            },
            required: {
                type: [jsPsych.plugins.parameterType.BOOL],
                array: true,
                default: false,
                no_function: false,
                description: ''
            },
            preamble: {
                type: [jsPsych.plugins.parameterType.STRING],
                default: '',
                no_function: false,
                description: ''
            },
            slider_min: {
                type: [jsPsych.plugins.parameterType.INT],
                default: '',
                no_function: false,
                description: ''
            },
            slider_max: {
                type: [jsPsych.plugins.parameterType.INT],
                default: '',
                no_function: false,
                description: ''
            }
        }
    };

    plugin.trial = function(display_element, trial) {
        display_element.empty();


        var show_response_slider = function (display_element, trial, i) {
            var id = 'slider_' + i;
            var start = trial.slider_start ? trial.slider_start : 0;
            var min = trial.slider_min ? trial.slider_min : 0;
            var max = trial.slider_max ? trial.slider_max : 0;
            var width = trial.slider_width ? trial.slider_width : 500;
            var require = trial.slider_require ? trial.slider_require : true;
            var startTime = (new Date()).getTime();

            var $outer_div = $('<div>', {
                id: 'slider_outer',
                css: {
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                }
            });

            // create slider
            var $slider_div = $('<div>', {
                "id": id,
                "class": 'sim unclicked',
                'value': i,
                'css': {'width': width + 'px',
                        'margin-left': 'auto',
                        'margin-right': 'auto',
                       }
            });

            $outer_div.append($slider_div);

            $slider_div.slider({
                value: Math.floor((min + max) / 2),
                min: min,
                max: max,
                step: 1,
            });

            // show tick marks
            if (trial.show_ticks) {
                for (var j = 1; j < trial.intervals - 1; j++) {
                    $('#' + id).append('<div class="slidertickmark"></div>');
                }

                $('#' + id + ' .slidertickmark').each(function(index) {
                    var left = (index + 1) * (100 / (trial.intervals - 1));
                    $(this).css({
                        'position': 'absolute',
                        'left': left + '%',
                        'width': '1px',
                        'height': '100%',
                        'background-color': '#222222'
                    });
                });
            }

            // create labels for slider
            // $slider_div.append($('<br>'));
            var $labels = $('<ul>', {
                "id": "sliderlabels" + i,
                "class": 'sliderlabels',
                "css": {
                    "width": "100%",
                    "height": "3em",
                    "margin": "10px 0px 0px 0px",
                    "padding": "0px",
                    "display": "block",
                    "position": "relative"
                }
            });

            // display_element.append($('<br>'));
            // display_element.append($('<br>'));

            // position labels to match slider intervals
            var slider_width = $slider_div.width();
            var num_items = trial.labels[i].length;
            var item_width = slider_width / num_items;
            var spacing_interval = slider_width / (num_items - 1);

            for (var j = 0; j < trial.labels[i].length; j++) {
                console.log(trial.labels[i][j]);
                console.log("#sliderlabels" + i);
                var $li = $('<li>', {
                    html: trial.labels[i][j],
                    css: {
                        'display': 'inline-block',
                        'width': item_width + 'px',
                        'margin': '0px',
                        'padding': '0px',
                        'text-align': 'center',
                        'position': 'relative',
                        'left': ((spacing_interval - item_width) * j) - (item_width / 2)
                    }
                });
                console.log((spacing_interval * j) - (item_width / 2));
                console.log($li);
                $labels.append($li);
            }

            console.log($labels);
            $outer_div.append($labels);
            display_element.append($outer_div);
            display_element.append($('<br>'));
        }




        var plugin_id_name = "jspsych-slider";
        var plugin_id_selector = '#' + plugin_id_name;
        var _join = function( /*args*/ ) {
            var arr = Array.prototype.slice.call(arguments, _join.length);
            return arr.join(separator = '-');
        };

        // trial defaults
        trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
        trial.required = typeof trial.required == 'undefined' ? null : trial.required;
        trial.names = typeof trial.names == 'undefined' ? false : trial.names;
        trial.expt_phase = trial.expt_phase || '';

        // if any trial variables are functions
        // this evaluates the function and replaces
        // it with the output of the function
        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        // inject CSS for trial
        var node = display_element.append('<style id="jspsych-slider-css">');
        var cssstr = ".jspsych-slider-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
            ".jspsych-slider-text span.required {color: darkred;}"+
            "label.jspsych-slider-text td {margin-right: 1em;}"+
            "td.jspsych-button {text-align: center; border-style: solid; border-width: 1px; border-radius: 20px;}" +
            "td.jspsych-button:hover {background-color: rgb(200, 200, 200); }" +
            "td.jspsych-button.selected {background-color: rgb(150, 150, 225); }";

        $('#jspsych-slider-css').html(cssstr);

        // form element
        var trial_form_id = _join(plugin_id_name, "form");
        display_element.append($('<form>', {
            "id": trial_form_id
        }));
        var $trial_form = $("#" + trial_form_id);

        // show preamble text
        var preamble_id_name = _join(plugin_id_name, 'preamble');
        $trial_form.append($('<div>', {
            "id": preamble_id_name,
            "class": preamble_id_name
        }));
        $('#' + preamble_id_name).html(trial.preamble);

        var $table = $('<table>');
        // add multiple-choice questions
        for (var i = 0; i < trial.questions.length; i++) {

            var $tr = $('<tr>');

            // create question container
            var question_classes = [_join(plugin_id_name, 'question')];

            $trial_form.append($('<div>', {
                "id": _join(plugin_id_name, i),
                "class": question_classes.join(' ')
            }));

            var question_selector = _join(plugin_id_selector, i);

            var ques = trial.questions[i];

            // add question text
            $(question_selector).append(
                '<p class="' + plugin_id_name + '-text slider">' + ques + '</p>'
            );

            show_response_slider($trial_form, trial, i);
            $('#slider_' + i).one('mousedown click', function () {
                $(this).addClass('clicked');
                $(this).removeClass('unclicked');
            });

            if (trial.required && trial.required[i]) {
                // add "question required" asterisk
                $(question_selector + " p").append("<span class='required'>*</span>");

                // add required property
                $(question_selector + " input:radio").prop("required", true);
            }
            $table.append($tr);
        }
        $('body').append($table);

        // add submit button
        $trial_form.append($('<input>', {
            'type': 'submit',
            'id': plugin_id_name + '-next',
            'class': plugin_id_name + ' jspsych-btn',
            'value': 'Submit Answers'
        }));

        $trial_form.submit(function(event) {

            event.preventDefault();

            if (trial.required) {
                $('.warning').remove();
                var unclicked = $('.unclicked');
                if (unclicked.length > 0) {
                    for (var i = 0; i < unclicked.length; i++) {
                        var elem = $(unclicked[i]);
                        var elem_val = elem.attr('value');
                        var warning = $('<p>', {
                            'text': 'Please answer the question below',
                            'class': 'warning',
                            'css': {'color': 'red'}
                        });
                        $('#jspsych-slider-' + elem_val).prepend(warning);

                    }
                    return false;
                }
            }
            // measure response time
            var endTime = (new Date()).getTime();
            var response_time = endTime - startTime;

            // create object to hold responses
            var question_data = {};
            var answered = 0;
            for(var index = 0; index < trial.questions.length; index++) {
                var id = '';
                id = 'slider_' + index;
                var val = $("#" + id).slider("value");

                if (trial.names) {
                    qid = trial.names[index];
                } else {
                    qid = 'Q' + index;
                }

                var obje = {};
                obje[qid] = val;
                $.extend(question_data, obje);

                if (typeof val != "undefined" ) {
                    answered++;
                }

            }

            if (answered >= trial.questions.length) {
                // save data
                var trial_data = {
                    "rt": response_time,
                    "expt_phase": trial.expt_phase,
                    "target": trial.target,
                };

                $.extend(trial_data, question_data);

                display_element.html('');

                // next trial
                jsPsych.finishTrial(trial_data);
            } else {

            }
        });

        var startTime = (new Date()).getTime();
    };

    return plugin;
})();


