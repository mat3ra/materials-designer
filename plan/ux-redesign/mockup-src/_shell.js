/* Materials Designer 2.0 mockup shell — shared behavior (theme, states, pins, viewport) */
(function () {
    "use strict";

    // ---- theme (dark default, persisted) ----------------------------------
    var THEME_KEY = "md2-theme";
    function getTheme() {
        try {
            var q = new URLSearchParams(location.search).get("theme");
            if (q === "light" || q === "dark") return q;
        } catch (e) { /* ignore */ }
        try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; }
    }
    function setTheme(t) {
        document.documentElement.setAttribute("data-theme", t);
        try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* private mode */ }
        var b = document.getElementById("themeBtn");
        if (b) b.textContent = t === "dark" ? "☀ Light" : "◐ Dark";
    }
    setTheme(getTheme());

    // ---- mock strip -------------------------------------------------------
    function buildStrip() {
        var body = document.body;
        var strip = document.createElement("div");
        strip.className = "mockstrip";
        var isIndex = body.getAttribute("data-index") === "1";
        var states = (body.getAttribute("data-states") || "").split(",").filter(Boolean);
        var html = '<span class="tag">MOCKUP</span>' +
            '<span class="title">' + (document.title || "") + "</span>";
        if (!isIndex) html += '<a href="index.html">← all screens</a>';
        html += '<span class="spacer"></span>';
        if (states.length) {
            html += '<span class="statebar"><span class="lbl">state:</span>';
            states.forEach(function (s) {
                var p = s.split("|");
                html += '<button data-setstate="' + p[0] + '">' + p[1] + "</button>";
            });
            html += "</span>";
        }
        html += '<button id="pinBtn" class="on">Annotations</button>';
        html += '<button id="themeBtn"></button>';
        strip.innerHTML = html;
        body.insertBefore(strip, body.firstChild);

        strip.addEventListener("click", function (ev) {
            var t = ev.target;
            if (t.id === "themeBtn") {
                setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
            } else if (t.id === "pinBtn") {
                document.body.classList.toggle("no-pins");
                t.classList.toggle("on");
            } else if (t.hasAttribute && t.hasAttribute("data-setstate")) {
                document.body.setAttribute("data-state", t.getAttribute("data-setstate"));
                syncStateButtons();
                if (window.MD_ON_STATE) window.MD_ON_STATE(t.getAttribute("data-setstate"));
            }
        });
        function syncStateButtons() {
            var cur = document.body.getAttribute("data-state");
            strip.querySelectorAll("[data-setstate]").forEach(function (b) {
                b.classList.toggle("on", b.getAttribute("data-setstate") === cur);
            });
        }
        if (states.length && !document.body.getAttribute("data-state")) {
            var init = states[0].split("|")[0];
            try {
                var qs = new URLSearchParams(location.search).get("state");
                if (qs && states.some(function (s) { return s.split("|")[0] === qs; })) init = qs;
            } catch (e) { /* ignore */ }
            document.body.setAttribute("data-state", init);
        }
        syncStateButtons();
        setTheme(getTheme()); // now that the button exists, set its label
    }

    // ---- annotation pins: auto-number + legend ----------------------------
    function buildPins() {
        var pins = Array.prototype.slice.call(document.querySelectorAll(".pin[data-pin]"));
        if (!pins.length) return;
        var legend = document.createElement("div");
        legend.className = "pinlegend";
        var items = "";
        pins.forEach(function (p, i) {
            var n = i + 1;
            p.textContent = n;
            p.title = p.getAttribute("data-pin").replace(/\*\*/g, "");
            var txt = p.getAttribute("data-pin")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            items += '<li><b class="n">' + n + '</b><span class="txt">' + txt + "</span></li>";
        });
        legend.innerHTML = "<h4>ANNOTATIONS (" + pins.length + ") — click to expand/collapse ▾</h4><ol>" + items + "</ol>";
        if (document.body.getAttribute("data-legend") === "collapsed") legend.classList.add("collapsed");
        document.body.appendChild(legend);
        legend.querySelector("h4").addEventListener("click", function () {
            legend.classList.toggle("collapsed");
        });
    }

    // ---- fake 3D viewport --------------------------------------------------
    // Injects the generated SVG into each .viewport[data-vp] and shows the
    // comma-separated group list from data-vp.
    function buildViewports() {
        if (!window.MD_VIEWPORT_SVG) return;
        document.querySelectorAll(".viewport[data-vp], .vpmini[data-vp]").forEach(function (vp) {
            var holder = document.createElement("div");
            holder.style.cssText = "position:absolute;inset:0;";
            holder.innerHTML = window.MD_VIEWPORT_SVG;
            vp.insertBefore(holder, vp.firstChild);
            var groups = (vp.getAttribute("data-vp") || "").split(",").filter(Boolean);
            groups.forEach(function (g) {
                var el = holder.querySelector("#" + g.trim());
                if (el) el.style.display = "";
            });
        });
    }

    // page helper: show exactly `groups` in the first viewport SVG (or a given one)
    window.MD_SET_VP = function (groups, vpSel) {
        var svg = document.querySelector((vpSel || ".viewport") + " svg");
        if (!svg) return;
        ["cell1", "cell3", "cell3d", "scene8", "ghost64", "scene72", "atom41si", "atom41p", "sel3", "ghostP"].forEach(function (g) {
            var el = svg.querySelector("#" + g);
            if (el) el.style.display = groups.indexOf(g) >= 0 ? "" : "none";
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        buildStrip();
        buildViewports();
        buildPins();
        if (window.MD_ON_STATE) window.MD_ON_STATE(document.body.getAttribute("data-state"));
    });
})();
