/**
 * Galleria Classicmod Theme
 * Copyright (c) 2013 Jan-Philip Gehrcke, http://gehrcke.de
 * Copyright (c) 2017 Matthew Gamble, https://pictorials-demo.matthewgamble.net
 *
 * Bases on Galleria Classic Theme, Copyright (c) 2012 Aino, http://aino.se
 * Modified as necessary by Matthew Gamble to support Galleria 1.5, as well
 * as some additional customisations for Pictorials.
 *
 * Licensed under the MIT license
 * https://raw.github.com/aino/galleria/master/LICENSE
 *
 */

(function($, Galleria) {

/*global jQuery, Galleria */

Galleria.prototype.classicplay = function () {
    // I've observed this to be required in certain situations (recheck)
    this.setPlaytime(this._options.slideshowInterval);
    this.playToggle();
};

Galleria.prototype.classicfullscreen = function () {
    this.toggleFullscreen(function() {
        // Trigger carousel animation according to currently active
        // image index. In case of fullscreen activation, this way the
        // carousel makes use of the increased space.
        this._carousel.set(this.getIndex());
    }.bind(this));
};

Galleria.addTheme({
    name: 'classicmod',
    version: 1.5,
    author: 'Jan-Philip Gehrcke, Galleria',
    css: 'galleria.classicmod.css',
    defaults: {
        transition: 'fade',
        thumbCrop: 'height',
        imageCrop: false,
        // set this to false if you want to show the caption all the time:
        _toggleInfo: true,
        slideshowInterval: 1000 // JPG edit
    },
    init: function(options) {
        var gallery = this; // JPG edit

        gallery.addElement('info-link','info-close');
        gallery.append({
            'info' : ['info-link','info-close']
        });

        // Main modifications for classicmod theme by Jan-Philip Gehrcke.
        gallery.addElement(
            "navbar",
            "navbarhelper",
            "playbutton",
            "mapbutton",
            "fullscreenbutton"
            );
        gallery.append({
            container: "navbar",
            navbar: "navbarhelper",
            navbarhelper: [
                "playbutton",
                "mapbutton",
                "thumbnails-container",
                "fullscreenbutton"]
            });
        gallery.prependChild(
            "stage",
            "info").appendChild(
                "container",
                "tooltip"
                );

        gallery.$("fullscreenbutton").click(function(e) {
            e.preventDefault();
            gallery.classicfullscreen();
        });

        gallery.$("playbutton").click(function(e) {
            e.preventDefault();
            gallery.classicplay();
        });

        gallery.bind("play", function () {
            this.$("playbutton").addClass("pause");
            });

        gallery.bind("pause", function () {
            this.$("playbutton").removeClass("pause");
            });

        gallery.bindTooltip({
            fullscreenbutton: function() {
                if (gallery.isFullscreen()) {
                    return "Exit fullscreen";
                    }
                return "Enter fullscreen";
                },
            playbutton: function() {
                if (gallery.isPlaying()) {
                    return "Pause slideshow";
                    }
                return "Start slideshow";
                }
            });


        // The rest is mainly unchanged and taken from the classic theme.


        // cache some stuff
        var info = this.$('info-link,info-close,info-text'),
            touch = Galleria.TOUCH;

        // show loader & counter with opacity
        this.$('loader,counter').show().css('opacity', 0.4);

        // some stuff for non-touch browsers
        if (! touch ) {
            this.addIdleState( this.get('image-nav-left'), { left:-50 });
            this.addIdleState( this.get('image-nav-right'), { right:-50 });
            this.addIdleState( this.get('counter'), { opacity:0 });
        }

        // toggle info
        if ( options._toggleInfo === true ) {
            info.bind( 'click:fast', function() {
                info.toggle();
            });
        } else {
            info.show();
            this.$('info-link, info-close').hide();
        }

        // bind some stuff
        this.bind('thumbnail', function(e) {

            if (! touch ) {
                // fade thumbnails
                $(e.thumbTarget).css('opacity', 0.6).parent().hover(function() {
                    $(this).not('.active').children().stop().fadeTo(100, 1);
                }, function() {
                    $(this).not('.active').children().stop().fadeTo(400, 0.6);
                });

                if ( e.index === this.getIndex() ) {
                    $(e.thumbTarget).css('opacity',1);
                }
            } else {
                $(e.thumbTarget).css('opacity', this.getIndex() ? 1 : 0.6).bind('click:fast', function() {
                    $(this).css( 'opacity', 1 ).parent().siblings().children().css('opacity', 0.6);
                });
            }
        });

        var activate = function(e) {
            $(e.thumbTarget).css('opacity',1).parent().siblings().children().css('opacity', 0.6);
        };

        this.bind('loadstart', function(e) {
            if (!e.cached) {
                this.$('loader').show().fadeTo(200, 0.4);
            }
            window.setTimeout(function() {
                activate(e);
            }, touch ? 300 : 0);
            this.$('info').toggle( this.hasInfo() );
        });

        this.bind('loadfinish', function(e) {
            this.$('loader').fadeOut(200);
        });

        $(document).trigger("galleria:theme_init_classicmod", {gallery: gallery});
    }
});

}(jQuery, Galleria));
