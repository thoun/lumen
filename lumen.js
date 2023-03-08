function slideToObjectAndAttach(game, object, destinationId, changeSide) {
    if (changeSide === void 0) { changeSide = false; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }
    var originBR = object.getBoundingClientRect();
    destination.appendChild(object);
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        if (destination.dataset.currentPlayer == 'false') {
            object.style.order = null;
            object.style.position = 'absolute';
        }
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
            object.style.position = null;
        }, 600);
    }
    else {
        object.style.order = null;
    }
}
function slideFromObject(game, object, fromId) {
    var from = document.getElementById(fromId);
    var originBR = from.getBoundingClientRect();
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        if (object.parentElement.dataset.currentPlayer == 'false') {
            object.style.position = 'absolute';
        }
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
            object.style.position = null;
        }, 600);
    }
}
/**
 * Linear slide of the card from origin to destination.
 *
 * @param element the element to animate. The element should be attached to the destination element before the animation starts.
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function slideAnimation(element, settings) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        // should be checked at the beginning of every animation
        if (!shouldAnimate(settings)) {
            success(false);
            return promise;
        }
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        (_d = settings.animationStart) === null || _d === void 0 ? void 0 : _d.call(settings, element);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            var _a;
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            (_a = settings.animationEnd) === null || _a === void 0 ? void 0 : _a.call(settings, element);
            success(true);
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(element, settings) {
    console.log(element, element.getBoundingClientRect(), element.style.transform, settings);
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
    }
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param element the element to animate
     * @param toElement the destination parent
     * @param fn the animation function
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (element, toElement, fn, settings) {
        var _a, _b, _c, _d, _e, _f;
        var fromRect = element.getBoundingClientRect();
        toElement.appendChild(element);
        (_a = settings === null || settings === void 0 ? void 0 : settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, toElement);
        return (_f = fn(element, __assign(__assign({ duration: (_c = (_b = this.settings) === null || _b === void 0 ? void 0 : _b.duration) !== null && _c !== void 0 ? _c : 500, scale: (_e = (_d = this.zoomManager) === null || _d === void 0 ? void 0 : _d.zoom) !== null && _e !== void 0 ? _e : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromRect: fromRect }))) !== null && _f !== void 0 ? _f : Promise.resolve(false);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithSlideAnimation = function (element, toElement, settings) {
        return this.attachWithAnimation(element, toElement, slideAnimation, settings);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithShowToScreenAnimation = function (element, toElement, settingsOrSettingsArray) {
        var _this = this;
        var cumulatedAnimation = function (element, settings) { return cumulatedAnimations(element, [
            showScreenCenterAnimation,
            pauseAnimation,
            function (element) { return _this.attachWithSlideAnimation(element, toElement); },
        ], settingsOrSettingsArray); };
        return this.attachWithAnimation(element, toElement, cumulatedAnimation, null);
    };
    /**
     * Slide from an element.
     *
     * @param element the element to animate
     * @param fromElement the origin element
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.slideFromElement = function (element, fromElement, settings) {
        var _a, _b, _c, _d, _e;
        return (_e = slideAnimation(element, __assign(__assign({ duration: (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 500, scale: (_d = (_c = this.zoomManager) === null || _c === void 0 ? void 0 : _c.zoom) !== null && _d !== void 0 ? _d : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromElement: fromElement }))) !== null && _e !== void 0 ? _e : Promise.resolve(false);
    };
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    return AnimationManager;
}());
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    // TODO keep only one ?
    CardStock.prototype.cardInStock = function (card) {
        var element = document.getElementById(this.manager.getId(card));
        return element ? this.cardElementInStock(element) : false;
    };
    CardStock.prototype.cardElementInStock = function (element) {
        return (element === null || element === void 0 ? void 0 : element.parentElement) == this.element;
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return document.getElementById(this.manager.getId(card));
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.cardInStock(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in stock then we ignore animation
        var currentStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        if (currentStock === null || currentStock === void 0 ? void 0 : currentStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: currentStock }), settingsWithIndex);
            element.dataset.side = ((_a = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _a !== void 0 ? _a : true) ? 'front' : 'back';
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : true));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        this.setSelectableCard(card, this.selectionMode != 'none');
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            return Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        cardElement.classList.remove('selectable', 'selected', 'disabled');
        promise = this.animationFromElement(cardElement, animation.fromStock.element, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element, {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement, {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        var _this = this;
        if (shift === void 0) { shift = false; }
        if (shift === true) {
            if (cards.length) {
                this.addCard(cards[0], animation, settings).then(function () { return _this.addCards(cards.slice(1), animation, settings, shift); });
            }
            return;
        }
        if (shift) {
            var _loop_1 = function (i) {
                setTimeout(function () { return _this.addCard(cards[i], animation, settings); }, i * shift);
            };
            for (var i = 0; i < cards.length; i++) {
                _loop_1(i);
            }
        }
        else {
            cards.forEach(function (card) { return _this.addCard(card, animation, settings); });
        }
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     */
    CardStock.prototype.removeCard = function (card) {
        if (this.cardInStock(card)) {
            this.manager.removeCard(card);
        }
        this.cardRemoved(card);
    };
    CardStock.prototype.cardRemoved = function (card) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     */
    CardStock.prototype.removeCards = function (cards) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card); });
    };
    /**
     * Remove all cards from the stock.
     */
    CardStock.prototype.removeAll = function () {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card); });
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        var element = this.getCardElement(card);
        element.classList.toggle('selectable', selectable);
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     */
    CardStock.prototype.setSelectionMode = function (selectionMode) {
        var _this = this;
        if (selectionMode === 'none') {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('selectable', selectionMode != 'none');
        this.selectionMode = selectionMode;
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var element = this.getCardElement(card);
        element.classList.add('selected');
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        element.classList.remove('selected');
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromElement, settings) {
        var _a, _b, _c, _d, _e, _f;
        var side = element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            var cardSides_1 = element.getElementsByClassName('card-sides')[0];
            cardSides_1.style.transition = 'none';
            element.dataset.side = settings.originalSide;
            setTimeout(function () {
                cardSides_1.style.transition = null;
                element.dataset.side = side;
            });
        }
        var animation = (_a = settings.animation) !== null && _a !== void 0 ? _a : slideAnimation;
        return (_f = animation(element, __assign(__assign({ duration: (_c = (_b = this.manager.animationManager.getSettings()) === null || _b === void 0 ? void 0 : _b.duration) !== null && _c !== void 0 ? _c : 500, scale: (_e = (_d = this.manager.animationManager.getZoomManager()) === null || _d === void 0 ? void 0 : _d.zoom) !== null && _e !== void 0 ? _e : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.manager.game, fromElement: fromElement }))) !== null && _f !== void 0 ? _f : Promise.resolve(false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    return CardStock;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.cardElementInStock = function (element) {
        return (element === null || element === void 0 ? void 0 : element.parentElement.parentElement) == this.element;
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.cardInStock(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    return SlotStock;
}(LineStock));
/**
 * A stock with manually placed cards
 */
var ManualPositionStock = /** @class */ (function (_super) {
    __extends(ManualPositionStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card) {
        _super.prototype.cardRemoved.call(this, card);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise.then(function (result) {
            _this.removeCard(card);
            return result;
        });
    };
    return VoidStock;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        // TODO check if exists
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div class=\"card-side front\">\n                </div>\n                <div class=\"card-side back\">\n                </div>\n            </div>\n        ";
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    CardManager.prototype.removeCard = function (card) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return;
        }
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card);
        div.id = "deleted".concat(id);
        // TODO this.removeVisibleInformations(div);
        div.remove();
    };
    /**
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        element.dataset.side = visible ? 'front' : 'back';
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            (_c = (_b = this.settings).setupFrontDiv) === null || _c === void 0 ? void 0 : _c.call(_b, card, element.getElementsByClassName('front')[0]);
        }
        if ((_d = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _d !== void 0 ? _d : false) {
            (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        }
        if ((_g = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _g !== void 0 ? _g : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    return CardManager;
}());
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            animationManager: game.animationManager,
            getId: function (card) { return "card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('fighter');
                div.dataset.type = '' + card.type;
                div.dataset.subType = '' + card.subType;
                if (card.playerId) {
                    div.dataset.color = game.getPlayerColor(card.playerId);
                }
                if (card.type == 10 && card.playerId) {
                    var playerToken = document.createElement('div');
                    playerToken.classList.add('player-token');
                    playerToken.dataset.color = game.getPlayerColor(card.playerId);
                    div.appendChild(playerToken);
                }
            },
            setupFrontDiv: function (card, div) {
                div.id = "".concat(_this.getId(card), "-front");
                game.setTooltip(div.id, _this.getTooltip(card.subType, _('Active')));
            },
            setupBackDiv: function (card, div) {
                div.id = "".concat(_this.getId(card), "-back");
                game.setTooltip(div.id, _this.getTooltip(card.subType, _('Inactive')));
            },
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.getName = function (subType) {
        switch (subType) {
            case 1: return _("The Shroomling");
            case 2: return _("The Mudshell");
            case 3: return _("The Restorer");
            case 4: return _("The Pusher");
            case 5: return _("The Assassin");
            case 6: return _("The Feathered");
            case 11: return _("The Epic Pusher");
            case 12: return _("The Epic Assassin");
            case 13: return _("The Impatient");
            case 14: return _("The Bomber");
            case 15: return _("The Weaver");
            case 16: return _("The Rootspring");
            case 17: return _("The Hypnotist");
            case 18: return _("The Metamorph");
            case 21: return _("Fury");
            case 22: return _("Clean Sheet");
            case 23: return _("Teleportation");
            case 31: return _("Discovery Mission");
            case 32: return _("Winter Mission");
            case 33: return _("Shroomling Mission");
        }
    };
    CardsManager.prototype.getNotPlayedStrength = function (subType) {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 1;
            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 1;
            case 15: return 2;
            case 16: return 2;
            case 17: return 2;
            case 18: return 1;
        }
    };
    CardsManager.prototype.getStrength = function (subType) {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 1;
            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 1;
            case 15: return '2 <div class="strength-icon"></div> / 1';
            case 16: return '2 <div class="strength-icon"></div> / 1';
            case 17: return 2;
            case 18: return '1 <div class="strength-icon"></div> / 3';
        }
    };
    CardsManager.prototype.getDescription = function (subType) {
        switch (subType) {
            case 1: return _("No special ability");
            case 2: return _("This creature's shell offers protection against Deadly Fighters and the Fury. The Mudshell cannot be moved during phase 3 Issuing Orders.");
            case 3: return _("When you flip the Restorer to its INACTIVE side, flip all other Fighters in its Territory and all adjacent Territories back to their ACTIVE side.");
            case 4: return _("When you flip the Pusher to its INACTIVE side, push 1 Fighter of your choice (yours or your opponent's) to an adjacent Territory.");
            case 5: return _("This creature belongs to the family of Deadly Fighters. When you flip the Assassin to its INACTIVE side, remove 1 of your opponent's Basic Fighters or Mercenary Fighters from the same Territory. This Fighter is returned to its colored bag and can rejoin the battle later.");
            case 6: return _("When you flip the Feathered to its INACTIVE side, it takes off and moves by air to any other Territory on the Battlefield.");
            case 11: return "".concat(_("When you flip it to its INACTIVE side, the Epic Pusher:"), "<br> \n                &nbsp; ").concat(_("MUST first move 1 space by land."), "<br> \n                &nbsp; ").concat(_("THEN, it pushes 1 other Fighter of your choice (yours or your opponent's) to an adjacent Territory."));
            case 12: return "".concat(_("This creature belongs to the family of Deadly Fighters. When you flip it to its INACTIVE side, the Epic Assassin:"), "<br> \n                &nbsp; ").concat(_("MUST first move 1 space by land."), "<br> \n                &nbsp; ").concat(_("THEN, it removes 1 of the opponent's Basic Fighters or Mercenary Fighters from the same Territory. This Fighter is returned to its colored bag and can rejoin the battle later."));
            case 13: return _("When you flip it to its INACTIVE side, the Impatient takes the Initiative marker and places it on its own Territory or an adjacent Territory.");
            case 14: return _("This creature belongs to the family of Deadly Fighters. When you flip the Bomber to its INACTIVE side, remove 1 of your opponent's Basic Fighters or Mercenary Fighters from anywhere on the Battlefield. This Fighter is returned to its colored bag and can rejoin the battle later.");
            case 15: return "".concat(_("When you flip it to its INACTIVE side, the Weaver:"), "<br> \n                &nbsp; ").concat(_("- cannot move."), "<br> \n                &nbsp; ").concat(_("- captures all enemy Fighters inside its Territory. It's still possible for enemy Fighters to enter this Territory by air or by land, but it's not possible to leave the Territory as long as the Weaver is flipped to its INACTIVE side. The Weaver does not affect allied Fighters."));
            case 16: return "".concat(_("When you flip it to its INACTIVE side, the Rootspring:"), "<br> \n                &nbsp; ").concat(_("- cannot move."), "<br> \n                &nbsp; ").concat(_("- spreads its roots all around its Territory, preventing enemy Fighters from entering or leaving the Territory by land."));
            case 17: return _("When you flip the Hypnotist to its INACTIVE side, flip the enemy Fighters of your choice - in or adjacent to its Territory - to their INACTIVE side.");
            case 18: return _("While it's ACTIVE, the Metamorph cannot move during phase 3 Issuing Orders (but it can still be targeted by a Pusher). When you flip it to its INACTIVE side, it transforms into a Fighter with a Combat Strength of 3 that can move by land.");
            case 21: return _("Remove 2 enemy Fighters (Basic or Mercenary) from 2 different Territories of the Battlefield. These Fighters are returned to their colored bag and can rejoin the battle later.");
            case 22: return _("Choose a Territory: remove all Fighters present there (yours and your opponent’s). These Fighters are returned to their colored bags and can rejoin the battle later.");
            case 23: return _("Swap the positions of 2 of your Fighters on the Battlefield.");
            case 31: return _("Receive 1 Objective token if you have 2 Discovery tokens at the end of the game, and 1 additional Objective token for each additional Discovery token.");
            case 32: return _("Receive 1 Objective token if you control 2 Winter Territories at the end of the game, and 1 additional Objective token for each additional Winter Territory you control.");
            case 33: return _("Receive 1 Objective token for each of your Territories containing 2 Shroomlings at the end of the game, and 1 additional Objective token for each additional Shroomling in those Territories.");
        }
    };
    CardsManager.prototype.getTooltip = function (subType, side) {
        var html = "<h3>".concat(this.getName(subType), "</h3>\n        ").concat(subType < 20 ? "".concat(_("Combat Strength:"), " <strong>").concat(this.getStrength(subType), " <div class=\"strength-icon\"></div></strong>") : '', "\n        <p>").concat(this.getDescription(subType), "</p>\n        ");
        if (side && subType > 2 && subType < 20) {
            html += "<p><strong>".concat(_('Side:'), "</strong>  ").concat(side, "</p>");
        }
        return html;
    };
    CardsManager.prototype.getCurrentStrength = function (fighter) {
        if (fighter.played) {
            if ([15, 16].includes(fighter.subType) /* Rootspring, Weaver */) {
                return 1;
            }
            else if (fighter.subType == 18 /* Metamorph */) {
                return 3;
            }
        }
        return this.getNotPlayedStrength(fighter.subType);
    };
    return CardsManager;
}(CardManager));
var DiscoverTilesManager = /** @class */ (function (_super) {
    __extends(DiscoverTilesManager, _super);
    function DiscoverTilesManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "discover-tile-".concat(card.id); },
            setupDiv: function (card, div) { return div.classList.add('discover-tile'); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) {
                div.id = "discover-tile-".concat(card.id, "-back");
                _this.game.setTooltip(div.id, _('Discover tile'));
            }
        }) || this;
        _this.game = game;
        return _this;
    }
    DiscoverTilesManager.prototype.setupFrontDiv = function (card, div) {
        div.id = "discover-tile-".concat(card.id, "-front");
        if (card.type) {
            div.dataset.type = '' + card.type;
            div.dataset.subType = '' + card.subType;
        }
        this.game.setTooltip(div.id, this.getTooltip(card.type, card.subType));
    };
    DiscoverTilesManager.prototype.getName = function (type, subType) {
        switch (type) {
            case 1: return _("Loot");
            case 2:
                switch (subType) {
                    case 1: return _("Interference");
                    case 2: return _("Planning");
                    case 3: return _("Paratrooper");
                    case 4: return _("Priority Message");
                    case 5: return _("Foul Play");
                }
        }
    };
    DiscoverTilesManager.prototype.getDescription = function (type, subType) {
        switch (type) {
            case 1: return _("When you reveal a Loot token, leave it on its Territory until one of the clans is able to claim it. Each Loot token is worth 3 to 5 Lumen. To permanently claim a Loot token on a Territory, the combined Combat Strength of one clan's Fighters in that Territory must be bigger than the other clan's combined Combat Strength, with a difference that's equal to or higher than the number of Lumen on the Loot token. If your opponent has no Fighters on the Territory, their Combat Strength is 0. In that case, the combined Combat Strength of your Fighters must be equal to the number on the Loot token before you can claim it. As soon as a clan meets the condition, they claim the Loot token and will score its VP at the end of the game.");
            case 2:
                switch (subType) {
                    case 1: return _("When you reveal this token, discard it.") + ' ' + _("Immediately destroy 1 cell of your choice on your opponent's Command board by barring it.");
                    case 2: return _("When you reveal this token, place it face up next to your Command board.") + ' ' + _("On a future turn in which you are the first player, you may discard it. If you do, you don't have to roll the dice. Instead, you may freely choose their values!");
                    case 3: return _("When you reveal this token, discard it.") + ' ' + _("Draw a Fighter from your bag at random, and immediately add it to this Territory as a Reinforcement.");
                    case 4: return _("When you reveal this token, discard it.") + ' ' + _("Immediately cross off the leftmost available box of the High Command area on your Command board. Apply the effects of this box, if any.");
                    case 5: return _("When you reveal this token, place it face up next to your Command board.") + ' ' + _("During phase 3 Issuing Orders, each Foul Play token you discard allows you to gain an extra action (Move a Fighter by land or by air, Activate a special ability, or Apply the effect of a Glow Action token). If you have both Foul Play tokens, you’re allowed to use both of them during the same turn in order to gain 2 additional free actions.");
                }
        }
    };
    DiscoverTilesManager.prototype.getTooltip = function (type, subType) {
        return "<h3>".concat(this.getName(type, subType), "</h3>\n        <p>").concat(this.getDescription(type, subType), "</p>\n        ");
    };
    return DiscoverTilesManager;
}(CardManager));
var ObjectiveTokensManager = /** @class */ (function (_super) {
    __extends(ObjectiveTokensManager, _super);
    function ObjectiveTokensManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "objective-token-".concat(card.id); },
            setupDiv: function (card, div) { return div.classList.add('objective-token'); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); }
        }) || this;
        _this.game = game;
        return _this;
    }
    ObjectiveTokensManager.prototype.setupFrontDiv = function (card, div) {
        if (card.lumens) {
            div.dataset.lumens = '' + card.lumens;
        }
    };
    return ObjectiveTokensManager;
}(CardManager));
var Territory = /** @class */ (function () {
    function Territory(id, x, y, width, height, curve) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.curve = curve;
    }
    return Territory;
}());
var Battlefield = /** @class */ (function () {
    function Battlefield(id, territories) {
        this.id = id;
        this.territories = territories;
    }
    return Battlefield;
}());
var BattlefieldPosition = /** @class */ (function () {
    function BattlefieldPosition(battlefieldId, x, y, rotation) {
        this.battlefieldId = battlefieldId;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
    return BattlefieldPosition;
}());
var BATTLEFIELDS = [
    null,
    new Battlefield(1, [
        new Territory(11, 24, 0, 303, 291, [[1, 1], [3, 2], [5, 9], [12, 8]]),
        new Territory(15, 0, 150, 408, 537, [[1, 1], [3, 3], [9, 5], [10, 6], [7, 9], [6, 12]]),
    ]),
    new Battlefield(2, [
        new Territory(27, 0, 0, 423, 708, [[2, 1], [4, 4], [9, 5], [9, 8], [5, 10]]),
    ]),
    new Battlefield(3, [
        new Territory(31, 82, 330, 337, 378, [[9, 0], [8, 4], [3, 10]]),
        new Territory(33, 0, 0, 417, 382, [[2, 1], [4, 8], [11, 8]]),
    ]),
    new Battlefield(4, [
        new Territory(41, 226, 129, 198, 384, [[4, 1], [8, 6], [9, 12]]),
        new Territory(45, 0, 0, 333, 708, [[3, 1], [4, 4], [9, 6], [9, 9], [8, 11]]),
    ]),
    new Battlefield(5, [
        new Territory(51, 0, 0, 264, 378, [[3, 1], [6, 6], [8, 11]]),
        new Territory(53, 222, 127, 195, 277, [[6, 1], [6, 6], [7, 11]]),
        new Territory(54, 82, 378, 339, 330, [[11, 1], [5, 6], [4, 9]]),
    ]),
    new Battlefield(6, [
        new Territory(61, 82, 423, 219, 285, [[10, 0], [5, 6], [10, 12]]),
        new Territory(63, 0, 0, 225, 267, [[3, 1], [6, 6], [8, 11]]),
        new Territory(65, 66, 129, 355, 442, [[1, 4], [3, 5], [7, 3], [9, 4], [8, 6], [10, 11]]),
    ]),
    new Battlefield(7, [
        new Territory(71, 79, 339, 258, 309, [[11, 1], [8, 4], [2, 10]]),
        new Territory(73, 0, 0, 316, 394, [[2, 1], [3, 2], [3, 6], [5, 9], [11, 10]]),
        new Territory(75, 120, 12, 303, 696, [[1, 1], [2, 3], [3, 4], [8, 3], [9, 5], [10, 8], [6, 9], [5, 10], [4, 11]]),
    ]),
];
var ObjectiveTokenPosition = /** @class */ (function () {
    function ObjectiveTokenPosition(letter, x, y) {
        this.letter = letter;
        this.x = x;
        this.y = y;
    }
    return ObjectiveTokenPosition;
}());
var ObjectiveDescription = /** @class */ (function () {
    function ObjectiveDescription(visibleLetters, letters, timing, type, text) {
        this.visibleLetters = visibleLetters;
        this.letters = letters;
        this.timing = timing;
        this.type = type;
        this.text = text;
    }
    return ObjectiveDescription;
}());
var ScenarioInfos = /** @class */ (function () {
    function ScenarioInfos(battlefields, objectiveTokens, title, synopsis, specialRules, objectives, diceLeft) {
        this.battlefields = battlefields;
        this.objectiveTokens = objectiveTokens;
        this.title = title;
        this.synopsis = synopsis;
        this.specialRules = specialRules;
        this.objectives = objectives;
        this.diceLeft = diceLeft;
    }
    return ScenarioInfos;
}());
var Scenario = /** @class */ (function (_super) {
    __extends(Scenario, _super);
    function Scenario(number) {
        return _super.call(this, Scenario.getBattlefields(number), Scenario.getObjectiveTokens(number), Scenario.getTitle(number), Scenario.getSynopsis(number), Scenario.getSpecialRules(number), Scenario.getObjectives(number), Scenario.getDiceLeft(number)) || this;
    }
    Scenario.getBattlefields = function (number) {
        switch (number) {
            case 0:
                return [
                    new BattlefieldPosition(1, 0, 0, 0),
                    new BattlefieldPosition(2, 423 * 1, 0, 0),
                    new BattlefieldPosition(3, 423 * 2, 0, 0),
                    new BattlefieldPosition(4, 423 * 3, 0, 0),
                    new BattlefieldPosition(5, 423 * 4, 0, 0),
                    new BattlefieldPosition(6, 423 * 5, 0, 0),
                    new BattlefieldPosition(7, 423 * 6, 0, 0),
                ];
            case 1:
                return [
                    new BattlefieldPosition(1, 452, 1, 180),
                    new BattlefieldPosition(2, 824, 319, 270),
                    new BattlefieldPosition(3, 1246, 584, 90),
                    new BattlefieldPosition(4, 54, 31, 0),
                    new BattlefieldPosition(5, 903, 662, 180),
                    new BattlefieldPosition(6, 1276, 981, 270),
                    new BattlefieldPosition(7, 133, 375, 90),
                ];
            case 2:
                return [
                    new BattlefieldPosition(1, 1037, -133, 270),
                    new BattlefieldPosition(2, 373, 319, 270),
                    new BattlefieldPosition(3, 1459, 132, 90),
                    new BattlefieldPosition(4, 1116, 210, 180),
                    new BattlefieldPosition(5, 796, 583, 90),
                    new BattlefieldPosition(6, 0, 0, 180),
                    new BattlefieldPosition(7, 717, 240, 0),
                ];
            case 3:
                return [
                    new BattlefieldPosition(1, 259, 207, 180),
                    new BattlefieldPosition(2, 180, -135, 270),
                    new BattlefieldPosition(3, 1096, 838, 90),
                    new BattlefieldPosition(4, 1018, 495, 0),
                    new BattlefieldPosition(5, 1414, 465, 180),
                    new BattlefieldPosition(6, 675, 573, 270),
                    new BattlefieldPosition(7, 601, 128, 90),
                ];
            case 4:
                return [
                    new BattlefieldPosition(1, 838, 894, 180),
                    new BattlefieldPosition(2, 1080, -135, 270),
                    new BattlefieldPosition(3, 168, 564, 90),
                    new BattlefieldPosition(4, 89, 222, 0),
                    new BattlefieldPosition(5, 1159, 207, 180),
                    new BattlefieldPosition(6, 199, 961, 270),
                    new BattlefieldPosition(7, 1181, 816, 90),
                ];
            case 5:
                return [
                    new BattlefieldPosition(1, 0, 451, 180),
                    new BattlefieldPosition(3, 342, 373, 90),
                    new BattlefieldPosition(4, 1034, 319, 270),
                    new BattlefieldPosition(5, 373, 771, 270),
                    new BattlefieldPosition(6, 661, 0, 180),
                    new BattlefieldPosition(7, 713, 693, 0),
                ];
            case 6:
                return [
                    new BattlefieldPosition(1, 153, 796, 90),
                    new BattlefieldPosition(3, 810, 344, 90),
                    new BattlefieldPosition(4, 840, 742, 270),
                    new BattlefieldPosition(5, 466, 423, 180),
                    new BattlefieldPosition(6, 388, 79, 270),
                    new BattlefieldPosition(7, 731, 0, 0),
                ];
            case 7:
                return [
                    new BattlefieldPosition(1, 342, 826, 90),
                    new BattlefieldPosition(2, 1004, 375, 90),
                    new BattlefieldPosition(3, 661, 453, 180),
                    new BattlefieldPosition(4, 1697, 319, 270),
                    new BattlefieldPosition(5, 1324, 1, 180),
                    new BattlefieldPosition(6, 0, 906, 180),
                    new BattlefieldPosition(7, 2041, 240, 0),
                ];
        }
    };
    Scenario.getObjectiveTokens = function (number) {
        switch (number) {
            case 0:
                return [];
            case 1:
                return [
                    new ObjectiveTokenPosition('A', 286, 772),
                    new ObjectiveTokenPosition('B', 1570, 1205),
                ];
            case 2:
                return [];
            case 3:
                return [
                    new ObjectiveTokenPosition('A', 746, 530),
                    new ObjectiveTokenPosition('B', 1042, 782),
                ];
            case 4:
                return [];
            case 5:
                return [
                    new ObjectiveTokenPosition('A', 273, 1088),
                    new ObjectiveTokenPosition('B', 920, 780),
                    new ObjectiveTokenPosition('C', 890, 24),
                ];
            case 6:
                return [
                    new ObjectiveTokenPosition('A', 824, 418),
                    new ObjectiveTokenPosition('B', 654, 988),
                ];
            case 7:
                return [
                    new ObjectiveTokenPosition('A', 1382, 256),
                ];
        }
    };
    Scenario.getTitle = function (number) {
        switch (number) {
            case 0: return '';
            case 1: return _("A - First contact");
            case 2: return _("B - Disturbance on the western front");
            case 3: return _("C - A territory too far");
            case 4: return _("D - Isles of promise");
            case 5: return _("E - After the flood");
            case 6: return _("F - The winter soldier");
            case 7: return _("G - The great crossing");
        }
    };
    Scenario.getSynopsis = function (number) {
        switch (number) {
            case 0: return '';
            case 1: return _("No one really knows exactly how or why it all began. And yet, the tale of this first battle is still deeply etched in our memories. Ever since, at every dusk and every dawn, the Night and Day clans battle for control over the Lumen, trying to tip the balance of the Lost World in THEIR favor.");
            case 2: return _("All of the intel our spies have gathered points to the same conclusion. If we want to get the upper hand in this battle, we need to move West, and take control of the coveted Spring Territory and its seven Lumen. To the victor go the spoils.");
            case 3: return _("In order to access these highly coveted Territories, we’ll have to go far... Very far. All the way across the river. Luckily, nothing is impossible when you have wings!");
            case 4: return _("The battle has found its way to the Archipelago. It's time to put your Shroomlings to good use. Although the other fighters like to mock them for their puny appearance, Shroomlings are the only creatures able to freely move from one island to another. For this purpose, they use a network of small, underground passages connecting the Winter Territories to the islets of the Archipelago.");
            case 5: return _("The conflict is getting bogged down... Literally and figuratively. There seems to be no end to the fighting, and now a cold and heavy rain has transformed the Lost World and its battlefields into an inextricable swamp. Well... Not for everyone. The Mudshells are delighted! Use them to your advantage.");
            case 6: return _("Winter is here. An icy cold slows down the advancements of even the bravest of troops. And yet... These Winter Territories offer a decisive advantage to whoever has the most Fighters there at the end of the battle.");
            case 7: return _("Infiltrating the enemy and stealing their secret plans is a sure-fire way to achieve victory. Will one of your Fighters be able to accomplish this difficult mission, even though the morning fog makes flying over the Spring Territory impossible?");
        }
    };
    Scenario.getSpecialRules = function (number) {
        switch (number) {
            case 0:
            case 1:
            case 2:
                return [];
            case 3:
                return [
                    _("Crossing the river by land costs 2 actions."),
                    _("However, you can also move by air over the river."),
                    _("A Fighter that gets pushed into the river is returned to its colored bag and can rejoin the battle later."),
                ];
            case 4:
                return [
                    _("Players can use the special abilities of their Fighters and Glow Actions on the islands themselves, but not from one island to another."),
                    _("UNDERGROUND PASSAGES - Shroomlings can move by land from one Winter Territory to another, even if those spaces are located on different islands."),
                ];
            case 5:
                return [
                    _("Moving by air is not allowed."),
                    _("The Mudshells can move by land."),
                    _("The Summer Territories (green) are muddy. Leaving these spaces is impossible, except for the Mudshells, or by getting pushed."),
                ];
            case 6:
                return [
                    _("Fighters inside the Winter Territories are unable to activate their special abilities."),
                ];
            case 7:
                return [
                    _("Moving by air to, from, or over the Spring Territory is not allowed."),
                ];
        }
    };
    Scenario.getObjectives = function (number) {
        var DURING_GAME = _('During the game:');
        var END_GAME = _('At the end of the game:');
        var FRONTIERS = _("FRONTIERS") + ' - ';
        switch (number) {
            case 0: [];
            case 1: return [
                new ObjectiveDescription([''], ['1'], DURING_GAME, null, _("The first player to deploy a <i>Mercenary Fighter</i> to the Battlefield receives an Objective token.")),
                new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 3 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
                new ObjectiveDescription([''], ['3'], END_GAME, null, _("The player with the Initiative marker at the end of the game receives an Objective token.")),
            ];
            case 2: return [
                new ObjectiveDescription(['', ''], ['1'], DURING_GAME, null, _("Each player who manages to empty their colored bag receives 2 Objective tokens (maximum once per player).")),
                new ObjectiveDescription([''], ['2'], END_GAME, null, _("The player with the fewest cells on their Command board that aren't part of an Area or a Chain of Orders receives an Objective token*. In case of a tie, neither player receives the Objective token.")),
            ];
            case 3: return [
                new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 3 border Territories marked A or the 3 border Territories marked B immediately receives an Objective token.")),
            ];
            case 4: return [
                new ObjectiveDescription([''], ['10', '11', '12'], null, null, _("The player with the most Fighters on it receives an Objective token. In case of a tie, neither player receives an Objective token.")),
                new ObjectiveDescription(['+1'], ['20', '21', '22'], null, null, _("if you are alone on the island, you receive an additional Objective token!")),
            ];
            case 5: return [
                new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
                new ObjectiveDescription(['C'], ['C'], DURING_GAME, null, _("The first player to reach this Winter Territory receives an Objective token.")),
            ];
            case 6: return [
                new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
                new ObjectiveDescription(['', ''], ['2'], END_GAME, null, _("The player with the most Fighters in the Winter Territories receives 2 Objective tokens. In case of a tie, neither player receives the Objective tokens.")),
            ];
            case 7: return [
                new ObjectiveDescription(['A'], ['A'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A immediately receives an Objective token.")),
                new ObjectiveDescription(['', '', ''], ['2'], DURING_GAME, _("THE GREAT CROSSING") + ' - ', _("The first player to move a Fighter into their opponent's starting Territory receives 3 Objective tokens.")),
            ];
        }
    };
    Scenario.getDiceLeft = function (number) {
        switch (number) {
            case 0:
            case 1: return 1050;
            case 2: return 450;
            case 3: return 1050;
            case 4: return 450;
            case 5:
            case 6: return 150;
            case 7: return 450;
        }
    };
    return Scenario;
}(ScenarioInfos));
var CARD_WIDTH = 100;
var CARD_HEIGHT = 100;
var CARD_DISTANCE = 125;
var DiscoverTileStock = /** @class */ (function (_super) {
    __extends(DiscoverTileStock, _super);
    function DiscoverTileStock(manager, element, updateDisplay) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        return _this;
    }
    DiscoverTileStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay();
        return promise;
    };
    DiscoverTileStock.prototype.cardRemoved = function (card) {
        _super.prototype.cardRemoved.call(this, card);
        this.updateDisplay();
    };
    return DiscoverTileStock;
}(CardStock));
var TerritoryStock = /** @class */ (function (_super) {
    __extends(TerritoryStock, _super);
    function TerritoryStock(manager, element, curve, rotation, territoryId) {
        var _this = _super.call(this, manager, element, undefined, function () { return _this.manualPosition(); }) || this;
        _this.manager = manager;
        _this.element = element;
        _this.curve = curve;
        _this.rotation = rotation;
        _this.territoryId = territoryId;
        _this.pathLength = 0;
        element.classList.add('territory-stock');
        if ([90, 270].includes(rotation)) {
            _this.rotateCoordinates();
        }
        if (rotation >= 180) {
            _this.flipCoordinates();
        }
        _this.curve = _this.curve.map(function (point) { return [point[0] * element.clientWidth / 12, point[1] * element.clientHeight / 12]; });
        _this.discoverTileStockDiv = document.createElement('div');
        _this.discoverTileStockDiv.id = "territory-".concat(territoryId, "-discover-tiles");
        _this.discoverTileStockDiv.classList.add('discover-tile-stock');
        element.appendChild(_this.discoverTileStockDiv);
        _this.discoverTileStock = new DiscoverTileStock(_this.manager.game.discoverTilesManager, _this.discoverTileStockDiv, function () { return _this.manualPosition(); });
        for (var i = 1; i < _this.curve.length; i++) {
            _this.pathLength += _this.getPathLength(_this.curve[i - 1], _this.curve[i]);
        }
        _this.element.addEventListener('click', function () { var _a; return (_a = _this.onAnyClick) === null || _a === void 0 ? void 0 : _a.call(_this); });
        // this.debugShowCurveCanvas();
        _this.strengthCounter = document.createElement('div');
        _this.strengthCounter.classList.add('strength-counter');
        _this.strengthCounter.dataset.visible = 'false';
        _this.strengthCounter.innerHTML = "\n            <div><span id=\"strength-counter-".concat(territoryId, "-orange\" style=\"--color: #f28700;\"></span> <div class=\"strength-icon\"></div></div>\n            <div><span id=\"strength-counter-").concat(territoryId, "-blue\" style=\"--color: #1f3067;\"></span> <div class=\"strength-icon\"></div></div>\n        ");
        element.appendChild(_this.strengthCounter);
        return _this;
    }
    TerritoryStock.prototype.addInitiativeMarker = function () {
        this.initiativeMarker = true;
        this.element.appendChild(document.getElementById("initiative-marker"));
        this.manualPosition();
    };
    TerritoryStock.prototype.initiativeMarkerRemoved = function () {
        this.initiativeMarker = false;
        this.manualPosition();
    };
    TerritoryStock.prototype.setCardVisible = function (card, visible, settings) {
        _super.prototype.setCardVisible.call(this, card, visible, settings);
        // to update stength when a fighter is flipped in case strength has changed
        this.manualPosition();
    };
    TerritoryStock.prototype.rotateCoordinates = function () {
        this.curve = this.curve.slice();
        for (var i = 0; i < this.curve.length; i++) {
            this.curve[i] = [12 - this.curve[i][1], this.curve[i][0]];
        }
    };
    TerritoryStock.prototype.flipCoordinates = function () {
        this.curve = this.curve.slice().reverse();
        for (var i = 0; i < this.curve.length; i++) {
            this.curve[i] = [12 - this.curve[i][0], 12 - this.curve[i][1]];
        }
    };
    TerritoryStock.prototype.manualPosition = function () {
        var _this = this;
        var elements = this.getElements();
        elements.forEach(function (cardDiv, index) {
            var _a = _this.getCoordinates(index, elements.length), x = _a.x, y = _a.y, scale = _a.scale;
            cardDiv.style.left = "".concat(x - CARD_WIDTH / 2, "px");
            cardDiv.style.top = "".concat(y - CARD_HEIGHT / 2, "px");
            cardDiv.style.transform = scale === 1 ? '' : "scale(".concat(scale, ")");
        });
    };
    TerritoryStock.prototype.getElements = function () {
        var _this = this;
        var cards = this.getCards();
        var elements = cards.map(function (card) { return _this.getCardElement(card); });
        var showStrengthCounter = this.showStrengthCounter(cards);
        this.strengthCounter.dataset.visible = showStrengthCounter.toString();
        if (showStrengthCounter) {
            elements.unshift(this.getStrengthCounter(cards));
        }
        if (!this.discoverTileStock.isEmpty()) {
            elements.push(this.discoverTileStockDiv);
        }
        if (this.initiativeMarker) {
            elements.push(document.getElementById("initiative-marker"));
        }
        return elements;
    };
    TerritoryStock.prototype.showStrengthCounter = function (cards) {
        return cards.length >= 3 && cards.map(function (card) { return card.playerId; }).filter(function (value, index, self) { return self.indexOf(value) === index; }).length > 1;
    };
    TerritoryStock.prototype.getStrengthCounter = function (cards) {
        var _this = this;
        var strengthes = {};
        cards.forEach(function (card) {
            if (!strengthes[card.playerId]) {
                strengthes[card.playerId] = 0;
            }
            strengthes[card.playerId] += _this.manager.getCurrentStrength(card);
        });
        var totalStrength = Object.values(strengthes).reduce(function (a, b) { return a + b; }, 0);
        var orangePlayerId = this.manager.game.getPlayerIdByColor('f28700');
        var bluePlayerId = this.manager.game.getPlayerIdByColor('1f3067');
        var orangePlayerStrength = strengthes[orangePlayerId];
        document.getElementById("strength-counter-".concat(this.territoryId, "-orange")).innerHTML = strengthes[orangePlayerId];
        document.getElementById("strength-counter-".concat(this.territoryId, "-blue")).innerHTML = strengthes[bluePlayerId];
        this.strengthCounter.style.setProperty('--percent', "".concat(orangePlayerStrength * 100 / totalStrength, "%"));
        return this.strengthCounter;
    };
    TerritoryStock.prototype.getPathCoordinates = function (cardPathLength) {
        var currentDistance = 0;
        for (var i = 1; i < this.curve.length; i++) {
            var segmentLength = this.getPathLength(this.curve[i - 1], this.curve[i]);
            var newDistance = currentDistance + segmentLength;
            if (cardPathLength >= currentDistance && cardPathLength <= newDistance || i === this.curve.length - 1) {
                var relativeDistance = (cardPathLength - currentDistance) / segmentLength;
                var x = this.curve[i - 1][0] + (this.curve[i][0] - this.curve[i - 1][0]) * relativeDistance;
                var y = this.curve[i - 1][1] + (this.curve[i][1] - this.curve[i - 1][1]) * relativeDistance;
                return { x: x, y: y };
            }
            else {
                currentDistance = newDistance;
            }
        }
    };
    TerritoryStock.prototype.getCoordinates = function (index, elementLength) {
        var halfPathLength = this.pathLength / 2;
        var cardDistance = CARD_DISTANCE;
        var maxDistance = this.pathLength - CARD_DISTANCE;
        var scale = 1;
        if ((elementLength - 1) * cardDistance > maxDistance) {
            cardDistance = Math.floor(maxDistance / (elementLength - 1));
            scale = (cardDistance * 2 + CARD_DISTANCE) / (CARD_DISTANCE * 3);
        }
        var cardPathLength = halfPathLength + cardDistance * (index - elementLength / 2) + CARD_DISTANCE / 4;
        return __assign(__assign({}, this.getPathCoordinates(cardPathLength)), { scale: scale });
    };
    TerritoryStock.prototype.getPathLength = function (point1, point2) {
        var x = point1[0] - point2[0];
        var y = point1[1] - point2[1];
        return Math.hypot(x, y);
    };
    TerritoryStock.prototype.debugShowCurveCanvas = function () {
        ///*if (this.canvasWidth == 708) {
        //var cv = document.getElementById("curveCanvas") as HTMLCanvasElement;
        var cv = document.createElement('canvas');
        this.element.prepend(cv);
        cv.setAttribute('width', "".concat(this.element.clientWidth));
        cv.setAttribute('height', "".concat(this.element.clientHeight));
        var points = this.curve;
        var ctx = cv.getContext("2d");
        ctx.lineWidth = 3;
        for (var i = 0; i < points.length; i++) {
            //var x_mid = (points[i][0] + points[i+1][0]) / 2 * this.curveXScale;
            //var y_mid = (points[i][1] + points[i+1][1]) / 2 * this.curveYScale;
            //var cp_x1 = (x_mid + points[i][0] * this.curveXScale) / 2;
            //var cp_x2 = (x_mid + points[i+1][0] * this.curveXScale) / 2;
            //ctx.quadraticCurveTo(cp_x1,points[i][1] * this.curveYScale ,x_mid, y_mid);
            //ctx.quadraticCurveTo(cp_x2,points[i+1][1] * this.curveYScale,points[i+1][0] * this.curveXScale, points[i+1][1] * this.curveYScale);
            ctx[i == 0 ? 'moveTo' : 'lineTo'](points[i][0], points[i][1]);
        }
        ctx.stroke();
        //}*/
    };
    return TerritoryStock;
}(ManualPositionStock));
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.territoriesStocks = [];
        var scenario = game.scenario;
        if (gamedatas.scenario == 3) {
            this.addRiver();
        }
        this.addBattlefields(scenario.battlefields);
        var realizedLetters = gamedatas.realizedObjectives.map(function (realizedObjectives) { return realizedObjectives.letter; });
        this.addObjectiveTokens(scenario.objectiveTokens, realizedLetters);
        this.addInitiativeMarker(gamedatas.initiativeMarkerTerritory);
        gamedatas.fightersOnTerritories.forEach(function (card) { return _this.territoriesStocks[card.locationArg].addCard(card, undefined, { visible: !card.played }); });
        gamedatas.discoverTilesOnTerritories.forEach(function (discoverTile) { return _this.territoriesStocks[discoverTile.locationArg].discoverTileStock.addCard(discoverTile, undefined, { visible: discoverTile.visible }); });
        this.setMapSize(scenario.battlefields);
    }
    TableCenter.prototype.addRiver = function () {
        var _this = this;
        var map = document.getElementById("map");
        var river = document.createElement('div');
        river.id = "river";
        river.addEventListener('click', function () { return _this.game.territoryClick(0); });
        map.appendChild(river);
    };
    TableCenter.prototype.addBattlefields = function (battlefields) {
        var _this = this;
        var map = document.getElementById("map");
        battlefields.forEach(function (battlefieldInfos) {
            var battlefield = document.createElement('div');
            battlefield.id = "battlefield-".concat(battlefieldInfos.battlefieldId);
            battlefield.dataset.id = "".concat(battlefieldInfos.battlefieldId);
            battlefield.classList.add('battlefield');
            battlefield.style.setProperty('--x', "".concat(battlefieldInfos.x, "px"));
            battlefield.style.setProperty('--y', "".concat(battlefieldInfos.y, "px"));
            battlefield.style.setProperty('--rotation', "".concat(battlefieldInfos.rotation, "deg"));
            var background = document.createElement('div');
            background.dataset.id = "".concat(battlefieldInfos.battlefieldId);
            background.classList.add('battlefield-background');
            background.style.setProperty('--x', "".concat(battlefieldInfos.x, "px"));
            background.style.setProperty('--y', "".concat(battlefieldInfos.y, "px"));
            background.style.setProperty('--rotation', "".concat(battlefieldInfos.rotation, "deg"));
            map.appendChild(background);
            map.appendChild(battlefield);
            _this.addTerritories(BATTLEFIELDS[battlefieldInfos.battlefieldId].territories, battlefield, battlefieldInfos.rotation);
            if ([90, 270].includes(battlefieldInfos.rotation)) {
                battlefield.style.marginBottom = "-143px";
                background.style.marginBottom = "-143px";
            }
        });
    };
    TableCenter.prototype.addTerritories = function (territories, battlefield, rotation) {
        var _this = this;
        territories.forEach(function (territoryInfos) {
            var territory = document.createElement('div');
            territory.id = "territory-".concat(territoryInfos.id);
            territory.dataset.id = '' + territoryInfos.id;
            territory.dataset.lumens = '' + (territoryInfos.id % 10);
            territory.classList.add('territory');
            var angle90 = rotation % 180 == 90;
            var deltaX = 0;
            var deltaY = 0;
            if (angle90) {
                var diff = (territoryInfos.height - territoryInfos.width) / 2;
                deltaX = -diff;
                deltaY = diff;
            }
            territory.style.setProperty('--x', "".concat(territoryInfos.x + deltaX, "px"));
            territory.style.setProperty('--y', "".concat(territoryInfos.y + deltaY, "px"));
            territory.style.setProperty('--width', "".concat(angle90 ? territoryInfos.height : territoryInfos.width, "px"));
            territory.style.setProperty('--height', "".concat(angle90 ? territoryInfos.width : territoryInfos.height, "px"));
            var vertical = territoryInfos.height > territoryInfos.width;
            if (angle90) {
                vertical = !vertical;
            }
            territory.dataset.vertical = vertical.toString();
            territory.innerHTML = "\n            <div id=\"territory-".concat(territoryInfos.id, "-fighters\"></div>\n            ");
            battlefield.appendChild(territory);
            var territoryMask = document.createElement('div');
            territoryMask.id = "territory-mask-".concat(territoryInfos.id);
            territoryMask.dataset.id = '' + territoryInfos.id;
            territoryMask.classList.add('territory-mask');
            battlefield.prepend(territoryMask);
            _this.game.setTooltip(territoryMask.id, _this.game.getTerritoryTooltip(territoryInfos.id % 10 == 4 ? 3 : territoryInfos.id % 10));
            territoryMask.addEventListener('click', function () { return _this.game.territoryClick(territoryInfos.id); });
            _this.territoriesStocks[territoryInfos.id] = new TerritoryStock(_this.game.cardsManager, document.getElementById("territory-".concat(territoryInfos.id, "-fighters")), territoryInfos.curve, rotation, territoryInfos.id);
            _this.territoriesStocks[territoryInfos.id].onCardClick = function (card) {
                var selectableCards = _this.game.getChooseFighterSelectableMoveActivateCards();
                var canClick = selectableCards === null || selectableCards === void 0 ? void 0 : selectableCards.some(function (fighter) { return fighter.id == card.id; });
                if (canClick) {
                    _this.territoryFighterClick(card);
                }
                else {
                    _this.territoriesStocks[territoryInfos.id].unselectCard(card);
                }
            };
            _this.territoriesStocks[territoryInfos.id].onAnyClick = function () {
                if (_this.game.gamedatas.gamestate.name == 'chooseTerritory') {
                    _this.game.territoryClick(territoryInfos.id);
                }
                else {
                    _this.territoriesStocks[territoryInfos.id].addCards([
                        { id: 1000 * territoryInfos.id + 1, type: 1, subType: 3, played: false, playerId: 2343492, location: 'territory', locationArg: territoryInfos.id },
                    ]);
                }
            };
            /*// TODO TEMP
            this.territoriesStocks[territoryInfos.id].addCards([
                { id: 1000 * territoryInfos.id + 1, type: 1, subType: 3, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 2, type: 1, subType: 1, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 3, type: 1, subType: 2, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
            ])*/
        });
    };
    TableCenter.prototype.addObjectiveTokens = function (objectiveTokens, realizedLetters) {
        var map = document.getElementById("map");
        objectiveTokens.filter(function (objectiveTokenInfos) { return !realizedLetters.includes(objectiveTokenInfos.letter); }).forEach(function (objectiveTokenInfos) {
            var objectiveToken = document.createElement('div');
            objectiveToken.id = "objective-token-".concat(objectiveTokenInfos.letter);
            objectiveToken.classList.add('objective-token', 'token-with-letter');
            objectiveToken.style.left = "".concat(objectiveTokenInfos.x, "px");
            objectiveToken.style.top = "".concat(objectiveTokenInfos.y, "px");
            objectiveToken.innerHTML = objectiveTokenInfos.letter.substring(0, 1);
            map.appendChild(objectiveToken);
        });
    };
    TableCenter.prototype.addInitiativeMarker = function (initiativeMarkerTerritory) {
        var territory = document.getElementById("territory-".concat(initiativeMarkerTerritory));
        this.initiativeMarker = document.createElement('div');
        this.initiativeMarker.id = "initiative-marker";
        territory.appendChild(this.initiativeMarker);
        this.territoriesStocks[initiativeMarkerTerritory].addInitiativeMarker();
    };
    TableCenter.prototype.moveInitiativeMarker = function (territoryId) {
        var previousTerritory = this.initiativeMarker.parentElement.parentElement;
        var territory = document.getElementById("territory-".concat(territoryId));
        this.game.animationManager.attachWithSlideAnimation(this.initiativeMarker, territory);
        this.territoriesStocks[Number(previousTerritory.dataset.id)].initiativeMarkerRemoved();
        this.territoriesStocks[territoryId].addInitiativeMarker();
    };
    TableCenter.prototype.moveFighter = function (fighter, territoryId, fromBag) {
        if (fromBag === void 0) { fromBag = false; }
        this.territoriesStocks[territoryId].addCard(fighter, fromBag ? { fromElement: document.getElementById("bag-".concat(fighter.playerId)) } : undefined, { visible: !fighter.played });
    };
    TableCenter.prototype.revealDiscoverTile = function (discoverTile) {
        this.game.discoverTilesManager.setCardVisible(discoverTile, true);
    };
    TableCenter.prototype.highlightDiscoverTile = function (discoverTile) {
        var _a;
        (_a = this.game.discoverTilesManager.getCardElement(discoverTile)) === null || _a === void 0 ? void 0 : _a.classList.add('highlight');
    };
    TableCenter.prototype.cancelFighterChoice = function () {
        var oldChoice = document.getElementById("fighter-choice");
        if (oldChoice) {
            oldChoice.parentElement.removeChild(oldChoice);
        }
    };
    TableCenter.prototype.createFighterChoice = function (card) {
        var _this = this;
        var element = this.game.cardsManager.getCardElement(card);
        var canMove = this.game.gamedatas.gamestate.args.possibleFightersToMove.some(function (moveFighter) { return moveFighter.id == card.id; });
        var canActivate = this.game.gamedatas.gamestate.args.possibleFightersToActivate.some(function (activateFighter) { return activateFighter.id == card.id; });
        var map = document.getElementById("map");
        var mapBR = map.getBoundingClientRect();
        var elemBR = element.getBoundingClientRect();
        var cumulativeZoom = Number(getComputedStyle(document.documentElement).getPropertyValue('--cumulative-scale'));
        var left = (elemBR.left - mapBR.left) / cumulativeZoom;
        var top = (elemBR.top - mapBR.top) / cumulativeZoom;
        var upper = top + 100 + 50 / cumulativeZoom > Number(map.dataset.height); // 50 = height + paddings
        dojo.place("<div id=\"fighter-choice\" class=\"".concat(upper ? 'upper' : '', "\" style=\"left: ").concat(left - 60, "px; top: ").concat(top + (upper ? -55 : 105), "px;\">\n            <button id=\"fighter-choice-move\" ").concat(canMove ? '' : ' disabled="disabled"', ">").concat(_('Move'), "</button>\n            <button id=\"fighter-choice-cancel\">\u2716</button>\n            <button id=\"fighter-choice-activate\" ").concat(canActivate ? '' : ' disabled="disabled"', ">").concat(_('Activate'), "</button>\n        </div>"), 'map');
        document.getElementById("fighter-choice-move").addEventListener('click', function () {
            _this.game.moveFighter(card.id);
            _this.cancelFighterChoice();
        });
        document.getElementById("fighter-choice-cancel").addEventListener('click', function () { return _this.cancelFighterChoice(); });
        document.getElementById("fighter-choice-activate").addEventListener('click', function () {
            _this.game.activateFighter(card.id);
            _this.cancelFighterChoice();
        });
    };
    TableCenter.prototype.territoryFighterClick = function (card) {
        this.cancelFighterChoice();
        if (this.game.gamedatas.gamestate.name !== 'chooseFighter') {
            return;
        }
        if (this.game.gamedatas.gamestate.args.move) {
            this.game.chooseFightersClick(card);
        }
        else {
            this.createFighterChoice(card);
        }
    };
    TableCenter.prototype.setSelectableCards = function (selectableCards, multiple) {
        if (multiple === void 0) { multiple = false; }
        this.territoriesStocks.forEach(function (stock) {
            stock.setSelectionMode(selectableCards.length ? (multiple ? 'multiple' : 'single') : 'none');
            stock.getCards().forEach(function (card) { return stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(function (c) { return c.id == card.id; })); });
        });
    };
    TableCenter.prototype.setSelectableTerritories = function (territoriesIds) {
        territoriesIds.forEach(function (territoryId) { var _a; return (_a = document.getElementById(territoryId ? "territory-mask-".concat(territoryId) : 'river')) === null || _a === void 0 ? void 0 : _a.classList.add('selectable'); });
    };
    TableCenter.prototype.setMapSize = function (battlefields) {
        var maxRight = 0;
        var maxBottom = 0;
        battlefields.forEach(function (battlefield) {
            var horizontal = [90, 270].includes(battlefield.rotation);
            var right = battlefield.x + (horizontal ? 708 : 566);
            var bottom = battlefield.y + (horizontal ? 566 : 708);
            if (right > maxRight) {
                maxRight = right;
            }
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        });
        var map = document.getElementById('map');
        //map.style.width = `${maxRight}px`;
        //map.style.height = `${maxBottom + 10}px`;
        map.dataset.width = "".concat(maxRight);
        map.dataset.height = "".concat(maxBottom + 10);
    };
    TableCenter.prototype.setFightersActivated = function (card, activated) {
        this.territoriesStocks[card.locationArg].setCardVisible(card, !activated);
    };
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var CIRCLE_WIDTH = 51;
var CIRCLES = [];
[1, 2, 3].forEach(function (index) { return CIRCLES[index] = [0, 145 + CIRCLE_WIDTH * (index == 3 ? 3 : index - 1)]; });
[4, 5, 6, 7, 8].forEach(function (index) { return CIRCLES[index] = [43, 120 + CIRCLE_WIDTH * (index - 4)]; });
[9, 10, 11, 12, 13, 14].forEach(function (index) { return CIRCLES[index] = [88, 45 + CIRCLE_WIDTH * (index - 9)]; });
CIRCLES[15] = [114, 0];
[16, 17, 18].forEach(function (index) { return CIRCLES[index] = [140, 45 + CIRCLE_WIDTH * (index - 16)]; });
[19, 20].forEach(function (index) { return CIRCLES[index] = [185, 70 + CIRCLE_WIDTH * (index - 19)]; });
var CompressedLineStock = /** @class */ (function (_super) {
    __extends(CompressedLineStock, _super);
    function CompressedLineStock(manager, element, cardWidth) {
        var _this = _super.call(this, manager, element, undefined, function (element, cards) { return _this.manualPosition(element, cards); }) || this;
        _this.manager = manager;
        _this.element = element;
        _this.cardWidth = cardWidth;
        return _this;
    }
    CompressedLineStock.prototype.manualPosition = function (element, cards) {
        var _this = this;
        var halfClientWidth = element.clientWidth / 2;
        var MARGIN = 8;
        var CARD_WIDTH = 72;
        var cardDistance = CARD_WIDTH + MARGIN;
        var containerWidth = element.clientWidth;
        var uncompressedWidth = (cards.length * CARD_WIDTH) + ((cards.length - 1) * MARGIN);
        if (uncompressedWidth > containerWidth) {
            cardDistance = Math.floor(CARD_WIDTH * containerWidth / ((cards.length + 2) * CARD_WIDTH));
        }
        cards.forEach(function (card, index) {
            var cardDiv = _this.getCardElement(card);
            var cardLeft = halfClientWidth + cardDistance * (index - (cards.length - 1) / 2);
            cardDiv.style.left = "".concat(cardLeft - CARD_WIDTH / 2, "px");
        });
    };
    return CompressedLineStock;
}(ManualPositionStock));
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, firstPlayerOperation) {
        var _this = this;
        var _a;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" data-color=\"").concat(player.color, "\">\n            <div class=\"background\" data-color=\"").concat(player.color, "\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-hand-cards\" class=\"hand cards\" data-player-id=\"").concat(this.playerId, "\" data-current-player=\"").concat(this.currentPlayer.toString(), "\" data-my-hand=\"").concat(this.currentPlayer.toString(), "\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-checks\" class=\"checks\">");
        for (var i = 1; i <= 7; i++) {
            html += "<div id=\"player-table-".concat(this.playerId, "-check").concat(i, "\" class=\"check\" data-number=\"").concat(i, "\">").concat(player.checks >= i ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '', "</div>");
        }
        html += "    \n            </div>\n            <div id=\"player-table-".concat(this.playerId, "-operations\" class=\"operations\">\n                <div id=\"player-table-").concat(this.playerId, "-first-player-token\" class=\"first-player-token\" data-operation=\"").concat(firstPlayerOperation, "\" data-visible=\"").concat((firstPlayerOperation > 0).toString(), "\"></div>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-circles\" class=\"circles\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-reserve\" class=\"reserve\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-highCommand\" class=\"highCommand\">\n            </div>\n            <div class=\"name-and-tiles\">\n                <div class=\"name-wrapper\">\n                    <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n                </div>\n                <div id=\"player-table-").concat(this.playerId, "-objective-tokens\" class=\"objective-tokens\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-discover-tiles\" class=\"discover-tiles\"></div>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-zone-legend\" class=\"zone legend\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-link-legend\" class=\"link legend\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-check-legend\" class=\"check-legend\"></div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        [1, 2, 3, 4, 5].forEach(function (operation) {
            (operation > 3 ? [1, 2, 3, 4] : [1, 2, 3]).forEach(function (number) {
                var div = document.createElement('div');
                div.id = "player-table-".concat(_this.playerId, "-operation").concat(operation, "-number").concat(number);
                div.classList.add('operation-number');
                div.dataset.operation = '' + operation;
                div.dataset.number = '' + number;
                div.innerHTML = "".concat(player.operations[operation] >= number ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '');
                if (_this.currentPlayer) {
                    div.addEventListener('click', function () { return _this.game.operationClick(operation); });
                }
                document.getElementById("player-table-".concat(_this.playerId, "-operations")).appendChild(div);
            });
            var bubble = document.createElement('div');
            bubble.id = "player-table-".concat(_this.playerId, "-operation").concat(operation, "-bubble");
            bubble.classList.add('operation-bubble');
            bubble.dataset.operation = '' + operation;
            if (_this.currentPlayer) {
                bubble.addEventListener('click', function () { return _this.game.operationClick(operation); });
            }
            document.getElementById("player-table-".concat(_this.playerId, "-operations")).appendChild(bubble);
        });
        player.circles.forEach(function (circle) {
            var div = document.createElement('div');
            div.id = "player-table-".concat(_this.playerId, "-circle").concat(circle.circleId);
            div.dataset.circle = "".concat(circle.circleId);
            div.classList.add('circle');
            div.dataset.zone = '' + circle.zone;
            div.dataset.value = '' + circle.value;
            div.innerHTML = "".concat(circle.value !== null && circle.value !== -1 ? circle.value : '');
            if (circle.value === -1) {
                div.dataset.jamming = 'true';
            }
            document.getElementById("player-table-".concat(_this.playerId, "-circles")).appendChild(div);
            div.addEventListener('click', function () {
                if (div.classList.contains('ghost')) {
                    _this.game.cellClick(circle.circleId);
                }
            });
        });
        player.links.forEach(function (link) { return _this.setLink(link.index1, link.index2); });
        this.reserve = new SlotStock(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-reserve")), {
            slotsIds: [1, 2, 3],
            mapCardToSlot: function (card) { return card.locationArg; }
        });
        this.reserve.onCardClick = function (card) { return _this.cardClick(card); };
        this.reserve.addCards(player.reserve);
        this.highCommand = new SlotStock(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-highCommand")), {
            slotsIds: [1, 2, 3, 4, 5],
            mapCardToSlot: function (card) { return card.locationArg; }
        });
        this.highCommand.onCardClick = function (card) { return _this.cardClick(card); };
        this.highCommand.addCards(player.highCommand);
        this.objectiveTokens = new CompressedLineStock(this.game.objectiveTokensManager, document.getElementById("player-table-".concat(this.playerId, "-objective-tokens")), 100);
        this.objectiveTokens.addCards(player.objectiveTokens, undefined, { visible: Boolean((_a = player.objectiveTokens[0]) === null || _a === void 0 ? void 0 : _a.lumens) });
        this.discoverTiles = new CompressedLineStock(this.game.discoverTilesManager, document.getElementById("player-table-".concat(this.playerId, "-discover-tiles")), 100);
        player.discoverTiles.forEach(function (discoverTile) { return _this.discoverTiles.addCard(discoverTile, undefined, { visible: Boolean(discoverTile === null || discoverTile === void 0 ? void 0 : discoverTile.type) }); });
        this.game.setTooltip("player-table-".concat(this.playerId, "-zone-legend"), "<h4>".concat(_('Deploy Reinforcements to the Battlefield'), "</h4>\n        When you create or expand a Area on your Command board, you deploy Reinforcements for EACH NEW CELL of the associated Area."));
        this.game.setTooltip("player-table-".concat(this.playerId, "-link-legend"), "<h4>".concat(_('Move Fighters across the Battlefield AND/OR activate the special abilities of Fighters on the Battlefield.'), "</h4>\n        Whenever you create or expand a Chain of Orders, you receive 1 action for EACH NEW CELL you added to the Chain of Orders."));
        this.game.setTooltip("player-table-".concat(this.playerId, "-check-legend"), _('As soon as all boxes underneath an available slot are crossed off, draw a Bonus token from the neutral bag and place it in this slot'));
    }
    PlayerTable.prototype.cardClick = function (card) {
        if (this.game.cardsManager.getCardElement(card).classList.contains('selectable')) {
            if (card.type < 20) {
                this.game.playFighter(card.id);
            }
            else if (card.type < 30) {
                this.game.activateFighter(card.id);
            }
        }
        else {
            this.game.cardsManager.getCardStock(card).unselectCard(card);
        }
    };
    PlayerTable.prototype.setPossibleOperations = function (operations) {
        var _this = this;
        Object.keys(operations).forEach(function (key) {
            var operation = operations[key];
            if (!operation.disabled) {
                var operationNumberDiv = document.getElementById("player-table-".concat(_this.playerId, "-operation").concat(key, "-number").concat(operation.currentNumber + 1));
                operationNumberDiv.classList.add('ghost');
                operationNumberDiv.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
            }
            var bubble = document.getElementById("player-table-".concat(_this.playerId, "-operation").concat(key, "-bubble"));
            bubble.innerHTML = !operation.disabled ? "<span>".concat(operation.value, "</span>") : "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
            bubble.dataset.visible = 'true';
        });
    };
    PlayerTable.prototype.clearPossibleOperations = function () {
        Array.from(document.querySelectorAll(".operation-bubble")).forEach(function (elem) { return elem.dataset.visible = 'false'; });
    };
    PlayerTable.prototype.setPlayedOperation = function (type, number, firstPlayer) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-operation").concat(type, "-number").concat(number));
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
        if (firstPlayer) {
            var fpDiv = document.getElementById("player-table-".concat(this.playerId, "-first-player-token"));
            fpDiv.dataset.operation = '' + type;
            fpDiv.dataset.visible = 'true';
        }
    };
    PlayerTable.prototype.removeFirstPlayerToken = function () {
        var fpDiv = document.getElementById("player-table-".concat(this.playerId, "-first-player-token"));
        fpDiv.dataset.visible = 'false';
    };
    PlayerTable.prototype.setCancelledOperation = function (type, number, firstPlayer) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-operation").concat(type, "-number").concat(number + 1));
        circleDiv.innerHTML = '';
        if (firstPlayer) {
            document.getElementById("player-table-".concat(this.playerId, "-first-player-token")).dataset.visible = 'false';
        }
    };
    PlayerTable.prototype.setPossibleCells = function (possibleCircles, value) {
        var _this = this;
        possibleCircles.forEach(function (circleId) {
            var circleDiv = document.getElementById("player-table-".concat(_this.playerId, "-circle").concat(circleId));
            circleDiv.dataset.value = '' + value;
            circleDiv.classList.add('ghost');
            if (value === -1) {
                circleDiv.dataset.jamming = 'true';
            }
            else {
                circleDiv.innerHTML = '' + value;
            }
        });
    };
    PlayerTable.prototype.setCircleValue = function (circleId, value) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-circle").concat(circleId));
        circleDiv.classList.remove('ghost');
        circleDiv.dataset.value = '' + value;
        circleDiv.innerHTML = value === -1 ? '' : '' + value;
        if (value === -1) {
            circleDiv.dataset.jamming = 'true';
        }
    };
    PlayerTable.prototype.setPossibleCellLinks = function (possibleLinkCirclesIds, cellId) {
        var _this = this;
        possibleLinkCirclesIds.forEach(function (destId) { return _this.setLink(cellId, destId, true); });
    };
    PlayerTable.prototype.addCheck = function (checks) {
        var div = document.getElementById("player-table-".concat(this.playerId, "-check").concat(checks));
        div.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
    };
    PlayerTable.prototype.refillReserve = function (fighter, slot) {
        this.reserve.addCard(fighter, {
            fromElement: document.getElementById("bag-".concat(this.playerId))
        }, {
            slot: slot
        });
    };
    PlayerTable.prototype.addHighCommandCard = function (card) {
        this.highCommand.addCard(card, {
            fromElement: document.getElementById("bag-0")
        });
    };
    PlayerTable.prototype.setZone = function (circlesIds, zoneId) {
        var _this = this;
        circlesIds.forEach(function (circleId) { return document.getElementById("player-table-".concat(_this.playerId, "-circle").concat(circleId)).dataset.zone = '' + zoneId; });
    };
    PlayerTable.prototype.setLink = function (index1, index2, selectable) {
        var _this = this;
        if (selectable === void 0) { selectable = false; }
        var circle1 = CIRCLES[index1];
        var circle2 = CIRCLES[index2];
        var angle = Math.atan2(circle2[0] - circle1[0], circle2[1] - circle1[1]) * 180 / Math.PI - 90;
        var left = circle1[1] + CIRCLE_WIDTH / 2 - 5;
        var top = circle1[0] + CIRCLE_WIDTH / 2 + 3;
        var link = document.createElement('div');
        link.id = "link_".concat(this.playerId, "_").concat(index1, "_").concat(index2);
        link.classList.add('link', 'chiffres');
        if (selectable) {
            link.classList.add('selectable');
        }
        link.style.left = "".concat(left, "px");
        link.style.top = "".concat(top, "px");
        link.style.transform = "rotate(".concat(angle, "deg)");
        link.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/num1.gif\" />");
        document.getElementById("player-table-".concat(this.playerId, "-circles")).appendChild(link);
        if (selectable) {
            link.addEventListener('click', function () { return _this.game.cellClick(index2); });
        }
    };
    PlayerTable.prototype.setSelectableMoveActivateCards = function (selectableCards) {
        [this.reserve, this.highCommand].forEach(function (stock) {
            stock.setSelectionMode(selectableCards.length ? 'single' : 'none');
            stock.getCards().forEach(function (card) { return stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(function (c) { return c.id == card.id; })); });
        });
    };
    PlayerTable.prototype.setSelectablePlayCards = function (selectableCards) {
        [this.reserve, this.highCommand].forEach(function (stock) {
            stock.setSelectionMode(selectableCards.length ? 'single' : 'none');
            stock.getCards().forEach(function (card) { return stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(function (c) { return c.id == card.id; })); });
        });
    };
    PlayerTable.prototype.addObjectiveTokens = function (tokens) {
        var _a;
        this.objectiveTokens.addCards(tokens, undefined, { visible: Boolean((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.lumens) });
    };
    PlayerTable.prototype.addDiscoverTile = function (discoverTile) {
        this.discoverTiles.addCard(discoverTile);
    };
    PlayerTable.prototype.revealObjectiveTokens = function (tokens) {
        var _this = this;
        this.objectiveTokens.addCards(tokens);
        tokens.forEach(function (card) { return _this.objectiveTokens.setCardVisible(card, true); });
    };
    return PlayerTable;
}());
var ANIMATION_MS = 500;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_DISPLAY_KEY = 'Lumen-display';
var Lumen = /** @class */ (function () {
    function Lumen() {
        this.mapZoom = 1;
        this.zoom = 1;
        this.playersTables = [];
        this.selectedPlanificationDice = {};
        this.chosenFighters = [];
        this.bags = [];
        this.bagCounters = [];
        this.display = 'fit-map-and-board-to-screen';
        this.controlCounters = {};
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        var displayStr = localStorage.getItem(LOCAL_STORAGE_DISPLAY_KEY);
        if (displayStr && ['scroll', 'fit-map-to-screen', 'fit-map-and-board-to-screen'].includes(displayStr)) {
            this.display = displayStr;
        }
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Lumen.prototype.setup = function (gamedatas) {
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.discoverTilesManager = new DiscoverTilesManager(this);
        this.objectiveTokensManager = new ObjectiveTokensManager(this);
        //this.scenario = new Scenario(0);
        this.scenario = new Scenario(gamedatas.scenario);
        this.tableCenter = new TableCenter(this, this.gamedatas);
        this.setScenarioInformations();
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.notif_diceChange({
            args: {
                die1: gamedatas.die1,
                die2: gamedatas.die2,
            }
        });
        this.setupNotifications();
        this.setupPreferences();
        this.addHelp();
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringEndScore(true);
        }
        this.setActiveDisplayButton();
        [/*100, */ 75 /*, 50*/].forEach(function (zoomFactor) {
            var btnMapScroll = document.getElementById("display-map-scroll-".concat(zoomFactor));
            _this.setTooltip(btnMapScroll.id, _('Scroll in map'));
            btnMapScroll.addEventListener('click', function () { return _this.setMapScroll(zoomFactor); });
        });
        var btnFitMap = document.getElementById('display-fit-map');
        var btnFitMapAndBoard = document.getElementById('display-fit-map-and-board');
        //const btnFitMapAndBoardBis = document.getElementById('display-fit-map-and-board-bis');
        this.setTooltip(btnFitMap.id, _('Fit map to screen'));
        this.setTooltip(btnFitMapAndBoard.id, _('Fit map and board to screen'));
        //this.setTooltip(btnFitMapAndBoardBis.id, _('Fit map and board to screen'));
        btnFitMap.addEventListener('click', function () { return _this.setFitMap(); });
        btnFitMapAndBoard.addEventListener('click', function () { return _this.setFitMapAndBoard(false); });
        //btnFitMapAndBoardBis.addEventListener('click', () => this.setFitMapAndBoard(true));
        ['left', 'right', 'top', 'bottom'].forEach(function (direction) { return document.getElementById("scroll-".concat(direction)).addEventListener('click', function () { return _this.scroll(direction); }); });
        document.getElementById('map-frame').addEventListener('scroll', function () { return _this.onMapFrameScroll(); });
        this.onScreenWidthChange = function () {
            _this.updateDisplay();
        };
        [500, 1000, 2000].forEach(function (timer) { return setTimeout(function () { return _this.updateDisplay(); }, timer); });
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    Lumen.prototype.setGamestateDescription = function (property) {
        if (property === void 0) { property = ''; }
        var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = "".concat(originalState['description' + property]);
        this.gamedatas.gamestate.descriptionmyturn = "".concat(originalState['descriptionmyturn' + property]);
        this.updatePageTitle();
    };
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Lumen.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'newRound':
                this.onEnteringNewRound();
                break;
            case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;
            case 'chooseCell':
                this.onEnteringChooseCell(args.args);
                break;
            case 'chooseCellLink':
                this.onEnteringChooseCellLink(args.args);
                break;
            case 'chooseCellInterference':
                this.onEnteringChooseCellInterference(args.args);
                break;
            case 'chooseFighter':
                this.onEnteringChooseFighter(args.args);
                break;
            case 'chooseTerritory':
                this.onEnteringChooseTerritory(args.args);
                break;
            case 'endScore':
                this.onEnteringEndScore();
                break;
        }
    };
    Lumen.prototype.onEnteringNewRound = function () {
        this.playersTables.forEach(function (playerTable) { return playerTable.removeFirstPlayerToken(); });
        this.roundNumberCounter.incValue(1);
    };
    Lumen.prototype.onEnteringPlanificationChooseFaces = function () {
        var _this = this;
        this.addActionButton("confirmSelectedPlanificationFaces-button", _("Confirm"), function () { return _this.chooseDiceFaces(); });
        dojo.addClass("confirmSelectedPlanificationFaces-button", 'disabled');
        var confirmButton = document.getElementById("confirmSelectedPlanificationFaces-button");
        ['white', 'black'].forEach(function (color, dieIndex) {
            var facesWrapper = document.createElement('div');
            [0, 1, 2, 3, 4, 5].forEach(function (dieValueIndex) {
                var dieValue = dieIndex + dieValueIndex;
                var html = "<div class=\"die-icon\" data-color=\"".concat(color, "\">").concat(dieValue, "</div>");
                _this.addActionButton("select-".concat(color, "-die-").concat(dieValue, "-button"), html, function () { return _this.onPlanificationDiceSelection(color, dieValue); }, null, null, 'gray');
                facesWrapper.appendChild(document.getElementById("select-".concat(color, "-die-").concat(dieValue, "-button")));
            });
            confirmButton.parentElement.insertBefore(facesWrapper, confirmButton);
        });
    };
    Lumen.prototype.onEnteringChooseOperation = function (args) {
        var _a;
        if (this.isCurrentPlayerActive()) {
            (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPossibleOperations(args.operations);
        }
    };
    Lumen.prototype.onEnteringChooseCell = function (args) {
        var _a;
        if (this.isCurrentPlayerActive()) {
            (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPossibleCells(args.possibleCircles, args.value);
        }
    };
    Lumen.prototype.onEnteringChooseCellLink = function (args) {
        var _a;
        if (this.isCurrentPlayerActive()) {
            (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPossibleCellLinks(args.possibleLinkCirclesIds, args.cellId);
        }
    };
    Lumen.prototype.onEnteringChooseCellInterference = function (args) {
        var _a;
        if (this.isCurrentPlayerActive()) {
            (_a = this.getPlayerTable(args.opponentId)) === null || _a === void 0 ? void 0 : _a.setPossibleCells(args.possibleCircles, -1);
            document.getElementById("player-table-".concat(args.opponentId)).scrollIntoView({ behavior: 'smooth' });
        }
    };
    Lumen.prototype.getChooseFighterSelectableMoveActivateCards = function (args) {
        if (this.gamedatas.gamestate.name !== 'chooseFighter') {
            return [];
        }
        args = args !== null && args !== void 0 ? args : this.gamedatas.gamestate.args;
        return args.move ?
            args.possibleTerritoryFighters : __spreadArray(__spreadArray([], args.possibleFightersToMove, true), args.possibleFightersToActivate, true);
    };
    Lumen.prototype.onEnteringChooseFighter = function (args) {
        var _a;
        if (!args.move) {
            var onlyFoolPlay = args.remainingActions.actions.map(function (action) { return action.remaining; }).reduce(function (a, b) { return a + b; }, 0) == 0;
            if (onlyFoolPlay) {
                this.setGamestateDescription('OnlyFoolPlay');
            }
            else {
                this.setGamestateDescription(args.currentAction.type);
            }
            if (!onlyFoolPlay) {
                var subTitle = document.createElement('span');
                subTitle.classList.add('subtitle');
                if (args.usingFoolPlay) {
                    subTitle.innerHTML = "(".concat(_('${tileFoolPlay} extra action').replace('${tileFoolPlay}', '<div class="tile-foul-play"></div>'), ")");
                }
                else {
                    var texts = args.remainingActions.actions.filter(function (action) { return action.initial > 0; }).map(function (action) {
                        return "".concat(action.initial - action.remaining, "/").concat(action.initial, " <div class=\"action ").concat(action.type.toLowerCase(), "\"></div>");
                    });
                    subTitle.innerHTML = "(".concat(texts.length > 1 ? _('${action1} then ${action2}').replace('${action1}', texts[0]).replace('${action2}', texts[1]) : texts.join(''), ")");
                }
                document.getElementById("pagemaintitletext").appendChild(document.createElement('br'));
                document.getElementById("pagemaintitletext").appendChild(subTitle);
            }
        }
        else {
            this.setGamestateDescription('' + args.move);
        }
        if (this.isCurrentPlayerActive()) {
            this.chosenFighters = [];
            if (((_a = args.currentAction) === null || _a === void 0 ? void 0 : _a.type) == 'PLACE') {
                this.getCurrentPlayerTable().setSelectablePlayCards(args.possibleFightersToPlace);
            }
            else {
                var selectableCards = this.getChooseFighterSelectableMoveActivateCards(args);
                this.getCurrentPlayerTable().setSelectableMoveActivateCards(selectableCards);
                this.tableCenter.setSelectableCards(selectableCards, args.selectionSize > 1 || args.selectionSize == -1);
            }
        }
    };
    Lumen.prototype.onEnteringChooseTerritory = function (args) {
        var _a;
        this.setGamestateDescription('' + args.move);
        if (args.selectedFighter) {
            (_a = this.cardsManager.getCardElement(args.selectedFighter)) === null || _a === void 0 ? void 0 : _a.classList.add('selected');
        }
        if (this.isCurrentPlayerActive()) {
            this.tableCenter.setSelectableTerritories(args.territoriesIds);
        }
    };
    Lumen.prototype.onEnteringEndScore = function (fromReload) {
        var _this = this;
        if (fromReload === void 0) { fromReload = false; }
        document.querySelectorAll('span.hidden-score').forEach(function (elem) { return elem.remove(); }); // remove the (+?)
        document.getElementById('score').style.display = 'flex';
        var players = Object.values(this.gamedatas.players);
        var headers = document.getElementById('scoretr');
        if (!headers.childElementCount) {
            var html_1 = "<th></th>";
            players.forEach(function (player) { return html_1 += "<td style=\"background: #".concat(player.color, ";\">").concat(player.name, "</td>"); });
            dojo.place(html_1, headers);
        }
        var scoreTerritories = document.getElementById('score-territories');
        if (!scoreTerritories.childElementCount) {
            var html_2 = "<th>".concat(_('Controlled territories'), "</th>");
            players.forEach(function (player) {
                html_2 += "<td style=\"background: #".concat(player.color, ";\">\n                    <div id=\"score-controlled-territories-").concat(player.id, "\">").concat(fromReload ? [1, 3, 5, 7].map(function (lumens) { return player.controlCounters[lumens] * lumens; }).reduce(function (a, b) { return a + b; }, 0) : '0', "</div>\n                    <div class=\"counters-wrapper\">(");
                [1, 3, 5, 7].forEach(function (lumens) {
                    return html_2 += "<div class=\"counter-wrapper\" id=\"counter-wrapper-".concat(player.id, "-").concat(lumens, "\" data-hidden=\"").concat((!_this.scenario.battlefields.some(function (battlefield) { return BATTLEFIELDS[battlefield.battlefieldId].territories.some(function (territory) { return territory.id % 10 == lumens; }); })).toString(), "\">\n                        <div class=\"territory-img\" data-lumens=\"").concat(lumens, "\"></div><span id=\"score-controlled-territories-").concat(player.id, "-").concat(lumens, "\">").concat(fromReload ? player.controlCounters[lumens] * lumens : '0', "</span>\n                    </div>");
                });
                html_2 += ")</div></td>";
            });
            dojo.place(html_2, scoreTerritories);
        }
        var scoreDiscoverTiles = document.getElementById('score-discover-tiles');
        if (!scoreDiscoverTiles.childElementCount) {
            var html_3 = "<th>".concat(_('Discover tiles'), "</th>");
            players.forEach(function (player) { return html_3 += "<td style=\"background: #".concat(player.color, ";\" id=\"score-discover-tiles-").concat(player.id, "\">").concat(fromReload ? player.discoverTilesPoints : '0', "</td>"); });
            dojo.place(html_3, scoreDiscoverTiles);
        }
        var scoreObjectiveTokens = document.getElementById('score-objective-tokens');
        if (!scoreObjectiveTokens.childElementCount) {
            var html_4 = "<th>".concat(_('Objective tokens'), "</th>");
            players.forEach(function (player) { return html_4 += "<td style=\"background: #".concat(player.color, ";\" id=\"score-objective-tokens-").concat(player.id, "\">").concat(fromReload ? player.objectiveTokensPoints : '0', "</td>"); });
            dojo.place(html_4, scoreObjectiveTokens);
        }
        var footers = document.getElementById('scorefoot');
        if (!footers.childElementCount) {
            var html_5 = "<th>".concat(_('Final score'), "</th>");
            players.forEach(function (player) { return html_5 += "<td style=\"background: #".concat(player.color, ";\" id=\"score-final-").concat(player.id, "\">").concat(fromReload ? player.score : '0', "</td>"); });
            dojo.place(html_5, footers);
        }
    };
    Lumen.prototype.onLeavingState = function (stateName) {
        var _a;
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;
            case 'chooseOperation':
                this.onLeavingGhostMark('operation-number');
                (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.clearPossibleOperations();
                break;
            case 'chooseCell':
                this.onLeavingGhostMark('circle');
                break;
            case 'chooseCellLink':
                this.onLeavingChooseCellLink();
                break;
            case 'chooseCellInterference':
                this.onLeavingChooseCellInterference();
                break;
            case 'chooseFighter':
                this.onLeavingChooseFighter();
                break;
            case 'chooseTerritory':
                this.onLeavingChooseTerritory();
                break;
        }
    };
    Lumen.prototype.onLeavingPlanificationChooseFaces = function () {
        this.selectedPlanificationDice = {};
    };
    Lumen.prototype.onLeavingGhostMark = function (className) {
        Array.from(document.querySelectorAll(".".concat(className, ".ghost"))).forEach(function (elem) {
            elem.classList.remove('ghost');
            elem.innerHTML = '';
        });
    };
    Lumen.prototype.onLeavingChooseFighter = function () {
        this.getCurrentPlayerTable().setSelectableMoveActivateCards([]);
        this.tableCenter.setSelectableCards([]);
    };
    Lumen.prototype.onLeavingChooseTerritory = function () {
        document.querySelectorAll('.fighter.selectable').forEach(function (elem) { return elem.classList.remove('selectable'); });
        document.querySelectorAll('.territory-mask.selectable').forEach(function (elem) { return elem.classList.remove('selectable'); });
        document.querySelectorAll('#river.selectable').forEach(function (elem) { return elem.classList.remove('selectable'); });
    };
    Lumen.prototype.onLeavingChooseCellLink = function () {
        document.querySelectorAll('.link.selectable').forEach(function (elem) { return elem.remove(); });
    };
    Lumen.prototype.onLeavingChooseCellInterference = function () {
        document.querySelectorAll('[data-jamming="true"].ghost').forEach(function (elem) {
            elem.classList.remove('selectable');
            elem.dataset.jamming = 'false';
        });
    };
    Lumen.prototype.replacePlaceAndMove = function (text, args) {
        return text
            .replace('${place}', "<div class=\"action place\"></div>")
            .replace('${move}', "<div class=\"action move\"></div>")
            .replace('${placeNumber}', '' + args.remainingPlays)
            .replace('${placeMove}', '' + args.remainingMoves);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Lumen.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'askActivatePlanning':
                    this.addActionButton("activatePlanning_button", _('Activate'), function () { return _this.activatePlanning(); });
                    this.addActionButton("passPlanification_button", _('Pass'), function () { return _this.passPlanning(); });
                    break;
                case 'planificationChooseFaces':
                    this.onEnteringPlanificationChooseFaces();
                    break;
                case 'chooseOperation':
                    var chooseOperationArgs_1 = args;
                    Object.keys(chooseOperationArgs_1.operations).forEach(function (type) {
                        var operation = chooseOperationArgs_1.operations[type];
                        _this.addActionButton("chooseOperation".concat(type, "_button"), "<div class=\"operation-icon\" data-type=\"".concat(type, "\"></div> ").concat(operation.value), function () { return _this.chooseOperation(type); }, null, null, 'gray');
                        if (operation.disabled) {
                            var button = document.getElementById("chooseOperation".concat(type, "_button"));
                            button.classList.add('disabled');
                            if (operation.disabled == 'first-player') {
                                button.insertAdjacentHTML('beforeend', "<div class=\"first-player-token\"></div>");
                            }
                        }
                    });
                    break;
                case 'chooseCell':
                    this.addActionButton("cancelOperation_button", _('Cancel'), function () { return _this.cancelOperation(); }, null, null, 'gray');
                    break;
                case 'chooseAction':
                    var chooseActionArgs = args;
                    this.addActionButton("startWithActionPlay_button", this.replacePlaceAndMove(_('Start with ${placeNumber} ${place} then ${placeMove} ${move}'), chooseActionArgs), function () { return _this.startWithAction(1); });
                    this.addActionButton("startWithActionMove_button", this.replacePlaceAndMove(_('Start with ${placeMove} ${move} then ${placeNumber} ${place}'), chooseActionArgs), function () { return _this.startWithAction(2); });
                    if (chooseActionArgs.canUseFoulPlay) {
                        this.addActionButton("useFoulPlay_button", _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), function () { return _this.useFoulPlay(); });
                    }
                    break;
                case 'chooseFighter':
                    var chooseFighterArgs = args;
                    if (!chooseFighterArgs.move) {
                        if (chooseFighterArgs.couldUseFoulPlay && !chooseFighterArgs.usingFoolPlay) {
                            this.addActionButton("useFoulPlay_button", _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), function () { return _this.useFoulPlay(); });
                            if (!chooseFighterArgs.canPlayFoolPlay) {
                                document.getElementById("useFoulPlay_button").classList.add('disabled');
                            }
                        }
                        if (chooseFighterArgs.usingFoolPlay) {
                            this.addActionButton("cancelFoulPlay_button", _('Cancel'), function () { return _this.cancelFoulPlay(); }, null, null, 'gray');
                        }
                        else {
                            var shouldntPass_1 = chooseFighterArgs.remainingActions.actions.map(function (action) { return action.remaining; }).reduce(function (a, b) { return a + b; }, 0) > 0;
                            this.addActionButton("cancelOperation_button", _('Pass'), function () { return _this.pass(shouldntPass_1); }, null, null, shouldntPass_1 ? 'gray' : undefined);
                        }
                    }
                    else {
                        switch (chooseFighterArgs.move) {
                            case 5:
                                if (!chooseFighterArgs.possibleTerritoryFighters.length) {
                                    this.addActionButton("passAssassin_button", _('Pass (no possible fighter to assassinate)'), function () { return _this.passChooseFighters(); });
                                }
                                break;
                            case 9:
                                if (chooseFighterArgs.selectionSize == -1) {
                                    this.addActionButton("chooseFighters_button", _('Disable selected fighters'), function () { return _this.chooseFighters(_this.chosenFighters); });
                                }
                                break;
                            case 21:
                                this.addActionButton("chooseFighters_button", _('Remove selected fighters'), function () { return _this.chooseFighters(_this.chosenFighters); });
                                break;
                            case 23:
                                this.addActionButton("chooseFighters_button", _('Swap selected fighters'), function () { return _this.chooseFighters(_this.chosenFighters); });
                                document.getElementById("chooseFighters_button").classList.add('disabled');
                                break;
                        }
                    }
                    if (chooseFighterArgs.canCancel) {
                        this.addActionButton("cancelChooseFighters_button", _('Cancel'), function () { return _this.cancelChooseFighters(); }, null, null, 'gray');
                    }
                    break;
                case 'chooseTerritory':
                    var chooseTerritoryArgs = args;
                    if (chooseTerritoryArgs.canCancel) {
                        this.addActionButton("cancelChooseTerritory_button", _('Cancel'), function () { return _this.cancelChooseTerritory(); }, null, null, 'gray');
                    }
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Lumen.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    Lumen.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    };
    Lumen.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Lumen.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
    };
    Lumen.prototype.getPlayerIdByColor = function (color) {
        return Number(Object.values(this.gamedatas.players).find(function (player) { return player.color == color; }).id);
    };
    Lumen.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    Lumen.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    Lumen.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
    };
    Lumen.prototype.toggleZoomNotice = function (visible) {
        var elem = document.getElementById('zoom-notice');
        if (visible) {
            if (!elem) {
                dojo.place("\n                <div id=\"zoom-notice\">\n                    ".concat(_("Use map controls to adapt map size !"), "\n                    <div style=\"text-align: center; margin-top: 10px;\"><a id=\"hide-zoom-notice\">").concat(_("Dismiss"), "</a></div>\n                    <div class=\"arrow-right\"></div>\n                </div>\n                "), 'map-controls');
                document.getElementById('hide-zoom-notice').addEventListener('click', function () {
                    var select = document.getElementById('preference_control_299');
                    select.value = '2';
                    var event = new Event('change');
                    select.dispatchEvent(event);
                });
            }
        }
        else if (elem) {
            elem.parentElement.removeChild(elem);
        }
    };
    Lumen.prototype.setFitMap = function () {
        this.display = 'fit-map-to-screen';
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    };
    Lumen.prototype.setFitMapAndBoard = function (sameScale) {
        this.display = 'fit-map-and-board-to-screen' + (sameScale ? '-bis' : '');
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    };
    Lumen.prototype.setMapScroll = function (zoomFactor) {
        this.display = "scroll-".concat(zoomFactor);
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    };
    Lumen.prototype.setActiveDisplayButton = function () {
        var _this = this;
        document.querySelectorAll('#map-controls button').forEach(function (elem) { return elem.classList.toggle('active', elem.dataset.display == _this.display); });
    };
    Lumen.prototype.updateDisplay = function () {
        //document.getElementById('zoom-wrapper').style.height = `${document.getElementById('full-table').getBoundingClientRect().height}px`;
        var map = document.getElementById('map');
        var mapFrame = document.getElementById('map-frame');
        var mapFrameBR = mapFrame.getBoundingClientRect();
        var fullTable = document.getElementById('full-table');
        var scroll = this.display.startsWith('scroll');
        var spaceBeforeMap = mapFrameBR.top - document.body.getBoundingClientRect().top;
        var bgaZoom = 1;
        var bgaZoomStr = document.getElementById('page-content').style.zoom;
        if (bgaZoomStr && bgaZoomStr !== '' && bgaZoomStr !== '1') {
            bgaZoom = Number(bgaZoomStr);
            spaceBeforeMap = document.getElementById('page-content').getBoundingClientRect().top * bgaZoom - document.body.getBoundingClientRect().top;
        }
        var playAreaViewportHeight = (window.innerHeight - spaceBeforeMap) / bgaZoom;
        mapFrame.style.maxHeight = "".concat(playAreaViewportHeight, "px");
        document.getElementById('scroll-buttons').dataset.scroll = scroll.toString();
        fullTable.style.margin = '';
        fullTable.style.height = '';
        var zoom = 1;
        var mapWidth = Number(map.dataset.width);
        var mapHeight = Number(map.dataset.height);
        if (scroll) {
            fullTable.style.transform = '';
            var zoomFactor = Number(this.display.split('-')[1]);
            if (zoomFactor < 100) {
                this.mapZoom = zoomFactor / 100;
                var newMapWidth = mapWidth * this.mapZoom;
                var newMapHeight = Math.min(playAreaViewportHeight, mapHeight * this.mapZoom);
                map.style.transform = "scale(".concat(this.mapZoom, ")");
                map.style.maxHeight = "".concat(newMapHeight, "px");
                map.style.width = "".concat(newMapWidth, "px");
                map.style.height = "".concat(newMapHeight, "px");
            }
            else {
                this.mapZoom = 1;
                map.style.transform = "";
                map.style.maxHeight = "";
                map.style.width = "".concat(map.dataset.width, "px");
                map.style.height = "".concat(map.dataset.height, "px");
            }
            mapFrame.style.height = "";
            this.onMapFrameScroll();
        }
        else if (this.display === 'fit-map-and-board-to-screen-bis') {
            mapFrame.style.maxHeight = "".concat(map.dataset.height, "px");
            this.mapZoom = 1;
            map.style.transform = "";
            map.style.maxHeight = "";
            map.style.width = "".concat(map.dataset.width, "px");
            map.style.height = "".concat(map.dataset.height, "px");
            zoom = Math.min(1, playAreaViewportHeight / (mapHeight + 20 + document.getElementsByClassName('player-table')[0].clientHeight), mapFrame.clientWidth / mapWidth);
        }
        else {
            var xScale = mapFrame.clientWidth / mapWidth;
            var yScale = playAreaViewportHeight / mapHeight;
            this.mapZoom = /*Math.max(0.1, */ Math.min(1, Math.min(xScale, yScale)) /*)*/;
            var newMapWidth = mapWidth * this.mapZoom;
            var newMapHeight = Math.min(playAreaViewportHeight, mapHeight * this.mapZoom);
            map.style.transform = "scale(".concat(this.mapZoom, ")");
            map.style.maxHeight = "".concat(newMapHeight, "px");
            map.style.width = "".concat(newMapWidth, "px");
            map.style.height = "".concat(newMapHeight, "px");
            if (this.display === 'fit-map-and-board-to-screen') {
                zoom = Math.min(1, playAreaViewportHeight / (newMapHeight + 20 + document.getElementsByClassName('player-table')[0].clientHeight));
            }
        }
        if (zoom === 1) {
            fullTable.style.transform = '';
        }
        else {
            fullTable.style.transform = "scale(".concat(zoom, ")");
            fullTable.style.marginRight = "".concat(-(fullTable.clientWidth / zoom - fullTable.clientWidth), "px");
        }
        fullTable.style.height = "".concat(fullTable.getBoundingClientRect().height, "px");
        document.documentElement.style.setProperty('--cumulative-scale', '' + this.mapZoom * this.zoom);
    };
    Lumen.prototype.scroll = function (direction) {
        var scrollBy = 200;
        var mapFrame = document.getElementById('map-frame');
        var options = {
            behavior: 'smooth',
        };
        switch (direction) {
            case 'left':
                options.left = -scrollBy;
                break;
            case 'right':
                options.left = scrollBy;
                break;
            case 'top':
                options.top = -scrollBy;
                break;
            case 'bottom':
                options.top = scrollBy;
                break;
        }
        mapFrame.scrollBy(options);
    };
    Lumen.prototype.onMapFrameScroll = function () {
        var mapFrame = document.getElementById('map-frame');
        document.getElementById("scroll-left").style.visibility = mapFrame.scrollLeft <= 0 ? 'hidden' : 'visible';
        document.getElementById("scroll-right").style.visibility = mapFrame.scrollLeft + mapFrame.clientWidth >= mapFrame.scrollWidth ? 'hidden' : 'visible';
        document.getElementById("scroll-top").style.visibility = mapFrame.scrollTop <= 0 ? 'hidden' : 'visible';
        document.getElementById("scroll-bottom").style.visibility = mapFrame.scrollTop + mapFrame.clientHeight >= mapFrame.scrollHeight ? 'hidden' : 'visible';
    };
    Lumen.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
            _this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
        try {
            document.getElementById('preference_control_299').closest(".preference_choice").style.display = 'none';
        }
        catch (e) { }
    };
    Lumen.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].dataset.fillingPattern = (prefValue == 2).toString();
                break;
            case 299:
                this.toggleZoomNotice(prefValue == 1);
                break;
        }
    };
    Lumen.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    Lumen.prototype.getSeasonName = function (lumens) {
        switch (lumens) {
            case 1: return _('Winter');
            case 3: return _('Autumn');
            case 5: return _('Summer');
            case 7: return _('Spring');
        }
    };
    Lumen.prototype.getTerritoryTooltip = function (lumens) {
        return _('The ${season} Territories score ${lumens} Lumen. = ${lumens} VP per Territory you control.')
            .replace('${season}', this.getSeasonName(lumens))
            .replace(/\${lumens}/g, lumens);
    };
    Lumen.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            document.getElementById("overall_player_board_".concat(playerId)).style.background = "#".concat(player.color);
            if (!gamedatas.isEnd) {
                // set hidden score
                var currentPlayer = playerId == _this.getPlayerId();
                dojo.place("<span class=\"hidden-score\"> (+ ".concat(currentPlayer ? "<span id=\"hidden-score-counter\"></span>" : '?', ")</span>"), "player_score_".concat(playerId), 'after');
                if (currentPlayer) {
                    _this.hiddenScoreCounter = new ebg.counter();
                    _this.hiddenScoreCounter.create("hidden-score-counter");
                    _this.hiddenScoreCounter.setValue(player.hiddenScore);
                }
            }
            var html = "\n            <div class=\"counters\">\n                <div class=\"counters-title\">".concat(_('Controlled territories'), "</div>\n                <div class=\"counters-wrapper\">");
            [1, 3, 5, 7].forEach(function (lumens) {
                return html += "<div class=\"counter-wrapper\" id=\"counter-wrapper-".concat(player.id, "-").concat(lumens, "\" data-hidden=\"").concat((!_this.scenario.battlefields.some(function (battlefield) { return BATTLEFIELDS[battlefield.battlefieldId].territories.some(function (territory) { return territory.id % 10 == lumens; }); })).toString(), "\">\n                    <div class=\"territory-img\" data-lumens=\"").concat(lumens, "\"></div><div id=\"controlled-territories-").concat(player.id, "-").concat(lumens, "\" class=\"counter\"></div>\n                </div>");
            });
            html += "</div></div>\n            <div class=\"grid\">\n                <div id=\"first-player-token-wrapper-".concat(player.id, "\" class=\"first-player-token-wrapper\"></div>\n                <div id=\"bag-").concat(player.id, "\" class=\"bag\" data-color=\"").concat(player.color, "\"><span id=\"bag-").concat(player.id, "-counter\"></span></div>\n            </div>\n            ");
            dojo.place(html, "player_board_".concat(player.id));
            if (gamedatas.firstPlayer == playerId) {
                dojo.place("<div id=\"first-player-token\" class=\"first-player-token\"></div>", "first-player-token-wrapper-".concat(player.id));
            }
            _this.bags[playerId] = new VoidStock(_this.cardsManager, document.getElementById("bag-".concat(player.id)));
            _this.bagCounters[playerId] = new ebg.counter();
            _this.bagCounters[playerId].create("bag-".concat(player.id, "-counter"));
            _this.bagCounters[playerId].setValue(gamedatas.remainingCardsInBag[playerId]);
            _this.controlCounters[playerId] = {};
            [1, 3, 5, 7].forEach(function (lumens) {
                _this.controlCounters[playerId][lumens] = new ebg.counter();
                _this.controlCounters[playerId][lumens].create("controlled-territories-".concat(player.id, "-").concat(lumens));
                _this.controlCounters[playerId][lumens].setValue(player.controlCounters[lumens]);
            });
            [1, 3, 5, 7].forEach(function (lumens) {
                return _this.setTooltip("counter-wrapper-".concat(player.id, "-").concat(lumens), _this.getTerritoryTooltip(lumens));
            });
        });
        this.setTooltipToClass('bag', _('Bag of fighters (the number indicates the remaining card count)'));
        dojo.place("\n        <div id=\"overall_player_board_0\" class=\"player-board current-player-board\">\t\t\t\t\t\n            <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n\n            <div class=\"grid\">\n                <div></div>\n                <div id=\"bag-0\" class=\"bag\"><span id=\"bag-0-counter\"></span></div>\n            </div>\n               \n            </div>\n        </div>", "player_boards", 'first');
        this.bags[0] = new VoidStock(this.cardsManager, document.getElementById("bag-0"));
        this.bagCounters[0] = new ebg.counter();
        this.bagCounters[0].create("bag-".concat(0, "-counter"));
        this.bagCounters[0].setValue(gamedatas.remainingCardsInBag[0]);
    };
    Lumen.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    Lumen.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.firstPlayer == playerId ? gamedatas.firstPlayerOperation : 0);
        this.playersTables.push(table);
    };
    Lumen.prototype.setScenarioInformations = function () {
        var _this = this;
        var scenarioName = document.getElementById("scenario-name");
        var scenarioSynopsis = document.getElementById("scenario-synopsis");
        var scenarioSpecialRules = document.getElementById("scenario-special-rules");
        var scenarioObjectives = document.getElementById("scenario-objectives");
        scenarioName.innerHTML = "\n            <div class=\"title\">".concat(this.scenario.title, "</div>\n            <div class=\"round\">").concat(_('Round:'), " <span id=\"round-number-counter\"></span>/17</div>\n        ");
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create("round-number-counter");
        this.roundNumberCounter.setValue(this.gamedatas.roundNumber);
        scenarioSynopsis.innerHTML = this.scenario.synopsis;
        scenarioSpecialRules.innerHTML = "<div class=\"title\">".concat(_('Special rules'), "</div>").concat(this.scenario.specialRules.length ?
            "<ul>".concat(this.scenario.specialRules.map(function (text) { return "<li>".concat(text, "</li>"); }).join(''), "</ul>") :
            _('None'));
        scenarioObjectives.innerHTML = "<ul>".concat(this.scenario.objectives.map(function (description) {
            var _a, _b;
            return "<li>\n                <span id=\"objective-tokens-legend-".concat(description.letters[0][0], "\" class=\"objective-tokens-legend-wrapper\">\n                    ").concat(description.visibleLetters.map(function (letter) { return "<div class=\"objective-description-token token-with-letter\">".concat(letter, "\n                        <div id=\"objective-tokens-legend-").concat(letter == '' ? description.letters[0][0] : letter, "-f28700\" class=\"objective-tokens-legend\" data-color=\"f28700\"></div>\n                        <div id=\"objective-tokens-legend-").concat(letter == '' ? description.letters[0][0] : letter, "-1f3067\" class=\"objective-tokens-legend\" data-color=\"1f3067\"></div>\n                    </div>"); }).join(''), "\n                    ").concat(!description.visibleLetters.length || (description.visibleLetters.length === 1 && description.visibleLetters[0] === '') ? "\n                        <div id=\"objective-tokens-legend-".concat(description.letters[0][0], "-f28700\" class=\"objective-tokens-legend\" data-color=\"f28700\"></div>\n                        <div id=\"objective-tokens-legend-").concat(description.letters[0][0], "-1f3067\" class=\"objective-tokens-legend\" data-color=\"1f3067\"></div>\n                    ") : '', "\n                    \n                </span>\n                <strong>").concat((_a = description.timing) !== null && _a !== void 0 ? _a : '', "</strong>\n                <strong>").concat((_b = description.type) !== null && _b !== void 0 ? _b : '', "</strong>\n                ").concat(description.text, "\n            </li>");
        }).join(''), "</ul>");
        if (this.gamedatas.scenario == 4) {
            scenarioObjectives.innerHTML = "<strong>".concat(_('At the end of the game, check each island:'), "</strong>") + scenarioObjectives.innerHTML;
            document.querySelector('.objective-description-token.token-with-letter:not(:empty)').classList.add('plus-one');
        }
        this.gamedatas.realizedObjectives.forEach(function (realizedObjective) { return _this.markRealizedObjective(realizedObjective.letter, Number(realizedObjective.realizedBy)); });
        document.getElementById("dice").style.left = "".concat(this.scenario.diceLeft, "px");
        this.setTooltip(scenarioName.id, scenarioSynopsis.outerHTML + scenarioSpecialRules.outerHTML + scenarioObjectives.outerHTML);
    };
    Lumen.prototype.addHelp = function () {
        var _this = this;
        dojo.place("\n            <button id=\"lumen-help-button\">?</button>\n        ", 'left-side');
        document.getElementById('lumen-help-button').addEventListener('click', function () { return _this.showHelp(); });
    };
    Lumen.prototype.showHelp = function () {
        var _this = this;
        var helpDialog = new ebg.popindialog();
        helpDialog.create('lumenHelpDialog');
        helpDialog.setTitle(_("Card details").toUpperCase());
        var baseFighters = [1, 2, 3, 4, 5, 6].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-base-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var mercenaries = [11, 12, 13, 14, 15, 16, 17, 18].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-mercenaries-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var actions = [21, 22, 23].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-actions-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var missions = [31, 32, 33].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-missions-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var discoverTiles = "\n        <div class=\"help-section\">\n            <div id=\"help-discover-tiles-1-1\"></div>\n            <div>".concat(this.discoverTilesManager.getTooltip(1, 1), "</div>\n        </div>\n        ") + [1, 2, 3, 4, 5].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-discover-tiles-2-".concat(subType, "\"></div>\n            <div>").concat(_this.discoverTilesManager.getTooltip(2, subType), "</div>\n        </div>\n        "); }).join('');
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_("BASIC FIGHTERS"), "</h1>\n            ").concat(baseFighters, "\n            <h1>").concat(_("MERCENARY FIGHTERS"), "</h1>\n            <div>").concat(_("When you receive a Mercenary Fighter during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. This Mercenary Fighter is now part of your clan, and may be deployed during phase 3 Issuing Orders of the current turn or any future turn. When you deploy it to the Battlefield, a Clan marker is placed on it to indicate it belongs to you."), "</div>\n            ").concat(mercenaries, "\n            <h1>").concat(_("GLOW ACTIONS"), "</h1>\n            <div>").concat(_("When you receive a Glow Action token during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. This token can now be used during phase 3 Issuing Orders of the current turn or any future turn."), "</div>\n            ").concat(actions, "\n            <h1>").concat(_("SECRET MISSIONS"), "</h1>\n            <div>").concat(_("When you receive a Secret Mission token during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. At the end of the game, before final scoring, receive a number of Objective tokens based on the success of your Secret Missions."), "</div>\n            ").concat(missions, "\n            <h1>").concat(_("DISCOVERY TOKENS"), "</h1>\n            <div>").concat(_("When 1 of your Fighters moves into a Territory containing a face-down Discovery token, flip the token face up and apply its effects."), "</div>\n            ").concat(discoverTiles, "\n        </div>\n        ");
        // Show the dialog
        helpDialog.setContent(html);
        helpDialog.show();
        var player1id = Number(Object.values(this.gamedatas.players).find(function (player) { return player.playerNo == 1; }).id);
        var player2id = Number(Object.values(this.gamedatas.players).find(function (player) { return player.playerNo == 2; }).id);
        // base
        [1, 2, 3, 4, 5, 6].forEach(function (subType) {
            return new LineStock(_this.cardsManager, document.getElementById("help-base-".concat(subType))).addCards([
                { id: 1000 + subType, type: 1, subType: subType, playerId: player1id },
                { id: 2000 + subType, type: 1, subType: subType, playerId: player2id },
            ]);
        });
        // mercenaries
        [11, 12, 13, 14, 15, 16, 17, 18].forEach(function (subType) {
            return new LineStock(_this.cardsManager, document.getElementById("help-mercenaries-".concat(subType))).addCard({ id: 1000 + subType, type: 1, subType: subType });
        });
        // actions
        [21, 22, 23].forEach(function (subType) {
            return new LineStock(_this.cardsManager, document.getElementById("help-actions-".concat(subType))).addCard({ id: 1000 + subType, type: 1, subType: subType });
        });
        // missions
        [31, 32, 33].forEach(function (subType) {
            return new LineStock(_this.cardsManager, document.getElementById("help-missions-".concat(subType))).addCard({ id: 1000 + subType, type: 1, subType: subType });
        });
        // discover tiles
        new LineStock(this.discoverTilesManager, document.getElementById("help-discover-tiles-1-1")).addCards([
            { id: 1003, type: 1, subType: 3 },
            { id: 1004, type: 1, subType: 4 },
            { id: 1005, type: 1, subType: 5 },
        ]);
        [1, 2, 3, 4, 5].forEach(function (subType) {
            return new LineStock(_this.discoverTilesManager, document.getElementById("help-discover-tiles-2-".concat(subType))).addCard({ id: 2000 + subType, type: 2, subType: subType });
        });
    };
    Lumen.prototype.onPlanificationDiceSelection = function (color, value) {
        var oldSelectedButton = document.getElementById("select-".concat(color, "-die-").concat(this.selectedPlanificationDice[color], "-button"));
        var newSelectedButton = document.getElementById("select-".concat(color, "-die-").concat(value, "-button"));
        this.selectedPlanificationDice[color] = value;
        oldSelectedButton === null || oldSelectedButton === void 0 ? void 0 : oldSelectedButton.classList.add('bgabutton_gray');
        oldSelectedButton === null || oldSelectedButton === void 0 ? void 0 : oldSelectedButton.classList.remove('bgabutton_blue');
        newSelectedButton === null || newSelectedButton === void 0 ? void 0 : newSelectedButton.classList.add('bgabutton_blue');
        newSelectedButton === null || newSelectedButton === void 0 ? void 0 : newSelectedButton.classList.remove('bgabutton_gray');
        dojo.toggleClass("confirmSelectedPlanificationFaces-button", 'disabled', isNaN(this.selectedPlanificationDice['white']) || isNaN(this.selectedPlanificationDice['black']));
    };
    Lumen.prototype.operationClick = function (operation) {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseOperation':
                this.chooseOperation(operation);
                break;
        }
    };
    Lumen.prototype.cellClick = function (cell) {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseCell':
                this.chooseCell(cell);
                break;
            case 'chooseCellLink':
                this.chooseCellLink(cell);
                break;
            case 'chooseCellInterference':
                this.chooseCellInterference(cell);
                break;
        }
    };
    Lumen.prototype.territoryClick = function (id) {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseTerritory':
                this.chooseTerritory(id);
                break;
        }
    };
    Lumen.prototype.chooseFightersClick = function (card) {
        var args = this.gamedatas.gamestate.args;
        if (args.selectionSize == 1) {
            this.chooseFighters([card.id]);
        }
        else {
            var index = this.chosenFighters.indexOf(card.id);
            if (index == -1) {
                this.chosenFighters.push(card.id);
            }
            else {
                this.chosenFighters.splice(index, 1);
            }
            if (args.move == 21) {
                document.getElementById("chooseFighters_button").classList.toggle('disabled', this.chosenFighters.length > args.selectionSize);
            }
            else if (args.move == 23) {
                document.getElementById("chooseFighters_button").classList.toggle('disabled', this.chosenFighters.length !== args.selectionSize);
            }
        }
    };
    Lumen.prototype.activatePlanning = function () {
        if (!this.checkAction('activatePlanning')) {
            return;
        }
        this.takeAction('activatePlanning');
    };
    Lumen.prototype.passPlanning = function () {
        if (!this.checkAction('passPlanning')) {
            return;
        }
        this.takeAction('passPlanning');
    };
    Lumen.prototype.chooseDiceFaces = function () {
        if (!this.checkAction('chooseDiceFaces')) {
            return;
        }
        this.takeAction('chooseDiceFaces', this.selectedPlanificationDice);
    };
    Lumen.prototype.chooseOperation = function (operation) {
        if (!this.checkAction('chooseOperation')) {
            return;
        }
        this.takeAction('chooseOperation', {
            operation: operation
        });
    };
    Lumen.prototype.cancelOperation = function () {
        if (!this.checkAction('cancelOperation')) {
            return;
        }
        this.takeAction('cancelOperation');
    };
    Lumen.prototype.chooseCell = function (cell) {
        if (!this.checkAction('chooseCell')) {
            return;
        }
        this.takeAction('chooseCell', {
            cell: cell
        });
    };
    Lumen.prototype.chooseCellLink = function (cell) {
        if (!this.checkAction('chooseCellLink')) {
            return;
        }
        this.takeAction('chooseCellLink', {
            cell: cell
        });
    };
    Lumen.prototype.chooseCellInterference = function (cell) {
        if (!this.checkAction('chooseCellInterference')) {
            return;
        }
        this.takeAction('chooseCellInterference', {
            cell: cell
        });
    };
    Lumen.prototype.startWithAction = function (id) {
        if (!this.checkAction('startWithAction')) {
            return;
        }
        this.takeAction('startWithAction', {
            id: id
        });
    };
    Lumen.prototype.playFighter = function (id) {
        if (!this.checkAction('playFighter')) {
            return;
        }
        this.takeAction('playFighter', {
            id: id
        });
    };
    Lumen.prototype.moveFighter = function (id) {
        if (!this.checkAction('moveFighter')) {
            return;
        }
        this.takeAction('moveFighter', {
            id: id
        });
    };
    Lumen.prototype.activateFighter = function (id) {
        if (!this.checkAction('activateFighter')) {
            return;
        }
        this.takeAction('activateFighter', {
            id: id
        });
    };
    Lumen.prototype.chooseFighters = function (ids, confirmed) {
        var _this = this;
        if (confirmed === void 0) { confirmed = false; }
        if (!this.checkAction('chooseFighters')) {
            return;
        }
        var args = this.gamedatas.gamestate.args;
        if (!confirmed && args.move == 21 && this.chosenFighters.length < args.selectionSize) {
            this.confirmationDialog(_("Are you sure you choose only ${selected} fighter(s) (max : ${max}) ?").replace('${selected}', this.chosenFighters.length).replace('${max}', args.selectionSize), function () { return _this.chooseFighters(ids, true); });
            return;
        }
        this.takeAction('chooseFighters', {
            ids: ids.join(',')
        });
    };
    Lumen.prototype.cancelChooseFighters = function () {
        if (!this.checkAction('cancelChooseFighters')) {
            return;
        }
        this.takeAction('cancelChooseFighters');
    };
    Lumen.prototype.pass = function (shouldntPass) {
        var _this = this;
        if (!this.checkAction('pass')) {
            return;
        }
        if (shouldntPass) {
            this.confirmationDialog(_("Are you sure you want to pass? You have remaining action(s)"), function () { return _this.pass(false); });
            return;
        }
        this.takeAction('pass');
    };
    Lumen.prototype.chooseTerritory = function (id) {
        if (!this.checkAction('chooseTerritory')) {
            return;
        }
        this.takeAction('chooseTerritory', {
            id: id
        });
    };
    Lumen.prototype.cancelChooseTerritory = function () {
        if (!this.checkAction('cancelChooseTerritory')) {
            return;
        }
        this.takeAction('cancelChooseTerritory');
    };
    Lumen.prototype.passChooseFighters = function () {
        if (!this.checkAction('passChooseFighters')) {
            return;
        }
        this.takeAction('passChooseFighters');
    };
    Lumen.prototype.useFoulPlay = function () {
        if (!this.checkAction('useFoulPlay')) {
            return;
        }
        this.takeAction('useFoulPlay');
    };
    Lumen.prototype.cancelFoulPlay = function () {
        if (!this.checkAction('cancelFoulPlay')) {
            return;
        }
        this.takeAction('cancelFoulPlay');
    };
    Lumen.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/lumen/lumen/".concat(action, ".html"), data, this, function () { });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    Lumen.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['diceRoll', 2000],
            ['diceChange', ANIMATION_MS],
            ['setPlayedOperation', ANIMATION_MS],
            ['setCancelledOperation', 1],
            ['setCircleValue', ANIMATION_MS],
            ['addCheck', 1],
            ['addHighCommandCard', ANIMATION_MS],
            ['zone', 1],
            ['link', 1],
            ['newFirstPlayer', ANIMATION_MS],
            ['takeObjectiveTokens', ANIMATION_MS],
            ['takeMissionObjectiveTokens', ANIMATION_MS * 2],
            ['moveFighter', ANIMATION_MS],
            ['refillReserve', ANIMATION_MS],
            ['moveDiscoverTileToPlayer', ANIMATION_MS],
            ['discardDiscoverTile', ANIMATION_MS],
            ['revealDiscoverTile', ANIMATION_MS],
            ['highlightDiscoverTile', ANIMATION_MS * 4],
            ['moveInitiativeMarker', ANIMATION_MS],
            ['putBackInBag', ANIMATION_MS],
            ['setFightersActivated', ANIMATION_MS],
            ['setFightersUnactivated', ANIMATION_MS],
            ['swappedFighters', ANIMATION_MS],
            ['score', 1],
            ['revealObjectiveTokens', ANIMATION_MS],
            ['endControlTerritory', 1 /*ANIMATION_MS * 2*/],
            ['updateControlCounters', 1],
            ['updateVisibleScore', 1],
            ['updateHiddenScore', 1],
            ['setRealizedObjective', 1],
            ['elimination', 1],
            ['doubleElimination', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
        this.notifqueue.setIgnoreNotificationCheck('takeObjectiveTokens', function (notif) {
            return notif.args.playerId == _this.getPlayerId() && !notif.args.tokens[0].lumens;
        });
        this.notifqueue.setIgnoreNotificationCheck('takeMissionObjectiveTokens', function (notif) {
            return notif.args.playerId == _this.getPlayerId() && !notif.args.tokens[0].lumens;
        });
    };
    Lumen.prototype.notif_diceRoll = function (notif) {
        [1, 2].forEach(function (number) {
            var element = document.getElementById("c_die_".concat(number));
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");
                element.classList.add("show" + notif.args["die".concat(number)]);
            }
            element = document.getElementById("d_die_".concat(number));
            if (element != null) {
                element.classList.remove("roll0", "roll1", "roll2", "roll3");
                void element.offsetWidth;
                element.classList.add("roll" + Math.floor(Math.random() * 4));
            }
        });
    };
    Lumen.prototype.notif_diceChange = function (notif) {
        [1, 2].forEach(function (number) {
            var element = document.getElementById("c_die_".concat(number));
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");
                element.classList.add("show" + notif.args["die".concat(number)]);
            }
        });
    };
    Lumen.prototype.notif_setPlayedOperation = function (notif) {
        this.getPlayerTable(notif.args.playerId).setPlayedOperation(notif.args.type, notif.args.operationsNumber, notif.args.firstPlayer);
    };
    Lumen.prototype.notif_setCancelledOperation = function (notif) {
        this.getPlayerTable(notif.args.playerId).setCancelledOperation(notif.args.type, notif.args.operationsNumber, notif.args.firstPlayer);
    };
    Lumen.prototype.notif_setCircleValue = function (notif) {
        this.getPlayerTable(notif.args.playerId).setCircleValue(notif.args.circleId, notif.args.value);
    };
    Lumen.prototype.notif_addCheck = function (notif) {
        this.getPlayerTable(notif.args.playerId).addCheck(notif.args.checks);
    };
    Lumen.prototype.notif_addHighCommandCard = function (notif) {
        this.getPlayerTable(notif.args.playerId).addHighCommandCard(notif.args.card);
        this.bagCounters[0].incValue(-1);
    };
    Lumen.prototype.notif_zone = function (notif) {
        this.getPlayerTable(notif.args.playerId).setZone(notif.args.circlesIds, notif.args.zoneId);
    };
    Lumen.prototype.notif_link = function (notif) {
        this.getPlayerTable(notif.args.playerId).setLink(notif.args.index1, notif.args.index2);
    };
    Lumen.prototype.notif_newFirstPlayer = function (notif) {
        var firstPlayerToken = document.getElementById('first-player-token');
        var destinationId = "first-player-token-wrapper-".concat(notif.args.playerId);
        var originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithSlideAnimation(firstPlayerToken, document.getElementById(destinationId), { zoom: 1 });
        }
    };
    Lumen.prototype.notif_takeObjectiveTokens = function (notif) {
        var _a;
        var playerId = notif.args.playerId;
        this.getPlayerTable(playerId).addObjectiveTokens(notif.args.tokens);
        if (notif.args.letterId) {
            (_a = document.getElementById("objective-token-".concat(notif.args.letterId))) === null || _a === void 0 ? void 0 : _a.remove();
        }
    };
    Lumen.prototype.notif_takeMissionObjectiveTokens = function (notif) {
        var _a;
        (_a = this.cardsManager.getCardElement(notif.args.highlightCard)) === null || _a === void 0 ? void 0 : _a.classList.add('highlight');
        this.notif_takeObjectiveTokens(notif);
    };
    Lumen.prototype.notif_moveFighter = function (notif) {
        this.tableCenter.moveFighter(notif.args.fighter, notif.args.territoryId, notif.args.fromBag);
    };
    Lumen.prototype.notif_refillReserve = function (notif) {
        var card = notif.args.fighter;
        var playerId = notif.args.playerId;
        this.getPlayerTable(playerId).refillReserve(card, notif.args.slot);
        this.bagCounters[playerId].incValue(-1);
    };
    Lumen.prototype.notif_moveDiscoverTileToPlayer = function (notif) {
        this.getPlayerTable(notif.args.playerId).addDiscoverTile(notif.args.discoverTile);
    };
    Lumen.prototype.notif_discardDiscoverTile = function (notif) {
        var stock = this.discoverTilesManager.getCardStock(notif.args.discoverTile);
        if (stock) {
            stock.removeCard(notif.args.discoverTile);
        }
        else {
            var element = this.discoverTilesManager.getCardElement(notif.args.discoverTile);
            element.remove();
        }
    };
    Lumen.prototype.notif_revealDiscoverTile = function (notif) {
        this.tableCenter.revealDiscoverTile(notif.args.discoverTile);
    };
    Lumen.prototype.notif_highlightDiscoverTile = function (notif) {
        this.tableCenter.highlightDiscoverTile(notif.args.discoverTile);
    };
    Lumen.prototype.notif_moveInitiativeMarker = function (notif) {
        this.tableCenter.moveInitiativeMarker(notif.args.territoryId);
    };
    Lumen.prototype.notif_putBackInBag = function (notif) {
        var _this = this;
        notif.args.fighters.forEach(function (card) {
            _this.bags[card.type == 1 ? card.playerId : 0].addCard(card);
            _this.bagCounters[card.type == 1 ? card.playerId : 0].incValue(1);
        });
    };
    Lumen.prototype.setFightersActivated = function (fighters, activated) {
        var _this = this;
        fighters.forEach(function (card) { return _this.tableCenter.setFightersActivated(card, activated); });
    };
    Lumen.prototype.notif_setFightersActivated = function (notif) {
        this.setFightersActivated(notif.args.fighters, true);
    };
    Lumen.prototype.notif_setFightersUnactivated = function (notif) {
        this.setFightersActivated(notif.args.fighters, false);
    };
    Lumen.prototype.notif_swappedFighters = function (notif) {
        var card0 = notif.args.fighters[0];
        var card1 = notif.args.fighters[1];
        var stock0 = this.cardsManager.getCardStock(card0);
        var stock1 = this.cardsManager.getCardStock(card1);
        stock1.addCard(card0);
        stock0.addCard(card1);
    };
    Lumen.prototype.incFinalScore = function (playerId, incScore) {
        var scoreDiv = document.getElementById("score-final-".concat(playerId));
        scoreDiv.innerHTML = "".concat(Number(scoreDiv.innerHTML) + incScore);
    };
    Lumen.prototype.notif_score = function (notif) {
        var _a;
        var playerId = notif.args.playerId;
        var incScore = notif.args.incScore;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.newScore);
        if (Number(this.gamedatas.gamestate.id) >= 90) { // score or end
            if (notif.args.scoreType === 'endControlTerritory') {
                var scoreDiv = document.getElementById("score-controlled-territories-".concat(playerId));
                var scoreTerritoryDiv = document.getElementById("score-controlled-territories-".concat(playerId, "-").concat(notif.args.lumens));
                scoreDiv.innerHTML = "".concat(Number(scoreDiv.innerHTML) + incScore);
                scoreTerritoryDiv.innerHTML = "".concat(Number(scoreTerritoryDiv.innerHTML) + incScore);
                this.incFinalScore(playerId, incScore);
            }
            else if (notif.args.scoreType === 'discoverTiles') {
                var scoreDiv = document.getElementById("score-discover-tiles-".concat(playerId));
                scoreDiv.innerHTML = "".concat(Number(scoreDiv.innerHTML) + incScore);
                this.incFinalScore(playerId, incScore);
            }
            else if (notif.args.scoreType === 'objectiveTokens') {
                var scoreDiv = document.getElementById("score-objective-tokens-".concat(playerId));
                scoreDiv.innerHTML = "".concat(Number(scoreDiv.innerHTML) + incScore);
                this.incFinalScore(playerId, incScore);
            }
        }
    };
    Lumen.prototype.notif_endControlTerritory = function (notif) {
        var playerId = notif.args.playerId;
        var incScore = notif.args.incScore;
        //document.getElementById(`territory-mask-${notif.args.territoryId}`)?.classList.add('highlight');
        if (playerId) {
            this.displayScoring("territory-".concat(notif.args.territoryId), this.getPlayerColor(playerId), incScore, ANIMATION_MS * 2);
        }
        this.notif_score(notif);
    };
    Lumen.prototype.notif_revealObjectiveTokens = function (notif) {
        this.getPlayerTable(notif.args.playerId).revealObjectiveTokens(notif.args.tokens);
    };
    Lumen.prototype.notif_updateControlCounters = function (notif) {
        var _this = this;
        Object.keys(notif.args.counters).forEach(function (key) {
            var playerCounters = notif.args.counters[key];
            [1, 3, 5, 7].forEach(function (lumens) { return _this.controlCounters[key][lumens].toValue(playerCounters[lumens]); });
        });
    };
    Lumen.prototype.notif_updateVisibleScore = function (notif) {
        var _a;
        (_a = this.scoreCtrl[notif.args.playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.score);
    };
    Lumen.prototype.notif_updateHiddenScore = function (notif) {
        this.hiddenScoreCounter.toValue(notif.args.score);
    };
    Lumen.prototype.notif_setRealizedObjective = function (notif) {
        this.markRealizedObjective(notif.args.letter, notif.args.realizedBy);
    };
    Lumen.prototype.notif_elimination = function (notif) {
        var _a, _b;
        (_a = this.scoreCtrl[notif.args.playerId]) === null || _a === void 0 ? void 0 : _a.toValue(0);
        (_b = this.scoreCtrl[notif.args.opponentId]) === null || _b === void 0 ? void 0 : _b.toValue(1);
    };
    Lumen.prototype.notif_doubleElimination = function () {
        var _this = this;
        Object.keys(this.gamedatas.players).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(0); });
    };
    Lumen.prototype.markRealizedObjective = function (letter, realizedBy) {
        var color = this.getPlayerColor(realizedBy);
        var div = document.getElementById("objective-tokens-legend-".concat(letter[0], "-").concat(color));
        if (div) {
            div.insertAdjacentHTML('beforeend', "\n                <div class=\"player-token\" data-color=\"".concat(color, "\"></div>\n            "));
        }
        else {
            console.warn('no objective marker for', letter[0], color);
        }
    };
    Lumen.prototype.seasonToLumens = function (season) {
        switch (season) {
            case 'Winter': return 1;
            case 'Autumn': return 3;
            case 'Summer': return 5;
            case 'Spring': return 7;
        }
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Lumen.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                if (args.whiteDieFace !== undefined && args.whiteDieFace[0] != '<') {
                    args.whiteDieFace = "<div class=\"die-icon\" data-color=\"white\">".concat(args.whiteDieFace, "</div>");
                }
                if (args.blackDieFace !== undefined && args.blackDieFace[0] != '<') {
                    args.blackDieFace = "<div class=\"die-icon\" data-color=\"black\">".concat(args.blackDieFace, "</div>");
                }
                if (args.operation && args.operation[0] != '<') {
                    args.operation = "<div class=\"operation-icon\" data-type=\"".concat(args.operation, "\"></div>");
                }
                if (args.discover_tile == '' && args.discoverTile) {
                    args.discover_tile = "<div class=\"discover-tile\" data-type=\"".concat(args.discoverTile.type, "\" data-sub-type=\"").concat(args.discoverTile.subType, "\"></div>");
                }
                ['season', 'originSeason'].forEach(function (field) {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = "<div class=\"territory-img\" data-lumens=\"".concat(_this.seasonToLumens(args[field]), "\"></div> ").concat(_(args[field]));
                    }
                });
                ['fighterType', 'fighterType2', 'fighterType3'].forEach(function (field) {
                    var fighter = args[field.replace('Type', '')];
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<' && fighter !== null) {
                        args[field] = "<div class=\"fighter\" data-color=\"".concat(_this.getPlayerColor(fighter.playerId), "\" data-sub-type=\"").concat(fighter.subType, "\"></div>");
                    }
                });
                ['cardinalDirection'].forEach(function (field) {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = "<strong>".concat(_(args[field]), "</strong>");
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return Lumen;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.lumen", ebg.core.gamegui, new Lumen());
});
