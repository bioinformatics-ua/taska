'''
The accounts module is responsible by the user handling in the core system. Since Django handles by default most of the user authentication and details, this module is more built around providing the services through the uniformized API developed, and keeping the User personal preferences and settings. Here we keep settings like if the user is interested in notifications, or any other setting that is relevant and appears over time.

Usually all objects on the system, being them Workflows, or processes or task instances, belong to a user, and interact with this to get their details.
'''
