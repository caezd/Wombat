var Wombat = (function () {
  "use strict";

  /**
   *
   * @param {string} url
   * @param {string} selector
   * @param {string} errorText - Text used if the console if the selector was not found in the page
   * @returns {Promise} The response is the HTMLObject targeted by the selector
   */
  function load(url, selector, errorText) {
    return fetch(url)
      .then((res) => res.text())
      .then((html) => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var wombatContainer = doc.querySelector(selector);
        console.log(url, selector, doc);

        if (wombatContainer === null) throw new Error(errorText);

        return wombatContainer;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const isVisible = (el) => {
    return el.offsetWidth > 0 && el.offsetHeight > 0;
  };

  function transitionSelect() {
    var el = document.createElement("div");
    if (el.style.WebkitTransition) return "webkitTransitionEnd";
    if (el.style.OTransition) return "oTransitionEnd";
    return "transitionend";
  }

  const DEFAULT_OPT = {
    excludes: [],
    selector: "#wombat",
    displayOnLoad: "",
    overlay: true,
    overlayClass: "wombat-overlay",
    drawerClass: "wombat-aside",
    afterLoad: function () {},
  };

  /**
   * Description
   * @returns {any}
   */
  Wombat.prototype.build = function () {
    var docFrag;

    docFrag = document.createDocumentFragment();

    this.aside = document.createElement("aside");
    this.aside.className = this.options.drawerClass;
    this.aside.appendChild(this.content);
    docFrag.appendChild(this.aside);

    if (this.options.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.className = this.options.overlayClass;
      docFrag.appendChild(this.overlay);
    }

    document.body.appendChild(docFrag);
    if (typeof this.options.afterLoad === "function") {
      this.options.afterLoad(this.aside, this.overlay);
    }

    window.getComputedStyle(this.aside).height;
    this.aside.classList.add("open");
    this.overlay.classList.add("open");
  };

  Wombat.prototype.binds = function () {
    if (this.overlay) {
      this.overlay.addEventListener("click", this.close.bind(this));
    }
  };

  Wombat.prototype.onClick = function () {
    if (this._delegatedClickHandler) return;

    const excludes = Array.isArray(this.options.excludes)
      ? this.options.excludes
      : [];

    const getAnchor = (event) => {
      // Shadow DOM
      if (typeof event.composedPath === "function") {
        for (const n of event.composedPath()) {
          if (n && n.tagName === "A") return n;
        }
      }
      // DOM normal
      return event.target && event.target.closest
        ? event.target.closest("a[href]")
        : null;
    };

    const parseUserId = (url) => {
      // /u123 ou /u/123 ou /u123-quelquechose
      const m = (url.pathname || "").match(/^\/u\/?(\d+)/);
      if (m) return m[1];

      // fallback optionnel si un jour ça devient ?u=123
      const u = url.searchParams && url.searchParams.get("u");
      if (u && /^\d+$/.test(u)) return u;

      return null;
    };

    this._delegatedClickHandler = (event) => {
      // clic principal uniquement
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const a = getAnchor(event);
      if (!a) return;

      // exclusions
      if (
        excludes.length &&
        excludes.some((sel) => {
          try {
            return a.matches(sel);
          } catch {
            return false;
          }
        })
      )
        return;

      const rawHref = a.getAttribute("href");
      if (!rawHref) return;

      // ignore ancres / protocoles spéciaux
      if (rawHref[0] === "#") return;
      if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return;

      let url;
      try {
        url = new URL(rawHref, window.location.href); // résout relatif/absolu
      } catch {
        return;
      }

      // limite au même site
      if (url.origin !== window.location.origin) return;

      // uniquement les profils /u...
      if (!url.pathname || !url.pathname.startsWith("/u")) return;

      const user_id = parseUserId(url);
      if (!user_id) return;

      event.preventDefault();
      event.stopPropagation();

      this.load(user_id).then(() => this.open());
    };

    document.addEventListener("click", this._delegatedClickHandler, true);
  };

  Wombat.prototype.destroy = function () {
    if (!this._delegatedClickHandler) return;
    document.removeEventListener("click", this._delegatedClickHandler, true);
    this._delegatedClickHandler = null;
  };

  /**
   * Description
   * @param {string} FA user_id
   * @returns {any}
   */
  Wombat.prototype.load = function (user_id) {
    return load("/u" + user_id, this.options.selector).then((wombat) => {
      if (this.options.displayOnLoad && !isVisible(wombat)) {
        wombat.style.display = this.options.displayOnLoad;
      }

      var doc = document.createDocumentFragment();
      doc.appendChild(wombat);

      this.content = doc;
    });
  };

  Wombat.prototype.close = function () {
    this.aside.classList.remove("open");
    this.overlay.classList.remove("open");

    this.clear(this.aside, this.overlay);
  };

  /**
   * Description
   * @param {any} ...els
   * @returns {any}
   */
  Wombat.prototype.clear = function (...els) {
    els.forEach((el) => {
      el.addEventListener(this.transitionEnd, function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    });
  };

  Wombat.prototype.open = function () {
    this.build();
    this.binds();
  };

  /**
   * Description
   * @param {object} options
   * @returns {undefined}
   */
  function Wombat(options) {
    if (!new.target)
      throw "Wombat() doit être utilisé comme constructeur et déclaré avec le mot-clef new.";

    this.dependencies = {
      switcheroo: typeof Switcheroo !== "undefined",
    };

    this.options = Object.assign({}, DEFAULT_OPT, options);

    this.transitionEnd = transitionSelect();
    this.onClick();
  }

  return Wombat;
})();
