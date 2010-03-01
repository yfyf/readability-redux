
var settings = {

    init: function()
    {
        $('select').change(_.bind(function() { this.preview(); this.mark_dirty(); }, this)); 
        $('input').change(_.bind(this.mark_dirty, this)); 

        $('#cancel').click(_.bind(this.load, this));
        $('#save').click(_.bind(this.save, this));

        this.load();
    },

    get_select: function(name)
    {
        return $('#' + name).val();
    },

    set_select: function(name, value)
    {
        if($('#' + name + ' option[value=' + value + ']')
           .attr('selected', 'selected')
           .val() === undefined)
           $('#' + name + ' option:first-child').attr('selected', 'selected');
    },

    mark_dirty: function()
    {
        $('#save').attr('disabled', '');
    },

    mark_clean: function()
    {
        $('#save').attr('disabled', 'disabled');
    },

    save: function()
    {
        var settings = {
            style: this.get_select('r_style'),
            size: this.get_select('r_size'),
            margin: this.get_select('r_margin')
        };
        
        chrome.extension.getBackgroundPage().set_settings(settings);
        this.mark_clean();
    },

    load: function()
    {
        var settings = chrome.extension.getBackgroundPage().get_settings();

        this.set_select('r_style', settings['style']);
        this.set_select('r_size', settings['size']);
        this.set_select('r_margin', settings['margin']);

        this.preview();
        this.mark_clean();
    },

    /* This is a bit wicked, but doing plain simple 
     * location = 'javascript:...' resulted in blank iframe.
     * So, instead, child iframe sets the attribute below and calls preview() 
     */
    hello_from_child: function(preview_window)
    {
        this.preview_window = preview_window;

        this.preview();
    },

    preview_window: null,

    preview: function()
    {
        var settings = {
            style: this.get_select('r_style'),
            size: this.get_select('r_size'),
            margin: this.get_select('r_margin')
        };

        var js = chrome.extension.getBackgroundPage().create_javascript(settings);

        if(this.preview_window !== null)
        {
            //console.log($('#example iframe').get(0).contentWindow.location = js);
            //console.log($('#example iframe').get(0).contentWindow['preview']);
            this.preview_window.inject(js);
            //$('#example iframe').get(0).contentWindow.preview(settings);
        }
        else console.log('Its null');
    }
};


var keybox = {
    pressed: 0,
    keys: [],

    init: function()
    {
        this.node = document.getElementById('keybox');
        this.node.addEventListener('keydown', function(e) { keybox.keydown(e); }, false);
        this.node.addEventListener('keyup', function(e) { keybox.keyup(e); }, false);
        this.node.addEventListener('focus', function(e) { keybox.focus(e); }, false);
        this.node.addEventListener('blur', function(e) { keybox.blur(e); }, false);
    },

    keydown: function(e)
    {
        if(!((e.which >= 65 && e.which <= 90) || e.which == 16 || e.which == 17 || e.which == 18))
            return false;

        if(this.pressed == 0)
            this.keys = [];

        if(contains(this.keys, e.which)) // Crippled situation
        {
            this.keys = [];
            this.pressed = 0;
        }

        this.keys.push(e.which);
        this.pressed++;

        this.update();
    },

    keyup: function(e)
    {
        if(!((e.which >= 65 && e.which <= 90) || e.which == 16 || e.which == 17 || e.which == 18))
            return false;

        this.pressed--;

        this.update();
    },

    update: function()
    {
        var value = [];
        this.keys.sort();

        for(var i = 0; i < this.keys.length; i++)
        {
            var key = this.keys[i];
            if(key >= 65 && key <= 90)
                value.push(String.fromCharCode(key));

            if(key == 16)
                value.push("Shift");

            if(key == 17)
                value.push("Ctrl");

            if(key == 18)
                value.push("Alt");
        }

        this.node.value = value.join(' + '); 
    },

    focus: function()
    {

    },

    blur: function()
    {
    }
};

$(document).ready(function()
{
   $('#example iframe').ready(function()
   {
        settings.init();
        //keybox.init();
   });
});

