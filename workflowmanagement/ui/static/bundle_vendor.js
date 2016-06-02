var Node = Node || {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3
};
console.log($);

$.scrollWindowTo = function(pos, duration, cb) {
  if (duration == null) {
    duration = 0;
  }
  if (pos === $(window).scrollTop()) {
    $(window).trigger('scroll');
    if (typeof cb === "function") {
      cb();
    }
    return;
  }
  return $('html, body').animate({
    scrollTop: pos
  }, duration, function() {
    return typeof cb === "function" ? cb() : void 0;
  });
};

(function() {
  var arrays, basicObjects, deepClone, deepExtend, deepExtendCouple, isBasicObject,
    __slice = [].slice;

  deepClone = function(obj) {
    var func, isArr;
    if (!_.isObject(obj || _.isFunction(obj))) {
      return obj;
    }
    if (_.isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (_.isRegExp(obj)) {
      return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
    }
    isArr = _.isArray(obj || _.isArguments(obj));
    func = function(memo, value, key) {
      if (isArr) {
        memo.push(deepClone(value));
      } else {
        memo[key] = deepClone(value);
      }
      return memo;
    };
    return _.reduce(obj, func, isArr ? [] : {});
  };

  isBasicObject = function(object) {
    if(object === null) return false;
    return (object.prototype === {}.prototype || object.prototype === Object.prototype) && _.isObject(object) && !_.isArray(object) && !_.isFunction(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isArguments(object);
  };

  basicObjects = function(object) {
    return _.filter(_.keys(object), function(key) {
      return isBasicObject(object[key]);
    });
  };

  arrays = function(object) {
    return _.filter(_.keys(object), function(key) {
      return _.isArray(object[key]);
    });
  };

  deepExtendCouple = function(destination, source, maxDepth) {
    var combine, recurse, sharedArrayKey, sharedArrayKeys, sharedObjectKey, sharedObjectKeys, _i, _j, _len, _len1;
    if (maxDepth == null) {
      maxDepth = 20;
    }
    if (maxDepth <= 0) {
      console.warn('_.deepExtend(): Maximum depth of recursion hit.');
      return _.extend(destination, source);
    }
    sharedObjectKeys = _.intersection(basicObjects(destination), basicObjects(source));
    recurse = function(key) {
      return source[key] = deepExtendCouple(destination[key], source[key], maxDepth - 1);
    };
    for (_i = 0, _len = sharedObjectKeys.length; _i < _len; _i++) {
      sharedObjectKey = sharedObjectKeys[_i];
      recurse(sharedObjectKey);
    }
    sharedArrayKeys = _.intersection(arrays(destination), arrays(source));
    combine = function(key) {
      return source[key] = _.union(destination[key], source[key]);
    };
    for (_j = 0, _len1 = sharedArrayKeys.length; _j < _len1; _j++) {
      sharedArrayKey = sharedArrayKeys[_j];
      combine(sharedArrayKey);
    }
    return _.extend(destination, source);
  };

  deepExtend = function() {
    var finalObj, maxDepth, objects, _i;
    objects = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), maxDepth = arguments[_i++];
    if (!_.isNumber(maxDepth)) {
      objects.push(maxDepth);
      maxDepth = 20;
    }
    if (objects.length <= 1) {
      return objects[0];
    }
    if (maxDepth <= 0) {
      return _.extend.apply(this, objects);
    }
    finalObj = objects.shift();
    while (objects.length > 0) {
      finalObj = deepExtendCouple(finalObj, deepClone(objects.shift()), maxDepth);
    }
    return finalObj;
  };

  _.mixin({
    deepClone: deepClone,
    isBasicObject: isBasicObject,
    basicObjects: basicObjects,
    arrays: arrays,
    deepExtend: deepExtend
  });

}).call(this);
(function() {
    rivets.binders.input = {
        publishes: !0,
        routine: rivets.binders.value.routine,
        bind: function(a) {
            return a.addEventListener("input", this.publish)
        },
        unbind: function(a) {
            return a.removeEventListener("input", this.publish)
        }
    }, rivets.configure({
        prefix: "rv",
        adapter: {
            subscribe: function(a, b, c) {
                return c.wrapped = function(a, b) {
                    return c(b)
                }, a.on("change:" + b, c.wrapped)
            },
            unsubscribe: function(a, b, c) {
                return a.off("change:" + b, c.wrapped)
            },
            read: function(a, b) {
                return "cid" === b ? a.cid : a.get(b)
            },
            publish: function(a, b, c) {
                return a.cid ? a.set(b, c) : a[b] = c
            }
        }
    })
}).call(this),
function() {
    var a, b, c, d, e, f, g, h, i, j, k, l = {}.hasOwnProperty,
        m = function(a, b) {
            function c() {
                this.constructor = a
            }
            for (var d in b) l.call(b, d) && (a[d] = b[d]);
            return c.prototype = b.prototype, a.prototype = new c, a.__super__ = b.prototype, a
        };
    e = function(a) {
        function b() {
            return g = b.__super__.constructor.apply(this, arguments)
        }
        return m(b, a), b.prototype.sync = function() {}, b.prototype.indexInDOM = function() {
            var a, b = this;
            return a = $(".fb-field-wrapper").filter(function(a, c) {
                return $(c).data("cid") === b.cid
            }), $(".fb-field-wrapper").index(a)
        }, b.prototype.is_input = function() {
            return null != c.inputFields[this.get(c.options.mappings.FIELD_TYPE)]
        }, b
    }(Backbone.DeepModel), d = function(a) {
        function b() {
            return h = b.__super__.constructor.apply(this, arguments)
        }
        return m(b, a), b.prototype.initialize = function() {
            return this.on("add", this.copyCidToModel)
        }, b.prototype.model = e, b.prototype.comparator = function(a) {
            return a.indexInDOM()
        }, b.prototype.copyCidToModel = function(a) {
            return a.attributes.cid = a.cid
        }, b
    }(Backbone.Collection), f = function(a) {
        function b() {
            return i = b.__super__.constructor.apply(this, arguments)
        }
        return m(b, a), b.prototype.className = "fb-field-wrapper", b.prototype.events = {
            "click .subtemplate-wrapper": "focusEditView",
            "click .js-duplicate": "duplicate",
            "click .js-clear": "clear"
        }, b.prototype.initialize = function(a) {
            return this.parentView = a.parentView, this.listenTo(this.model, "change", this.render), this.listenTo(this.model, "destroy", this.remove)
        }, b.prototype.render = function() {
            return this.$el.addClass("response-field-" + this.model.get(c.options.mappings.FIELD_TYPE)).data("cid", this.model.cid).html(c.templates["view/base" + (this.model.is_input() ? "" : "_non_input")]({
                rf: this.model
            })), this
        }, b.prototype.focusEditView = function() {
            return this.parentView.createAndShowEditView(this.model)
        }, b.prototype.clear = function() {
            return this.parentView.handleFormUpdate(), this.model.destroy()
        }, b.prototype.duplicate = function() {
            var a;
            return a = _.clone(this.model.attributes), delete a.id, a.label += " Copy", this.parentView.createField(a, {
                position: this.model.indexInDOM() + 1
            })
        }, b
    }(Backbone.View), b = function(a) {
        function b() {
            return j = b.__super__.constructor.apply(this, arguments)
        }
        return m(b, a), b.prototype.className = "edit-response-field", b.prototype.events = {
            "click .js-add-option": "addOption",
            "click .js-remove-option": "removeOption",
            "click .js-default-updated": "defaultUpdated",
            "input .option-label-input": "forceRender"
        }, b.prototype.initialize = function(a) {
            return this.parentView = a.parentView, this.listenTo(this.model, "destroy", this.remove)
        }, b.prototype.render = function() {
            return this.$el.html(c.templates["edit/base" + (this.model.is_input() ? "" : "_non_input")]({
                rf: this.model
            })), rivets.bind(this.$el, {
                model: this.model
            }), this
        }, b.prototype.remove = function() {
            return this.parentView.editView = void 0, this.parentView.$el.find('[data-target="#addField"]').click(), b.__super__.remove.apply(this, arguments)
        }, b.prototype.addOption = function(a) {
            var b, d, e, f;
            return b = $(a.currentTarget), d = this.$el.find(".option").index(b.closest(".option")), f = this.model.get(c.options.mappings.OPTIONS) || [], e = {
                label: "",
                checked: !1
            }, d > -1 ? f.splice(d + 1, 0, e) : f.push(e), this.model.set(c.options.mappings.OPTIONS, f), this.model.trigger("change:" + c.options.mappings.OPTIONS), this.forceRender()
        }, b.prototype.removeOption = function(a) {
            var b, d, e;
            return b = $(a.currentTarget), d = this.$el.find(".js-remove-option").index(b), e = this.model.get(c.options.mappings.OPTIONS), e.splice(d, 1), this.model.set(c.options.mappings.OPTIONS, e), this.model.trigger("change:" + c.options.mappings.OPTIONS), this.forceRender()
        }, b.prototype.defaultUpdated = function(a) {
            var b;
            return b = $(a.currentTarget), "checkboxes" !== this.model.get(c.options.mappings.FIELD_TYPE) && this.$el.find(".js-default-updated").not(b).attr("checked", !1).trigger("change"), this.forceRender()
        }, b.prototype.forceRender = function() {
            return this.model.trigger("change")
        }, b
    }(Backbone.View), a = function(a) {
        function e() {
            return k = e.__super__.constructor.apply(this, arguments)
        }
        return m(e, a), e.prototype.SUBVIEWS = [], e.prototype.events = {
            "click .js-save-form": "saveForm",
            "click .fb-tabs a": "showTab",
            "click .fb-add-field-types a": "addField"
        }, e.prototype.initialize = function(a) {
            var b;
            return b = a.selector, this.formBuilder = a.formBuilder, this.bootstrapData = a.bootstrapData, null != b && this.setElement($(b)), this.collection = new d, this.collection.bind("add", this.addOne, this), this.collection.bind("reset", this.reset, this), this.collection.bind("change", this.handleFormUpdate, this), this.collection.bind("destroy add reset", this.hideShowNoResponseFields, this), this.collection.bind("destroy", this.ensureEditViewScrolled, this), this.render(), this.collection.reset(this.bootstrapData), this.initAutosave()
        }, e.prototype.initAutosave = function() {
            var a = this;
            return this.formSaved = !0, this.saveFormButton = this.$el.find(".js-save-form"), this.saveFormButton.attr("disabled", !0).text(c.options.dict.ALL_CHANGES_SAVED), setInterval(function() {
                return a.saveForm.call(a)
            }, 500), $(window).bind("beforeunload", function() {
                return a.formSaved ? void 0 : c.options.dict.UNSAVED_CHANGES
            })
        }, e.prototype.reset = function() {
            return this.$responseFields.html(""), this.addAll()
        }, e.prototype.render = function() {
            var a, b, d, e;
            for (this.$el.html(c.templates.page()), this.$fbLeft = this.$el.find(".fb-left"), this.$responseFields = this.$el.find(".fb-response-fields"), this.bindWindowScrollEvent(), this.hideShowNoResponseFields(), e = this.SUBVIEWS, b = 0, d = e.length; d > b; b++) a = e[b], new a({
                parentView: this
            }).render();
            return this
        }, e.prototype.bindWindowScrollEvent = function() {
            var a = this;
            return $(window).on("scroll", function() {
                var b, c;
                if (a.$fbLeft.data("locked") !== !0) return c = Math.max(0, $(window).scrollTop()), b = a.$responseFields.height(), a.$fbLeft.css({
                    "margin-top": Math.min(b, c)
                })
            })
        }, e.prototype.showTab = function(a) {
            var b, c, d;
            return b = $(a.currentTarget), d = b.data("target"), b.closest("li").addClass("active").siblings("li").removeClass("active"), $(d).addClass("active").siblings(".fb-tab-pane").removeClass("active"), "#editField" !== d && this.unlockLeftWrapper(), "#editField" === d && !this.editView && (c = this.collection.models[0]) ? this.createAndShowEditView(c) : void 0
        }, e.prototype.addOne = function(a, b, c) {
            var d, e;
            return e = new f({
                model: a,
                parentView: this
            }), null != c.$replaceEl ? c.$replaceEl.replaceWith(e.render().el) : null == c.position || -1 === c.position ? this.$responseFields.append(e.render().el) : 0 === c.position ? this.$responseFields.prepend(e.render().el) : (d = this.$responseFields.find(".fb-field-wrapper").eq(c.position))[0] ? d.before(e.render().el) : this.$responseFields.append(e.render().el)
        }, e.prototype.setSortable = function() {
            var a = this;
            return this.$responseFields.hasClass("ui-sortable") && this.$responseFields.sortable("destroy"), this.$responseFields.sortable({
                forcePlaceholderSize: !0,
                placeholder: "sortable-placeholder",
                stop: function(b, d) {
                    var e;
                    return d.item.data("field-type") && (e = a.collection.create(c.helpers.defaultFieldAttrs(d.item.data("field-type")), {
                        $replaceEl: d.item
                    }), a.createAndShowEditView(e)), a.handleFormUpdate(), !0
                },
                update: function(b, c) {
                    return c.item.data("field-type") ? void 0 : a.ensureEditViewScrolled()
                }
            }), this.setDraggable()
        }, e.prototype.setDraggable = function() {
            var a, b = this;
            return a = this.$el.find("[data-field-type]"), a.draggable({
                connectToSortable: this.$responseFields,
                helper: function() {
                    var a;
                    return a = $("<div class='response-field-draggable-helper' />"), a.css({
                        width: b.$responseFields.width(),
                        height: "80px"
                    }), a
                }
            })
        }, e.prototype.addAll = function() {
            return this.collection.each(this.addOne, this), this.setSortable()
        }, e.prototype.hideShowNoResponseFields = function() {
            return this.$el.find(".fb-no-response-fields")[this.collection.length > 0 ? "hide" : "show"]()
        }, e.prototype.addField = function(a) {
            var b;
            return b = $(a.currentTarget).data("field-type"), this.createField(c.helpers.defaultFieldAttrs(b))
        }, e.prototype.createField = function(a, b) {
            var c;
            return c = this.collection.create(a, b), this.createAndShowEditView(c), this.handleFormUpdate()
        }, e.prototype.createAndShowEditView = function(a) {
            var c, d, e;
            if (d = this.$el.find(".fb-field-wrapper").filter(function() {
                return $(this).data("cid") === a.cid
            }), d.addClass("editing").siblings(".fb-field-wrapper").removeClass("editing"), this.editView) {
                if (this.editView.model.cid === a.cid) return this.$el.find('.fb-tabs a[data-target="#editField"]').click(), this.scrollLeftWrapper(d, "undefined" != typeof e && null !== e && e), void 0;
                e = this.$fbLeft.css("padding-top"), this.editView.remove()
            }
            return this.editView = new b({
                model: a,
                parentView: this
            }), c = this.editView.render().$el, this.$el.find(".fb-edit-field-wrapper").html(c), this.$el.find('.fb-tabs a[data-target="#editField"]').click(), this.scrollLeftWrapper(d), this
        }, e.prototype.ensureEditViewScrolled = function() {
            return this.editView ? this.scrollLeftWrapper($(".fb-field-wrapper.editing")) : void 0
        }, e.prototype.scrollLeftWrapper = function(a) {
            var b = this;
            return this.unlockLeftWrapper(), a[0] ? $.scrollWindowTo(a.offset().top - this.$responseFields.offset().top, 200, function() {
                return b.lockLeftWrapper()
            }) : void 0
        }, e.prototype.lockLeftWrapper = function() {
            return this.$fbLeft.data("locked", !0)
        }, e.prototype.unlockLeftWrapper = function() {
            return this.$fbLeft.data("locked", !1)
        }, e.prototype.handleFormUpdate = function() {
            return this.updatingBatch ? void 0 : (this.formSaved = !1, this.saveFormButton.removeAttr("disabled").text(c.options.dict.SAVE_FORM))
        }, e.prototype.saveForm = function() {
            var a;
            if (!this.formSaved) return this.formSaved = !0, this.saveFormButton.attr("disabled", !0).text(c.options.dict.ALL_CHANGES_SAVED), this.collection.sort(), a = JSON.stringify({
                fields: this.collection.toJSON()
            }), c.options.HTTP_ENDPOINT && this.doAjaxSave(a), this.formBuilder.trigger("save", a)
        }, e.prototype.doAjaxSave = function(a) {
            var b = this;
            return $.ajax({
                url: c.options.HTTP_ENDPOINT,
                type: c.options.HTTP_METHOD,
                data: a,
                contentType: "application/json",
                success: function(a) {
                    var c, d, e, f;
                    for (b.updatingBatch = !0, d = 0, e = a.length; e > d; d++) c = a[d], null != (f = b.collection.get(c.cid)) && f.set({
                        id: c.id
                    }), b.collection.trigger("sync");
                    return b.updatingBatch = void 0
                }
            })
        }, e
    }(Backbone.View), c = function() {
        function b(b) {
            var c;
            null == b && (b = {}), _.extend(this, Backbone.Events), c = _.extend(b, {
                formBuilder: this
            }), this.mainView = new a(c)
        }
        return b.helpers = {
            defaultFieldAttrs: function(a) {
                var c, d;
                return c = {
                    label: "Untitled",
                    field_type: a,
                    required: !0,
                    field_options: {}
                }, ("function" == typeof(d = b.fields[a]).defaultAttributes ? d.defaultAttributes(c) : void 0) || c
            },
            simple_format: function(a) {
                return null != a ? a.replace(/\n/g, "<br />") : void 0
            }
        }, b.options = {
            BUTTON_CLASS: "btn btn-default",
            HTTP_ENDPOINT: "",
            HTTP_METHOD: "POST",
            mappings: {
                SIZE: "field_options.size",
                UNITS: "field_options.units",
                LABEL: "label",
                FIELD_TYPE: "field_type",
                REQUIRED: "required",
                ADMIN_ONLY: "admin_only",
                OPTIONS: "field_options.options",
                DESCRIPTION: "field_options.description",
                INCLUDE_OTHER: "field_options.include_other_option",
                INCLUDE_BLANK: "field_options.include_blank_option",
                INTEGER_ONLY: "field_options.integer_only",
                MIN: "field_options.min",
                MAX: "field_options.max",
                MINLENGTH: "field_options.minlength",
                MAXLENGTH: "field_options.maxlength",
                LENGTH_UNITS: "field_options.min_max_length_units"
            },
            dict: {
                ALL_CHANGES_SAVED: "All changes saved",
                SAVE_FORM: "Save form",
                UNSAVED_CHANGES: "You have unsaved changes. If you leave this page, you will lose those changes!"
            }
        }, b.fields = {}, b.inputFields = {}, b.nonInputFields = {}, b.registerField = function(a, c) {
            var d, e, f, g;
            for (g = ["view", "edit"], e = 0, f = g.length; f > e; e++) d = g[e], c[d] = _.template(c[d]);
            return c.field_type = a, b.fields[a] = c, "non_input" === c.type ? b.nonInputFields[a] = c : b.inputFields[a] = c
        }, b
    }(), window.Formbuilder = c, "undefined" != typeof module && null !== module ? module.exports = c : window.Formbuilder = c
}.call(this),
/*function() {
    Formbuilder.registerField("address", {
        order: 50,
        view: "<div class='input-line'>\n  <span class='street'>\n    <input type='text' />\n    <label>Address</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='city'>\n    <input type='text' />\n    <label>City</label>\n  </span>\n\n  <span class='state'>\n    <input type='text' />\n    <label>State / Province / Region</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='zip'>\n    <input type='text' />\n    <label>Zipcode</label>\n  </span>\n\n  <span class='country'>\n    <select><option>United States</option></select>\n    <label>Country</label>\n  </span>\n</div>",
        edit: "",
        addButton: '<span class="symbol"><span class="fa fa-home"></span></span> Address'
    })
}.call(this),*/
function() {
    Formbuilder.registerField("checkboxes", {
        order: 10,
        view: "<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='checkbox' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Formbuilder.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='checkbox' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
        edit: "<%= Formbuilder.templates['edit/options']({ includeOther: true }) %>",
        addButton: '<span class="symbol"><span class="fa fa-square-o"></span></span> Checkboxes',
        defaultAttributes: function(a) {
            return a.field_options.options = [{
                label: "Option 1",
                checked: !1
            }, {
                label: "Options 2",
                checked: !1
            }], a
        }
    })
}.call(this),
function() {
    Formbuilder.registerField("date", {
        order: 20,
        view: "<div class='input-line'>\n  <span class='month'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='day'>\n    <input type=\"text\" />\n    <label>DD</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='year'>\n    <input type=\"text\" />\n    <label>YYYY</label>\n  </span>\n</div>",
        edit: "",
        addButton: '<span class="symbol"><span class="fa fa-calendar"></span></span> Date'
    })
}.call(this),
function() {
    Formbuilder.registerField("dropdown", {
        order: 24,
        view: "<select>\n  <% if (rf.get(Formbuilder.options.mappings.INCLUDE_BLANK)) { %>\n    <option value=''></option>\n  <% } %>\n\n  <% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n    <option <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'selected' %>>\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </option>\n  <% } %>\n</select>",
        edit: "<%= Formbuilder.templates['edit/options']({ includeBlank: true }) %>",
        addButton: '<span class="symbol"><span class="fa fa-caret-down"></span></span> Dropdown',
        defaultAttributes: function(a) {
            return a.field_options.options = [{
                label: "",
                checked: !1
            }, {
                label: "",
                checked: !1
            }], a.field_options.include_blank_option = !1, a
        }
    })
}.call(this),
function() {
    Formbuilder.registerField("email", {
        order: 40,
        view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />",
        edit: "<%= Formbuilder.templates['edit/size']() %>",
        addButton: '<span class="symbol"><span class="fa fa-envelope-o"></span></span> Email',
        defaultAttributes: function(a) {
            return a.field_options.size = "large", a
        }
    })
}.call(this), /*function(){Formbuilder.registerField("file",{order:55,view:"<input type='file' />",edit:"",addButton:'<span class="symbol"><span class="fa fa-cloud-upload"></span></span> File'})}.call(this),*/
function() {
    Formbuilder.registerField("number", {
        order: 30,
        view: "<input type='text' />\n<% if (units = rf.get(Formbuilder.options.mappings.UNITS)) { %>\n  <%= units %>\n<% } %>",
        edit: "<%= Formbuilder.templates['edit/min_max']() %>\n<%= Formbuilder.templates['edit/units']() %>\n<%= Formbuilder.templates['edit/integer_only']() %>",
        addButton: '<span class="symbol"><span class="fa fa-number">123</span></span> Number'
    })
}.call(this),
function() {
    Formbuilder.registerField("paragraph", {
        order: 5,
        view: "<textarea class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>'></textarea>",
        edit: "<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/min_max_length']() %>",
        addButton: '<span class="symbol">&#182;</span> Paragraph',
        defaultAttributes: function(a) {
            return a.field_options.size = "large", a
        }
    })
}.call(this), /*function(){Formbuilder.registerField("price",{order:45,view:"<div class='input-line'>\n  <span class='above-line'>$</span>\n  <span class='dolars'>\n    <input type='text' />\n    <label>Dollars</label>\n  </span>\n  <span class='above-line'>.</span>\n  <span class='cents'>\n    <input type='text' />\n    <label>Cents</label>\n  </span>\n</div>",edit:"",addButton:'<span class="symbol"><span class="fa fa-usd"></span></span> Price'})}.call(this),*/
function() {
    Formbuilder.registerField("radio", {
        order: 15,
        view: "<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='radio' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Formbuilder.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='radio' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
        edit: "<%= Formbuilder.templates['edit/options']({ includeOther: true }) %>",
        addButton: '<span class="symbol"><span class="fa fa-circle-o"></span></span> Multiple Choice',
        defaultAttributes: function(a) {
            return a.field_options.options = [{
                label: "Option 1",
                checked: !1
            }, {
                label: "Option 2",
                checked: !1
            }], a
        }
    })
}.call(this),
function() {
    Formbuilder.registerField("section_break", {
        order: 0,
        type: "non_input",
        view: "<label class='section-name'><%= rf.get(Formbuilder.options.mappings.LABEL) %></label>\n<p><%= rf.get(Formbuilder.options.mappings.DESCRIPTION) %></p>",
        edit: "<div class='fb-edit-section-header'>Label</div>\n<input type='text' data-rv-input='model.<%= Formbuilder.options.mappings.LABEL %>' />\n<textarea data-rv-input='model.<%= Formbuilder.options.mappings.DESCRIPTION %>'\n  placeholder='Add a longer description to this field'></textarea>",
        addButton: "<span class='symbol'><span class='fa fa-minus'></span></span> Section Break"
    })
}.call(this),
function() {
    Formbuilder.registerField("text", {
        order: 0,
        view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />",
        edit: "<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/min_max_length']() %>",
        addButton: "<span class='symbol'><span class='fa fa-font'></span></span> Text",
        defaultAttributes: function(a) {
            return a.field_options.size = "large", a
        }
    })
}.call(this),
function() {
    Formbuilder.registerField("time", {
        order: 25,
        view: "<div class='input-line'>\n  <span class='hours'>\n    <input type=\"text\" />\n    <label>HH</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='minutes'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='seconds'>\n    <input type=\"text\" />\n    <label>SS</label>\n  </span>\n\n  <span class='am_pm'>\n    <select>\n      <option>AM</option>\n      <option>PM</option>\n    </select>\n  </span>\n</div>",
        edit: "",
        addButton: '<span class="symbol"><span class="fa fa-clock-o"></span></span> Time'
    })
}.call(this),
function() {
    Formbuilder.registerField("website", {
        order: 35,
        view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' placeholder='http://' />",
        edit: "<%= Formbuilder.templates['edit/size']() %>",
        addButton: '<span class="symbol"><span class="fa fa-link"></span></span> Website',
        defaultAttributes: function(a) {
            return a.field_options.size = "large", a
        }
    })
}.call(this), this.Formbuilder = this.Formbuilder || {}, this.Formbuilder.templates = this.Formbuilder.templates || {}, this.Formbuilder.templates["edit/base"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf = obj.rf;

    __p += (null == (__t = Formbuilder.templates["edit/base_header"]()) ? "" : __t) + "\n" + (null == (__t = Formbuilder.templates["edit/common"]()) ? "" : __t) + "\n" + (null == (__t = Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({
        rf: rf
    })) ? "" : __t) + "\n";
    return __p
}, this.Formbuilder.templates["edit/base_header"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='fb-field-label'>\n  <span data-rv-text=\"model." + (null == (__t = Formbuilder.options.mappings.LABEL) ? "" : __t) + "\"></span>\n  <code class='field-type' data-rv-text='model." + (null == (__t = Formbuilder.options.mappings.FIELD_TYPE) ? "" : __t) + "'></code>\n  <span class='fa fa-arrow-right pull-right'></span>\n</div>";
    return __p
}, this.Formbuilder.templates["edit/base_non_input"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf = obj.rf;
    __p += (null == (__t = Formbuilder.templates["edit/base_header"]()) ? "" : __t) + "\n" + (null == (__t = Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({
        rf: rf
    })) ? "" : __t) + "\n";
    return __p
}, this.Formbuilder.templates["edit/checkboxes"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf=obj.rf;

    __p += "<label>\n  <input type='checkbox' data-rv-checked='model." + (null == (__t = Formbuilder.options.mappings.REQUIRED) ? "" : __t) + "' />\n  Required\n</label>\n<label>";
    return __p
}, this.Formbuilder.templates["edit/common"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='fb-edit-section-header'>Label</div>\n\n<div class='fb-common-wrapper'>\n  <div class='fb-label-description'>\n    " + (null == (__t = Formbuilder.templates["edit/label_description"]()) ? "" : __t) + "\n  </div>\n  <div class='fb-common-checkboxes'>\n    " + (null == (__t = Formbuilder.templates["edit/checkboxes"]()) ? "" : __t) + "\n  </div>\n  <div class='fb-clear'></td></tr></table></div>\n</div>\n";
    return __p
}, this.Formbuilder.templates["edit/integer_only"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='fb-edit-section-header'>Integer only</div>\n<label>\n  <input type='checkbox' data-rv-checked='model." + (null == (__t = Formbuilder.options.mappings.INTEGER_ONLY) ? "" : __t) + "' />\n  Only accept integers\n</label>\n";
    return __p
}, this.Formbuilder.templates["edit/label_description"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<input type='text' data-rv-input='model." + (null == (__t = Formbuilder.options.mappings.LABEL) ? "" : __t) + "' />\n<textarea data-rv-input='model." + (null == (__t = Formbuilder.options.mappings.DESCRIPTION) ? "" : __t) + "'\n  placeholder='Add a longer description to this field'></textarea>";
    return __p
}, this.Formbuilder.templates["edit/min_max"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += '<div class=\'fb-edit-section-header\'>Minimum / Maximum</div>\n\nAbove\n<input type="text" data-rv-input="model.' + (null == (__t = Formbuilder.options.mappings.MIN) ? "" : __t) + '" style="width: 60px" />\n\n&nbsp;&nbsp;\n\nBelow\n<input type="text" data-rv-input="model.' + (null == (__t = Formbuilder.options.mappings.MAX) ? "" : __t) + '" style="width: 60px" />\n';
    return __p
}, this.Formbuilder.templates["edit/min_max_length"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += '<div class=\'fb-edit-section-header\'>Length Limit</div>\n\nMin\n<input type="text" data-rv-input="model.' + (null == (__t = Formbuilder.options.mappings.MINLENGTH) ? "" : __t) + '" style="width: 60px" />\n\n&nbsp;&nbsp;\n\nMax\n<input type="text" data-rv-input="model.' + (null == (__t = Formbuilder.options.mappings.MAXLENGTH) ? "" : __t) + '" style="width: 60px" />\n\n&nbsp;&nbsp;\n\n<select data-rv-value="model.' + (null == (__t = Formbuilder.options.mappings.LENGTH_UNITS) ? "" : __t) + '" style="width: auto;">\n  <option value="characters">characters</option>\n  <option value="words">words</option>\n</select>\n';
    return __p
}, this.Formbuilder.templates["edit/options"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape, Array.prototype.join
    }
    __p += "<div class='fb-edit-section-header'>Options</div>\n\n", "undefined" != typeof includeBlank && (__p += "\n  <label>\n    <input type='checkbox' data-rv-checked='model." + (null == (__t = Formbuilder.options.mappings.INCLUDE_BLANK) ? "" : __t) + "' />\n    Include blank\n  </label>\n"), __p += "\n\n<div class='option' data-rv-each-option='model." + (null == (__t = Formbuilder.options.mappings.OPTIONS) ? "" : __t) + '\'>\n  <input type="checkbox" class=\'js-default-updated\' data-rv-checked="option:checked" />\n  <input type="text" data-rv-input="option:label" class=\'option-label-input\' />\n  <a class="js-add-option ' + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '" title="Add Option"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-remove-option ' + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '" title="Remove Option"><i class=\'fa fa-minus-circle\'></i></a>\n</div>\n\n', "undefined" != typeof includeOther && (__p += "\n  <label>\n    <input type='checkbox' data-rv-checked='model." + (null == (__t = Formbuilder.options.mappings.INCLUDE_OTHER) ? "" : __t) + '\' />\n    Include "other"\n  </label>\n'), __p += "\n\n<div class='fb-bottom-add'>\n  <a class=\"js-add-option " + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '">Add option</a>\n</div>\n';
    return __p
}, this.Formbuilder.templates["edit/size"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='fb-edit-section-header'>Size</div>\n<select data-rv-value=\"model." + (null == (__t = Formbuilder.options.mappings.SIZE) ? "" : __t) + '">\n  <option value="small">Small</option>\n  <option value="medium">Medium</option>\n  <option value="large">Large</option>\n</select>\n';
    return __p
}, this.Formbuilder.templates["edit/units"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += '<div class=\'fb-edit-section-header\'>Units</div>\n<input type="text" data-rv-input="model.' + (null == (__t = Formbuilder.options.mappings.UNITS) ? "" : __t) + '" />\n';
    return __p
}, this.Formbuilder.templates.page = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += (null == (__t = Formbuilder.templates["partials/save_button"]()) ? "" : __t) + "\n" + (null == (__t = Formbuilder.templates["partials/left_side"]()) ? "" : __t) + "\n" + (null == (__t = Formbuilder.templates["partials/right_side"]()) ? "" : __t) + "\n<div class='fb-clear'></div>";
    return __p
}, this.Formbuilder.templates["partials/add_field"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape, Array.prototype.join
    }
    __p += "<div class='fb-tab-pane active' id='addField'>\n  <div class='fb-add-field-types'>\n    <div class='section'>\n      ", _.each(_.sortBy(Formbuilder.inputFields, "order"), function(a) {
        __p += '\n        <a data-field-type="' + (null == (__t = a.field_type) ? "" : __t) + '" class="' + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '">\n          ' + (null == (__t = a.addButton) ? "" : __t) + "\n        </a>\n      "
    }), __p += "\n    </div>\n\n    <div class='section'>\n      ", _.each(_.sortBy(Formbuilder.nonInputFields, "order"), function(a) {
        __p += '\n        <a data-field-type="' + (null == (__t = a.field_type) ? "" : __t) + '" class="' + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '">\n          ' + (null == (__t = a.addButton) ? "" : __t) + "\n        </a>\n      "
    }), __p += "\n    </div>\n  </div>\n</div>";
    return __p
}, this.Formbuilder.templates["partials/edit_field"] = function(obj) {
    obj || (obj = {}); {
        var __p = "";
        _.escape
    }
    __p += "<div class='fb-tab-pane' id='editField'>\n  <div class='fb-edit-field-wrapper'></div>\n</div>\n";
    return __p
}, this.Formbuilder.templates["partials/left_side"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<table><tr><td class='fb-left-td'><div class='fb-left'>\n  <ul class='fb-tabs'>\n    <li class='active'><a data-target='#addField'><i class='fa fa-plus' /> &nbsp;Add new field</a></li>\n    <li><a data-target='#editField'><i class='fa fa-pencil' /> &nbsp;Edit field</a></li>\n  </ul>\n\n  <div class='fb-tab-content'>\n    " + (null == (__t = Formbuilder.templates["partials/add_field"]()) ? "" : __t) + "\n    " + (null == (__t = Formbuilder.templates["partials/edit_field"]()) ? "" : __t) + "\n  </div>\n</div>";
    return __p
}, this.Formbuilder.templates["partials/right_side"] = function(obj) {
    obj || (obj = {}); {
        var __p = "";
        _.escape
    }
    __p += "</td><td class='fb-right-td'><div class='fb-right'>\n  <div class='fb-no-response-fields'>There are no fields yet, drag them here from the left panel to add them.</div>\n  <div class='fb-response-fields'></div>\n</div>\n";
    return __p
}, this.Formbuilder.templates["partials/save_button"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='fb-save-wrapper'>\n  <button class='js-save-form " + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + "'></button>\n</div>";
    return __p
}, this.Formbuilder.templates["view/base"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf = obj.rf;

    __p += "<div class='subtemplate-wrapper'>\n  <div class='cover'></div>\n  " + (null == (__t = Formbuilder.templates["view/label"]({
        rf: rf
    })) ? "" : __t) + "\n\n  " + (null == (__t = Formbuilder.templates["view/description"]({
        rf: rf
    })) ? "" : __t) + "\n\n  " + (null == (__t = Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({
        rf: rf
    })) ? "" : __t) + "\n  " + (null == (__t = Formbuilder.templates["view/duplicate_remove"]({
        rf: rf
    })) ? "" : __t) + "\n</div>\n";
    return __p
}, this.Formbuilder.templates["view/base_non_input"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf = obj.rf;

    __p += "<div class='subtemplate-wrapper'>\n  <div class='cover'></div>\n  " + (null == (__t = Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({
        rf: rf
    })) ? "" : __t) + "\n  " + (null == (__t = Formbuilder.templates["view/duplicate_remove"]({
        rf: rf
    })) ? "" : __t) + "\n</div>\n";
    return __p
}, this.Formbuilder.templates["view/description"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    var rf = obj.rf;
    __p += "<span class='help-block'>\n  " + (null == (__t = Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.DESCRIPTION))) ? "" : __t) + "\n</span>\n";
    return __p
}, this.Formbuilder.templates["view/duplicate_remove"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape
    }
    __p += "<div class='actions-wrapper'>\n  <a class=\"js-duplicate " + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '" title="Duplicate Field"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-clear ' + (null == (__t = Formbuilder.options.BUTTON_CLASS) ? "" : __t) + '" title="Remove Field"><i class=\'fa fa-minus-circle\'></i></a>\n</div>';
    return __p
}, this.Formbuilder.templates["view/label"] = function(obj) {
    obj || (obj = {}); {
        var __t, __p = "";
        _.escape, Array.prototype.join
    }
    var rf = obj.rf;

    __p += "<label>\n  <span>" + (null == (__t = Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.LABEL))) ? "" : __t) + "\n  ", rf.get(Formbuilder.options.mappings.REQUIRED) && (__p += "\n    <abbr title='required'>*</abbr>\n  "), __p += "\n</label>\n";
    return __p
};
(function(window){

(function(win){
    var store = {},
        doc = win.document,
        localStorageName = 'localStorage',
        scriptTag = 'script',
        storage

    store.disabled = false
    store.version = '1.3.17'
    store.set = function(key, value) {}
    store.get = function(key, defaultVal) {}
    store.has = function(key) { return store.get(key) !== undefined }
    store.remove = function(key) {}
    store.clear = function() {}
    store.transact = function(key, defaultVal, transactionFn) {
        if (transactionFn == null) {
            transactionFn = defaultVal
            defaultVal = null
        }
        if (defaultVal == null) {
            defaultVal = {}
        }
        var val = store.get(key, defaultVal)
        transactionFn(val)
        store.set(key, val)
    }
    store.getAll = function() {}
    store.forEach = function() {}

    store.serialize = function(value) {
        return JSON.stringify(value)
    }
    store.deserialize = function(value) {
        if (typeof value != 'string') { return undefined }
        try { return JSON.parse(value) }
        catch(e) { return value || undefined }
    }

    // Functions to encapsulate questionable FireFox 3.6.13 behavior
    // when about.config::dom.storage.enabled === false
    // See https://github.com/marcuswestin/store.js/issues#issue/13
    function isLocalStorageNameSupported() {
        try { return (localStorageName in win && win[localStorageName]) }
        catch(err) { return false }
    }

    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName]
        store.set = function(key, val) {
            if (val === undefined) { return store.remove(key) }
            storage.setItem(key, store.serialize(val))
            return val
        }
        store.get = function(key, defaultVal) {
            var val = store.deserialize(storage.getItem(key))
            return (val === undefined ? defaultVal : val)
        }
        store.remove = function(key) { storage.removeItem(key) }
        store.clear = function() { storage.clear() }
        store.getAll = function() {
            var ret = {}
            store.forEach(function(key, val) {
                ret[key] = val
            })
            return ret
        }
        store.forEach = function(callback) {
            for (var i=0; i<storage.length; i++) {
                var key = storage.key(i)
                callback(key, store.get(key))
            }
        }
    } else if (doc.documentElement.addBehavior) {
        var storageOwner,
            storageContainer
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
            storageContainer = new ActiveXObject('htmlfile')
            storageContainer.open()
            storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
            storageContainer.close()
            storageOwner = storageContainer.w.frames[0].document
            storage = storageOwner.createElement('div')
        } catch(e) {
            // somehow ActiveXObject instantiation failed (perhaps some special
            // security settings or otherwse), fall back to per-path storage
            storage = doc.createElement('div')
            storageOwner = doc.body
        }
        var withIEStorage = function(storeFunction) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0)
                args.unshift(storage)
                // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storageOwner.appendChild(storage)
                storage.addBehavior('#default#userData')
                storage.load(localStorageName)
                var result = storeFunction.apply(store, args)
                storageOwner.removeChild(storage)
                return result
            }
        }

        // In IE7, keys cannot start with a digit or contain certain chars.
        // See https://github.com/marcuswestin/store.js/issues/40
        // See https://github.com/marcuswestin/store.js/issues/83
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
        function ieKeyFix(key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
        }
        store.set = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key)
            if (val === undefined) { return store.remove(key) }
            storage.setAttribute(key, store.serialize(val))
            storage.save(localStorageName)
            return val
        })
        store.get = withIEStorage(function(storage, key, defaultVal) {
            key = ieKeyFix(key)
            var val = store.deserialize(storage.getAttribute(key))
            return (val === undefined ? defaultVal : val)
        })
        store.remove = withIEStorage(function(storage, key) {
            key = ieKeyFix(key)
            storage.removeAttribute(key)
            storage.save(localStorageName)
        })
        store.clear = withIEStorage(function(storage) {
            var attributes = storage.XMLDocument.documentElement.attributes
            storage.load(localStorageName)
            for (var i=0, attr; attr=attributes[i]; i++) {
                storage.removeAttribute(attr.name)
            }
            storage.save(localStorageName)
        })
        store.getAll = function(storage) {
            var ret = {}
            store.forEach(function(key, val) {
                ret[key] = val
            })
            return ret
        }
        store.forEach = withIEStorage(function(storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes
            for (var i=0, attr; attr=attributes[i]; ++i) {
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
            }
        })
    }

    try {
        var testKey = '__storejs__'
        store.set(testKey, testKey)
        if (store.get(testKey) != testKey) { store.disabled = true }
        store.remove(testKey)
    } catch(e) {
        store.disabled = true
    }
    store.enabled = !store.disabled

    if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
    else if (typeof define === 'function' && define.amd) { define(store) }
    else { win.store = store }

})(Function('return this')());


    ! function(e, n) {
        e = window;
        "use strict";

        function r(e, n) {
            var r, t, u = e.toLowerCase();
            for (n = [].concat(n), r = 0; n.length > r; r += 1)
                if (t = n[r]) {
                    if (t.test && t.test(e))
                        return !0;
                    if (t.toLowerCase() === u)
                        return !0
                }
        }

        var t = n.prototype.trim,
            u = n.prototype.trimRight,
            i = n.prototype.trimLeft,
            l = function(e) {
                return 1 * e || 0
            },
            o = function(e, n) {
                if (1 > n) return "";
                for (var r = ""; n > 0;)
                    1 & n && (r += e), n >>= 1, e += e;
                return r
            },
            a = [].slice,
            c = function(e) {
                return null == e ? "\\s" : e.source ? e.source : "[" + g.escapeRegExp(e) + "]"
            },
            s = {
                lt: "<",
                gt: ">",
                quot: '"',
                amp: "&",
                apos: "'"
            },
            f = {};

        for (var p in s)
            f[s[p]] = p;
        f["'"] = "#39";

        var h = function() {
                function e(e) {
                    return Object.prototype.toString.call(e).slice(8, -1).toLowerCase()
                }
                var r = o,
                    t = function() {
                        return t.cache.hasOwnProperty(arguments[0]) || (t.cache[arguments[0]] = t.parse(arguments[0])), t.format.call(null, t.cache[arguments[0]], arguments)
                    };
                return t.format = function(t, u) {
                    var i, l, o, a, c, s, f, p = 1,
                        g = t.length,
                        d = "",
                        m = [];
                    for (l = 0; g > l; l++)
                        if (d = e(t[l]), "string" === d)
                            m.push(t[l]);
                        else if ("array" === d) {
                        if (a = t[l], a[2])
                            for (i = u[p], o = 0; a[2].length > o; o++) {
                                if (!i.hasOwnProperty(a[2][o]))
                                    throw new Error(h('[_.sprintf] property "%s" does not exist', a[2][o]));
                                i = i[a[2][o]]
                            } else i = a[1] ? u[a[1]] : u[p++];

                        if (/[^s]/.test(a[8]) && "number" != e(i))
                            throw new Error(h("[_.sprintf] expecting number but found %s", e(i)));

                        switch (a[8]) {
                            case "b":
                                i = i.toString(2);
                                break;
                            case "c":
                                i = n.fromCharCode(i);
                                break;
                            case "d":
                                i = parseInt(i, 10);
                                break;
                            case "e":
                                i = a[7] ? i.toExponential(a[7]) : i.toExponential();
                                break;
                            case "f":
                                i = a[7] ? parseFloat(i).toFixed(a[7]) : parseFloat(i);
                                break;
                            case "o":
                                i = i.toString(8);
                                break;
                            case "s":
                                i = (i = n(i)) && a[7] ? i.substring(0, a[7]) : i;
                                break;
                            case "u":
                                i = Math.abs(i);
                                break;
                            case "x":
                                i = i.toString(16);
                                break;
                            case "X":"value", i = i.toString(16).toUpperCase()
                        }
                        i = /[def]/.test(a[8]) && a[3] && i >= 0 ? "+" + i : i, s = a[4] ? "0" == a[4] ? "0" : a[4].charAt(1) : " ", f = a[6] - n(i).length, c = a[6] ? r(s, f) : "", m.push(a[5] ? i + c : c + i)
                    }
                    return m.join("")
                }, t.cache = {}, t.parse = function(e) {
                    for (var n = e, r = [], t = [], u = 0; n;) {
                        if (null !== (r = /^[^\x25]+/.exec(n))) t.push(r[0]);
                        else if (null !== (r = /^\x25{2}/.exec(n))) t.push("%");
                        else {
                            if (null === (r = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(n))) throw new Error("[_.sprintf] huh?");
                            if (r[2]) {
                                u |= 1;
                                var i = [],
                                    l = r[2],
                                    o = [];
                                if (null === (o = /^([a-z_][a-z_\d]*)/i.exec(l))) throw new Error("[_.sprintf] huh?");
                                for (i.push(o[1]);
                                    "" !== (l = l.substring(o[0].length));)
                                    if (null !== (o = /^\.([a-z_][a-z_\d]*)/i.exec(l))) i.push(o[1]);
                                    else {
                                        if (null === (o = /^\[(\d+)\]/.exec(l))) throw new Error("[_.sprintf] huh?");
                                        i.push(o[1])
                                    }
                                r[2] = i
                            } else u |= 2; if (3 === u) throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");
                            t.push(r)
                        }
                        n = n.substring(r[0].length)
                    }
                    return t
                }, t
            }(),
            g = {
                VERSION: "2.3.0",
                isBlank: function(e) {
                    return null == e && (e = ""), /^\s*$/.test(e)
                },
                stripTags: function(e) {
                    return null == e ? "" : n(e).replace(/<\/?[^>]+>/g, "")
                },
                capitalize: function(e) {
                    return e = null == e ? "" : n(e), e.charAt(0).toUpperCase() + e.slice(1)
                },
                chop: function(e, r) {
                    return null == e ? [] : (e = n(e), r = ~~r, r > 0 ? e.match(new RegExp(".{1," + r + "}", "g")) : [e])
                },
                clean: function(e) {
                    return g.strip(e).replace(/\s+/g, " ")
                },
                count: function(e, r) {
                    if (null == e || null == r) return 0;
                    e = n(e), r = n(r);
                    for (var t = 0, u = 0, i = r.length;;) {
                        if (u = e.indexOf(r, u), -1 === u) break;
                        t++, u += i
                    }
                    return t
                },
                chars: function(e) {
                    return null == e ? [] : n(e).split("")
                },
                swapCase: function(e) {
                    return null == e ? "" : n(e).replace(/\S/g, function(e) {
                        return e === e.toUpperCase() ? e.toLowerCase() : e.toUpperCase()
                    })
                },
                escapeHTML: function(e) {
                    return null == e ? "" : n(e).replace(/[&<>"']/g, function(e) {
                        return "&" + f[e] + ";"
                    })
                },
                unescapeHTML: function(e) {
                    return null == e ? "" : n(e).replace(/\&([^;]+);/g, function(e, r) {
                        var t;
                        return r in s ? s[r] : (t = r.match(/^#x([\da-fA-F]+)$/)) ? n.fromCharCode(parseInt(t[1], 16)) : (t = r.match(/^#(\d+)$/)) ? n.fromCharCode(~~t[1]) : e
                    })
                },
                escapeRegExp: function(e) {
                    return null == e ? "" : n(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")
                },
                splice: function(e, n, r, t) {
                    var u = g.chars(e);
                    return u.splice(~~n, ~~r, t), u.join("")
                },
                insert: function(e, n, r) {
                    return g.splice(e, n, 0, r)
                },
                include: function(e, r) {
                    return "" === r ? !0 : null == e ? !1 : -1 !== n(e).indexOf(r)
                },
                join: function() {
                    var e = a.call(arguments),
                        n = e.shift();
                    return null == n && (n = ""), e.join(n)
                },
                lines: function(e) {
                    return null == e ? [] : n(e).split("\n")
                },
                reverse: function(e) {
                    return g.chars(e).reverse().join("")
                },
                startsWith: function(e, r) {
                    return "" === r ? !0 : null == e || null == r ? !1 : (e = n(e), r = n(r), e.length >= r.length && e.slice(0, r.length) === r)
                },
                endsWith: function(e, r) {
                    return "" === r ? !0 : null == e || null == r ? !1 : (e = n(e), r = n(r), e.length >= r.length && e.slice(e.length - r.length) === r)
                },
                succ: function(e) {
                    return null == e ? "" : (e = n(e), e.slice(0, -1) + n.fromCharCode(e.charCodeAt(e.length - 1) + 1))
                },
                titleize: function(e) {
                    return null == e ? "" : (e = n(e).toLowerCase(), e.replace(/(?:^|\s|-)\S/g, function(e) {
                        return e.toUpperCase()
                    }))
                },
                camelize: function(e) {
                    return g.trim(e).replace(/[-_\s]+(.)?/g, function(e, n) {
                        return n ? n.toUpperCase() : ""
                    })
                },
                underscored: function(e) {
                    return g.trim(e).replace(/([a-z\d])([A-Z]+)/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase()
                },
                dasherize: function(e) {
                    return g.trim(e).replace(/([A-Z])/g, "-$1").replace(/[-_\s]+/g, "-").toLowerCase()
                },
                classify: function(e) {
                    return g.titleize(n(e).replace(/[\W_]/g, " ")).replace(/\s/g, "")
                },
                humanize: function(e) {
                    return g.capitalize(g.underscored(e).replace(/_id$/, "").replace(/_/g, " "))
                },
                trim: function(e, r) {
                    return null == e ? "" : !r && t ? t.call(e) : (r = c(r), n(e).replace(new RegExp("^" + r + "+|" + r + "+$", "g"), ""))
                },
                ltrim: function(e, r) {
                    return null == e ? "" : !r && i ? i.call(e) : (r = c(r), n(e).replace(new RegExp("^" + r + "+"), ""))
                },
                rtrim: function(e, r) {
                    return null == e ? "" : !r && u ? u.call(e) : (r = c(r), n(e).replace(new RegExp(r + "+$"), ""))
                },
                truncate: function(e, r, t) {
                    return null == e ? "" : (e = n(e), t = t || "...", r = ~~r, e.length > r ? e.slice(0, r) + t : e)
                },
                prune: function(e, r, t) {
                    if (null == e) return "";
                    if (e = n(e), r = ~~r, t = null != t ? n(t) : "...", r >= e.length) return e;
                    var u = function(e) {
                            return e.toUpperCase() !== e.toLowerCase() ? "A" : " "
                        },
                        i = e.slice(0, r + 1).replace(/.(?=\W*\w*$)/g, u);
                    return i = i.slice(i.length - 2).match(/\w\w/) ? i.replace(/\s*\S+$/, "") : g.rtrim(i.slice(0, i.length - 1)), (i + t).length > e.length ? e : e.slice(0, i.length) + t
                },
                words: function(e, n) {
                    return g.isBlank(e) ? [] : g.trim(e, n).split(n || /\s+/)
                },
                pad: function(e, r, t, u) {
                    e = null == e ? "" : n(e), r = ~~r;
                    var i = 0;
                    switch (t ? t.length > 1 && (t = t.charAt(0)) : t = " ", u) {
                        case "right":
                            return i = r - e.length, e + o(t, i);
                        case "both":
                            return i = r - e.length, o(t, Math.ceil(i / 2)) + e + o(t, Math.floor(i / 2));
                        default:
                            return i = r - e.length, o(t, i) + e
                    }
                },
                lpad: function(e, n, r) {
                    return g.pad(e, n, r)
                },
                rpad: function(e, n, r) {
                    return g.pad(e, n, r, "right")
                },
                lrpad: function(e, n, r) {
                    return g.pad(e, n, r, "both")
                },
                sprintf: h,
                vsprintf: function(e, n) {
                    return n.unshift(e), h.apply(null, n)
                },
                toNumber: function(e, n) {
                    return e ? (e = g.trim(e), e.match(/^-?\d+(?:\.\d+)?$/) ? l(l(e).toFixed(~~n)) : 0 / 0) : 0
                },
                numberFormat: function(e, n, r, t) {
                    if (isNaN(e) || null == e) return "";
                    e = e.toFixed(~~n), t = "string" == typeof t ? t : ",";
                    var u = e.split("."),
                        i = u[0],
                        l = u[1] ? (r || ".") + u[1] : "";
                    return i.replace(/(\d)(?=(?:\d{3})+$)/g, "$1" + t) + l
                },
                strRight: function(e, r) {
                    if (null == e) return "";
                    e = n(e), r = null != r ? n(r) : r;
                    var t = r ? e.indexOf(r) : -1;
                    return~ t ? e.slice(t + r.length, e.length) : e
                },
                strRightBack: function(e, r) {
                    if (null == e) return "";
                    e = n(e), r = null != r ? n(r) : r;
                    var t = r ? e.lastIndexOf(r) : -1;
                    return~ t ? e.slice(t + r.length, e.length) : e
                },
                strLeft: function(e, r) {
                    if (null == e) return "";
                    e = n(e), r = null != r ? n(r) : r;
                    var t = r ? e.indexOf(r) : -1;
                    return~ t ? e.slice(0, t) : e
                },
                strLeftBack: function(e, n) {
                    if (null == e) return "";
                    e += "", n = null != n ? "" + n : n;
                    var r = e.lastIndexOf(n);
                    return~ r ? e.slice(0, r) : e
                },
                toSentence: function(e, n, r, t) {
                    n = n || ", ", r = r || " and ";
                    var u = e.slice(),
                        i = u.pop();
                    return e.length > 2 && t && (r = g.rtrim(n) + r), u.length ? u.join(n) + r + i : i
                },
                toSentenceSerial: function() {
                    var e = a.call(arguments);
                    return e[3] = !0, g.toSentence.apply(g, e)
                },
                slugify: function(e) {
                    if (null == e) return "";
                    var r = "ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź",
                        t = "aaaaaaaaaceeeeeiiiilnoooooosstuuuunczz",
                        u = new RegExp(c(r), "g");
                    return e = n(e).toLowerCase().replace(u, function(e) {
                        var n = r.indexOf(e);
                        return t.charAt(n) || "-"
                    }), g.dasherize(e.replace(/[^\w\s-]/g, ""))
                },
                surround: function(e, n) {
                    return [n, e, n].join("")
                },
                quote: function(e, n) {
                    return g.surround(e, n || '"')
                },
                unquote: function(e, n) {
                    return n = n || '"', e[0] === n && e[e.length - 1] === n ? e.slice(1, e.length - 1) : e
                },
                exports: function() {
                    var e = {};
                    for (var n in this) this.hasOwnProperty(n) && !n.match(/^(?:include|contains|reverse)$/) && (e[n] = this[n]);
                    return e
                },
                repeat: function(e, r, t) {
                    if (null == e) return "";
                    if (r = ~~r, null == t) return o(n(e), r);
                    for (var u = []; r > 0; u[--r] = e);
                    return u.join(t)
                },
                naturalCmp: function(e, r) {
                    if (e == r) return 0;
                    if (!e) return -1;
                    if (!r) return 1;
                    for (var t = /(\.\d+)|(\d+)|(\D+)/g, u = n(e).toLowerCase().match(t), i = n(r).toLowerCase().match(t), l = Math.min(u.length, i.length), o = 0; l > o; o++) {
                        var a = u[o],
                            c = i[o];
                        if (a !== c) {
                            var s = parseInt(a, 10);
                            if (!isNaN(s)) {
                                var f = parseInt(c, 10);
                                if (!isNaN(f) && s - f) return s - f
                            }
                            return c > a ? -1 : 1
                        }
                    }
                    return u.length === i.length ? u.length - i.length : r > e ? -1 : 1
                },
                levenshtein: function(e, r) {
                    if (null == e && null == r) return 0;
                    if (null == e) return n(r).length;
                    if (null == r) return n(e).length;
                    e = n(e), r = n(r);
                    for (var t, u, i = [], l = 0; r.length >= l; l++)
                        for (var o = 0; e.length >= o; o++) u = l && o ? e.charAt(o - 1) === r.charAt(l - 1) ? t : Math.min(i[o], i[o - 1], t) + 1 : l + o, t = i[o], i[o] = u;
                    return i.pop()
                },
                toBoolean: function(e, n, t) {
                    return "number" == typeof e && (e = "" + e), "string" != typeof e ? !!e : (e = g.trim(e), r(e, n || ["true", "1"]) ? !0 : r(e, t || ["false", "0"]) ? !1 : void 0)
                }
            };

        g.strip = g.trim, g.lstrip = g.ltrim, g.rstrip = g.rtrim, g.center = g.lrpad, g.rjust = g.lpad, g.ljust = g.rpad, g.contains = g.include, g.q = g.quote, g.toBool = g.toBoolean, "undefined" != typeof exports && ("undefined" != typeof module && module.exports && (module.exports = g), exports._s = g), "function" == typeof define && define.amd && define("underscore.string", [], function() {
            return g
        }), e._ = e._ || {}, e._.string = e._.str = g
    }(this, String);
    _.mixin({
        simpleFormat: function(string, escape) {
            if (escape !== false) {
                string = _.escape(string);
            }

            return (string + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
        }
    });

var TRUTHY_VARS,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

TRUTHY_VARS = ['True', 'Yes', 'true', '1', 1, 'yes', true];

_.mixin({
  toBoolean: function(x) {
    return __indexOf.call(TRUTHY_VARS, x) >= 0;
  }
});
// Generated by CoffeeScript 1.7.1
(function() {
  var BeforeUnload;

  BeforeUnload = (function() {
    function BeforeUnload() {}

    BeforeUnload.footerText = 'Are you sure you want to leave this page?';

    BeforeUnload.defaults = {
      "if": function() {
        return true;
      },
      message: 'You have unsaved changes.'
    };

    BeforeUnload.enable = function(opts) {
      opts = $.extend({}, this.defaults, opts);
      $(window).bind('beforeunload', function() {
        if (opts["if"]()) {
          return opts.message;
        } else {
          return void 0;
        }
      });
      return $(document).on('page:before-change.beforeunload', (function(_this) {
        return function(e) {
          if (!opts["if"]()) {
            return _this.disable();
          }
          if (opts.cb) {
            opts.cb(e.originalEvent.data.url);
            return false;
          } else if (confirm("" + opts.message + "\n\n" + _this.footerText)) {
            return _this.disable();
          } else {
            return false;
          }
        };
      })(this));
    };

    BeforeUnload.disable = function() {
      $(window).unbind('beforeunload');
      return $(document).off('page:before-change.beforeunload');
    };

    return BeforeUnload;

  })();

  window.BeforeUnload = BeforeUnload;

}).call(this);

/**
 * Copyright (c) 2010 by Gabriel Birke
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function Sanitize(){
  var i, e, options;
  options = arguments[0] || {};
  this.config = {};
  this.config.elements = options.elements ? options.elements : [];
  this.config.attributes = options.attributes ? options.attributes : {};
  this.config.attributes[Sanitize.ALL] = this.config.attributes[Sanitize.ALL] ? this.config.attributes[Sanitize.ALL] : [];
  this.config.allow_comments = options.allow_comments ? options.allow_comments : false;
  this.allowed_elements = {};
  this.config.protocols = options.protocols ? options.protocols : {};
  this.config.add_attributes = options.add_attributes ? options.add_attributes  : {};
  this.dom = options.dom ? options.dom : document;
  for(i=0;i<this.config.elements.length;i++) {
    this.allowed_elements[this.config.elements[i]] = true;
  }
  this.config.remove_element_contents = {};
  this.config.remove_all_contents = false;
  if(options.remove_contents) {

    if(options.remove_contents instanceof Array) {
      for(i=0;i<options.remove_contents.length;i++) {
        this.config.remove_element_contents[options.remove_contents[i]] = true;
      }
    }
    else {
      this.config.remove_all_contents = true;
    }
  }
  this.transformers = options.transformers ? options.transformers : [];
}

Sanitize.REGEX_PROTOCOL = /^([A-Za-z0-9\+\-\.\&\;\*\s]*?)(?:\:|&*0*58|&*x0*3a)/i;

// emulate Ruby symbol with string constant
Sanitize.RELATIVE = '__RELATIVE__';
Sanitize.ALL = '__ALL__';

Sanitize.prototype.clean_node = function(container) {
  var fragment = this.dom.createDocumentFragment();
  this.current_element = fragment;
  this.whitelist_nodes = [];



  /**
   * Utility function to check if an element exists in an array
   */
  function _array_index(needle, haystack) {
    var i;
    for(i=0; i < haystack.length; i++) {
      if(haystack[i] == needle)
        return i;
    }
    return -1;
  }

  function _merge_arrays_uniq() {
    var result = [];
    var uniq_hash = {};
    var i,j;
    for(i=0;i<arguments.length;i++) {
      if(!arguments[i] || !arguments[i].length)
        continue;
      for(j=0;j<arguments[i].length;j++) {
        if(uniq_hash[arguments[i][j]])
          continue;
        uniq_hash[arguments[i][j]] = true;
        result.push(arguments[i][j]);
      }
    }
    return result;
  }

  /**
   * Clean function that checks the different node types and cleans them up accordingly
   * @param elem DOM Node to clean
   */
  function _clean(elem) {
    var clone;
    switch(elem.nodeType) {
      // Element
      case 1:
        _clean_element.call(this, elem);
        break;
      // Text
      case 3:
        clone = elem.cloneNode(false);
        this.current_element.appendChild(clone);
        break;
      // Entity-Reference (normally not used)
      case 5:
        clone = elem.cloneNode(false);
        this.current_element.appendChild(clone);
        break;
      // Comment
      case 8:
        if(this.config.allow_comments) {
          clone = elem.cloneNode(false);
          this.current_element.appendChild(clone);
        }
        break;
      default:
        if (console && console.log) console.log("unknown node type", elem.nodeType);
        break;
    }

  }

  function _clean_element(elem) {
    var i, j, clone, parent_element, name, allowed_attributes, attr, attr_name, attr_node, protocols, del, attr_ok;
    var transform = _transform_element.call(this, elem);

    elem = transform.node;
    name = elem.nodeName.toLowerCase();

    // check if element itself is allowed
    parent_element = this.current_element;
    if(this.allowed_elements[name] || transform.whitelist) {
        this.current_element = this.dom.createElement(elem.nodeName);
        parent_element.appendChild(this.current_element);

      // clean attributes
      var attrs = this.config.attributes;
      allowed_attributes = _merge_arrays_uniq(attrs[name], attrs[Sanitize.ALL], transform.attr_whitelist);
      for(i=0;i<allowed_attributes.length;i++) {
        attr_name = allowed_attributes[i];
        attr = elem.attributes[attr_name];
        if(attr) {
            attr_ok = true;
            // Check protocol attributes for valid protocol
            if(this.config.protocols[name] && this.config.protocols[name][attr_name]) {
              protocols = this.config.protocols[name][attr_name];
              del = attr.nodeValue.toLowerCase().match(Sanitize.REGEX_PROTOCOL);
              if(del) {
                attr_ok = (_array_index(del[1], protocols) != -1);
              }
              else {
                attr_ok = (_array_index(Sanitize.RELATIVE, protocols) != -1);
              }
            }
            if(attr_ok) {
              attr_node = document.createAttribute(attr_name);
              attr_node.value = attr.nodeValue;
              this.current_element.setAttributeNode(attr_node);
            }
        }
      }

      // Add attributes
      if(this.config.add_attributes[name]) {
        for(attr_name in this.config.add_attributes[name]) {
          attr_node = document.createAttribute(attr_name);
          attr_node.value = this.config.add_attributes[name][attr_name];
          this.current_element.setAttributeNode(attr_node);
        }
      }
    } // End checking if element is allowed
    // If this node is in the dynamic whitelist array (built at runtime by
    // transformers), let it live with all of its attributes intact.
    else if(_array_index(elem, this.whitelist_nodes) != -1) {
      this.current_element = elem.cloneNode(true);
      // Remove child nodes, they will be sanitiazied and added by other code
      while(this.current_element.childNodes.length > 0) {
        this.current_element.removeChild(this.current_element.firstChild);
      }
      parent_element.appendChild(this.current_element);
    }

    // iterate over child nodes
    if(!this.config.remove_all_contents && !this.config.remove_element_contents[name]) {
      for(i=0;i<elem.childNodes.length;i++) {
        _clean.call(this, elem.childNodes[i]);
      }
    }

    // some versions of IE don't support normalize.
    if(this.current_element.normalize) {
      this.current_element.normalize();
    }
    this.current_element = parent_element;
  } // END clean_element function

  function _transform_element(node) {
    var output = {
      attr_whitelist:[],
      node: node,
      whitelist: false
    };
    var i, j, transform;
    for(i=0;i<this.transformers.length;i++) {
      transform = this.transformers[i]({
        allowed_elements: this.allowed_elements,
        config: this.config,
        node: node,
        node_name: node.nodeName.toLowerCase(),
        whitelist_nodes: this.whitelist_nodes,
        dom: this.dom
      });
      if (transform == null)
        continue;
      else if(typeof transform == 'object') {
        if(transform.whitelist_nodes && transform.whitelist_nodes instanceof Array) {
          for(j=0;j<transform.whitelist_nodes.length;j++) {
            if(_array_index(transform.whitelist_nodes[j], this.whitelist_nodes) == -1) {
              this.whitelist_nodes.push(transform.whitelist_nodes[j]);
            }
          }
        }
        output.whitelist = transform.whitelist ? true : false;
        if(transform.attr_whitelist) {
          output.attr_whitelist = _merge_arrays_uniq(output.attr_whitelist, transform.attr_whitelist);
        }
        output.node = transform.node ? transform.node : output.node;
      }
      else {
        throw new Error("transformer output must be an object or null");
      }
    }
    return output;
  }



  for(i=0;i<container.childNodes.length;i++) {
    _clean.call(this, container.childNodes[i]);
  }

  if(fragment.normalize) {
    fragment.normalize();
  }

  return fragment;

};

if ( typeof define === "function" ) {
  define( "sanitize", [], function () { return Sanitize; } );
}

if(!Sanitize.Config) {
  Sanitize.Config = {}
}

Sanitize.Config.RELAXED = {
  elements: [
    'a', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col',
    'colgroup', 'dd', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'i', 'img', 'li', 'ol', 'p', 'pre', 'q', 'small', 'strike', 'strong',
    'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u',
    'ul'],

  attributes: {
    'a'         : ['href', 'title'],
    'blockquote': ['cite'],
    'col'       : ['span', 'width'],
    'colgroup'  : ['span', 'width'],
    'img'       : ['align', 'alt', 'height', 'src', 'title', 'width'],
    'ol'        : ['start', 'type'],
    'q'         : ['cite'],
    'table'     : ['summary', 'width'],
    'td'        : ['abbr', 'axis', 'colspan', 'rowspan', 'width'],
    'th'        : ['abbr', 'axis', 'colspan', 'rowspan', 'scope',
                     'width'],
    'ul'        : ['type']
  },

  protocols: {
    'a'         : {'href': ['ftp', 'http', 'https', 'mailto',
                                Sanitize.RELATIVE]},
    'blockquote': {'cite': ['http', 'https', Sanitize.RELATIVE]},
    'img'       : {'src' : ['http', 'https', Sanitize.RELATIVE]},
    'q'         : {'cite': ['http', 'https', Sanitize.RELATIVE]}
  }
}
_.mixin({
  sanitize: function(str, config) {
    try {
      var n = document.createElement('div');
      n.innerHTML = str;
      var s = new Sanitize(config || Sanitize.Config.RELAXED);
      var c = s.clean_node(n);
      var o = document.createElement('div');
      o.appendChild(c.cloneNode(true));
      return o.innerHTML;
    }
    catch (e) {
      return _.escape(str);
    }
  }
});

/**
 * Main source
 */

;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else {
        // globals
        factory(_, Backbone);
    }
}(function(_, Backbone) {

    /**
     * Takes a nested object and returns a shallow object keyed with the path names
     * e.g. { "level1.level2": "value" }
     *
     * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
     * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
     */
    function objToPaths(obj) {
        var ret = {},
            separator = DeepModel.keyPathSeparator;

        for (var key in obj) {
            var val = obj[key];

            if (val && val.constructor === Object && !_.isEmpty(val)) {
                //Recursion for embedded objects
                var obj2 = objToPaths(val);

                for (var key2 in obj2) {
                    var val2 = obj2[key2];

                    ret[key + separator + key2] = val2;
                }
            } else {
                ret[key] = val;
            }
        }

        return ret;
    }

    /**
     * @param {Object}  Object to fetch attribute from
     * @param {String}  Object path e.g. 'user.name'
     * @return {Mixed}
     */
    function getNested(obj, path, return_exists) {
        var separator = DeepModel.keyPathSeparator;

        var fields = path.split(separator);
        var result = obj;
        return_exists || (return_exists === false);
        for (var i = 0, n = fields.length; i < n; i++) {
            if (return_exists && !_.has(result, fields[i])) {
                return false;
            }
            result = result[fields[i]];

            if (result == null && i < n - 1) {
                result = {};
            }

            if (typeof result === 'undefined') {
                if (return_exists)
                {
                    return true;
                }
                return result;
            }
        }
        if (return_exists)
        {
            return true;
        }
        return result;
    }

    /**
     * @param {Object} obj                Object to fetch attribute from
     * @param {String} path               Object path e.g. 'user.name'
     * @param {Object} [options]          Options
     * @param {Boolean} [options.unset]   Whether to delete the value
     * @param {Mixed}                     Value to set
     */
    function setNested(obj, path, val, options) {
        options = options || {};

        var separator = DeepModel.keyPathSeparator;

        var fields = path.split(separator);
        var result = obj;
        for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
            var field = fields[i];

            //If the last in the path, set the value
            if (i === n - 1) {
                options.unset ? delete result[field] : result[field] = val;
            } else {
                //Create the child object if it doesn't exist, or isn't an object
                if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
                    result[field] = {};
                }

                //Move onto the next part of the path
                result = result[field];
            }
        }
    }

    function deleteNested(obj, path) {
      setNested(obj, path, null, { unset: true });
    }

    var DeepModel = Backbone.Model.extend({

        // Override constructor
        // Support having nested defaults by using _.deepExtend instead of _.extend
        constructor: function(attributes, options) {
            var defaults;
            var attrs = attributes || {};
            this.cid = _.uniqueId('c');
            this.attributes = {};
            if (options && options.collection) this.collection = options.collection;
            if (options && options.parse) attrs = this.parse(attrs, options) || {};
            if (defaults = _.result(this, 'defaults')) {
                //<custom code>
                // Replaced the call to _.defaults with _.deepExtend.
                attrs = _.deepExtend({}, defaults, attrs);
                //</custom code>
            }
            this.set(attrs, options);
            this.changed = {};
            this.initialize.apply(this, arguments);
        },

        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return _.deepClone(this.attributes);
        },

        // Override get
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        get: function(attr) {
            return getNested(this.attributes, attr);
        },

        // Override set
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        set: function(key, val, options) {
            var attr, attrs, unset, changes, silent, changing, prev, current;
            if (key == null) return this;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (typeof key === 'object') {
              attrs = key;
              options = val || {};
            } else {
              (attrs = {})[key] = val;
            }

            options || (options = {});

            // Run validation.
            if (!this._validate(attrs, options)) return false;

            // Extract attributes and options.
            unset           = options.unset;
            silent          = options.silent;
            changes         = [];
            changing        = this._changing;
            this._changing  = true;

            if (!changing) {
              this._previousAttributes = _.deepClone(this.attributes); //<custom>: Replaced _.clone with _.deepClone
              this.changed = {};
            }
            current = this.attributes, prev = this._previousAttributes;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            //<custom code>
            attrs = objToPaths(attrs);
            //</custom code>

            // For each `set` attribute, update or delete the current value.
            for (attr in attrs) {
              val = attrs[attr];

              //<custom code>: Using getNested, setNested and deleteNested
              if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
              if (!_.isEqual(getNested(prev, attr), val)) {
                setNested(this.changed, attr, val);
              } else {
                deleteNested(this.changed, attr);
              }
              unset ? deleteNested(current, attr) : setNested(current, attr, val);
              //</custom code>
            }

            // Trigger all relevant attribute changes.
            if (!silent) {
              if (changes.length) this._pending = true;

              //<custom code>
              var separator = DeepModel.keyPathSeparator;

              for (var i = 0, l = changes.length; i < l; i++) {
                var key = changes[i];

                this.trigger('change:' + key, this, getNested(current, key), options);

                var fields = key.split(separator);

                //Trigger change events for parent keys with wildcard (*) notation
                for(var n = fields.length - 1; n > 0; n--) {
                  var parentKey = _.first(fields, n).join(separator),
                      wildcardKey = parentKey + separator + '*';

                  this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
                }
                //</custom code>
              }
            }

            if (changing) return this;
            if (!silent) {
              while (this._pending) {
                this._pending = false;
                this.trigger('change', this, options);
              }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },

        // Clear all attributes on the model, firing `"change"` unless you choose
        // to silence it.
        clear: function(options) {
          var attrs = {};
          var shallowAttributes = objToPaths(this.attributes);
          for (var key in shallowAttributes) attrs[key] = void 0;
          return this.set(attrs, _.extend({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !_.isEmpty(this.changed);
          return getNested(this.changed, attr) !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          //<custom code>: objToPaths
          if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
          //</custom code>

          var old = this._changing ? this._previousAttributes : this.attributes;

          //<custom code>
          diff = objToPaths(diff);
          old = objToPaths(old);
          //</custom code>

          var val, changed = false;
          for (var attr in diff) {
            if (_.isEqual(old[attr], (val = diff[attr]))) continue;
            (changed || (changed = {}))[attr] = val;
          }
          return changed;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;

          //<custom code>
          return getNested(this._previousAttributes, attr);
          //</custom code>
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          //<custom code>
          return _.deepClone(this._previousAttributes);
          //</custom code>
        }
    });


    //Config; override in your app to customise
    DeepModel.keyPathSeparator = '.';


    //Exports
    Backbone.DeepModel = DeepModel;

    //For use in NodeJS
    if (typeof module != 'undefined') module.exports = DeepModel;

    return Backbone;

}));


// Rivets.js
// version: 0.5.2
// author: Michael Richards
// license: MIT
(function() {
  var Rivets,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  Rivets.Binding = (function() {
    function Binding(view, el, type, key, keypath, options) {
      var identifier, regexp, value, _ref;
      this.view = view;
      this.el = el;
      this.type = type;
      this.key = key;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.formattedValue = __bind(this.formattedValue, this);
      if (!(this.binder = this.view.binders[this.type])) {
        _ref = this.view.binders;
        for (identifier in _ref) {
          value = _ref[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(this.type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(this.type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        this.binder = {
          routine: this.binder
        };
      }
      this.formatters = this.options.formatters || [];
      this.model = this.view.models[this.key];
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.model[id] instanceof Function ? this.model[id] : this.view.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.set = function(value) {
      var _ref;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      return this.set(this.options.bypass ? this.model[this.keypath] : this.view.config.adapter.read(this.model, this.keypath));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
      value = Rivets.Util.getInputValue(this.el);
      _ref = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref1 = this.view.formatters[id]) != null ? _ref1.publish : void 0) {
          value = (_ref2 = this.view.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
        }
      }
      return this.view.config.adapter.publish(this.model, this.keypath, value);
    };

    Binding.prototype.bind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
      if (this.options.bypass) {
        this.sync();
      } else {
        this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
        if (this.view.config.preloadData) {
          this.sync();
        }
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.subscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.unbind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
      if (!this.options.bypass) {
        this.view.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.unsubscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.update = function() {
      this.unbind();
      this.model = this.view.models[this.key];
      return this.bind();
    };

    return Binding;

  })();

  Rivets.View = (function() {
    function View(els, models, options) {
      var k, option, v, _base, _i, _len, _ref, _ref1, _ref2;
      this.els = els;
      this.models = models;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.build = __bind(this.build, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      _ref = ['config', 'binders', 'formatters'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        this[option] = {};
        if (this.options[option]) {
          _ref1 = this.options[option];
          for (k in _ref1) {
            v = _ref1[k];
            this[option][k] = v;
          }
        }
        _ref2 = Rivets[option];
        for (k in _ref2) {
          v = _ref2[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      var prefix;
      prefix = this.config.prefix;
      if (prefix) {
        return new RegExp("^data-" + prefix + "-");
      } else {
        return /^data-/;
      }
    };

    View.prototype.build = function() {
      var bindingRegExp, el, node, parse, skipNodes, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      parse = function(node) {
        var attribute, attributes, binder, context, ctx, dependencies, identifier, key, keypath, n, options, path, pipe, pipes, regexp, splitPath, type, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
        if (__indexOf.call(skipNodes, node) < 0) {
          _ref = node.attributes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attribute = _ref[_i];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              if (!(binder = _this.binders[type])) {
                _ref1 = _this.binders;
                for (identifier in _ref1) {
                  value = _ref1[identifier];
                  if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                    regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                    if (regexp.test(type)) {
                      binder = value;
                    }
                  }
                }
              }
              binder || (binder = _this.binders['*']);
              if (binder.block) {
                _ref2 = node.getElementsByTagName('*');
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  n = _ref2[_j];
                  skipNodes.push(n);
                }
                attributes = [attribute];
              }
            }
          }
          _ref3 = attributes || node.attributes;
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            attribute = _ref3[_k];
            if (bindingRegExp.test(attribute.name)) {
              options = {};
              type = attribute.name.replace(bindingRegExp, '');
              pipes = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = attribute.value.split('|');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  pipe = _ref4[_l];
                  _results.push(pipe.trim());
                }
                return _results;
              })();
              context = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = pipes.shift().split('<');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  ctx = _ref4[_l];
                  _results.push(ctx.trim());
                }
                return _results;
              })();
              path = context.shift();
              splitPath = path.split(/\.|:/);
              options.formatters = pipes;
              options.bypass = path.indexOf(':') !== -1;
              if (splitPath[0]) {
                key = splitPath.shift();
              } else {
                key = null;
                splitPath.shift();
              }
              keypath = splitPath.join('.');
              if (_this.models[key] != null) {
                if (dependencies = context.shift()) {
                  options.dependencies = dependencies.split(/\s+/);
                }
                _this.bindings.push(new Rivets.Binding(_this, node, type, key, keypath, options));
              }
            }
          }
          if (attributes) {
            attributes = null;
          }
        }
      };
      _ref = this.els;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parse(el);
        _ref1 = el.getElementsByTagName('*');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          node = _ref1[_j];
          if (node.attributes != null) {
            parse(node);
          }
        }
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function(models) {
      var binding, key, model, _results;
      if (models == null) {
        models = {};
      }
      _results = [];
      for (key in models) {
        model = models[key];
        this.models[key] = model;
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = this.select(function(b) {
            return b.key === key;
          });
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            binding = _ref[_i];
            _results1.push(binding.update());
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return View;

  })();

  Rivets.Util = {
    bindEvent: function(el, event, handler, view) {
      var fn;
      fn = function(ev) {
        return handler.call(this, ev, view);
      };
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.on != null) {
          el.on(event, fn);
        } else {
          el.bind(event, fn);
        }
      } else if (window.addEventListener != null) {
        el.addEventListener(event, fn, false);
      } else {
        event = 'on' + event;
        el.attachEvent(event, fn);
      }
      return fn;
    },
    unbindEvent: function(el, event, fn) {
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.off != null) {
          return el.off(event, fn);
        } else {
          return el.unbind(event, fn);
        }
      } else if (window.removeEventListener) {
        return el.removeEventListener(event, fn, false);
      } else {
        event = 'on' + event;
        return el.detachEvent(event, fn);
      }
    },
    getInputValue: function(el) {
      var o, _i, _len, _results;
      if (window.jQuery != null) {
        el = jQuery(el);
        switch (el[0].type) {
          case 'checkbox':
            return el.is(':checked');
          default:
            return el.val();
        }
      } else {
        switch (el.type) {
          case 'checkbox':
            return el.checked;
          case 'select-multiple':
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              if (o.selected) {
                _results.push(o.value);
              }
            }
            return _results;
            break;
          default:
            return el.value;
        }
      }
    }
  };

  Rivets.binders = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) === (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !!value;
        }
      }
    },
    unchecked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) !== (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !value;
        }
      }
    },
    show: function(el, value) {
      return el.style.display = value ? '' : 'none';
    },
    hide: function(el, value) {
      return el.style.display = value ? 'none' : '';
    },
    html: function(el, value) {
      return el.innerHTML = value != null ? value : '';
    },
    value: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var o, _i, _len, _ref, _ref1, _ref2, _results;
        if (window.jQuery != null) {
          el = jQuery(el);
          if ((value != null ? value.toString() : void 0) !== ((_ref = el.val()) != null ? _ref.toString() : void 0)) {
            return el.val(value != null ? value : '');
          }
        } else {
          if (el.type === 'select-multiple') {
            if (value != null) {
              _results = [];
              for (_i = 0, _len = el.length; _i < _len; _i++) {
                o = el[_i];
                _results.push(o.selected = (_ref1 = o.value, __indexOf.call(value, _ref1) >= 0));
              }
              return _results;
            }
          } else if ((value != null ? value.toString() : void 0) !== ((_ref2 = el.value) != null ? _ref2.toString() : void 0)) {
            return el.value = value != null ? value : '';
          }
        }
      }
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    },
    "on-*": {
      "function": true,
      routine: function(el, value) {
        if (this.currentListener) {
          Rivets.Util.unbindEvent(el, this.args[0], this.currentListener);
        }
        return this.currentListener = Rivets.Util.bindEvent(el, this.args[0], value, this.view);
      }
    },
    "each-*": {
      block: true,
      bind: function(el, collection) {
        return el.removeAttribute(['data', this.view.config.prefix, this.type].join('-').replace('--', '-'));
      },
      unbind: function(el, collection) {
        var view, _i, _len, _ref, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            _results.push(view.unbind());
          }
          return _results;
        }
      },
      routine: function(el, collection) {
        var data, e, item, itemEl, k, m, n, options, previous, v, view, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            view.unbind();
            _ref1 = view.els;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              e = _ref1[_j];
              e.parentNode.removeChild(e);
            }
          }
        } else {
          this.marker = document.createComment(" rivets: " + this.type + " ");
          el.parentNode.insertBefore(this.marker, el);
          el.parentNode.removeChild(el);
        }
        this.iterated = [];
        if (collection) {
          _results = [];
          for (_k = 0, _len2 = collection.length; _k < _len2; _k++) {
            item = collection[_k];
            data = {};
            _ref2 = this.view.models;
            for (n in _ref2) {
              m = _ref2[n];
              data[n] = m;
            }
            data[this.args[0]] = item;
            itemEl = el.cloneNode(true);
            previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
            this.marker.parentNode.insertBefore(itemEl, (_ref3 = previous.nextSibling) != null ? _ref3 : null);
            options = {
              binders: this.view.options.binders,
              formatters: this.view.options.binders,
              config: {}
            };
            if (this.view.options.config) {
              _ref4 = this.view.options.config;
              for (k in _ref4) {
                v = _ref4[k];
                options.config[k] = v;
              }
            }
            options.config.preloadData = true;
            view = new Rivets.View(itemEl, data, options);
            view.bind();
            _results.push(this.iterated.push(view));
          }
          return _results;
        }
      }
    },
    "class-*": function(el, value) {
      var elClass;
      elClass = " " + el.className + " ";
      if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
        return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
      }
    },
    "*": function(el, value) {
      if (value) {
        return el.setAttribute(this.type, value);
      } else {
        return el.removeAttribute(this.type);
      }
    }
  };

  Rivets.config = {
    preloadData: true
  };

  Rivets.formatters = {};

  Rivets.factory = function(exports) {
    exports.binders = Rivets.binders;
    exports.formatters = Rivets.formatters;
    exports.config = Rivets.config;
    exports.configure = function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
    };
    return exports.bind = function(el, models, options) {
      var view;
      if (models == null) {
        models = {};
      }
      if (options == null) {
        options = {};
      }
      view = new Rivets.View(el, models, options);
      view.bind();
      return view;
    };
  };

  if (typeof exports === 'object') {
    Rivets.factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      Rivets.factory(window.rivets = exports);
      return exports;
    });
  } else {
    Rivets.factory(window.rivets = {});
  }

}).call(this);

