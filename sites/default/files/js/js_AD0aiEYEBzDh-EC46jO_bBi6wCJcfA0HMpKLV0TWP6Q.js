/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/simple_recaptcha/js/buttons.js. */
(function ($) {
  "use strict";
  Drupal.behaviors.simple_recaptcha_buttons = {
    attach: function (context, drupalSettings) {
      function recaptchaButtons(formIds) {
        for(let formId in formIds) {
          const $form = $('form[data-recaptcha-id="' + formId + '"]');
          // Count submit buttons inside of form
          // if there's only 1 submit we're good to go.
          let count = $form.find('input[type="submit"]').length;
          if(count === 1) {
            $form.find('[type="submit"]').addClass('simple-recaptcha-submit');
            continue;
          }

          // Lookup for FAPI primary button ( '#button_type' => 'primary' )
          // @see https://www.drupal.org/node/1848288
          const $primary = $form.find('.button--primary');
          if($primary.length > 0) {
            $form.find('.button--primary').addClass('simple-recaptcha-submit');
            continue;
          }

          // Fallback - last available submit element.
          $form.find('[type="submit"]').last().addClass('simple-recaptcha-submit');

        }
      }
      if (typeof drupalSettings.simple_recaptcha !== 'undefined') {
        recaptchaButtons(drupalSettings.simple_recaptcha.form_ids);
      }

      if (typeof drupalSettings.simple_recaptcha_v3 !== 'undefined') {
        recaptchaButtons(drupalSettings.simple_recaptcha_v3.forms);
      }

    }
  }
})(jQuery);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/simple_recaptcha/js/buttons.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/simple_recaptcha/js/simple_recaptcha.js. */
(function ($) {
  "use strict";
  Drupal.behaviors.simple_recaptcha = {
    attach: function (context, drupalSettings) {
      // Grab form IDs from settings and loop through them.
       for(let formId in drupalSettings.simple_recaptcha.form_ids) {
         const $form = $('form[data-recaptcha-id="' + formId + '"]');

         $form.once("simple-recaptcha").each(function () {
          // Disable submit buttons on form.
          const $submit = $form.find('.simple-recaptcha-submit');
          $submit.attr("data-disabled", "true");
          $submit.attr('data-html-form-id', $form.attr("id"));
          const formHtmlId = $form.attr("id");
          const captchas = [];

          // AJAX forms - add submit handler to form.beforeSend.
          // Update Drupal.Ajax.prototype.beforeSend only once.
          if (typeof Drupal.Ajax !== 'undefined' && typeof Drupal.Ajax.prototype.beforeSubmitSimpleRecaptchaOriginal === 'undefined') {
            Drupal.Ajax.prototype.beforeSubmitSimpleRecaptchaOriginal = Drupal.Ajax.prototype.beforeSubmit;
            Drupal.Ajax.prototype.beforeSubmit = function (form_values, element_settings, options) {
              let currentFormIsRecaptcha = form_values.find(function (form_id) {
                return form_id.value === formId;
              });
              if (typeof currentFormIsRecaptcha !== 'undefined') {
                let $element = $(this.element);
                let isFormActions = $element
                    .closest('.form-actions').length;
                let token = $form.find('input[name="simple_recaptcha_token"]').val();
                if (isFormActions && (typeof token === 'undefined' || token === '')) {
                  this.ajaxing = false;
                  return false;
                }
              }
              return this.beforeSubmitSimpleRecaptchaOriginal(this, arguments);
            }
          }

          $submit.on("click", function (e) {
            if ($(this).attr("data-disabled") === "true") {
              // Get HTML IDs for further processing.
              const formHtmlId = $form.attr("id");

              // Find captcha wrapper.
              const $captcha = $(this).closest("form").find(".recaptcha-wrapper");

              // If it is a first submission of that form, render captcha widget.
              if ( $captcha.length && typeof captchas[formHtmlId] === 'undefined' ) {
                captchas[formHtmlId] = grecaptcha.render($captcha.attr("id"), {
                  sitekey: drupalSettings.simple_recaptcha.sitekey
                });
                $captcha.fadeIn();
                $captcha.addClass('recaptcha-visible');
                e.preventDefault();
              }
              else {
                // Check reCaptcha response.
                const response = grecaptcha.getResponse(captchas[formHtmlId]);

                // Verify reCaptcha response.
                if (typeof response !== 'undefined' && response.length ) {
                  e.preventDefault();
                  const $currentSubmit = $('[data-html-form-id="' + formHtmlId + '"]');
                  $form.find('input[name="simple_recaptcha_token"]').val(response);
                  $currentSubmit.removeAttr("data-disabled");
                  // Click goes for regular forms, mousedown for AJAX forms.
                  $currentSubmit.click();
                  $currentSubmit.mousedown();
                }
                else {
                  // Mark captcha widget with error-like border.
                  $captcha.children().css({
                    "border": "1px solid #e74c3c",
                    "border-radius": "4px"
                  });
                  $captcha.addClass('recaptcha-error');
                  e.preventDefault();
                }
              }
            }
          });
        });
      }
    }
  };
})(jQuery);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/simple_recaptcha/js/simple_recaptcha.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/webform/js/webform.element.message.js. */
/**
 * @file
 * JavaScript behaviors for message element integration.
 */

(function ($, Drupal) {

  'use strict';

  // Determine if local storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasLocalStorage = (function () {
    try {
      localStorage.setItem('webform', 'webform');
      localStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  // Determine if session storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasSessionStorage = (function () {
    try {
      sessionStorage.setItem('webform', 'webform');
      sessionStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  /**
   * Behavior for handler message close.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMessageClose = {
    attach: function (context) {
      $(context).find('.js-webform-message--close').once('webform-message--close').each(function () {
        var $element = $(this);

        var id = $element.attr('data-message-id');
        var storage = $element.attr('data-message-storage');
        var effect = $element.attr('data-message-close-effect') || 'hide';
        switch (effect) {
          case 'slide': effect = 'slideUp'; break;

          case 'fade': effect = 'fadeOut'; break;
        }

        // Check storage status.
        if (isClosed($element, storage, id)) {
          return;
        }

        // Only show element if it's style is not set to 'display: none'.
        if ($element.attr('style') !== 'display: none;') {
          $element.show();
        }

        $element.find('.js-webform-message__link').on('click', function (event) {
          $element[effect]();
          setClosed($element, storage, id);
          $element.trigger('close');
          event.preventDefault();
        });
      });
    }
  };

  function isClosed($element, storage, id) {
    if (!id || !storage) {
      return false;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          return localStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      case 'session':
        if (hasSessionStorage) {
          return sessionStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      default:
        return false;
    }
  }

  function setClosed($element, storage, id) {
    if (!id || !storage) {
      return;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          localStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'session':
        if (hasSessionStorage) {
          sessionStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'user':
      case 'state':
      case 'custom':
        $.get($element.find('.js-webform-message__link').attr('href'));
        return true;
    }
  }

})(jQuery, Drupal);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/webform/js/webform.element.message.js. */;
