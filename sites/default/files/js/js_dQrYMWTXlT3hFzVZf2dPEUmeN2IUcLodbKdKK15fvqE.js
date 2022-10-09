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
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/modules/pfizer_media_center/js/pfizer_sub_section.js. */
/**
 * @file
 * pfizer sub section related js changes
 */
(function ($, Drupal, drupalSettings) {
  "use strict";
  Drupal.behaviors.pfizerSubSection = {
    attach: function (context, settings) {
      $(document).on(
        "click",
        'a[href="/stories#ebooks-section"]',
        function (e) {
          e.preventDefault();
          var desktopHeader = $(".sub-section-desktop-nav").height();
          var buffer = $(".header__container").height() + desktopHeader;
          var pos = $("#ebooks-section").offset().top - buffer;

          // animated top scrolling
          $("body, html").animate({ scrollTop: pos });
        }
      );

      $(document).on(
        "click",
        'span.mediacenter-menu[data-href^="#"]',
        function (e) {
          $(".sub-section-header span").removeClass("active");
          $(this).addClass("active");
          // Dont do anything if anchor not found.
          var id = $(this).attr("data-href");
          var $id = $(id);
          if ($id.length === 0) {
            return;
          }

          // prevent standard hash navigation (avoid blinking in IE)
          e.preventDefault();

          var desktopHeader = $(".sub-section-desktop-nav").height();
          var buffer = $(".header__container").height() + desktopHeader;
          var pos = $(id).offset().top - buffer;

          if (isMobile()) {
            $(".sub-section-desktop-nav").hide();
          }

          // animated top scrolling
          $("body, html").animate({ scrollTop: pos });
        }
      );

      // Add active class on page load.
      var url = window.location.href;
      var arr = url.split("#");
      if (arr.hasOwnProperty(1)) {
        var id = "#" + arr[1];
        $('a[href^="' + id + '"]').addClass("active");
      }

      $(".expand-section-mobile").click(function () {
        $(".sub-section-desktop-nav").slideToggle("slow");
      });
      $(window).scroll(function (e) {
        var $el = $(".sub-section-desktop-nav"),
          $tel = $(".banner-section-wrapper"),
          $headerHeight = $(".header__container").height(),
          $mediaCentreMenu = $(".sub-section-desktop-nav").height();
        if ($tel.length == 1) {
          if ($($tel).isInViewport()) {
            $el.css({ position: "static", top: $headerHeight });
            $(".sub-section-content").css({
              position: "static",
              "margin-top": 0,
            });
            if (isMobile()) {
              $(".sub-section-mobile-nav").css({
                position: "static",
              });
            }
          } else {
            $el.css({ position: "fixed", top: $headerHeight });
            $(".sub-section-content").css({
              position: "relative",
              "margin-top": $mediaCentreMenu,
            });

            if (isMobile()) {
              $(".sub-section-mobile-nav").css({
                position: "fixed",
                top: $headerHeight,
              });
              var t =
                $headerHeight + $(".sub-section-mobile-nav").outerHeight();
              $el.css({ position: "fixed", top: t });

              $(".sub-section-content").css({
                position: "relative",
                "margin-top": $(".sub-section-mobile-nav").outerHeight(),
              });
            }
          }
        } else {
          $el.css({ position: "fixed", top: $headerHeight });
          $(".sub-section-content").css({
            position: "relative",
            "margin-top": $mediaCentreMenu,
          });
          if (isMobile()) {
            $(".sub-section-mobile-nav").css({
              position: "fixed",
              top: $headerHeight,
            });

            $(".sub-section-content").css({
              position: "relative",
              "margin-top": $(".sub-section-mobile-nav").outerHeight(),
            });
          }
        }
      });

      $(".update-statement-container")
        .parents(".grid-container")
        .find("p.link-l")
        .css("margin", 0);
      $(".update-statement-container")
        .parents(".view-reference-block-auto-margin")
        .eq(0)
        .css("margin-top", "87px");
      $(".update-statement-container")
        .parents(".view-reference-block-auto-margin")
        .eq(0)
        .css("margin-bottom", "87px");
      if ($(window).width() < 768) {
        $(".update-statement-container")
          .parents(".view-reference-block-auto-margin")
          .eq(0)
          .css("margin-top", "40px");
        $(".update-statement-container")
          .parents(".view-reference-block-auto-margin")
          .eq(0)
          .css("margin-bottom", "56px");
      }

      $.fn.isInViewport = function () {
        var headerHeight = $(".header__container").height();
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight() - headerHeight;

        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height() - headerHeight;

        return elementBottom > viewportTop && elementTop < viewportBottom;
      };

      function isMobile() {
        return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
          navigator.userAgent.toLowerCase()
        );
      }
    },
  };
})(jQuery, Drupal, drupalSettings);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/modules/pfizer_media_center/js/pfizer_sub_section.js. */;
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