var ISOCountryNames = {
  "AF": "Afghanistan",
  "AX": "Åland Islands",
  "AL": "Albania",
  "DZ": "Algeria",
  "AS": "American Samoa",
  "AD": "Andorra",
  "AO": "Angola",
  "AI": "Anguilla",
  "AQ": "Antarctica",
  "AG": "Antigua and Barbuda",
  "AR": "Argentina",
  "AM": "Armenia",
  "AW": "Aruba",
  "AU": "Australia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BS": "Bahamas",
  "BH": "Bahrain",
  "BD": "Bangladesh",
  "BB": "Barbados",
  "BY": "Belarus",
  "BE": "Belgium",
  "BZ": "Belize",
  "BJ": "Benin",
  "BM": "Bermuda",
  "BT": "Bhutan",
  "BO": "Bolivia, Plurinational State of",
  "BQ": "Bonaire, Sint Eustatius and Saba",
  "BA": "Bosnia and Herzegovina",
  "BW": "Botswana",
  "BV": "Bouvet Island",
  "BR": "Brazil",
  "IO": "British Indian Ocean Territory",
  "BN": "Brunei Darussalam",
  "BG": "Bulgaria",
  "BF": "Burkina Faso",
  "BI": "Burundi",
  "KH": "Cambodia",
  "CM": "Cameroon",
  "CA": "Canada",
  "CV": "Cape Verde",
  "KY": "Cayman Islands",
  "CF": "Central African Republic",
  "TD": "Chad",
  "CL": "Chile",
  "CN": "China",
  "CX": "Christmas Island",
  "CC": "Cocos (Keeling) Islands",
  "CO": "Colombia",
  "KM": "Comoros",
  "CG": "Congo",
  "CD": "Congo, the Democratic Republic of the",
  "CK": "Cook Islands",
  "CR": "Costa Rica",
  "CI": "Côte d'Ivoire",
  "HR": "Croatia",
  "CU": "Cuba",
  "CW": "Curaçao",
  "CY": "Cyprus",
  "CZ": "Czech Republic",
  "DK": "Denmark",
  "DJ": "Djibouti",
  "DM": "Dominica",
  "DO": "Dominican Republic",
  "EC": "Ecuador",
  "EG": "Egypt",
  "SV": "El Salvador",
  "GQ": "Equatorial Guinea",
  "ER": "Eritrea",
  "EE": "Estonia",
  "ET": "Ethiopia",
  "FK": "Falkland Islands (Malvinas)",
  "FO": "Faroe Islands",
  "FJ": "Fiji",
  "FI": "Finland",
  "FR": "France",
  "GF": "French Guiana",
  "PF": "French Polynesia",
  "TF": "French Southern Territories",
  "GA": "Gabon",
  "GM": "Gambia",
  "GE": "Georgia",
  "DE": "Germany",
  "GH": "Ghana",
  "GI": "Gibraltar",
  "GR": "Greece",
  "GL": "Greenland",
  "GD": "Grenada",
  "GP": "Guadeloupe",
  "GU": "Guam",
  "GT": "Guatemala",
  "GG": "Guernsey",
  "GN": "Guinea",
  "GW": "Guinea-Bissau",
  "GY": "Guyana",
  "HT": "Haiti",
  "HM": "Heard Island and McDonald Mcdonald Islands",
  "VA": "Holy See (Vatican City State)",
  "HN": "Honduras",
  "HK": "Hong Kong",
  "HU": "Hungary",
  "IS": "Iceland",
  "IN": "India",
  "ID": "Indonesia",
  "IR": "Iran, Islamic Republic of",
  "IQ": "Iraq",
  "IE": "Ireland",
  "IM": "Isle of Man",
  "IL": "Israel",
  "IT": "Italy",
  "JM": "Jamaica",
  "JP": "Japan",
  "JE": "Jersey",
  "JO": "Jordan",
  "KZ": "Kazakhstan",
  "KE": "Kenya",
  "KI": "Kiribati",
  "KP": "Korea, Democratic People's Republic of",
  "KR": "Korea, Republic of",
  "KW": "Kuwait",
  "KG": "Kyrgyzstan",
  "LA": "Lao People's Democratic Republic",
  "LV": "Latvia",
  "LB": "Lebanon",
  "LS": "Lesotho",
  "LR": "Liberia",
  "LY": "Libya",
  "LI": "Liechtenstein",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "MO": "Macao",
  "MK": "Macedonia, the Former Yugoslav Republic of",
  "MG": "Madagascar",
  "MW": "Malawi",
  "MY": "Malaysia",
  "MV": "Maldives",
  "ML": "Mali",
  "MT": "Malta",
  "MH": "Marshall Islands",
  "MQ": "Martinique",
  "MR": "Mauritania",
  "MU": "Mauritius",
  "YT": "Mayotte",
  "MX": "Mexico",
  "FM": "Micronesia, Federated States of",
  "MD": "Moldova, Republic of",
  "MC": "Monaco",
  "MN": "Mongolia",
  "ME": "Montenegro",
  "MS": "Montserrat",
  "MA": "Morocco",
  "MZ": "Mozambique",
  "MM": "Myanmar",
  "NA": "Namibia",
  "NR": "Nauru",
  "NP": "Nepal",
  "NL": "Netherlands",
  "NC": "New Caledonia",
  "NZ": "New Zealand",
  "NI": "Nicaragua",
  "NE": "Niger",
  "NG": "Nigeria",
  "NU": "Niue",
  "NF": "Norfolk Island",
  "MP": "Northern Mariana Islands",
  "NO": "Norway",
  "OM": "Oman",
  "PK": "Pakistan",
  "PW": "Palau",
  "PS": "Palestine, State of",
  "PA": "Panama",
  "PG": "Papua New Guinea",
  "PY": "Paraguay",
  "PE": "Peru",
  "PH": "Philippines",
  "PN": "Pitcairn",
  "PL": "Poland",
  "PT": "Portugal",
  "PR": "Puerto Rico",
  "QA": "Qatar",
  "RE": "Réunion",
  "RO": "Romania",
  "RU": "Russian Federation",
  "RW": "Rwanda",
  "BL": "Saint Barthélemy",
  "SH": "Saint Helena, Ascension and Tristan da Cunha",
  "KN": "Saint Kitts and Nevis",
  "LC": "Saint Lucia",
  "MF": "Saint Martin (French part)",
  "PM": "Saint Pierre and Miquelon",
  "VC": "Saint Vincent and the Grenadines",
  "WS": "Samoa",
  "SM": "San Marino",
  "ST": "Sao Tome and Principe",
  "SA": "Saudi Arabia",
  "SN": "Senegal",
  "RS": "Serbia",
  "SC": "Seychelles",
  "SL": "Sierra Leone",
  "SG": "Singapore",
  "SX": "Sint Maarten (Dutch part)",
  "SK": "Slovakia",
  "SI": "Slovenia",
  "SB": "Solomon Islands",
  "SO": "Somalia",
  "ZA": "South Africa",
  "GS": "South Georgia and the South Sandwich Islands",
  "SS": "South Sudan",
  "ES": "Spain",
  "LK": "Sri Lanka",
  "SD": "Sudan",
  "SR": "Suriname",
  "SJ": "Svalbard and Jan Mayen",
  "SZ": "Swaziland",
  "SE": "Sweden",
  "CH": "Switzerland",
  "SY": "Syrian Arab Republic",
  "TW": "Taiwan, Province of China",
  "TJ": "Tajikistan",
  "TZ": "Tanzania, United Republic of",
  "TH": "Thailand",
  "TL": "Timor-Leste",
  "TG": "Togo",
  "TK": "Tokelau",
  "TO": "Tonga",
  "TT": "Trinidad and Tobago",
  "TN": "Tunisia",
  "TR": "Turkey",
  "TM": "Turkmenistan",
  "TC": "Turks and Caicos Islands",
  "TV": "Tuvalu",
  "UG": "Uganda",
  "UA": "Ukraine",
  "AE": "United Arab Emirates",
  "GB": "United Kingdom",
  "US": "United States",
  "UM": "United States Minor Outlying Islands",
  "UY": "Uruguay",
  "UZ": "Uzbekistan",
  "VU": "Vanuatu",
  "VE": "Venezuela, Bolivarian Republic of",
  "VN": "Viet Nam",
  "VG": "Virgin Islands, British",
  "VI": "Virgin Islands, U.S.",
  "WF": "Wallis and Futuna",
  "EH": "Western Sahara",
  "YE": "Yemen",
  "ZM": "Zambia",
  "ZW": "Zimbabwe",
};
var scripts;scripts={},window.requireOnce=function(a,b){return"undefined"==typeof scripts[a]?(scripts[a]=[],null!=b&&scripts[a].push(b),$.getScript(a,function(){var c,d,e;for(e=scripts[a],c=0,d=e.length;d>c;c++)b=e[c],b();return scripts[a]=!0})):scripts[a]===!0?"function"==typeof b?b():void 0:null!=b?scripts[a].push(b):void 0};
(function() {
  var inputEvent;

  inputEvent = document.addEventListener ? 'input' : 'keyup';

  rivets.binders.input = {
    publishes: true,
    routine: rivets.binders.value.routine,
    bind: function(el) {
      return $(el).bind("" + inputEvent + ".rivets", this.publish);
    },
    unbind: function(el) {
      return $(el).unbind("" + inputEvent + ".rivets");
    }
  };

  rivets.configure({
    prefix: "rv",
    adapter: {
      subscribe: function(obj, keypath, callback) {
        callback.wrapped = function(m, v) {
          return callback(v);
        };
        return obj.on('change:' + keypath, callback.wrapped);
      },
      unsubscribe: function(obj, keypath, callback) {
        return obj.off('change:' + keypath, callback.wrapped);
      },
      read: function(obj, keypath) {
        if (keypath === "cid") {
          return obj.cid;
        }
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        if (obj.cid) {
          return obj.set(keypath, value);
        } else {
          return obj[keypath] = value;
        }
      }
    }
  });

}).call(this);

