/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/themes/pfcorporate_helix/public/assets/js/detail-page.js. */
"use strict";

(function ($, Drupal) {
  // eslint-disable-next-line no-param-reassign
  Drupal.behaviors.detailPage = {
    attach: function attach(context) {
      $('.copy-text').once().click(function(e) {
        e.preventDefault();
        $('#copied-text').empty();
        $('#copied-text').removeClass('hideClass');
        let outputText = "";
        let targets = document.getElementsByClassName('copy-clipboard');
        for( let i = 0; i < targets.length; i++ ) {
          outputText += targets[i].innerText;
        }
        let output = document.getElementById('copied-text');
        output.innerText = outputText;
        let range = document.createRange();
        range.selectNodeContents(output);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        navigator.clipboard.writeText(selection);
        $('#copied-text').addClass('hideClass');
        $("#dialog").dialog(
          {
            modal: true,
            buttons: {
              Ok: function() {
                $(this).dialog("close");
              }
            },
            width : 400
          }
        );
      });
      $('.copy-share').click(function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href);
        $("#dialog").dialog(
          {
            modal: true,
            buttons: {
              Ok: function() {
                $(this).dialog("close");
              }
            },
            width : 400
          }
        );
      });
    }
  };
})(jQuery, Drupal);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/themes/pfcorporate_helix/public/assets/js/detail-page.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/themes/pfcorporate_helix/public/assets/js/productPipelineSearch.js. */
"use strict";

