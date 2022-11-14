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
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "card-".concat(card.id); },
            setupDiv: function (card, div) { return div.classList.add('fighter'); },
            setupFrontDiv: function (card, div) {
                div.innerHTML = "".concat(card.type, " ").concat(card.subType, "\n                <button id=\"card-").concat(card.id, "-play\">play ").concat(card.id, "</button>\n                <button id=\"card-").concat(card.id, "-move\">move ").concat(card.id, "</button>\n                <button id=\"card-").concat(card.id, "-activate\">activate ").concat(card.id, "</button>\n                ");
                document.getElementById("card-".concat(card.id, "-play")).addEventListener('click', function () { return _this.game.playFighter(card.id); });
                document.getElementById("card-".concat(card.id, "-move")).addEventListener('click', function () { return _this.game.moveFighter(card.id); });
                document.getElementById("card-".concat(card.id, "-activate")).addEventListener('click', function () { return _this.game.activateFighter(card.id); });
            },
            setupBackDiv: function (card, div) {
                div.innerHTML = "".concat(card.type, " ").concat(card.subType, "\n                <button id=\"card-").concat(card.id, "-move-back\">move ").concat(card.id, "</button>\n                ");
                document.getElementById("card-".concat(card.id, "-move-back")).addEventListener('click', function () { return _this.game.moveFighter(card.id); });
            },
        }) || this;
        _this.game = game;
        return _this;
    }
    return CardsManager;
}(CardManager));
var DiscoverTilesManager = /** @class */ (function (_super) {
    __extends(DiscoverTilesManager, _super);
    function DiscoverTilesManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "discover-tile-".concat(card.id); },
            setupDiv: function (card, div) { return div.classList.add('discover-tile'); },
            setupFrontDiv: function (card, div) {
                if (card.type) {
                    div.dataset.type = '' + card.type;
                    div.dataset.subType = '' + card.subType;
                }
            }
        }) || this;
        _this.game = game;
        return _this;
    }
    return DiscoverTilesManager;
}(CardManager));
var Territory = /** @class */ (function () {
    function Territory(id, clipPath) {
        this.id = id;
        this.clipPath = clipPath;
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
var ObjectiveTokenPosition = /** @class */ (function () {
    function ObjectiveTokenPosition(letter, x, y) {
        this.letter = letter;
        this.x = x;
        this.y = y;
    }
    return ObjectiveTokenPosition;
}());
var ScenarioInfos = /** @class */ (function () {
    function ScenarioInfos(battlefields, objectiveTokens, synopsis, specialRules, objectives) {
        this.battlefields = battlefields;
        this.objectiveTokens = objectiveTokens;
        this.synopsis = synopsis;
        this.specialRules = specialRules;
        this.objectives = objectives;
    }
    return ScenarioInfos;
}());
var BATTLEFIELDS = [
    null,
    new Battlefield(1, [
        new Territory(11, 1),
        new Territory(15, 5),
    ]),
    new Battlefield(2, [
        new Territory(27, 7),
    ]),
    new Battlefield(3, [
        new Territory(31, 1),
        new Territory(33, 3),
    ]),
    new Battlefield(4, [
        new Territory(41, 1),
        new Territory(45, 5),
    ]),
    new Battlefield(5, [
        new Territory(51, 1),
        new Territory(53, 3),
        new Territory(54, 3),
    ]),
    new Battlefield(6, [
        new Territory(61, 1),
        new Territory(63, 3),
        new Territory(65, 5),
    ]),
    new Battlefield(6, [
        new Territory(71, 1),
        new Territory(73, 3),
        new Territory(75, 5),
    ]),
];
var Scenario = /** @class */ (function (_super) {
    __extends(Scenario, _super);
    function Scenario(number) {
        return _super.call(this, Scenario.getBattlefields(number), Scenario.getObjectiveTokens(number), Scenario.getSynopsis(number), Scenario.getSpecialRules(number), Scenario.getObjectives(number)) || this;
    }
    Scenario.getBattlefields = function (number) {
        switch (number) {
            case 1:
                return [
                    new BattlefieldPosition(1, 0, 0, 0),
                    new BattlefieldPosition(2, 0, 0, 0),
                    new BattlefieldPosition(3, 0, 0, 0),
                    new BattlefieldPosition(4, 0, 0, 0),
                    new BattlefieldPosition(5, 0, 0, 0),
                    new BattlefieldPosition(6, 0, 0, 0),
                    new BattlefieldPosition(7, 0, 0, 0),
                ];
        }
    };
    Scenario.getObjectiveTokens = function (number) {
        switch (number) {
            case 1:
                return [
                    new ObjectiveTokenPosition('B1', 300, 200),
                    new ObjectiveTokenPosition('B2', 600, 300),
                ];
        }
    };
    Scenario.getSynopsis = function (number) {
        switch (number) {
            case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
        }
    };
    Scenario.getSpecialRules = function (number) {
        switch (number) {
            case 1: return [];
        }
    };
    Scenario.getObjectives = function (number) {
        switch (number) {
            case 1: return [
                '<strong>' + _("En cours de partie :") + '</strong>' + _("Le premier joueur qui réussit à amener <i>un mercenaire</i> sur le champ de bataille gagne ce jeton Objectif."),
                '<strong>' + _("En cours de partie :") + '</strong>' + '<strong>' + _("Frontières") + ' - </strong>' + _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."),
                '<strong>' + _("En fin de partie :") + '</strong>' + _("Le joueur qui possède le jeton d’intiative en fin de partie remporte cette pierre."),
            ]; // TODO
        }
    };
    return Scenario;
}(ScenarioInfos));
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.fightersStocks = [];
        this.discoverTilesStocks = [];
        var scenario = game.scenario;
        this.addBattlefields(scenario.battlefields);
        this.addObjectiveTokens(scenario.objectiveTokens);
        this.addInitiativeMarker(gamedatas.initiativeMarkerTerritory);
        gamedatas.fightersOnTerritories.forEach(function (card) { return _this.fightersStocks[card.locationArg].addCard(card, undefined, { visible: !card.played }); });
        gamedatas.discoverTilesOnTerritories.forEach(function (discoverTile) { return _this.discoverTilesStocks[discoverTile.locationArg].addCard(discoverTile, undefined, { visible: discoverTile.visible }); });
    }
    TableCenter.prototype.addBattlefields = function (battlefields) {
        var _this = this;
        var map = document.getElementById("map");
        battlefields.forEach(function (battlefieldInfos) {
            var battlefield = document.createElement('div');
            battlefield.id = "battlefield-".concat(battlefieldInfos.battlefieldId);
            battlefield.classList.add('battlefield');
            battlefield.innerHTML = "battlefield-".concat(battlefieldInfos.battlefieldId);
            map.appendChild(battlefield);
            _this.addTerritories(BATTLEFIELDS[battlefieldInfos.battlefieldId].territories, battlefield);
        });
    };
    TableCenter.prototype.addTerritories = function (territories, battlefield) {
        var _this = this;
        territories.forEach(function (territoryInfos) {
            var territory = document.createElement('div');
            territory.id = "territory-".concat(territoryInfos.id);
            territory.classList.add('territory');
            territory.innerHTML = "\n            territory-".concat(territoryInfos.id, "\n            <div id=\"territory-").concat(territoryInfos.id, "-fighters\"></div>\n            <div id=\"territory-").concat(territoryInfos.id, "-discover-tiles\"></div>\n            ");
            battlefield.appendChild(territory);
            territory.addEventListener('click', function () { return _this.game.territoryClick(territoryInfos.id); });
            _this.fightersStocks[territoryInfos.id] = new LineStock(_this.game.cards, document.getElementById("territory-".concat(territoryInfos.id, "-fighters")));
            _this.discoverTilesStocks[territoryInfos.id] = new LineStock(_this.game.discoverTiles, document.getElementById("territory-".concat(territoryInfos.id, "-discover-tiles")));
        });
    };
    TableCenter.prototype.addObjectiveTokens = function (objectiveTokens) {
        var map = document.getElementById("map");
        objectiveTokens.forEach(function (objectiveTokenInfos) {
            var objectiveToken = document.createElement('div');
            objectiveToken.id = "objective-token-".concat(objectiveTokenInfos.letter);
            objectiveToken.classList.add('objective-token');
            objectiveToken.style.left = "".concat(objectiveTokenInfos.x, "px");
            objectiveToken.style.top = "".concat(objectiveTokenInfos.y, "px");
            map.appendChild(objectiveToken);
        });
    };
    TableCenter.prototype.addInitiativeMarker = function (initiativeMarkerTerritory) {
        var territory = document.getElementById("territory-".concat(initiativeMarkerTerritory));
        this.initiativeMarker = document.createElement('div');
        this.initiativeMarker.id = "initiative-marker";
        territory.appendChild(this.initiativeMarker);
    };
    TableCenter.prototype.moveInitiativeMarker = function (territoryId) {
        // TODO animate
        var territory = document.getElementById("territory-".concat(territoryId));
        territory.appendChild(this.initiativeMarker);
    };
    TableCenter.prototype.moveFighter = function (fighter, territoryId) {
        // TODO
        document.getElementById("territory-".concat(territoryId)).appendChild(document.getElementById("card-".concat(fighter.id)));
    };
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
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div class=\"background\" data-color=\"").concat(player.color, "\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-hand-cards\" class=\"hand cards\" data-player-id=\"").concat(this.playerId, "\" data-current-player=\"").concat(this.currentPlayer.toString(), "\" data-my-hand=\"").concat(this.currentPlayer.toString(), "\"></div>\n            <div class=\"name-wrapper\">\n                <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-checks\" class=\"checks\">");
        for (var i = 1; i <= 7; i++) {
            html += "<div id=\"player-table-".concat(this.playerId, "-check").concat(i, "\" class=\"check\" data-number=\"").concat(i, "\">").concat(player.checks >= i ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '', "</div>");
        }
        html += "    \n            </div>\n            <div id=\"player-table-".concat(this.playerId, "-operations\" class=\"operations\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-circles\" class=\"circles\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-reserve\" class=\"reserve\">\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-highCommand\" class=\"highCommand\">\n            </div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        [1, 2, 3, 4, 5].forEach(function (operation) {
            (operation > 3 ? [1, 2, 3, 4] : [1, 2, 3]).forEach(function (number) {
                var div = document.createElement('div');
                div.id = "player-table-".concat(_this.playerId, "-operation").concat(operation, "-number").concat(number);
                div.classList.add('operation-number');
                div.dataset.operation = '' + operation;
                div.dataset.number = '' + number;
                div.innerHTML = "".concat(player.operations[operation] >= number ? "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>") : '');
                div.addEventListener('click', function () { return _this.game.operationClick(operation); });
                document.getElementById("player-table-".concat(_this.playerId, "-operations")).appendChild(div);
            });
        });
        player.circles.forEach(function (circle) {
            var _a;
            var div = document.createElement('div');
            div.id = "player-table-".concat(_this.playerId, "-circle").concat(circle.circleId);
            div.dataset.circle = "".concat(circle.circleId);
            div.classList.add('circle');
            div.innerHTML = "".concat((_a = circle.value) !== null && _a !== void 0 ? _a : '');
            document.getElementById("player-table-".concat(_this.playerId, "-circles")).appendChild(div);
            div.addEventListener('click', function () { return _this.game.cellClick(circle.circleId); });
        });
        this.reserve = new SlotStock(this.game.cards, document.getElementById("player-table-".concat(this.playerId, "-reserve")), {
            slotsIds: [1, 2, 3],
            mapCardToSlot: function (card) { return card.locationArg; }
        });
        this.reserve.onCardClick = function (card) { return _this.cardClick(card); };
        this.reserve.addCards(player.reserve);
        this.highCommand = new SlotStock(this.game.cards, document.getElementById("player-table-".concat(this.playerId, "-highCommand")), {
            slotsIds: [1, 2, 3, 4, 5],
            mapCardToSlot: function (card) { return card.locationArg; }
        });
        this.highCommand.onCardClick = function (card) { return _this.cardClick(card); };
        this.highCommand.addCards(player.highCommand);
    }
    PlayerTable.prototype.cardClick = function (card) {
        if (card.type < 20) {
            this.game.playFighter(card.id);
        }
        else if (card.type < 30) {
            this.game.activateFighter(card.id);
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
        // TODO set token to line if firstPlayer
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
        circleDiv.innerHTML = value === -1 ? 'X' /* TODO Brouillage*/ : '' + value;
    };
    PlayerTable.prototype.setPossibleCellLinks = function (possibleLinkCirclesIds, cellId) {
        // TODO throw new Error("Method not implemented.");
    };
    PlayerTable.prototype.addCheck = function (checks) {
        var div = document.getElementById("player-table-".concat(this.playerId, "-check").concat(checks));
        div.innerHTML = "<img src=\"".concat(g_gamethemeurl, "img/mul.gif\"/>");
    };
    PlayerTable.prototype.refillReserve = function (fighter, slot) {
        this.reserve.addCard(fighter, undefined, {
            slot: slot
        });
    };
    PlayerTable.prototype.addHighCommandCard = function (card) {
        this.highCommand.addCard(card);
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
        this.selectedPlanificationDice = {};
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
        this.cards = new CardsManager(this);
        this.discoverTiles = new DiscoverTilesManager(this);
        this.scenario = new Scenario(gamedatas.scenario);
        this.tableCenter = new TableCenter(this, this.gamedatas);
        this.setScenarioInformations();
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
            case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;
            case 'chooseCell':
                this.onEnteringChooseCell(args.args);
                break;
            case 'chooseCellLink':
                this.onEnteringChooseCellLink(args.args);
                break;
            case 'chooseFighter':
                this.onEnteringChooseFighter(args.args);
                break;
            case 'chooseTerritory':
                this.onEnteringChooseTerritory(args.args);
                break;
        }
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
    Lumen.prototype.onEnteringChooseFighter = function (args) {
        if (!args.move) {
            if (!args.remainingMoves) {
                this.setGamestateDescription('OnlyPlay');
            }
            else if (!args.remainingPlays) {
                this.setGamestateDescription('OnlyMoveActivate');
            }
            var subTitle = document.createElement('span');
            var texts = [];
            if (args.remainingPlays) {
                texts.push(_('${remainingPlays} fighters to add').replace('${remainingPlays}', args.remainingPlays));
            }
            if (args.remainingMoves) {
                texts.push(_('${remainingMoves} moves/activations').replace('${remainingMoves}', args.remainingMoves));
            }
            if (args.remainingBonusMoves) {
                texts.push(_('${remainingBonusMoves} moves/activations with Coup fourré').replace('${remainingBonusMoves}', args.remainingBonusMoves)); // TODO translate
            }
            subTitle.classList.add('subtitle');
            subTitle.innerHTML = '(' + texts.join(', ') + ')';
            document.getElementById("pagemaintitletext").appendChild(document.createElement('br'));
            document.getElementById("pagemaintitletext").appendChild(subTitle);
        }
    };
    Lumen.prototype.onEnteringChooseTerritory = function (args) {
        this.setGamestateDescription('' + args.move);
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
                case 'chooseFighter':
                    var chooseFighterArgs = args;
                    if (!chooseFighterArgs.move) {
                        var shouldntPass_1 = chooseFighterArgs.remainingPlays > 0 || chooseFighterArgs.remainingMoves > 0;
                        this.addActionButton("cancelOperation_button", _('Pass'), function () { return _this.pass(shouldntPass_1); }, null, null, shouldntPass_1 ? 'gray' : undefined);
                    }
                    break;
                /*case 'chooseTerritory':
                    // TODO TEMP
                    const chooseTerritoryArgs = args as EnteringChooseTerritoryArgs;
                    chooseTerritoryArgs.territoriesIds.forEach(territoryId =>
                    (this as any).addActionButton(`chooseTerritory${territoryId}_button`, `territory ${territoryId}`, () => this.chooseTerritory(territoryId))
                    )
                    break;*/
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
            dojo.place("<div id=\"first-player-token-wrapper-".concat(player.id, "\" class=\"first-player-token-wrapper\"></div>"), "player_board_".concat(player.id));
            if (gamedatas.firstPlayer == playerId) {
                dojo.place("<div id=\"first-player-token\"></div>", "first-player-token-wrapper-".concat(player.id));
            }
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
    Lumen.prototype.setScenarioInformations = function () {
        document.getElementById("scenario-synopsis").innerHTML = this.scenario.synopsis;
        document.getElementById("scenario-special-rules").innerHTML = "<ul>".concat(this.scenario.specialRules.map(function (text) { return "<li>".concat(text, "</li>"); }), "</ul>");
        document.getElementById("scenario-objectives").innerHTML = "<ul>".concat(this.scenario.objectives.map(function (text) { return "<li>".concat(text, "</li>"); }), "</ul>");
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
            ['takeObjectiveToken', ANIMATION_MS],
            ['moveFighter', ANIMATION_MS],
            ['refillReserve', ANIMATION_MS],
            ['moveDiscoverTileToPlayer', ANIMATION_MS],
            ['discardDiscoverTile', ANIMATION_MS],
            ['revealDiscoverTile', ANIMATION_MS],
            ['moveInitiativeMarker', ANIMATION_MS],
            ['putBackInBag', ANIMATION_MS],
            ['setFightersActivated', ANIMATION_MS],
            ['setFightersUnactivated', ANIMATION_MS],
            ['exchangedFighters', ANIMATION_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
        this.notifqueue.setIgnoreNotificationCheck('takeObjectiveToken', function (notif) {
            return notif.args.playerId == _this.getPlayerId() && !notif.args.value;
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
            var element = document.getElementById("d_die_".concat(number));
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
        this.getPlayerTable(notif.args.playerId).setPlayedOperation(notif.args.type, notif.args.number, notif.args.firstPlayer);
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
    Lumen.prototype.notif_takeObjectiveToken = function (notif) {
        // TODO check if value
    };
    Lumen.prototype.notif_moveFighter = function (notif) {
        this.tableCenter.moveFighter(notif.args.fighter, notif.args.territoryId);
    };
    Lumen.prototype.notif_refillReserve = function (notif) {
        this.getPlayerTable(notif.args.playerId).refillReserve(notif.args.fighter, notif.args.slot);
    };
    Lumen.prototype.notif_moveDiscoverTileToPlayer = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_discardDiscoverTile = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_revealDiscoverTile = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_moveInitiativeMarker = function (notif) {
        this.tableCenter.moveInitiativeMarker(notif.args.territoryId);
    };
    Lumen.prototype.notif_putBackInBag = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_setFightersActivated = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_setFightersUnactivated = function (notif) {
        // TODO
    };
    Lumen.prototype.notif_exchangedFighters = function (notif) {
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
