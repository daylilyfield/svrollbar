function M(){}const Z=t=>t;function pt(t,e){for(const n in e)t[n]=e[n];return t}function tt(t){return t()}function V(){return Object.create(null)}function v(t){t.forEach(tt)}function J(t){return typeof t=="function"}function Bt(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let T;function Ft(t,e){return T||(T=document.createElement("a")),T.href=e,t===T.href}function gt(t){return Object.keys(t).length===0}function Ht(t,e,n,i){if(t){const s=et(t,e,n,i);return t[0](s)}}function et(t,e,n,i){return t[1]&&i?pt(n.ctx.slice(),t[1](i(e))):n.ctx}function It(t,e,n,i){if(t[2]&&i){const s=t[2](i(n));if(e.dirty===void 0)return s;if(typeof s=="object"){const l=[],r=Math.max(e.dirty.length,s.length);for(let o=0;o<r;o+=1)l[o]=e.dirty[o]|s[o];return l}return e.dirty|s}return e.dirty}function Wt(t,e,n,i,s,l){if(s){const r=et(e,n,i,l);t.p(r,s)}}function Gt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}const nt=typeof window!="undefined";let it=nt?()=>window.performance.now():()=>Date.now(),K=nt?t=>requestAnimationFrame(t):M;const k=new Set;function st(t){k.forEach(e=>{e.c(t)||(k.delete(e),e.f())}),k.size!==0&&K(st)}function rt(t){let e;return k.size===0&&K(st),{promise:new Promise(n=>{k.add(e={c:t,f:n})}),abort(){k.delete(e)}}}let F=!1;function wt(){F=!0}function xt(){F=!1}function $t(t,e,n,i){for(;t<e;){const s=t+(e-t>>1);n(s)<=i?t=s+1:e=s}return t}function bt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let a=0;a<e.length;a++){const u=e[a];u.claim_order!==void 0&&c.push(u)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let s=0;for(let c=0;c<e.length;c++){const a=e[c].claim_order,u=(s>0&&e[n[s]].claim_order<=a?s+1:$t(1,s,_=>e[n[_]].claim_order,a))-1;i[c]=n[u]+1;const f=u+1;n[f]=c,s=Math.max(f,s)}const l=[],r=[];let o=e.length-1;for(let c=n[s]+1;c!=0;c=i[c-1]){for(l.push(e[c-1]);o>=c;o--)r.push(e[o]);o--}for(;o>=0;o--)r.push(e[o]);l.reverse(),r.sort((c,a)=>c.claim_order-a.claim_order);for(let c=0,a=0;c<r.length;c++){for(;a<l.length&&r[c].claim_order>=l[a].claim_order;)a++;const u=a<l.length?l[a]:null;t.insertBefore(r[c],u)}}function kt(t,e){t.appendChild(e)}function ct(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function vt(t){const e=lt("style");return Et(ct(t),e),e.sheet}function Et(t,e){kt(t.head||t,e)}function Nt(t,e){if(F){for(bt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function Jt(t,e,n){F&&!n?Nt(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function St(t){t.parentNode.removeChild(t)}function lt(t){return document.createElement(t)}function Q(t){return document.createTextNode(t)}function Kt(){return Q(" ")}function Qt(){return Q("")}function Ut(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Vt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function jt(t){return Array.from(t.childNodes)}function At(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function ot(t,e,n,i,s=!1){At(t);const l=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s||(t.claim_info.last_index=r),o}}for(let r=t.claim_info.last_index-1;r>=0;r--){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=r,o}}return i()})();return l.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,l}function Ct(t,e,n,i){return ot(t,s=>s.nodeName===e,s=>{const l=[];for(let r=0;r<s.attributes.length;r++){const o=s.attributes[r];n[o.name]||l.push(o.name)}l.forEach(r=>s.removeAttribute(r))},()=>i(e))}function Xt(t,e,n){return Ct(t,e,n,lt)}function Mt(t,e){return ot(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>Q(e),!0)}function Yt(t){return Mt(t," ")}function Zt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function te(t,e,n,i){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function ee(t,e,n){t.classList[n?"add":"remove"](e)}function at(t,e,n=!1){const i=document.createEvent("CustomEvent");return i.initCustomEvent(t,n,!1,e),i}const L=new Map;let z=0;function Dt(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function Rt(t,e){const n={stylesheet:vt(e),rules:{}};return L.set(t,n),n}function ft(t,e,n,i,s,l,r,o=0){const c=16.666/i;let a=`{
`;for(let y=0;y<=1;y+=c){const x=e+(n-e)*l(y);a+=y*100+`%{${r(x,1-x)}}
`}const u=a+`100% {${r(n,1-n)}}
}`,f=`__svelte_${Dt(u)}_${o}`,_=ct(t),{stylesheet:d,rules:h}=L.get(_)||Rt(_,t);h[f]||(h[f]=!0,d.insertRule(`@keyframes ${f} ${u}`,d.cssRules.length));const p=t.style.animation||"";return t.style.animation=`${p?`${p}, `:""}${f} ${i}ms linear ${s}ms 1 both`,z+=1,f}function W(t,e){const n=(t.style.animation||"").split(", "),i=n.filter(e?l=>l.indexOf(e)<0:l=>l.indexOf("__svelte")===-1),s=n.length-i.length;s&&(t.style.animation=i.join(", "),z-=s,z||Tt())}function Tt(){K(()=>{z||(L.forEach(t=>{const{stylesheet:e}=t;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.rules={}}),L.clear())})}let A;function j(t){A=t}function D(){if(!A)throw new Error("Function called outside component initialization");return A}function ne(t){D().$$.on_mount.push(t)}function ie(t){D().$$.after_update.push(t)}function se(t){D().$$.on_destroy.push(t)}function re(){const t=D();return(e,n)=>{const i=t.$$.callbacks[e];if(i){const s=at(e,n);i.slice().forEach(l=>{l.call(t,s)})}}}function ce(t,e){D().$$.context.set(t,e)}function le(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach(i=>i.call(this,e))}const S=[],X=[],P=[],Y=[],ut=Promise.resolve();let G=!1;function _t(){G||(G=!0,ut.then(dt))}function oe(){return _t(),ut}function C(t){P.push(t)}const I=new Set;let O=0;function dt(){const t=A;do{for(;O<S.length;){const e=S[O];O++,j(e),Ot(e.$$)}for(j(null),S.length=0,O=0;X.length;)X.pop()();for(let e=0;e<P.length;e+=1){const n=P[e];I.has(n)||(I.add(n),n())}P.length=0}while(S.length);for(;Y.length;)Y.pop()();G=!1,I.clear(),j(t)}function Ot(t){if(t.fragment!==null){t.update(),v(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(C)}}let N;function ht(){return N||(N=Promise.resolve(),N.then(()=>{N=null})),N}function B(t,e,n){t.dispatchEvent(at(`${e?"intro":"outro"}${n}`))}const q=new Set;let $;function ae(){$={r:0,c:[],p:$}}function fe(){$.r||v($.c),$=$.p}function mt(t,e){t&&t.i&&(q.delete(t),t.i(e))}function Pt(t,e,n,i){if(t&&t.o){if(q.has(t))return;q.add(t),$.c.push(()=>{q.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}}const yt={duration:0};function ue(t,e,n){let i=e(t,n),s=!1,l,r,o=0;function c(){l&&W(t,l)}function a(){const{delay:f=0,duration:_=300,easing:d=Z,tick:h=M,css:p}=i||yt;p&&(l=ft(t,0,1,_,f,d,p,o++)),h(0,1);const y=it()+f,x=y+_;r&&r.abort(),s=!0,C(()=>B(t,!0,"start")),r=rt(b=>{if(s){if(b>=x)return h(1,0),B(t,!0,"end"),c(),s=!1;if(b>=y){const E=d((b-y)/_);h(E,1-E)}}return s})}let u=!1;return{start(){u||(u=!0,W(t),J(i)?(i=i(),ht().then(a)):a())},invalidate(){u=!1},end(){s&&(c(),s=!1)}}}function _e(t,e,n){let i=e(t,n),s=!0,l;const r=$;r.r+=1;function o(){const{delay:c=0,duration:a=300,easing:u=Z,tick:f=M,css:_}=i||yt;_&&(l=ft(t,1,0,a,c,u,_));const d=it()+c,h=d+a;C(()=>B(t,!1,"start")),rt(p=>{if(s){if(p>=h)return f(0,1),B(t,!1,"end"),--r.r||v(r.c),!1;if(p>=d){const y=u((p-d)/a);f(1-y,y)}}return s})}return J(i)?ht().then(()=>{i=i(),o()}):o(),{end(c){c&&i.tick&&i.tick(1,0),s&&(l&&W(t,l),s=!1)}}}const de=typeof window!="undefined"?window:typeof globalThis!="undefined"?globalThis:global;function he(t,e){t.d(1),e.delete(t.key)}function me(t,e){Pt(t,1,1,()=>{e.delete(t.key)})}function ye(t,e,n,i,s,l,r,o,c,a,u,f){let _=t.length,d=l.length,h=_;const p={};for(;h--;)p[t[h].key]=h;const y=[],x=new Map,b=new Map;for(h=d;h--;){const m=f(s,l,h),g=n(m);let w=r.get(g);w?i&&w.p(m,e):(w=a(g,m),w.c()),x.set(g,y[h]=w),g in p&&b.set(g,Math.abs(h-p[g]))}const E=new Set,U=new Set;function H(m){mt(m,1),m.m(o,u),r.set(m.key,m),u=m.first,d--}for(;_&&d;){const m=y[d-1],g=t[_-1],w=m.key,R=g.key;m===g?(u=m.first,_--,d--):x.has(R)?!r.has(w)||E.has(w)?H(m):U.has(R)?_--:b.get(w)>b.get(R)?(U.add(w),H(m)):(E.add(R),_--):(c(g,r),_--)}for(;_--;){const m=t[_];x.has(m.key)||c(m,r)}for(;d;)H(y[d-1]);return y}function pe(t,e){const n={},i={},s={$$scope:1};let l=t.length;for(;l--;){const r=t[l],o=e[l];if(o){for(const c in r)c in o||(i[c]=1);for(const c in o)s[c]||(n[c]=o[c],s[c]=1);t[l]=o}else for(const c in r)s[c]=1}for(const r in i)r in n||(n[r]=void 0);return n}function ge(t){return typeof t=="object"&&t!==null?t:{}}function we(t){t&&t.c()}function xe(t,e){t&&t.l(e)}function qt(t,e,n,i){const{fragment:s,on_mount:l,on_destroy:r,after_update:o}=t.$$;s&&s.m(e,n),i||C(()=>{const c=l.map(tt).filter(J);r?r.push(...c):v(c),t.$$.on_mount=[]}),o.forEach(C)}function Lt(t,e){const n=t.$$;n.fragment!==null&&(v(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function zt(t,e){t.$$.dirty[0]===-1&&(S.push(t),_t(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function $e(t,e,n,i,s,l,r,o=[-1]){const c=A;j(t);const a=t.$$={fragment:null,ctx:null,props:l,update:M,not_equal:s,bound:V(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:V(),dirty:o,skip_bound:!1,root:e.target||c.$$.root};r&&r(a.root);let u=!1;if(a.ctx=n?n(t,e.props||{},(f,_,...d)=>{const h=d.length?d[0]:_;return a.ctx&&s(a.ctx[f],a.ctx[f]=h)&&(!a.skip_bound&&a.bound[f]&&a.bound[f](h),u&&zt(t,f)),_}):[],a.update(),u=!0,v(a.before_update),a.fragment=i?i(a.ctx):!1,e.target){if(e.hydrate){wt();const f=jt(e.target);a.fragment&&a.fragment.l(f),f.forEach(St)}else a.fragment&&a.fragment.c();e.intro&&mt(t.$$.fragment),qt(t,e.target,e.anchor,e.customElement),xt(),dt()}j(c)}class be{$destroy(){Lt(this,1),this.$destroy=M}$on(e,n){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const s=i.indexOf(n);s!==-1&&i.splice(s,1)}}$set(e){this.$$set&&!gt(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{de as $,pe as A,ge as B,Lt as C,pt as D,oe as E,Ht as F,Wt as G,Gt as H,It as I,Nt as J,J as K,Z as L,ee as M,C as N,ue as O,_e as P,re as Q,se as R,be as S,X as T,le as U,ye as V,he as W,me as X,Ut as Y,v as Z,Ft as _,jt as a,Vt as b,Xt as c,St as d,lt as e,te as f,Jt as g,Mt as h,$e as i,Zt as j,Kt as k,Qt as l,Yt as m,M as n,ae as o,Pt as p,fe as q,mt as r,Bt as s,Q as t,ce as u,ie as v,ne as w,we as x,xe as y,qt as z};