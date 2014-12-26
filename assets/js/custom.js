// --------------------------
// Functions

function genUI(soundFiles, states){
    // Setup the system

    // Generates divs and controls
    var container = $("#container");
    soundFiles.forEach(function(fileName, idx){
        var name = fileName.split(".")[0];
        var section = $("<div>",
                        {class: "soundSection"});
        var volControl = $("<div>",
                           {class: "volControl"});
        var soundButton = $("<div>",
                            {class: "soundButton disabled",
                             text: name});
        var slider = $("<input>");
        container.append(section);
        section.append(volControl);
        section.append(soundButton);
        volControl.append(slider);
        var sliderInit = new Powerange(slider[0],
                                       {vertical: true,
                                        hideRange: true,
                                        min: 0,
                                        max: 100,
                                        start: 100 * states[idx].volume});
    });
    
    // Loading saved theme (default dark)
    chrome.storage.sync.get({"theme": "dark"}, function(data){
        if(data.theme == "light"){
            $("body").addClass("light");
        }
    });
}

function togglePlay(audioElement, buttonElem){
    // Toggles playback of audio
    
    if(audioElement.paused){
        audioElement.currentTime = 0;
        audioElement.play();
    }
    else{
        audioElement.pause();
    }

    buttonElem.toggleClass("disabled");
}

function saveTheme(){
    // Saves current theme to chrome storage
    if($("body").hasClass("light")){
        chrome.storage.sync.set({"theme": "light"});
    }
    else{
        chrome.storage.sync.set({"theme": "dark"});
    }
}

function saveStates(elements){
    // Saves the current settings
    var states = [];
    elements.forEach(function(audioElement){
        states.push({"state": audioElement.paused,
                     "volume": audioElement.volume});
    });

    chrome.storage.sync.set({"states": states}, function(){
        notifySave();
    });
}

function notifySave(){
    // Notifies when save is complete
    $("#saveButton").toggleClass("notify");

    setTimeout(function(){
        $("#saveButton").toggleClass("notify");        
        setTimeout(function(){
            $("#saveButton").toggleClass("notify");            
            setTimeout(function(){
                $("#saveButton").toggleClass("notify");                
            }, 300)
        }, 300)
    }, 300);
}


function updateScrollPos(e, clickY){
    $("html").css("cursor", "pointer");
    $("body").scrollTop($("body").scrollTop() + (clickY - e.pageY));
}

// On document ready
$(function(){
    // Initialize sounds data
    var root = soundsData.root;
    var soundFiles = soundsData.files;
    var audioElements = [];
    var initialVolume = 0.8;
    var initStates = [];

    // Generating audio elements
    soundFiles.forEach(function(fileName){
        var audio = new Audio(root + fileName);
        audio.loop = true;
        audio.volume = initialVolume;
        audioElements.push(audio);
        initStates.push({"state": true, "volume": initialVolume});
    });

    // Initialize List
    chrome.storage.sync.get({"states": initStates}, function(data){
        genUI(soundFiles, data.states);

        // Setup volumes
        audioElements.forEach(function(item, idx){
            item.volume = data.states[idx].volume;
            if(!data.states[idx].state){
                togglePlay(audioElements[idx], $(".soundButton").eq(idx));
            }
        });

        // On click tasks
        $(".soundButton").click(function(){
            var audioId = $(".soundButton").index($(this));
            togglePlay(audioElements[audioId], $(this));
        });
        
        // Volume control
        $(".volControl input").change(function(){
            var audioId = $(".volControl").index($(this).parent());
            audioElements[audioId].volume = $(this)[0].value / 100;
        });

        // Light switch
        $("#lightSwitch").click(function(){
            $("body").toggleClass("light");
            saveTheme(); // Save to chrome storage
        });

        // Save switch
        $("#saveButton").click(function(){
            saveStates(audioElements);
        });

        // Mute switch
        $("#muteSwitch").click(function(){
            audioElements.forEach(function(item){
                item.muted = !item.muted;
            });
            $(this).toggleClass("muted");
        });

        // Disable right click
        $(document).bind('contextmenu', function(e){
            e.preventDefault();
        });

        // Drag Scroll
        var clicked = false, clickY;
        $("body").on({
            "mousemove": function(e){
                clicked && updateScrollPos(e, clickY);
            },
            "mousedown": function(e){
                clicked = true;
                clickY = e.pageY;
            },
            "mouseup": function(){
                clicked = false;
                $("html").css("cursor", "auto");
            }
        });

        // Disable scroll on volume control
        $("body .volControl").on("mousedown", function(e){
            e.stopPropagation();
        });
    });
});
