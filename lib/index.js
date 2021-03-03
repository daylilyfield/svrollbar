(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.svrollbar = {}));
}(this, (function (exports) { 'use strict';

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
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/Svrollbar.svelte generated by Svelte v3.34.0 */

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-2i9xz-style";
    	style.textContent = ".v-track.svelte-2i9xz{position:absolute;top:0;right:0;width:var(--svrollbar-track-width, 8px);opacity:var(--svrollbar-track-opacity, 0);background-color:var(--svrollbar-track-color, initial)}.v-thumb.svelte-2i9xz{position:relative;margin:0 auto;border-radius:0.25rem;width:var(--svrollbar-thumb-width, 8px);opacity:var(--svrollbar-thumb-opacity, 0.5);background-color:var(--svrollbar-thumb-color, #454545)}";
    	append(document.head, style);
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "v-thumb svelte-2i9xz");
    			set_style(div0, "height", /*thumbHeight*/ ctx[1] + "px");
    			set_style(div0, "top", /*thumbTop*/ ctx[2] + "px");
    			attr(div1, "class", "v-track svelte-2i9xz");
    			set_style(div1, "height", /*trackHeight*/ ctx[0] + "px");
    			set_style(div1, "opacity", /*$opacity*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*thumbHeight*/ 2) {
    				set_style(div0, "height", /*thumbHeight*/ ctx[1] + "px");
    			}

    			if (dirty & /*thumbTop*/ 4) {
    				set_style(div0, "top", /*thumbTop*/ ctx[2] + "px");
    			}

    			if (dirty & /*trackHeight*/ 1) {
    				set_style(div1, "height", /*trackHeight*/ ctx[0] + "px");
    			}

    			if (dirty & /*$opacity*/ 8) {
    				set_style(div1, "opacity", /*$opacity*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let wholeHeight;
    	let scrollTop;
    	let trackHeight;
    	let thumbHeight;
    	let thumbTop;
    	let listened;
    	let observed;
    	let $opacity;
    	let { viewport } = $$props;
    	let { contents } = $$props;
    	const opacity = tweened(0, { duration: 300, easing: cubicOut });
    	component_subscribe($$self, opacity, value => $$invalidate(3, $opacity = value));

    	function listen(viewport) {
    		listened?.();
    		let timer = 0;

    		const onScroll = () => {
    			if (timer) {
    				window.clearTimeout(timer);
    				timer = 0;
    			}

    			opacity.set(1);
    			$$invalidate(8, scrollTop = viewport?.scrollTop ?? 0);
    		};

    		const onMouseLeave = () => {
    			timer = window.setTimeout(
    				() => {
    					opacity.set(0);
    				},
    				1000
    			);
    		};

    		viewport.addEventListener("scroll", onScroll, { passive: true });
    		viewport.addEventListener("mouseleave", onMouseLeave);

    		return () => {
    			viewport.removeEventListener("scroll", onScroll);
    			viewport.removeEventListener("mouseleave", onMouseLeave);
    		};
    	}

    	function observe(contents) {
    		observed?.();

    		if (typeof window.ResizeObserver === "undefined") {
    			throw new Error("window.ResizeObserver is missing.");
    		}

    		const observer = new ResizeObserver(entries => {
    				for (const _entry of entries) {
    					$$invalidate(7, wholeHeight = viewport?.scrollHeight ?? 0);
    				}
    			});

    		observer.observe(contents);

    		return () => {
    			observer.unobserve(contents);
    			observer.disconnect();
    		};
    	}

    	$$self.$$set = $$props => {
    		if ("viewport" in $$props) $$invalidate(5, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(6, contents = $$props.contents);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewport*/ 32) {
    			$$invalidate(7, wholeHeight = viewport?.scrollHeight ?? 0);
    		}

    		if ($$self.$$.dirty & /*viewport*/ 32) {
    			$$invalidate(8, scrollTop = viewport?.scrollTop ?? 0);
    		}

    		if ($$self.$$.dirty & /*viewport*/ 32) {
    			$$invalidate(0, trackHeight = viewport?.offsetHeight ?? 0);
    		}

    		if ($$self.$$.dirty & /*trackHeight, wholeHeight*/ 129) {
    			$$invalidate(1, thumbHeight = trackHeight / wholeHeight * trackHeight ?? 0);
    		}

    		if ($$self.$$.dirty & /*scrollTop, wholeHeight, trackHeight*/ 385) {
    			$$invalidate(2, thumbTop = scrollTop / wholeHeight * trackHeight ?? 0);
    		}

    		if ($$self.$$.dirty & /*viewport*/ 32) {
    			listened = viewport ? listen(viewport) : null;
    		}

    		if ($$self.$$.dirty & /*contents*/ 64) {
    			observed = contents ? observe(contents) : null;
    		}
    	};

    	return [
    		trackHeight,
    		thumbHeight,
    		thumbTop,
    		$opacity,
    		opacity,
    		viewport,
    		contents,
    		wholeHeight,
    		scrollTop
    	];
    }

    class Svrollbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-2i9xz-style")) add_css$1();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { viewport: 5, contents: 6 });
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
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	svrollbar = new Svrollbar({
    			props: {
    				viewport: /*viewport*/ ctx[2],
    				contents: /*contents*/ ctx[3]
    			}
    		});

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

    			/*div0_binding*/ ctx[6](div0);
    			/*div1_binding*/ ctx[7](div1);
    			append(div2, t);
    			mount_component(svrollbar, div2, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*width*/ 1) {
    				set_style(div1, "width", /*width*/ ctx[0]);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				set_style(div1, "height", /*height*/ ctx[1]);
    			}

    			const svrollbar_changes = {};
    			if (dirty & /*viewport*/ 4) svrollbar_changes.viewport = /*viewport*/ ctx[2];
    			if (dirty & /*contents*/ 8) svrollbar_changes.contents = /*contents*/ ctx[3];
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
    			/*div0_binding*/ ctx[6](null);
    			/*div1_binding*/ ctx[7](null);
    			destroy_component(svrollbar);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { width = "10rem" } = $$props;
    	let { height = "10rem" } = $$props;
    	let viewport;
    	let contents;

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(3, contents);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(2, viewport);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	return [width, height, viewport, contents, $$scope, slots, div0_binding, div1_binding];
    }

    class Svroller extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-d3wfcb-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { width: 0, height: 1 });
    	}
    }

    exports.Svrollbar = Svrollbar;
    exports.Svroller = Svroller;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
