'''
Our history model is based on the simple concept that all actions on the system can be always summarized into having an Actor, an Event and an Object.

The Actor is the User instance who makes the action. All actions are triggered by someone, even automatic events have the user being the system.

The Event is a generic code picked from a list of possible events, this is made through the principle that all events can be resumed and made generic into a finite list of possibilities. Events include CRUD operations,but as well as more complex operations such as Approval and commenting. This definition of a event code, allows events to be filtered by type.

The Object is the instance upon where the Event is executed by the Actor. It is the Generic Foreign Key in our system and can point to an instance in any model in the system, even if the instance is outside of the core and in a separate plugin.

Besides this basic concepts, all history instances can have a list of authorized Users which can see it and a list of related Objects, that while not being the Object in question, have been somehow related with the action that happened. An example of this, in context, would be events over a given Task being related with the Study they are inserted into, the history is not for the Study, but is related. This related relation is also accomplished through Generic Foreign Keys.

One important aspect to keep in mind, is history recording is active, not passive, so modules effectively call upon the history methods to record the history events. Even although passive history recording could be achieved, at least for basic CRUD operations through the Django signals framework. This is not done so we do not record bogus information, but also because we intend to be able to record high level operations further down the path, and gradually extend the history event type list.
'''
