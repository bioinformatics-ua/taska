'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

import {getTASKAVersion} from '../page_settings.jsx'

export default React.createClass({
    displayName: "About",
    mixins: [Authentication],
    render() {
        return (
          <div>
            <h1>Version</h1>
            Taska - {getTASKAVersion()}
            <h1>About Taska</h1>
            <p>Taska is an on-going work for the creation of a modular and easily extendable workflow-oriented system designed to manage
            processes of data extraction and data handling.</p>
            <p>The basis of the project is focused on a SaaS approach, to make it more versatile and easily integratable with other software. A default client browser-based implementation is made available through a state-of-the-art reactJS application.</p>
            <p>The platform allows several users to collaborate and interact in an easy manner, relying on an easy-to-use interface for creating and managing repeatable workflows.</p>
            <p>This system is continuously under development and we welcome your ideas and suggestions for improving it.
All provided data are still provisional. We make no warranty and cannot be held responsible for any information retrieved and displayed in this system. </p>

            <h1>Already available features</h1>
            <ul>
                <li>Basic functionality webservices that allow the system to operate without any interface</li>
                <li>reactJS client interface, with easy-to-use Workflow visual editor</li>
                <li>Repeatable Workflow Processes via Workflow Templates</li>
                <li>Simple tasks with I/O and dependencies</li>
                <li>Form Tasks</li>
            </ul>

            <h1>Planned Features</h1>
            <ul>
                <li>Scripted Tasks</li>
                <li>Integration with external tools</li>
            </ul>
          </div>
        );
      }
});
