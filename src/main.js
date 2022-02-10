
import { load } from '../../Helpers/Fetcher';
import { isVisible } from '../../Helpers/DOM';
import { transitionSelect } from '../../Helpers/Events';
import { isGuest } from '../../Helpers/FA';

const DEFAULT_OPT = {
    excludes: [],
    allowGuests: false,
    selector: '#wombat',
    displayOnLoad: '',
    overlay: true,
    overlayClass: 'wombat-overlay',
    drawerClass: 'wombat-aside',
    afterLoad: function () { }
}



/**
 * Description
 * @returns {any}
 */
Wombat.prototype.build = function () {
    var docFrag;

    docFrag = document.createDocumentFragment();

    this.aside = document.createElement('aside');
    this.aside.className = this.options.drawerClass;
    this.aside.appendChild(this.content);
    docFrag.appendChild(this.aside);

    if (this.options.overlay) {
        this.overlay = document.createElement('div');
        this.overlay.className = this.options.overlayClass;
        docFrag.appendChild(this.overlay);
    }

    document.body.appendChild(docFrag);
    if (typeof this.options.afterLoad === 'function') {
        this.options.afterLoad(this.aside, this.overlay);
    }
    

    window.getComputedStyle(this.aside).height;
    this.aside.classList.add('open');
    this.overlay.classList.add('open');

}


Wombat.prototype.binds = function () {

    if (this.overlay) {
        this.overlay.addEventListener('click', this.close.bind(this));
    }
}

Wombat.prototype.onClick = function () {
    var exclusions = this.options.excludes.join(',');
    var profileLinkSelector = (exclusions) ? `a[href^="/u"]:not(${exclusions})` : `a[href^="/u"]`;


    document.querySelectorAll(profileLinkSelector).forEach(el => {
        el.addEventListener('click', event => {
            event.stopPropagation();
            event.preventDefault();

            let user_id = new URL(el.href).pathname.replace(/\D/g, '');


            this.load(user_id).then(() => this.open());
        })
    })
}

/**
 * Description
 * @param {string} FA user_id
 * @returns {any}
 */
Wombat.prototype.load = function (user_id) {
    return load('/u' + user_id, this.options.selector).then(wombat => {

        if (this.options.displayOnLoad && !isVisible(wombat)) {
            wombat.style.display = this.options.displayOnLoad;
        }

        var doc = document.createDocumentFragment();
        doc.appendChild(wombat);

        this.content = doc;
    });
}

Wombat.prototype.close = function () {

    this.aside.classList.remove('open');
    this.overlay.classList.remove('open');

    this.clear(this.aside, this.overlay);
}

/**
 * Description
 * @param {any} ...els
 * @returns {any}
 */
Wombat.prototype.clear = function (...els) {
    els.forEach(el => {
        el.addEventListener(this.transitionEnd, function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    })
}

Wombat.prototype.open = function () {

    this.build();
    this.binds();

}

/**
 * Description
 * @param {object} options
 * @returns {undefined}
 */
export default function Wombat(options) {

    if (!new.target) throw 'Wombat() doit être utilisé comme constructeur et déclaré avec le mot-clef new.';

    this.dependencies = {
        switcheroo: (typeof Switcheroo !== 'undefined')
    };


    this.options = Object.assign({}, DEFAULT_OPT, options);

    if(!this.options.allowGuests) {
        if(isGuest()) return;
    }

    this.transitionEnd = transitionSelect();
    this.onClick();
};