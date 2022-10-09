/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.validate.js. */
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($, Drupal, drupalSettings) {
  'use strict';

  if (typeof drupalSettings.cvJqueryValidateOptions === 'undefined') {
    drupalSettings.cvJqueryValidateOptions = {};
  }

  if (drupalSettings.clientside_validation_jquery.force_validate_on_blur) {
    drupalSettings.cvJqueryValidateOptions.onfocusout = function (element) {
      // "eager" validation
      this.element(element);
    };
  }

  // Add messages with translations from backend.
  $.extend($.validator.messages, drupalSettings.clientside_validation_jquery.messages);

  // Allow all modules to update the validate options.
  // Example of how to do this is shown below.
  $(document).trigger('cv-jquery-validate-options-update', drupalSettings.cvJqueryValidateOptions);

  /**
   * Attaches jQuery validate behavior to forms.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *  Attaches the outline behavior to the right context.
   */
  Drupal.behaviors.cvJqueryValidate = {
    attach: function (context) {
      if (typeof Drupal.Ajax !== 'undefined') {
        // Update Drupal.Ajax.prototype.beforeSend only once.
        if (typeof Drupal.Ajax.prototype.beforeSubmitCVOriginal === 'undefined') {
          var validateAll = 2;
          try {
            validateAll = drupalSettings.clientside_validation_jquery.validate_all_ajax_forms;
          }
          catch(e) {
            // Do nothing if we do not have settings or value in settings.
          }

          Drupal.Ajax.prototype.beforeSubmitCVOriginal = Drupal.Ajax.prototype.beforeSubmit;
          Drupal.Ajax.prototype.beforeSubmit = function (form_values, element_settings, options) {
            if (typeof this.$form !== 'undefined' && (validateAll === 1 || $(this.element).hasClass('cv-validate-before-ajax'))) {
              $(this.$form).removeClass('ajax-submit-prevented');

              $(this.$form).validate();
              if (!($(this.$form).valid())) {
                this.ajaxing = false;
                $(this.$form).addClass('ajax-submit-prevented');
                return false;
              }
            }

            return this.beforeSubmitCVOriginal.apply(this, arguments);
          };
        }
      }

      $(context).find('form').once('cvJqueryValidate').each(function() {
        $(this).validate(drupalSettings.cvJqueryValidateOptions);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.validate.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.ckeditor.js. */
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($, Drupal, debounce, CKEDITOR) {
  /**
   * Attaches jQuery validate behavoir to forms.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *  Attaches the outline behavior to the right context.
   */
  Drupal.behaviors.cvJqueryValidateCKEditor = {
    attach: function (context) {
      if (typeof CKEDITOR === 'undefined') {
        return;
      }
      var ignore = ':hidden';
      var not = [];
      for (var instance in CKEDITOR.instances) {
        if (CKEDITOR.instances.hasOwnProperty(instance)) {
          not.push('#' + instance);
        }
      }
      ignore += not.length ? ':not(' + not.join(', ') + ')' : '';
      $('form').each(function () {
        var validator = $(this).data('validator');
        if (!validator) {
          return;
        }
        validator.settings.ignore = ignore;
        validator.settings.errorPlacement = function(place, $element) {
          var id = $element.attr('id');
          var afterElement = $element[0];
          if (CKEDITOR.instances.hasOwnProperty(id)) {
            afterElement = CKEDITOR.instances[id].container.$;
          }
          place.insertAfter(afterElement);
        };
      });
      var updateText = function (instance) {
        return debounce(function (e) {
          instance.updateElement();
          var event = $.extend(true, {}, e.data.$);
          delete event.target;
          delete event.explicitOriginalTarget;
          delete event.originalTarget;
          delete event.currentTarget;
          $(instance.element.$).trigger(new $.Event(e.name, event));
        }, 250);
      };
      CKEDITOR.on('instanceReady', function () {
        for (var instance in CKEDITOR.instances) {
          if (CKEDITOR.instances.hasOwnProperty(instance)) {
            CKEDITOR.instances[instance].document.on("keyup", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("paste", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("keypress", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("blur", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("change", updateText(CKEDITOR.instances[instance]));
          }
        }
      });
    }
  };
})(jQuery, Drupal, Drupal.debounce, (typeof CKEDITOR === 'undefined') ? undefined : CKEDITOR);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.ckeditor.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.ife.js. */
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($) {
  // Override clientside validation jquery validation options.
  // We do this to display the error markup same as in inline_form_errors.
  $(document).once('cvjquery').on('cv-jquery-validate-options-update', function (event, options) {
    options.errorElement = 'strong';
    options.showErrors = function(errorMap, errorList) {
      // First remove all errors.
      for (var i in errorList) {
        $(errorList[i].element).parent().find('.form-item--error-message').remove();
      }

      // Show errors using defaultShowErrors().
      this.defaultShowErrors();

      // Wrap all errors with div.form-item--error-message.
      $(this.currentForm).find('strong.error').each(function () {
        if (!$(this).parent().hasClass('form-item--error-message')) {
          $(this).wrap('<div class="form-item--error-message"/>');
        }
      });
    };
  });
})(jQuery);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/clientside_validation/clientside_validation_jquery/js/cv.jquery.ife.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/facets/js/base-widget.js. */
/**
 * @file
 * Provides base widget behaviours.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Handles "facets_filter" event and triggers "facets_filtering".
   *
   * The facets module will listend and trigger defined events on elements with
   * class: "js-facets-widget".
   *
   * Events are doing following:
   * "facets_filter" - widget should trigger this event. The facets module will
   *   handle it accordingly in case of AJAX and Non-AJAX views.
   * "facets_filtering" - The facets module will trigger this event before
   *   filter is executed.
   *
   * This is an example how to trigger "facets_filter" event for your widget:
   *   $('.my-custom-widget.js-facets-widget')
   *     .once('my-custom-widget-on-change')
   *     .on('change', function () {
   *       // In this example $(this).val() will provide needed URL.
   *       $(this).trigger('facets_filter', [ $(this).val() ]);
   *     });
   *
   * The facets module will trigger "facets_filtering" before filter is
   * executed. Widgets can listen on "facets_filtering" event and react before
   * filter is executed. Most common use case is to disable widget. When you
   * disable widget, a user will not be able to trigger new "facets_filter"
   * event before initial filter request is finished.
   *
   * This is an example how to handle "facets_filtering":
   *   $('.my-custom-widget.js-facets-widget')
   *     .once('my-custom-widget-on-facets-filtering')
   *     .on('facets_filtering.my_widget_module', function () {
   *       // Let's say, that widget can be simply disabled (fe. select).
   *       $(this).prop('disabled', true);
   *     });
   *
   * You should namespace events for your module widgets. With namespaced events
   * you have better control on your handlers and if it's needed, you can easier
   * register/deregister them.
   */
  Drupal.behaviors.facetsFilter = {
    attach: function (context) {
      $('.js-facets-widget', context)
        .once('js-facet-filter')
        .on('facets_filter.facets', function (event, url) {
          $('.js-facets-widget').trigger('facets_filtering');

          window.location = url;
        });
    }
  };

})(jQuery, Drupal);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/facets/js/base-widget.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/facets/js/facets-views-ajax.js. */
/**
 * @file
 * Facets views AJAX handling.
 */


(function ($, Drupal) {
  'use strict';

  /**
   * Keep the original beforeSend method to use it later.
   */
  var beforeSend = Drupal.Ajax.prototype.beforeSend;

  /**
   * Trigger views AJAX refresh on click.
   */
  Drupal.behaviors.facetsViewsAjax = {
    attach: function (context, settings) {

      // Loop through all facets.
      $.each(settings.facets_views_ajax, function (facetId, facetSettings) {
        // Get the View for the current facet.
        var view, current_dom_id, view_path;
        if (settings.views && settings.views.ajaxViews) {
          $.each(settings.views.ajaxViews, function (domId, viewSettings) {
            // Check if we have facet for this view.
            if (facetSettings.view_id == viewSettings.view_name && facetSettings.current_display_id == viewSettings.view_display_id) {
              view = $('.js-view-dom-id-' + viewSettings.view_dom_id);
              current_dom_id = viewSettings.view_dom_id;
              view_path = facetSettings.ajax_path;
            }
          });
        }

        if (!view || view.length != 1) {
          return;
        }

        // Update view on summary block click.
        if (updateFacetsSummaryBlock() && (facetId === 'facets_summary_ajax')) {
          $('[data-drupal-facets-summary-id=' + facetSettings.facets_summary_id + ']').children('ul').children('li').once().click(function (e) {
            e.preventDefault();
            var facetLink = $(this).find('a');
            updateFacetsView(facetLink.attr('href'), current_dom_id, view_path);
          });
        }
        // Update view on facet item click.
        else {
          $('[data-drupal-facet-id=' + facetId + ']').each(function (index, facet_item) {
            if ($(facet_item).hasClass('js-facets-widget')) {
              $(facet_item).unbind('facets_filter.facets');
              $(facet_item).on('facets_filter.facets', function (event, url) {
                $('.js-facets-widget').trigger('facets_filtering');

                updateFacetsView(url, current_dom_id, view_path);
              });
            }
          });

        }
      });
    }
  };

  // Helper function to update views output & Ajax facets.
  var updateFacetsView = function (href, current_dom_id, view_path) {
    // Refresh view.
    var views_parameters = Drupal.Views.parseQueryString(href);
    var views_arguments = Drupal.Views.parseViewArgs(href, 'search');
    var views_settings = $.extend(
        {},
        Drupal.views.instances['views_dom_id:' + current_dom_id].settings,
        views_arguments,
        views_parameters
    );

    // Update View.
    var views_ajax_settings = Drupal.views.instances['views_dom_id:' + current_dom_id].element_settings;
    views_ajax_settings.submit = views_settings;
    views_ajax_settings.url = view_path + '?q=' + href;

    Drupal.ajax(views_ajax_settings).execute();

    // Update url.
    window.historyInitiated = true;
    window.history.pushState(null, document.title, href);

    // ToDo: Update views+facets with ajax on history back.
    // For now we will reload the full page.
    window.addEventListener("popstate", function (e) {
      if (window.historyInitiated) {
        window.location.reload();
      }
    });

    // Refresh facets blocks.
    updateFacetsBlocks(href);
  }

  // Helper function, updates facet blocks.
  var updateFacetsBlocks = function (href) {
    var settings = drupalSettings;
    var facets_blocks = facetsBlocks();

    // Remove All Range Input Form Facet Blocks from being updated.
    if(settings.facets && settings.facets.rangeInput) {
      $.each(settings.facets.rangeInput, function (index, value){
        delete facets_blocks[value.facetId];
      });
    }

    // Update facet blocks.
    var facet_settings = {
      url: Drupal.url('facets-block-ajax'),
      submit: {
        facet_link: href,
        facets_blocks: facets_blocks
      }
    };

    // Update facets summary block.
    if (updateFacetsSummaryBlock()) {
      var facet_summary_wrapper_id = $('[data-drupal-facets-summary-id=' + settings.facets_views_ajax.facets_summary_ajax.facets_summary_id + ']').attr('id');
      var facet_summary_block_id = '';
      if (facet_summary_wrapper_id.indexOf('--') !== -1) {
        facet_summary_block_id = facet_summary_wrapper_id.substring(0, facet_summary_wrapper_id.indexOf('--')).replace('block-', '');
      }
      else {
        facet_summary_block_id = facet_summary_wrapper_id.replace('block-', '');
      }
      facet_settings.submit.update_summary_block = true;
      facet_settings.submit.facet_summary_block_id = facet_summary_block_id;
      facet_settings.submit.facet_summary_wrapper_id = settings.facets_views_ajax.facets_summary_ajax.facets_summary_id;
    }

    Drupal.ajax(facet_settings).execute();
  };

  // Helper function to determine if we should update the summary block.
  // Returns true or false.
  var updateFacetsSummaryBlock = function () {
    var settings = drupalSettings;
    var update_summary = false;

    if (settings.facets_views_ajax.facets_summary_ajax) {
      update_summary = true;
    }

    return update_summary;
  };

  // Helper function, return facet blocks.
  var facetsBlocks = function () {
    // Get all ajax facets blocks from the current page.
    var facets_blocks = {};

    $('.block-facets-ajax').each(function (index) {
      var block_id_start = 'js-facet-block-id-';
      var block_id = $.map($(this).attr('class').split(' '), function (v, i) {
        if (v.indexOf(block_id_start) > -1) {
          return v.slice(block_id_start.length, v.length);
        }
      }).join();
      var block_selector = '#' + $(this).attr('id');
      facets_blocks[block_id] = block_selector;
    });

    return facets_blocks;
  };

  /**
   * Overrides beforeSend to trigger facetblocks update on exposed filter change.
   *
   * @param {XMLHttpRequest} xmlhttprequest
   *   Native Ajax object.
   * @param {object} options
   *   jQuery.ajax options.
   */
  Drupal.Ajax.prototype.beforeSend = function (xmlhttprequest, options) {

    // Update facet blocks as well.
    // Get view from options.
    if (typeof options.extraData !== 'undefined' && typeof options.extraData.view_name !== 'undefined') {
      var href = window.location.href;
      var settings = drupalSettings;

      // TODO: Maybe we should limit facet block reloads by view?
      var reload = false;
      $.each(settings.facets_views_ajax, function (facetId, facetSettings) {
        if (facetSettings.view_id == options.extraData.view_name && facetSettings.current_display_id == options.extraData.view_display_id) {
          reload = true;
        }
      });

      if (reload) {
        href = addExposedFiltersToFacetsUrl(href, options.extraData.view_name, options.extraData.view_display_id);
        updateFacetsBlocks(href);
      }
    }

    // Call the original Drupal method with the right context.
    beforeSend.apply(this, arguments);
  }

  // Helper function to add exposed form data to facets url
  var addExposedFiltersToFacetsUrl = function(href, view_name, view_display_id) {
    var $exposed_form = $('form#views-exposed-form-' + view_name.replace(/_/g, '-') + '-' + view_display_id.replace(/_/g, '-'));

    var params = Drupal.Views.parseQueryString(href);

    $.each($exposed_form.serializeArray(), function() {
      params[this.name] = this.value;
    });

    return href.split('?')[0] + '?' + $.param(params);
  };

})(jQuery, Drupal);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/facets/js/facets-views-ajax.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/facets/js/dropdown-widget.js. */
/**
 * @file
 * Transforms links into a dropdown list.
 */

(function ($) {

  'use strict';

  Drupal.facets = Drupal.facets || {};
  Drupal.behaviors.facetsDropdownWidget = {
    attach: function (context, settings) {
      Drupal.facets.makeDropdown(context, settings);
    }
  };

  /**
   * Turns all facet links into a dropdown with options for every link.
   *
   * @param {object} context
   *   Context.
   * @param {object} settings
   *   Settings.
   */
  Drupal.facets.makeDropdown = function (context, settings) {
    // Find all dropdown facet links and turn them into an option.
    $('.js-facets-dropdown-links').once('facets-dropdown-transform').each(function () {
      var $ul = $(this);
      var $links = $ul.find('.facet-item a');
      var $dropdown = $('<select></select>');
      // Preserve all attributes of the list.
      $ul.each(function() {
        $.each(this.attributes,function(idx, elem) {
            $dropdown.attr(elem.name, elem.value);
        });
      });
      // Remove the class which we are using for .once().
      $dropdown.removeClass('js-facets-dropdown-links');

      $dropdown.addClass('facets-dropdown');
      $dropdown.addClass('js-facets-widget');
      $dropdown.addClass('js-facets-dropdown');

      var id = $(this).data('drupal-facet-id');
      // Add aria-labelledby attribute to reference label.
      $dropdown.attr('aria-labelledby', "facet_"+id+"_label");
      var default_option_label = settings.facets.dropdown_widget[id]['facet-default-option-label'];

      // Add empty text option first.
      var $default_option = $('<option></option>')
        .attr('value', '')
        .text(default_option_label);
      $dropdown.append($default_option);

      $ul.prepend('<li class="default-option"><a href=".">' + default_option_label + '</a></li>');

      var has_active = false;
      $links.each(function () {
        var $link = $(this);
        var active = $link.hasClass('is-active');
        var $option = $('<option></option>')
          .attr('value', $link.attr('href'))
          .data($link.data());
        if (active) {
          has_active = true;
          // Set empty text value to this link to unselect facet.
          $default_option.attr('value', $link.attr('href'));
          $ul.find('.default-option a').attr("href", $link.attr('href'));
          $option.attr('selected', 'selected');
          $link.find('.js-facet-deactivate').remove();
        }
        $option.text(function() {
          // Add hierarchy indicator in case hierarchy is enabled.
          var $parents = $link.parent('li.facet-item').parents('li.facet-item');
          var prefix = '';
          for (var i = 0; i < $parents.length; i++) {
            prefix += '-';
          }
          return prefix + ' ' + $link.text().trim();
        });
        $dropdown.append($option);
      });

      // Go to the selected option when it's clicked.
      $dropdown.on('change.facets', function () {
        var anchor = $($ul).find("[data-drupal-facet-item-id='" + $(this).find(':selected').data('drupalFacetItemId') + "']");
        var $linkElement = (anchor.length > 0) ? $(anchor) : $ul.find('.default-option a');
        var url = $linkElement.attr('href');

        $(this).trigger('facets_filter', [ url ]);
      });

      // Append empty text option.
      if (!has_active) {
        $default_option.attr('selected', 'selected');
      }

      // Replace links with dropdown.
      $ul.after($dropdown).hide();
      Drupal.attachBehaviors($dropdown.parent()[0], Drupal.settings);
    });
  };

})(jQuery);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/facets/js/dropdown-widget.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/search_api_autocomplete/js/search_api_autocomplete.js. */
/**
 * @file
 * Expands the behaviour of the default autocompletion.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  // As a safety precaution, bail if the Drupal Core autocomplete framework is
  // not present.
  if (!Drupal.autocomplete) {
    return;
  }

  var autocomplete = {};

  /**
   * Retrieves the custom settings for an autocomplete-enabled input field.
   *
   * @param {HTMLElement} input
   *   The input field.
   * @param {object} globalSettings
   *   The object containing global settings. If none is passed, drupalSettings
   *   is used instead.
   *
   * @return {object}
   *   The effective settings for the given input fields, with defaults set if
   *   applicable.
   */
  autocomplete.getSettings = function (input, globalSettings) {
    globalSettings = globalSettings || drupalSettings || {};
    // Set defaults for all known settings.
    var settings = {
      auto_submit: false,
      delay: 0,
      min_length: 1,
      selector: ':submit',
    };
    var search = $(input).data('search-api-autocomplete-search');
    if (search
        && globalSettings.search_api_autocomplete
        && globalSettings.search_api_autocomplete[search]) {
      $.extend(settings, globalSettings.search_api_autocomplete[search]);
    }
    return settings;
  };

  /**
   * Attaches our custom autocomplete settings to all affected fields.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the autocomplete behaviors.
   */
  Drupal.behaviors.searchApiAutocomplete = {
    attach: function (context, settings) {
      // Find all our fields with autocomplete settings.
      $(context)
        .find('.ui-autocomplete-input[data-search-api-autocomplete-search]')
        .once('search-api-autocomplete')
        .each(function () {
          var uiAutocomplete = $(this).data('ui-autocomplete');
          if (!uiAutocomplete) {
            return;
          }
          var $element = uiAutocomplete.menu.element;
          $element.data('search-api-autocomplete-input-id', this.id);
          $element.addClass('search-api-autocomplete-search');
          var elementSettings = autocomplete.getSettings(this, settings);
          if (elementSettings['delay']) {
            uiAutocomplete.options['delay'] = elementSettings['delay'];
          }
          if (elementSettings['min_length']) {
            uiAutocomplete.options['minLength'] = elementSettings['min_length'];
          }
          // Override the "select" callback of the jQuery UI autocomplete.
          var oldSelect = uiAutocomplete.options.select;
          uiAutocomplete.options.select = function (event, ui) {
            // If this is a URL suggestion, instead of autocompleting we
            // redirect the user to that URL.
            if (ui.item.url) {
              location.href = ui.item.url;
              return false;
            }

            var ret = oldSelect.apply(this, arguments);

            // If auto-submit is enabled, submit the form.
            if (elementSettings['auto_submit'] && elementSettings['selector']) {
              $(elementSettings['selector'], this.form).trigger('click');
            }

            return ret;
          };
        });
    }
  };

  Drupal.SearchApiAutocomplete = autocomplete;

})(jQuery, Drupal, drupalSettings);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/search_api_autocomplete/js/search_api_autocomplete.js. */;
