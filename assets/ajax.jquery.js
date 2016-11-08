(function($) {
  if ($("#filter-sidebar")) {
    History.Adapter.bind(window, "statechange", function() {
      var e = History.getState();
      if (!typo.isSidebarAjaxClick) {
        typo.sidebarParams();
        var n = typo.sidebarCreateUrl();
        typo.sidebarGetContent(n);

      }
      typo.isSidebarAjaxClick = false
    })
  }

  if (window.use_color_swatch) {
    $(".swatch :radio").change(function() {
      var t = $(this).closest(".swatch").attr("data-option-index");
      var n = $(this).val();
      $(this).closest("form").find(".single-option-selector").eq(t).val(n).trigger("change")
    });

    Shopify.optionsMap = {};
    Shopify.updateOptionsInSelector = function(t) {
      switch (t)  {
        default: 
          var n = $(".single-option-selector:eq(0)").val();
          var r = $(".single-option-selector:eq(1)");
          break;
        case 0:
          var n = "root";
          var r = $(".single-option-selector:eq(0)");
          break;
        case 1:
          var n = $(".single-option-selector:eq(0)").val();
          var r = $(".single-option-selector:eq(1)");
          break;
        case 2:
          var n = $(".single-option-selector:eq(0)").val();
          n += " / " + e(".single-option-selector:eq(1)").val();
          var r = $(".single-option-selector:eq(2)")
          }
      var i = r.val();
      r.empty();
      var s = Shopify.optionsMap[n];
      for (var o = 0; o < s.length; o++) {
        var u = s[o];
        var a = $("<option></option>").val(u).html(u);
        r.append(a)
      }
      $('.swatch[data-option-index="' + t + '"] .swatch-element').each(function() {
        if ($.inArray($(this).attr("data-value"), s) !== -1) {
          $(this).removeClass("soldout").show().find(":radio").removeAttr("disabled", "disabled").removeAttr("checked")
        } else {
          $(this).addClass("soldout").hide().find(":radio").removeAttr("checked").attr("disabled", "disabled")
        }
      });
      if ($.inArray(i, s) !== -1) {
        r.val(i)
      }
      r.trigger("change")
    };
    Shopify.linkOptionSelectors = function(typo) {
      for (var n = 0; n < typo.variants.length; n++) {
        var r = typo.variants[n];
        if (r.available) {
          Shopify.optionsMap["root"] = Shopify.optionsMap["root"] || [];
          Shopify.optionsMap["root"].push(r.option1);
          Shopify.optionsMap["root"] = Shopify.uniq(Shopify.optionsMap["root"]);
          if (typo.options.length > 1) {
            var i = r.option1;
            Shopify.optionsMap[i] = Shopify.optionsMap[i] || [];
            Shopify.optionsMap[i].push(r.option2);
            Shopify.optionsMap[i] = Shopify.uniq(Shopify.optionsMap[i])
          }
          if (typo.options.length === 3) {
            var i = r.option1 + " / " + r.option2;
            Shopify.optionsMap[i] = Shopify.optionsMap[i] || [];
            Shopify.optionsMap[i].push(r.option3);
            Shopify.optionsMap[i] = Shopify.uniq(Shopify.optionsMap[i])
          }
        }
      }
      Shopify.updateOptionsInSelector(0);
      if (typo.options.length > 1) Shopify.updateOptionsInSelector(1);
      if (typo.options.length === 3) Shopify.updateOptionsInSelector(2);
      $(".single-option-selector:eq(0)").change(function() {
        Shopify.updateOptionsInSelector(1);
        if (typo.options.length === 3) Shopify.updateOptionsInSelector(2);
        return true
      });
      $(".single-option-selector:eq(1)").change(function() {
        if (typo.options.length === 3) Shopify.updateOptionsInSelector(2);
        return true
      })
    }
  }

  $(document).ready(function() {
    typo.go()
  });
  $(window).resize(function() {


    typo.goResizeImage()
  });



  var typo = {
    atTimeout: null,
    isSidebarAjaxClick: false,
    go: function() {
      this.goResizeImage();
      this.goCloudzoom();
      this.goSidebar();
      this.goQuickView();
      this.goScrollTop();
      this.goDropDownCart();//add cart
      this.goAddToCart();
      this.goBox();
      this.goProductAddToCart();
      this.goWishlist();
      this.goProductWishlist();
      this.goRemoveWishlist();
      this.goColorSwatchGridInit();

    },
    sidebarTag: function() {
      $(".sidebar-tag a, .sidebar-tag label").click(function(n) {
        var bar = [];
        if (Shopify.queryParams.constraint) {
          bar = Shopify.queryParams.constraint.split("+")
        }
        if (!window.enable_sidebar_multiple_choice && !$(this).prev().is(":checked")) {
          var i = $(this).parents(".sidebar-tag").find("input:checked");
          if (i.length > 0) {
            var s = i.val();
            if (s) {
              var o = bar.indexOf(s);
              if (o >= 0) {
                bar.splice(o, 1)
              }
            }
          }
        }
        var s = $(this).prev().val();
        if (s) {
          var o = bar.indexOf(s);
          if (o >= 0) {
            bar.splice(o, 1)
          } else {
            bar.push(s)
          }
        }
        if (bar.length) {
          Shopify.queryParams.constraint = bar.join("+")
        } else {
          delete Shopify.queryParams.constraint
        }
        typo.sidebarAjaxClick();
        n.preventDefault()
      })
    },


    sidebarMapEvents: function() {
      typo.sidebarTag();

    },

    //cart top

    checkItemsInDropdownCart: function() {
      if ($("#dropdown-cart .cart-list").children().length > 0) {
        $("#dropdown-cart .cart-empty").hide();
        $("#dropdown-cart .mini_cart_header").show()
      } else {
        $("#dropdown-cart .mini_cart_header").hide();
        $("#dropdown-cart .cart-empty").show()
      }
    },

    goDropDownCart: function() {

      typo.checkItemsInDropdownCart();
      $("#dropdown-cart .cart-empty a").click(function() {
        $("#dropdown-cart").slideUp("fast")
      });
      $("#dropdown-cart .btn-remove").click(function(n) {
        n.preventDefault();
        var cart = $(this).parents(".item").attr("id");
        cart = cart.match(/\d+/g);
        Shopify.removeItem(cart, function(e) {
          typo.doUpdateDropdownCart(e)
        })
      })
    },
    closeDropdownCart: function() {
      if ($("#dropdown-cart").is(":visible")) {
        $("#dropdown-cart").slideUp("fast")
      }
    },

    //end cart  



    goColorSwatchGridInit: function(){
      $('#color-swatch-item li a').on('click', function(e){
        e.preventDefault();  
        var productImage = $(this).parents('.product-image').find('.grid-image'); 
        productImage.find('img.feature-images').attr('src', $(this).data('image'));  
      });
    },

    sidebarMapData: function(n) {
      var bar = $(".col-main .products-grid");
      if (bar.length == 0) {
        bar = $(".col-main .product-list")
      }
      var i = $(n).find(".col-main .products-grid");
      if (i.length == 0) {
        i = $(n).find(".col-main .product-list")
      }
      if (i.length > 0 && i.hasClass("products-grid")) {
        if (window.product_image_resize) {
          i.find("img").fakecrop({
            fill: window.images_size.is_crop,
            widthSelector: ".grid-item .product-image",
            ratioWrapper: window.images_size
          })
        }
      }
      bar.replaceWith(i);

      var s = $(".page-header");
      var o = $(n).find(".page-header");
      if (s.find("h2").text() != o.find("h2").text()) {
        s.find("h2").replaceWith(o.find("h2"));
        if (s.find(".rte").length) {
          if (o.find(".rte").length) {
            s.find(".rte").replaceWith(o.find(".rte"))
          } else {
            s.find(".rte").hide()
          }
        } else {
          if (o.find(".rte").length) {
            s.find("h2").after(o.find(".rte"))
          }
        }
      }
      $(".refined-widgets").replaceWith($(n).find(".refined-widgets"));
      $(".sidebar-block").replaceWith($(n).find(".sidebar-block"))
    },
    goResizeImage: function() {
      if (window.product_image_resize) {
        $(".products-grid .product-image img").fakecrop({
          fill: window.images_size.is_crop,
          widthSelector: ".products-grid .grid-item .product-image",
          ratioWrapper: window.images_size
        })
      }
    },

    sidebarCreateUrl: function(t) {
      var n = $.param(Shopify.queryParams).replace(/%2B/g, "+");
      if (t) {
        if (n != "") return t + "?" + n;
        else return t
          }
      return location.pathname + "?" + n
    },
    sidebarAjaxClick: function(e) {
      delete Shopify.queryParams.page;
      var n = typo.sidebarCreateUrl(e);
      typo.isSidebarAjaxClick = true;
      History.pushState({
        param: Shopify.queryParams
      }, n, n);
      typo.sidebarGetContent(n)
    },
    sidebarGetContent: function(n) {
      $.ajax({
        type: "get",
        url: n,
        beforeSend: function() {
          typo.showLoading()
        },
        success: function(e) {
          typo.sidebarMapData(e);
          typo.goQuickView();
          typo.sidebarTag();
          typo.hideLoading();

          typo.goAddToCart();
          typo.goWishlist()
        },
        error: function(n, bar) {
          typo.hideLoading();
          $(".loading").hide();
          $(".ajax-error-message").text($.parseJSON(n.responseText).description);
          typo.showBox(".ajax-error-cbox")
        }
      })
    },
    sidebarParams: function() {
      Shopify.queryParams = {};
      if (location.search.length) {
        for (var e, t = 0, n = location.search.substr(1).split("&"); t < n.length; t++) {
          e = n[t].split("=");
          if ($.length > 1) {
            Shopify.queryParams[decodeURIComponent(e[0])] = decodeURIComponent(e[1])
          }
        }
      }
    },

    goSidebar: function() {
      if ($("#filter-sidebar").length > 0) {
        typo.sidebarParams();
        typo.sidebarMapEvents()
      }
    },

    goWishlist: function() {
      $(".grid-item button.wishlist").click(function(n) {
        n.preventDefault();
        var r = $(this).parent();
        var i = r.parents(".grid-item");
        $.ajax({
          type: "POST",
          url: "/contact",
          data: r.serialize(),
          beforeSend: function() {
            typo.showLoading()
          },
          success: function(n) {
            typo.hideLoading();
            r.html('<a class="wishlist" href="/pages/wish-list" title="Go to wishlist"><span class="icon"></span><span>Go to wishlist</span></a>');
            $(".ajax-success-cbox").find(".show-wishlist").show();
            $(".ajax-success-cbox").find(".show-cart").hide();
            typo.showBox(".ajax-success-cbox")
          },
          error: function(n, r) {
            typo.hideLoading();
            $(".loading").hide();
            $(".ajax-error-message").text($.parseJSON(n.responseText).description);
            typo.showBox(".ajax-error-cbox")
          }
        })
      })
    },
    goProductWishlist: function() {
      $(".product button.wishlist").click(function(n) {
        n.preventDefault();
        var r = $(this).parent();
        var i = r.parents(".grid-item");
        $.ajax({
          type: "POST",
          url: "/contact",
          data: r.serialize(),
          beforeSend: function() {
            typo.showLoading()
          },
          success: function(n) {
            typo.hideLoading();
            r.html('<a class="wishlist" href="/pages/wish-list" title="Go to wishlist"><span class="icon"></span><span>Go to wishlist</span></a>');
            $(".ajax-success-cbox").find(".show-wishlist").show();
            $(".ajax-success-cbox").find(".show-cart").hide();
            typo.showBox(".ajax-success-cbox")
          },
          error: function(n, r) {
            typo.hideLoading();
            $(".loading").hide();
            $(".ajax-error-message").text($.parseJSON(n.responseText).description);
            typo.showBox(".ajax-error-cbox")
          }
        })
      })
    },
    goRemoveWishlist: function() {
      $(".btn-remove-wishlist").click(function(n) {
        var r = $(this).parents("tr");
        var i = r.find(".tag-id").val();
        var s = jQuery("#remove-wishlist-form");
        s.find("input[name='contact[tags]']").val("x" + i);
        $.ajax({
          type: "POST",
          url: "/contact",
          data: s.serialize(),
          beforeSend: function() {
            typo.showLoading()
          },
          success: function(e) {
            typo.hideLoading();
            r.fadeOut(1e3)
          },
          error: function(n, r) {
            typo.hideLoading();
            $(".loading-modal").hide();
            $(".ajax-error-message").text($.parseJSON(n.responseText).description);
            typo.showModal(".ajax-error-cbox")
          }
        })
      })
    },



    showBox: function(n) {
      $(n).fadeIn(500);
      typo.atTimeout = setTimeout(function() {
        $(n).fadeOut(500)
      }, 5e3)
    },


    goBox: function() {
      $(".continue-shopping").click(function() {
        clearTimeout(typo.atTimeout);
        $(".ajax-success-cbox").fadeOut(500)
      });
      $(".close-cbox").click(function() {
        clearTimeout(typo.atTimeout);
        $(".ajax-success-cbox").fadeOut(500)
      })
    },



    goCloudzoom: function() {
      if ($("#product-featured-image").length > 0) {

        $("#product-featured-image").elevateZoom({
          gallery: "zt_list_product",
          cursor: "pointer",
          zoomType	: "inner",
          scrollZoom: true,
          onImageSwapComplete: function() {
            $(".gallery-images div").hide()
          },
          loadingIcon: window.loading_url
        });
        $("#product-featured-image").bind("click", function(typo) {
          var n = $("#product-featured-image").data("elevateZoom");
          $.fancybox(n.getGalleryList());
          return false
        })

      }
    },

    goScrollTop: function() {
      $("#back-top").click(function() {
        $("body,html").animate({
          scrollTop: 0
        }, 400);
        return false
      })
    },
    goProductAddToCart: function() {
      if ($("#product-add-to-cart").length > 0) {
        $("#product-add-to-cart").click(function(n) {
          n.preventDefault();
          if ($(this).attr("disabled") != "disabled") {
            if (!window.ajax_cart) {
              $(this).closest("form").submit()
            } else {
              var cart = $("#add-to-cart-form select[name=id]").val();
              if (!cart) {
                cart = $("#add-to-cart-form input[name=id]").val()
              }
              var i = $("#add-to-cart-form input[name=quantity]").val();
              if (!i) {
                i = 1
              }
              var s = $(".product-title h2").text();
              typo.doAjaxAddToCart(cart, i, s)
            }
          }
          return false
        })
      }
    },
    goAddToCart: function() {
      if ($(".add-to-cart-btn").length > 0) {
        $(".add-to-cart-btn").click(function(n) {
          n.preventDefault();
          if ($(this).attr("disabled") != "disabled") {
            var cart = $(this).parents(".product-item");
            var i = $(cart).attr("id");
            i = i.match(/\d+/g);
            if (!window.ajax_cart) {
              $("#product-actions-" + i).submit()
            } else {
              var s = $("#product-actions-" + i + " select[name=id]").val();
              if (!s) {
                s = $("#product-actions-" + i + " input[name=id]").val()
              }
              var o = $("#product-actions-" + i + " input[name=quantity]").val();
              if (!o) {
                o = 1
              }
              var u = $(cart).find(".product-title").text();
              typo.doAjaxAddToCart(s, o, u)
            }

          }
          return false
        })
      }
    },
    showLoading: function() {
      $(".loading").show()
    },
    hideLoading: function() {
      $(".loading").hide()
    },
    doAjaxAddToCart: function(n, r, i, s) {
      $.ajax({
        type: "post",
        url: "/cart/add.js",
        data: "quantity=" + r + "&id=" + n,
        dataType: "json",
        beforeSend: function() {
          typo.showLoading()
        },
        success: function(n) {
          typo.hideLoading();
          $(".ajax-success-cbox").find(".ajax-product-title").text(i);
          $(".ajax-success-cbox").find(".show-wishlist").hide();
          $(".ajax-success-cbox").find(".show-cart").show();
          typo.showBox(".ajax-success-cbox");
          typo.updateDropdownCart()
        },
        error: function(n, r) {
          typo.hideLoading();
          $(".ajax-error-message").text($.parseJSON(n.responseText).description);
          typo.showBox(".ajax-error-cbox")
        }
      })
    },
    goQuickView: function() {
      jQuery(".quickview-button a").click(function() {
        var n = jQuery(this).attr("id");
        Shopify.getProduct(n, function(n) {
          var cart = jQuery("#quickview-popup").html();
          jQuery(".product-quickview").html(cart);
          var i = jQuery(".product-quickview");
          var s = n.description.replace(/(<([^>]+)>)/ig, "");
          s = s.split(" ").splice(0, 20).join(" ") + "...";
          i.find(".product-title a").text(n.title);
          i.find(".product-title a").attr("href", n.url);
          if (i.find(".product-vendor span").length > 0) {
            i.find(".product-vendor span").text(n.vendor)
          }
          if (i.find(".product-type span").length > 0) {
            i.find(".product-type span").text(n.type)
          }
          if (i.find(".product-inventory span").length > 0) {
            var o = n.variants[0].inventory_quantity;
            if (o > 0) {
              if (n.variants[0].inventory_management != null) {
                i.find(".product-inventory span").text(o + " in stock")
              } else {
                i.find(".product-inventory span").text("Many in stock")
              }
            } else {
              i.find(".product-inventory span").text("Out of stock")
            }
          }
          i.find(".product-description").text(s);
          i.find(".price").html(Shopify.formatMoney(n.price, window.money_format));
          i.find(".product-item").attr("id", "product-" + n.id);
          i.find(".variants").attr("id", "product-actions-" + n.id);
          i.find(".variants select").attr("id", "product-select-" + n.id);
          if (n.compare_at_price > n.price) {
            i.find(".compare-price").html(Shopify.formatMoney(n.compare_at_price_max, window.money_format)).show();
            i.find(".price").addClass("on-sale")
          } else {
            i.find(".compare-price").html("");
            i.find(".price").removeClass("on-sale")
          }
          if (!n.available) {
            i.find("select, input, .total-price, .dec, .inc, .variants label").remove();
            i.find(".add-to-cart-btn").text("Unavailable").addClass("disabled").attr("disabled", "disabled");
          } else {
            i.find(".total-price span").html(Shopify.formatMoney(n.price, window.money_format));
            if (window.use_color_swatch) {
              typo.createQuickViewVariantsSwatch(n, i)
            } else {
              typo.createQuickViewVariants(n, i)
            }
          }
          i.find(".button").on("click", function() {
            var n = i.find(".quantity").val(),
                cart = 1;
            if (jQuery(this).text() == "+") {
              r = parseInt(n) + 1
            } else if (n > 1) {
              r = parseInt(n) - 1
            }
            i.find(".quantity").val(r);
            if (i.find(".total-price").length > 0) {
              typo.updatePricingQuickview()
            }
          });
          if (window.show_multiple_currencies) {
            Currency.convertAll(window.shop_currency, jQuery('#currencies .currency.active').data('currency'), 'span.money', 'money_format')
          }
          typo.loadQuickViewSlider(n, i);
          typo.goQuickviewAddToCart();
          jQuery(".product-quickview").fadeIn(500);
          if (jQuery(".product-quickview .total-price").length > 0) {
            jQuery(".product-quickview input[name=quantity]").on("change", typo.updatePricingQuickview)
          }
        });
        return false
      });
      jQuery(".product-quickview .overlay, .close-popup").live("click", function() {
        typo.closeQuickViewPopup();
        return false
      })
    },
    updatePricingQuickview: function() {
      var typo = /([0-9]+[.|,][0-9]+[.|,][0-9]+)/g;
      var n = jQuery(".product-quickview .price").text().match(typo);
      if (!n) {
        typo = /([0-9]+[.|,][0-9]+)/g;
        n = jQuery(".product-quickview .price").text().match(typo)
      }
      if (n) {
        var cart = n[0];
        var i = cart.replace(/[.|,]/g, "");
        var s = parseInt(jQuery(".product-quickview input[name=quantity]").val());
        var o = i * s;
        var u = Shopify.formatMoney(o, window.money_format);
        u = u.match(typo)[0];
        var a = new RegExp(r, "g");
        var f = jQuery(".product-quickview .price").html().replace(a, u);
        jQuery(".product-quickview .total-price span").html(f)
      }
    },
    goQuickviewAddToCart: function() {
      if (jQuery(".product-quickview .add-to-cart-btn").length > 0) {
        jQuery(".product-quickview .add-to-cart-btn").click(function() {
          var n = jQuery(".product-quickview select[name=id]").val();
          if (!n) {
            n = jQuery(".product-quickview input[name=id]").val()
          }
          var cart = jQuery(".product-quickview input[name=quantity]").val();
          if (!cart) {
            cart = 1
          }
          var i = jQuery(".product-quickview .product-title a").text();
          var s = jQuery(".product-quickview .quickview-featured-image img").attr("src");
          typo.doAjaxAddToCart(n, cart, i, s);
          typo.closeQuickViewPopup()
        })
      }
    },
    updateDropdownCart: function() {
      Shopify.getCart(function(e) {
        typo.doUpdateDropdownCart(e)
      })
    },
    doUpdateDropdownCart: function(n) {
      $("#cart-count").text(n.item_count);
    },


    convertToSlug: function(e) {
      return $.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    },



    //cart function



    updateDropdownCart: function() {
      Shopify.getCart(function(e) {
        typo.doUpdateDropdownCart(e)
      })
    },
    doUpdateDropdownCart: function(n) {
      var cart = '<li class="item" id="cart-item-{ID}"><a href="{URL}" title="{TITLE}" class="product-image"><img src="{IMAGE}" alt="{TITLE}"></a><div class="product-inner"><a href="javascript:void(0)" title="Remove This Item" class="btn-remove">X</a><p class="product-name"><a href="{URL}">{TITLE}</a></p><div class="cart-collateral">{QUANTITY} x <span class="price">{PRICE}</span></div></div></li>';
      $("#cart-count").text(n.item_count);
      $("#dropdown-cart .summary .price").html(Shopify.formatMoney(n.total_price, window.money_format));
      $(".top-cart .price").html(Shopify.formatMoney(n.total_price, window.money_format));
      $("#dropdown-cart .cart-list").html("");
      if (n.item_count > 0) {
        for (var i = 0; i < n.items.length; i++) {
          var s = cart;
          s = s.replace(/\{ID\}/g, n.items[i].id);
          s = s.replace(/\{URL\}/g, n.items[i].url);
          s = s.replace(/\{TITLE\}/g, n.items[i].title);
          s = s.replace(/\{QUANTITY\}/g, n.items[i].quantity);
          s = s.replace(/\{IMAGE\}/g, Shopify.resizeImage(n.items[i].image, "small"));
          s = s.replace(/\{PRICE\}/g, Shopify.formatMoney(n.items[i].price, window.money_format));
          $("#dropdown-cart .cart-list").append(s)
        }
        $("#dropdown-cart .btn-remove").click(function(n) {
          n.preventDefault();
          var cart = $(this).parents(".item").attr("id");
          cart = cart.match(/\d+/g);
          Shopify.removeItem(cart , function(e) {
            typo.doUpdateDropdownCart(e)
          })
        });
        if (typo.checkNeedToConvertCurrency()) {
          Currency.convertAll(window.shop_currency, jQuery('#currencies .currency.active').data('currency'), "#dropdown-cart span.money", "money_format")
        }
      }
      typo.checkItemsInDropdownCart()
    },
    checkNeedToConvertCurrency: function() {
      return window.show_multiple_currencies && Currency.currentCurrency != shopCurrency
    },

    //endcart

    loadQuickViewSlider: function(n, cart) {
      var s = Shopify.resizeImage(n.featured_image, "grande");
      cart.find(".quickview-featured-image").append('<a href="' + n.url + '"><img src="' + s + '" title="' + n.title + '"/><div style="height: 100%; width: 100%; top:0; left:0 z-index: 2000; position: absolute; display: none; background: url(' + window.loading_url + ') 50% 50% no-repeat;"></div></a>');
      if (n.images.length > 2) {
        var o = cart.find(".more-view ul");
        for (i in n.images) {
          var u = Shopify.resizeImage(n.images[i], "grande");
          var a = Shopify.resizeImage(n.images[i], "compact");
          var f = '<li><a href="javascript:void(0)" data-image="' + u + '"><img src="' + a + '"  /></a></li>';
          o.append(f)
        }
        o.find("a").click(function() {
          var typo = cart.find(".quickview-featured-image img");
          var n = cart.find(".quickview-featured-image div");
          if (typo.attr("src") != jQuery(this).attr("data-image")) {
            typo.attr("src", jQuery(this).attr("data-image"));
            n.show();
            typo.load(function(t) {
              n.hide();
              jQuery(this).unbind("load");
              n.hide()
            })
          }
        });
        if (o.hasClass("quickview-more-views-owlslider")) {
          typo.goQuickViewCarousel(o)
        } else {
          typo.goQuickViewVerticalMoreview(o)
        }
      } else {
        cart.find(".quickview-more-views").remove();
        cart.find(".quickview-more-view-wrapper-jcarousel").remove()
      }
    },
    goQuickViewCarousel: function(e) {
      if (e) {
        e.owlCarousel({
          navigation: true,
          navigationText : ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
          pagination : false,
          items: 3,
          itemsDesktop: [1199, 3],
          itemsDesktopSmall: [979, 3],
          itemsTablet: [768, 3],
          itemsTabletSmall: [540, 3],
          itemsMobile: [360, 3]
        }).css("visibility", "visible")
      }
    },
    goQuickViewVerticalMoreview: function(typo) {
      if (typo) {
        typo.jcarousel({
          vertical: true
        });
        jQuery(".product-img-box").addClass("has-jcarousel");
        jQuery(".more-view-wrapper").css("visibility", "visible")
      }
    },
    convertToSlug: function(e) {
      return e.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    },
    createQuickViewVariantsSwatch: function(typo, n) {
      if (typo.variants.length > 1) {
        for (var cart = 0; cart < typo.variants.length; cart++) {
          var i = typo.variants[cart];
          var s = '<option value="' + i.id + '">' + i.title + "</option>";
          n.find("form.variants > select").append(s)
        }
        new Shopify.OptionSelectors("product-select-" + typo.id, {
          product: typo,
          onVariantSelected: selectCallbackQuickview
        });
        var o = window.file_url.substring(0, window.file_url.lastIndexOf("?"));
        var u = window.asset_url.substring(0, window.asset_url.lastIndexOf("?"));
        var a = "";
        for (var cart = 0; cart < typo.options.length; cart++) {
          a += '<div class="swatch clearfix" data-option-index="' + cart + '">';
          a += '<div class="header">' + typo.options[cart].name + "</div>";
          var f = false;
          if (/Color|Colour/i.test(typo.options[cart].name)) {
            f = true
          }
          var l = new Array;
          for (var c = 0; c < typo.variants.length; c++) {
            var i = typo.variants[c];
            var h = i.options[cart];
            var p = this.convertToSlug(h);
            var d = "swatch-" + cart + "-" + p;
            if (l.indexOf(h) < 0) {
              a += '<div data-value="' + h + '" class="swatch-element ' + (f ? "color" : "") + p + (i.available ? " available " : " soldout ") + '">';

              a += '<input id="' + d + '" type="radio" name="option-' + cart + '" value="' + h + '" ' + (c == 0 ? " checked " : "") + (i.available ? "" : " disabled") + " />";
              if (f) {
                a += '<label for="' + d + '" style="background-color: ' + p + "; background-image: url(" + o + p + '.png)"><img class="crossed-out" src="' + u + 'soldout.png" /></label>'
              } else {
                a += '<label for="' + d + '">' + h + '<img class="crossed-out" src="' + u + 'soldout.png" /></label>'
              }
              a += "</div>";
              if (i.available) {
                jQuery('.product-quickview .swatch[data-option-index="' + cart + '"] .' + p).removeClass("soldout").addClass("available").find(":radio").removeAttr("disabled")
              }
              l.push(h)
            }
          }
          a += "</div>"
        }
        n.find("form.variants > select").after(a);
        n.find(".swatch :radio").change(function() {
          var typo = jQuery(this).closest(".swatch").attr("data-option-index");
          var n = jQuery(this).val();
          jQuery(this).closest("form").find(".single-option-selector").eq(typo).val(n).trigger("change")
        });
        if (typo.available) {
          Shopify.optionsMap = {};
          Shopify.linkOptionSelectors(typo)
        }
      } else {
        n.find("form.variants > select").remove();
        var v = '<input type="hidden" name="id" value="' + typo.variants[0].id + '">';
        n.find("form.variants").append(v)
      }
    },
    createQuickViewVariants: function(typo, n) {
      if (typo.variants.length > 1) {
        for (var cart = 0; cart < typo.variants.length; cart++) {
          var i = typo.variants[r];
          var s = '<option value="' + i.id + '">' + i.title + "</option>";
          n.find("form.variants > select").append(s)
        }
        new Shopify.OptionSelectors("product-select-" + typo.id, {
          product: typo,
          onVariantSelected: selectCallbackQuickview
        });
        jQuery(".product-quickview .single-option-selector").selectize();
        jQuery(".product-quickview .selectize-input input").attr("disabled", "disabled");
        if (typo.options.length == 1) {
          jQuery(".selector-wrapper:eq(0)").prepend("<label>" + typo.options[0].name + "</label>")
        }
        n.find("form.variants .selector-wrapper label").each(function(n, cart) {
          jQuery(this).html(typo.options[n].name)
        })
      } else {
        n.find("form.variants > select").remove();
        var o = '<input type="hidden" name="id" value="' + typo.variants[0].id + '">';
        n.find("form.variants").append(o)
      }
    },
    closeQuickViewPopup: function() {
      jQuery(".product-quickview").fadeOut(500)
    }

  }




  })(jQuery);