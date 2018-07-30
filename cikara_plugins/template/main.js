var study = "movieChoice1";
var subjID = getSubjID(8);
var testing = $.url().param('testing');
if (testing == 1) {
    testing = true;
} else {
    testing = false;
}

var prac_opts = {"includeLikert" : true}; 
var practice_timeline = practiceGen('x');

var stims = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
stims.shuffle();
stims = stims.splice(0,32);

var peers = ['Alex', 'Alice', 'Allen', 'Andrew', 'Beth', 'Chris', 'Derek', 'Greg', 'James', 'Jane', 'Jerry', 'John', 'Kelly', 'Kim', 'Kyle', 'Mary', 'Mike', 'Nick', 'Pat', 'Rose', 'Sarah', 'Tom'];

var preload = [];
for(var i = 0; i < stims.length; i++) {
    var labels = ['a', 'b'];
    for(var j = 0; j < labels.length ; j++) {
	preload.push('img/movies/' + stims[i] + labels[j] + '.jpg');
    }
}
for(var i = 0; i < peers.length; i++) {
    preload.push('img/agents/' + peers[i] + '.jpg');
}
jsPsych.pluginAPI.preloadImages(preload, function(){console.log("preloaded")});

var timeline = [];

var welcome_block = {
    type: "text",
    text: "<div class='center-content'><br><br><br><br>Welcome to the experiment. Press any key to begin.",
};

var id_question = ["Worker ID:"];
var id_block = {
    type: 'survey-text',
    questions: [id_question],
    preamble: [" <div>REMINDER: YOU NEED A KEYBOARD FOR THIS TASK. YOU WILL NOT BE ABLE TO COMPLETE THIS TASK WITH A PHONE OR TABLET!</div> <br><hr><br> <div align=center>Please enter your Amazon Mechanical Turk Worker ID below.<br><br>If you do not enter it accurately, we will not be able to pay you.</div> "],
};


var demo_block = {
    type: 'survey-text',
    questions: ["Age: ", "Ethnicity: ", "Gender: "],
    preamble: [" <div>\
<h4>Movie Choices </h4>\
<p> In this task, you will be asked to choose which of two movies you would prefer to watch and to guess about the preferences of several other participants for the same movies. </p>\
<p> Periodically, you will be given a choice between two 'mystery' boxes which will be further explained in the example. </p>\
<p> In total, you will make choices for 35 sets of movies. The task should take less than 15 minutes. </p>\
<p> Please enter some additional information and click \"Submit Answers\" to continue onto an example. </p>\
<p style='font-size:small'> <strong>Do not</strong> refresh your browser when doing this task. If you do, you will have to repeat all of the trials you have already submitted. </p>\
\
<p> <strong>Technical requirements:</strong> </p>\
<p style='font-size:small'> Please allow permission for Javascript to run on this site and disable any script blockers that are running. </p>\
</div>"],
};

timeline.push(welcome_block);
timeline.push(id_block);
timeline.push(demo_block);

timeline.push.apply(timeline,practice_timeline);
if (testing) {
    timeline = exptGen(stims, 4, peers, 3, {
	includeLikert: true,
	testing: testing
    });
} else {
    timeline.push.apply(timeline, exptGen(stims, 4, peers, 3, {
	includeLikert: true,
	testing: testing
    }));
}

//timeline = exptGen(stims, 4, peers, 3, {peerAgreement: [25, {ref: 'A', func: inverseVotes}, {func: addVotes, ref: 'A', percent: 75}]});

jsPsych.init({
    timeline: timeline,
    show_progress_bar: true,
    on_finish: function() {
	var data = jsPsych.data.getDataAsCSV();
	$('#jspsych-content').empty()
	    .css('visibility', 'visible')
	    .text(data);
	$.post("/scripts/latest/save.php", {subjid : subjID, studyName: study, folder: "sam", name : '_' + "sam", toWrite : data});
    }
});

jsPsych.data.addProperties({
    subjID: subjID,
    study: study
});
