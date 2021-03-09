function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
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
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
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
    node.style.setProperty(key, value, important ? 'important' : '');
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
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
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
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
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
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
        callbacks.slice().forEach(fn => fn(event));
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
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
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
    flushing = false;
    seen_callbacks.clear();
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
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
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

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

/* src/Svrollbar.svelte generated by Svelte v3.34.0 */

const { document: document_1 } = globals;

function add_css$1() {
	var style = element("style");
	style.id = "svelte-3wqqg7-style";
	style.textContent = ".v-scrollbar.svelte-3wqqg7{position:absolute;top:0;right:0;width:var(--svrollbar-track-width, 10px)}.v-track.svelte-3wqqg7{position:absolute;top:0;right:0;border-radius:var(--svrollbar-track-radius, initial);width:var(--svrollbar-track-width, 10px);opacity:var(--svrollbar-track-opacity, 1);background:var(--svrollbar-track-background, initial);box-shadow:var(--svrollbar-track-shadow, initial)}.v-thumb.svelte-3wqqg7{position:relative;margin:0 auto;border-radius:var(--svrollbar-thumb-radius, 0.25rem);width:var(--svrollbar-thumb-width, 6px);opacity:var(--svrollbar-thumb-opacity, 0.5);background:var(--svrollbar-thumb-background, gray);box-shadow:var(--svrollbar-thumb-shadow, initial)}";
	append(document_1.head, style);
}

