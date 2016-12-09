# EmpatiJS
Minimal Dom Manipulation Library


~~~ javascript
window.EmpatiJS
window._
~~~ 

- $
~~~ javascript
_.$(selector)
_.$('div')
~~~ 

- $$
~~~ javascript
_.$$(selector)
_.$$('div')
~~~

- Ajax (Promise)
~~~ javascript
_.Ajax(url) // Get 
_.Ajax('https://httpbin.org/get');
_.Ajax(url, object) // post
_.Ajax('https://httpbin.org/post', {name: 'test',id: 0}) 
~~~

- Elements 
~~~ javascript
_.Elements(selector)
_.Elements('div')
~~~

- Events
~~~ javascript
_.Events(selector, eventname, function)
_.Events('#button', 'click', function(){ alert('clicked to #button') })
~~~

- Event
~~~ javascript
_.Event[elementid][eventname] = function
_.Event.elementid.eventname = function
_.Event.button.click = function(){ alert('clicked to #button') }
~~~

- Text
~~~ javascript
_.Text(selector)
_.Text('p') 
_.Text(selector) = string
_.Text('p') = "Test" 
~~~
