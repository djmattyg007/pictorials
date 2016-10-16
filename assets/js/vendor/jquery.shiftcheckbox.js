/* ShiftCheckbox jQuery plugin
 *
 * Copyright (C) 2011-2012 James Nylen, 2016 Matthew Gamble
 *
 * Released under MIT license
 * A copy of this license may be found at the following URL:
 * https://github.com/nylen/shiftcheckbox/blob/gh-pages/LICENSE.txt
 * For details see:
 * https://github.com/nylen/shiftcheckbox
 * Modifications made by Matthew Gamble to remove boilerplate and
 * increase flexibility.
 *
 * Requires jQuery v1.7 or higher.
 */

(function($) {
  var ns = '.shiftcheckbox';

  $.fn.scb_changeChecked = function(opts, checked) {
    this.prop('checked', checked);
    opts.onChange(this, checked);
    return this;
  };

  $.fn.shiftcheckbox = function(opts) {
    opts = $.extend({
      checkboxSelector : null,
      onChange         : jQuery.noop,
      ignoreClick      : null
    }, opts);

    var $checkboxes,
        $containersAll,
        $checkboxesAll;

    if (opts.checkboxSelector) {
      // checkboxSelector means that the elements we need to attach handlers to
      // ($containers) are not actually checkboxes but contain them instead

      $containersAll = this.filter(function() {
        return !!$(this).find(opts.checkboxSelector).length;
      }).each(function() {
        $(this).data('childCheckbox', $(this).find(opts.checkboxSelector)[0]);
      });

      $checkboxesAll = $containersAll.map(function() {
        return $(this).data('childCheckbox');
      });
    } else {
      $checkboxesAll = this.filter(':checkbox');
    }

    $checkboxes = $checkboxesAll;

    if (!$checkboxes.length) {
      return;
    }

    var lastIndex = -1;

    var checkboxClicked = function(e) {
      var checked = !!$(this).prop('checked');

      var curIndex = $checkboxes.index(this);

      if (e.shiftKey && lastIndex != -1) {
        var di = (curIndex > lastIndex ? 1 : -1);
        for (var i = lastIndex; i != curIndex; i += di) {
          $checkboxes.eq(i).scb_changeChecked(opts, checked);
        }
      }
      lastIndex = curIndex;
      $(document).trigger("shiftcheckbox:checkbox_clicked", { "clickedIndex": lastIndex });
    };

    if (opts.checkboxSelector) {
      $containersAll.on('click' + ns, function(e) {
        if ($(e.target).closest(opts.ignoreClick).length) {
          return;
        }
        var $checkbox = $($(this).data('childCheckbox'));
        $checkbox.not(e.target).each(function() {
          var checked = !$checkbox.prop('checked');
          $(this).scb_changeChecked(opts, checked);
        });

        $checkbox[0].focus();
        checkboxClicked.call($checkbox, e);

        // If the user clicked on a label inside the row that points to the
        // current row's checkbox, cancel the event.
        var $label = $(e.target).closest('label');
        var labelFor = $label.attr('for');
        if (labelFor && labelFor == $checkbox.attr('id')) {
          if ($label.find($checkbox).length) {
            // Special case:  The label contains the checkbox.
            if ($checkbox[0] != e.target) {
              return false;
            }
          } else {
            return false;
          }
        }
      }).on('mousedown' + ns, function(e) {
        if (e.shiftKey) {
          // Prevent selecting text by Shift+click
          return false;
        }
      });
    } else {
      $checkboxes.on('click' + ns, checkboxClicked);
    }

    return this;
  };
})(jQuery);