(function() {
  var FormRenderer, autoLink, sanitizeConfig;

  window.FormRenderer = FormRenderer = Backbone.View.extend({
    defaults: {
      enablePages: true,
      screendoorBase: 'https://screendoor.dobt.co',
      target: '[data-formrenderer]',
      validateImmediately: false,
      response: {},
      preview: false,
      skipValidation: void 0,
      saveParams: {},
      showLabels: false,
      scrollToPadding: 0,
      saveCallback: undefined,
      plugins: ['Autosave', 'WarnBeforeUnload', 'BottomBar', 'ErrorBar', 'LocalStorage']
    },
    constructor: function(options) {
      var p, _i, _len, _ref;
      console.log(options);
      this.options = $.extend({}, this.defaults, options);
      this.requests = 0;
      this.state = new Backbone.Model({
        hasChanges: false
      });
      this.setElement($(this.options.target));
      this.$el.addClass('fr_form');
      this.$el.data('formrenderer-instance', this);
      this.subviews = {
        pages: {}
      };
      this.plugins = _.map(this.options.plugins, (function(_this) {
        return function(pluginName) {
          return new FormRenderer.Plugins[pluginName](_this);
        };
      })(this));
      _ref = this.plugins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (typeof p.beforeFormLoad === "function") {
          p.beforeFormLoad();
        }
      }
      this.$el.html(JST['main'](this));
      this.trigger('viewRendered', this);
      this.loadFromServer((function(_this) {
        return function() {
          var _base, _j, _len1, _ref1;
          _this.$el.find('.fr_loading').remove();
          _this.initResponseFields();
          _this.initPages();
          if (_this.options.enablePages) {
            _this.initPagination();
          } else {
            _this.initNoPagination();
          }
          _ref1 = _this.plugins;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            p = _ref1[_j];
            if (typeof p.afterFormLoad === "function") {
              p.afterFormLoad();
            }
          }
          if (_this.options.validateImmediately) {
            _this.validate();
          }
          _this.initConditions();
          _this.trigger('ready');
          return typeof (_base = _this.options).onReady === "function" ? _base.onReady() : void 0;
        };
      })(this));
      return this;
    },
    corsSupported: function() {
      return 'withCredentials' in new XMLHttpRequest();
    },
    projectUrl: function() {
      return "" + this.options.screendoorBase + "/projects/" + this.options.project_id + "/responses/new";
    },
    loadFromServer: function(cb) {
      if ((this.options.response_fields != null) && (this.options.response.responses != null)) {
        return cb();
      }
      return $.ajax({
        url: "" + this.options.screendoorBase + "/api/form_renderer/load",
        type: 'get',
        dataType: 'json',
        data: {
          project_id: this.options.project_id,
          response_id: this.options.response.id,
          v: 0
        },
        success: (function(_this) {
          return function(data) {
            var _base, _base1, _ref;
            _this.options.response.id = data.response_id;
            (_base = _this.options).response_fields || (_base.response_fields = data.project.response_fields);
            (_base1 = _this.options.response).responses || (_base1.responses = ((_ref = data.response) != null ? _ref.responses : void 0) || {});
            return cb();
          };
        })(this),
        error: (function(_this) {
          return function(xhr) {
            var _ref;
            if (!_this.corsSupported()) {
              return _this.$el.find('.fr_loading').html("Sorry, your browser does not support this embedded form. Please visit\n<a href='" + (_this.projectUrl()) + "'>" + (_this.projectUrl()) + "</a> to fill out\nthis form.");
            } else {
              _this.$el.find('.fr_loading').text("Error loading form: \"" + (((_ref = xhr.responseJSON) != null ? _ref.error : void 0) || 'Unknown') + "\"");
              return _this.trigger('errorSaving', xhr);
            }
          };
        })(this)
      });
    },
    initResponseFields: function() {
      var model, rf, _i, _len, _ref;
      this.response_fields = new Backbone.Collection;
      _ref = this.options.response_fields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rf = _ref[_i];
        model = new FormRenderer.Models["ResponseField" + (_.str.classify(rf.field_type))](rf, {
          form_renderer: this
        });
        console.log(_.str.classify(rf.field_type));
        console.log(model);
        if (model.input_field) {
          model.setExistingValue(this.options.response.responses[model.get('cid')]);
        }
        this.response_fields.add(model);
        console.log(this.response_fields)
      }
      return this.listenTo(this.response_fields, 'change:value change:value.*', $.proxy(this._onChange, this));
    },
    initPages: function() {
      var addPage, currentPageInLoop, page, pageNumber, _ref, _results;
      addPage = (function(_this) {
        return function() {
          return _this.subviews.pages[currentPageInLoop] = new FormRenderer.Views.Page({
            form_renderer: _this
          });
        };
      })(this);
      this.numPages = this.response_fields.filter(function(rf) {
        return rf.get('field_type') === 'page_break';
      }).length + 1;
      this.state.set('activePage', 1);
      currentPageInLoop = 1;
      addPage();
      this.response_fields.each((function(_this) {
        return function(rf) {
          if (rf.get('field_type') === 'page_break') {
            currentPageInLoop++;
            return addPage();
          } else {
            return _this.subviews.pages[currentPageInLoop].models.push(rf);
          }
        };
      })(this));
      _ref = this.subviews.pages;
      _results = [];
      for (pageNumber in _ref) {
        page = _ref[pageNumber];
        _results.push(this.$el.append(page.render().el));
      }
      return _results;
    },
    initPagination: function() {
      this.subviews.pagination = new FormRenderer.Views.Pagination({
        form_renderer: this
      });
      this.$el.prepend(this.subviews.pagination.render().el);
      return this.subviews.pages[this.state.get('activePage')].show();
    },
    initNoPagination: function() {
      var page, pageNumber, _ref, _results;
      _ref = this.subviews.pages;
      _results = [];
      for (pageNumber in _ref) {
        page = _ref[pageNumber];
        _results.push(page.show());
      }
      return _results;
    },
    initConditions: function() {
      this.listenTo(this.response_fields, 'change:value change:value.*', (function(_this) {
        return function(rf) {
          return _this.runConditions(rf);
        };
      })(this));
      return this.allConditions = _.flatten(this.response_fields.map(function(rf) {
        return _.map(rf.getConditions(), function(c) {
          return _.extend({}, c, {
            parent: rf
          });
        });
      }));
    },
    activatePage: function(newPageNumber) {
      this.subviews.pages[this.state.get('activePage')].hide();
      this.subviews.pages[newPageNumber].show();
      window.scrollTo(0, this.options.scrollToPadding);
      return this.state.set('activePage', newPageNumber);
    },
    validate: function() {
      var page, _, _ref;
      _ref = this.subviews.pages;
      for (_ in _ref) {
        page = _ref[_];
        page.validate();
      }
      this.trigger('afterValidate afterValidate:all');
      return this.areAllPagesValid();
    },
    isPageVisible: function(pageNumber) {
      return this.subviews.pages[pageNumber] && !!_.find(this.subviews.pages[pageNumber].models, (function(rf) {
        return rf.isVisible;
      }));
    },
    isPageValid: function(pageNumber) {
      return !_.find(this.subviews.pages[pageNumber].models, (function(rf) {
        return rf.input_field && rf.errors.length > 0;
      }));
    },
    focusFirstError: function() {
      var page, view;
      page = this.invalidPages()[0];
      this.activatePage(page);
      view = this.subviews.pages[page].firstViewWithError();
      window.scrollTo(0, view.$el.offset().top - this.options.scrollToPadding);
      return view.focus();
    },
    invalidPages: function() {
      var _i, _ref, _results;
      return _.filter((function() {
        _results = [];
        for (var _i = 1, _ref = this.numPages; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), (function(_this) {
        return function(x) {
          return _this.isPageValid(x) === false;
        };
      })(this));
    },
    areAllPagesValid: function() {
      return this.invalidPages().length === 0;
    },
    visiblePages: function() {
      return _.tap([], (function(_this) {
        return function(a) {
          var num, _, _ref, _results;
          _ref = _this.subviews.pages;
          _results = [];
          for (num in _ref) {
            _ = _ref[num];
            if (_this.isPageVisible(num)) {
              _results.push(a.push(parseInt(num, 10)));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    },
    isFirstPage: function() {
      var first;
      first = this.visiblePages()[0];
      return !first || (this.state.get('activePage') === first);
    },
    isLastPage: function() {
      var last;
      last = _.last(this.visiblePages());
      return !last || (this.state.get('activePage') === last);
    },
    previousPage: function() {
      return this.visiblePages()[_.indexOf(this.visiblePages(), this.state.get('activePage')) - 1];
    },
    nextPage: function() {
      return this.visiblePages()[_.indexOf(this.visiblePages(), this.state.get('activePage')) + 1];
    },
    handlePreviousPage: function() {
      return this.activatePage(this.previousPage());
    },
    handleNextPage: function() {
      if (this.isLastPage() || !this.options.enablePages) {
        return this.submit();
      } else {
        return this.activatePage(this.nextPage());
      }
    },
    getValue: function() {
      return _.tap({}, (function(_this) {
        return function(h) {
          return _this.response_fields.each(function(rf) {
            var gotValue;
            if (!rf.input_field) {
              return;
            }
            if (!rf.isVisible) {
              return;
            }
            gotValue = rf.getValue();
            if ((typeof gotValue === 'object') && gotValue.merge) {
              delete gotValue.merge;
              return _.extend(h, gotValue);
            } else {
              return h[rf.get('cid')] = gotValue;
            }
          });
        };
      })(this));
    },
    saveParams: function() {
      return _.extend({
        v: 0,
        response_id: this.options.response.id,
        project_id: this.options.project_id,
        skip_validation: this.options.skipValidation
      }, this.options.saveParams);
    },
    _onChange: function() {
      this.state.set('hasChanges', true);
      if (this.isSaving) {
        return this.changedWhileSaving = true;
      }
    },
    save: function(options) {
      if (options == null) {
        options = {};
      }
      this.isSaving = false;
      this.state.set({
              hasChanges: false,
              hasServerErrors: false
      });
      return this.options.saveCallback(this.getValue());
      /*if (this.isSaving) {
        return;
      }
      /this.requests += 1;
      this.isSaving = true;
      this.changedWhileSaving = false;
      console.log('SAVE CALLBACK');
      console.log(this.options);
      console.log(this.options.saveCallback);
      if(this.options.saveCallback){
        var tmp = this.options.saveCallback(this.getValue());

        this.requests -= 1;
        this.isSaving = false;
        this.trigger('afterSave');

        return tmp;
      }*/
      /*
      return $.ajax({
        url: "" + this.options.screendoorBase + "/api/form_renderer/save",
        type: 'post',
        dataType: 'json',
        data: _.extend(this.saveParams(), {
          raw_responses: this.getValue(),
          submit: options.submit ? true : void 0
        }),
        complete: (function(_this) {
          return function() {
            _this.requests -= 1;
            _this.isSaving = false;
            return _this.trigger('afterSave');
          };
        })(this),
        success: (function(_this) {
          return function(data) {
            var _ref;
            _this.state.set({
              hasChanges: _this.changedWhileSaving,
              hasServerErrors: false
            });
            _this.options.response.id = data.response_id;
            return (_ref = options.cb) != null ? _ref.apply(_this, arguments) : void 0;
          };
        })(this),
        error: (function(_this) {
          return function() {
            return _this.state.set({
              hasServerErrors: true,
              submitting: false
            });
          };
        })(this)
      });
        */
    },
    waitForRequests: function(cb) {
      if (this.requests > 0) {
        return setTimeout(((function(_this) {
          return function() {
            return _this.waitForRequests(cb);
          };
        })(this)), 100);
      } else {
        return cb();
      }
    },
    submit: function(opts) {
      if (opts == null) {
        opts = {};
      }
      if (!(opts.skipValidation || this.options.skipValidation || this.validate())) {
        return;
      }
      this.state.set('submitting', true);
      return this.waitForRequests((function(_this) {
        return function() {
          if (_this.options.preview) {
            return _this._preview();
          } else {
            return _this.save({
              submit: true,
              cb: function() {
                _this.trigger('afterSubmit');
                return _this._afterSubmit();
              }
            });
          }
        };
      })(this));
    },
    _afterSubmit: function() {
      var $page, as;
      as = this.options.afterSubmit;
      if (typeof as === 'function') {
        return as.call(this);
      } else if (typeof as === 'string') {
        return window.location = as.replace(':id', this.options.response.id);
      } else if (typeof as === 'object' && as.method === 'page') {
        $page = $("<div class='fr_after_submit_page'>" + as.html + "</div>");
        return this.$el.replaceWith($page);
      } else {
        return console.log('[FormRenderer] Not sure what to do...');
      }
    },
    _preview: function() {
      var cb;
      cb = (function(_this) {
        return function() {
          return window.location = _this.options.preview.replace(':id', _this.options.response.id);
        };
      })(this);
      if (!this.state.get('hasChanges') && this.options.response.id) {
        return cb();
      } else {
        return this.save({
          cb: cb
        });
      }
    },
    reflectConditions: function() {
      var page, _, _ref, _ref1;
      _ref = this.subviews.pages;
      for (_ in _ref) {
        page = _ref[_];
        page.reflectConditions();
      }
      return (_ref1 = this.subviews.pagination) != null ? _ref1.render() : void 0;
    },
    runConditions: function(rf) {
      var needsRender;
      needsRender = false;
      _.each(this.conditionsForResponseField(rf), function(c) {
        if (c.parent.calculateVisibility()) {
          return needsRender = true;
        }
      });
      if (needsRender) {
        return this.reflectConditions();
      }
    },
    conditionsForResponseField: function(rf) {
      return _.filter(this.allConditions, function(condition) {
        return ("" + condition.response_field_id) === ("" + rf.id);
      });
    },
    isConditionalVisible: function(condition) {
      return new FormRenderer.ConditionChecker(this, condition).isVisible();
    }
  });

  FormRenderer.INPUT_FIELD_TYPES = ['identification', 'address', 'checkboxes', 'date', 'dropdown', 'email', 'file', 'number', 'paragraph', 'price', 'radio', 'table', 'text', 'time', 'website', 'map_marker'];

  FormRenderer.NON_INPUT_FIELD_TYPES = ['block_of_text', 'page_break', 'section_break'];

  FormRenderer.FIELD_TYPES = _.union(FormRenderer.INPUT_FIELD_TYPES, FormRenderer.NON_INPUT_FIELD_TYPES);

  FormRenderer.BUTTON_CLASS = '';

  FormRenderer.DEFAULT_LAT_LNG = [40.7700118, -73.9800453];

  FormRenderer.MAPBOX_URL = 'https://api.tiles.mapbox.com/mapbox.js/v2.1.4/mapbox.js';

  FormRenderer.FILE_TYPES = {
    images: ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'tif', 'tiff'],
    videos: ['m4v', 'mp4', 'mov', 'mpg'],
    audio: ['m4a', 'mp3', 'wav'],
    docs: ['doc', 'docx', 'pdf', 'rtf', 'txt']
  };

  FormRenderer.ADD_ROW_LINK = '+ Add another row';

  FormRenderer.REMOVE_ROW_LINK = '-';

  FormRenderer.Views = {};

  FormRenderer.Models = {};

  FormRenderer.Validators = {};

  FormRenderer.Plugins = {};

  FormRenderer.addPlugin = function(x) {
    return this.prototype.defaults.plugins.push(x);
  };

  FormRenderer.removePlugin = function(x) {
    return this.prototype.defaults.plugins = _.without(this.prototype.defaults.plugins, x);
  };

  FormRenderer.loadLeaflet = function(cb) {
    if ((typeof L !== "undefined" && L !== null ? L.GeoJSON : void 0) != null) {
      return cb();
    } else {
      return requireOnce(FormRenderer.MAPBOX_URL, cb);
    }
  };

  FormRenderer.initMap = function(el) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiYWRhbWphY29iYmVja2VyIiwiYSI6Im1SVEQtSm8ifQ.ZgEOSXsv9eLfGQ-9yAmtIg';
    return L.mapbox.map(el, 'adamjacobbecker.ja7plkah');
  };

  FormRenderer.getLength = function(wordsOrChars, val) {
    if (wordsOrChars === 'words') {
      return (_.str.trim(val).replace(/['";:,.?¿\-!¡]+/g, '').match(/\S+/g) || '').length;
    } else {
      return _.str.trim(val).replace(/\s/g, '').length;
    }
  };

  autoLink = function(str) {
    var pattern;
    pattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
    return str.replace(pattern, "$1<a href='$2' target='_blank'>$2</a>");
  };

  sanitizeConfig = _.extend({}, Sanitize.Config.RELAXED);

  sanitizeConfig.attributes.a.push('target');

  FormRenderer.formatHTML = function(unsafeHTML) {
    return _.sanitize(autoLink(_.simpleFormat(unsafeHTML || '', false)), sanitizeConfig);
  };

}).call(this);

(function() {
  var commonCountries;

  commonCountries = ['US', 'GB', 'CA'];

  FormRenderer.ORDERED_COUNTRIES = _.uniq(_.union(commonCountries, [void 0], _.keys(ISOCountryNames)));

  FormRenderer.PROVINCES_CA = ['Alberta', 'British Columbia', 'Labrador', 'Manitoba', 'New Brunswick', 'Newfoundland', 'Nova Scotia', 'Nunavut', 'Northwest Territories', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewen', 'Yukon'];

  FormRenderer.PROVINCES_US = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

}).call(this);

(function() {
  FormRenderer.errors = {
    blank: "This field can't be blank.",
    identification: "Please enter your name and email address.",
    date: 'Please enter a valid date.',
    email: 'Please enter a valid email address.',
    integer: 'Please enter a whole number.',
    number: 'Please enter a valid number.',
    price: 'Please enter a valid price.',
    time: 'Please enter a valid time.',
    large: 'Your answer is too large.',
    long: 'Your answer is too long.',
    short: 'Your answer is too short.',
    small: 'Your answer is too small.'
  };

}).call(this);

(function() {
  FormRenderer.ConditionChecker = (function() {
    function ConditionChecker(form_renderer, condition) {
      var _ref;
      this.form_renderer = form_renderer;
      this.condition = condition;
      this.value = ((_ref = this.responseField()) != null ? _ref.toText() : void 0) || '';
    }

    ConditionChecker.prototype.method_eq = function() {
      return this.value.toLowerCase() === this.condition.value.toLowerCase();
    };

    ConditionChecker.prototype.method_contains = function() {
      return !!this.value.toLowerCase().match(this.condition.value.toLowerCase());
    };

    ConditionChecker.prototype.method_gt = function() {
      return parseFloat(this.value) > parseFloat(this.condition.value);
    };

    ConditionChecker.prototype.method_lt = function() {
      return parseFloat(this.value) < parseFloat(this.condition.value);
    };

    ConditionChecker.prototype.method_shorter = function() {
      return this.length() < parseInt(this.condition.value, 10);
    };

    ConditionChecker.prototype.method_longer = function() {
      return this.length() > parseInt(this.condition.value, 10);
    };

    ConditionChecker.prototype.length = function() {
      return FormRenderer.getLength(this.responseField().getLengthValidationUnits(), this.value);
    };

    ConditionChecker.prototype.isValid = function() {
      return this.responseField() && _.all(['value', 'action', 'response_field_id', 'method'], (function(_this) {
        return function(x) {
          return _this.condition[x];
        };
      })(this));
    };

    ConditionChecker.prototype.isVisible = function() {
      if (this.isValid()) {
        return this.actionBool() === this["method_" + this.condition.method]();
      } else {
        return true;
      }
    };

    ConditionChecker.prototype.actionBool = function() {
      return this.condition.action === 'show';
    };

    ConditionChecker.prototype.responseField = function() {
      return this.form_renderer.response_fields.get(this.condition.response_field_id);
    };

    return ConditionChecker;

  })();

}).call(this);

(function() {
  FormRenderer.Validators.DateValidator = {
    validate: function(model) {
      var day, month, year;
      year = parseInt(model.get('value.year'), 10) || 0;
      day = parseInt(model.get('value.day'), 10) || 0;
      month = parseInt(model.get('value.month'), 10) || 0;
      if (!((year > 0) && ((0 < day && day <= 31)) && ((0 < month && month <= 12)))) {
        return 'date';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.EmailValidator = {
    validate: function(model) {
      if (!model.get('value').match('@')) {
        return 'email';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.IdentificationValidator = {
    validate: function(model) {
      if (!model.get('value.email') || !model.get('value.name')) {
        return 'identification';
      } else if (!model.get('value.email').match('@')) {
        return 'email';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.IntegerValidator = {
    validate: function(model) {
      if (!model.get('field_options.integer_only')) {
        return;
      }
      if (!model.get('value').match(/^-?\d+$/)) {
        return 'integer';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.MinMaxLengthValidator = {
    validate: function(model) {
      var count, max, min;
      if (!(model.get('field_options.minlength') || model.get('field_options.maxlength'))) {
        return;
      }
      min = parseInt(model.get('field_options.minlength'), 10) || void 0;
      max = parseInt(model.get('field_options.maxlength'), 10) || void 0;
      count = FormRenderer.getLength(model.getLengthValidationUnits(), model.get('value'));
      if (min && count < min) {
        return 'short';
      } else if (max && count > max) {
        return 'long';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.MinMaxValidator = {
    validate: function(model) {
      var max, min, value;
      if (!(model.get('field_options.min') || model.get('field_options.max'))) {
        return;
      }
      min = model.get('field_options.min') && parseFloat(model.get('field_options.min'));
      max = model.get('field_options.max') && parseFloat(model.get('field_options.max'));
      value = model.field_type === 'price' ? parseFloat("" + (model.get('value.dollars') || 0) + "." + (model.get('value.cents') || 0)) : parseFloat(model.get('value').replace(/,/g, ''));
      if (min && value < min) {
        return 'small';
      } else if (max && value > max) {
        return 'large';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.NumberValidator = {
    validate: function(model) {
      var value;
      value = model.get('value');
      value = value.replace(/,/g, '').replace(/-/g, '').replace(/^\+/, '');
      if (!value.match(/^-?\d*(\.\d+)?$/)) {
        return 'number';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.PriceValidator = {
    validate: function(model) {
      var values;
      values = [];
      if (model.get('value.dollars')) {
        values.push(model.get('value.dollars').replace(/,/g, ''));
      }
      if (model.get('value.cents')) {
        values.push(model.get('value.cents'));
      }
      if (!_.every(values, function(x) {
        return x.match(/^-?\d+$/);
      })) {
        return 'price';
      }
    }
  };

}).call(this);

(function() {
  FormRenderer.Validators.TimeValidator = {
    validate: function(model) {
      var hours, minutes, seconds;
      hours = parseInt(model.get('value.hours'), 10) || 0;
      minutes = parseInt(model.get('value.minutes'), 10) || 0;
      seconds = parseInt(model.get('value.seconds'), 10) || 0;
      if (!(((1 <= hours && hours <= 12)) && ((0 <= minutes && minutes <= 60)) && ((0 <= seconds && seconds <= 60)))) {
        return 'time';
      }
    }
  };

}).call(this);

(function() {
  var i, _i, _len, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  FormRenderer.Models.ResponseField = Backbone.DeepModel.extend({
    input_field: true,
    field_type: void 0,
    validators: [],
    sync: function() {},
    initialize: function(_attrs, options) {
      if (options == null) {
        options = {};
      }
      this.form_renderer = options.form_renderer;
      this.errors = [];
      this.calculateVisibility();
      if (this.hasLengthValidations()) {
        return this.listenTo(this, 'change:value', this.calculateLength);
      }
    },
    validate: function(opts) {
      var errorIs, errorKey, errorWas, validator, validatorName, _ref;
      if (opts == null) {
        opts = {};
      }
      errorWas = this.get('error');
      this.errors = [];
      if (!this.isVisible) {
        return;
      }
      if (!this.hasValue()) {
        if (this.isRequired()) {
          this.errors.push(FormRenderer.errors.blank);
        }
      } else {
        _ref = this.validators;
        for (validatorName in _ref) {
          validator = _ref[validatorName];
          errorKey = validator.validate(this);
          if (errorKey) {
            this.errors.push(FormRenderer.errors[errorKey]);
          }
        }
      }
      errorIs = this.getError();
      if (opts.clearOnly && errorWas !== errorIs) {
        this.set('error', null);
      } else {
        this.set('error', this.getError());
      }
      return this.form_renderer.trigger('afterValidate afterValidate:one', this);
    },
    isRequired: function() {
      return this.get('required');
    },
    getError: function() {
      if (this.errors.length > 0) {
        return this.errors.join('. ');
      }
    },
    hasLengthValidations: function() {
      var _ref;
      return (_ref = FormRenderer.Validators.MinMaxLengthValidator, __indexOf.call(this.validators, _ref) >= 0) && (this.get('field_options.minlength') || this.get('field_options.maxlength'));
    },
    calculateLength: function() {
      return this.set('currentLength', FormRenderer.getLength(this.getLengthValidationUnits(), this.get('value')));
    },
    hasMinMaxValidations: function() {
      var _ref;
      return (_ref = FormRenderer.Validators.MinMaxValidator, __indexOf.call(this.validators, _ref) >= 0) && (this.get('field_options.min') || this.get('field_options.max'));
    },
    getLengthValidationUnits: function() {
      return this.get('field_options.min_max_length_units') || 'characters';
    },
    setExistingValue: function(x) {
      if (x) {
        this.set('value', x);
      }
      if (this.hasLengthValidations()) {
        return this.calculateLength();
      }
    },
    getValue: function() {
      return this.get('value');
    },
    toText: function() {
      return this.getValue();
    },
    hasValue: function() {
      return !!this.get('value');
    },
    hasAnyValueInHash: function() {
      return _.some(this.get('value'), function(v, k) {
        return !!v;
      });
    },
    hasValueHashKey: function(keys) {
      return _.some(keys, (function(_this) {
        return function(key) {
          return !!_this.get("value." + key);
        };
      })(this));
    },
    getOptions: function() {
      return this.get('field_options.options') || [];
    },
    getColumns: function() {
      return this.get('field_options.columns') || [];
    },
    getConditions: function() {
      return this.get('field_options.conditions') || [];
    },
    isConditional: function() {
      return this.getConditions().length > 0;
    },
    calculateVisibility: function() {
      var prevValue;
      prevValue = !!this.isVisible;
      this.isVisible = (!this.form_renderer ? true : this.isConditional() ? _.all(this.getConditions(), (function(_this) {
        return function(c) {
          return _this.form_renderer.isConditionalVisible(c);
        };
      })(this)) : true);
      return prevValue !== this.isVisible;
    },
    getSize: function() {
      return this.get('field_options.size') || 'small';
    },
    sizeToHeaderTag: function() {
      return {
        large: 'h2',
        medium: 'h3',
        small: 'h4'
      }[this.getSize()];
    }
  });

  FormRenderer.Models.NonInputResponseField = FormRenderer.Models.ResponseField.extend({
    input_field: false,
    field_type: void 0,
    validate: function() {},
    sync: function() {}
  });

  FormRenderer.Models.ResponseFieldIdentification = FormRenderer.Models.ResponseField.extend({
    field_type: 'identification',
    validators: [FormRenderer.Validators.IdentificationValidator],
    isRequired: function() {
      return true;
    },
    hasValue: function() {
      return this.hasValueHashKey(['email', 'name']);
    }
  });

  FormRenderer.Models.ResponseFieldMapMarker = FormRenderer.Models.ResponseField.extend({
    field_type: 'map_marker',
    hasValue: function() {
      return _.every(['lat', 'lng'], (function(_this) {
        return function(key) {
          return !!_this.get("value." + key);
        };
      })(this));
    },
    latLng: function() {
      if (this.hasValue()) {
        return [this.get('value.lat'), this.get('value.lng')];
      }
    },
    defaultLatLng: function() {
      var lat, lng;
      if ((lat = this.get('field_options.default_lat')) && (lng = this.get('field_options.default_lng'))) {
        return [lat, lng];
      }
    }
  });

  FormRenderer.Models.ResponseFieldAddress = FormRenderer.Models.ResponseField.extend({
    field_type: 'address',
    setExistingValue: function(x) {
      var _ref;
      FormRenderer.Models.ResponseField.prototype.setExistingValue.apply(this, arguments);
      if ((_ref = this.get('field_options.address_format')) !== 'city_state' && _ref !== 'city_state_zip') {
        if (!(x != null ? x.country : void 0)) {
          return this.set('value.country', 'US');
        }
      }
    },
    hasValue: function() {
      if (this.get('field_options.address_format') === 'country') {
        return !!this.get('value.country');
      } else {
        return this.hasValueHashKey(['street', 'city', 'state', 'zipcode']);
      }
    },
    toText: function() {
      return _.values(_.pick(this.getValue(), 'street', 'city', 'state', 'zipcode', 'country')).join(' ');
    }
  });

  FormRenderer.Models.ResponseFieldCheckboxes = FormRenderer.Models.ResponseField.extend({
    field_type: 'checkboxes',
    setExistingValue: function(x) {
      console.log(x);
      return this.set('value', _.tap({}, (function(_this) {
        return function(h) {
          var i, option, _i, _j, _len, _len1, _ref, _ref1, _results;
          if (!_.isEmpty(x)) {
            _ref = _this.getOptions();
            console.log(_ref);
            console.log(h);
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              option = _ref[i];
              h["" + i] = x[i];
            }
            if (x.Other) {
              h['other_checkbox'] = true;
              return h['other'] = x.Other;
            }
          } else {
            _ref1 = _this.getOptions();
            _results = [];
            for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
              option = _ref1[i];
              _results.push(h["" + i] = _.toBoolean(option.checked));
            }
            return _results;
          }
        };
      })(this)));
    },
    getValue: function() {
      var k, returnValue, v, _ref;
      returnValue = {};
      _ref = this.get('value');

      for (k in _ref) {
        v = _ref[k];
        returnValue[k] = v === true ? 'on' : v;
      }
      return returnValue;
    },
    toText: function() {
      var values;
      values = _.tap([], (function(_this) {
        return function(a) {
          var idx, k, v, _ref;
          _ref = _this.get('value');
          for (k in _ref) {
            v = _ref[k];
            idx = parseInt(k);
            if (v === true && !_.isNaN(idx)) {
              a.push(_this.getOptions()[idx].label);
            }
          }
          if (_this.get('value.other_checkbox') === true) {
            return a.push(_this.get('value.other'));
          }
        };
      })(this));
      return values.join(' ');
    },
    hasValue: function() {
      return this.hasAnyValueInHash();
    }
  });

  FormRenderer.Models.ResponseFieldRadio = FormRenderer.Models.ResponseField.extend({
    field_type: 'radio',
    setExistingValue: function(x) {
      var defaultOption;

      if(x != null)
        return this.set('value.selected', x);
      /* well that below doesnt work at all for inputs from formbuilder
      if (x != null ? x.selected : void 0) {
        return this.set('value', x);
      } else if ((defaultOption = _.find(this.getOptions(), (function(option) {
        console.log('DEFAULT');
        return _.toBoolean(option.checked);
      })))) {
        return this.set('value.selected', defaultOption.label);
      } else {
        return this.set('value', {});
      }*/
    },
    getValue: function() {
      return _.tap({
        merge: true
      }, (function(_this) {
        return function(h) {
          h["" + (_this.get('cid'))] = _this.get('value.selected');
          return h["" + (_this.get('cid')) + "_other"] = _this.get('value.other');
        };
      })(this));
    },
    toText: function() {
      return (this.getValue() || {})["" + this.cid];
    },
    hasValue: function() {
      return !!this.get('value.selected');
    }
  });

  FormRenderer.Models.ResponseFieldDropdown = FormRenderer.Models.ResponseField.extend({
    field_type: 'dropdown',
    setExistingValue: function(x) {
      var checkedOption;
      if (x != null) {
        return FormRenderer.Models.ResponseField.prototype.setExistingValue.apply(this, arguments);
      } else {
        checkedOption = _.find(this.getOptions(), (function(option) {
          return _.toBoolean(option.checked);
        }));
        if (!checkedOption && !this.get('field_options.include_blank_option')) {
          checkedOption = _.first(this.getOptions());
        }
        if (checkedOption) {
          return this.set('value', checkedOption.label);
        } else {
          return this.unset('value');
        }
      }
    }
  });

  FormRenderer.Models.ResponseFieldTable = FormRenderer.Models.ResponseField.extend({
    field_type: 'table',
    initialize: function() {
      FormRenderer.Models.ResponseField.prototype.initialize.apply(this, arguments);
      if (this.get('field_options.column_totals')) {
        return this.listenTo(this, 'change:value.*', this.calculateColumnTotals);
      }
    },
    canAddRows: function() {
      return this.numRows < this.maxRows();
    },
    minRows: function() {
      return parseInt(this.get('field_options.minrows'), 10) || 0;
    },
    maxRows: function() {
      if (this.get('field_options.maxrows')) {
        return parseInt(this.get('field_options.maxrows'), 10) || Infinity;
      } else {
        return Infinity;
      }
    },
    setExistingValue: function(x) {
      var firstColumnLength, _ref;
      firstColumnLength = ((_ref = _.find(x, (function() {
        return true;
      }))) != null ? _ref.length : void 0) || 0;
      this.numRows = Math.max(this.minRows(), firstColumnLength, 1);
      return this.set('value', _.tap({}, (function(_this) {
        return function(h) {
          var column, i, j, _i, _ref1, _results;
          _results = [];
          for (i = _i = 0, _ref1 = _this.numRows - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
            _results.push((function() {
              var _j, _len, _name, _ref2, _ref3, _results1;
              _ref2 = this.getColumns();
              _results1 = [];
              for (j = _j = 0, _len = _ref2.length; _j < _len; j = ++_j) {
                column = _ref2[j];
                h[_name = "" + j] || (h[_name] = {});
                _results1.push(h["" + j]["" + i] = this.getPresetValue(column.label, i) || (x != null ? (_ref3 = x[column.label]) != null ? _ref3[i] : void 0 : void 0));
              }
              return _results1;
            }).call(_this));
          }
          return _results;
        };
      })(this)));
    },
    hasValue: function() {
      return _.some(this.get('value'), function(colVals, colNumber) {
        return _.some(colVals, function(v, k) {
          return !!v;
        });
      });
    },
    getPresetValue: function(columnLabel, rowIndex) {
      var _ref;
      return (_ref = this.get("field_options.preset_values." + columnLabel)) != null ? _ref[rowIndex] : void 0;
    },
    getValue: function() {
      var column, i, j, returnValue, _i, _j, _len, _ref, _ref1;
      returnValue = {};
      for (i = _i = 0, _ref = this.numRows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _ref1 = this.getColumns();
        for (j = _j = 0, _len = _ref1.length; _j < _len; j = ++_j) {
          column = _ref1[j];
          returnValue[j] || (returnValue[j] = []);
          returnValue[j].push(this.get("value." + j + "." + i) || '');
        }
      }
      return returnValue;
    },
    toText: function() {
      return _.flatten(_.values(this.getValue())).join(' ');
    },
    calculateColumnTotals: function() {
      var column, columnSum, columnVals, i, j, _i, _j, _len, _ref, _ref1, _results;
      _ref = this.getColumns();
      _results = [];
      for (j = _i = 0, _len = _ref.length; _i < _len; j = ++_i) {
        column = _ref[j];
        columnVals = [];
        for (i = _j = 0, _ref1 = this.numRows - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          columnVals.push(parseFloat((this.get("value." + j + "." + i) || '').replace(/\$?,?/g, '')));
        }
        columnSum = _.reduce(columnVals, function(memo, num) {
          if (_.isNaN(num)) {
            return memo;
          } else {
            return memo + num;
          }
        }, 0);
        _results.push(this.set("columnTotals." + j, columnSum > 0 ? parseFloat(columnSum.toFixed(10)) : ''));
      }
      return _results;
    }
  });

  FormRenderer.Models.ResponseFieldFile = FormRenderer.Models.ResponseField.extend({
    field_type: 'file',
    getValue: function() {
      return this.get('value.cid') || '';
    },
    hasValue: function() {
      return this.hasValueHashKey(['cid']);
    },
    getAcceptedExtensions: function() {
      var x;
      if ((x = FormRenderer.FILE_TYPES[this.get('field_options.file_types')])) {
        return _.map(x, function(x) {
          return "." + x;
        });
      }
    }
  });

  FormRenderer.Models.ResponseFieldDate = FormRenderer.Models.ResponseField.extend({
    field_type: 'date',
    validators: [FormRenderer.Validators.DateValidator],
    hasValue: function() {
      return this.hasValueHashKey(['month', 'day', 'year']);
    },
    toText: function() {
      return _.values(_.pick(this.getValue(), 'month', 'day', 'year')).join('/');
    }
  });

  FormRenderer.Models.ResponseFieldEmail = FormRenderer.Models.ResponseField.extend({
    validators: [FormRenderer.Validators.EmailValidator],
    field_type: 'email'
  });

  FormRenderer.Models.ResponseFieldNumber = FormRenderer.Models.ResponseField.extend({
    validators: [FormRenderer.Validators.NumberValidator, FormRenderer.Validators.MinMaxValidator, FormRenderer.Validators.IntegerValidator],
    field_type: 'number'
  });

  FormRenderer.Models.ResponseFieldParagraph = FormRenderer.Models.ResponseField.extend({
    field_type: 'paragraph',
    validators: [FormRenderer.Validators.MinMaxLengthValidator]
  });

  FormRenderer.Models.ResponseFieldPrice = FormRenderer.Models.ResponseField.extend({
    validators: [FormRenderer.Validators.PriceValidator, FormRenderer.Validators.MinMaxValidator],
    field_type: 'price',
    hasValue: function() {
      return this.hasValueHashKey(['dollars', 'cents']);
    },
    toText: function() {
      var raw;
      raw = this.getValue() || {};
      return "" + (raw.dollars || '0') + "." + (raw.cents || '00');
    }
  });

  FormRenderer.Models.ResponseFieldText = FormRenderer.Models.ResponseField.extend({
    field_type: 'text',
    validators: [FormRenderer.Validators.MinMaxLengthValidator]
  });

  FormRenderer.Models.ResponseFieldTime = FormRenderer.Models.ResponseField.extend({
    validators: [FormRenderer.Validators.TimeValidator],
    field_type: 'time',
    hasValue: function() {
      return this.hasValueHashKey(['hours', 'minutes', 'seconds']);
    },
    setExistingValue: function(x) {
      FormRenderer.Models.ResponseField.prototype.setExistingValue.apply(this, arguments);
      if (!(x != null ? x.am_pm : void 0)) {
        return this.set('value.am_pm', 'AM');
      }
    },
    toText: function() {
      var raw;
      raw = this.getValue() || {};
      return "" + (raw.hours || '00') + ":" + (raw.minutes || '00') + ":" + (raw.seconds || '00') + " " + raw.am_pm;
    }
  });

  FormRenderer.Models.ResponseFieldWebsite = FormRenderer.Models.ResponseField.extend({
    field_type: 'website'
  });

  _ref = FormRenderer.NON_INPUT_FIELD_TYPES;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    FormRenderer.Models["ResponseField" + (_.str.classify(i))] = FormRenderer.Models.NonInputResponseField.extend({
      field_type: i
    });
  }

}).call(this);

(function() {
  FormRenderer.Plugins.Base = (function() {
    function Base(fr) {
      this.fr = fr;
    }

    return Base;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.Autosave = (function(_super) {
    __extends(Autosave, _super);

    function Autosave() {
      return Autosave.__super__.constructor.apply(this, arguments);
    }

    Autosave.prototype.afterFormLoad = function() {
      return setInterval((function(_this) {
        return function() {
          if (_this.fr.state.get('hasChanges')) {
            return _this.fr.save();
          }
        };
      })(this), 500);
    };

    return Autosave;

  })(FormRenderer.Plugins.Base);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.BottomBar = (function(_super) {
    __extends(BottomBar, _super);

    function BottomBar() {
      return BottomBar.__super__.constructor.apply(this, arguments);
    }

    BottomBar.prototype.afterFormLoad = function() {
      this.fr.subviews.bottomBar = new FormRenderer.Plugins.BottomBar.View({
        form_renderer: this.fr
      });
      return this.fr.$el.append(this.fr.subviews.bottomBar.render().el);
    };

    return BottomBar;

  })(FormRenderer.Plugins.Base);

  FormRenderer.Plugins.BottomBar.View = Backbone.View.extend({
    events: {
      'click [data-fr-previous-page]': function(e) {
        e.preventDefault();
        return this.form_renderer.handlePreviousPage();
      },
      'click [data-fr-next-page]': function(e) {
        e.preventDefault();
        return this.form_renderer.handleNextPage();
      }
    },
    initialize: function(options) {
      this.form_renderer = options.form_renderer;
      return this.listenTo(this.form_renderer.state, 'change:activePage change:hasChanges change:submitting change:hasServerErrors', this.render);
    },
    render: function() {
      this.$el.html(JST['plugins/bottom_bar'](this));
      this.form_renderer.trigger('viewRendered', this);
      return this;
    }
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.ErrorBar = (function(_super) {
    __extends(ErrorBar, _super);

    function ErrorBar() {
      return ErrorBar.__super__.constructor.apply(this, arguments);
    }

    ErrorBar.prototype.afterFormLoad = function() {
      this.fr.subviews.errorBar = new FormRenderer.Plugins.ErrorBar.View({
        form_renderer: this.fr
      });
      return this.fr.$el.prepend(this.fr.subviews.errorBar.render().el);
    };

    return ErrorBar;

  })(FormRenderer.Plugins.Base);

  FormRenderer.Plugins.ErrorBar.View = Backbone.View.extend({
    events: {
      'click a': function() {
        return this.form_renderer.focusFirstError();
      }
    },
    initialize: function(options) {
      this.form_renderer = options.form_renderer;
      this.listenTo(this.form_renderer, 'afterValidate:all', this.render);
      return this.listenTo(this.form_renderer, 'afterValidate:one', function() {
        if (this.form_renderer.areAllPagesValid()) {
          return this.render();
        }
      });
    },
    render: function() {
      this.$el.html(JST['plugins/error_bar'](this));
      this.form_renderer.trigger('viewRendered', this);
      if (!this.form_renderer.areAllPagesValid()) {
        window.scrollTo(0, this.$el.offset().top - this.form_renderer.options.scrollToPadding);
      }
      return this;
    }
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.LocalStorage = (function(_super) {
    __extends(LocalStorage, _super);

    function LocalStorage() {
      return LocalStorage.__super__.constructor.apply(this, arguments);
    }

    LocalStorage.prototype.beforeFormLoad = function() {
      var draftKey, _base;
      if (!store.enabled) {
        return;
      }
      draftKey = "project-" + this.fr.options.project_id + "-response-id";
      (_base = this.fr.options.response).id || (_base.id = store.get(draftKey));
      this.fr.on('afterSave', function() {
        if (!this.state.get('submitting')) {
          return store.set(draftKey, this.options.response.id);
        }
      });
      this.fr.on('afterSubmit', function() {
        return store.remove(draftKey);
      });
      return this.fr.on('errorSaving', function() {
        return store.remove(draftKey);
      });
    };

    return LocalStorage;

  })(FormRenderer.Plugins.Base);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.PageState = (function(_super) {
    __extends(PageState, _super);

    function PageState() {
      return PageState.__super__.constructor.apply(this, arguments);
    }

    PageState.prototype.afterFormLoad = function() {
      var num, page, _ref;
      if (num = (_ref = window.location.hash.match(/page([0-9]+)/)) != null ? _ref[1] : void 0) {
        page = parseInt(num, 10);
        if (this.fr.isPageVisible(page)) {
          this.fr.activatePage(page);
        }
      }
      return this.fr.state.on('change:activePage', function(_, num) {
        return window.location.hash = "page" + num;
      });
    };

    return PageState;

  })(FormRenderer.Plugins.Base);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormRenderer.Plugins.WarnBeforeUnload = (function(_super) {
    __extends(WarnBeforeUnload, _super);

    function WarnBeforeUnload() {
      return WarnBeforeUnload.__super__.constructor.apply(this, arguments);
    }

    WarnBeforeUnload.prototype.afterFormLoad = function() {
      return BeforeUnload.enable({
        "if": (function(_this) {
          return function() {
            return _this.fr.state.get('hasChanges');
          };
        })(this)
      });
    };

    return WarnBeforeUnload;

  })(FormRenderer.Plugins.Base);

}).call(this);

(function() {
  FormRenderer.Views.Page = Backbone.View.extend({
    className: 'fr_page',
    initialize: function(options) {
      this.form_renderer = options.form_renderer;
      this.models = [];
      return this.views = [];
    },
    render: function() {
      var rf, view, _i, _len, _ref;
      this.hide();
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rf = _ref[_i];
        view = new FormRenderer.Views["ResponseField" + (_.str.classify(rf.field_type))]({
          model: rf,
          form_renderer: this.form_renderer
        });
        this.$el.append(view.render().el);
        view.reflectConditions();
        this.views.push(view);
      }
      return this;
    },
    hide: function() {
      var view, _i, _len, _ref, _results;
      this.$el.hide();
      _ref = this.views;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.trigger('hidden'));
      }
      return _results;
    },
    show: function() {
      var view, _i, _len, _ref, _results;
      this.$el.show();
      _ref = this.views;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.trigger('shown'));
      }
      return _results;
    },
    reflectConditions: function() {
      var view, _i, _len, _ref, _results;
      _ref = this.views;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.reflectConditions());
      }
      return _results;
    },
    validate: function() {
      var rf, _i, _len, _ref, _results;
      _ref = _.filter(this.models, (function(rf) {
        return rf.input_field;
      }));
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rf = _ref[_i];
        _results.push(rf.validate());
      }
      return _results;
    },
    firstViewWithError: function() {
      return _.find(this.views, function(view) {
        return view.model.errors.length > 0;
      });
    }
  });

}).call(this);

(function() {
  FormRenderer.Views.Pagination = Backbone.View.extend({
    events: {
      'click [data-activate-page]': function(e) {
        return this.form_renderer.activatePage($(e.currentTarget).data('activate-page'));
      }
    },
    initialize: function(options) {
      this.form_renderer = options.form_renderer;
      this.listenTo(this.form_renderer.state, 'change:activePage', this.render);
      return this.listenTo(this.form_renderer, 'afterValidate', this.render);
    },
    render: function() {
      this.$el.html(JST['partials/pagination'](this));
      this.form_renderer.trigger('viewRendered', this);
      return this;
    }
  });

}).call(this);

(function() {
  var i, _i, _j, _len, _len1, _ref, _ref1;

  FormRenderer.Views.ResponseField = Backbone.View.extend({
    field_type: void 0,
    className: 'fr_response_field',
    events: {
      'blur input, textarea': '_onBlur'
    },
    initialize: function(options) {
      this.form_renderer = options.form_renderer;
      if (this.form_renderer) {
        this.showLabels = this.form_renderer.options.showLabels;
      } else {
        this.showLabels = options.showLabels;
      }
      this.model = options.model;
      this.listenTo(this.model, 'afterValidate', this.render);
      this.listenTo(this.model, 'change', this._onInput);
      return this.$el.addClass("fr_response_field_" + this.field_type);
    },
    getDomId: function() {
      return this.model.cid;
    },
    reflectConditions: function() {
      if (this.model.isVisible) {
        return this.$el.show();
      } else {
        return this.$el.hide();
      }
    },
    _onBlur: function(e) {
      if (this.model.hasValue()) {
        if (!(e.relatedTarget && $.contains(this.el, e.relatedTarget))) {
          if (this._isPageButton(e.relatedTarget)) {
            return $(document).one('mouseup', (function(_this) {
              return function() {
                return _this.model.validate();
              };
            })(this));
          } else {
            return this.model.validate();
          }
        }
      }
    },
    _isPageButton: function(el) {
      return el && (el.hasAttribute('data-fr-next-page') || el.hasAttribute('data-fr-previous-page'));
    },
    _onInput: function() {
      if (this.model.errors.length > 0) {
        return this.model.validate({
          clearOnly: true
        });
      }
    },
    focus: function() {
      return this.$el.find(':input:eq(0)').focus();
    },
    render: function() {
      var _ref;
      this.$el[this.model.getError() ? 'addClass' : 'removeClass']('error');
      this.$el.html(JST['partials/response_field'](this));
      rivets.bind(this.$el, {
        model: this.model
      });
      if ((_ref = this.form_renderer) != null) {
        _ref.trigger('viewRendered', this);
      }
      return this;
    }
  });

  FormRenderer.Views.NonInputResponseField = FormRenderer.Views.ResponseField.extend({
    render: function() {
      var _ref;
      this.$el.html(JST['partials/non_input_response_field'](this));
      if ((_ref = this.form_renderer) != null) {
        _ref.trigger('viewRendered', this);
      }
      return this;
    }
  });

  FormRenderer.Views.ResponseFieldPrice = FormRenderer.Views.ResponseField.extend({
    field_type: 'price',
    events: _.extend({}, FormRenderer.Views.ResponseField.prototype.events, {
      'blur [data-rv-input="model.value.cents"]': 'formatCents'
    }),
    formatCents: function(e) {
      var cents;
      cents = $(e.target).val();
      if (cents && cents.match(/^\d$/)) {
        return this.model.set('value.cents', "0" + cents);
      }
    }
  });

  FormRenderer.Views.ResponseFieldTable = FormRenderer.Views.ResponseField.extend({
    field_type: 'table',
    events: _.extend({}, FormRenderer.Views.ResponseField.prototype.events, {
      'click .js-add-row': 'addRow',
      'click .js-remove-row': 'removeRow'
    }),
    initialize: function() {
      FormRenderer.Views.ResponseField.prototype.initialize.apply(this, arguments);
      return this.on('shown', function() {
        return this.initExpanding();
      });
    },
    render: function() {
      FormRenderer.Views.ResponseField.prototype.render.apply(this, arguments);
      this.initExpanding();
      return this;
    },
    initExpanding: function() {},
    canRemoveRow: function(rowIdx) {
      var min;
      min = Math.max(1, this.model.minRows());
      return rowIdx > (min - 1);
    },
    addRow: function() {
      this.model.numRows++;
      return this.render();
    },
    removeRow: function(e) {
      var col, idx, modelVal, newVal, vals;
      idx = $(e.currentTarget).closest('[data-row-index]').data('row-index');
      modelVal = this.model.get('value');
      newVal = {};
      for (col in modelVal) {
        vals = modelVal[col];
        newVal[col] = _.tap({}, function(h) {
          var i, val, _results;
          _results = [];
          for (i in vals) {
            val = vals[i];
            i = parseInt(i, 10);
            if (i < idx) {
              _results.push(h[i] = val);
            } else if (i > idx) {
              _results.push(h[i - 1] = val);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      }
      this.model.numRows--;
      this.model.attributes.value = newVal;
      this.model.trigger('change change:value');
      return this.render();
    }
  });

  FormRenderer.Views.ResponseFieldFile = FormRenderer.Views.ResponseField.extend({
    field_type: 'file',
    events: _.extend({}, FormRenderer.Views.ResponseField.prototype.events, {
      'click [data-fr-remove-file]': 'doRemove'
    }),
    render: function() {
      FormRenderer.Views.ResponseField.prototype.render.apply(this, arguments);
      this.$input = this.$el.find('input');
      this.$status = this.$el.find('.js-upload-status');
      this.bindChangeEvent();
      return this;
    },
    bindChangeEvent: function() {
      return this.$input.on('change', $.proxy(this.fileChanged, this));
    },
    fileChanged: function(e) {
      var newFilename, _ref;
      newFilename = ((_ref = e.target.files) != null ? _ref[0] : void 0) != null ? e.target.files[0].name : e.target.value ? e.target.value.replace(/^.+\\/, '') : 'Error reading filename';
      this.model.set('value.filename', newFilename, {
        silent: true
      });
      this.$el.find('.js-filename').text(newFilename);
      this.$status.text('Uploading...');
      return this.doUpload();
    },
    doUpload: function() {
      var $oldInput, $tmpForm;
      $tmpForm = $("<form method='post' style='display: inline;' />");
      $oldInput = this.$input;
      this.$input = $oldInput.clone().hide().val('').insertBefore($oldInput);
      this.bindChangeEvent();
      $oldInput.appendTo($tmpForm);
      $tmpForm.insertBefore(this.$input);
      this.form_renderer.requests += 1;
      return $tmpForm.ajaxSubmit({
        url: "" + this.form_renderer.options.screendoorBase + "/api/form_renderer/file",
        data: {
          response_field_id: this.model.get('cid'),
          replace_file_id: this.model.get('value.id'),
          v: 0
        },
        dataType: 'json',
        uploadProgress: (function(_this) {
          return function(_, __, ___, percentComplete) {
            return _this.$status.text(percentComplete === 100 ? 'Finishing up...' : "Uploading... (" + percentComplete + "%)");
          };
        })(this),
        complete: (function(_this) {
          return function() {
            _this.form_renderer.requests -= 1;
            return $tmpForm.remove();
          };
        })(this),
        success: (function(_this) {
          return function(data) {
            _this.model.set('value.id', data.file_id);
            return _this.render();
          };
        })(this),
        error: (function(_this) {
          return function(data) {
            var errorText, _ref;
            errorText = (_ref = data.responseJSON) != null ? _ref.errors : void 0;
            _this.$status.text(errorText ? "Error: " + errorText : 'Error');
            _this.$status.addClass('fr_error');
            return setTimeout(function() {
              return _this.render();
            }, 2000);
          };
        })(this)
      });
    },
    doRemove: function() {
      this.model.set('value', {});
      return this.render();
    }
  });

  FormRenderer.Views.ResponseFieldMapMarker = FormRenderer.Views.ResponseField.extend({
    field_type: 'map_marker',
    events: _.extend({}, FormRenderer.Views.ResponseField.prototype.events, {
      'click .fr_map_cover': 'enable',
      'click [data-fr-clear-map]': 'disable'
    }),
    initialize: function() {
      FormRenderer.Views.ResponseField.prototype.initialize.apply(this, arguments);
      return this.on('shown', function() {
        var _ref;
        this.refreshing = true;
        if ((_ref = this.map) != null) {
          _ref._onResize();
        }
        return setTimeout((function(_this) {
          return function() {
            return _this.refreshing = false;
          };
        })(this), 0);
      });
    },
    render: function() {
      FormRenderer.Views.ResponseField.prototype.render.apply(this, arguments);
      this.$cover = this.$el.find('.fr_map_cover');
      FormRenderer.loadLeaflet((function(_this) {
        return function() {
          _this.initMap();
          if (_this.model.latLng()) {
            return _this.enable();
          }
        };
      })(this));
      return this;
    },
    initMap: function() {
      this.map = FormRenderer.initMap(this.$el.find('.fr_map_map')[0]);
      this.$el.find('.fr_map_map').data('map', this.map);
      this.map.setView(this.model.latLng() || this.model.defaultLatLng() || FormRenderer.DEFAULT_LAT_LNG, 13);
      this.marker = L.marker([0, 0]);
      return this.map.on('move', $.proxy(this._onMove, this));
    },
    _onMove: function() {
      var center;
      if (this.refreshing) {
        return;
      }
      center = this.map.getCenter();
      this.marker.setLatLng(center);
      return this.model.set({
        value: {
          lat: center.lat.toFixed(7),
          lng: center.lng.toFixed(7)
        }
      });
    },
    enable: function() {
      this.map.addLayer(this.marker);
      this.$cover.hide();
      return this._onMove();
    },
    disable: function() {
      this.map.removeLayer(this.marker);
      this.$el.find('.fr_map_cover').show();
      return this.model.set({
        value: {
          lat: '',
          lng: ''
        }
      });
    }
  });

  FormRenderer.Views.ResponseFieldAddress = FormRenderer.Views.ResponseField.extend({
    field_type: 'address',
    initialize: function() {
      FormRenderer.Views.ResponseField.prototype.initialize.apply(this, arguments);
      return this.listenTo(this.model, 'change:value.country', this.render);
    }
  });

  _ref = _.without(FormRenderer.INPUT_FIELD_TYPES, 'address', 'table', 'file', 'map_marker', 'price');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    FormRenderer.Views["ResponseField" + (_.str.classify(i))] = FormRenderer.Views.ResponseField.extend({
      field_type: i
    });
  }

  _ref1 = FormRenderer.NON_INPUT_FIELD_TYPES;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    i = _ref1[_j];
    FormRenderer.Views["ResponseField" + (_.str.classify(i))] = FormRenderer.Views.NonInputResponseField.extend({
      field_type: i
    });
  }

}).call(this);

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/address"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var format, x, _i, _j, _len, _len1, _ref, _ref1, _ref2;

      format = this.model.get('field_options.address_format');

      _print(_safe('\n\n'));

      if (format !== 'city_state' && format !== 'city_state_zip' && format !== 'country') {
        _print(_safe('\n  <div class=\'fr_input_grid\'>\n    <div class=\'fr_full has_sub_label\'>\n      <label class="fr_sub_label">Address</label>\n      <input type="text"\n             id="'));
        _print(this.getDomId());
        _print(_safe('"\n             data-rv-input=\'model.value.street\' />\n    </div>\n  </div>\n'));
      }

      _print(_safe('\n\n'));

      if (format !== 'country') {
        _print(_safe('\n  <div class=\'fr_input_grid\'>\n    <div class=\'fr_half has_sub_label\'>\n      <label class="fr_sub_label">City</label>\n      <input type="text"\n             data-rv-input=\'model.value.city\' />\n    </div>\n\n    <div class=\'fr_half has_sub_label\'>\n      <label class="fr_sub_label">\n        '));
        if (this.model.get('value.country') === 'US') {
          _print(_safe('\n          State\n        '));
        } else if (this.model.get('value.country') === 'CA') {
          _print(_safe('\n          Province\n        '));
        } else {
          _print(_safe('\n          State / Province / Region\n        '));
        }
        _print(_safe('\n      </label>\n\n      '));
        if ((_ref = this.model.get('value.country')) === 'US' || _ref === 'CA') {
          _print(_safe('\n        <select data-rv-value=\'model.value.state\' data-width=\'100%\'>\n          <option></option>\n          '));
          _ref1 = FormRenderer["PROVINCES_" + (this.model.get('value.country'))];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            x = _ref1[_i];
            _print(_safe('\n            <option value=\''));
            _print(x);
            _print(_safe('\'>'));
            _print(x);
            _print(_safe('</option>\n          '));
          }
          _print(_safe('\n        </select>\n      '));
        } else {
          _print(_safe('\n        <input type="text" data-rv-input=\'model.value.state\' />\n      '));
        }
        _print(_safe('\n    </div>\n  </div>\n'));
      }

      _print(_safe('\n\n<div class=\'fr_input_grid\'>\n  '));

      if (format !== 'city_state' && format !== 'country') {
        _print(_safe('\n    <div class=\'fr_half has_sub_label\'>\n      <label class="fr_sub_label">\n        '));
        if (this.model.get('value.country') === 'US') {
          _print(_safe('ZIP'));
        } else {
          _print(_safe('Postal'));
        }
        _print(_safe(' Code\n      </label>\n      <input type="text"\n             data-rv-input=\'model.value.zipcode\' />\n    </div>\n  '));
      }

      _print(_safe('\n\n  '));

      if (format !== 'city_state' && format !== 'city_state_zip') {
        _print(_safe('\n    <div class=\'fr_half has_sub_label\'>\n      <label class="fr_sub_label">Country</label>\n      <select data-rv-value=\'model.value.country\' data-width=\'100%\'>\n        '));
        _ref2 = FormRenderer.ORDERED_COUNTRIES;
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          x = _ref2[_j];
          _print(_safe('\n          <option value=\''));
          _print(x);
          _print(_safe('\'>'));
          _print(ISOCountryNames[x] || '---');
          _print(_safe('</option>\n        '));
        }
        _print(_safe('\n      </select>\n    </div>\n  '));
      }

      _print(_safe('\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/block_of_text"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_text size_'));

      _print(this.model.getSize());

      _print(_safe('\'>\n  '));

      _print(_safe(FormRenderer.formatHTML(this.model.get('field_options.description'))));

      _print(_safe('\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/checkboxes"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var i, option, _i, _len, _ref;

      _ref = this.model.getOptions();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        option = _ref[i];
        _print(_safe('\n  <label class=\'fr_option control\'>\n    <input type=\'checkbox\' data-rv-checked=\'model.value.'));
        _print(i);
        _print(_safe('\' />\n    '));
        _print(option.label);
        _print(_safe('\n  </label>\n'));
      }

      _print(_safe('\n\n'));

      if (this.model.get('field_options.include_other_option')) {
        _print(_safe('\n  <div class=\'fr_option fr_other_option\'>\n    <label class=\'control\'>\n      <input type=\'checkbox\' data-rv-checked=\'model.value.other_checkbox\' />\n      Other\n    </label>\n\n    <input type=\'text\' data-rv-input=\'model.value.other\' placeholder=\'Write your answer here\' />\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/date"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_input_grid\'>\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">MM</label>\n    <input type="text"\n           id="'));

      _print(this.getDomId());

      _print(_safe('"\n           data-rv-input=\'model.value.month\'\n           maxlength=\'2\'\n           size=\'2\' />\n  </div>\n\n  <div class=\'fr_spacer\'>/</div>\n\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">DD</label>\n    <input type="text"\n           data-rv-input=\'model.value.day\'\n           maxlength=\'2\'\n           size=\'2\' />\n  </div>\n\n  <div class=\'fr_spacer\'>/</div>\n\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">YYYY</label>\n    <input type="text"\n           data-rv-input=\'model.value.year\'\n           maxlength=\'4\'\n           size=\'4\' />\n  </div>\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/dropdown"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var option, _i, _len, _ref;

      _print(_safe('<select id="'));

      _print(this.getDomId());

      _print(_safe('" data-rv-value=\'model.value\'>\n  '));

      if (this.model.get('field_options.include_blank_option')) {
        _print(_safe('\n    <option></option>\n  '));
      }

      _print(_safe('\n\n  '));

      _ref = this.model.getOptions();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        _print(_safe('\n    <option value="'));
        _print(option.label);
        _print(_safe('">'));
        _print(option.label);
        _print(_safe('</option>\n  '));
      }

      _print(_safe('\n</select>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/email"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<input type="text" inputmode="email"\n       id="'));

      _print(this.getDomId());

      _print(_safe('"\n       class="size_'));

      _print(this.model.getSize());

      _print(_safe('"\n       data-rv-input=\'model.value\' />\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/file"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var exts;

      if (this.model.hasValue()) {
        _print(_safe('\n  <span class=\'js-filename\'>'));
        _print(this.model.get('value.filename'));
        _print(_safe('</span>\n  <button data-fr-remove-file class=\''));
        _print(FormRenderer.BUTTON_CLASS);
        _print(_safe('\'>Remove</button>\n'));
      } else {
        _print(_safe('\n  <input type=\'file\'\n         id=\''));
        _print(this.getDomId());
        _print(_safe('\'\n         name=\'file\'\n         '));
        if ((exts = this.model.getAcceptedExtensions())) {
          _print(_safe('\n          accept=\''));
          _print(exts.join(','));
          _print(_safe('\'\n         '));
        }
        _print(_safe('\n         />\n  <span class=\'js-upload-status\'></span>\n\n  '));
        if ((exts = this.model.getAcceptedExtensions())) {
          _print(_safe('\n    <div class=\'fr_description\'>\n      We\'ll accept '));
          _print(_.str.toSentence(exts));
          _print(_safe('\n    </div>\n  '));
        }
        _print(_safe('\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/identification"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_input_grid\'>\n  <div class=\'fr_full lap_fr_half\'>\n    <label for=\''));

      _print(this.getDomId());

      _print(_safe('-name\'>Name <abbr class=\'fr_required\' title=\'required\'>*</abbr></label>\n    <input type=\'text\'\n           id=\''));

      _print(this.getDomId());

      _print(_safe('-name\'\n           data-rv-input=\'model.value.name\' />\n  </div>\n\n  <div class=\'fr_full lap_fr_half\'>\n    <label for=\''));

      _print(this.getDomId());

      _print(_safe('-email\'>Email <abbr class=\'fr_required\' title=\'required\'>*</abbr></label>\n    <input type="text"\n           id=\''));

      _print(this.getDomId());

      _print(_safe('-email\'\n           data-rv-input=\'model.value.email\' />\n  </div>\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/map_marker"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_map_wrapper\'>\n  <div class=\'fr_map_map\' />\n\n  <div class=\'fr_map_cover\'>\n    Click to set location\n  </div>\n\n  <div class=\'fr_map_toolbar fr_cf\'>\n    <div class=\'fr_map_coord\'>\n      <strong>Coordinates:</strong>\n      <span data-rv-show=\'model.value.lat\'>\n        <span data-rv-text=\'model.value.lat\' />,\n        <span data-rv-text=\'model.value.lng\' />\n      </span>\n      <span data-rv-hide=\'model.value.lat\' class=\'fr_map_no_location\'>N/A</span>\n    </div>\n    <a class=\'fr_map_clear\' data-fr-clear-map data-rv-show=\'model.value.lat\' href=\'javascript:void(0);\'>Clear</a>\n  </div>\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/number"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
        console.log('PROCESS NUMBER')
      _print(_safe('<input type="text"\n       id="'));

      _print(this.getDomId());

      _print(_safe('"\n       data-rv-input=\'model.value\' />\n\n'));

      if (this.model.get('field_options.units')) {
        _print(_safe('\n  <span class=\'fr_units\'>\n    '));
        _print(this.model.get('field_options.units'));
        _print(_safe('\n  </span>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/page_break"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_page_break_inner\'>\n  Page break\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/paragraph"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<textarea\n   id="'));

      _print(this.getDomId());

      _print(_safe('"\n   class="size_'));

      _print(this.model.getSize());

      _print(_safe('"\n   data-rv-input=\'model.value\' />\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/price"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_input_grid\'>\n  <div class=\'fr_spacer\'>$</div>\n\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">Dollars</label>\n    <input type="text"\n           id="'));

      _print(this.getDomId());

      _print(_safe('"\n           data-rv-input=\'model.value.dollars\'\n           size=\'6\' />\n  </div>\n\n  '));

      if (!this.model.get('field_options.disable_cents')) {
        _print(_safe('\n    <div class=\'fr_spacer\'>.</div>\n    <div class=\'has_sub_label\'>\n      <label class="fr_sub_label">Cents</label>\n      <input type="text"\n             data-rv-input=\'model.value.cents\'\n             maxlength=\'2\'\n             size=\'2\' />\n    </div>\n  '));
      }

      _print(_safe('\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/radio"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var i, option, _i, _len, _ref;

      _ref = this.model.getOptions();

      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        option = _ref[i];
        _print(_safe('\n  <label class=\'fr_option control\'>\n    <input type=\'radio\'\n           data-rv-checked=\'model.value.selected\'\n           id="'));
        _print(this.getDomId());
        _print(_safe('"\n           name="'));
        _print(this.getDomId());
        _print(_safe('"\n           value="'));
        _print(option.label);
        _print(_safe('" />\n    '));
        _print(option.label);
        _print(_safe('\n  </label>\n'));
      }

      _print(_safe('\n\n'));

      if (this.model.get('field_options.include_other_option')) {
        _print(_safe('\n  <div class=\'fr_option fr_other_option\'>\n    <label class=\'control\'>\n      <input type=\'radio\'\n             data-rv-checked=\'model.value.selected\'\n             id="'));
        _print(this.getDomId());
        _print(_safe('"\n             name="'));
        _print(this.getDomId());
        _print(_safe('"\n             value="Other" />\n      Other\n    </label>\n\n    <input type=\'text\' data-rv-input=\'model.value.other\' placeholder=\'Write your answer here\' />\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/section_break"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var formattedDescription;

      formattedDescription = FormRenderer.formatHTML(this.model.get('field_options.description'));

      _print(_safe('\n<'));

      _print(this.model.sizeToHeaderTag());

      _print(_safe('>'));

      _print(this.model.get('label'));

      _print(_safe('</'));

      _print(this.model.sizeToHeaderTag());

      _print(_safe('>\n'));

      if (formattedDescription) {
        _print(_safe('\n  <div class=\'fr_text size_'));
        _print(this.model.getSize());
        _print(_safe('\'>\n    '));
        _print(_safe(formattedDescription));
        _print(_safe('\n  </div>\n'));
      }

      _print(_safe('\n\n<hr />\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/table"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var column, i, j, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;

      _print(_safe('<table class=\'fr_table\'>\n  <thead>\n    <tr>\n      '));

      _ref = this.model.getColumns();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        column = _ref[_i];
        _print(_safe('\n        <th>'));
        _print(column.label);
        _print(_safe('</th>\n      '));
      }

      _print(_safe('\n\n      <th class=\'fr_table_col_remove\'></th>\n    </tr>\n  </thead>\n\n  <tbody>\n    '));

      for (i = _j = 0, _ref1 = this.model.numRows - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        _print(_safe('\n      <tr data-row-index="'));
        _print(i);
        _print(_safe('">\n        '));
        _ref2 = this.model.getColumns();
        for (j = _k = 0, _len1 = _ref2.length; _k < _len1; j = ++_k) {
          column = _ref2[j];
          _print(_safe('\n          <td>\n            <textarea '));
          if (this.model.getPresetValue(column.label, i)) {
            _print(_safe('disabled'));
          }
          _print(_safe('\n                      data-col=\''));
          _print(j);
          _print(_safe('\'\n                      data-row=\''));
          _print(i);
          _print(_safe('\'\n                      data-rv-input=\'model.value.'));
          _print(j);
          _print(_safe('.'));
          _print(i);
          _print(_safe('\'\n                      rows=\'1\' />\n          </td>\n        '));
        }
        _print(_safe('\n\n        <td class=\'fr_table_col_remove\'>\n          '));
        if (this.canRemoveRow(i)) {
          _print(_safe('\n            <a class=\'js-remove-row\' href=\'javascript:void(0)\'>\n              '));
          _print(_safe(FormRenderer.REMOVE_ROW_LINK));
          _print(_safe('\n            </a>\n          '));
        }
        _print(_safe('\n        </td>\n      </tr>\n    '));
      }

      _print(_safe('\n  </tbody>\n\n  '));

      if (this.model.get('field_options.column_totals')) {
        _print(_safe('\n    <tfoot>\n      <tr>\n        '));
        _ref3 = this.model.getColumns();
        for (j = _l = 0, _len2 = _ref3.length; _l < _len2; j = ++_l) {
          column = _ref3[j];
          _print(_safe('\n          <td data-rv-text=\'model.columnTotals.'));
          _print(j);
          _print(_safe('\'></td>\n        '));
        }
        _print(_safe('\n        <td class="fr_table_col_remove"></td>\n      </tr>\n    </tfoot>\n  '));
      }

      _print(_safe('\n</table>\n\n<div class=\'fr_table_add_row_wrapper\'>\n  '));

      if (this.model.canAddRows()) {
        _print(_safe('\n    <a class=\'js-add-row\' href=\'javascript:void(0)\'>\n      '));
        _print(_safe(FormRenderer.ADD_ROW_LINK));
        _print(_safe('\n    </a>\n  '));
      }

      _print(_safe('\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/text"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<input type="text"\n       id="'));

      _print(this.getDomId());

      _print(_safe('"\n       class="size_'));

      _print(this.model.getSize());

      _print(_safe('"\n       data-rv-input=\'model.value\' />\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/time"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_input_grid\'>\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">HH</label>\n    <input type="text"\n           id="'));

      _print(this.getDomId());

      _print(_safe('"\n           data-rv-input=\'model.value.hours\'\n           maxlength=\'2\'\n           size=\'2\' />\n  </div>\n\n  <div class=\'fr_spacer\'>:</div>\n\n  <div class=\'has_sub_label\'>\n    <label class="fr_sub_label">MM</label>\n    <input type="text"\n           data-rv-input=\'model.value.minutes\'\n           maxlength=\'2\'\n           size=\'2\' />\n  </div>\n\n  '));

      if (!this.model.get('field_options.disable_seconds')) {
        _print(_safe('\n    <div class=\'fr_spacer\'>:</div>\n\n    <div class=\'has_sub_label\'>\n      <label class="fr_sub_label">SS</label>\n      <input type="text"\n             data-rv-input=\'model.value.seconds\'\n             maxlength=\'2\'\n             size=\'2\' />\n    </div>\n  '));
      }

      _print(_safe('\n\n  <div class=\'has_sub_label\'>\n    <select data-rv-value=\'model.value.am_pm\' data-width=\'auto\'>\n      <option value=\'AM\'>AM</option>\n      <option value=\'PM\'>PM</option>\n    </select>\n  </div>\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["fields/website"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<input type="text" inputmode="url"\n       id="'));

      _print(this.getDomId());

      _print(_safe('"\n       class="size_'));

      _print(this.model.getSize());

      _print(_safe('"\n       data-rv-input=\'model.value\'\n       placeholder=\'http://\' />\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["main"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_loading\'>\n  Loading form...\n</div>'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/description"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      if (this.model.get('field_options.description')) {
        _print(_safe('\n  <div class=\'fr_description\'>\n    '));
        _print(_safe(FormRenderer.formatHTML(this.model.get('field_options.description'))));
        _print(_safe('\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/error"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<div class=\'fr_error\' data-rv-show=\'model.error\' data-rv-text=\'model.error\'></div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/label"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe('<label for="'));

      _print(this.getDomId());

      _print(_safe('">\n  '));

      _print(this.model.get('label'));

      _print(_safe('\n  '));

      if (this.model.get('required')) {
        _print(_safe('<abbr class=\'fr_required\' title=\'required\'>*</abbr>'));
      }

      _print(_safe('\n\n  '));

      if (this.showLabels) {
        _print(_safe('\n    '));
        if (this.model.get('blind')) {
          _print(_safe('\n      <span class=\'label\'>Blind</span>\n    '));
        }
        _print(_safe('\n    '));
        if (this.model.get('admin_only')) {
          _print(_safe('\n      <span class=\'label\'>Hidden</span>\n    '));
        }
        _print(_safe('\n    '));
        if (this.model.isConditional()) {
          _print(_safe('\n      <span class=\'label\'>Hidden until rules are met</span>\n    '));
        }
        _print(_safe('\n  '));
      }

      _print(_safe('\n</label>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/length_validations"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      if (this.model.hasLengthValidations()) {
        _print(_safe('\n  <div class=\'fr_min_max\'>\n    '));
        if (this.model.get('field_options.minlength') && this.model.get('field_options.maxlength')) {
          _print(_safe('\n      Enter between '));
          _print(this.model.get('field_options.minlength'));
          _print(_safe(' and '));
          _print(this.model.get('field_options.maxlength'));
          _print(_safe(' '));
          _print(this.model.getLengthValidationUnits());
          _print(_safe('.\n    '));
        } else if (this.model.get('field_options.minlength')) {
          _print(_safe('\n      Enter more than '));
          _print(this.model.get('field_options.minlength'));
          _print(_safe(' '));
          _print(this.model.getLengthValidationUnits());
          _print(_safe('.\n    '));
        } else if (this.model.get('field_options.maxlength')) {
          _print(_safe('\n      Enter less than '));
          _print(this.model.get('field_options.maxlength'));
          _print(_safe(' '));
          _print(this.model.getLengthValidationUnits());
          _print(_safe('.\n    '));
        }
        _print(_safe('\n\n    <span class=\'fr_min_max_counter\'> <b data-rv-text=\'model.currentLength\'></b> '));
        _print(this.model.getLengthValidationUnits());
        _print(_safe('</span>\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/min_max_validations"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      if (this.model.hasMinMaxValidations()) {
        _print(_safe('\n  <div class=\'fr_min_max\'>\n    '));
        if (this.model.get('field_options.min') && this.model.get('field_options.max')) {
          _print(_safe('\n      Between '));
          _print(this.model.get('field_options.min'));
          _print(_safe(' and '));
          _print(this.model.get('field_options.max'));
          _print(_safe('.\n    '));
        } else if (this.model.get('field_options.min')) {
          _print(_safe('\n      More than '));
          _print(this.model.get('field_options.min'));
          _print(_safe('.\n    '));
        } else if (this.model.get('field_options.max')) {
          _print(_safe('\n      Less than '));
          _print(this.model.get('field_options.max'));
          _print(_safe('.\n    '));
        }
        _print(_safe('\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/non_input_response_field"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe(JST["fields/" + this.field_type](this)));

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/pagination"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var i, idx, _i, _len, _ref;

      if (this.form_renderer.visiblePages().length > 1) {
        _print(_safe('\n  <ul class=\'fr_pagination\'>\n    '));
        _ref = this.form_renderer.visiblePages();
        for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
          i = _ref[idx];
          _print(_safe('\n      <li class=\''));
          if (!this.form_renderer.isPageValid(i)) {
            _print(_safe('has_errors'));
          }
          _print(_safe('\'>\n        '));
          if (i === this.form_renderer.state.get('activePage')) {
            _print(_safe('\n          <span>'));
            _print(idx + 1);
            _print(_safe('</span>\n        </li>\n        '));
          } else {
            _print(_safe('\n          <a data-activate-page="'));
            _print(i);
            _print(_safe('" href=\'javascript:void(0)\'>\n            '));
            _print(idx + 1);
            _print(_safe('\n          </a>\n        '));
          }
          _print(_safe('\n      </li>\n    '));
        }
        _print(_safe('\n  </ul>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["partials/response_field"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      _print(_safe(JST["partials/label"](this)));

      _print(_safe('\n'));

      _print(_safe(JST["partials/description"](this)));

      _print(_safe('\n'));

      _print(_safe(JST["fields/" + this.field_type](this)));

      _print(_safe('\n\n<div class=\'fr_clear\' />\n\n'));

      _print(_safe(JST["partials/length_validations"](this)));

      _print(_safe('\n'));

      _print(_safe(JST["partials/min_max_validations"](this)));

      _print(_safe('\n'));

      _print(_safe(JST["partials/error"](this)));

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["plugins/bottom_bar"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      _print(_safe('<div class=\'fr_bottom fr_cf\'>\n  '));

      if (__indexOf.call(this.form_renderer.options.plugins, 'Autosave') >= 0) {
        _print(_safe('\n    <div class=\'fr_bottom_l\'>\n      '));
        if (this.form_renderer.state.get('hasServerErrors')) {
          _print(_safe('\n        Error saving\n      '));
        } else if (this.form_renderer.state.get('hasChanges')) {
          _print(_safe('\n        Saving...\n      '));
        } else {
          _print(_safe('\n        Saved\n      '));
        }
        _print(_safe('\n    </div>\n  '));
      }

      _print(_safe('\n\n  <div class=\'fr_bottom_r\'>\n    '));

      if (!this.form_renderer.isFirstPage()) {
        _print(_safe('\n      <button data-fr-previous-page class=\''));
        _print(FormRenderer.BUTTON_CLASS);
        _print(_safe('\'>\n        Back to page '));
        _print(this.form_renderer.previousPage());
        _print(_safe('\n      </button>\n    '));
      }

      _print(_safe('\n\n    '));

      if (this.form_renderer.state.get('submitting')) {
        _print(_safe('\n      <button disabled class=\''));
        _print(FormRenderer.BUTTON_CLASS);
        _print(_safe('\'>\n        Submitting...\n      </button>\n    '));
      } else {
        _print(_safe('\n      <button data-fr-next-page class=\''));
        _print(FormRenderer.BUTTON_CLASS);
        _print(_safe('\'>\n        '));
        if (this.form_renderer.isLastPage() || !this.form_renderer.options.enablePages) {
          _print(_safe('Submit'));
        } else {
          _print(_safe('Next page'));
        }
        _print(_safe('\n      </button>\n    '));
      }

      _print(_safe('\n  </div>\n</div>\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

if (!window.JST) {
  window.JST = {};
}
window.JST["plugins/error_bar"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      if (!this.form_renderer.areAllPagesValid()) {
        _print(_safe('\n  <div class=\'fr_error_alert_bar\'>\n    Your response has validation errors.\n    <a href=\'javascript:void(0)\'>Fix errors</a>\n  </div>\n'));
      }

      _print(_safe('\n'));

    }).call(this);

    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};
})(window);
