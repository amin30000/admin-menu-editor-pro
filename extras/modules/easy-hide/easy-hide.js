/// <reference path="../../../js/common.d.ts" />
/// <reference path="../../../js/knockout.d.ts" />
/// <reference path="../../../modules/actor-selector/actor-selector.ts" />
/// <reference path="../../../js/lodash-3.10.d.ts" />
/// <reference path="../../../js/lazyload.d.ts" />
/// <reference path="../../../ajax-wrapper/ajax-action-wrapper.d.ts" />
/// <reference path="./eh-preferences.d.ts" />
'use strict';
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
var ameEasyHideModel = null;
var AmeEasyHide;
(function (AmeEasyHide) {
    var _ = wsAmeLodash;
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["SORT_ALPHA"] = 0] = "SORT_ALPHA";
        SortOrder[SortOrder["SORT_INSERTION"] = 1] = "SORT_INSERTION";
    })(SortOrder || (SortOrder = {}));
    var Category = /** @class */ (function () {
        function Category(id, label, parent, invertItemState, filterState, initialSortOrder, itemSortOrder, priority, subtitle) {
            if (parent === void 0) { parent = null; }
            if (invertItemState === void 0) { invertItemState = false; }
            if (filterState === void 0) { filterState = null; }
            if (initialSortOrder === void 0) { initialSortOrder = SortOrder.SORT_ALPHA; }
            if (itemSortOrder === void 0) { itemSortOrder = SortOrder.SORT_INSERTION; }
            if (priority === void 0) { priority = Category.DEFAULT_PRIORITY; }
            if (subtitle === void 0) { subtitle = null; }
            var _this = this;
            this.id = id;
            this.label = label;
            this.parent = parent;
            this.invertItemState = invertItemState;
            this.initialSortOrder = initialSortOrder;
            this.itemSortOrder = itemSortOrder;
            this.priority = priority;
            this.subtitle = subtitle;
            this.containsSelectedCategory = ko.observable(false);
            this.isStandardRenderingEnabled = ko.observable(true);
            this.tableViewEnabled = false;
            this.tableView = null;
            this.cachedParentList = null;
            Category.counter++;
            this.safeElementId = 'ame-eh-category-n-' + Category.counter;
            this.isSelected = ko.observable(false);
            /**
             * Is this category selected or inside a selected category?
             */
            this.isInSelectedCategory = ko.pureComputed(function () {
                var current = _this;
                while (current !== null) {
                    if (current.isSelected()) {
                        return true;
                    }
                    current = current.parent;
                }
                return false;
            });
            this.isShowingItems = ko.pureComputed(function () {
                //The items are visible if this category or one of its parents is selected.
                return _this.isInSelectedCategory();
            });
            this.isExpanded = ko.observable(this.parent === null);
            this.isVisible = ko.pureComputed(function () {
                var inSelectedTree = _this.isInSelectedCategory() || _this.containsSelectedCategory();
                if (!inSelectedTree) {
                    return false;
                }
                //Show the category if it has any visible children: items or subcategories.
                var items = _this.directItems();
                if (_.some(items, function (item) { return item.isVisible(); })) {
                    return true;
                }
                var subcategories = _this.subcategories();
                return _.some(subcategories, function (category) { return category.isVisible(); });
            });
            this.subcategories = ko.observableArray([]);
            this.sortedSubcategories = ko.pureComputed(function () {
                var cats = _this.subcategories();
                //Remove categories that won't be rendered.
                cats = cats.filter(function (c) { return c.isStandardRenderingEnabled(); });
                if (_this.initialSortOrder === SortOrder.SORT_ALPHA) {
                    cats.sort(function (a, b) {
                        if (a.priority !== b.priority) {
                            return a.priority - b.priority;
                        }
                        return a.label.localeCompare(b.label);
                    });
                }
                else if (_this.initialSortOrder === SortOrder.SORT_INSERTION) {
                    //We want a stable sort that preserves insertion order for
                    //categories that have the same priority. As of this writing,
                    //Array.sort() is not stable in IE, so let's use Lodash.
                    cats = _.sortBy(cats, 'priority');
                }
                return cats;
            });
            this.items = ko.observableArray([]);
            this.directItems = ko.pureComputed(function () {
                var results = _(_this.items())
                    .filter(function (item) {
                    //An item is a direct/root level item in this category
                    //only if it has no parent or if its parent is not
                    //in the same category.
                    if (item.parent === null) {
                        return true;
                    }
                    else {
                        return !_.contains(item.parent.categories, _this);
                    }
                })
                    .value();
                //Sort items alphabetically if requested.
                if (_this.itemSortOrder === SortOrder.SORT_ALPHA) {
                    results.sort(function (a, b) {
                        return a.label.localeCompare(b.label);
                    });
                }
                return results;
            });
            this.isIndeterminate = ko.observable(false);
            //The whole category is checked if at least one of its
            //items or subcategories is checked.
            this.isChecked = ko.computed({
                read: function () {
                    var hasIndeterminateChildren = false;
                    var hasCheckedItems = false, hasUncheckedItems = false;
                    _.forEach(_this.items(), function (item) {
                        if (item.isChecked()) {
                            hasCheckedItems = true;
                        }
                        else {
                            hasUncheckedItems = true;
                        }
                        if (item.isIndeterminate()) {
                            hasIndeterminateChildren = true;
                        }
                        if (hasCheckedItems && hasUncheckedItems) {
                            //We know the category has a mix of checked and
                            //unchecked items, so there's no need to continue.
                            return false;
                        }
                    });
                    var hasCheckedCats = false, hasUncheckedCats = false;
                    _.forEach(_this.subcategories(), function (category) {
                        if (category.isChecked()) {
                            hasCheckedCats = true;
                        }
                        else {
                            hasUncheckedCats = true;
                        }
                        if (category.isIndeterminate()) {
                            hasIndeterminateChildren = true;
                        }
                        if (hasCheckedCats && hasUncheckedCats) {
                            return false;
                        }
                    });
                    var areAnyChecked = hasCheckedItems || hasCheckedCats;
                    var areAnyUnchecked = hasUncheckedItems || hasUncheckedCats;
                    _this.isIndeterminate(hasIndeterminateChildren || (areAnyChecked && areAnyUnchecked));
                    return areAnyChecked;
                },
                write: function (checked) {
                    //Update items.
                    _.forEach(_this.items(), function (item) {
                        if (item.isEditableForSelectedActor) {
                            item.isChecked(checked);
                        }
                    });
                    //Update subcategories.
                    _.forEach(_this.subcategories(), function (category) {
                        category.isChecked(checked);
                    });
                },
                deferEvaluation: true
            }).extend({ rateLimit: { timeout: 20, method: 'notifyWhenChangesStop' } });
            this.nestingDepth = ko.pureComputed({
                read: function () {
                    if (_this.parent !== null) {
                        return _this.parent.nestingDepth() + 1;
                    }
                    return 1;
                },
                deferEvaluation: true
            });
            this.navCssClasses = ko.pureComputed({
                read: function () {
                    var classes = [];
                    if (_this.isSelected()) {
                        //classes.push('ame-selected-cat-nav-item');
                    }
                    if (_this.sortedSubcategories().length > 0) {
                        classes.push('ame-cat-nav-has-children');
                    }
                    if (_this.isExpanded()) {
                        classes.push('ame-cat-nav-is-expanded');
                    }
                    if (_this.isSelected()) {
                        classes.push('ame-selected-cat-nav-item');
                    }
                    classes.push('ame-cat-nav-level-' + _this.nestingDepth());
                    return classes.join(' ');
                },
                deferEvaluation: true
            });
            this.isNavVisible = ko.pureComputed({
                read: function () {
                    if (_this.parent === null) {
                        return true;
                    }
                    if (!_this.isStandardRenderingEnabled()) {
                        return false;
                    }
                    return _this.parent.isNavVisible() && _this.parent.isExpanded();
                },
                deferEvaluation: true
            });
            //Category labels are not searched, but the table view has categories that
            //represent the same item being used on multiple screens. In that case,
            //category labels typically match item labels, so let's highlight them.
            this.highlightedLabel = ko.pureComputed(function () {
                var text = _.escape(_this.label);
                if (filterState !== null) {
                    text = filterState.highlightSearchKeywords(text);
                }
                return text;
            });
            var wasRendered = ko.observable(false);
            this.shouldRenderContent = ko.computed({
                read: function () {
                    return wasRendered();
                },
                write: function (state) {
                    //This is a write-once flag. Once it's turned on,
                    //it can't be turned off again.
                    if (wasRendered()) {
                        return;
                    }
                    wasRendered(state);
                    //Notify that a category is being rendered. The DOM might not be
                    //updated yet when this event happens, so subscribers should wait
                    //at least until the next frame.
                    if (wasRendered()) {
                        jQuery(document).trigger('adminmenueditor:ehCategoryRendering', [_this]);
                    }
                }
            });
        }
        Category.prototype.toggle = function () {
            this.isExpanded(!this.isExpanded());
        };
        Category.prototype.enableTableView = function (rowCat, columnCat) {
            this.tableViewEnabled = true;
            this.tableView = new CategoryTableView(rowCat, columnCat);
            //Disable normal rendering for the two row/column categories.
            //They will only appear in the table.
            rowCat.isStandardRenderingEnabled(false);
            columnCat.isStandardRenderingEnabled(false);
        };
        Object.defineProperty(Category.prototype, "allParents", {
            get: function () {
                //The parent property is readonly, so the result should not change after
                //the category is initialized. We can cache it indefinitely.
                if (this.cachedParentList === null) {
                    var parents = [];
                    var current = this.parent;
                    while (current !== null) {
                        parents.push(current);
                        current = current.parent;
                    }
                    //Reverse the list so that it starts at the root.
                    parents.reverse();
                    this.cachedParentList = parents;
                }
                return this.cachedParentList;
            },
            enumerable: false,
            configurable: true
        });
        Category.fromProps = function (props, parent, filterState) {
            var _a, _b, _c, _d, _e;
            if (parent === void 0) { parent = null; }
            if (filterState === void 0) { filterState = null; }
            return new Category(props.id, props.label, parent, (_a = props.invertItemState) !== null && _a !== void 0 ? _a : false, filterState, (_b = props.sort) !== null && _b !== void 0 ? _b : SortOrder.SORT_ALPHA, (_c = props.itemSort) !== null && _c !== void 0 ? _c : SortOrder.SORT_INSERTION, (_d = props.priority) !== null && _d !== void 0 ? _d : Category.DEFAULT_PRIORITY, (_e = props.subtitle) !== null && _e !== void 0 ? _e : null);
        };
        Category.DEFAULT_PRIORITY = 10;
        Category.counter = 0;
        return Category;
    }());
    function isBinaryProps(props) {
        return ('binary' in props) ? props.binary : false;
    }
    var HideableItem = /** @class */ (function () {
        function HideableItem(id, label, categories, parent, initialEnabled, isInverted, component, tooltip, subtitle, selectedActorRef, allActorsRef, filterState) {
            if (categories === void 0) { categories = []; }
            if (parent === void 0) { parent = null; }
            if (initialEnabled === void 0) { initialEnabled = {}; }
            if (isInverted === void 0) { isInverted = false; }
            if (component === void 0) { component = null; }
            if (tooltip === void 0) { tooltip = null; }
            if (subtitle === void 0) { subtitle = null; }
            var _this = this;
            this.id = id;
            this.label = label;
            this.categories = categories;
            this.parent = parent;
            this.initialEnabled = initialEnabled;
            this.isInverted = isInverted;
            this.component = component;
            this.tooltip = tooltip;
            this.subtitle = subtitle;
            this.selectedActorRef = selectedActorRef;
            this.children = [];
            this.actorSettings = new AmeObservableActorSettings(initialEnabled);
            var _isIndeterminate = ko.observable(false);
            this.isIndeterminate = ko.pureComputed(function () {
                if (selectedActorRef() === null) {
                    return _isIndeterminate();
                }
                return false;
            });
            this.isChecked = this.createCheckedObservable(selectedActorRef, allActorsRef, _isIndeterminate);
            var wasRendered = false;
            this.shouldRender = ko.observable(false);
            this.isVisible = ko.computed(function () {
                var visible = filterState.itemMatchesFilter(_this);
                if (visible && !wasRendered) {
                    wasRendered = true;
                    _this.shouldRender(true);
                }
                return visible;
            });
            this.htmlLabel = ko.pureComputed(function () {
                var html = _.escape(_this.label);
                if (_this.isVisible()) {
                    html = filterState.highlightSearchKeywords(html);
                }
                return html;
            });
        }
        HideableItem.prototype.createCheckedObservable = function (selectedActorRef, allActorsRef, outIndeterminate) {
            var _this = this;
            return ko.computed({
                read: function () {
                    var enabled = _this.actorSettings.isEnabledFor(selectedActorRef(), allActorsRef(), _this.isInverted, _this.isInverted, _this.isInverted, outIndeterminate);
                    return _this.isInverted ? (!enabled) : enabled;
                },
                write: function (checked) {
                    _this.actorSettings.setEnabledFor(selectedActorRef(), _this.isInverted ? !checked : checked, allActorsRef(), _this.isInverted);
                    for (var i = 0; i < _this.children.length; i++) {
                        _this.children[i].isChecked(checked);
                    }
                },
                deferEvaluation: true
            });
        };
        HideableItem.fromJs = function (props, selectedActor, allActors, filterState, categories, parent) {
            var _a, _b, _c, _d, _e;
            if (categories === void 0) { categories = []; }
            if (parent === void 0) { parent = null; }
            if (isBinaryProps(props)) {
                return BinaryHideableItem.fromJs(props, selectedActor, allActors, filterState, categories, parent);
            }
            return new HideableItem(props.id, props.label, categories, parent, (_a = props.enabled) !== null && _a !== void 0 ? _a : {}, (_b = props.inverted) !== null && _b !== void 0 ? _b : false, (_c = props.component) !== null && _c !== void 0 ? _c : null, (_d = props.tooltip) !== null && _d !== void 0 ? _d : null, (_e = props.subtitle) !== null && _e !== void 0 ? _e : null, selectedActor, allActors, filterState);
        };
        HideableItem.prototype.toJs = function () {
            var result = {};
            if (this.isInverted) {
                result.inverted = true;
            }
            if ((this.component !== null) && (this.component !== '')) {
                result.component = this.component;
            }
            var enabled = this.actorSettings.getAll();
            if (!_.isEmpty(enabled)) {
                result.enabled = enabled;
            }
            return result;
        };
        Object.defineProperty(HideableItem.prototype, "isEditableForSelectedActor", {
            get: function () {
                return true;
            },
            enumerable: false,
            configurable: true
        });
        return HideableItem;
    }());
    var BinaryHideableItem = /** @class */ (function (_super) {
        __extends(BinaryHideableItem, _super);
        function BinaryHideableItem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isEnabledForAll = ko.observable(false);
            return _this;
        }
        BinaryHideableItem.prototype.createCheckedObservable = function (selectedActorRef, allActorsRef, outIndeterminate) {
            var _this = this;
            var observable = ko.computed({
                read: function () {
                    if (_this.isInverted) {
                        return !_this.isEnabledForAll();
                    }
                    else {
                        return _this.isEnabledForAll();
                    }
                },
                write: function (value) {
                    if (_this.isEditableForSelectedActor) {
                        if (_this.isInverted) {
                            value = !value;
                        }
                        _this.isEnabledForAll(value);
                    }
                    else {
                        //Reset the checkbox to the original value.
                        observable.notifySubscribers();
                    }
                },
                deferEvaluation: true,
            });
            return observable;
        };
        BinaryHideableItem.fromJs = function (props, selectedActor, allActors, filterState, categories, parent) {
            var _a, _b, _c, _d;
            if (categories === void 0) { categories = []; }
            if (parent === void 0) { parent = null; }
            var instance = new BinaryHideableItem(props.id, props.label, categories, parent, {}, (_a = props.inverted) !== null && _a !== void 0 ? _a : false, (_b = props.component) !== null && _b !== void 0 ? _b : null, (_c = props.tooltip) !== null && _c !== void 0 ? _c : null, (_d = props.subtitle) !== null && _d !== void 0 ? _d : null, selectedActor, allActors, filterState);
            if (props.hasOwnProperty('enabledForAll')) {
                instance.isEnabledForAll(props.enabledForAll);
            }
            return instance;
        };
        BinaryHideableItem.prototype.toJs = function () {
            var result = _super.prototype.toJs.call(this);
            delete result.enabled;
            result.enabledForAll = this.isEnabledForAll();
            return result;
        };
        Object.defineProperty(BinaryHideableItem.prototype, "isEditableForSelectedActor", {
            get: function () {
                return (this.selectedActorRef() === null);
            },
            enumerable: false,
            configurable: true
        });
        return BinaryHideableItem;
    }(HideableItem));
    var CategoryTableView = /** @class */ (function () {
        function CategoryTableView(rowCategory, columnCategory) {
            this.rowCategory = rowCategory;
            this.columnCategory = columnCategory;
            this.itemLookup = {};
            this.columnHeaders = null;
        }
        Object.defineProperty(CategoryTableView.prototype, "rows", {
            get: function () {
                return CategoryTableView.sortCategoriesByLabel(this.rowCategory.subcategories);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CategoryTableView.prototype, "columns", {
            get: function () {
                return CategoryTableView.sortCategoriesByLabel(this.columnCategory.subcategories);
            },
            enumerable: false,
            configurable: true
        });
        CategoryTableView.sortCategoriesByLabel = function (categories) {
            var list = categories();
            list.sort(function (a, b) {
                return a.label.localeCompare(b.label);
            });
            return list;
        };
        CategoryTableView.prototype.getCellItems = function (row, column) {
            var path = [row.id, column.id];
            var items = _.get(this.itemLookup, path, null);
            if (items !== null) {
                return items;
            }
            //Find items that are present in both categories.
            items = _.intersection(row.directItems(), column.directItems());
            _.set(this.itemLookup, path, items);
            return items;
        };
        /**
         * Highlight the column heading when the user hovers over a table cell.
         *
         * @param unused Knockout provides the current model value to the callback, but we don't need it.
         * @param event JavaScript event object
         */
        CategoryTableView.prototype.onTableHover = function (unused, event) {
            if (!event || !event.target) {
                return;
            }
            var $cell = jQuery(event.target).closest('td, th');
            if ($cell.length < 1) {
                return;
            }
            if (
            //Has the header list been initialized?
            (this.columnHeaders === null)
                //The table might have been re-rendered or removed from the DOM.
                //In that case, we'll need to find the new header elements.
                || (this.columnHeaders.closest('body').length < 1)) {
                this.columnHeaders = $cell.closest('table').find('thead tr').first().find('th');
            }
            var index = $cell.index();
            //The first column doesn't have a header, so it doesn't need to be highlighted.
            if (index === 0) {
                return;
            }
            var $heading = this.columnHeaders.eq(index);
            if (!$heading || ($heading.length === 0)) {
                return;
            }
            var highlightClass = 'ame-eh-hovered-column';
            if ($heading.hasClass(highlightClass)) {
                return; //This column is already highlighted.
            }
            this.columnHeaders.removeClass(highlightClass);
            $heading.addClass(highlightClass);
        };
        return CategoryTableView;
    }());
    var FilterOptions = /** @class */ (function () {
        function FilterOptions() {
            var _this = this;
            /**
             * Bind this observable to the search box, then use searchQuery to actually
             * read the query. This is only public because it's used in a KO template.
             */
            this.internalSearchQuery = ko.observable('');
            this.searchQuery = ko.pureComputed(function () { return _this.internalSearchQuery(); });
            this.searchQuery.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
            this.searchKeywords = ko.pureComputed(function () {
                var query = _this.searchQuery().trim();
                if (query === '') {
                    return [];
                }
                return _(query.split(' '))
                    .map(function (keyword) { return keyword.trim(); })
                    .filter(function (keyword) { return (keyword !== ''); })
                    .value();
            });
            this.highlightRegex = ko.pureComputed(function () {
                var keywordList = _this.searchKeywords();
                if (keywordList.length < 1) {
                    return null;
                }
                var keywordGroup = _.map(keywordList, _.escapeRegExp).join('|');
                return new RegExp('(?:' + keywordGroup + ')', 'gi');
            });
        }
        FilterOptions.prototype.itemMatchesFilter = function (item) {
            var keywords = this.searchKeywords();
            if (keywords.length > 0) {
                var haystack_1 = item.label.toLowerCase();
                var matchesKeywords = _.all(keywords, function (keyword) { return (haystack_1.indexOf(keyword) >= 0); });
                if (!matchesKeywords) {
                    return false;
                }
            }
            return true;
        };
        FilterOptions.prototype.highlightSearchKeywords = function (input) {
            var regex = this.highlightRegex();
            if (regex === null) {
                return input;
            }
            return input.replace(regex, function (foundKeyword) {
                return '<mark class="ame-eh-search-highlight">' + foundKeyword + '</mark>';
            });
        };
        FilterOptions.prototype.clearSearchBox = function () {
            this.internalSearchQuery('');
        };
        FilterOptions.prototype.processEscKey = function (unusedKoModel, event) {
            //Ignore events triggered during IME composition.
            //See https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event#ignoring_keydown_during_ime_composition
            if (event.isComposing) {
                return true;
            }
            //noinspection JSDeprecatedSymbols
            var isEscape = (((typeof event['code'] !== 'undefined') && (event.code === 'Escape'))
                //IE doesn't support KeyboardEvent.code, so use keyCode instead.
                || ((typeof event['keyCode'] !== 'undefined') && (event.keyCode === 27)));
            if (isEscape) {
                this.clearSearchBox();
            }
            return true;
        };
        return FilterOptions;
    }());
    var Model = /** @class */ (function () {
        function Model(settings, prefs) {
            var _this = this;
            var _a, _b;
            this.categoryLookup = {};
            this.settingsData = ko.observable('');
            this.isSaveButtonEnabled = ko.observable(true);
            this.preferences = prefs.observableObject(ko);
            prefs.enableAutoSave(3000);
            this.actorSelector = new AmeActorSelector(AmeActors, true);
            this.selectedActor = this.actorSelector.createActorObservable(ko);
            this.selectedActorId = ko.pureComputed(function () {
                var actor = _this.selectedActor();
                if (actor === null) {
                    return '';
                }
                return actor.getId();
            });
            var allActors = ko.pureComputed(function () {
                return _this.actorSelector.getVisibleActors();
            });
            //Reselect the previously selected actor.
            if (settings.selectedActor && AmeActors.actorExists(settings.selectedActor)) {
                this.selectedActor(AmeActors.getActor(settings.selectedActor));
            }
            this.filterState = new FilterOptions();
            var _ = wsAmeLodash;
            //Initialize categories.
            this.rootCategory = new Category('_root', 'All', null, false, this.filterState, SortOrder.SORT_ALPHA);
            this.rootCategory.shouldRenderContent(true);
            var catsWithTableView = [];
            _.forEach(settings.categories, function (props) {
                var parent = _this.rootCategory;
                if (props.parent) {
                    parent = _this.categoryLookup[props.parent];
                }
                var cat = Category.fromProps(props, parent, _this.filterState);
                _this.categoryLookup[cat.id] = cat;
                parent.subcategories.push(cat);
                if (props.tableView) {
                    catsWithTableView.push(props);
                }
            });
            //Initialize table views. This is a separate step because tables need
            //their row and column categories to be already created.
            _.forEach(catsWithTableView, function (props) {
                var cat = _this.categoryLookup[props.id];
                cat.enableTableView(_this.categoryLookup[props.tableView.rowCategory], _this.categoryLookup[props.tableView.columnCategory]);
            });
            //Initialize items.
            var itemsById = {};
            _.forEach(settings.items, function (props) {
                var parent = null;
                if (props.parent && itemsById.hasOwnProperty(props.parent)) {
                    parent = itemsById[props.parent];
                }
                var categories = [];
                if (props.categories) {
                    _.forEach(props.categories, function (id) {
                        if (_this.categoryLookup.hasOwnProperty(id)) {
                            categories.push(_this.categoryLookup[id]);
                        }
                    });
                }
                if (categories.length < 1) {
                    categories.push(_this.rootCategory);
                }
                if (_.some(categories, 'invertItemState') && (typeof props['inverted'] === 'undefined')) {
                    props.inverted = true;
                }
                var item = HideableItem.fromJs(props, _this.selectedActor, allActors, _this.filterState, categories, parent);
                itemsById[item.id] = item;
                if (parent) {
                    parent.children.push(item);
                }
                _.forEach(categories, function (category) {
                    category.items.push(item);
                });
            });
            this.itemContainerClasses = ko.pureComputed(function () {
                var classes = [];
                var columns = _this.preferences.numberOfColumns();
                if (columns > 1) {
                    classes.push('ame-eh-item-columns-' + columns);
                }
                return classes.join(' ');
            });
            this.selectedCategory = ko.observable(this.rootCategory);
            //Update the "isSelected" and "containsSelectedCategory" flags
            //on the category object when the user selects a category.
            var previousSelectedCategory = this.selectedCategory.peek();
            if (previousSelectedCategory) {
                previousSelectedCategory.isSelected(true);
            }
            this.selectedCategory.subscribe(function (newSelection) {
                if (newSelection !== previousSelectedCategory) {
                    //Save the old selection in case changing isSelected also triggers this callback somehow.
                    var oldSelection = previousSelectedCategory;
                    previousSelectedCategory = newSelection;
                    //The previous category is no longer selected.
                    oldSelection.isSelected(false);
                    var previousTree = oldSelection.allParents;
                    var newTree = newSelection.allParents;
                    //Find the point of divergence.
                    var minLength = Math.min(previousTree.length, newTree.length);
                    var divergenceIndex = -1;
                    for (var i = 0; i < minLength; i++) {
                        if (newTree[i] !== previousTree[i]) {
                            divergenceIndex = i;
                            break;
                        }
                    }
                    //Update categories that are no longer in the selected tree.
                    if (divergenceIndex >= 0) {
                        for (var i = divergenceIndex; i < previousTree.length; i++) {
                            previousTree[i].containsSelectedCategory(false);
                        }
                    }
                    //Update categories that contain the new selection.
                    for (var i = Math.max(divergenceIndex, 0); i < newTree.length; i++) {
                        newTree[i].containsSelectedCategory(true);
                    }
                }
                newSelection.isSelected(true);
                newSelection.shouldRenderContent(true);
            });
            //Restore previously expanded categories.
            _.forEach((_a = this.preferences.csExpandedCategories()) === null || _a === void 0 ? void 0 : _a.split("\n"), function (id) {
                if ((typeof id === 'string') && _this.categoryLookup.hasOwnProperty(id)) {
                    _this.categoryLookup[id].isExpanded(true);
                }
            });
            //Save expanded categories in user preferences.
            var expandedCategories = ko.computed(function () {
                //Make a list of category IDs.
                return _(_this.categoryLookup).filter(function (category) {
                    //Skip the root category. It's always expanded.
                    if (category === _this.rootCategory) {
                        return false;
                    }
                    //Skip categories that don't have any children.
                    if (category.subcategories().length === 0) {
                        return false;
                    }
                    return category.isExpanded();
                }).pluck('id').value();
            }).extend({ rateLimit: { timeout: 100, method: 'notifyWhenChangesStop' } });
            expandedCategories.subscribe(function (newValue) {
                _this.preferences.csExpandedCategories(newValue.join("\n"));
            });
            //Reselect the previously selected category.
            if (settings.selectedCategory
                && this.categoryLookup.hasOwnProperty(settings.selectedCategory)) {
                this.selectedCategory(this.categoryLookup[settings.selectedCategory]);
            }
            //Render the first couple of categories to push the other category
            //placeholders below the bottom of the viewport.
            _(this.rootCategory.sortedSubcategories()).take(2).forEach(function (c) {
                c.shouldRenderContent(true);
            }).commit();
            //Always render the selected category.
            (_b = this.selectedCategory()) === null || _b === void 0 ? void 0 : _b.shouldRenderContent(true);
            this.selectedCategoryId = ko.pureComputed(function () {
                var category = _this.selectedCategory();
                if (category === null) {
                    return '';
                }
                return category.id;
            });
        }
        Model.prototype.onCategoryEntersViewport = function (element) {
            var category = ko.dataFor(element);
            if (category instanceof Category) {
                if (console && console.log) {
                    console.log('Rendering category', category.id);
                }
                category.shouldRenderContent(true);
            }
        };
        Model.prototype.renderAllCategories = function () {
            function renderChildren(category) {
                _.forEach(category.sortedSubcategories(), function (c) {
                    c.shouldRenderContent(true);
                    renderChildren(c);
                });
            }
            renderChildren(this.rootCategory);
        };
        Model.prototype.saveChanges = function () {
            this.isSaveButtonEnabled(false);
            this.settingsData(JSON.stringify(this.getCurrentSettings()));
            return true;
        };
        Model.prototype.getCurrentSettings = function () {
            function collectItemsRecursively(category, output) {
                if (output === void 0) { output = {}; }
                _.forEach(category.items(), function (item) {
                    if (!output.hasOwnProperty(item.id)) {
                        output[item.id] = item.toJs();
                    }
                });
                _.forEach(category.subcategories(), function (subcategory) { return collectItemsRecursively(subcategory, output); });
                return output;
            }
            return {
                items: collectItemsRecursively(this.rootCategory)
            };
        };
        return Model;
    }());
    AmeEasyHide.Model = Model;
})(AmeEasyHide || (AmeEasyHide = {}));
document.addEventListener('DOMContentLoaded', function () {
    ameEasyHideModel = new AmeEasyHide.Model(wsEasyHideData, ameEhUserPreferences);
    ko.applyBindings(ameEasyHideModel, document.getElementById('ame-easy-hide-container'));
    //Render categories lazily.
    try {
        var lazyUpdateTimer_1 = null;
        var ameEhLazyLoad_1 = new LazyLoad({
            elements_selector: '.ame-eh-lazy-category',
            unobserve_entered: true,
            callback_enter: function (element) {
                ameEasyHideModel.onCategoryEntersViewport(element);
            }
        });
        jQuery(document).on('adminmenueditor:ehCategoryRendering', function () {
            //New placeholders might be created after rendering a category,
            //so let's update LazyLoad.
            //Debounce updates by ensuring that there's only one pending timer.
            if (lazyUpdateTimer_1 !== null) {
                clearTimeout(lazyUpdateTimer_1);
            }
            lazyUpdateTimer_1 = window.setTimeout(function () {
                lazyUpdateTimer_1 = null;
                ameEhLazyLoad_1.update();
            }, 40);
        });
    }
    catch (ex) {
        //I'm not sure if LazyLoad will actually throw an exception if the user has
        //an old browser that doesn't support IntersectionObserver, but let's fall back
        //to showing all categories if anything goes wrong.
        ameEasyHideModel.renderAllCategories();
    }
    //Handle clicks on the "dismiss" button in the explanatory notice. It wouldn't be safe
    //to use Knockout for this because WordPress automatically moves notices below the first
    //h1/h2 element, and any external DOM manipulation can mess up KO bindings.
    jQuery('#ame-easy-hide-explanation').on('click', '.notice-dismiss', function () {
        if (typeof ameEhIsExplanationHidden !== 'undefined') {
            ameEhIsExplanationHidden(true);
            ameEhIsExplanationHidden.save();
        }
    });
    //We no longer need the input data, so we can potentially free up
    //some memory by clearing it.
    wsEasyHideData = null;
});
//# sourceMappingURL=easy-hide.js.map