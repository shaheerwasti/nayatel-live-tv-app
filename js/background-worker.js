var currentNumber = 4;
$(document).ready(function(){

    var categoryUrl = 'http://live.nayatel.com/api/get_category_index/';
    var baseFeedUrl = 'http://live.nayatel.com/api?json=get_recent_posts&count=-1/';
    var baseUrl = 'http://live.nayatel.com/api?json=get_recent_posts&count=-1/';
    var videos = [];
    var retrievedCategories = [];
    var retrievedChannels = [];
    var filteredChannels = [];
    function channel(id, slug, title, category, image, url, file) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.category = category;
        this.image = image;
        this.url = url;
        this.file = file;
        this.number = slug.split("-")[1];
    }

    var changeChannel = function(handler){

        switch(handler){
            case "next":
                currentNumber = parseInt(currentNumber) + 1;
                var newChannel = $.grep(retrievedChannels, function(element, index){
                    return (element.number == (currentNumber));
                });
                jwplayer("player").setup({
                    image: newChannel[0].image,
                    file: newChannel[0].file,
                    title: newChannel[0].title,
                    autostart: true,
    width: '100%',
    height: '100%'
                });
                $(".channel-info").text(currentNumber + ": " + jwplayer().getPlaylistItem().title);
                break;
            case "previous":
                currentNumber = parseInt(currentNumber) - 1;
                var newChannel = $.grep(retrievedChannels, function(element, index){
                    return (element.number == (currentNumber));
                });
                jwplayer("player").setup({
                    image: newChannel[0].image,
                    file: newChannel[0].file,
                    title: newChannel[0].title,
                    autostart: true,
                        width: '100%',
    height: '100%'
                });
                $(".channel-info").text(currentNumber + ": " + jwplayer().getPlaylistItem().title);
                break;
        }
    }



    var getCategories = function() {
        var getCategoriesDfd = $.Deferred();
        $.ajax({
            type: "GET",
            url: categoryUrl,
            success: function (result) {
                if (result.status == "ok") {
                    var categories = result.categories;
                    for (var i = 0; i < result.categories.length; i++) {
                        retrievedCategories.push(categories[i].title);
                    }
                    getCategoriesDfd.resolve();
                }
                else{
                    getCategoriesDfd.reject();
                }
            },
            error: function(result){
                getCategoriesDfd.reject();
            }
        });
        return getCategoriesDfd.promise();
    };

    getCategories()
        .done(function(){
            for (var i = 0; i < retrievedCategories.length; i++) {
                $("#cat-list").append("<li>" + retrievedCategories[i] + "</li>")
            }
            $("#cat-list").append("<li>All</li>");

            //$("#cat-list li:first-child").trigger("click");
        })
        .fail(function(){
            console.log("Something Wrong. Couldn't retrieve Categories..");
        });


    var getChannels = function() {
        var getChannelsDfd = $.Deferred();
        $.ajax({
            type: "GET",
            url: baseFeedUrl,
            success: function (result) {
                //console.log(result);
                if (result.status == "ok") {
                    var channels = result.posts;
                    console.log(channels.length);
                    for (var i = 0; i < channels.length; i++) {
                        var categoriesForThis = [];
                        for (var j = 0; j < channels[i].categories.length; j++){
                            categoriesForThis.push(channels[i].categories[j].title);
                        }
                        retrievedChannels.push(
                            new channel(
                                channels[i].id,
                                channels[i].slug,
                                channels[i].title,
                                categoriesForThis,//category title
                                channels[i].custom_fields.dp_video_poster[0], //image
                                channels[i].url,
                                channels[i].custom_fields.channel_url[0]
                            ));
                    }
                    
                    getChannelsDfd.resolve();
                }
                else{
                    getChannelsDfd.reject();
                }
            },
            error: function(result){
                getChannelsDfd.reject();
            }
        });
        return getChannelsDfd.promise();
    };

    getChannels()
        .done(function(){
            /*for (var i = 0; i < retrievedChannels.length; i++) {
             $("#cat-list").append("<li>" + retrievedChannels[i] + "</li>")
             }*/
            $("footer").fadeIn(400);
        })
        .fail(function(){
            console.log("Something Wrong. Couldn't retrieve Categories..");
        });

    var filterChannels = function(channel){
        var filterChannelsDfd = $.Deferred();
        filteredChannels = [];
       
        if (channel == "All"){
            for (var i = 0; i<retrievedChannels.length; i++){
                //console.log(retrievedChannels.length);
                filteredChannels.push(retrievedChannels[i]);
            }
            filterChannelsDfd.resolve();
            return filterChannelsDfd.promise();
        }
        for (var i = 0; i<retrievedChannels.length; i++){
            var categoryString = retrievedChannels[i].category.join();
            if (categoryString.indexOf(channel) !== -1){
                filteredChannels.push(retrievedChannels[i]);
            }
            filterChannelsDfd.resolve();
        }
        return filterChannelsDfd.promise();
    };

    $("body").on("click", "#cat-select", function(){
        $("#channels").fadeToggle();
    });

    $("body").on("click", "#cat-list li", function(){
        /*$('#channel-list').data('owl.carousel').destroy();
         $('#channel-list').owlCarousel();*/
        var channelLength = $("#channel-list .owl-item").length;
        for (var i = 0; i< channelLength; i++) {
            $("#channel-list").trigger('remove.owl.carousel', [i]).trigger('refresh.owl.carousel');
        }

        $("#cat-list li").removeClass("active");
        $(this).addClass("active");
        filterChannels($(this).text()).done(function(){
            $("#channel-list .channel").each(function(){
                $(this).remove();
            })
            for (var i = 0; i < filteredChannels.length; i++) {
                console.log(filteredChannels.length);
                $("#channel-list").append();
                var markup = "<a href='#' title='" + filteredChannels[(filteredChannels.length-1)-i].title + "' channel-num='" + filteredChannels[(filteredChannels.length-1)-i].number + "' channel-img='" + filteredChannels[(filteredChannels.length-1)-i].image + "' channel-file='" + filteredChannels[(filteredChannels.length-1)-i].file + "' channel-url='" + filteredChannels[(filteredChannels.length-1)-i].url + "' channel-id='" + filteredChannels[(filteredChannels.length-1)-i].id + "'>" +
                    "<div class='channel-img' style='background-image:url(" + filteredChannels[(filteredChannels.length-1)-i].image + ");'></div>" +
                    "<p>" + filteredChannels[(filteredChannels.length-1)-i].title + "</p>" +
                    "</a>";
                $('#channel-list').owlCarousel('add', markup).owlCarousel('refresh')
            }

        });
        $("#channels").fadeIn(300);
    });

    $("body").on("click", "#channel-list .owl-item", function(){

        currentNumber = $(this).find("a").attr("channel-num");
        var image = $(this).find("a").attr("channel-img");
        var file = $(this).find("a").attr("channel-file");
        var title = $(this).find("p").text();
        jwplayer("player").setup({
            image: image,
            file: file,
            title: title,
            autostart: true,
    width: '100%',
    height: '100%'
        });
        $(".channel-info").text(currentNumber + ": " + jwplayer().getPlaylistItem().title);
        $("#channels").fadeOut(300);
    })

    $("body").on("click", "#channels .close, header, section", function(){
        $("#channels").fadeOut(400);
        $("#cat-list li").removeClass("active");
    })

    $('#channel-list').owlCarousel({
            margin: 20,
            items: 4,
            nav: true,
            navText : ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
            slideBy: 4,
            responsiveClass:true,
            responsive:{
                0:{
                    items:2,
                    nav:true
                },
                600:{
                    items:3,
                    nav:false
                },
                900:{
                    items:4,
                    nav:true
                },
                1000:{
                    items:5,
                    nav:true,
                    loop:false
                }
            }
        }
    );

    $("body").on("click", "#controls i" ,function(){
        if ($(this).hasClass("play-pause-btn")){
            jwplayer().play();
            if ($(this).hasClass("fa-pause")){
                $(this).removeClass("fa-pause");
                $(this).addClass("fa-play");
            }
            else{
                $(this).removeClass("fa-play");
                $(this).addClass("fa-pause");
            }
        }
        else{
            if ($(this).hasClass("fa-step-backward")) {
                changeChannel("previous");
            }
            else if ($(this).hasClass("fa-step-forward")) {
                changeChannel("next");
            }
        }
    })




});