(function ($, Drupal) {
  // eslint-disable-next-line no-param-reassign
  Drupal.behaviors.productPipelineSearchTest = {
    attach: function attach(context) {
      // Checks if all the filters have been checked.
      function areAllSelected() {
        if ($('.js-product-pipeline-search', context).find('input[type="checkbox"]:checked', context).length === $('.js-product-pipeline-search', context).find('input[type="checkbox"]').length) {
          return true;
        }

        return false;
      } // Checks if none of the filters are checked.


      function isNoneSelected() {
        if ($('.js-product-pipeline-search', context).find('input[type="checkbox"]:checked').length) {
          return false;
        }

        return true;
      } // Enable/disable 'Select All' and 'Clear All' buttons. Could be coded
      // a bit better, but it works for now.


      function updateAll() {
        if (areAllSelected()) {
          $('.js-select-all', context).attr('disabled', 'disabled');
        } else if (!areAllSelected() && $('.js-select-all', context).attr('disabled')) {
          $('.js-select-all', context).removeAttr('disabled');
        }

        if (isNoneSelected()) {
          $('.js-clear-all', context).attr('disabled', 'disabled');
        } else if (!isNoneSelected() && $('.js-clear-all', context).attr('disabled')) {
          $('.js-clear-all', context).removeAttr('disabled');
        }
      }

      function updateFilterGroup($checkbox) {
        var $group = $checkbox.parents('.js-tag-list', context); // Are all checkboxes within a group checked?

        var isGroupChecked = !$group.find('input[type="checkbox"]:not(:checked)', context).length;
        var isAnyInGroupChecked = !!$group.find('input[type="checkbox"]:checked').length;
        var $tagCarrier = $(".js-tag-placeholder[data-tag=\"".concat($group.data('tag-group'), "\"]"));

        function renderTag(title) {
          return "<li data-tag-render-group=\"".concat($group.data('tag-group'), "\" data-tag-render=\"").concat(title, "\"><span class=\"tag tag--alt tag--slim\">").concat(title, "</span></li>");
        } // All inputs in the group are checked.


        if (isGroupChecked) {
          // Show that the entire group is active.
          $(".js-tag-placeholder[data-tag=\"".concat($group.data('tag-group'), "\"]")).addClass('active'); // Entire group is active, individual tags need to be hidden.

          $("[data-tag-render-group=\"".concat($group.data('tag-group'), "\"]")).hide();
          $tagCarrier.show();
        } else {
          // Group is not acive any more.
          $(".js-tag-placeholder[data-tag=\"".concat($group.data('tag-group'), "\"]")).removeClass('active'); // Show any group tags that might be rendered.

          $("[data-tag-render-group=\"".concat($group.data('tag-group'), "\"]")).show();

          if (!$checkbox.prop('checked')) {
            $("[data-tag-render=\"".concat($checkbox.next('label').html(), "\"]")).remove();
          }

          if (isAnyInGroupChecked) {
            // Add/remove a new tag that corresponds to the selected filter.
            if ($checkbox.prop('checked') && $("[data-tag-render=\"".concat($checkbox.next('label').text(), "\"]")).length === 0) {
              $(renderTag($checkbox.next('label').html())).insertAfter($tagCarrier);
            }

            $tagCarrier.hide();
          } else {
            $tagCarrier.show();
          }
        }
      }

      var initCustomFilters = function initCustomFilters() {
        $('.js-product-pipeline-search', context).each(function () {
          var $root = $(this);
          var $toggle = $root.find('.js-toggle', context);
          var $collapse = $root.find('.js-collapse', context); // const $checkboxes = $root.find('input[type="checkbox"]', context);
          // const $filterGroups = $root.find('.js-tag-list', context);

          var $render = $root.find('.js-toolbox-render', context);
          var $stage = $root.find('.js-toolbox-stage', context);

          function render() {
            $render.find('*', context).remove();
            var stageNodes = [];
            $stage.find('li', context).each(function () {
              var $node = $(this);

              if ($node.css('display') !== 'none') {
                stageNodes.push($node);
              }
            });
            stageNodes.slice(0, 6).forEach(function ($node) {
              $node.clone().appendTo($render);
            });

            if (stageNodes.length - 7 > 0) {
              $root.find('.js-toolbox-more > span').text($root.find('input[type="checkbox"]:checked').length - 6);
            }
          } // On checkbox change


          $('.js-product-pipeline-search', context).find('input[type="checkbox"]').each(function () {
            var $checkbox = $(this);
            $checkbox.change(function () {
              updateAll();
              updateFilterGroup($checkbox);
            });
          }); // Search options collapse

          $toggle.once().on('click', function () {
            $(this).toggleClass('is-open');
            $collapse.slideToggle();

            if (!$(this).hasClass('is-open')) {
              render();
              $stage.addClass('is-hidden');
              $render.removeClass('is-hidden'); // Don't show 'more' message is there are 0 more.

              if ($root.find('input[type="checkbox"]:checked').length > 6) {
                $root.find('.js-toolbox-more').show();
              }
            } else {
              $stage.removeClass('is-hidden');
              $render.addClass('is-hidden');
              $root.find('.js-toolbox-more').hide();
            }
          }); // Select all

          $('.js-product-pipeline-search', context).find('.js-select-all', context).click(function () {
            $('.js-product-pipeline-search', context).find('input[type="checkbox"]').each(function () {
              // Emulate checkbox selection - only it not alreaady checked.
              if (!$(this).prop('checked')) {
                $(this).prop('checked', true);
              }
            });
            $('.product-pipeline-exposed-form .btn--round input').trigger('click');
            updateAll();
            $('.js-product-pipeline-search', context).find('.js-tag-placeholder').addClass('active');
          }); // Clear all

          $('.js-product-pipeline-search', context).find('.js-clear-all', context).click(function () {
            $('.js-product-pipeline-search', context).find('input[type="checkbox"]').each(function () {
              // Emulate checkbox unselect - only it alreaady checked.
              if ($(this).prop('checked')) {
                $(this).prop('checked', false);
              }
            });
            $('.product-pipeline-exposed-form .btn--round input').trigger('click');
            updateAll();
          });

          function init() {
            updateAll();
            render();
          }

          init();
        });
      };

      initCustomFilters();
      $(context).ajaxComplete(function (event, xhr, settings) {
        initCustomFilters();
        updateAll();
        $('.js-product-pipeline-search', context).find('input[type="checkbox"]').each(function () {
          updateAll();
          updateFilterGroup($(this));
        });
      });
    }
  };
})(jQuery, Drupal);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/profiles/pfecpfizercomus_profile/themes/pfcorporate_helix/public/assets/js/productPipelineSearch.js. */;
/* Source and licensing information for the line(s) below can be found at https://www.pfizer.com/modules/contrib/extlink/extlink.js. */
/**
 * @file
 * External links js file.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.extlink = Drupal.extlink || {};

  Drupal.extlink.attach = function (context, drupalSettings) {
    if (!drupalSettings.data.hasOwnProperty('extlink')) {
      return;
    }

    // Define the jQuery method (either 'append' or 'prepend') of placing the
    // icon, defaults to 'append'.
    var extIconPlacement = 'append';
    if (drupalSettings.data.extlink.extIconPlacement && drupalSettings.data.extlink.extIconPlacement != '0') {
          extIconPlacement = drupalSettings.data.extlink.extIconPlacement;
        }

    // Strip the host name down, removing ports, subdomains, or www.
    var pattern = /^(([^\/:]+?\.)*)([^\.:]{1,})((\.[a-z0-9]{1,253})*)(:[0-9]{1,5})?$/;
    var host = window.location.host.replace(pattern, '$2$3$6');
    var subdomain = window.location.host.replace(host, '');

    // Determine what subdomains are considered internal.
    var subdomains;
    if (drupalSettings.data.extlink.extSubdomains) {
      subdomains = '([^/]*\\.)?';
    }
    else if (subdomain === 'www.' || subdomain === '') {
      subdomains = '(www\\.)?';
    }
    else {
      subdomains = subdomain.replace('.', '\\.');
    }

    // Whitelisted domains.
    var whitelistedDomains = false;
    if (drupalSettings.data.extlink.whitelistedDomains) {
      whitelistedDomains = [];
      for (var i = 0; i < drupalSettings.data.extlink.whitelistedDomains.length; i++) {
        whitelistedDomains.push(new RegExp('^https?:\\/\\/' + drupalSettings.data.extlink.whitelistedDomains[i].replace(/(\r\n|\n|\r)/gm,'') + '.*$', 'i'));
      }
    }

    // Build regular expressions that define an internal link.
    var internal_link = new RegExp('^https?://([^@]*@)?' + subdomains + host, 'i');

    // Extra internal link matching.
    var extInclude = false;
    if (drupalSettings.data.extlink.extInclude) {
      extInclude = new RegExp(drupalSettings.data.extlink.extInclude.replace(/\\/, '\\'), 'i');
    }

    // Extra external link matching.
    var extExclude = false;
    if (drupalSettings.data.extlink.extExclude) {
      extExclude = new RegExp(drupalSettings.data.extlink.extExclude.replace(/\\/, '\\'), 'i');
    }

    // Extra external link CSS selector exclusion.
    var extCssExclude = false;
    if (drupalSettings.data.extlink.extCssExclude) {
      extCssExclude = drupalSettings.data.extlink.extCssExclude;
    }

    // Extra external link CSS selector explicit.
    var extCssExplicit = false;
    if (drupalSettings.data.extlink.extCssExplicit) {
      extCssExplicit = drupalSettings.data.extlink.extCssExplicit;
    }

    // Find all links which are NOT internal and begin with http as opposed
    // to ftp://, javascript:, etc. other kinds of links.
    // When operating on the 'this' variable, the host has been appended to
    // all links by the browser, even local ones.
    // In jQuery 1.1 and higher, we'd use a filter method here, but it is not
    // available in jQuery 1.0 (Drupal 5 default).
    var external_links = [];
    var mailto_links = [];
    $('a:not([data-extlink]), area:not([data-extlink])', context).each(function (el) {
      try {
        var url = '';
        if (typeof this.href == 'string') {
          url = this.href.toLowerCase();
        }
        // Handle SVG links (xlink:href).
        else if (typeof this.href == 'object') {
          url = this.href.baseVal;
        }
        if (url.indexOf('http') === 0
          && ((!internal_link.test(url) && !(extExclude && extExclude.test(url))) || (extInclude && extInclude.test(url)))
          && !(extCssExclude && $(this).is(extCssExclude))
          && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
          && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
          var match = false;
          if (whitelistedDomains) {
            for (var i = 0; i < whitelistedDomains.length; i++) {
              if (whitelistedDomains[i].test(url)) {
                match = true;
                break;
              }
            }
          }
          if (!match) {
            external_links.push(this);
          }
        }
        // Do not include area tags with begin with mailto: (this prohibits
        // icons from being added to image-maps).
        else if (this.tagName !== 'AREA'
          && url.indexOf('mailto:') === 0
          && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
          && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
          mailto_links.push(this);
        }
      }
      // IE7 throws errors often when dealing with irregular links, such as:
      // <a href="node/10"></a> Empty tags.
      // <a href="http://user:pass@example.com">example</a> User:pass syntax.
      catch (error) {
        return false;
      }
    });

    if (drupalSettings.data.extlink.extClass !== '0' && drupalSettings.data.extlink.extClass !== '') {
      Drupal.extlink.applyClassAndSpan(external_links, drupalSettings.data.extlink.extClass, extIconPlacement);
    }

    if (drupalSettings.data.extlink.mailtoClass !== '0' && drupalSettings.data.extlink.mailtoClass !== '') {
      Drupal.extlink.applyClassAndSpan(mailto_links, drupalSettings.data.extlink.mailtoClass, extIconPlacement);
    }

    if (drupalSettings.data.extlink.extTarget) {
      // Apply the target attribute to all links.
      $(external_links).filter(function () {
        // Filter out links with target set if option specified.
        return !(drupalSettings.data.extlink.extTargetNoOverride && $(this).is('a[target]'));
      }).attr({target: '_blank'});

      // Add noopener rel attribute to combat phishing.
      $(external_links).attr('rel', function (i, val) {
        // If no rel attribute is present, create one with the value noopener.
        if (val === null || typeof val === 'undefined') {
          return 'noopener';
        }
        // Check to see if rel contains noopener. Add what doesn't exist.
        if (val.indexOf('noopener') > -1) {
          if (val.indexOf('noopener') === -1) {
            return val + ' noopener';
          }
          // Noopener exists. Nothing needs to be added.
          else {
            return val;
          }
        }
        // Else, append noopener to val.
        else {
          return val + ' noopener';
        }
      });
    }

    if (drupalSettings.data.extlink.extNofollow) {
      $(external_links).attr('rel', function (i, val) {
        // When the link does not have a rel attribute set it to 'nofollow'.
        if (val === null || typeof val === 'undefined') {
          return 'nofollow';
        }
        var target = 'nofollow';
        // Change the target, if not overriding follow.
        if (drupalSettings.data.extlink.extFollowNoOverride) {
          target = 'follow';
        }
        if (val.indexOf(target) === -1) {
          return val + ' nofollow';
        }
        return val;
      });
    }

    if (drupalSettings.data.extlink.extNoreferrer) {
      $(external_links).attr('rel', function (i, val) {
        // When the link does not have a rel attribute set it to 'noreferrer'.
        if (val === null || typeof val === 'undefined') {
          return 'noreferrer';
        }
        if (val.indexOf('noreferrer') === -1) {
          return val + ' noreferrer';
        }
        return val;
      });
    }

    Drupal.extlink = Drupal.extlink || {};

    // Set up default click function for the external links popup. This should be
    // overridden by modules wanting to alter the popup.
    Drupal.extlink.popupClickHandler = Drupal.extlink.popupClickHandler || function () {
      if (drupalSettings.data.extlink.extAlert) {
        return confirm(drupalSettings.data.extlink.extAlertText);
      }
    };

    $(external_links).off("click.extlink");
    $(external_links).on("click.extlink", function (e) {
      return Drupal.extlink.popupClickHandler(e, this);
    });
  };

  /**
   * Apply a class and a trailing <span> to all links not containing images.
   *
   * @param {object[]} links
   *   An array of DOM elements representing the links.
   * @param {string} class_name
   *   The class to apply to the links.
   * @param {string} icon_placement
   *   'append' or 'prepend' the icon to the link.
   */
  Drupal.extlink.applyClassAndSpan = function (links, class_name, icon_placement) {
    var $links_to_process;
    if (drupalSettings.data.extlink.extImgClass) {
      $links_to_process = $(links);
    }
    else {
      var links_with_images = $(links).find('img, svg').parents('a');
      $links_to_process = $(links).not(links_with_images);
    }

    if (class_name !== '0') {
      $links_to_process.addClass(class_name);
    }

    // Add data-extlink attribute.
    $links_to_process.attr('data-extlink', '');

    var i;
    var length = $links_to_process.length;
    for (i = 0; i < length; i++) {
      var $link = $($links_to_process[i]);
      if (drupalSettings.data.extlink.extUseFontAwesome) {
        if (class_name === drupalSettings.data.extlink.mailtoClass) {
          $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaMailtoClasses + '" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '"></span></span>');
        }
        else {
          $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaLinkClasses + '" aria-label="' + drupalSettings.data.extlink.extLabel + '"></span></span>');
        }
      }
      else {
        if (class_name === drupalSettings.data.extlink.mailtoClass) {
          $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '"  viewBox="0 10 70 20"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.mailtoLabel + '</title><path d="M56 14H8c-1.1 0-2 0.9-2 2v32c0 1.1 0.9 2 2 2h48c1.1 0 2-0.9 2-2V16C58 14.9 57.1 14 56 14zM50.5 18L32 33.4 13.5 18H50.5zM10 46V20.3l20.7 17.3C31.1 37.8 31.5 38 32 38s0.9-0.2 1.3-0.5L54 20.3V46H10z"/></svg>');
        }
        else {
          $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.extLabel + '"  viewBox="0 0 80 40"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.extLabel + '</title><path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"/><path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"/></svg>');
        }
      }
    }
  };

  Drupal.behaviors.extlink = Drupal.behaviors.extlink || {};
  Drupal.behaviors.extlink.attach = function (context, drupalSettings) {
    // Backwards compatibility, for the benefit of modules overriding extlink
    // functionality by defining an "extlinkAttach" global function.
    if (typeof extlinkAttach === 'function') {
      extlinkAttach(context);
    }
    else {
      Drupal.extlink.attach(context, drupalSettings);
    }
  };

})(jQuery, Drupal, drupalSettings);

/* Source and licensing information for the above line(s) can be found at https://www.pfizer.com/modules/contrib/extlink/extlink.js. */;
