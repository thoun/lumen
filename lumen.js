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
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function stockSlideAnimation(settings) {
    var promise = new Promise(function (success) {
        var _a;
        var originBR = settings.fromElement.getBoundingClientRect();
        var destinationBR = settings.element.getBoundingClientRect();
        var deltaX = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        var deltaY = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
        settings.element.style.zIndex = '10';
        settings.element.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px) rotate(").concat((_a = settings.rotationDelta) !== null && _a !== void 0 ? _a : 0, "deg)");
        var side = settings.element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            var cardSides_1 = settings.element.getElementsByClassName('card-sides')[0];
            cardSides_1.style.transition = 'none';
            settings.element.dataset.side = settings.originalSide;
            setTimeout(function () {
                cardSides_1.style.transition = null;
                settings.element.dataset.side = side;
            });
        }
        setTimeout(function () {
            settings.element.offsetHeight;
            settings.element.style.transition = "transform 0.5s linear";
            settings.element.offsetHeight;
            settings.element.style.transform = null;
        }, 10);
        setTimeout(function () {
            settings.element.style.zIndex = null;
            settings.element.style.transition = null;
            success(true);
        }, 600);
    });
    return promise;
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
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element) {
        this.manager = manager;
        this.element = element;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
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
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        if (this.cardInStock(card)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in stock then we ignore animation
        var currentStock = this.manager.getCardStock(card);
        if (currentStock === null || currentStock === void 0 ? void 0 : currentStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: currentStock }), settings);
            element.dataset.side = ((_a = settings === null || settings === void 0 ? void 0 : settings.visible) !== null && _a !== void 0 ? _a : true) ? 'front' : 'back';
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, animation, settings);
        }
        else {
            var element = this.manager.createCardElement(card, ((_b = settings === null || settings === void 0 ? void 0 : settings.visible) !== null && _b !== void 0 ? _b : true));
            promise = this.moveFromElement(card, element, animation, settings);
        }
        this.setSelectableCard(card, this.selectionMode != 'none');
        this.cards.push(card);
        return promise;
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var _a;
        var promise;
        ((_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element).appendChild(cardElement);
        cardElement.classList.remove('selectable', 'selected', 'disabled');
        promise = this.animationFromElement({
            element: cardElement,
            fromElement: animation.fromStock.element,
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        animation.fromStock.removeCard(card);
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var _a;
        var promise;
        ((_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element).appendChild(cardElement);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement({
                    element: cardElement,
                    fromElement: animation.fromStock.element,
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement({
                    element: cardElement,
                    fromElement: animation.fromElement,
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
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
    CardStock.prototype.animationFromElement = function (settings) {
        var _a;
        if (document.visibilityState !== 'hidden' && !this.manager.game.instantaneousMode) {
            var animation = (_a = settings.animation) !== null && _a !== void 0 ? _a : stockSlideAnimation;
            return animation(settings);
        }
        else {
            return Promise.resolve(false);
        }
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
        _this = _super.call(this, manager, element) || this;
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
    function ManualPositionStock(manager, element, updateDisplay) {
        var _this = _super.call(this, manager, element) || this;
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
        this.game = game;
        this.settings = settings;
        this.stocks = [];
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
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return;
        }
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
    return CardManager;
}());
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('fighter');
                div.dataset.type = '' + card.type;
                div.dataset.subType = '' + card.subType;
                if (card.playerId) {
                    div.dataset.color = game.getPlayerColor(card.playerId);
                }
                game.setTooltip(div.id, _this.getTooltip(card.subType));
                if (card.type == 10 && card.playerId) {
                    var playerToken = document.createElement('div');
                    playerToken.classList.add('player-token');
                    playerToken.dataset.color = game.getPlayerColor(card.playerId);
                    div.appendChild(playerToken);
                }
            },
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.getName = function (subType) {
        switch (subType) {
            case 1: return _("Freluquet");
            case 2: return _("Baveux");
            case 3: return _("Réanimatrice");
            case 4: return _("Pusher");
            case 5: return _("Assassin");
            case 6: return _("Emplumé");
            case 11: return _("Super Pusher");
            case 12: return _("Super Assassin");
            case 13: return _("Impatient");
            case 14: return _("Bombarde");
            case 15: return _("Tisseuse");
            case 16: return _("Rooted");
            case 17: return _("Pacificateur");
            case 18: return _("Metamorph");
            case 21: return _("Fury");
            case 22: return _("Reset");
            case 23: return _("Teleport");
            case 31: return _("Coffre");
            case 32: return _("Winter");
            case 33: return _("Freluquets");
        }
    };
    CardsManager.prototype.getStrength = function (subType) {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 2;
            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 2;
            case 15: return 2;
            case 16: return 2;
            case 17: return 2;
            case 18: return '1 / 3';
        }
    };
    CardsManager.prototype.getDescription = function (subType) {
        switch (subType) {
            case 1: return _("Freluquet");
            case 2: return _("Baveux");
            case 3: return _("Réanimatrice");
            case 4: return _("Pusher");
            case 5: return _("Assassin");
            case 6: return _("Emplumé");
            case 11: return _("Super Pusher");
            case 12: return _("Super Assassin");
            case 13: return _("Impatient");
            case 14: return _("Bombarde");
            case 15: return _("Tisseuse");
            case 16: return _("Rooted");
            case 17: return _("Pacificateur");
            case 18: return _("Metamorph");
            case 21: return _("Fury");
            case 22: return _("Reset");
            case 23: return _("Teleport");
            case 31: return _("Coffre");
            case 32: return _("Winter");
            case 33: return _("Freluquets");
        }
    };
    CardsManager.prototype.getTooltip = function (subType) {
        return "<h3>".concat(this.getName(subType), "</h3>\n        ").concat(subType < 20 ? "".concat(_("Strength:"), " <strong>").concat(this.getStrength(subType), "</strong>") : '', "\n        <p>").concat(this.getDescription(subType), "</p>\n        ");
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
        if (!div) {
            div = this.getCardElement(card).getElementsByClassName('front')[0];
        }
        div.id = "discover-tile-".concat(card.id, "-front");
        if (card.type) {
            div.dataset.type = '' + card.type;
            div.dataset.subType = '' + card.subType;
        }
        this.game.setTooltip(div.id, this.getTooltip(card.type, card.subType));
    };
    DiscoverTilesManager.prototype.getName = function (type, subType) {
        switch (type) {
            case 1: return _("Découvertes");
            case 2:
                switch (subType) {
                    case 1: return _("Brouillage");
                    case 2: return _("Planification");
                    case 3: return _("Parachutage");
                    case 4: return _("Message prioritaire");
                    case 5: return _("Coup fourré");
                }
        }
    };
    DiscoverTilesManager.prototype.getDescription = function (type, subType) {
        switch (type) {
            case 1: return _("Découvertes");
            case 2:
                switch (subType) {
                    case 1: return _("Brouillage");
                    case 2: return _("Planification");
                    case 3: return _("Parachutage");
                    case 4: return _("Message prioritaire");
                    case 5: return _("Coup fourré");
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
        if (!div) {
            div = this.getCardElement(card).getElementsByClassName('front')[0];
        }
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
    function ObjectiveDescription(letters, timing, type, text) {
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
            case 1: return _("A : First Contact"); // TODO
            case 2: return _("B : La grosse cavalerie"); // TODO
            case 3: return _("C - UN TERRITOIRE TROP LOIN"); // TODO
            case 4: return _("D - LA POSSIBILITÉ D’UNE ÎLE"); // TODO
            case 5: return _("E - APRÈS MOI LE DÉLUGE"); // TODO
            case 6: return _("F - LE SOLDAT DE L’HIVER"); // TODO
            case 7: return _("G - LA GRANDE TRAVERSÉE"); // TODO
        }
    };
    Scenario.getSynopsis = function (number) {
        switch (number) {
            case 0: return '';
            case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
            case 2: return _("Il est parfois nécessaire d’envoyer tout une armée afin de s’assurer la victoire. Mais attention à bien gérer votre campagne et ne pas perdre de temps !"); // TODO
            case 3: return _("Quand une zone s’apauvrie en Lumens il est necéssaire de s’aventurer dans des zones souvent inaccessibles."); // TODO
            case 4: return _("Les freluquets, combattants de base et non moins malins, arpentent les îles à la recherche de lumens via un réseau de galerie existant sous le Monde Perdu."); // TODO
            case 5: return _("Le Monde Perdu subit des intempéries hors du commun. certains peuple profiteront plus que d’autres de la situation !"); // TODO
            case 6: return _("Certains territoires du Monde Perdu subissent un hiver rude et localisé. Les combattants affronteront la rudesse du terrain… ou tenteront de la contourner !"); // TODO
            case 7: return _("Le printemps est rare sur le Monde Perdu mais source d’une grande quantité de lumens. Les peuples le savent et savent aussi qu’ils ne sont jamais seuls dans cette course aux lumens. Les plus rapides prennent souvent une option sur la victoire !"); // TODO
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
                    _("Traverser la rivière par voie terrestre coûte 2 actions."),
                    _("On peut voler au dessus de la rivière."),
                    _("Un jeton poussé dans la rivière est remis dans le sac de son propriétaire"), // TODO
                ];
            case 4:
                return [
                    _("Les effets spéciaux (vol, tir, ..) sont autorisés à l’intérieur d’une île, mais pas d’une île à une autre"),
                    _("Les territoires d’hiver sont tous connectés par des galeries empruntables UNIQUEMENT par les freluquets."), // TODO
                ];
            case 5:
                return [
                    _("Sauts interdits."),
                    _("Les baveux peuvent faire des déplacements terrestres."),
                    _("Les territoires verts sont boueux : impossible d’en sortir sauf pour les baveux ou en se faisant pousser."), // TODO
                ];
            case 6:
                return [
                    _("Les combattants dans les territoires de l’hiver ne peuvent pas utiliser leurs capacités spéciales."), // TODO
                ];
            case 7:
                return [
                    _("Vol par dessus le territoire de printemps interdit."), // TODO
                ];
        }
    };
    Scenario.getObjectives = function (number) {
        var DURING_GAME = _('En cours de partie :');
        var END_GAME = _('En fin de partie :');
        switch (number) {
            case 0: [];
            case 1: return [
                new ObjectiveDescription([''], DURING_GAME, null, _("Le premier joueur qui réussit à amener <i>un mercenaire</i> sur le champ de bataille gagne ce jeton Objectif.")),
                new ObjectiveDescription(['A', 'B'], DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
                new ObjectiveDescription([''], END_GAME, null, _("Le joueur qui possède le jeton d’intiative en fin de partie remporte cette pierre.")),
            ]; // TODO
            case 2: return [
                new ObjectiveDescription(['', ''], DURING_GAME, null, _("Chaque joueur qui réussit à vider son sac gagne 2 jetons Objectifs.")),
                new ObjectiveDescription([''], END_GAME, null, _("Le joueur qui possède sur sa Fiche de Commandement le moins de cellules n’appartenant ni à une Zone ni à une Chaîne d’Ordres remporte un jeton Objectif. En cas d’égalité, personne ne reçoit de jeton Objectif.")),
            ]; // TODO
            case 3: return [
                new ObjectiveDescription(['A', 'B'], DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
            ]; // TODO
            case 4: return [
                new ObjectiveDescription([''], null, null, _("Un jeton Objectif pour le joueur qui a le plus grand nombre de Combattants,")),
                new ObjectiveDescription(['+1'], null, null, _("Un jeton Objectif supplémentaire si le joueur est seul sur l’île !")),
            ]; // TODO
            case 5: return [
                new ObjectiveDescription(['A', 'B'], DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
                new ObjectiveDescription(['C'], DURING_GAME, null, _("Un jeton Objectif pour le premier joueur à atteindre ce territoire hiver.")),
            ]; // TODO
            case 6: return [
                new ObjectiveDescription(['A', 'B'], DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
                new ObjectiveDescription(['', ''], END_GAME, null, _("2 jetons Objectifs pour le joueur qui a le plus de combattants dans les territoires de l’hiver.")),
            ]; // TODO
            case 7: return [
                new ObjectiveDescription(['A'], DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
                new ObjectiveDescription(['', '', ''], END_GAME, _("LA GRANDE TRAVERSÉE :"), _("3 jetons Objectifs pour le 1er joueur à atteindre le territoire de départ de son adversaire avec un de ses combattant.")),
            ]; // TODO
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
        var _this = _super.call(this, manager, element, function () { return _this.manualPosition(); }) || this;
        _this.manager = manager;
        _this.element = element;
        _this.curve = curve;
        _this.rotation = rotation;
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
        return _this;
        // this.debugShowCurveCanvas();
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
            var _a = _this.getCoordinates(index, elements.length), x = _a.x, y = _a.y;
            cardDiv.style.left = "".concat(x - CARD_WIDTH / 2, "px");
            cardDiv.style.top = "".concat(y - CARD_HEIGHT / 2, "px");
        });
    };
    TerritoryStock.prototype.getElements = function () {
        var _this = this;
        var elements = this.getCards().map(function (card) { return _this.getCardElement(card); });
        if (!this.discoverTileStock.isEmpty()) {
            elements.push(this.discoverTileStockDiv);
        }
        if (this.initiativeMarker) {
            elements.push(document.getElementById("initiative-marker"));
        }
        return elements;
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
        if ((elementLength - 1) * cardDistance > maxDistance) {
            cardDistance = Math.floor(maxDistance / (elementLength - 1));
        }
        var cardPathLength = halfPathLength + cardDistance * (index - elementLength / 2) + CARD_DISTANCE / 4;
        return this.getPathCoordinates(cardPathLength);
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
        this.addObjectiveTokens(scenario.objectiveTokens, gamedatas.realizedObjectives);
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
            /*// TODO TEMP
            this.territoriesStocks[territoryInfos.id].addCards([
                { id: 1000 * territoryInfos.id + 1, type: 1, subType: 3, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 2, type: 1, subType: 1, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 3, type: 1, subType: 2, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
            ])*/
        });
    };
    TableCenter.prototype.addObjectiveTokens = function (objectiveTokens, realizedObjectives) {
        var map = document.getElementById("map");
        objectiveTokens.filter(function (objectiveTokenInfos) { return !realizedObjectives.includes(objectiveTokenInfos.letter); }).forEach(function (objectiveTokenInfos) {
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
        territory.appendChild(this.initiativeMarker);
        stockSlideAnimation({
            element: this.initiativeMarker,
            fromElement: previousTerritory,
        });
        this.territoriesStocks[Number(previousTerritory.dataset.id)].initiativeMarkerRemoved();
        this.territoriesStocks[territoryId].addInitiativeMarker();
    };
    TableCenter.prototype.moveFighter = function (fighter, territoryId, fromBag) {
        if (fromBag === void 0) { fromBag = false; }
        this.territoriesStocks[territoryId].addCard(fighter, fromBag ? { fromElement: document.getElementById("bag-".concat(fighter.playerId)) } : undefined, { visible: !fighter.played });
    };
    TableCenter.prototype.revealDiscoverTile = function (discoverTile) {
        this.game.discoverTilesManager.setupFrontDiv(discoverTile);
        this.game.discoverTilesManager.getCardElement(discoverTile).dataset.side = 'front';
    };
    TableCenter.prototype.highlightDiscoverTile = function (discoverTile) {
        var _a;
        (_a = this.game.discoverTilesManager.getCardElement(discoverTile)) === null || _a === void 0 ? void 0 : _a.classList.add('highlight');
    };
    TableCenter.prototype.cancelFighterChoice = function () {
        var oldChoice = document.getElementById("fighter-choice");
        if (oldChoice) {
            oldChoice.closest('.battlefield').classList.remove('temp-z-index');
            oldChoice.parentElement.removeChild(oldChoice);
        }
    };
    TableCenter.prototype.createFighterChoice = function (card) {
        var _this = this;
        var element = this.game.cardsManager.getCardElement(card);
        element.closest('.battlefield').classList.add('temp-z-index');
        var canMove = this.game.gamedatas.gamestate.args.possibleFightersToMove.some(function (moveFighter) { return moveFighter.id == card.id; });
        var canActivate = this.game.gamedatas.gamestate.args.possibleFightersToActivate.some(function (activateFighter) { return activateFighter.id == card.id; });
        dojo.place("<div id=\"fighter-choice\">\n            <button id=\"fighter-choice-move\" ".concat(canMove ? '' : ' disabled="disabled"', ">").concat(_('Move'), "</button>\n            <button id=\"fighter-choice-cancel\">\u2716</button>\n            <button id=\"fighter-choice-activate\" ").concat(canActivate ? '' : ' disabled="disabled"', ">").concat(_('Activate'), "</button>\n        </div>"), element);
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
        map.style.width = "".concat(maxRight, "px");
        map.style.height = "".concat(maxBottom + 10, "px");
    };
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var CIRCLE_WIDTH = 49.7;
var CIRCLES = [];
[1, 2, 3].forEach(function (index) { return CIRCLES[index] = [0, 145 + CIRCLE_WIDTH * (index == 3 ? 3 : index - 1)]; });
[4, 5, 6, 7, 8].forEach(function (index) { return CIRCLES[index] = [42, 120 + CIRCLE_WIDTH * (index - 4)]; });
[9, 10, 11, 12, 13, 14].forEach(function (index) { return CIRCLES[index] = [86, 45 + CIRCLE_WIDTH * (index - 9)]; });
CIRCLES[15] = [111, 0];
[16, 17, 18].forEach(function (index) { return CIRCLES[index] = [136, 45 + CIRCLE_WIDTH * (index - 16)]; });
[19, 20].forEach(function (index) { return CIRCLES[index] = [180, 70 + CIRCLE_WIDTH * (index - 19)]; });
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, firstPlayerOperation) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div class=\"background\" data-color=\"").concat(player.color, "\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-hand-cards\" class=\"hand cards\" data-player-id=\"").concat(this.playerId, "\" data-current-player=\"").concat(this.currentPlayer.toString(), "\" data-my-hand=\"").concat(this.currentPlayer.toString(), "\"></div>\n            <div class=\"name-wrapper\">\n                <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-checks\" class=\"checks\">");
        for (var i = 1; i <= 7; i++) {
            html += "<div id=\"player-table-".concat(this.playerId, "-check").concat(i, "\" class=\"check\" data-number=\"").concat(i, "\">").concat(player.checks >= i ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '', "</div>");
        }
        html += "    \n            </div>\n            <div id=\"player-table-".concat(this.playerId, "-operations\" class=\"operations\">\n                <div id=\"player-table-").concat(this.playerId, "-first-player-token\" class=\"first-player-token\" data-operation=\"").concat(firstPlayerOperation, "\" data-visible=\"").concat((firstPlayerOperation > 0).toString(), "\"></div>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-circles\" class=\"circles\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-reserve\" class=\"reserve\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-highCommand\" class=\"highCommand\">\n            </div>\n        </div>\n        ");
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
        });
        player.circles.forEach(function (circle) {
            var div = document.createElement('div');
            div.id = "player-table-".concat(_this.playerId, "-circle").concat(circle.circleId);
            div.dataset.circle = "".concat(circle.circleId);
            div.classList.add('circle');
            div.dataset.zone = '' + circle.zone;
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
            if (operation.possible) {
                var operationNumberDiv = document.getElementById("player-table-".concat(_this.playerId, "-operation").concat(key, "-number").concat(operation.currentNumber + 1));
                operationNumberDiv.classList.add('ghost');
                operationNumberDiv.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
            }
        });
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
    PlayerTable.prototype.setCancelledOperation = function (type, number) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-operation").concat(type, "-number").concat(number + 1));
        circleDiv.innerHTML = '';
    };
    PlayerTable.prototype.setPossibleCells = function (possibleCircles, value) {
        var _this = this;
        possibleCircles.forEach(function (circleId) {
            var circleDiv = document.getElementById("player-table-".concat(_this.playerId, "-circle").concat(circleId));
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
        this.discoverTilesStocks = [];
        this.objectiveTokensStocks = [];
        this.chosenFighters = [];
        this.bags = [];
        this.bagCounters = [];
        this.display = 'fit-map-and-board-to-screen';
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
        this.setActiveDisplayButton();
        var btnMapScroll = document.getElementById('display-map-scroll');
        var btnFitMap = document.getElementById('display-fit-map');
        var btnFitMapAndBoard = document.getElementById('display-fit-map-and-board');
        this.setTooltip(btnMapScroll.id, _('Scroll in map'));
        this.setTooltip(btnFitMap.id, _('Fit map to screen'));
        this.setTooltip(btnFitMapAndBoard.id, _('Fit map and board to screen'));
        btnMapScroll.addEventListener('click', function () { return _this.setMapScroll(); });
        btnFitMap.addEventListener('click', function () { return _this.setFitMap(); });
        btnFitMapAndBoard.addEventListener('click', function () { return _this.setFitMapAndBoard(); });
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
            case 'chooseCellBrouillage':
                this.onEnteringChooseCellBrouillage(args.args);
                break;
            case 'chooseFighter':
                this.onEnteringChooseFighter(args.args);
                break;
            case 'chooseTerritory':
                this.onEnteringChooseTerritory(args.args);
                break;
        }
    };
    Lumen.prototype.onEnteringNewRound = function () {
        this.playersTables.forEach(function (playerTable) { return playerTable.removeFirstPlayerToken(); });
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
    Lumen.prototype.onEnteringChooseCellBrouillage = function (args) {
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
            var onlyCoupFourre = args.remainingActions.actions.map(function (action) { return action.remaining; }).reduce(function (a, b) { return a + b; }, 0) == 0;
            if (onlyCoupFourre) {
                this.setGamestateDescription('OnlyCoupFourre');
            }
            else {
                this.setGamestateDescription(args.currentAction.type);
            }
            if (!onlyCoupFourre) {
                var subTitle = document.createElement('span');
                var texts = args.remainingActions.actions.filter(function (action) { return action.initial > 0; }).map(function (action) {
                    return "".concat(action.initial - action.remaining, "/").concat(action.initial, " <div class=\"action ").concat(action.type.toLowerCase(), "\"></div>");
                });
                subTitle.classList.add('subtitle');
                subTitle.innerHTML = '(' + (texts.length > 1 ? _('${action1} then ${action2}').replace('${action1}', texts[0]).replace('${action2}', texts[1]) : texts.join('')) + ')'; // TODO
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
                this.tableCenter.setSelectableCards(selectableCards, args.selectionSize > 1);
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
    Lumen.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;
            case 'chooseOperation':
                this.onLeavingGhostMark('operation-number');
                break;
            case 'chooseCell':
                this.onLeavingGhostMark('circle');
                break;
            case 'chooseCellLink':
                this.onLeavingChooseCellLink();
                break;
            case 'chooseCellBrouillage':
                this.onLeavingChooseCellBrouillage();
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
    Lumen.prototype.onLeavingChooseCellBrouillage = function () {
        document.querySelectorAll('[data-jamming="true"].ghost').forEach(function (elem) {
            elem.classList.remove('selectable');
            elem.dataset.jamming = 'false';
        });
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Lumen.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'askActivatePlanification':
                    this.addActionButton("activatePlanification_button", _('Activate'), function () { return _this.activatePlanification(); });
                    this.addActionButton("passPlanification_button", _('Pass'), function () { return _this.passPlanification(); });
                    break;
                case 'planificationChooseFaces':
                    this.onEnteringPlanificationChooseFaces();
                    break;
                case 'chooseOperation':
                    var chooseOperationArgs_1 = args;
                    Object.keys(chooseOperationArgs_1.operations).forEach(function (type) {
                        var operation = chooseOperationArgs_1.operations[type];
                        _this.addActionButton("chooseOperation".concat(type, "_button"), "<div class=\"operation-icon\" data-type=\"".concat(type, "\"></div> ").concat(operation.value), function () { return _this.chooseOperation(type); }, null, null, 'gray');
                        if (!operation.possible) {
                            document.getElementById("chooseOperation".concat(type, "_button")).classList.add('disabled');
                        }
                    });
                    break;
                case 'chooseCell':
                    this.addActionButton("cancelOperation_button", _('Cancel'), function () { return _this.cancelOperation(); }, null, null, 'gray');
                    break;
                case 'chooseAction':
                    var chooseActionArgs = args;
                    var replacePlaceAndMove = function (text) { return text.replace('${place}', "<div class=\"action place\"></div>").replace('${move}', "<div class=\"action move\"></div>"); };
                    this.addActionButton("startWithActionPlay_button", replacePlaceAndMove(_('Start with ${place} then ${move}')), function () { return _this.startWithAction(1); });
                    var remainingPlays = chooseActionArgs.remainingPlays;
                    var remainingMoves = chooseActionArgs.remainingMoves;
                    if (remainingPlays == 0) {
                        document.getElementById("startWithActionPlay_button").classList.add('disabled');
                    }
                    this.addActionButton("startWithActionMove_button", replacePlaceAndMove(_('Start with ${move} then ${place}')), function () { return _this.startWithAction(2); });
                    if (remainingMoves == 0) {
                        document.getElementById("startWithActionMove_button").classList.add('disabled');
                    }
                    if (chooseActionArgs.canUseCoupFourre) {
                        this.addActionButton("useCoupFourre_button", _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), function () { return _this.useCoupFourre(); });
                    }
                    break;
                case 'chooseFighter':
                    var chooseFighterArgs = args;
                    if (!chooseFighterArgs.move) {
                        if (chooseFighterArgs.couldUseCoupFourre) {
                            this.addActionButton("useCoupFourre_button", _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), function () { return _this.useCoupFourre(); });
                            if (!chooseFighterArgs.canUseCoupFourre) {
                                document.getElementById("useCoupFourre_button").classList.add('disabled');
                            }
                        }
                        var shouldntPass_1 = chooseFighterArgs.remainingActions.actions.map(function (action) { return action.remaining; }).reduce(function (a, b) { return a + b; }, 0) > 0;
                        this.addActionButton("cancelOperation_button", _('Pass'), function () { return _this.pass(shouldntPass_1); }, null, null, shouldntPass_1 ? 'gray' : undefined);
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
                                document.getElementById("chooseFighters_button").classList.add('disabled');
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
    Lumen.prototype.setFitMap = function () {
        this.display = 'fit-map-to-screen';
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    };
    Lumen.prototype.setFitMapAndBoard = function () {
        this.display = 'fit-map-and-board-to-screen';
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    };
    Lumen.prototype.setMapScroll = function () {
        this.display = 'scroll';
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
        var fullTable = document.getElementById('full-table');
        var scroll = this.display === 'scroll';
        var playAreaViewportHeight = window.innerHeight - (mapFrame.getBoundingClientRect().top - document.body.getBoundingClientRect().top);
        mapFrame.style.maxHeight = "".concat(playAreaViewportHeight, "px");
        document.getElementById('scroll-buttons').dataset.scroll = scroll.toString();
        fullTable.style.margin = '';
        fullTable.style.height = '';
        var zoom = 1;
        if (scroll) {
            this.mapZoom = 1;
            fullTable.style.transform = '';
            map.style.transform = "";
            map.style.maxHeight = "";
            mapFrame.style.height = "";
            this.onMapFrameScroll();
        }
        else {
            var mapWidth = Number(map.style.width.match(/\d+/)[0]);
            var mapHeight = Number(map.style.height.match(/\d+/)[0]);
            var xScale = mapFrame.clientWidth / mapWidth;
            var yScale = Number(mapFrame.style.maxHeight.match(/\d+/)[0]) / mapHeight;
            this.mapZoom = Math.min(1, Math.min(xScale, yScale));
            var newMapHeight = Math.min(playAreaViewportHeight, mapHeight * this.mapZoom);
            map.style.transform = "scale(".concat(this.mapZoom, ")");
            map.style.maxHeight = "".concat(newMapHeight, "px");
            mapFrame.style.height = "".concat(newMapHeight, "px");
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
    };
    Lumen.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].dataset.fillingPattern = (prefValue == 2).toString();
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
    Lumen.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var _a;
            var playerId = Number(player.id);
            document.getElementById("overall_player_board_".concat(playerId)).style.background = "#".concat(player.color);
            dojo.place("\n            <div id=\"bag-".concat(player.id, "\" class=\"bag\" data-color=\"").concat(player.color, "\"><span id=\"bag-").concat(player.id, "-counter\"></span></div>\n            <div id=\"player-").concat(player.id, "-discover-tiles\"></div>\n            <div id=\"player-").concat(player.id, "-objective-tokens\"></div>\n            \n            <div id=\"first-player-token-wrapper-").concat(player.id, "\" class=\"first-player-token-wrapper\"></div>"), "player_board_".concat(player.id));
            if (gamedatas.firstPlayer == playerId) {
                dojo.place("<div id=\"first-player-token\" class=\"first-player-token\"></div>", "first-player-token-wrapper-".concat(player.id));
            }
            _this.bags[playerId] = new VoidStock(_this.cardsManager, document.getElementById("bag-".concat(player.id)));
            _this.bagCounters[playerId] = new ebg.counter();
            _this.bagCounters[playerId].create("bag-".concat(player.id, "-counter"));
            _this.bagCounters[playerId].setValue(gamedatas.remainingCardsInBag[playerId]);
            _this.discoverTilesStocks[playerId] = new LineStock(_this.discoverTilesManager, document.getElementById("player-".concat(player.id, "-discover-tiles")));
            player.discoverTiles.forEach(function (discoverTile) { return _this.discoverTilesStocks[playerId].addCard(discoverTile, undefined, { visible: Boolean(discoverTile === null || discoverTile === void 0 ? void 0 : discoverTile.type) }); });
            _this.objectiveTokensStocks[playerId] = new LineStock(_this.objectiveTokensManager, document.getElementById("player-".concat(player.id, "-objective-tokens")));
            _this.objectiveTokensStocks[playerId].addCards(player.objectiveTokens, undefined, { visible: Boolean((_a = player.objectiveTokens[0]) === null || _a === void 0 ? void 0 : _a.lumens) });
        });
        this.setTooltipToClass('bag', _('TODO bag of fighters (the number indicates the remaining card count)'));
        dojo.place("\n        <div id=\"overall_player_board_0\" class=\"player-board current-player-board\">\t\t\t\t\t\n            <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n\n                <div id=\"bag-0\" class=\"bag\"><span id=\"bag-0-counter\"></span></div>\n               \n            </div>\n        </div>", "player_boards", 'first');
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
        var scenarioName = document.getElementById("scenario-name");
        var scenarioSynopsis = document.getElementById("scenario-synopsis");
        var scenarioSpecialRules = document.getElementById("scenario-special-rules");
        var scenarioObjectives = document.getElementById("scenario-objectives");
        scenarioName.innerHTML = this.scenario.title;
        scenarioSynopsis.innerHTML = this.scenario.synopsis;
        scenarioSpecialRules.innerHTML = "<div class=\"title\">".concat(_('Special rules'), "</div>").concat(this.scenario.specialRules.length ?
            "<ul>".concat(this.scenario.specialRules.map(function (text) { return "<li>".concat(text, "</li>"); }).join(''), "</ul>") :
            _('Nothing'));
        scenarioObjectives.innerHTML = "<ul>".concat(this.scenario.objectives.map(function (description) {
            var _a, _b;
            return "<li>\n                ".concat(description.letters.map(function (letter) { return "<div class=\"objective-description-token token-with-letter\">".concat(letter, "</div>"); }).join(''), "\n                <strong>").concat((_a = description.timing) !== null && _a !== void 0 ? _a : '', "</strong>\n                <strong>").concat((_b = description.type) !== null && _b !== void 0 ? _b : '', "</strong>\n                ").concat(description.text, "\n            </li>");
        }).join(''), "</ul>");
        if (this.gamedatas.scenario == 4) {
            scenarioObjectives.innerHTML = "<strong>".concat(_('En fin de partie sur chaque île :'), "</strong>") + scenarioObjectives.innerHTML;
            document.querySelector('.objective-description-token.token-with-letter:not(:empty)').classList.add('plus-one');
        }
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
        var bonusCards = [11, 12, 13, 14, 15, 16, 17, 18].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-bonus-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var actions = [21, 22, 23].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-actions-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var missions = [31, 32, 33].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-missions-".concat(subType, "\"></div>\n            <div>").concat(_this.cardsManager.getTooltip(subType), "</div>\n        </div>\n        "); }).join('');
        var discoverTiles = "\n        <div class=\"help-section\">\n            <div id=\"help-discover-tiles-1-1\"></div>\n            <div>".concat(this.discoverTilesManager.getTooltip(1, 1), "</div>\n        </div>\n        ") + [1, 2, 3, 4, 5].map(function (subType) { return "\n        <div class=\"help-section\">\n            <div id=\"help-discover-tiles-2-".concat(subType, "\"></div>\n            <div>").concat(_this.discoverTilesManager.getTooltip(2, subType), "</div>\n        </div>\n        "); }).join('');
        // TODO
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_("LES COMBATANTS DE BASE"), "</h1>\n            ").concat(baseFighters, "\n            <h1>").concat(_("LES JETONS BONUS"), "</h1>\n            <div>").concat(_('TODO'), "</div>\n            ").concat(bonusCards, "\n            <h1>").concat(_("LES ACTIONS D’ÉCLAT"), "</h1>\n            <div>").concat(_('TODO'), "</div>\n            ").concat(actions, "\n            <h1>").concat(_("LES MISSIONS PERSONNELLES"), "</h1>\n            <div>").concat(_('TODO'), "</div>\n            ").concat(missions, "\n            <h1>").concat(_("LES TUILES DECOUVERTES"), "</h1>\n            <div>").concat(_('TODO'), "</div>\n            ").concat(discoverTiles, "\n        </div>\n        ");
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
        // bonus
        [11, 12, 13, 14, 15, 16, 17, 18].forEach(function (subType) {
            return new LineStock(_this.cardsManager, document.getElementById("help-bonus-".concat(subType))).addCard({ id: 1000 + subType, type: 1, subType: subType });
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
            case 'chooseCellBrouillage':
                this.chooseCellBrouillage(cell);
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
            if ([21, 23].includes(args.move)) {
                document.getElementById("chooseFighters_button").classList.toggle('disabled', this.chosenFighters.length !== args.selectionSize);
            }
        }
    };
    Lumen.prototype.activatePlanification = function () {
        if (!this.checkAction('activatePlanification')) {
            return;
        }
        this.takeAction('activatePlanification');
    };
    Lumen.prototype.passPlanification = function () {
        if (!this.checkAction('passPlanification')) {
            return;
        }
        this.takeAction('passPlanification');
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
    Lumen.prototype.chooseCellBrouillage = function (cell) {
        if (!this.checkAction('chooseCellBrouillage')) {
            return;
        }
        this.takeAction('chooseCellBrouillage', {
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
    Lumen.prototype.chooseFighters = function (ids) {
        if (!this.checkAction('chooseFighters')) {
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
    Lumen.prototype.useCoupFourre = function () {
        if (!this.checkAction('useCoupFourre')) {
            return;
        }
        this.takeAction('useCoupFourre');
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
            ['exchangedFighters', ANIMATION_MS],
            ['score', 1],
            ['endControlTerritory', ANIMATION_MS * 2],
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
        this.getPlayerTable(notif.args.playerId).setCancelledOperation(notif.args.type, notif.args.operationsNumber);
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
            document.getElementById(destinationId).appendChild(firstPlayerToken);
            stockSlideAnimation({
                element: firstPlayerToken,
                fromElement: document.getElementById(originId),
            });
        }
    };
    Lumen.prototype.notif_takeObjectiveTokens = function (notif) {
        var _a, _b;
        var playerId = notif.args.playerId;
        this.objectiveTokensStocks[playerId].addCards(notif.args.tokens, undefined, { visible: Boolean((_a = notif.args.tokens[0]) === null || _a === void 0 ? void 0 : _a.lumens) });
        if (notif.args.letterId) {
            (_b = document.getElementById("objective-token-".concat(notif.args.letterId))) === null || _b === void 0 ? void 0 : _b.remove();
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
        var playerId = notif.args.playerId;
        this.discoverTilesStocks[playerId].addCard(notif.args.discoverTile, undefined, { visible: Boolean(notif.args.discoverTile.type) });
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
    Lumen.prototype.setFightersSide = function (fighters, side) {
        var _this = this;
        fighters.forEach(function (card) {
            var element = _this.cardsManager.getCardElement(card);
            element.dataset.side = side;
        });
    };
    Lumen.prototype.notif_setFightersActivated = function (notif) {
        this.setFightersSide(notif.args.fighters, 'back');
    };
    Lumen.prototype.notif_setFightersUnactivated = function (notif) {
        this.setFightersSide(notif.args.fighters, 'front');
    };
    Lumen.prototype.notif_exchangedFighters = function (notif) {
        var card0 = notif.args.fighters[0];
        var card1 = notif.args.fighters[1];
        var stock0 = this.cardsManager.getCardStock(card0);
        var stock1 = this.cardsManager.getCardStock(card1);
        stock1.addCard(card0);
        stock0.addCard(card1);
    };
    Lumen.prototype.notif_score = function (notif) {
        var _a;
        var playerId = notif.args.playerId;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.newScore);
        /*const incScore = notif.args.incScore;
        if (incScore != null && incScore !== undefined) {
            (this as any).displayScoring(`player-table-${playerId}-table-cards`, this.getPlayerColor(playerId), incScore, ANIMATION_MS * 3);
        }*/
    };
    Lumen.prototype.notif_endControlTerritory = function (notif) {
        var _a;
        (_a = document.getElementById("territory-mask-".concat(notif.args.territoryId))) === null || _a === void 0 ? void 0 : _a.classList.add('highlight');
        if (notif.args.playerId) {
            this.displayScoring("territory-".concat(notif.args.territoryId), this.getPlayerColor(notif.args.playerId), notif.args.incScore, ANIMATION_MS * 2);
        }
        this.notif_score(notif);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Lumen.prototype.format_string_recursive = function (log, args) {
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
