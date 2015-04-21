'use strict';

import React from 'react';

export default React.createClass({
    displayName: "About",
      render() {
        return (
          <div>
            <h1>Version</h1>
            Study Manager - v0.1alpha
            <h1>About EMIF Study Manager</h1>
            <p>The EMIF Study Manager is an on-going work for the creation of a modular and easily extendable workflow-oriented system designed to managing
            processes of data extraction and data handling.</p>
            <p>The basis of the project is focused on a SaaS approach, to make it more versatile and easily integratable with other software. An default client browser-based implementation is made available through a state-of-the-art reactJS application.</p>
            <p>The platform allows several users to collaborate and interact in an easy manner, with resource to a easy-to-use interface for creating and managing repeatable workflows.</p>
            <p>This system is continuously under development and we welcome your ideas and suggestions for improving it.
All provided data are still provisional. We make no warranty and cannot be held responsible for any information retrieved and displayed in this system. </p>

            <h1>Already available features</h1>
            <ul>
                <li>Basic functionality webservices that allow the system to operate without any interface</li>
                <li>reactJS client interface, with easy-to-use Workflow visual editor</li>
                <li>Repeatable Workflow Processes via Workflow Templates</li>
                <li>Simple tasks with I/O and dependencies</li>
            </ul>

            <h1>Planned Features</h1>
            <ul>
                <li>Form Tasks</li>
                <li>Scripted Tasks</li>
                <li>Integration with external tools</li>
            </ul>
          </div>
        );
      }
});
