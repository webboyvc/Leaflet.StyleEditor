/**
 * FormElement used for styling the icon
 */
L.StyleEditor.formElements.IconElement = L.StyleEditor.formElements.FormElement.extend({
    // private classed used in the code
    _selectOptionWrapperClasses: 'leaflet-styleeditor-select-option-wrapper leaflet-styleeditor-hidden',
    _selectOptionClasses: 'leaflet-styleeditor-select-option',

    /** create the icon selectBoxes */
    createContent: function() {
        var uiElement = this.options.uiElement;
        var selectBox = L.DomUtil.create('div', 'leaflet-styleeditor-select', uiElement);
        var selectBoxImage = this.options.selectBoxImage = this._createSelectInputImage(selectBox);

        L.DomEvent.addListener(selectBox, 'click', this._toggleSelectInput, this);
    },

    /** show the correct icon in the correct color if the icon or color changed */
    style: function () {
        var iconOptions = this.options.styleEditorOptions.markerType.getIconOptions();
        this._styleSelectInputImage(this.options.selectBoxImage,
            iconOptions.icon, iconOptions.iconColor);
        this._createColorSelect(this.options.styleEditorOptions.markerType.options.iconOptions.iconColor);
        this._hideSelectOptions();
    },

    /** if lost focus hide potentially open SelectOption */
    lostFocus: function(){
        this._hideSelectOptions();
    },

    /** create image container that hides/shows the iconSelectBox */
    _createSelectInputImage: function(parentUiElement) {
        var wrapper = L.DomUtil.create('div', 'leaflet-styleeditor-select-image-wrapper', parentUiElement);
        return L.DomUtil.create('div', 'leaflet-styleeditor-select-image', wrapper);
    },

    /** create appropriate image for color and icon */
    _styleSelectInputImage: function(image, icon, color) {
        if (!icon) {
            icon = image.getAttribute('value');
            if (!icon) {
                return;
            }
        }

        var iconOptions = this.options.styleEditorOptions.markerType.getIconOptions();
        if (!!color) {
            iconOptions.iconColor = color;
        }

        image.innerHTML = '';
        this.options.styleEditorOptions.markerType.createSelectHTML(image, iconOptions, icon);
        image.setAttribute('value', icon);
    },

    /** create the selectBox with the icons in the correct color */
    _createColorSelect: function(color) {
        if (!this.options.selectOptions) {
            this.options.selectOptions = {};
        }
        if (color in this.options.selectOptions)
            return;

        var uiElement = this.options.uiElement;
        var selectOptionWrapper =
            L.DomUtil.create('ul', this._selectOptionWrapperClasses, uiElement);

        this.options.styleEditorOptions.util.getMarkersForColor(color).forEach(function (option) {
            var selectOption = L.DomUtil.create('li', this._selectOptionClasses, selectOptionWrapper);
            var selectImage = this._createSelectInputImage(selectOption);
            this._styleSelectInputImage(selectImage, option, color);
        }, this);

        this.options.selectOptions[color] = selectOptionWrapper;

        L.DomEvent.addListener(selectOptionWrapper, 'click', function (e) {
            e.stopPropagation();
            var target = e.target;
            if (target.nodeName === 'UL') {
                return;
            }
            if(target.parentNode.className === 'leaflet-styleeditor-select-image') {
                target = target.parentNode;
            } else {
                while (target && target.className !== 'leaflet-styleeditor-select-image') {
                    target = target.childNodes[0];
                }
            }
            this._selectMarker({
                'target': target
            }, this);
        }, this);
    },

    /** show/hide iconSelectBox */
    _toggleSelectInput: function(e) {
        var currentColorElement = this._getCurrentColorElement(
            this.options.styleEditorOptions.util.rgbToHex(
                this.options.styleEditorOptions.markerType.options.iconOptions.iconColor
            )
        );

        var show = false;
        if(!!currentColorElement) {
            show = L.DomUtil.hasClass(currentColorElement, 'leaflet-styleeditor-hidden');
        }

        this._hideSelectOptions();

        if (show) {
            this.options.styleEditorOptions.util.showElement(currentColorElement);
        }
    },

    /** called when user selects a marker */
    _selectMarker: function (e) {
        var value = this._getValue(e.target);

        // update style
        this.options.selectBoxImage.setAttribute('value', value);
        this.setStyle(value);

        this._hideSelectOptions();
    },

    /** helper function to return attribute value of target */
    _getValue: function (target) {
        return target.getAttribute('value');
    },

    /** return correct selectBox depending on which color is currently chosen */
    _getCurrentColorElement: function(color) {
        if (!this.options.selectOptions[color])
            this._createColorSelect(color);
        return this.options.selectOptions[color];
    },

    /** hide open SelectOption */
    _hideSelectOptions: function() {
        for (var selectOption in this.options.selectOptions) {
            this.options.styleEditorOptions.util.hideElement(this.options.selectOptions[selectOption]);
        }

    }

});
