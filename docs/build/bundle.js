
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    // https://www.listchallenges.com/the-ultimate-list-of-disney-characters
    const set = new Set([
        'Mickey Mouse',
        'Minnie Mouse',
        'Goofy',
        'Donald Duck',
        'Pluto',
        'Daisy Duck',
        'Scrooge McDuck',
        'Launchpad McQuack',
        'Huey, Dewey and Louie',
        'Bambi (1942)',
        'Thumper',
        'Flower',
        'Faline',
        'Tinker Bell',
        'Peter Pan',
        'Wendy',
        'John Darling',
        'Michael Darling',
        'Captain Hook',
        'Tiger Lily',
        'Mr. Smee',
        'Alice',
        'Mad Hatter',
        'March Hare',
        'Queen of Hearts',
        'Cheshire Cat',
        'Kuzco',
        'Yzma',
        'Kronk',
        'Pacha',
        'Snow White',
        'Dopey',
        'Doc',
        'Sleepy',
        'Sneezy',
        'Bashful',
        'Happy',
        'Grumpy (1930)',
        'Evil Queen',
        'Prince Charming',
        'Cinderella (1950)',
        'Gus Gus',
        'Jaq Jaq',
        'Fairy Godmother',
        'Lady Tremaine',
        'Anastasia',
        'Drizella',
        'Pinocchio (1940)',
        'Jiminy Cricket',
        'Gepetto',
        'Honest John and Gideon',
        'Stromboli (1950)',
        'Blue Fairy',
        'Pocahontas (1995)',
        'John Smith',
        'Kocoum',
        'Meeko',
        'Flit',
        'Percy',
        'Governor Ratcliffe',
        'Princess Aurora (2005)',
        'Flora',
        'Fauna',
        'Merryweather',
        'Prince Philip',
        'Maleficent (2014)',
        'Merida',
        'Queen Elinor',
        'Rapunzel (2009)',
        'Flynn Rider',
        'Mother Gothel',
        'Pascal',
        'Mowgli',
        'Baloo',
        'Bagheera',
        'Shere Khan',
        'Kaa',
        'Sir Hiss',
        'Robin Hood (1973)',
        'Little John',
        'Sheriff of Nottingham',
        'Prince John',
        'Maid Marian',
        'Duchess',
        'Marie',
        'Toulouse',
        'Berlioz',
        "Thomas O'Malley",
        'Pongo',
        'Perdita',
        'Cruella De Vil',
        'Winnie the Pooh',
        'Tigger',
        'Kanga & Roo',
        'Eeyore',
        'Piglet (1977)',
        'Christopher Robin',
        'Lumpy',
        'Owl (2003)',
        'Rabbit',
        'Mulan (1998)',
        'Mushu',
        'Shan Yu',
        'Li Shang',
        'Panchito Pistoles',
        'Jose Carioca',
        'Belle',
        'Beast',
        'Gaston',
        'Maurice',
        'Le Fou',
        'Lumiere',
        'Cogsworth',
        'Mrs Potts',
        'Chip',
        'Chip',
        'Dale',
        'Dumbo',
        'Timothy Q Mouse',
        'Aladdin',
        'Jasmine',
        'Jafar',
        'Iago',
        'Genie (2010)',
        'Abu',
        'Hercules (1997)',
        'Phil',
        'Pegasus',
        'Zeus',
        'Hades',
        'Megara',
        'Esmeralda',
        'Djali',
        'Quasimodo',
        'Clopin Trouillefou',
        'Judge Claude Frollo',
        'Laverne',
        'Hugo',
        'Victor',
        'Lilo',
        'Stitch',
        'Nani Pelekai',
        'Jumba',
        'Max Goof',
        'Horace Horsecollar',
        'Clarabelle Cow',
        'Ariel',
        'Flounder',
        'Scuttle',
        'King Triton',
        'Prince Eric',
        'Sebastian',
        'Ursula (1961)',
        'Lady',
        'Tramp',
        'Tarzan (1999)',
        'Jane',
        'Pete',
        'Mortimer Mouse',
        'Princess Eilonwy',
        'Periwinkle',
        'Fawn',
        'Silvermist',
        'Vidia',
        'Iridessa',
        'Rosetta (1999)',
        'Simba',
        'Nala',
        'Timon',
        'Pumbaa',
        'Scar',
        'Mufasa the Lion King',
        'Zazu',
        'Brer Rabbit',
        'Brer Fox',
        "Br'er Bear",
    ]);
    var characters = [...set];

    /* ../src/Svrollbar.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1 } = globals;
    const file$i = "../src/Svrollbar.svelte";

    // (234:0) {#if visible}
    function create_if_block$2(ctx) {
    	let div2;
    	let div0;
    	let div0_intro;
    	let div0_outro;
    	let t;
    	let div1;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "v-track svelte-iodyq2");
    			set_style(div0, "height", /*trackHeight*/ ctx[6] + "px");
    			add_location(div0, file$i, 235, 4, 5863);
    			attr_dev(div1, "class", "v-thumb svelte-iodyq2");
    			set_style(div1, "height", /*thumbHeight*/ ctx[10] + "px");
    			set_style(div1, "top", /*thumbTop*/ ctx[9] + "px");
    			add_location(div1, file$i, 241, 4, 5998);
    			attr_dev(div2, "class", "v-scrollbar svelte-iodyq2");
    			set_style(div2, "height", /*trackHeight*/ ctx[6] + "px");
    			toggle_class(div2, "fixed", /*windowScrollEnabled*/ ctx[8]);
    			add_location(div2, file$i, 234, 2, 5767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			/*div0_binding*/ ctx[17](div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[18](div1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*trackHeight*/ 64) {
    				set_style(div0, "height", /*trackHeight*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*thumbHeight*/ 1024) {
    				set_style(div1, "height", /*thumbHeight*/ ctx[10] + "px");
    			}

    			if (!current || dirty[0] & /*thumbTop*/ 512) {
    				set_style(div1, "top", /*thumbTop*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*trackHeight*/ 64) {
    				set_style(div2, "height", /*trackHeight*/ ctx[6] + "px");
    			}

    			if (dirty[0] & /*windowScrollEnabled*/ 256) {
    				toggle_class(div2, "fixed", /*windowScrollEnabled*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				div0_intro = create_in_transition(div0, /*vTrackIn*/ ctx[0], {});
    				div0_intro.start();
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				div1_intro = create_in_transition(div1, /*vThumbIn*/ ctx[2], {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, /*vTrackOut*/ ctx[1], {});
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, /*vThumbOut*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*div0_binding*/ ctx[17](null);
    			if (detaching && div0_outro) div0_outro.end();
    			/*div1_binding*/ ctx[18](null);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(234:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[7] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let teardownViewport;
    	let teardownContents;
    	let teardownTrack;
    	let teardownThumb;
    	let wholeHeight;
    	let scrollTop;
    	let trackHeight;
    	let thumbHeight;
    	let thumbTop;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svrollbar', slots, []);
    	let { viewport } = $$props;
    	let { contents } = $$props;
    	let { hideAfter = 1000 } = $$props;
    	let { alwaysVisible = false } = $$props;
    	let { vTrackIn = node => fade(node, { duration: 100 }) } = $$props;
    	let { vTrackOut = node => fade(node, { duration: 300 }) } = $$props;
    	let { vThumbIn = node => fade(node, { duration: 100 }) } = $$props;
    	let { vThumbOut = node => fade(node, { duration: 300 }) } = $$props;

    	/**
     * @event show
     * @event hide
     */
    	const dispatch = createEventDispatcher();

    	let vTrack;
    	let vThumb;
    	let startTop = 0;
    	let startY = 0;
    	let timer = 0;
    	let visible = alwaysVisible;
    	let windowScrollEnabled = false;

    	function setupViewport(viewport) {
    		if (!viewport) return;
    		teardownViewport?.();

    		if (typeof window.ResizeObserver === 'undefined') {
    			throw new Error('window.ResizeObserver is missing.');
    		}

    		$$invalidate(8, windowScrollEnabled = document.scrollingElement === viewport);

    		// `document.scrollingElement` has the addEventListener function but scroll events wont occur.
    		// so we should register the scroll listener to document.
    		const element = windowScrollEnabled ? document : viewport;

    		element.addEventListener('scroll', onScroll, { passive: true });

    		const observer = new ResizeObserver(entries => {
    				for (const _entry of entries) {
    					$$invalidate(15, wholeHeight = viewport?.scrollHeight ?? 0);
    					$$invalidate(6, trackHeight = viewport?.clientHeight ?? 0);
    				}
    			});

    		observer.observe(viewport);

    		return () => {
    			element.removeEventListener('scroll', onScroll);
    			observer.unobserve(contents);
    			observer.disconnect();
    		};
    	}

    	function setupTrack(track) {
    		if (!track) return;
    		teardownTrack?.();
    		vTrack.addEventListener('mouseenter', onTrackEnter);
    		vTrack.addEventListener('mouseleave', onTrackLeave);

    		return () => {
    			vTrack.removeEventListener('mouseenter', onTrackEnter);
    			vTrack.removeEventListener('mouseleave', onTrackLeave);
    		};
    	}

    	function setupThumb(thumb) {
    		if (!thumb) return;
    		teardownThumb?.();
    		vThumb.addEventListener('mousedown', onThumbDown, { passive: true });
    		vThumb.addEventListener('touchstart', onThumbDown, { passive: true });

    		return () => {
    			vThumb.removeEventListener('mousedown', onThumbDown);
    			vThumb.removeEventListener('touchstart', onThumbDown);
    		};
    	}

    	function setupContents(contents) {
    		if (!contents) return;
    		teardownContents?.();

    		if (typeof window.ResizeObserver === 'undefined') {
    			throw new Error('window.ResizeObserver is missing.');
    		}

    		const observer = new ResizeObserver(entries => {
    				for (const _entry of entries) {
    					$$invalidate(15, wholeHeight = viewport?.scrollHeight ?? 0);
    				}
    			});

    		observer.observe(contents);

    		return () => {
    			observer.unobserve(contents);
    			observer.disconnect();
    		};
    	}

    	function setupTimer() {
    		timer = window.setTimeout(
    			() => {
    				$$invalidate(7, visible = alwaysVisible || false);
    				dispatch('hide');
    			},
    			hideAfter
    		);
    	}

    	function clearTimer() {
    		if (timer) {
    			window.clearTimeout(timer);
    			timer = 0;
    		}
    	}

    	function onScroll() {
    		clearTimer();
    		setupTimer();
    		$$invalidate(7, visible = alwaysVisible || true);
    		$$invalidate(16, scrollTop = viewport?.scrollTop ?? 0);
    		dispatch('show');
    	}

    	function onTrackEnter() {
    		clearTimer();
    	}

    	function onTrackLeave() {
    		clearTimer();
    		setupTimer();
    	}

    	function onThumbDown(event) {
    		event.stopPropagation();
    		event.preventDefault();
    		startTop = viewport.scrollTop;

    		startY = event.changedTouches
    		? event.changedTouches[0].clientY
    		: event.clientY;

    		document.addEventListener('mousemove', onThumbMove);
    		document.addEventListener('touchmove', onThumbMove);
    		document.addEventListener('mouseup', onThumbUp);
    		document.addEventListener('touchend', onThumbUp);
    	}

    	function onThumbMove(event) {
    		event.stopPropagation();
    		event.preventDefault();

    		const clientY = event.changedTouches
    		? event.changedTouches[0].clientY
    		: event.clientY;

    		const ratio = wholeHeight / trackHeight;
    		$$invalidate(11, viewport.scrollTop = startTop + ratio * (clientY - startY), viewport);
    	}

    	function onThumbUp(event) {
    		event.stopPropagation();
    		event.preventDefault();
    		startTop = 0;
    		startY = 0;
    		document.removeEventListener('mousemove', onThumbMove);
    		document.removeEventListener('touchmove', onThumbMove);
    		document.removeEventListener('mouseup', onThumbUp);
    		document.removeEventListener('touchend', onThumbUp);
    	}

    	onMount(() => {
    		$$invalidate(11, viewport = viewport ?? document.scrollingElement);
    		$$invalidate(12, contents = contents ?? document.body);
    	});

    	onDestroy(() => {
    		teardownViewport?.();
    		teardownContents?.();
    		teardownTrack?.();
    		teardownThumb?.();
    	});

    	const writable_props = [
    		'viewport',
    		'contents',
    		'hideAfter',
    		'alwaysVisible',
    		'vTrackIn',
    		'vTrackOut',
    		'vThumbIn',
    		'vThumbOut'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svrollbar> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			vTrack = $$value;
    			$$invalidate(4, vTrack);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			vThumb = $$value;
    			$$invalidate(5, vThumb);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('viewport' in $$props) $$invalidate(11, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(12, contents = $$props.contents);
    		if ('hideAfter' in $$props) $$invalidate(13, hideAfter = $$props.hideAfter);
    		if ('alwaysVisible' in $$props) $$invalidate(14, alwaysVisible = $$props.alwaysVisible);
    		if ('vTrackIn' in $$props) $$invalidate(0, vTrackIn = $$props.vTrackIn);
    		if ('vTrackOut' in $$props) $$invalidate(1, vTrackOut = $$props.vTrackOut);
    		if ('vThumbIn' in $$props) $$invalidate(2, vThumbIn = $$props.vThumbIn);
    		if ('vThumbOut' in $$props) $$invalidate(3, vThumbOut = $$props.vThumbOut);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		viewport,
    		contents,
    		hideAfter,
    		alwaysVisible,
    		vTrackIn,
    		vTrackOut,
    		vThumbIn,
    		vThumbOut,
    		dispatch,
    		vTrack,
    		vThumb,
    		startTop,
    		startY,
    		timer,
    		visible,
    		windowScrollEnabled,
    		setupViewport,
    		setupTrack,
    		setupThumb,
    		setupContents,
    		setupTimer,
    		clearTimer,
    		onScroll,
    		onTrackEnter,
    		onTrackLeave,
    		onThumbDown,
    		onThumbMove,
    		onThumbUp,
    		teardownThumb,
    		teardownTrack,
    		teardownContents,
    		teardownViewport,
    		trackHeight,
    		wholeHeight,
    		scrollTop,
    		thumbTop,
    		thumbHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ('viewport' in $$props) $$invalidate(11, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(12, contents = $$props.contents);
    		if ('hideAfter' in $$props) $$invalidate(13, hideAfter = $$props.hideAfter);
    		if ('alwaysVisible' in $$props) $$invalidate(14, alwaysVisible = $$props.alwaysVisible);
    		if ('vTrackIn' in $$props) $$invalidate(0, vTrackIn = $$props.vTrackIn);
    		if ('vTrackOut' in $$props) $$invalidate(1, vTrackOut = $$props.vTrackOut);
    		if ('vThumbIn' in $$props) $$invalidate(2, vThumbIn = $$props.vThumbIn);
    		if ('vThumbOut' in $$props) $$invalidate(3, vThumbOut = $$props.vThumbOut);
    		if ('vTrack' in $$props) $$invalidate(4, vTrack = $$props.vTrack);
    		if ('vThumb' in $$props) $$invalidate(5, vThumb = $$props.vThumb);
    		if ('startTop' in $$props) startTop = $$props.startTop;
    		if ('startY' in $$props) startY = $$props.startY;
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('visible' in $$props) $$invalidate(7, visible = $$props.visible);
    		if ('windowScrollEnabled' in $$props) $$invalidate(8, windowScrollEnabled = $$props.windowScrollEnabled);
    		if ('teardownThumb' in $$props) teardownThumb = $$props.teardownThumb;
    		if ('teardownTrack' in $$props) teardownTrack = $$props.teardownTrack;
    		if ('teardownContents' in $$props) teardownContents = $$props.teardownContents;
    		if ('teardownViewport' in $$props) teardownViewport = $$props.teardownViewport;
    		if ('trackHeight' in $$props) $$invalidate(6, trackHeight = $$props.trackHeight);
    		if ('wholeHeight' in $$props) $$invalidate(15, wholeHeight = $$props.wholeHeight);
    		if ('scrollTop' in $$props) $$invalidate(16, scrollTop = $$props.scrollTop);
    		if ('thumbTop' in $$props) $$invalidate(9, thumbTop = $$props.thumbTop);
    		if ('thumbHeight' in $$props) $$invalidate(10, thumbHeight = $$props.thumbHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*viewport*/ 2048) {
    			teardownViewport = setupViewport(viewport);
    		}

    		if ($$self.$$.dirty[0] & /*contents*/ 4096) {
    			teardownContents = setupContents(contents);
    		}

    		if ($$self.$$.dirty[0] & /*vTrack*/ 16) {
    			teardownTrack = setupTrack(vTrack);
    		}

    		if ($$self.$$.dirty[0] & /*vThumb*/ 32) {
    			teardownThumb = setupThumb(vThumb);
    		}

    		if ($$self.$$.dirty[0] & /*viewport*/ 2048) {
    			$$invalidate(15, wholeHeight = viewport?.scrollHeight ?? 0);
    		}

    		if ($$self.$$.dirty[0] & /*viewport*/ 2048) {
    			$$invalidate(16, scrollTop = viewport?.scrollTop ?? 0);
    		}

    		if ($$self.$$.dirty[0] & /*viewport*/ 2048) {
    			$$invalidate(6, trackHeight = viewport?.clientHeight ?? 0);
    		}

    		if ($$self.$$.dirty[0] & /*trackHeight, wholeHeight*/ 32832) {
    			$$invalidate(10, thumbHeight = trackHeight / wholeHeight * trackHeight ?? 0);
    		}

    		if ($$self.$$.dirty[0] & /*scrollTop, wholeHeight, trackHeight*/ 98368) {
    			$$invalidate(9, thumbTop = scrollTop / wholeHeight * trackHeight ?? 0);
    		}
    	};

    	return [
    		vTrackIn,
    		vTrackOut,
    		vThumbIn,
    		vThumbOut,
    		vTrack,
    		vThumb,
    		trackHeight,
    		visible,
    		windowScrollEnabled,
    		thumbTop,
    		thumbHeight,
    		viewport,
    		contents,
    		hideAfter,
    		alwaysVisible,
    		wholeHeight,
    		scrollTop,
    		div0_binding,
    		div1_binding
    	];
    }

    class Svrollbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$i,
    			create_fragment$i,
    			safe_not_equal,
    			{
    				viewport: 11,
    				contents: 12,
    				hideAfter: 13,
    				alwaysVisible: 14,
    				vTrackIn: 0,
    				vTrackOut: 1,
    				vThumbIn: 2,
    				vThumbOut: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svrollbar",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewport*/ ctx[11] === undefined && !('viewport' in props)) {
    			console.warn("<Svrollbar> was created without expected prop 'viewport'");
    		}

    		if (/*contents*/ ctx[12] === undefined && !('contents' in props)) {
    			console.warn("<Svrollbar> was created without expected prop 'contents'");
    		}
    	}

    	get viewport() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewport(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contents() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contents(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideAfter() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideAfter(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alwaysVisible() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alwaysVisible(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vTrackIn() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vTrackIn(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vTrackOut() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vTrackOut(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vThumbIn() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vThumbIn(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vThumbOut() {
    		throw new Error_1("<Svrollbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vThumbOut(value) {
    		throw new Error_1("<Svrollbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../src/Svroller.svelte generated by Svelte v3.46.4 */
    const file$h = "../src/Svroller.svelte";

    function create_fragment$h(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let svrollbar;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	svrollbar = new Svrollbar({
    			props: {
    				viewport: /*viewport*/ ctx[8],
    				contents: /*contents*/ ctx[9],
    				hideAfter: /*hideAfter*/ ctx[2],
    				alwaysVisible: /*alwaysVisible*/ ctx[3],
    				vTrackIn: /*vTrackIn*/ ctx[4],
    				vTrackOut: /*vTrackOut*/ ctx[5],
    				vThumbIn: /*vThumbIn*/ ctx[6],
    				vThumbOut: /*vThumbOut*/ ctx[7]
    			},
    			$$inline: true
    		});

    	svrollbar.$on("show", /*show_handler*/ ctx[14]);
    	svrollbar.$on("hide", /*hide_handler*/ ctx[15]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(svrollbar.$$.fragment);
    			attr_dev(div0, "class", "svlr-contents");
    			add_location(div0, file$h, 38, 4, 1147);
    			attr_dev(div1, "class", "svlr-viewport svelte-2auii3");
    			set_style(div1, "width", /*width*/ ctx[0]);
    			set_style(div1, "height", /*height*/ ctx[1]);
    			add_location(div1, file$h, 37, 2, 1053);
    			attr_dev(div2, "class", "svlr-wrapper svelte-2auii3");
    			set_style(div2, "width", /*width*/ ctx[0]);
    			set_style(div2, "height", /*height*/ ctx[1]);
    			add_location(div2, file$h, 36, 0, 983);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[12](div0);
    			/*div1_binding*/ ctx[13](div1);
    			append_dev(div2, t);
    			mount_component(svrollbar, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*width*/ 1) {
    				set_style(div1, "width", /*width*/ ctx[0]);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				set_style(div1, "height", /*height*/ ctx[1]);
    			}

    			const svrollbar_changes = {};
    			if (dirty & /*viewport*/ 256) svrollbar_changes.viewport = /*viewport*/ ctx[8];
    			if (dirty & /*contents*/ 512) svrollbar_changes.contents = /*contents*/ ctx[9];
    			if (dirty & /*hideAfter*/ 4) svrollbar_changes.hideAfter = /*hideAfter*/ ctx[2];
    			if (dirty & /*alwaysVisible*/ 8) svrollbar_changes.alwaysVisible = /*alwaysVisible*/ ctx[3];
    			if (dirty & /*vTrackIn*/ 16) svrollbar_changes.vTrackIn = /*vTrackIn*/ ctx[4];
    			if (dirty & /*vTrackOut*/ 32) svrollbar_changes.vTrackOut = /*vTrackOut*/ ctx[5];
    			if (dirty & /*vThumbIn*/ 64) svrollbar_changes.vThumbIn = /*vThumbIn*/ ctx[6];
    			if (dirty & /*vThumbOut*/ 128) svrollbar_changes.vThumbOut = /*vThumbOut*/ ctx[7];
    			svrollbar.$set(svrollbar_changes);

    			if (!current || dirty & /*width*/ 1) {
    				set_style(div2, "width", /*width*/ ctx[0]);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				set_style(div2, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(svrollbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(svrollbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[12](null);
    			/*div1_binding*/ ctx[13](null);
    			destroy_component(svrollbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svroller', slots, ['default']);
    	let { width = '10rem' } = $$props;
    	let { height = '10rem' } = $$props;
    	let { hideAfter = 1000 } = $$props;
    	let { alwaysVisible = false } = $$props;
    	let { vTrackIn = node => fade(node, { duration: 100 }) } = $$props;
    	let { vTrackOut = node => fade(node, { duration: 300 }) } = $$props;
    	let { vThumbIn = node => fade(node, { duration: 100 }) } = $$props;
    	let { vThumbOut = node => fade(node, { duration: 300 }) } = $$props;
    	let viewport;
    	let contents;

    	const writable_props = [
    		'width',
    		'height',
    		'hideAfter',
    		'alwaysVisible',
    		'vTrackIn',
    		'vTrackOut',
    		'vThumbIn',
    		'vThumbOut'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svroller> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contents = $$value;
    			$$invalidate(9, contents);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			viewport = $$value;
    			$$invalidate(8, viewport);
    		});
    	}

    	function show_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function hide_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('hideAfter' in $$props) $$invalidate(2, hideAfter = $$props.hideAfter);
    		if ('alwaysVisible' in $$props) $$invalidate(3, alwaysVisible = $$props.alwaysVisible);
    		if ('vTrackIn' in $$props) $$invalidate(4, vTrackIn = $$props.vTrackIn);
    		if ('vTrackOut' in $$props) $$invalidate(5, vTrackOut = $$props.vTrackOut);
    		if ('vThumbIn' in $$props) $$invalidate(6, vThumbIn = $$props.vThumbIn);
    		if ('vThumbOut' in $$props) $$invalidate(7, vThumbOut = $$props.vThumbOut);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Svrollbar,
    		width,
    		height,
    		hideAfter,
    		alwaysVisible,
    		vTrackIn,
    		vTrackOut,
    		vThumbIn,
    		vThumbOut,
    		viewport,
    		contents
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('hideAfter' in $$props) $$invalidate(2, hideAfter = $$props.hideAfter);
    		if ('alwaysVisible' in $$props) $$invalidate(3, alwaysVisible = $$props.alwaysVisible);
    		if ('vTrackIn' in $$props) $$invalidate(4, vTrackIn = $$props.vTrackIn);
    		if ('vTrackOut' in $$props) $$invalidate(5, vTrackOut = $$props.vTrackOut);
    		if ('vThumbIn' in $$props) $$invalidate(6, vThumbIn = $$props.vThumbIn);
    		if ('vThumbOut' in $$props) $$invalidate(7, vThumbOut = $$props.vThumbOut);
    		if ('viewport' in $$props) $$invalidate(8, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(9, contents = $$props.contents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		width,
    		height,
    		hideAfter,
    		alwaysVisible,
    		vTrackIn,
    		vTrackOut,
    		vThumbIn,
    		vThumbOut,
    		viewport,
    		contents,
    		$$scope,
    		slots,
    		div0_binding,
    		div1_binding,
    		show_handler,
    		hide_handler
    	];
    }

    class Svroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			width: 0,
    			height: 1,
    			hideAfter: 2,
    			alwaysVisible: 3,
    			vTrackIn: 4,
    			vTrackOut: 5,
    			vThumbIn: 6,
    			vThumbOut: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svroller",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get width() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideAfter() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideAfter(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alwaysVisible() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alwaysVisible(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vTrackIn() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vTrackIn(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vTrackOut() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vTrackOut(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vThumbIn() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vThumbIn(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vThumbOut() {
    		throw new Error("<Svroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vThumbOut(value) {
    		throw new Error("<Svroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/simple/DefaultExample.svelte generated by Svelte v3.46.4 */
    const file$g = "src/simple/DefaultExample.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (6:2) {#each data as d (d)}
    function create_each_block$d(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-f6x41s");
    			add_location(div, file$g, 6, 4, 161);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(6:2) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Svroller width="20rem" height="20rem">
    function create_default_slot$b(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$d, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$d(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$d, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$d, each_1_anchor, get_each_context$d);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(5:0) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svroller.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svroller, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svroller, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DefaultExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DefaultExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class DefaultExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefaultExample",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<DefaultExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DefaultExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DefaultExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/simple/AndroidLikeExample.svelte generated by Svelte v3.46.4 */
    const file$f = "src/simple/AndroidLikeExample.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (28:4) {#each data as d (d)}
    function create_each_block$c(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-tetb46");
    			add_location(div, file$f, 28, 6, 620);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(28:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (27:2) <Svroller width="20rem" height="20rem" hideAfter={100}>
    function create_default_slot$a(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$c, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$c(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$c, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$c, each_1_anchor, get_each_context$c);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(27:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\" hideAfter={100}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				hideAfter: 100,
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-tetb46");
    			add_location(div, file$f, 25, 0, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AndroidLikeExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AndroidLikeExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class AndroidLikeExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AndroidLikeExample",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<AndroidLikeExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<AndroidLikeExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<AndroidLikeExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example.svelte generated by Svelte v3.46.4 */

    const file$e = "src/Example.svelte";

    function create_fragment$e(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "name svelte-kkc9bg");
    			add_location(div0, file$e, 21, 2, 280);
    			attr_dev(div1, "class", "view svelte-kkc9bg");
    			add_location(div1, file$e, 22, 2, 313);
    			attr_dev(div2, "class", "example svelte-kkc9bg");
    			add_location(div2, file$e, 20, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example', slots, ['default']);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, $$scope, slots];
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Example> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Example>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Example>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/simple/WindowsLikeExample.svelte generated by Svelte v3.46.4 */
    const file$d = "src/simple/WindowsLikeExample.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (28:4) {#each data as d (d)}
    function create_each_block$b(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1e7v1gu");
    			add_location(div, file$d, 28, 6, 627);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(28:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (27:2) <Svroller width="20rem" height="20rem" alwaysVisible={true}>
    function create_default_slot$9(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$b, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$b, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$b, each_1_anchor, get_each_context$b);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(27:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\" alwaysVisible={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				alwaysVisible: true,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-1e7v1gu");
    			add_location(div, file$d, 25, 0, 508);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WindowsLikeExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WindowsLikeExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class WindowsLikeExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowsLikeExample",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<WindowsLikeExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<WindowsLikeExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<WindowsLikeExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/style/ColoredExample.svelte generated by Svelte v3.46.4 */
    const file$c = "src/style/ColoredExample.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (24:4) {#each data as d (d)}
    function create_each_block$a(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-7pquut");
    			add_location(div, file$c, 24, 6, 519);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(24:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (23:2) <Svroller width="20rem" height="20rem">
    function create_default_slot$8(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$a, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$a, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$a, each_1_anchor, get_each_context$a);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(23:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-7pquut");
    			add_location(div, file$c, 21, 0, 421);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColoredExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColoredExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class ColoredExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColoredExample",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<ColoredExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<ColoredExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ColoredExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/style/GradationThumbExample.svelte generated by Svelte v3.46.4 */
    const file$b = "src/style/GradationThumbExample.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:4) {#each data as d (d)}
    function create_each_block$9(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1i5ob0s");
    			add_location(div, file$b, 20, 6, 439);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(20:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (19:2) <Svroller width="20rem" height="20rem">
    function create_default_slot$7(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$9, each_1_anchor, get_each_context$9);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(19:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-1i5ob0s");
    			add_location(div, file$b, 17, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GradationThumbExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GradationThumbExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class GradationThumbExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GradationThumbExample",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<GradationThumbExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<GradationThumbExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<GradationThumbExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/style/GradationTrackExample.svelte generated by Svelte v3.46.4 */
    const file$a = "src/style/GradationTrackExample.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:4) {#each data as d (d)}
    function create_each_block$8(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1tff0oi");
    			add_location(div, file$a, 23, 6, 571);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(23:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (22:2) <Svroller width="20rem" height="20rem" alwaysVisible={true}>
    function create_default_slot$6(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$8, each_1_anchor, get_each_context$8);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(22:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\" alwaysVisible={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				alwaysVisible: true,
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-1tff0oi");
    			add_location(div, file$a, 20, 0, 452);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GradationTrackExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GradationTrackExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class GradationTrackExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GradationTrackExample",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<GradationTrackExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<GradationTrackExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<GradationTrackExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/animation/FlyExample.svelte generated by Svelte v3.46.4 */
    const file$9 = "src/animation/FlyExample.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:4) {#each data as d (d)}
    function create_each_block$7(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[3] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-7pquut");
    			add_location(div, file$9, 34, 6, 783);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[3] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(34:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (26:2) <Svroller     width="20rem"     height="20rem"     hideAfter={500}     vTrackIn={flyLeft}     vTrackOut={flyLeft}     vThumbIn={flyRight}     vThumbOut={flyRight}>
    function create_default_slot$5(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[3];
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$7, each_1_anchor, get_each_context$7);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(26:2) <Svroller     width=\\\"20rem\\\"     height=\\\"20rem\\\"     hideAfter={500}     vTrackIn={flyLeft}     vTrackOut={flyLeft}     vThumbIn={flyRight}     vThumbOut={flyRight}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				hideAfter: 500,
    				vTrackIn: /*flyLeft*/ ctx[1],
    				vTrackOut: /*flyLeft*/ ctx[1],
    				vThumbIn: /*flyRight*/ ctx[2],
    				vThumbOut: /*flyRight*/ ctx[2],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-7pquut");
    			add_location(div, file$9, 24, 0, 561);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 65) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlyExample', slots, []);
    	let { data } = $$props;
    	const flyLeft = node => fly(node, { x: -160 });
    	const flyRight = node => fly(node, { x: 30 });
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FlyExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ fly, Svroller, data, flyLeft, flyRight });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, flyLeft, flyRight];
    }

    class FlyExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlyExample",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<FlyExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<FlyExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<FlyExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/animation/CrossfadeExample.svelte generated by Svelte v3.46.4 */
    const file$8 = "src/animation/CrossfadeExample.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (56:4) {#each data as d (d)}
    function create_each_block$6(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[9] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1v6j6lm");
    			add_location(div, file$8, 56, 6, 1258);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(56:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Svroller     width="20rem"     height="20rem"     hideAfter={500}     on:show={() => (visible = false)}     on:hide={() => (visible = true)}     {vThumbIn}     {vThumbOut}>
    function create_default_slot$4(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[9];
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(48:2) <Svroller     width=\\\"20rem\\\"     height=\\\"20rem\\\"     hideAfter={500}     on:show={() => (visible = false)}     on:hide={() => (visible = true)}     {vThumbIn}     {vThumbOut}>",
    		ctx
    	});

    	return block;
    }

    // (60:2) {#if visible}
    function create_if_block$1(ctx) {
    	let button;
    	let button_intro;
    	let button_outro;
    	let current;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+";
    			attr_dev(button, "class", "fab svelte-1v6j6lm");
    			add_location(button, file$8, 60, 4, 1332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (button_outro) button_outro.end(1);
    				button_intro = create_in_transition(button, /*receive*/ ctx[3], /*opt*/ ctx[4]);
    				button_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (button_intro) button_intro.invalidate();
    			button_outro = create_out_transition(button, /*send*/ ctx[2], /*opt*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching && button_outro) button_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(60:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let svroller;
    	let t;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				hideAfter: 500,
    				vThumbIn: /*vThumbIn*/ ctx[5],
    				vThumbOut: /*vThumbOut*/ ctx[6],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	svroller.$on("show", /*show_handler*/ ctx[7]);
    	svroller.$on("hide", /*hide_handler*/ ctx[8]);
    	let if_block = /*visible*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container svelte-1v6j6lm");
    			add_location(div, file$8, 46, 0, 1026);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 4097) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);

    			if (/*visible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CrossfadeExample', slots, []);
    	let { data } = $$props;
    	const [send, receive] = crossfade({ duration: 300, fallback: scale });
    	const opt = { key: 'fab' };
    	const vThumbIn = node => receive(node, opt);
    	const vThumbOut = node => send(node, opt);
    	let visible = true;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CrossfadeExample> was created with unknown prop '${key}'`);
    	});

    	const show_handler = () => $$invalidate(1, visible = false);
    	const hide_handler = () => $$invalidate(1, visible = true);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		crossfade,
    		scale,
    		Svroller,
    		data,
    		send,
    		receive,
    		opt,
    		vThumbIn,
    		vThumbOut,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('visible' in $$props) $$invalidate(1, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		visible,
    		send,
    		receive,
    		opt,
    		vThumbIn,
    		vThumbOut,
    		show_handler,
    		hide_handler
    	];
    }

    class CrossfadeExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CrossfadeExample",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<CrossfadeExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<CrossfadeExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<CrossfadeExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/animation/ScaleExample.svelte generated by Svelte v3.46.4 */
    const file$7 = "src/animation/ScaleExample.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (24:4) {#each data as d (d)}
    function create_each_block$5(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[2] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1k3zh5m");
    			add_location(div, file$7, 24, 6, 571);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(24:4) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (23:2) <Svroller width="20rem" height="20rem" hideAfter={500} vThumbIn={grow} vThumbOut={grow}>
    function create_default_slot$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[2];
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$5, each_1_anchor, get_each_context$5);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(23:2) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\" hideAfter={500} vThumbIn={grow} vThumbOut={grow}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				hideAfter: 500,
    				vThumbIn: /*grow*/ ctx[1],
    				vThumbOut: /*grow*/ ctx[1],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svroller.$$.fragment);
    			attr_dev(div, "class", "container svelte-1k3zh5m");
    			add_location(div, file$7, 21, 0, 424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 33) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ScaleExample', slots, []);
    	let { data } = $$props;
    	const grow = node => scale(node);
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ScaleExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ scale, Svroller, data, grow });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, grow];
    }

    class ScaleExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScaleExample",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<ScaleExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<ScaleExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ScaleExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/other/ExternalViewportExample.svelte generated by Svelte v3.46.4 */
    const file$6 = "src/other/ExternalViewportExample.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (10:6) {#each data as d (d)}
    function create_each_block$4(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[5] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-1oxglp");
    			add_location(div, file$6, 10, 8, 274);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(10:6) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let svrollbar;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[5];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	svrollbar = new Svrollbar({
    			props: {
    				viewport: /*viewport*/ ctx[1],
    				contents: /*contents*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(svrollbar.$$.fragment);
    			attr_dev(div0, "class", "contents");
    			add_location(div0, file$6, 8, 4, 194);
    			attr_dev(div1, "class", "viewport svelte-1oxglp");
    			add_location(div1, file$6, 7, 2, 146);
    			attr_dev(div2, "class", "wrapper svelte-1oxglp");
    			add_location(div2, file$6, 6, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[3](div0);
    			/*div1_binding*/ ctx[4](div1);
    			append_dev(div2, t);
    			mount_component(svrollbar, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$4, null, get_each_context$4);
    			}

    			const svrollbar_changes = {};
    			if (dirty & /*viewport*/ 2) svrollbar_changes.viewport = /*viewport*/ ctx[1];
    			if (dirty & /*contents*/ 4) svrollbar_changes.contents = /*contents*/ ctx[2];
    			svrollbar.$set(svrollbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svrollbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svrollbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div0_binding*/ ctx[3](null);
    			/*div1_binding*/ ctx[4](null);
    			destroy_component(svrollbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ExternalViewportExample', slots, []);
    	let { data } = $$props;
    	let viewport;
    	let contents;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ExternalViewportExample> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contents = $$value;
    			$$invalidate(2, contents);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			viewport = $$value;
    			$$invalidate(1, viewport);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svrollbar, data, viewport, contents });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('viewport' in $$props) $$invalidate(1, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(2, contents = $$props.contents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, viewport, contents, div0_binding, div1_binding];
    }

    class ExternalViewportExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExternalViewportExample",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<ExternalViewportExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<ExternalViewportExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ExternalViewportExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const ALIGNMENT = {
    	AUTO:   'auto',
    	START:  'start',
    	CENTER: 'center',
    	END:    'end',
    };

    const DIRECTION = {
    	HORIZONTAL: 'horizontal',
    	VERTICAL:   'vertical',
    };

    const SCROLL_CHANGE_REASON = {
    	OBSERVED:  0,
    	REQUESTED: 1,
    };

    const SCROLL_PROP = {
    	[DIRECTION.VERTICAL]:   'scrollTop',
    	[DIRECTION.HORIZONTAL]: 'scrollLeft',
    };

    /* Forked from react-virtualized 💖 */

    /**
     * @callback ItemSizeGetter
     * @param {number} index
     * @return {number}
     */

    /**
     * @typedef ItemSize
     * @type {number | number[] | ItemSizeGetter}
     */

    /**
     * @typedef SizeAndPosition
     * @type {object}
     * @property {number} size
     * @property {number} offset
     */

    /**
     * @typedef SizeAndPositionData
     * @type {Object.<number, SizeAndPosition>}
     */

    /**
     * @typedef Options
     * @type {object}
     * @property {number} itemCount
     * @property {ItemSize} itemSize
     * @property {number} estimatedItemSize
     */

    class SizeAndPositionManager {

    	/**
    	 * @param {Options} options
    	 */
    	constructor({ itemSize, itemCount, estimatedItemSize }) {
    		/**
    		 * @private
    		 * @type {ItemSize}
    		 */
    		this.itemSize = itemSize;

    		/**
    		 * @private
    		 * @type {number}
    		 */
    		this.itemCount = itemCount;

    		/**
    		 * @private
    		 * @type {number}
    		 */
    		this.estimatedItemSize = estimatedItemSize;

    		/**
    		 * Cache of size and position data for items, mapped by item index.
    		 *
    		 * @private
    		 * @type {SizeAndPositionData}
    		 */
    		this.itemSizeAndPositionData = {};

    		/**
    		 * Measurements for items up to this index can be trusted; items afterward should be estimated.
    		 *
    		 * @private
    		 * @type {number}
    		 */
    		this.lastMeasuredIndex = -1;

    		this.checkForMismatchItemSizeAndItemCount();

    		if (!this.justInTime) this.computeTotalSizeAndPositionData();
    	}

    	get justInTime() {
    		return typeof this.itemSize === 'function';
    	}

    	/**
    	 * @param {Options} options
    	 */
    	updateConfig({ itemSize, itemCount, estimatedItemSize }) {
    		if (itemCount != null) {
    			this.itemCount = itemCount;
    		}

    		if (estimatedItemSize != null) {
    			this.estimatedItemSize = estimatedItemSize;
    		}

    		if (itemSize != null) {
    			this.itemSize = itemSize;
    		}

    		this.checkForMismatchItemSizeAndItemCount();

    		if (this.justInTime && this.totalSize != null) {
    			this.totalSize = undefined;
    		} else {
    			this.computeTotalSizeAndPositionData();
    		}
    	}

    	checkForMismatchItemSizeAndItemCount() {
    		if (Array.isArray(this.itemSize) && this.itemSize.length < this.itemCount) {
    			throw Error(
    				`When itemSize is an array, itemSize.length can't be smaller than itemCount`,
    			);
    		}
    	}

    	/**
    	 * @param {number} index
    	 */
    	getSize(index) {
    		const { itemSize } = this;

    		if (typeof itemSize === 'function') {
    			return itemSize(index);
    		}

    		return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    	}

    	/**
    	 * Compute the totalSize and itemSizeAndPositionData at the start,
    	 * only when itemSize is a number or an array.
    	 */
    	computeTotalSizeAndPositionData() {
    		let totalSize = 0;
    		for (let i = 0; i < this.itemCount; i++) {
    			const size = this.getSize(i);
    			const offset = totalSize;
    			totalSize += size;

    			this.itemSizeAndPositionData[i] = {
    				offset,
    				size,
    			};
    		}

    		this.totalSize = totalSize;
    	}

    	getLastMeasuredIndex() {
    		return this.lastMeasuredIndex;
    	}


    	/**
    	 * This method returns the size and position for the item at the specified index.
    	 *
    	 * @param {number} index
    	 */
    	getSizeAndPositionForIndex(index) {
    		if (index < 0 || index >= this.itemCount) {
    			throw Error(
    				`Requested index ${index} is outside of range 0..${this.itemCount}`,
    			);
    		}

    		return this.justInTime
    			? this.getJustInTimeSizeAndPositionForIndex(index)
    			: this.itemSizeAndPositionData[index];
    	}

    	/**
    	 * This is used when itemSize is a function.
    	 * just-in-time calculates (or used cached values) for items leading up to the index.
    	 *
    	 * @param {number} index
    	 */
    	getJustInTimeSizeAndPositionForIndex(index) {
    		if (index > this.lastMeasuredIndex) {
    			const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    			let offset =
    				    lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;

    			for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
    				const size = this.getSize(i);

    				if (size == null || isNaN(size)) {
    					throw Error(`Invalid size returned for index ${i} of value ${size}`);
    				}

    				this.itemSizeAndPositionData[i] = {
    					offset,
    					size,
    				};

    				offset += size;
    			}

    			this.lastMeasuredIndex = index;
    		}

    		return this.itemSizeAndPositionData[index];
    	}

    	getSizeAndPositionOfLastMeasuredItem() {
    		return this.lastMeasuredIndex >= 0
    			? this.itemSizeAndPositionData[this.lastMeasuredIndex]
    			: { offset: 0, size: 0 };
    	}

    	/**
    	 * Total size of all items being measured.
    	 *
    	 * @return {number}
    	 */
    	getTotalSize() {
    		// Return the pre computed totalSize when itemSize is number or array.
    		if (this.totalSize) return this.totalSize;

    		/**
    		 * When itemSize is a function,
    		 * This value will be completedly estimated initially.
    		 * As items as measured the estimate will be updated.
    		 */
    		const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();

    		return (
    			lastMeasuredSizeAndPosition.offset +
    			lastMeasuredSizeAndPosition.size +
    			(this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize
    		);
    	}

    	/**
    	 * Determines a new offset that ensures a certain item is visible, given the alignment.
    	 *
    	 * @param {'auto' | 'start' | 'center' | 'end'} align Desired alignment within container
    	 * @param {number | undefined} containerSize Size (width or height) of the container viewport
    	 * @param {number | undefined} currentOffset
    	 * @param {number | undefined} targetIndex
    	 * @return {number} Offset to use to ensure the specified item is visible
    	 */
    	getUpdatedOffsetForIndex({ align = ALIGNMENT.START, containerSize, currentOffset, targetIndex }) {
    		if (containerSize <= 0) {
    			return 0;
    		}

    		const datum = this.getSizeAndPositionForIndex(targetIndex);
    		const maxOffset = datum.offset;
    		const minOffset = maxOffset - containerSize + datum.size;

    		let idealOffset;

    		switch (align) {
    			case ALIGNMENT.END:
    				idealOffset = minOffset;
    				break;
    			case ALIGNMENT.CENTER:
    				idealOffset = maxOffset - (containerSize - datum.size) / 2;
    				break;
    			case ALIGNMENT.START:
    				idealOffset = maxOffset;
    				break;
    			default:
    				idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
    		}

    		const totalSize = this.getTotalSize();

    		return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
    	}

    	/**
    	 * @param {number} containerSize
    	 * @param {number} offset
    	 * @param {number} overscanCount
    	 * @return {{stop: number|undefined, start: number|undefined}}
    	 */
    	getVisibleRange({ containerSize = 0, offset, overscanCount }) {
    		const totalSize = this.getTotalSize();

    		if (totalSize === 0) {
    			return {};
    		}

    		const maxOffset = offset + containerSize;
    		let start = this.findNearestItem(offset);

    		if (start === undefined) {
    			throw Error(`Invalid offset ${offset} specified`);
    		}

    		const datum = this.getSizeAndPositionForIndex(start);
    		offset = datum.offset + datum.size;

    		let stop = start;

    		while (offset < maxOffset && stop < this.itemCount - 1) {
    			stop++;
    			offset += this.getSizeAndPositionForIndex(stop).size;
    		}

    		if (overscanCount) {
    			start = Math.max(0, start - overscanCount);
    			stop = Math.min(stop + overscanCount, this.itemCount - 1);
    		}

    		return {
    			start,
    			stop,
    		};
    	}

    	/**
    	 * Clear all cached values for items after the specified index.
    	 * This method should be called for any item that has changed its size.
    	 * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
    	 *
    	 * @param {number} index
    	 */
    	resetItem(index) {
    		this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
    	}

    	/**
    	 * Searches for the item (index) nearest the specified offset.
    	 *
    	 * If no exact match is found the next lowest item index will be returned.
    	 * This allows partially visible items (with offsets just before/above the fold) to be visible.
    	 *
    	 * @param {number} offset
    	 */
    	findNearestItem(offset) {
    		if (isNaN(offset)) {
    			throw Error(`Invalid offset ${offset} specified`);
    		}

    		// Our search algorithms find the nearest match at or below the specified offset.
    		// So make sure the offset is at least 0 or no match will be found.
    		offset = Math.max(0, offset);

    		const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    		const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

    		if (lastMeasuredSizeAndPosition.offset >= offset) {
    			// If we've already measured items within this range just use a binary search as it's faster.
    			return this.binarySearch({
    				high: lastMeasuredIndex,
    				low:  0,
    				offset,
    			});
    		} else {
    			// If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
    			// The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
    			// The overall complexity for this approach is O(log n).
    			return this.exponentialSearch({
    				index: lastMeasuredIndex,
    				offset,
    			});
    		}
    	}

    	/**
    	 * @private
    	 * @param {number} low
    	 * @param {number} high
    	 * @param {number} offset
    	 */
    	binarySearch({ low, high, offset }) {
    		let middle = 0;
    		let currentOffset = 0;

    		while (low <= high) {
    			middle = low + Math.floor((high - low) / 2);
    			currentOffset = this.getSizeAndPositionForIndex(middle).offset;

    			if (currentOffset === offset) {
    				return middle;
    			} else if (currentOffset < offset) {
    				low = middle + 1;
    			} else if (currentOffset > offset) {
    				high = middle - 1;
    			}
    		}

    		if (low > 0) {
    			return low - 1;
    		}

    		return 0;
    	}

    	/**
    	 * @private
    	 * @param {number} index
    	 * @param {number} offset
    	 */
    	exponentialSearch({ index, offset }) {
    		let interval = 1;

    		while (
    			index < this.itemCount &&
    			this.getSizeAndPositionForIndex(index).offset < offset
    			) {
    			index += interval;
    			interval *= 2;
    		}

    		return this.binarySearch({
    			high: Math.min(index, this.itemCount - 1),
    			low:  Math.floor(index / 2),
    			offset,
    		});
    	}
    }

    /* node_modules/svelte-tiny-virtual-list/src/VirtualList.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file$5 = "node_modules/svelte-tiny-virtual-list/src/VirtualList.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	style: dirty[0] & /*items*/ 4,
    	index: dirty[0] & /*items*/ 4
    });

    const get_item_slot_context = ctx => ({
    	style: /*item*/ ctx[36].style,
    	index: /*item*/ ctx[36].index
    });

    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (318:2) {#each items as item (getKey ? getKey(item.index) : item.index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let current;
    	const item_slot_template = /*#slots*/ ctx[20].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[19], get_item_slot_context);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (item_slot) item_slot.c();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (item_slot) {
    				item_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[0] & /*$$scope, items*/ 524292)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[19], dirty, get_item_slot_changes),
    						get_item_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (item_slot) item_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(318:2) {#each items as item (getKey ? getKey(item.index) : item.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[20].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[19], get_header_slot_context);
    	let each_value = /*items*/ ctx[2];
    	validate_each_argument(each_value);

    	const get_key = ctx => /*getKey*/ ctx[0]
    	? /*getKey*/ ctx[0](/*item*/ ctx[36].index)
    	: /*item*/ ctx[36].index;

    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const footer_slot_template = /*#slots*/ ctx[20].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[19], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "virtual-list-inner svelte-1he1ex4");
    			attr_dev(div0, "style", /*innerStyle*/ ctx[4]);
    			add_location(div0, file$5, 316, 1, 7173);
    			attr_dev(div1, "class", "virtual-list-wrapper svelte-1he1ex4");
    			attr_dev(div1, "style", /*wrapperStyle*/ ctx[3]);
    			add_location(div1, file$5, 313, 0, 7071);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (header_slot) {
    				header_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t1);

    			if (footer_slot) {
    				footer_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[21](div1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[19], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*$$scope, items, getKey*/ 524293) {
    				each_value = /*items*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*innerStyle*/ 16) {
    				attr_dev(div0, "style", /*innerStyle*/ ctx[4]);
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[19], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}

    			if (!current || dirty[0] & /*wrapperStyle*/ 8) {
    				attr_dev(div1, "style", /*wrapperStyle*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (footer_slot) footer_slot.d(detaching);
    			/*div1_binding*/ ctx[21](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const thirdEventArg = (() => {
    	let result = false;

    	try {
    		const arg = Object.defineProperty({}, 'passive', {
    			get() {
    				result = { passive: true };
    				return true;
    			}
    		});

    		window.addEventListener('testpassive', arg, arg);
    		window.remove('testpassive', arg, arg);
    	} catch(e) {
    		
    	} /* */

    	return result;
    })();

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VirtualList', slots, ['header','item','footer']);
    	let { height } = $$props;
    	let { width = '100%' } = $$props;
    	let { itemCount } = $$props;
    	let { itemSize } = $$props;
    	let { estimatedItemSize = null } = $$props;
    	let { stickyIndices = null } = $$props;
    	let { getKey = null } = $$props;
    	let { scrollDirection = DIRECTION.VERTICAL } = $$props;
    	let { scrollOffset = null } = $$props;
    	let { scrollToIndex = null } = $$props;
    	let { scrollToAlignment = null } = $$props;
    	let { overscanCount = 3 } = $$props;
    	const dispatchEvent = createEventDispatcher();

    	const sizeAndPositionManager = new SizeAndPositionManager({
    			itemCount,
    			itemSize,
    			estimatedItemSize: getEstimatedItemSize()
    		});

    	let mounted = false;
    	let wrapper;
    	let items = [];

    	let state = {
    		offset: scrollOffset || scrollToIndex != null && items.length && getOffsetForIndex(scrollToIndex) || 0,
    		scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    	};

    	let prevState = state;

    	let prevProps = {
    		scrollToIndex,
    		scrollToAlignment,
    		scrollOffset,
    		itemCount,
    		itemSize,
    		estimatedItemSize
    	};

    	let styleCache = {};
    	let wrapperStyle = '';
    	let innerStyle = '';
    	refresh(); // Initial Load

    	onMount(() => {
    		$$invalidate(17, mounted = true);
    		wrapper.addEventListener('scroll', handleScroll, thirdEventArg);

    		if (scrollOffset != null) {
    			scrollTo(scrollOffset);
    		} else if (scrollToIndex != null) {
    			scrollTo(getOffsetForIndex(scrollToIndex));
    		}
    	});

    	onDestroy(() => {
    		if (mounted) wrapper.removeEventListener('scroll', handleScroll);
    	});

    	function propsUpdated() {
    		if (!mounted) return;
    		const scrollPropsHaveChanged = prevProps.scrollToIndex !== scrollToIndex || prevProps.scrollToAlignment !== scrollToAlignment;
    		const itemPropsHaveChanged = prevProps.itemCount !== itemCount || prevProps.itemSize !== itemSize || prevProps.estimatedItemSize !== estimatedItemSize;

    		if (itemPropsHaveChanged) {
    			sizeAndPositionManager.updateConfig({
    				itemSize,
    				itemCount,
    				estimatedItemSize: getEstimatedItemSize()
    			});

    			recomputeSizes();
    		}

    		if (prevProps.scrollOffset !== scrollOffset) {
    			$$invalidate(18, state = {
    				offset: scrollOffset || 0,
    				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    			});
    		} else if (typeof scrollToIndex === 'number' && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
    			$$invalidate(18, state = {
    				offset: getOffsetForIndex(scrollToIndex, scrollToAlignment, itemCount),
    				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    			});
    		}

    		prevProps = {
    			scrollToIndex,
    			scrollToAlignment,
    			scrollOffset,
    			itemCount,
    			itemSize,
    			estimatedItemSize
    		};
    	}

    	function stateUpdated() {
    		if (!mounted) return;
    		const { offset, scrollChangeReason } = state;

    		if (prevState.offset !== offset || prevState.scrollChangeReason !== scrollChangeReason) {
    			refresh();
    		}

    		if (prevState.offset !== offset && scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED) {
    			scrollTo(offset);
    		}

    		prevState = state;
    	}

    	function refresh() {
    		const { offset } = state;

    		const { start, stop } = sizeAndPositionManager.getVisibleRange({
    			containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
    			offset,
    			overscanCount
    		});

    		let updatedItems = [];
    		const totalSize = sizeAndPositionManager.getTotalSize();

    		if (scrollDirection === DIRECTION.VERTICAL) {
    			$$invalidate(3, wrapperStyle = `height:${height}px;width:${width};`);
    			$$invalidate(4, innerStyle = `flex-direction:column;height:${totalSize}px;`);
    		} else {
    			$$invalidate(3, wrapperStyle = `height:${height};width:${width}px`);
    			$$invalidate(4, innerStyle = `width:${totalSize}px;`);
    		}

    		const hasStickyIndices = stickyIndices != null && stickyIndices.length !== 0;

    		if (hasStickyIndices) {
    			for (let i = 0; i < stickyIndices.length; i++) {
    				const index = stickyIndices[i];
    				updatedItems.push({ index, style: getStyle(index, true) });
    			}
    		}

    		if (start !== undefined && stop !== undefined) {
    			for (let index = start; index <= stop; index++) {
    				if (hasStickyIndices && stickyIndices.includes(index)) {
    					continue;
    				}

    				updatedItems.push({ index, style: getStyle(index, false) });
    			}

    			dispatchEvent('itemsUpdated', { startIndex: start, stopIndex: stop });
    		}

    		$$invalidate(2, items = updatedItems);
    	}

    	function scrollTo(value) {
    		$$invalidate(1, wrapper[SCROLL_PROP[scrollDirection]] = value, wrapper);
    	}

    	function recomputeSizes(startIndex = 0) {
    		styleCache = {};
    		sizeAndPositionManager.resetItem(startIndex);
    		refresh();
    	}

    	function getOffsetForIndex(index, align = scrollToAlignment, _itemCount = itemCount) {
    		if (index < 0 || index >= _itemCount) {
    			index = 0;
    		}

    		return sizeAndPositionManager.getUpdatedOffsetForIndex({
    			align,
    			containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
    			currentOffset: state.offset || 0,
    			targetIndex: index
    		});
    	}

    	function handleScroll(event) {
    		const offset = getWrapperOffset();
    		if (offset < 0 || state.offset === offset || event.target !== wrapper) return;

    		$$invalidate(18, state = {
    			offset,
    			scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED
    		});

    		dispatchEvent('afterScroll', { offset, event });
    	}

    	function getWrapperOffset() {
    		return wrapper[SCROLL_PROP[scrollDirection]];
    	}

    	function getEstimatedItemSize() {
    		return estimatedItemSize || typeof itemSize === 'number' && itemSize || 50;
    	}

    	function getStyle(index, sticky) {
    		if (styleCache[index]) return styleCache[index];
    		const { size, offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index);
    		let style;

    		if (scrollDirection === DIRECTION.VERTICAL) {
    			style = `left:0;width:100%;height:${size}px;`;

    			if (sticky) {
    				style += `position:sticky;flex-grow:0;z-index:1;top:0;margin-top:${offset}px;margin-bottom:${-(offset + size)}px;`;
    			} else {
    				style += `position:absolute;top:${offset}px;`;
    			}
    		} else {
    			style = `top:0;width:${size}px;`;

    			if (sticky) {
    				style += `position:sticky;z-index:1;left:0;margin-left:${offset}px;margin-right:${-(offset + size)}px;`;
    			} else {
    				style += `position:absolute;height:100%;left:${offset}px;`;
    			}
    		}

    		return styleCache[index] = style;
    	}

    	const writable_props = [
    		'height',
    		'width',
    		'itemCount',
    		'itemSize',
    		'estimatedItemSize',
    		'stickyIndices',
    		'getKey',
    		'scrollDirection',
    		'scrollOffset',
    		'scrollToIndex',
    		'scrollToAlignment',
    		'overscanCount'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapper = $$value;
    			$$invalidate(1, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('height' in $$props) $$invalidate(5, height = $$props.height);
    		if ('width' in $$props) $$invalidate(6, width = $$props.width);
    		if ('itemCount' in $$props) $$invalidate(7, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(8, itemSize = $$props.itemSize);
    		if ('estimatedItemSize' in $$props) $$invalidate(9, estimatedItemSize = $$props.estimatedItemSize);
    		if ('stickyIndices' in $$props) $$invalidate(10, stickyIndices = $$props.stickyIndices);
    		if ('getKey' in $$props) $$invalidate(0, getKey = $$props.getKey);
    		if ('scrollDirection' in $$props) $$invalidate(11, scrollDirection = $$props.scrollDirection);
    		if ('scrollOffset' in $$props) $$invalidate(12, scrollOffset = $$props.scrollOffset);
    		if ('scrollToIndex' in $$props) $$invalidate(13, scrollToIndex = $$props.scrollToIndex);
    		if ('scrollToAlignment' in $$props) $$invalidate(14, scrollToAlignment = $$props.scrollToAlignment);
    		if ('overscanCount' in $$props) $$invalidate(15, overscanCount = $$props.overscanCount);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		thirdEventArg,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		SizeAndPositionManager,
    		DIRECTION,
    		SCROLL_CHANGE_REASON,
    		SCROLL_PROP,
    		height,
    		width,
    		itemCount,
    		itemSize,
    		estimatedItemSize,
    		stickyIndices,
    		getKey,
    		scrollDirection,
    		scrollOffset,
    		scrollToIndex,
    		scrollToAlignment,
    		overscanCount,
    		dispatchEvent,
    		sizeAndPositionManager,
    		mounted,
    		wrapper,
    		items,
    		state,
    		prevState,
    		prevProps,
    		styleCache,
    		wrapperStyle,
    		innerStyle,
    		propsUpdated,
    		stateUpdated,
    		refresh,
    		scrollTo,
    		recomputeSizes,
    		getOffsetForIndex,
    		handleScroll,
    		getWrapperOffset,
    		getEstimatedItemSize,
    		getStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('height' in $$props) $$invalidate(5, height = $$props.height);
    		if ('width' in $$props) $$invalidate(6, width = $$props.width);
    		if ('itemCount' in $$props) $$invalidate(7, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(8, itemSize = $$props.itemSize);
    		if ('estimatedItemSize' in $$props) $$invalidate(9, estimatedItemSize = $$props.estimatedItemSize);
    		if ('stickyIndices' in $$props) $$invalidate(10, stickyIndices = $$props.stickyIndices);
    		if ('getKey' in $$props) $$invalidate(0, getKey = $$props.getKey);
    		if ('scrollDirection' in $$props) $$invalidate(11, scrollDirection = $$props.scrollDirection);
    		if ('scrollOffset' in $$props) $$invalidate(12, scrollOffset = $$props.scrollOffset);
    		if ('scrollToIndex' in $$props) $$invalidate(13, scrollToIndex = $$props.scrollToIndex);
    		if ('scrollToAlignment' in $$props) $$invalidate(14, scrollToAlignment = $$props.scrollToAlignment);
    		if ('overscanCount' in $$props) $$invalidate(15, overscanCount = $$props.overscanCount);
    		if ('mounted' in $$props) $$invalidate(17, mounted = $$props.mounted);
    		if ('wrapper' in $$props) $$invalidate(1, wrapper = $$props.wrapper);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('state' in $$props) $$invalidate(18, state = $$props.state);
    		if ('prevState' in $$props) prevState = $$props.prevState;
    		if ('prevProps' in $$props) prevProps = $$props.prevProps;
    		if ('styleCache' in $$props) styleCache = $$props.styleCache;
    		if ('wrapperStyle' in $$props) $$invalidate(3, wrapperStyle = $$props.wrapperStyle);
    		if ('innerStyle' in $$props) $$invalidate(4, innerStyle = $$props.innerStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*scrollToIndex, scrollToAlignment, scrollOffset, itemCount, itemSize, estimatedItemSize*/ 29568) {
    			propsUpdated();
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 262144) {
    			stateUpdated();
    		}

    		if ($$self.$$.dirty[0] & /*mounted, height, width, stickyIndices*/ 132192) {
    			if (mounted) recomputeSizes(height); // call scroll.reset;
    		}
    	};

    	return [
    		getKey,
    		wrapper,
    		items,
    		wrapperStyle,
    		innerStyle,
    		height,
    		width,
    		itemCount,
    		itemSize,
    		estimatedItemSize,
    		stickyIndices,
    		scrollDirection,
    		scrollOffset,
    		scrollToIndex,
    		scrollToAlignment,
    		overscanCount,
    		recomputeSizes,
    		mounted,
    		state,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				height: 5,
    				width: 6,
    				itemCount: 7,
    				itemSize: 8,
    				estimatedItemSize: 9,
    				stickyIndices: 10,
    				getKey: 0,
    				scrollDirection: 11,
    				scrollOffset: 12,
    				scrollToIndex: 13,
    				scrollToAlignment: 14,
    				overscanCount: 15,
    				recomputeSizes: 16
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*height*/ ctx[5] === undefined && !('height' in props)) {
    			console.warn("<VirtualList> was created without expected prop 'height'");
    		}

    		if (/*itemCount*/ ctx[7] === undefined && !('itemCount' in props)) {
    			console.warn("<VirtualList> was created without expected prop 'itemCount'");
    		}

    		if (/*itemSize*/ ctx[8] === undefined && !('itemSize' in props)) {
    			console.warn("<VirtualList> was created without expected prop 'itemSize'");
    		}
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemCount() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemCount(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get estimatedItemSize() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set estimatedItemSize(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stickyIndices() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stickyIndices(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getKey() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getKey(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollDirection() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollDirection(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollOffset() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollOffset(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollToIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollToIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollToAlignment() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollToAlignment(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overscanCount() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overscanCount(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get recomputeSizes() {
    		return this.$$.ctx[16];
    	}

    	set recomputeSizes(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/other/TinyVirtualListExample.svelte generated by Svelte v3.46.4 */
    const file$4 = "src/other/TinyVirtualListExample.svelte";

    // (38:4) 
    function create_item_slot(ctx) {
    	let div;
    	let t_value = /*data*/ ctx[0][/*index*/ ctx[4]] + "";
    	let t;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "item");
    			attr_dev(div, "class", "item svelte-wfb8vs");
    			attr_dev(div, "style", div_style_value = /*style*/ ctx[3]);
    			add_location(div, file$4, 37, 4, 877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, index*/ 17 && t_value !== (t_value = /*data*/ ctx[0][/*index*/ ctx[4]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*style*/ 8 && div_style_value !== (div_style_value = /*style*/ ctx[3])) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_item_slot.name,
    		type: "slot",
    		source: "(38:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let svrollbar;
    	let t;
    	let virtuallist;
    	let current;

    	svrollbar = new Svrollbar({
    			props: {
    				viewport: /*viewport*/ ctx[1],
    				contents: /*contents*/ ctx[2]
    			},
    			$$inline: true
    		});

    	virtuallist = new VirtualList({
    			props: {
    				width: "20rem",
    				height: 320,
    				itemCount: /*data*/ ctx[0].length,
    				itemSize: 22,
    				$$slots: {
    					item: [
    						create_item_slot,
    						({ style, index }) => ({ 3: style, 4: index }),
    						({ style, index }) => (style ? 8 : 0) | (index ? 16 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svrollbar.$$.fragment);
    			t = space();
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "wrapper svelte-wfb8vs");
    			add_location(div, file$4, 34, 0, 732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svrollbar, div, null);
    			append_dev(div, t);
    			mount_component(virtuallist, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svrollbar_changes = {};
    			if (dirty & /*viewport*/ 2) svrollbar_changes.viewport = /*viewport*/ ctx[1];
    			if (dirty & /*contents*/ 4) svrollbar_changes.contents = /*contents*/ ctx[2];
    			svrollbar.$set(svrollbar_changes);
    			const virtuallist_changes = {};
    			if (dirty & /*data*/ 1) virtuallist_changes.itemCount = /*data*/ ctx[0].length;

    			if (dirty & /*$$scope, style, data, index*/ 57) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svrollbar.$$.fragment, local);
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svrollbar.$$.fragment, local);
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svrollbar);
    			destroy_component(virtuallist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TinyVirtualListExample', slots, []);
    	let { data } = $$props;
    	let viewport;
    	let contents;

    	onMount(() => {
    		$$invalidate(1, viewport = document.querySelector('.virtual-list-wrapper'));
    		$$invalidate(2, contents = document.querySelector('.virtual-list-inner'));
    	});

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TinyVirtualListExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		VirtualList,
    		Svrollbar,
    		data,
    		viewport,
    		contents
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('viewport' in $$props) $$invalidate(1, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(2, contents = $$props.contents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, viewport, contents];
    }

    class TinyVirtualListExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TinyVirtualListExample",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<TinyVirtualListExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<TinyVirtualListExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<TinyVirtualListExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/resize/DynamicViewportExample.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/resize/DynamicViewportExample.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (16:6) {#each data as d (d)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[8] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-l2mxy3");
    			add_location(div, file$3, 16, 8, 443);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(16:6) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div3;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t4;
    	let svrollbar;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	svrollbar = new Svrollbar({
    			props: {
    				viewport: /*viewport*/ ctx[1],
    				contents: /*contents*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "+";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "-";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(svrollbar.$$.fragment);
    			attr_dev(button0, "class", "svelte-l2mxy3");
    			add_location(button0, file$3, 8, 2, 163);
    			attr_dev(button1, "class", "svelte-l2mxy3");
    			add_location(button1, file$3, 9, 2, 210);
    			attr_dev(div0, "class", "buttons svelte-l2mxy3");
    			add_location(div0, file$3, 7, 0, 139);
    			attr_dev(div1, "class", "contents");
    			add_location(div1, file$3, 14, 4, 363);
    			attr_dev(div2, "class", "viewport svelte-l2mxy3");
    			set_style(div2, "height", /*height*/ ctx[3] + "rem");
    			add_location(div2, file$3, 13, 2, 287);
    			attr_dev(div3, "class", "wrapper svelte-l2mxy3");
    			add_location(div3, file$3, 12, 0, 263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[6](div1);
    			/*div2_binding*/ ctx[7](div2);
    			append_dev(div3, t4);
    			mount_component(svrollbar, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block$2, null, get_each_context$2);
    			}

    			if (!current || dirty & /*height*/ 8) {
    				set_style(div2, "height", /*height*/ ctx[3] + "rem");
    			}

    			const svrollbar_changes = {};
    			if (dirty & /*viewport*/ 2) svrollbar_changes.viewport = /*viewport*/ ctx[1];
    			if (dirty & /*contents*/ 4) svrollbar_changes.contents = /*contents*/ ctx[2];
    			svrollbar.$set(svrollbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svrollbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svrollbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div1_binding*/ ctx[6](null);
    			/*div2_binding*/ ctx[7](null);
    			destroy_component(svrollbar);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DynamicViewportExample', slots, []);
    	let { data } = $$props;
    	let viewport;
    	let contents;
    	let height = 10;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DynamicViewportExample> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(3, height++, height);
    	const click_handler_1 = () => $$invalidate(3, height--, height);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contents = $$value;
    			$$invalidate(2, contents);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			viewport = $$value;
    			$$invalidate(1, viewport);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Svrollbar,
    		data,
    		viewport,
    		contents,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('viewport' in $$props) $$invalidate(1, viewport = $$props.viewport);
    		if ('contents' in $$props) $$invalidate(2, contents = $$props.contents);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		viewport,
    		contents,
    		height,
    		click_handler,
    		click_handler_1,
    		div1_binding,
    		div2_binding
    	];
    }

    class DynamicViewportExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DynamicViewportExample",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<DynamicViewportExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DynamicViewportExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DynamicViewportExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/resize/DynamicSvrollerExample.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/resize/DynamicSvrollerExample.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each data as d (d)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[4] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-fkhud2");
    			add_location(div, file$2, 29, 4, 543);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:2) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (28:0) <Svroller width="20rem" height="{height}rem">
    function create_default_slot$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(28:0) <Svroller width=\\\"20rem\\\" height=\\\"{height}rem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let svroller;
    	let current;
    	let mounted;
    	let dispose;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "" + (/*height*/ ctx[1] + "rem"),
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "+";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "-";
    			t3 = space();
    			create_component(svroller.$$.fragment);
    			attr_dev(button0, "class", "svelte-fkhud2");
    			add_location(button0, file$2, 23, 2, 369);
    			attr_dev(button1, "class", "svelte-fkhud2");
    			add_location(button1, file$2, 24, 2, 416);
    			attr_dev(div, "class", "buttons svelte-fkhud2");
    			add_location(div, file$2, 22, 0, 345);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			insert_dev(target, t3, anchor);
    			mount_component(svroller, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};
    			if (dirty & /*height*/ 2) svroller_changes.height = "" + (/*height*/ ctx[1] + "rem");

    			if (dirty & /*$$scope, data*/ 129) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			destroy_component(svroller, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DynamicSvrollerExample', slots, []);
    	let { data } = $$props;
    	let height = 10;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DynamicSvrollerExample> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, height++, height);
    	const click_handler_1 = () => $$invalidate(1, height--, height);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data, height });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, height, click_handler, click_handler_1];
    }

    class DynamicSvrollerExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DynamicSvrollerExample",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<DynamicSvrollerExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DynamicSvrollerExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DynamicSvrollerExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/visibility/VisibilityToggleExample.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/visibility/VisibilityToggleExample.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (6:2) {#each data as d (d)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let t_value = /*d*/ ctx[1] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-f6x41s");
    			add_location(div, file$1, 6, 4, 161);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*d*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(6:2) {#each data as d (d)}",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Svroller width="20rem" height="20rem">
    function create_default_slot$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*d*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block, each_1_anchor, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(5:0) <Svroller width=\\\"20rem\\\" height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svroller;
    	let current;

    	svroller = new Svroller({
    			props: {
    				width: "20rem",
    				height: "20rem",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svroller.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svroller, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svroller_changes = {};

    			if (dirty & /*$$scope, data*/ 17) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svroller, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VisibilityToggleExample', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VisibilityToggleExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Svroller, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class VisibilityToggleExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisibilityToggleExample",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<VisibilityToggleExample> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<VisibilityToggleExample>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<VisibilityToggleExample>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { window: window_1 } = globals;
    const file = "src/App.svelte";

    // (67:2) {#if visible}
    function create_if_block(ctx) {
    	let a;
    	let span;
    	let img;
    	let img_src_value;
    	let t;
    	let span_intro;
    	let span_outro;
    	let a_intro;
    	let a_outro;
    	let current;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			img = element("img");
    			t = text("\n        View on GitHub");
    			if (!src_url_equal(img.src, img_src_value = "./assets/GitHub-Mark-Light-120px-plus.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "github logo");
    			attr_dev(img, "class", "svelte-lcziwm");
    			add_location(img, file, 74, 8, 2516);
    			add_location(span, file, 73, 6, 2434);
    			attr_dev(a, "href", "https://github.com/daylilyfield/svrollbar");
    			attr_dev(a, "class", "github svelte-lcziwm");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 67, 4, 2282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, img);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (span_outro) span_outro.end(1);
    				span_intro = create_in_transition(span, fade, { delay: 190, duration: 10 });
    				span_intro.start();
    			});

    			add_render_callback(() => {
    				if (a_outro) a_outro.end(1);
    				a_intro = create_in_transition(a, /*receive*/ ctx[5], /*opt*/ ctx[6]);
    				a_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (span_intro) span_intro.invalidate();
    			span_outro = create_out_transition(span, fade, { duration: 10 });
    			if (a_intro) a_intro.invalidate();
    			a_outro = create_out_transition(a, /*send*/ ctx[4], /*opt*/ ctx[6]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching && span_outro) span_outro.end();
    			if (detaching && a_outro) a_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(67:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (82:4) <Svroller width="{width}rem" height="{height}rem" alwaysVisible={true}>
    function create_default_slot_14(ctx) {
    	let h1;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "SVROLLBAR";
    			t1 = space();
    			div = element("div");
    			div.textContent = "simple custom scrollbar made by svelte";
    			attr_dev(h1, "class", "svelte-lcziwm");
    			add_location(h1, file, 82, 6, 2748);
    			attr_dev(div, "class", "caption svelte-lcziwm");
    			add_location(div, file, 83, 6, 2773);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(82:4) <Svroller width=\\\"{width}rem\\\" height=\\\"{height}rem\\\" alwaysVisible={true}>",
    		ctx
    	});

    	return block;
    }

    // (92:8) <Example name="macOS like scrollbar">
    function create_default_slot_13(ctx) {
    	let defaultexample;
    	let current;

    	defaultexample = new DefaultExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(defaultexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(defaultexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(defaultexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(defaultexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(defaultexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(92:8) <Example name=\\\"macOS like scrollbar\\\">",
    		ctx
    	});

    	return block;
    }

    // (95:8) <Example name="Android OS like scrollbar">
    function create_default_slot_12(ctx) {
    	let androidlikeexample;
    	let current;

    	androidlikeexample = new AndroidLikeExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(androidlikeexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(androidlikeexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(androidlikeexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(androidlikeexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(androidlikeexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(95:8) <Example name=\\\"Android OS like scrollbar\\\">",
    		ctx
    	});

    	return block;
    }

    // (98:8) <Example name="Windows OS like scrollbar">
    function create_default_slot_11(ctx) {
    	let windowslikeexample;
    	let current;

    	windowslikeexample = new WindowsLikeExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(windowslikeexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(windowslikeexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(windowslikeexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(windowslikeexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(windowslikeexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(98:8) <Example name=\\\"Windows OS like scrollbar\\\">",
    		ctx
    	});

    	return block;
    }

    // (107:8) <Example name="colored example">
    function create_default_slot_10(ctx) {
    	let coloredexample;
    	let current;

    	coloredexample = new ColoredExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(coloredexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(coloredexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coloredexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coloredexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(coloredexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(107:8) <Example name=\\\"colored example\\\">",
    		ctx
    	});

    	return block;
    }

    // (110:8) <Example name="gradation track example">
    function create_default_slot_9(ctx) {
    	let gradationtrackexample;
    	let current;

    	gradationtrackexample = new GradationTrackExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gradationtrackexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gradationtrackexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gradationtrackexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gradationtrackexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gradationtrackexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(110:8) <Example name=\\\"gradation track example\\\">",
    		ctx
    	});

    	return block;
    }

    // (113:8) <Example name="gradation thumb example">
    function create_default_slot_8(ctx) {
    	let gradationthumbexample;
    	let current;

    	gradationthumbexample = new GradationThumbExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gradationthumbexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gradationthumbexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gradationthumbexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gradationthumbexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gradationthumbexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(113:8) <Example name=\\\"gradation thumb example\\\">",
    		ctx
    	});

    	return block;
    }

    // (122:8) <Example name="crossfade transition example">
    function create_default_slot_7(ctx) {
    	let crossfadeexample;
    	let current;

    	crossfadeexample = new CrossfadeExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(crossfadeexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(crossfadeexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crossfadeexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crossfadeexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(crossfadeexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(122:8) <Example name=\\\"crossfade transition example\\\">",
    		ctx
    	});

    	return block;
    }

    // (125:8) <Example name="fly transition example">
    function create_default_slot_6(ctx) {
    	let flyexample;
    	let current;

    	flyexample = new FlyExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flyexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flyexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flyexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flyexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flyexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(125:8) <Example name=\\\"fly transition example\\\">",
    		ctx
    	});

    	return block;
    }

    // (128:8) <Example name="scale transition example">
    function create_default_slot_5(ctx) {
    	let scaleexample;
    	let current;

    	scaleexample = new ScaleExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scaleexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scaleexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scaleexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scaleexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scaleexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(128:8) <Example name=\\\"scale transition example\\\">",
    		ctx
    	});

    	return block;
    }

    // (137:8) <Example name="external viewport example">
    function create_default_slot_4(ctx) {
    	let externalviewportexample;
    	let current;

    	externalviewportexample = new ExternalViewportExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(externalviewportexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(externalviewportexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(externalviewportexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(externalviewportexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(externalviewportexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(137:8) <Example name=\\\"external viewport example\\\">",
    		ctx
    	});

    	return block;
    }

    // (140:8) <Example name="svelte-tiny-virtual-list example">
    function create_default_slot_3(ctx) {
    	let tinyvirtuallistexample;
    	let current;

    	tinyvirtuallistexample = new TinyVirtualListExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tinyvirtuallistexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tinyvirtuallistexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tinyvirtuallistexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tinyvirtuallistexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tinyvirtuallistexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(140:8) <Example name=\\\"svelte-tiny-virtual-list example\\\">",
    		ctx
    	});

    	return block;
    }

    // (150:8) <Example name="dynamic viewport height example">
    function create_default_slot_2(ctx) {
    	let dynamicviewportexample;
    	let current;

    	dynamicviewportexample = new DynamicViewportExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dynamicviewportexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dynamicviewportexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dynamicviewportexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dynamicviewportexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dynamicviewportexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(150:8) <Example name=\\\"dynamic viewport height example\\\">",
    		ctx
    	});

    	return block;
    }

    // (153:8) <Example name="dynamic svroller height example">
    function create_default_slot_1(ctx) {
    	let dynamicsvrollerexample;
    	let current;

    	dynamicsvrollerexample = new DynamicSvrollerExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dynamicsvrollerexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dynamicsvrollerexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dynamicsvrollerexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dynamicsvrollerexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dynamicsvrollerexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(153:8) <Example name=\\\"dynamic svroller height example\\\">",
    		ctx
    	});

    	return block;
    }

    // (163:8) <Example name="visibility toggle example">
    function create_default_slot(ctx) {
    	let visibilitytoggleexample;
    	let current;

    	visibilitytoggleexample = new VisibilityToggleExample({
    			props: { data: /*data*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(visibilitytoggleexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(visibilitytoggleexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(visibilitytoggleexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(visibilitytoggleexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(visibilitytoggleexample, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(163:8) <Example name=\\\"visibility toggle example\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let svrollbar;
    	let t0;
    	let t1;
    	let div1;
    	let svroller;
    	let t2;
    	let div8;
    	let section0;
    	let h20;
    	let t4;
    	let div2;
    	let example0;
    	let t5;
    	let example1;
    	let t6;
    	let example2;
    	let t7;
    	let section1;
    	let h21;
    	let t9;
    	let div3;
    	let example3;
    	let t10;
    	let example4;
    	let t11;
    	let example5;
    	let t12;
    	let section2;
    	let h22;
    	let t14;
    	let div4;
    	let example6;
    	let t15;
    	let example7;
    	let t16;
    	let example8;
    	let t17;
    	let section3;
    	let h23;
    	let t19;
    	let div5;
    	let example9;
    	let t20;
    	let example10;
    	let t21;
    	let example11;
    	let t22;
    	let section4;
    	let h24;
    	let t24;
    	let div6;
    	let example12;
    	let t25;
    	let example13;
    	let t26;
    	let example14;
    	let t27;
    	let section5;
    	let h25;
    	let t29;
    	let div7;
    	let example15;
    	let t30;
    	let example16;
    	let t31;
    	let example17;
    	let t32;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;

    	svrollbar = new Svrollbar({
    			props: {
    				hideAfter: 1000,
    				vThumbIn: /*vThumbIn*/ ctx[7],
    				vThumbOut: /*vThumbOut*/ ctx[8]
    			},
    			$$inline: true
    		});

    	svrollbar.$on("show", /*show_handler*/ ctx[10]);
    	svrollbar.$on("hide", /*hide_handler*/ ctx[11]);
    	let if_block = /*visible*/ ctx[2] && create_if_block(ctx);

    	svroller = new Svroller({
    			props: {
    				width: "" + (/*width*/ ctx[0] + "rem"),
    				height: "" + (/*height*/ ctx[1] + "rem"),
    				alwaysVisible: true,
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example0 = new Example({
    			props: {
    				name: "macOS like scrollbar",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example1 = new Example({
    			props: {
    				name: "Android OS like scrollbar",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example2 = new Example({
    			props: {
    				name: "Windows OS like scrollbar",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example3 = new Example({
    			props: {
    				name: "colored example",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example4 = new Example({
    			props: {
    				name: "gradation track example",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example5 = new Example({
    			props: {
    				name: "gradation thumb example",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example6 = new Example({
    			props: {
    				name: "crossfade transition example",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example7 = new Example({
    			props: {
    				name: "fly transition example",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example8 = new Example({
    			props: {
    				name: "scale transition example",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example9 = new Example({
    			props: {
    				name: "external viewport example",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example10 = new Example({
    			props: {
    				name: "svelte-tiny-virtual-list example",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example11 = new Example({ props: { name: "" }, $$inline: true });

    	example12 = new Example({
    			props: {
    				name: "dynamic viewport height example",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example13 = new Example({
    			props: {
    				name: "dynamic svroller height example",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example14 = new Example({ props: { name: "" }, $$inline: true });

    	example15 = new Example({
    			props: {
    				name: "visibility toggle example",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	example16 = new Example({ props: { name: "" }, $$inline: true });
    	example17 = new Example({ props: { name: "" }, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(svrollbar.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			create_component(svroller.$$.fragment);
    			t2 = space();
    			div8 = element("div");
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Simple Examples";
    			t4 = space();
    			div2 = element("div");
    			create_component(example0.$$.fragment);
    			t5 = space();
    			create_component(example1.$$.fragment);
    			t6 = space();
    			create_component(example2.$$.fragment);
    			t7 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Style Example";
    			t9 = space();
    			div3 = element("div");
    			create_component(example3.$$.fragment);
    			t10 = space();
    			create_component(example4.$$.fragment);
    			t11 = space();
    			create_component(example5.$$.fragment);
    			t12 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Transition Example";
    			t14 = space();
    			div4 = element("div");
    			create_component(example6.$$.fragment);
    			t15 = space();
    			create_component(example7.$$.fragment);
    			t16 = space();
    			create_component(example8.$$.fragment);
    			t17 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "External Viewport Example";
    			t19 = space();
    			div5 = element("div");
    			create_component(example9.$$.fragment);
    			t20 = space();
    			create_component(example10.$$.fragment);
    			t21 = space();
    			create_component(example11.$$.fragment);
    			t22 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Dynamic Resize Example";
    			t24 = space();
    			div6 = element("div");
    			create_component(example12.$$.fragment);
    			t25 = space();
    			create_component(example13.$$.fragment);
    			t26 = space();
    			create_component(example14.$$.fragment);
    			t27 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "Dynamic Visibility Example";
    			t29 = space();
    			div7 = element("div");
    			create_component(example15.$$.fragment);
    			t30 = space();
    			create_component(example16.$$.fragment);
    			t31 = space();
    			create_component(example17.$$.fragment);
    			t32 = space();
    			footer = element("footer");
    			footer.textContent = "Copyright © 2021-2022 daylilyfield";
    			attr_dev(div0, "class", "svrollbar svelte-lcziwm");
    			add_location(div0, file, 57, 2, 2073);
    			attr_dev(div1, "class", "hero svelte-lcziwm");
    			add_location(div1, file, 80, 2, 2647);
    			attr_dev(h20, "class", "svelte-lcziwm");
    			add_location(h20, file, 89, 6, 2910);
    			attr_dev(div2, "class", "examples svelte-lcziwm");
    			add_location(div2, file, 90, 6, 2941);
    			attr_dev(section0, "class", "svelte-lcziwm");
    			add_location(section0, file, 88, 4, 2894);
    			attr_dev(h21, "class", "svelte-lcziwm");
    			add_location(h21, file, 104, 6, 3334);
    			attr_dev(div3, "class", "examples svelte-lcziwm");
    			add_location(div3, file, 105, 6, 3363);
    			attr_dev(section1, "class", "svelte-lcziwm");
    			add_location(section1, file, 103, 4, 3318);
    			attr_dev(h22, "class", "svelte-lcziwm");
    			add_location(h22, file, 119, 6, 3753);
    			attr_dev(div4, "class", "examples svelte-lcziwm");
    			add_location(div4, file, 120, 6, 3787);
    			attr_dev(section2, "class", "svelte-lcziwm");
    			add_location(section2, file, 118, 4, 3737);
    			attr_dev(h23, "class", "svelte-lcziwm");
    			add_location(h23, file, 134, 6, 4172);
    			attr_dev(div5, "class", "examples svelte-lcziwm");
    			add_location(div5, file, 135, 6, 4213);
    			attr_dev(section3, "class", "svelte-lcziwm");
    			add_location(section3, file, 133, 4, 4156);
    			attr_dev(h24, "class", "svelte-lcziwm");
    			add_location(h24, file, 147, 6, 4549);
    			attr_dev(div6, "class", "examples svelte-lcziwm");
    			add_location(div6, file, 148, 6, 4587);
    			attr_dev(section4, "class", "svelte-lcziwm");
    			add_location(section4, file, 146, 4, 4533);
    			attr_dev(h25, "class", "svelte-lcziwm");
    			add_location(h25, file, 160, 6, 4927);
    			attr_dev(div7, "class", "examples svelte-lcziwm");
    			add_location(div7, file, 161, 6, 4969);
    			attr_dev(section5, "class", "svelte-lcziwm");
    			add_location(section5, file, 159, 4, 4911);
    			attr_dev(div8, "class", "showcase svelte-lcziwm");
    			add_location(div8, file, 87, 2, 2867);
    			add_location(main, file, 56, 0, 2064);
    			attr_dev(footer, "class", "svelte-lcziwm");
    			add_location(footer, file, 172, 0, 5209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(svrollbar, div0, null);
    			append_dev(main, t0);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(svroller, div1, null);
    			append_dev(main, t2);
    			append_dev(main, div8);
    			append_dev(div8, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t4);
    			append_dev(section0, div2);
    			mount_component(example0, div2, null);
    			append_dev(div2, t5);
    			mount_component(example1, div2, null);
    			append_dev(div2, t6);
    			mount_component(example2, div2, null);
    			append_dev(div8, t7);
    			append_dev(div8, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t9);
    			append_dev(section1, div3);
    			mount_component(example3, div3, null);
    			append_dev(div3, t10);
    			mount_component(example4, div3, null);
    			append_dev(div3, t11);
    			mount_component(example5, div3, null);
    			append_dev(div8, t12);
    			append_dev(div8, section2);
    			append_dev(section2, h22);
    			append_dev(section2, t14);
    			append_dev(section2, div4);
    			mount_component(example6, div4, null);
    			append_dev(div4, t15);
    			mount_component(example7, div4, null);
    			append_dev(div4, t16);
    			mount_component(example8, div4, null);
    			append_dev(div8, t17);
    			append_dev(div8, section3);
    			append_dev(section3, h23);
    			append_dev(section3, t19);
    			append_dev(section3, div5);
    			mount_component(example9, div5, null);
    			append_dev(div5, t20);
    			mount_component(example10, div5, null);
    			append_dev(div5, t21);
    			mount_component(example11, div5, null);
    			append_dev(div8, t22);
    			append_dev(div8, section4);
    			append_dev(section4, h24);
    			append_dev(section4, t24);
    			append_dev(section4, div6);
    			mount_component(example12, div6, null);
    			append_dev(div6, t25);
    			mount_component(example13, div6, null);
    			append_dev(div6, t26);
    			mount_component(example14, div6, null);
    			append_dev(div8, t27);
    			append_dev(div8, section5);
    			append_dev(section5, h25);
    			append_dev(section5, t29);
    			append_dev(section5, div7);
    			mount_component(example15, div7, null);
    			append_dev(div7, t30);
    			mount_component(example16, div7, null);
    			append_dev(div7, t31);
    			mount_component(example17, div7, null);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, footer, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onWindowResize*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const svroller_changes = {};
    			if (dirty & /*width*/ 1) svroller_changes.width = "" + (/*width*/ ctx[0] + "rem");
    			if (dirty & /*height*/ 2) svroller_changes.height = "" + (/*height*/ ctx[1] + "rem");

    			if (dirty & /*$$scope*/ 4096) {
    				svroller_changes.$$scope = { dirty, ctx };
    			}

    			svroller.$set(svroller_changes);
    			const example0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example0_changes.$$scope = { dirty, ctx };
    			}

    			example0.$set(example0_changes);
    			const example1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example1_changes.$$scope = { dirty, ctx };
    			}

    			example1.$set(example1_changes);
    			const example2_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example2_changes.$$scope = { dirty, ctx };
    			}

    			example2.$set(example2_changes);
    			const example3_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example3_changes.$$scope = { dirty, ctx };
    			}

    			example3.$set(example3_changes);
    			const example4_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example4_changes.$$scope = { dirty, ctx };
    			}

    			example4.$set(example4_changes);
    			const example5_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example5_changes.$$scope = { dirty, ctx };
    			}

    			example5.$set(example5_changes);
    			const example6_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example6_changes.$$scope = { dirty, ctx };
    			}

    			example6.$set(example6_changes);
    			const example7_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example7_changes.$$scope = { dirty, ctx };
    			}

    			example7.$set(example7_changes);
    			const example8_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example8_changes.$$scope = { dirty, ctx };
    			}

    			example8.$set(example8_changes);
    			const example9_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example9_changes.$$scope = { dirty, ctx };
    			}

    			example9.$set(example9_changes);
    			const example10_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example10_changes.$$scope = { dirty, ctx };
    			}

    			example10.$set(example10_changes);
    			const example12_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example12_changes.$$scope = { dirty, ctx };
    			}

    			example12.$set(example12_changes);
    			const example13_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example13_changes.$$scope = { dirty, ctx };
    			}

    			example13.$set(example13_changes);
    			const example15_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				example15_changes.$$scope = { dirty, ctx };
    			}

    			example15.$set(example15_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svrollbar.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(svroller.$$.fragment, local);
    			transition_in(example0.$$.fragment, local);
    			transition_in(example1.$$.fragment, local);
    			transition_in(example2.$$.fragment, local);
    			transition_in(example3.$$.fragment, local);
    			transition_in(example4.$$.fragment, local);
    			transition_in(example5.$$.fragment, local);
    			transition_in(example6.$$.fragment, local);
    			transition_in(example7.$$.fragment, local);
    			transition_in(example8.$$.fragment, local);
    			transition_in(example9.$$.fragment, local);
    			transition_in(example10.$$.fragment, local);
    			transition_in(example11.$$.fragment, local);
    			transition_in(example12.$$.fragment, local);
    			transition_in(example13.$$.fragment, local);
    			transition_in(example14.$$.fragment, local);
    			transition_in(example15.$$.fragment, local);
    			transition_in(example16.$$.fragment, local);
    			transition_in(example17.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svrollbar.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(svroller.$$.fragment, local);
    			transition_out(example0.$$.fragment, local);
    			transition_out(example1.$$.fragment, local);
    			transition_out(example2.$$.fragment, local);
    			transition_out(example3.$$.fragment, local);
    			transition_out(example4.$$.fragment, local);
    			transition_out(example5.$$.fragment, local);
    			transition_out(example6.$$.fragment, local);
    			transition_out(example7.$$.fragment, local);
    			transition_out(example8.$$.fragment, local);
    			transition_out(example9.$$.fragment, local);
    			transition_out(example10.$$.fragment, local);
    			transition_out(example11.$$.fragment, local);
    			transition_out(example12.$$.fragment, local);
    			transition_out(example13.$$.fragment, local);
    			transition_out(example14.$$.fragment, local);
    			transition_out(example15.$$.fragment, local);
    			transition_out(example16.$$.fragment, local);
    			transition_out(example17.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svrollbar);
    			if (if_block) if_block.d();
    			destroy_component(svroller);
    			destroy_component(example0);
    			destroy_component(example1);
    			destroy_component(example2);
    			destroy_component(example3);
    			destroy_component(example4);
    			destroy_component(example5);
    			destroy_component(example6);
    			destroy_component(example7);
    			destroy_component(example8);
    			destroy_component(example9);
    			destroy_component(example10);
    			destroy_component(example11);
    			destroy_component(example12);
    			destroy_component(example13);
    			destroy_component(example14);
    			destroy_component(example15);
    			destroy_component(example16);
    			destroy_component(example17);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const data = characters;
    	const [send, receive] = crossfade({ duration: 300, fallback: scale });
    	let width = 0;
    	let height = 0;
    	const opt = { key: 'fab' };
    	const vThumbIn = node => receive(node, opt);
    	const vThumbOut = node => send(node, opt);
    	let visible = true;

    	function onWindowResize() {
    		if (window.matchMedia('(max-width:576px)').matches) {
    			$$invalidate(0, width = 18);
    			$$invalidate(1, height = 4);
    		} else if (window.matchMedia('(max-width:768px)').matches) {
    			$$invalidate(0, width = 26);
    			$$invalidate(1, height = 5);
    		} else if (window.matchMedia('(max-width:1200px)').matches) {
    			$$invalidate(0, width = 29);
    			$$invalidate(1, height = 5.5);
    		} else {
    			$$invalidate(0, width = 33);
    			$$invalidate(1, height = 6.5);
    		}
    	}

    	onMount(() => {
    		onWindowResize();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const show_handler = () => $$invalidate(2, visible = false);
    	const hide_handler = () => $$invalidate(2, visible = true);

    	$$self.$capture_state = () => ({
    		crossfade,
    		fade,
    		scale,
    		characters,
    		DefaultExample,
    		AndroidLikeExample,
    		Example,
    		WindowsLikeExample,
    		ColoredExample,
    		GradationThumbExample,
    		GradationTrackExample,
    		FlyExample,
    		CrossfadeExample,
    		ScaleExample,
    		ExternalViewportExample,
    		TinyVirtualListExample,
    		Svroller,
    		DynamicViewportExample,
    		DynamicSvrollerExample,
    		onMount,
    		Svrollbar,
    		VisibilityToggleExample,
    		data,
    		send,
    		receive,
    		width,
    		height,
    		opt,
    		vThumbIn,
    		vThumbOut,
    		visible,
    		onWindowResize
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		width,
    		height,
    		visible,
    		data,
    		send,
    		receive,
    		opt,
    		vThumbIn,
    		vThumbOut,
    		onWindowResize,
    		show_handler,
    		hide_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
