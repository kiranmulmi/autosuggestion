/**
 * Plugin Name: KM Autocomplete and tags
 * Author: Kiran Mulmi
 *
 * */
(function ($) {
  $.fn.kmAutoComplete = function (options) {

    var _wrapper = $(this);

    var _defaults = {
      url: false,
      name: 'name',
      height: 100,
      externalOption: false,
      data: false,
      vars: false,
      tagAddBefore: false,
      searchResultBefore: false,
      searchCallback: false,
      isTag: false,
      placeholder: false
    };

    var _settings = $.extend({}, _defaults, options);

    var _searchResults = {};
    var defaultData = _wrapper.attr('ac-default');
    if (_settings.data) {
      defaultData = _settings.data;
    }
    if (defaultData) {
      var jsonData = JSON.parse(decodeURIComponent(defaultData));
      jsonData.forEach(function (d) {
        _searchResults[d.key] = d.value;
      });
    }

    var _xhr;

    var _autocomplete = {
      _init: function () {
        var placeholder = _settings.placeholder ? _settings.placeholder : '';
        var inputDiv = '<input type="text" placeholder="' + placeholder + '" name="' + _settings.name + '-autocomplete" id="' + _settings.name + '-autocomplete" autocomplete="off" class="km-ac-input-box"/>'
        inputDiv += '<input type="hidden" name="' + _settings.name + '" id="' + _settings.name + '" class="km-ac-input-hidden-box"/>';
        _wrapper.html(inputDiv);

        if (!$.isEmptyObject(_searchResults)) {
          _autocomplete._renderPrefix();
        }
      },
      _renderPrefix: function () {
        if (_settings.isTag) {
          var output = '<div class="km-ac-tag-output">';
          var hiddenImputValue = [];
          output += '<ul>';
          $.each(_searchResults, function (k, v) {

            if (_settings.tagAddBefore) {
              var passingData = {key: k, value: v};
              var returnData = _settings.tagAddBefore.call(this, passingData);
              if (typeof returnData != "undefined") {
                v = returnData;
              }
            }

            output += '<li class="ag-ac-tag-option-li"><span>' + v + '</span> <span class="km-ac-tag-option-close" ag-ac-search-key="' + k + '">X</span></li>';
            hiddenImputValue.push({key: k, value: v});
          });

          output += '</ul>';
          output += '</div>';

          _wrapper.find('.km-ac-tag-output').remove();
          _wrapper.prepend(output);
        }
        _wrapper.find('.km-ac-input-box').val('');
        _wrapper.find('.km-ac-suggestion-wrapper').remove();
        _wrapper.find('.km-ac-input-hidden-box').val(encodeURIComponent(JSON.stringify(hiddenImputValue)));
        if (_settings.searchCallback) {
          _settings.searchCallback.call(this, {'data': hiddenImputValue})
        }
        if (_settings.vars) {
          _settings.vars.call(this, {'data': hiddenImputValue})
        }

      },
      _renderPostfix: function (key) {
        if (key != '') {

          if (_xhr && _xhr.readyState != 4 && _xhr.readyState != 0) {
            _xhr.abort();
          }

          _xhr = $.ajax({
            url: _settings.url,
            type: 'get',
            data: {key: key},
            dataType: 'json',
            success: function (response) {
              var result = response;

              if (result.length > 0) {
                var inputWidth = _wrapper.find('#' + _settings.name + '-autocomplete').width()+4;
                var suggestionDiv = '<div style="height: ' + _settings.height + '; width: ' + inputWidth + '; background: grey" class="km-ac-suggestion-wrapper">';
                suggestionDiv += '<ul>';

                result.forEach(function (d) {
                  var value = d.value;
                  if (_settings.searchResultBefore) {
                    var passingData = {key: d.key, value: d.value};
                    var returnData = _settings.searchResultBefore.call(this, passingData);
                    if (typeof returnData != "undefined") {
                      value = returnData;
                    }
                  }
                  suggestionDiv += '<li class="ag-ac-option-lists-li" ag-ac-search-key="' + d.key + '" ag-ac-search-value="' + d.value + '">' + value + '</li>';
                });

                suggestionDiv += '</ul>';
                suggestionDiv += '</div>';
                _wrapper.find('.km-ac-suggestion-wrapper').remove();
                _wrapper.append(suggestionDiv);
              }
              else {
                _wrapper.find('.km-ac-suggestion-wrapper').remove();
              }

            }
          });
        }
        else {
          _wrapper.find('.km-ac-suggestion-wrapper').remove();
        }
      }
    };

    //Deligate Functions
    _wrapper.on('keyup', '#' + _settings.name + '-autocomplete', function (e) {
      var key = $(this).val();
      if (e.which != 38 && e.which != 40 && e.which != 37 && e.which != 39) {
        _autocomplete._renderPostfix(key);
      }
    });


    _wrapper.on('click', '.ag-ac-option-lists-li', function () {
      _searchResults[$(this).attr('ag-ac-search-key')] = $(this).attr('ag-ac-search-value');
      _autocomplete._renderPrefix();
    });

    _wrapper.on('click', '.km-ac-tag-option-close', function () {
      delete _searchResults[$(this).attr('ag-ac-search-key')];
      _autocomplete._renderPrefix();
    });


    _wrapper.on('keypress', '.km-ac-input-box', function (e) {
      if (_settings.externalOption) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == '13') {
          e.preventDefault();
          if (_wrapper.find('.km-ac-suggestion-wrapper li').hasClass('ag-ac-option-active')) {
            _searchResults[_wrapper.find('.km-ac-suggestion-wrapper li.ag-ac-option-active').attr('ag-ac-search-key')] = _wrapper.find('.km-ac-suggestion-wrapper li.ag-ac-option-active').attr('ag-ac-search-value');
            _autocomplete._renderPrefix();
          }
          else {
            var textBoxValue = $(this).val()
            var str = textBoxValue;
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();

            var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to = "aaaaeeeeiiiioooouuuunc------";
            for (var i = 0, l = from.length; i < l; i++) {
              str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            if (str != '') {
              _searchResults[str] = textBoxValue;
              _autocomplete._renderPrefix();
            }
          }
        }
      }
    });

    _wrapper.on('keydown', '.km-ac-input-box', function (e) {
      switch (e.which) {

        case 38: // up
          if (_wrapper.find('.km-ac-suggestion-wrapper li').hasClass('ag-ac-option-active')) {
            _wrapper.find('.km-ac-suggestion-wrapper li.ag-ac-option-active').removeClass('ag-ac-option-active').prev('li').addClass('ag-ac-option-active');
          }
          else {
            _wrapper.find('.km-ac-suggestion-wrapper li:last').addClass('ag-ac-option-active');
          }
          break;

        case 40: // down
          e.preventDefault();

          if (_wrapper.find('.km-ac-suggestion-wrapper li').hasClass('ag-ac-option-active')) {
            _wrapper.find('.km-ac-suggestion-wrapper li.ag-ac-option-active').removeClass('ag-ac-option-active').next('li').addClass('ag-ac-option-active');
          }
          else {
            _wrapper.find('.km-ac-suggestion-wrapper li:first').addClass('ag-ac-option-active');
          }

          break;
      }
      //e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    $('body').click(function (e) {
      var inputId = _settings.name + '-autocomplete'
      if (e.target.id == inputId || e.target.parentElement.id == _wrapper.attr('id')) {
        // Inside div
      }
      else {
        _wrapper.find('.km-ac-suggestion-wrapper').remove();
      }

    });

    _autocomplete._init();
  }

})(jQuery);