// (230:0) {#if visible}
function create_if_block(ctx) {
	let div2;
	let div0;
	let div0_intro;
	let div0_outro;
	let t;
	let div1;
	let div1_intro;
	let div1_outro;
	let current;

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			t = space();
			div1 = element("div");
			attr(div0, "class", "v-track svelte-3wqqg7");
			set_style(div0, "height", /*trackHeight*/ ctx[6] + "px");
			attr(div1, "class", "v-thumb svelte-3wqqg7");
			set_style(div1, "height", /*thumbHeight*/ ctx[8] + "px");
			set_style(div1, "top", /*thumbTop*/ ctx[9] + "px");
			attr(div2, "class", "v-scrollbar svelte-3wqqg7");
			set_style(div2, "height", /*trackHeight*/ ctx[6] + "px");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			/*div0_binding*/ ctx[16](div0);
			append(div2, t);
			append(div2, div1);
			/*div1_binding*/ ctx[17](div1);
			current = true;
		},
		p(ctx, dirty) {
			if (!current || dirty[0] & /*trackHeight*/ 64) {
				set_style(div0, "height", /*trackHeight*/ ctx[6] + "px");
			}

			if (!current || dirty[0] & /*thumbHeight*/ 256) {
				set_style(div1, "height", /*thumbHeight*/ ctx[8] + "px");
			}

			if (!current || dirty[0] & /*thumbTop*/ 512) {
				set_style(div1, "top", /*thumbTop*/ ctx[9] + "px");
			}

			if (!current || dirty[0] & /*trackHeight*/ 64) {
				set_style(div2, "height", /*trackHeight*/ ctx[6] + "px");
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (div0_outro) div0_outro.end(1);
				if (!div0_intro) div0_intro = create_in_transition(div0, /*vTrackIn*/ ctx[0], {});
				div0_intro.start();
			});

			add_render_callback(() => {
				if (div1_outro) div1_outro.end(1);
				if (!div1_intro) div1_intro = create_in_transition(div1, /*vThumbIn*/ ctx[2], {});
				div1_intro.start();
			});

			current = true;
		},
		o(local) {
			if (div0_intro) div0_intro.invalidate();
			div0_outro = create_out_transition(div0, /*vTrackOut*/ ctx[1], {});
			if (div1_intro) div1_intro.invalidate();
			div1_outro = create_out_transition(div1, /*vThumbOut*/ ctx[3], {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			/*div0_binding*/ ctx[16](null);
			if (detaching && div0_outro) div0_outro.end();
			/*div1_binding*/ ctx[17](null);
			if (detaching && div1_outro) div1_outro.end();
		}
	};
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*visible*/ ctx[7] && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*visible*/ ctx[7]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*visible*/ 128) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
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
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let teardownViewport;
	let teardownContents;
	let teardownTrack;
	let teardownThumb;
	let wholeHeight;
	let scrollTop;
	let trackHeight;
	let thumbHeight;
	let thumbTop;
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

	function setupViewport(viewport) {
		if (!viewport) return;
		teardownViewport?.();
		viewport.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			viewport.removeEventListener("scroll", onScroll);
		};
	}

	function setupTrack(track) {
		if (!track) return;
		teardownTrack?.();
		vTrack.addEventListener("mouseenter", onTrackEnter);
		vTrack.addEventListener("mouseleave", onTrackLeave);

		return () => {
			vTrack.removeEventListener("mouseenter", onTrackEnter);
			vTrack.removeEventListener("mouseleave", onTrackLeave);
		};
	}

	function setupThumb(thumb) {
		if (!thumb) return;
		teardownThumb?.();
		vThumb.addEventListener("mousedown", onThumbDown);
		vThumb.addEventListener("touchstart", onThumbDown);

		return () => {
			vThumb.removeEventListener("mousedown", onThumbDown);
			vThumb.removeEventListener("touchstart", onThumbDown);
		};
	}

	function setupContents(contents) {
		if (!contents) return;
		teardownContents?.();

		if (typeof window.ResizeObserver === "undefined") {
			throw new Error("window.ResizeObserver is missing.");
		}

		const observer = new ResizeObserver(entries => {
				for (const _entry of entries) {
					$$invalidate(14, wholeHeight = viewport?.scrollHeight ?? 0);
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
				dispatch("hide");
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
		$$invalidate(15, scrollTop = viewport?.scrollTop ?? 0);
		dispatch("show");
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

		document.addEventListener("mousemove", onThumbMove);
		document.addEventListener("touchmove", onThumbMove);
		document.addEventListener("mouseup", onThumbUp);
		document.addEventListener("touchend", onThumbUp);
	}

	function onThumbMove(event) {
		event.stopPropagation();
		event.preventDefault();

		const clientY = event.changedTouches
		? event.changedTouches[0].clientY
		: event.clientY;

		const ratio = wholeHeight / trackHeight;
		$$invalidate(10, viewport.scrollTop = startTop + ratio * (clientY - startY), viewport);
	}

	function onThumbUp(event) {
		event.stopPropagation();
		event.preventDefault();
		startTop = 0;
		startY = 0;
		document.removeEventListener("mousemove", onThumbMove);
		document.removeEventListener("touchmove", onThumbMove);
		document.removeEventListener("mouseup", onThumbUp);
		document.removeEventListener("touchend", onThumbUp);
	}

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			vTrack = $$value;
			$$invalidate(4, vTrack);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			vThumb = $$value;
			$$invalidate(5, vThumb);
		});
	}

	$$self.$$set = $$props => {
		if ("viewport" in $$props) $$invalidate(10, viewport = $$props.viewport);
		if ("contents" in $$props) $$invalidate(11, contents = $$props.contents);
		if ("hideAfter" in $$props) $$invalidate(12, hideAfter = $$props.hideAfter);
		if ("alwaysVisible" in $$props) $$invalidate(13, alwaysVisible = $$props.alwaysVisible);
		if ("vTrackIn" in $$props) $$invalidate(0, vTrackIn = $$props.vTrackIn);
		if ("vTrackOut" in $$props) $$invalidate(1, vTrackOut = $$props.vTrackOut);
		if ("vThumbIn" in $$props) $$invalidate(2, vThumbIn = $$props.vThumbIn);
		if ("vThumbOut" in $$props) $$invalidate(3, vThumbOut = $$props.vThumbOut);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*viewport*/ 1024) {
			teardownViewport = setupViewport(viewport);
		}

		if ($$self.$$.dirty[0] & /*contents*/ 2048) {
			teardownContents = setupContents(contents);
		}

		if ($$self.$$.dirty[0] & /*vTrack*/ 16) {
			teardownTrack = setupTrack(vTrack);
		}

		if ($$self.$$.dirty[0] & /*vThumb*/ 32) {
			teardownThumb = setupThumb(vThumb);
		}

		if ($$self.$$.dirty[0] & /*viewport*/ 1024) {
			$$invalidate(14, wholeHeight = viewport?.scrollHeight ?? 0);
		}

		if ($$self.$$.dirty[0] & /*viewport*/ 1024) {
			$$invalidate(15, scrollTop = viewport?.scrollTop ?? 0);
		}

		if ($$self.$$.dirty[0] & /*viewport*/ 1024) {
			$$invalidate(6, trackHeight = viewport?.offsetHeight ?? 0);
		}

		if ($$self.$$.dirty[0] & /*trackHeight, wholeHeight*/ 16448) {
			$$invalidate(8, thumbHeight = trackHeight / wholeHeight * trackHeight ?? 0);
		}

		if ($$self.$$.dirty[0] & /*scrollTop, wholeHeight, trackHeight*/ 49216) {
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
		thumbHeight,
		thumbTop,
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

class Svrollbar extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-3wqqg7-style")) add_css$1();

		init(
			this,
			options,
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{
				viewport: 10,
				contents: 11,
				hideAfter: 12,
				alwaysVisible: 13,
				vTrackIn: 0,
				vTrackOut: 1,
				vThumbIn: 2,
				vThumbOut: 3
			},
			[-1, -1]
		);
	}
}

