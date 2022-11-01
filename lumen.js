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
var Cards = /** @class */ (function () {
    function Cards(game) {
        this.game = game;
        this.COLORS = [
            _('White'),
            _('Dark blue'),
            _('Light blue'),
            _('Black'),
            _('Yellow'),
            _('Green'),
            _('Purple'),
            _('Gray'),
            _('Light orange'),
            _('Pink'),
            _('Orange'),
        ];
    }
    // gameui.cards.debugSeeAllCards()
    Cards.prototype.debugSeeAllCards = function () {
        var _this = this;
        document.querySelectorAll('.card').forEach(function (card) { return card.remove(); });
        var html = "<div id=\"all-cards\">";
        html += "</div>";
        dojo.place(html, 'full-table', 'before');
        [1, 2, 3, 4, 5, 6].forEach(function (subType) {
            var card = {
                id: 10 + subType,
                type: 1,
                subType: subType,
            };
            _this.createMoveOrUpdateCard(card, "all-cards");
        });
        [2, 3, 4, 5, 6].forEach(function (type) {
            return [1, 2, 3].forEach(function (subType) {
                var card = {
                    id: 10 * type + subType,
                    type: type,
                    subType: subType,
                };
                _this.createMoveOrUpdateCard(card, "all-cards");
            });
        });
    };
    Cards.prototype.createMoveOrUpdateCard = function (card, destinationId, instant, from) {
        var _this = this;
        if (instant === void 0) { instant = false; }
        if (from === void 0) { from = null; }
        var existingDiv = document.getElementById("card-".concat(card.id));
        var side = card.category ? 'front' : 'back';
        if (existingDiv) {
            this.game.removeTooltip("card-".concat(card.id));
            var oldType = Number(existingDiv.dataset.category);
            existingDiv.classList.remove('selectable', 'selected', 'disabled');
            if (existingDiv.parentElement.id != destinationId) {
                if (instant) {
                    document.getElementById(destinationId).appendChild(existingDiv);
                }
                else {
                    slideToObjectAndAttach(this.game, existingDiv, destinationId);
                }
            }
            existingDiv.dataset.side = '' + side;
            if (!oldType && card.category) {
                this.setVisibleInformations(existingDiv, card);
            }
            else if (oldType && !card.category) {
                if (instant) {
                    this.removeVisibleInformations(existingDiv);
                }
                else {
                    setTimeout(function () { return _this.removeVisibleInformations(existingDiv); }, 500); // so we don't change face while it is still visible
                }
            }
            if (card.category) {
                this.game.setTooltip(existingDiv.id, this.getTooltip(card.category, card.family) + "<br><br><i>".concat(this.COLORS[card.color], "</i>"));
            }
        }
        else {
            var div = document.createElement('div');
            div.id = "card-".concat(card.id);
            div.classList.add('card');
            div.dataset.id = '' + card.id;
            div.dataset.side = '' + side;
            div.innerHTML = "\n                <div class=\"card-sides\">\n                    <div class=\"card-side front\">\n                    </div>\n                    <div class=\"card-side back\">\n                    </div>\n                </div>\n            ";
            document.getElementById(destinationId).appendChild(div);
            div.addEventListener('click', function () { return _this.game.onCardClick(card); });
            if (from) {
                var fromCardId = document.getElementById(from).id;
                slideFromObject(this.game, div, fromCardId);
            }
            if (card.category) {
                this.setVisibleInformations(div, card);
                if (!destinationId.startsWith('help-')) {
                    this.game.setTooltip(div.id, this.getTooltip(card.category, card.family) + "<br><br><i>".concat(this.COLORS[card.color], "</i>"));
                }
            }
        }
    };
    Cards.prototype.updateCard = function (card) {
        var _this = this;
        var existingDiv = document.getElementById("card-".concat(card.id));
        var side = card.category ? 'front' : 'back';
        if (existingDiv) {
            this.game.removeTooltip("card-".concat(card.id));
            var oldType = Number(existingDiv.dataset.category);
            existingDiv.dataset.side = '' + side;
            if (!oldType && card.category) {
                this.setVisibleInformations(existingDiv, card);
            }
            else if (oldType && !card.category) {
                setTimeout(function () { return _this.removeVisibleInformations(existingDiv); }, 500); // so we don't change face while it is still visible
            }
            if (card.category) {
                this.game.setTooltip(existingDiv.id, this.getTooltip(card.category, card.family) + "<br><br><i>".concat(this.COLORS[card.color], "</i>"));
            }
        }
    };
    Cards.prototype.setVisibleInformations = function (div, card) {
        div.dataset.category = '' + card.category;
        div.dataset.family = '' + card.family;
        div.dataset.color = '' + card.color;
        div.dataset.index = '' + card.index;
    };
    Cards.prototype.removeVisibleInformations = function (div) {
        div.removeAttribute('data-category');
        div.removeAttribute('data-family');
        div.removeAttribute('data-color');
        div.removeAttribute('data-index');
    };
    Cards.prototype.getTooltip = function (category, family /*, withCount: boolean = false*/) {
        var withCount = true;
        switch (category) {
            case 1:
                return "\n                <div><strong>".concat(_("Mermaid"), "</strong> ").concat(withCount ? '(x4)' : '', "</div>\n                ").concat(_("1 point for each card of the color the player has the most of. If they have more mermaid cards, they must look at which of the other colors they have more of. The same color cannot be counted for more than one mermaid card."), "\n                <br><br>\n                <strong>").concat(_("Effect: If they place 4 mermaid cards, the player immediately wins the game."), "</strong>");
            case 2:
                if (family >= 4) {
                    return "<div><strong>".concat(_("Swimmer"), "/").concat(_("Shark"), "</strong> ").concat(withCount ? '(' + _('${number} of each').replace('${number}', 'x5') + ')' : '', "</div>\n                    <div>").concat(_("1 point for each combination of swimmer and shark cards."), "</div><br>\n                    <div>").concat(_("Effect:"), " ").concat(_("The player steals a random card from another player and adds it to their hand."), "</div>");
                }
                var duoCards = [
                    [_('Crab'), _("The player chooses a discard pile, consults it without shuffling it, and chooses a card from it to add to their hand. They do not have to show it to the other players."), 9],
                    [_('Boat'), _("The player immediately takes another turn."), 8],
                    [_('Fish'), _("The player adds the top card from the deck to their hand."), 7]
                ];
                var duo = duoCards[family - 1];
                return "<div><strong>".concat(duo[0], "</strong> ").concat(withCount ? "(x".concat(duo[2], ")") : '', "</div>\n                <div>").concat(_("1 point for each pair of ${card} cards.").replace('${card}', duo[0]), "</div><br>\n                <div>").concat(_("Effect:"), " ").concat(_(duo[1]), "</div>");
            case 3:
                var collectorCards = [
                    ['0, 2, 4, 6, 8, 10', '1, 2, 3, 4, 5, 6', _('Shell')],
                    ['0, 3, 6, 9, 12', '1, 2, 3, 4, 5', _('Octopus')],
                    ['1, 3, 5', '1, 2, 3', _('Penguin')],
                    ['0, 5', '1,  2', _('Sailor')],
                ];
                var collector = collectorCards[family - 1];
                return "<div><strong>".concat(collector[2], "</strong> ").concat(withCount ? "(x".concat(collector[0].split(',').length, ")") : '', "</div>\n                <div>").concat(_("${points} points depending on whether the player has ${numbers} ${card} cards.").replace('${points}', collector[0]).replace('${numbers}', collector[1]).replace('${card}', collector[2]), "</div>");
            case 4:
                var multiplierCards = [
                    [_('The lighthouse'), _('Boat'), 1],
                    [_('The shoal of fish'), _('Fish'), 1],
                    [_('The penguin colony'), _('Penguin'), 2],
                    [_('The captain'), _('Sailor'), 3],
                ];
                var multiplier = multiplierCards[family - 1];
                return "<div><strong>".concat(multiplier[0], "</strong> (x1)</div>\n                <div>").concat(_("${points} point(s) per ${card} card.").replace('${points}', multiplier[2]).replace('${card}', multiplier[1]), "</div>\n                <div>").concat(_("This card does not count as a ${card} card.").replace('${card}', multiplier[1]), "</div>");
        }
    };
    Cards.prototype.removeCard = function (div) {
        if (!div) {
            return;
        }
        div.id = "deleted".concat(div.id);
        this.removeVisibleInformations(div);
        div.remove();
    };
    return Cards;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        this.game = game;
    }
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div id=\"player-table-").concat(this.playerId, "-hand-cards\" class=\"hand cards\" data-player-id=\"").concat(this.playerId, "\" data-current-player=\"").concat(this.currentPlayer.toString(), "\" data-my-hand=\"").concat(this.currentPlayer.toString(), "\"></div>\n            <div class=\"name-wrapper\">\n                <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-operations\" class=\"operations\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-circles\" class=\"circles\">\n            </div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        [1, 2, 3, 4, 5].forEach(function (operation) {
            (operation > 3 ? [1, 2, 3, 4] : [1, 2, 3]).forEach(function (number) {
                var div = document.createElement('div');
                div.id = "player-table-".concat(_this.playerId, "-operation").concat(operation, "-number").concat(number);
                div.classList.add('operation-number');
                div.innerHTML = "".concat(player.operations[operation] >= number ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '');
                document.getElementById("player-table-".concat(_this.playerId, "-operations")).appendChild(div);
            });
        });
        player.circles.forEach(function (circle) {
            var _a;
            var div = document.createElement('div');
            div.id = "player-table-".concat(_this.playerId, "-circle").concat(circle.circleId);
            div.classList.add('circle');
            div.innerHTML = "".concat((_a = circle.value) !== null && _a !== void 0 ? _a : '');
            document.getElementById("player-table-".concat(_this.playerId, "-circles")).appendChild(div);
            div.addEventListener('click', function () {
                if (div.classList.contains('ghost')) {
                    _this.game.chooseCell(circle.circleId);
                }
            });
        });
    }
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
    PlayerTable.prototype.setPlayedOperation = function (type, number) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-operation").concat(type, "-number").concat(number));
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
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
            circleDiv.innerHTML = '' + value;
        });
    };
    PlayerTable.prototype.setCircleValue = function (circleId, value) {
        var circleDiv = document.getElementById("player-table-".concat(this.playerId, "-circle").concat(circleId));
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = '' + value;
    };
    PlayerTable.prototype.addHighCommandCard = function (card) {
        // TODO throw new Error("Method not implemented.");
    };
    PlayerTable.prototype.addCheck = function (checks) {
        // TODO throw new Error("Method not implemented.");
    };
    PlayerTable.prototype.setZone = function (circlesIds, zoneId) {
        var _this = this;
        circlesIds.forEach(function (circleId) { return document.getElementById("player-table-".concat(_this.playerId, "-circle").concat(circleId)).dataset.zone = '' + zoneId; });
    };
    PlayerTable.prototype.setLink = function (index1, index2) {
        /*const angle = Math.atan2(circle2.Top - circle1.Top, circle2.Left - circle1.Left) * 180 / Math.PI - 90;
        TODO
        const left: circle1.Left;
        const top: circle1.Top;
        const html = `<img id="link_${this.playerId}_${index1}_${index2}" class="link chiffres" src="${g_gamethemeurl}img/num1.gif" style="left:${left}px; top:${top}px; transform: rotate(${angle}deg) scaleX(0.5) scaleY(0.5) translateY(17px);" />`;*/
    };
    return PlayerTable;
}());
var ANIMATION_MS = 500;
var ACTION_TIMER_DURATION = 5;
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
var ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
var LOCAL_STORAGE_ZOOM_KEY = 'Lumen-zoom';
var Lumen = /** @class */ (function () {
    function Lumen() {
        this.zoom = 1;
        this.playersTables = [];
        this.handCounters = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        var zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
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
        this.cards = new Cards(this);
        this.tableCenter = new TableCenter(this, this.gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
        this.setupPreferences();
        this.addHelp();
        document.getElementById('zoom-out').addEventListener('click', function () { return _this.zoomOut(); });
        document.getElementById('zoom-in').addEventListener('click', function () { return _this.zoomIn(); });
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }
        this.onScreenWidthChange = function () {
            _this.updateTableHeight();
        };
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Lumen.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;
            case 'chooseCell':
                this.onEnteringChooseCell(args.args);
                break;
        }
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
    Lumen.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'chooseOperation':
                this.onLeavingGhostMark('operation-number');
                break;
            case 'chooseCell':
                this.onLeavingGhostMark('circle');
                break;
        }
    };
    Lumen.prototype.onLeavingGhostMark = function (className) {
        Array.from(document.querySelectorAll(".".concat(className, ".ghost"))).forEach(function (elem) {
            elem.classList.remove('ghost');
            elem.innerHTML = '';
        });
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Lumen.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
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
    Lumen.prototype.setZoom = function (zoom) {
        if (zoom === void 0) { zoom = 1; }
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, '' + this.zoom);
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);
        var div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        }
        else {
            div.style.transform = "scale(".concat(zoom, ")");
            div.style.marginRight = "".concat(ZOOM_LEVELS_MARGIN[newIndex], "%");
        }
        this.updateTableHeight();
    };
    Lumen.prototype.zoomIn = function () {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    Lumen.prototype.zoomOut = function () {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    Lumen.prototype.updateTableHeight = function () {
        setTimeout(function () { return document.getElementById('zoom-wrapper').style.height = "".concat(document.getElementById('full-table').getBoundingClientRect().height, "px"); }, 600);
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
            case 200:
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
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            document.getElementById("overall_player_board_".concat(playerId)).style.background = "#".concat(player.color);
            /*// hand cards counter
            dojo.place(`<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div>
                    <span id="playerhand-counter-${player.id}"></span>
                </div>
            </div>`, `player_board_${player.id}`);

            const handCounter = new ebg.counter();
            handCounter.create(`playerhand-counter-${playerId}`);
            //handCounter.setValue(player.handCards.length);
            this.handCounters[playerId] = handCounter;*/
        });
        //this.setTooltipToClass('playerhand-counter', _('Number of cards in hand'));
    };
    Lumen.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    Lumen.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    };
    Lumen.prototype.onCardClick = function (card) {
        var cardDiv = document.getElementById("card-".concat(card.id));
        var parentDiv = cardDiv.parentElement;
        if (cardDiv.classList.contains('disabled')) {
            return;
        }
        switch (this.gamedatas.gamestate.name) {
            /*case 'takeCards':
                if (parentDiv.dataset.discard) {
                    this.takeCardFromDiscard(Number(parentDiv.dataset.discard));
                }
                break;
            case 'chooseCard':
                if (parentDiv.id == 'pick') {
                    this.chooseCard(card.id);
                }
                break;
            case 'playCards':
                if (parentDiv.dataset.myHand == `true`) {
                    if (this.selectedCards.includes(card.id)) {
                        this.selectedCards.splice(this.selectedCards.indexOf(card.id), 1);
                        cardDiv.classList.remove('selected');
                    } else {
                        this.selectedCards.push(card.id);
                        cardDiv.classList.add('selected');
                    }
                    this.updateDisabledPlayCards();
                }
                break;
            case 'chooseDiscardCard':
                if (parentDiv.id == 'discard-pick') {
                    this.chooseDiscardCard(card.id);
                }
                break;
            case 'chooseOpponent':
                const chooseOpponentArgs = this.gamedatas.gamestate.args as EnteringChooseOpponentArgs;
                if (parentDiv.dataset.currentPlayer == 'false') {
                    const stealPlayerId = Number(parentDiv.dataset.playerId);
                    if (chooseOpponentArgs.playersIds.includes(stealPlayerId)) {
                        this.chooseOpponent(stealPlayerId);
                    }
                }
                break;*/
        }
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
        var duoCards = [1, 2, 3].map(function (family) { return "\n        <div class=\"help-section\">\n            <div id=\"help-pair-".concat(family, "\"></div>\n            <div>").concat(_this.cards.getTooltip(2, family), "</div>\n        </div>\n        "); }).join('');
        var duoSection = "\n        ".concat(duoCards, "\n        <div class=\"help-section\">\n            <div id=\"help-pair-4\"></div>\n            <div id=\"help-pair-5\"></div>\n            <div>").concat(this.cards.getTooltip(2, 4), "</div>\n        </div>\n        ").concat(_("Note: The points for duo cards count whether the cards have been played or not. However, the effect is only applied when the player places the two cards in front of them."));
        var mermaidSection = "\n        <div class=\"help-section\">\n            <div id=\"help-mermaid\"></div>\n            <div>".concat(this.cards.getTooltip(1), "</div>\n        </div>");
        var collectorSection = [1, 2, 3, 4].map(function (family) { return "\n        <div class=\"help-section\">\n            <div id=\"help-collector-".concat(family, "\"></div>\n            <div>").concat(_this.cards.getTooltip(3, family), "</div>\n        </div>\n        "); }).join('');
        var multiplierSection = [1, 2, 3, 4].map(function (family) { return "\n        <div class=\"help-section\">\n            <div id=\"help-multiplier-".concat(family, "\"></div>\n            <div>").concat(_this.cards.getTooltip(4, family), "</div>\n        </div>\n        "); }).join('');
        var html = "\n        <div id=\"help-popin\">\n            ".concat(_("<strong>Important:</strong> When it is said that the player counts or scores the points on their cards, it means both those in their hand and those in front of them."), "\n\n            <h1>").concat(_("Duo cards"), "</h1>\n            ").concat(duoSection, "\n            <h1>").concat(_("Mermaid cards"), "</h1>\n            ").concat(mermaidSection, "\n            <h1>").concat(_("Collector cards"), "</h1>\n            ").concat(collectorSection, "\n            <h1>").concat(_("Point Multiplier cards"), "</h1>\n            ").concat(multiplierSection, "\n        </div>\n        ");
        // Show the dialog
        helpDialog.setContent(html);
        helpDialog.show();
        // pair
        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]].forEach(function (_a) {
            var family = _a[0], color = _a[1];
            return _this.cards.createMoveOrUpdateCard({ id: 1020 + family, category: 2, family: family, color: color, index: 0 }, "help-pair-".concat(family));
        });
        // mermaid
        this.cards.createMoveOrUpdateCard({ id: 1010, category: 1 }, "help-mermaid");
        // collector
        [[1, 1], [2, 2], [3, 6], [4, 9]].forEach(function (_a) {
            var family = _a[0], color = _a[1];
            return _this.cards.createMoveOrUpdateCard({ id: 1030 + family, category: 3, family: family, color: color, index: 0 }, "help-collector-".concat(family));
        });
        // multiplier
        [1, 2, 3, 4].forEach(function (family) { return _this.cards.createMoveOrUpdateCard({ id: 1040 + family, category: 4, family: family }, "help-multiplier-".concat(family)); });
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
            ['setPlayedOperation', ANIMATION_MS],
            ['setCancelledOperation', 1],
            ['setCircleValue', ANIMATION_MS],
            ['addCheck', 1],
            ['addHighCommandCard', ANIMATION_MS],
            ['zone', 1],
            ['link', 1],
            ['newFirstPlayer', ANIMATION_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Lumen.prototype.notif_setPlayedOperation = function (notif) {
        this.getPlayerTable(notif.args.playerId).setPlayedOperation(notif.args.type, notif.args.number);
    };
    Lumen.prototype.notif_setCancelledOperation = function (notif) {
        this.getPlayerTable(notif.args.playerId).setCancelledOperation(notif.args.type, notif.args.number);
    };
    Lumen.prototype.notif_setCircleValue = function (notif) {
        this.getPlayerTable(notif.args.playerId).setCircleValue(notif.args.circleId, notif.args.value);
    };
    Lumen.prototype.notif_addCheck = function (notif) {
        this.getPlayerTable(notif.args.playerId).addCheck(notif.args.checks);
    };
    Lumen.prototype.notif_addHighCommandCard = function (notif) {
        this.getPlayerTable(notif.args.playerId).addHighCommandCard(notif.args.card);
    };
    Lumen.prototype.notif_zone = function (notif) {
        this.getPlayerTable(notif.args.playerId).setZone(notif.args.circlesIds, notif.args.zoneId);
    };
    Lumen.prototype.notif_link = function (notif) {
        this.getPlayerTable(notif.args.playerId).setLink(notif.args.index1, notif.args.index2);
    };
    Lumen.prototype.notif_newFirstPlayer = function (notif) {
        // TODO
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
                /*['discardNumber', 'roundPoints', 'cardsPoints', 'colorBonus', 'cardName', 'cardName1', 'cardName2', 'cardColor', 'cardColor1', 'cardColor2', 'points', 'result'].forEach(field => {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = `<strong>${_(args[field])}</strong>`;
                    }
                });*/
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
