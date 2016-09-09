'''
A Process is a instanciation of a Workflow with a specified group of users and deadlines for each of the tasks that compose the Workflow. To the act of instantiating a Process from a Workflow we call it a "run". When running a process has a series of states he can be in: running, finished, canceled or overdue.

Whenever a workflow is instantiated, all his tasks are also instantiated into something called process tasks.Process Tasks also have a series of possible status: waiting, running, finished, canceled and overdue.

Process tasks link Processes and the Tasks from the workflow template and can have multiple intervenients at whom we call Process Task Users which are also instantiated at the run time, but can also be added during the process running, for tasks still running or waiting.

At instantiation time, the process looks at all the process tasks instantiated and looks for dependencies. If the process task has no dependencies, they're state is changed to running, and users receive their tasks. All other tasks with dependencies remain waiting. Whenever a Task is completed or canceled, there is an re-evaluation of all tasks still waiting, and as dependencies get fulfilled, the path moves alongs. When a task has multiple intervenients, all intervenients must finish the task, or the task must be canceled by the user running the process, otherwise the system wont move along.
'''