/* src/Svroller.svelte generated by Svelte v3.34.0 */

function add_css() {
	var style = element("style");
	style.id = "svelte-d3wfcb-style";
	style.textContent = ".wrapper.svelte-d3wfcb{position:relative}.viewport.svelte-d3wfcb{position:relative;overflow:scroll;box-sizing:border-box;-ms-overflow-style:none;scrollbar-width:none}.viewport.svelte-d3wfcb::-webkit-scrollbar{display:none}";
	append(document.head, style);
}

function create_fragment(ctx) {
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
			}
		});

	svrollbar.$on("show", /*show_handler*/ ctx[14]);
	svrollbar.$on("hide", /*hide_handler*/ ctx[15]);

	return {
		c() {
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			if (default_slot) default_slot.c();
			t = space();
			create_component(svrollbar.$$.fragment);
			attr(div0, "class", "contents");
			attr(div1, "class", "viewport svelte-d3wfcb");
			set_style(div1, "width", /*width*/ ctx[0]);
			set_style(div1, "height", /*height*/ ctx[1]);
			attr(div2, "class", "wrapper svelte-d3wfcb");
			set_style(div2, "width", /*width*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div1);
			append(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			/*div0_binding*/ ctx[12](div0);
			/*div1_binding*/ ctx[13](div1);
			append(div2, t);
			mount_component(svrollbar, div2, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 1024) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
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
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			transition_in(svrollbar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			transition_out(svrollbar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if (default_slot) default_slot.d(detaching);
			/*div0_binding*/ ctx[12](null);
			/*div1_binding*/ ctx[13](null);
			destroy_component(svrollbar);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { width = "10rem" } = $$props;
	let { height = "10rem" } = $$props;
	let { hideAfter = 1000 } = $$props;
	let { alwaysVisible = false } = $$props;
	let { vTrackIn = node => fade(node, { duration: 100 }) } = $$props;
	let { vTrackOut = node => fade(node, { duration: 300 }) } = $$props;
	let { vThumbIn = node => fade(node, { duration: 100 }) } = $$props;
	let { vThumbOut = node => fade(node, { duration: 300 }) } = $$props;
	let viewport;
	let contents;

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			contents = $$value;
			$$invalidate(9, contents);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			viewport = $$value;
			$$invalidate(8, viewport);
		});
	}

	function show_handler(event) {
		bubble($$self, event);
	}

	function hide_handler(event) {
		bubble($$self, event);
	}

	$$self.$$set = $$props => {
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("hideAfter" in $$props) $$invalidate(2, hideAfter = $$props.hideAfter);
		if ("alwaysVisible" in $$props) $$invalidate(3, alwaysVisible = $$props.alwaysVisible);
		if ("vTrackIn" in $$props) $$invalidate(4, vTrackIn = $$props.vTrackIn);
		if ("vTrackOut" in $$props) $$invalidate(5, vTrackOut = $$props.vTrackOut);
		if ("vThumbIn" in $$props) $$invalidate(6, vThumbIn = $$props.vThumbIn);
		if ("vThumbOut" in $$props) $$invalidate(7, vThumbOut = $$props.vThumbOut);
		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

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

class Svroller extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-d3wfcb-style")) add_css();

		init(this, options, instance, create_fragment, safe_not_equal, {
			width: 0,
			height: 1,
			hideAfter: 2,
			alwaysVisible: 3,
			vTrackIn: 4,
			vTrackOut: 5,
			vThumbIn: 6,
			vThumbOut: 7
		});
	}
}

export { Svrollbar, Svroller };
