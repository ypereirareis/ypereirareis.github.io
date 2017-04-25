---
layout: post
title: "VueJS - Two way data binding and state management with Vuex and strict mode"
excerpt: "Two way data binding is really easy with VueJS and has very good performance with virtual dom. But it's not always a best practice to use to improve performance and track state updates."
tags: [vuejs, vuex, strict, mode, binding, state, store, clone, mutation]
image: vuejs.jpg
comments: true
---

![Docker](/images/posts/vuejs.jpg)

**In the following code samples we are using ES6/ES2015/Babel.**

# Two way data binding with VueJS and Vuex

If you don't really know what is two way data binding, let's see a few definitions:

> Two way binding means that any data-related changes affecting the model are immediately propagated to the matching view(s),
and that any changes made in the view(s) (say, by the user) are immediately reflected in the underlying model.
When app data changes, so does the UI, and conversely.

> Two way binding just means that,
when properties in the model get updated, so does the UI.
When UI elements get updated, the changes get propagated back to the model.

It's possible to use two way data binding with javascript frameworks like AngularJs, ReactJs, VueJs....

## Setup state/store with Vuex

Of course, to setup Vuex with Vuejs you need two things:

* A working VueJs project.
* Following [Vuex documentation](https://vuex.vuejs.org/en/), beginning with the [installation part](https://vuex.vuejs.org/en/installation.html).

### Let's see here a very simple VueJS/Vuex configuration

Click on the *Result* tab to see "VueJs two way binding" in action.

**The external resources are important:**

* [https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.6/vue.min.js](https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.6/vue.min.js)
* [https://cdnjs.cloudflare.com/ajax/libs/vuex/2.3.1/vuex.min.js](https://cdnjs.cloudflare.com/ajax/libs/vuex/2.3.1/vuex.min.js)

<script async src="//jsfiddle.net/ypereirareis/cpg40rh3/embed/js,html,result/dark/"></script>


In this first example, if you open the debug tool of your browser(console), you should see this error message.

{% highlight javascript %}
vue.min.js:6 Error: [vuex] Do not mutate vuex store state outside mutation handlers.
    at r (vuex.min.js:6)
    at nt.t._vm.$watch.deep (vuex.min.js:6)
    at ho.run (vue.min.js:7)
    at ho.update (vue.min.js:7)
    at qi.notify (vue.min.js:7)
    at Object.set [as lastname] (vue.min.js:6)
    at input (eval at li (vue.min.js:1), <anonymous>:2:416)
    at HTMLInputElement.t (vue.min.js:6)
{% endhighlight %}

This error is throw by Vuex, because we have enabled the [Vuex strict mode](https://vuex.vuejs.org/en/strict.html).

> This ensures that all state mutations can be explicitly tracked by debugging tools.

We'll talk to this later in the article...

## Is two way data binding a best practice or not ?

### I see one big advantage to use two way data binding:

* Real time vue updates thanks to virtual DOM (very fast and not (re)rendering sub components if not needed).

It suits perfectly for small applications with not too much real time state updates.

### But I see many drawbacks too:

* Watchers to update view when model is updated.
* No way to track model updates in a centralized place.
* Many places where state can be updated.
* No way (not really true because we can rely on component watchers) to debounce or filter (or whatever) updates on state.

## Vuex strict mode

{% highlight javascript %}
const store = new Vuex.Store({
  // ...
  strict: true
})
{% endhighlight %}

* This ensures that all state mutations can be explicitly tracked by debugging tools.
* Whenever Vuex state is mutated outside of mutation handlers, an error will be thrown.
* Strict mode runs a synchronous deep watcher on the state tree for detecting inappropriate mutations, and it can be quite expensive when you make large amount of mutations to the state. Make sure to turn it off in production to avoid the performance cost.

# Solutions to track state changes and improve performance with Vuex

To remove the Vuex error and update the state in a mutation without adding or updating a lot of code,
an option can be to deep clone the object before updating it with two way binding in our form.

## Deep clone and watch

The following few lines show how to deep clone the object and how to see updates on the object and on the deep copy.
We are using [lodash](https://lodash.com/docs/4.17.4#cloneDeep) to deep clone the object.

<script async src="//jsfiddle.net/ypereirareis/p1rwn9rb/embed/js,html,result/dark/"></script>

### What are we doing here ?

* We simply bypass the Vuex error.
* We are still using two way binding, but with the cloned object and not the original one.
* We must add a watcher/handler on this cloned object to track updates.
* We add a mutation to update the state at the end of the process.
* In the watcher/handler we can call the mutation to update the source object.

**The computed property and the debounced mutation call, allows to track the effective state updates**

{% highlight javascript %}
computed: {
  userState() {
    return this.$store.state.user
  }
}

handler: _.debounce(function (user) {
  this.$store.commit('updateUser', user);
}, 500), deep: true
{% endhighlight %}

**Be careful !** You cannot put the debounced function in the mutation itself.
Indeed, the code would be executed within the next event loop cycle, not really in the mutation function.
The Vuex error will appear again.

{% highlight javascript %}
  mutations: {
    updateUser: _.debounce(function (state, user) {
      Object.assign(state.user, user);
    },500)
  }
{% endhighlight %}

The "deep clone" solution is not really a perfect solution because we are still using two way binding,
and we are adding a watcher manually which has performance cost. **So... how can we improve the situation ?**

## One way data binding and explicit data update

Actually, two way binding is not something really needed in most cases.
What about removing it and relying on one way binding and explicit data updates ?

<script async src="//jsfiddle.net/ypereirareis/x2gs3ha4/embed/js,html,result/dark/"></script>

### What are we doing here ?

* We are not more cloning the object.
* We are using one way binding and explicitly updating object properties.

{% highlight html %}
<input :value="user.lastname" v-on:keyup.stop="updateLastname($event.target.value)" />
<input :value="user.firstname" v-on:keyup.stop="updateFirstname($event.target.value)"/>
{% endhighlight %}

* We need methods to update object properties.

{% highlight javascript %}
methods: {
 updateFirstname(firstname) {
   this.$store.commit('updateUser', {firstname});
 },
 updateLastname(lastname) {
   this.$store.commit('updateUser', {lastname});
 }
}
{% endhighlight %}

**And... that's it !**

### After a small refactoring

It's possible to refactor the code to have only one method to update object properties.

<script async src="//jsfiddle.net/ypereirareis/cve0dtkb/embed/js,html,result/dark/"></script>

The interesting parts here are:

{% highlight html %}
<input :value="user.lastname" v-on:keyup.stop="updateField('lastname', $event.target.value)" />
<input :value="user.firstname" v-on:keyup.stop="updateField('firstname', $event.target.value)"/>
{% endhighlight %}

{% highlight javascript %}
methods: {
 updateField(field, value) {
   this.$store.commit('updateUser', {
    [field]: value
   });
 },
}
{% endhighlight %}

### Refactor again and again

If we are updating a user in another VueJs component we need to duplicate this part of the code:

{% highlight javascript %}
methods: {
 updateField(field, value) {
   this.$store.commit('updateUser', {
    [field]: value
   });
 },
}
{% endhighlight %}

What about moving the computed property key of the object literal in the mutation itself ?

{% highlight javascript %}
methods: {
 updateField(field, value) {
   this.$store.commit('updateUser', {field, value});
 },
}

mutations: {
  updateUser: function (state, {field, value}) {
    Object.assign(state.user, {
    [field]: value
   });
  }
}
{% endhighlight %}

# Conclusion

Two way data binding is really easy to setup with all major javascript frameworks.
It's a very good option for small applications or POC.
But for very complex UI you should consider using one way data binding and explicit state updates/mutations.















